/**
 * Iqra Eğitim Portalı - Tenant Bazlı Yedekleme Mekanizması
 * 
 * Bu modül, çok kiracılı mimari için tenant bazlı yedekleme işlemlerini gerçekleştirir.
 * Hybrid tenant izolasyon yaklaşımına uygun şekilde tasarlanmıştır.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { format as dateFormat } from 'date-fns';
import { tr } from 'date-fns/locale';
import zlib from 'zlib';
import { supabaseAdmin } from '../supabase/admin';
import { getLogger } from '../utils/logger';

const execPromise = promisify(exec);
const logger = getLogger('tenant-backup');

// Yapılandırma sabitleri
const CONFIG = {
  BACKUP_ROOT_DIR: process.env.BACKUP_ROOT_DIR || './backups',
  ENCRYPTION_KEY: process.env.BACKUP_ENCRYPTION_KEY || '',
  S3_BUCKET: process.env.S3_BUCKET_NAME || 'i-ep-app-backups',
  S3_PREFIX: process.env.S3_PREFIX || 'tenant-backups',
  S3_REGION: process.env.AWS_REGION || 'eu-central-1',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_NAME: process.env.DB_NAME || 'i-es',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  SLACK_WEBHOOK: process.env.SLACK_WEBHOOK_URL,
  MAX_PARALLEL_BACKUPS: 3,
};

// Yedekleme tipi
export type BackupType = 'full' | 'incremental' | 'snapshot';

// Plan tipi
export type PlanType = 'free' | 'standard' | 'premium';

// Tenant yedekleme bilgileri
export interface TenantBackupInfo {
  tenantId: string;
  schemaName: string;
  backupType: BackupType;
  plan: PlanType;
  includePublicTables?: boolean;
}

// Yedekleme sonucu
export interface BackupResult {
  success: boolean;
  tenantId: string;
  backupFile?: string;
  s3Location?: string;
  size?: number;
  duration?: number;
  error?: string;
  backupType: BackupType;
  timestamp: string;
  checksum?: string;
}

/**
 * Bir tenant için veritabanı yedeği oluşturur
 */
export async function backupTenant(
  { tenantId, schemaName, backupType, plan, includePublicTables = false }: TenantBackupInfo
): Promise<BackupResult> {
  const startTime = Date.now();
  const timestamp = dateFormat(new Date(), 'yyyy-MM-dd-HH-mm-ss', { locale: tr });
  const backupFileName = `tenant_${tenantId}_${backupType}_${timestamp}.sql`;
  const localBackupDir = path.join(CONFIG.BACKUP_ROOT_DIR, tenantId);
  const localBackupPath = path.join(localBackupDir, backupFileName);
  
  try {
    // Yedekleme dizinini oluştur
    await fs.mkdir(localBackupDir, { recursive: true });
    
    // pg_dump komutu oluştur
    let pgDumpCommand = `PGPASSWORD=${CONFIG.DB_PASSWORD} pg_dump -h ${CONFIG.DB_HOST} -U ${CONFIG.DB_USER} `;
    pgDumpCommand += `-p ${CONFIG.DB_PORT} -d ${CONFIG.DB_NAME} `;
    
    // Yedekleme tipine göre argümanları ayarla
    if (backupType === 'full' || backupType === 'snapshot') {
      // Tam yedekleme: Tenant şemasını hedefle
      pgDumpCommand += `-n tenant_${tenantId} `;
      
      // Eğer istenirse public tabloların tenant ile ilişkili kayıtlarını da dahil et
      if (includePublicTables) {
        pgDumpCommand += `-t public.tenant_usage_metrics `;
        pgDumpCommand += `--where="tenant_id='${tenantId}'" `;
      }
    } else if (backupType === 'incremental') {
      // Artımlı yedekleme: Son 24 saatteki değişiklikleri al
      pgDumpCommand += `-n tenant_${tenantId} `;
      pgDumpCommand += `--where="updated_at > NOW() - INTERVAL '24 HOURS'" `;
    }
    
    // Çıktı dosyasını belirt
    pgDumpCommand += `-f ${localBackupPath}`;
    
    // Yedekleme işlemini başlat
    logger.info(`Tenant ${tenantId} için ${backupType} yedekleme başlatılıyor`);
    await execPromise(pgDumpCommand);
    
    // Yedek dosyasını oku
    let backupData = await fs.readFile(localBackupPath);
    
    // Dosya boyutunu al
    const originalSize = backupData.length;
    
    // Sıkıştır
    backupData = await promisify(zlib.gzip)(backupData);
    
    // Şifrele (Eğer şifreleme anahtarı tanımlanmışsa)
    const checksumBefore = crypto.createHash('sha256').update(backupData).digest('hex');
    if (CONFIG.ENCRYPTION_KEY) {
      backupData = encryptData(backupData, CONFIG.ENCRYPTION_KEY);
    }
    
    // Şifrelenmiş dosyayı yaz
    const encryptedBackupPath = `${localBackupPath}.gz.enc`;
    await fs.writeFile(encryptedBackupPath, backupData);
    
    // S3'e yükle
    const s3Location = await uploadToS3(
      backupData,
      tenantId,
      backupType,
      `${backupFileName}.gz.enc`
    );
    
    // Yedekleme meta verilerini kaydet
    await saveBackupMetadata({
      tenantId,
      backupType,
      path: encryptedBackupPath,
      s3Path: s3Location,
      size: originalSize,
      compressedSize: backupData.length,
      timestamp: new Date().toISOString(),
      checksum: checksumBefore,
    });
    
    // Başarılı sonucu döndür
    const duration = (Date.now() - startTime) / 1000;
    logger.info(`Tenant ${tenantId} için ${backupType} yedekleme tamamlandı. Boyut: ${originalSize} bytes, Süre: ${duration}s`);
    
    return {
      success: true,
      tenantId,
      backupFile: encryptedBackupPath,
      s3Location,
      size: backupData.length,
      duration,
      backupType,
      timestamp: new Date().toISOString(),
      checksum: checksumBefore,
    };
  } catch (error) {
    logger.error(`Tenant ${tenantId} yedekleme hatası:`, error);
    return {
      success: false,
      tenantId,
      error: error instanceof Error ? error.message : String(error),
      backupType,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Verilen tenant ID'leri için paralel yedekleme işlemi başlatır
 */
export async function backupMultipleTenants(
  tenants: TenantBackupInfo[],
  maxParallel = CONFIG.MAX_PARALLEL_BACKUPS
): Promise<BackupResult[]> {
  const results: BackupResult[] = [];
  const chunks = [];
  
  // Tenant listesini parçalara ayır
  for (let i = 0; i < tenants.length; i += maxParallel) {
    chunks.push(tenants.slice(i, i + maxParallel));
  }
  
  // Her grup için paralel yedekleme yap
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(tenant => backupTenant(tenant))
    );
    results.push(...chunkResults);
  }
  
  // Başarısız yedeklemeleri raporla
  const failedBackups = results.filter(r => !r.success);
  if (failedBackups.length > 0) {
    logger.error(`${failedBackups.length} tenant'ın yedeği alınamadı:`, 
      failedBackups.map(f => f.tenantId).join(', '));
    await sendFailureNotification(failedBackups);
  }
  
  return results;
}

/**
 * Supabase'de saklanan tüm active tenant'ları alır ve yedekleme işlemi için hazırlar
 */
export async function getAllTenantsForBackup(
  backupType: BackupType,
  planFilter?: PlanType
): Promise<TenantBackupInfo[]> {
  try {
    // Tenant'ları getir
    let query = supabaseAdmin
      .from('tenants')
      .select('id, schema_name, plan')
      .eq('status', 'active');
    
    // Plan filtresi varsa uygula
    if (planFilter) {
      query = query.eq('plan', planFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Tenant listesi alınırken hata:', error);
      return [];
    }
    
    return data.map(tenant => ({
      tenantId: tenant.id,
      schemaName: tenant.schema_name || `tenant_${tenant.id}`,
      backupType,
      plan: tenant.plan as PlanType,
      includePublicTables: backupType === 'full' || backupType === 'snapshot'
    }));
  } catch (error) {
    logger.error('Tenant listesi hazırlanırken hata:', error);
    return [];
  }
}

/**
 * S3'e yedekleme dosyasını yükler
 */
async function uploadToS3(
  data: Buffer,
  tenantId: string,
  backupType: BackupType,
  filename: string
): Promise<string> {
  try {
    const s3Client = new S3Client({ region: CONFIG.S3_REGION });
    
    // Backup tipi ve tenant ID'ye göre S3 key yolunu oluştur
    const datePath = dateFormat(new Date(), 'yyyy/MM/dd');
    const s3Key = `backups/${backupType}/${datePath}/${tenantId}/${filename}`;
    
    // S3'e yükle
    await s3Client.send(new PutObjectCommand({
      Bucket: CONFIG.S3_BUCKET,
      Key: s3Key,
      Body: data,
      ContentType: 'application/octet-stream',
      Metadata: {
        'tenant-id': tenantId,
        'backup-type': backupType,
        'created-at': new Date().toISOString(),
      }
    }));
    
    return `s3://${CONFIG.S3_BUCKET}/${s3Key}`;
  } catch (error) {
    logger.error(`S3'e yükleme hatası:`, error);
    throw new Error(`S3'e yükleme başarısız: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Veriyi AES-256 algoritması ile şifreler
 */
function encryptData(data: Buffer, key: string): Buffer {
  try {
    // 256-bit key için 32 byte'lık bir anahtar oluştur (gerekirse hash ile)
    const hash = crypto.createHash('sha256').update(key).digest();
    
    // Rastgele bir IV oluştur
    const iv = crypto.randomBytes(16);
    
    // AES-256-CBC ile şifrele
    const cipher = crypto.createCipheriv('aes-256-cbc', hash, iv);
    const encrypted = Buffer.concat([
      cipher.update(data),
      cipher.final()
    ]);
    
    // IV + şifrelenmiş veri döndür (IV, şifre çözme için gerekli)
    return Buffer.concat([iv, encrypted]);
  } catch (error) {
    logger.error('Şifreleme hatası:', error);
    throw new Error(`Şifreleme başarısız: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Yedekleme meta verilerini veritabanına kaydeder
 */
async function saveBackupMetadata(metadata: {
  tenantId: string;
  backupType: BackupType;
  path: string;
  s3Path: string;
  size: number;
  compressedSize: number;
  timestamp: string;
  checksum: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('tenant_backups')
      .insert({
        tenant_id: metadata.tenantId,
        backup_type: metadata.backupType,
        local_path: metadata.path,
        s3_path: metadata.s3Path,
        original_size_bytes: metadata.size,
        compressed_size_bytes: metadata.compressedSize,
        created_at: metadata.timestamp,
        checksum: metadata.checksum,
        status: 'completed'
      });
    
    if (error) {
      logger.error('Yedekleme meta verisi kaydedilirken hata:', error);
    }
  } catch (error) {
    logger.error('Meta veri kaydetme hatası:', error);
  }
}

/**
 * Başarısız yedeklemeler için bildirim gönderir
 */
async function sendFailureNotification(failedBackups: BackupResult[]) {
  // Slack webhook entegrasyonu varsa kullan
  if (CONFIG.SLACK_WEBHOOK) {
    try {
      const message = {
        text: "⚠️ Yedekleme Hatası",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "⚠️ Yedekleme Hatası",
              emoji: true
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${failedBackups.length}* tenant için yedekleme başarısız oldu.`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: failedBackups.map(fb => 
                `• *${fb.tenantId}*: ${fb.error}`
              ).join('\n')
            }
          }
        ]
      };
      
      // Slack'e webhook üzerinden bildirim gönder
      await fetch(CONFIG.SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    } catch (error) {
      logger.error('Slack bildirimi gönderilirken hata:', error);
    }
  }
  
  // Yedekleme hatalarını loglara da kaydet
  logger.error(
    `${failedBackups.length} tenant için yedekleme başarısız:`,
    failedBackups.map(fb => ({ tenant: fb.tenantId, error: fb.error }))
  );
}

/**
 * Eski yedeklemeleri temizler (retention policy'ye göre)
 */
export async function cleanupOldBackups() {
  try {
    const now = new Date();
    
    // Farklı yedekleme tipleri için saklama sürelerini tanımla
    const retentionDays = {
      full: 30,
      incremental: 7,
      snapshot: 90
    };
    
    for (const [backupType, days] of Object.entries(retentionDays)) {
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // Silinecek backupları bul
      const { data, error } = await supabaseAdmin
        .from('tenant_backups')
        .select('id, tenant_id, backup_type, s3_path, local_path')
        .eq('backup_type', backupType)
        .lt('created_at', cutoffDate.toISOString());
      
      if (error) {
        logger.error(`Eski ${backupType} yedekleri bulunurken hata:`, error);
        continue;
      }
      
      // Her bir eski yedeği sil
      for (const backup of data) {
        // Lokal dosyayı sil (varsa)
        if (backup.local_path) {
          try {
            await fs.unlink(backup.local_path);
          } catch (err) {
            logger.warn(`Lokal yedek silinirken hata: ${backup.local_path}`, err);
          }
        }
        
        // Yedek kaydını veritabanından sil
        const { error: deleteError } = await supabaseAdmin
          .from('tenant_backups')
          .delete()
          .eq('id', backup.id);
        
        if (deleteError) {
          logger.error(`Yedek kaydı ${backup.id} silinirken hata:`, deleteError);
        }
      }
      
      logger.info(`${backupType} için ${data.length} eski yedek temizlendi`);
    }
  } catch (error) {
    logger.error('Eski yedekler temizlenirken hata:', error);
  }
} 