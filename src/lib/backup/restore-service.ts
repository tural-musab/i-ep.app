/**
 * Iqra Eğitim Portalı - Yedekten Geri Dönme Servisi
 *
 * Bu modül, yedeklerden geri dönme (restore) işlemleri için gerekli
 * fonksiyonları içerir. Tam tenant geri yükleme ve kısmi geri yükleme
 * işlemlerini destekler.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import zlib from 'zlib';
import { supabaseAdmin } from '../supabase/admin';
import { getLogger } from '../utils/logger';

const execPromise = promisify(exec);
const gunzipPromise = promisify(zlib.gunzip);
const logger = getLogger('restore-service');

// Yapılandırma sabitleri
const CONFIG = {
  RESTORE_TEMP_DIR: process.env.RESTORE_TEMP_DIR || './restore_temp',
  ENCRYPTION_KEY: process.env.BACKUP_ENCRYPTION_KEY,
  S3_BUCKET: process.env.S3_BUCKET_NAME || 'i-ep-app-backups',
  S3_PREFIX: process.env.S3_PREFIX || 'tenant-backups',
  S3_REGION: process.env.AWS_REGION || 'eu-central-1',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_NAME: process.env.DB_NAME || 'i-es',
  DB_PORT: process.env.DB_PORT || '5432',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  SLACK_WEBHOOK: process.env.SLACK_WEBHOOK_URL,
};

// Geri yükleme sonucu
export interface RestoreResult {
  success: boolean;
  tenantId: string;
  backupId?: string;
  error?: string;
  duration?: number;
  timestamp: string;
  restoredTables?: string[];
  validationResults?: ValidationResult[];
}

// Veri doğrulama sonucu
interface ValidationResult {
  table: string;
  recordCount: number;
  valid: boolean;
  error?: string;
}

/**
 * Belirli bir yedeklemeyi veritabanından sorgular
 */
export async function getBackupById(backupId: string) {
  const { data, error } = await supabaseAdmin
    .from('tenant_backups')
    .select('*')
    .eq('id', backupId)
    .single();

  if (error) {
    throw new Error(`Yedekleme bilgisi alınamadı: ${error.message}`);
  }

  return data;
}

/**
 * Belirli bir tenant için kullanılabilir yedeklemeleri listeler
 */
export async function listAvailableBackups(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from('tenant_backups')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Yedekleme listesi alınamadı: ${error.message}`);
  }

  return data;
}

/**
 * Bir tenant için tam geri yükleme işlemi yapar
 */
export async function restoreFullTenant(
  tenantId: string,
  backupId: string,
  options: {
    dropExistingSchema?: boolean;
    validateAfterRestore?: boolean;
    notifyAdmin?: boolean;
  } = {}
): Promise<RestoreResult> {
  const startTime = Date.now();

  try {
    logger.info(`Tenant ${tenantId} için tam geri yükleme başlatılıyor. Backup ID: ${backupId}`);

    // Yedekleme bilgilerini al
    const backup = await getBackupById(backupId);

    if (!backup) {
      throw new Error(`${backupId} ID'li yedekleme bulunamadı`);
    }

    // Geçici dizini oluştur
    const tempDir = path.join(CONFIG.RESTORE_TEMP_DIR, `restore_${tenantId}_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Yedekleme dosyasını indir
    let backupData: Buffer;

    if (backup.s3_path) {
      // S3'ten indir
      backupData = await downloadFromS3(backup.s3_path);
      logger.info(`Yedekleme S3'ten indirildi: ${backup.s3_path}`);
    } else if (backup.local_path) {
      // Lokal dosyadan oku
      backupData = await fs.readFile(backup.local_path);
      logger.info(`Yedekleme lokal dosyadan okundu: ${backup.local_path}`);
    } else {
      throw new Error('Yedekleme dosyası bulunamadı');
    }

    // Dosya bütünlüğünü kontrol et
    const checksum = crypto.createHash('sha256').update(backupData).digest('hex');

    if (backup.checksum && checksum !== backup.checksum) {
      throw new Error('Yedekleme dosyası bütünlük kontrolünden geçemedi. Dosya bozulmuş olabilir.');
    }

    // Şifreyi çöz (eğer şifrelenmişse)
    if (backup.s3_path && backup.s3_path.endsWith('.enc') && CONFIG.ENCRYPTION_KEY) {
      backupData = decryptData(backupData, CONFIG.ENCRYPTION_KEY);
      logger.info('Yedekleme dosyasının şifresi çözüldü');
    }

    // Sıkıştırılmışsa aç
    if (
      (backup.s3_path && backup.s3_path.endsWith('.gz')) ||
      (backup.local_path && backup.local_path.endsWith('.gz'))
    ) {
      backupData = await gunzipPromise(backupData);
      logger.info('Yedekleme dosyası açıldı');
    }

    // Geri yüklenecek SQL dosyasını yaz
    const sqlFilePath = path.join(tempDir, `restore_${tenantId}.sql`);
    await fs.writeFile(sqlFilePath, backupData);

    // Mevcut şemayı düşür (istenirse)
    if (options.dropExistingSchema) {
      await dropTenantSchema(tenantId);
      logger.info(`Mevcut tenant_${tenantId} şeması silindi`);
    }

    // Geri yükleme işlemi
    await restoreFromSqlFile(sqlFilePath);
    logger.info(`Tenant ${tenantId} veritabanı geri yüklemesi tamamlandı`);

    // Geri yükleme sonrası doğrulama
    let validationResults: ValidationResult[] = [];

    if (options.validateAfterRestore) {
      validationResults = await validateTenantRestore(tenantId);
      const validationSuccess = validationResults.every((r) => r.valid);

      if (!validationSuccess) {
        throw new Error(
          'Geri yükleme sonrası doğrulama başarısız oldu. Veri tutarsızlığı olabilir.'
        );
      }

      logger.info(`Tenant ${tenantId} geri yükleme doğrulaması başarılı`);
    }

    // Temizlik: Geçici dosyaları sil
    await fs.rm(tempDir, { recursive: true, force: true });

    // Yöneticiye bildirim gönder (istenirse)
    if (options.notifyAdmin) {
      await sendRestoreNotification(tenantId, true);
    }

    // Başarılı sonuç
    const duration = (Date.now() - startTime) / 1000;

    return {
      success: true,
      tenantId,
      backupId,
      duration,
      timestamp: new Date().toISOString(),
      validationResults,
    };
  } catch (error) {
    logger.error(`Tenant ${tenantId} geri yükleme hatası:`, error);

    // Hata durumunda yöneticiye bildirim
    if (options.notifyAdmin) {
      await sendRestoreNotification(
        tenantId,
        false,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Hata sonucu
    return {
      success: false,
      tenantId,
      backupId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Kısmi geri yükleme işlemi yapar (belirli tablolar için)
 */
export async function restorePartialTenant(
  tenantId: string,
  backupId: string,
  targetTables: string[],
  options: {
    temporarySchema?: string;
    validateAfterRestore?: boolean;
    notifyAdmin?: boolean;
  } = {}
): Promise<RestoreResult> {
  const startTime = Date.now();
  const tempSchema = options.temporarySchema || `temp_restore_${tenantId}`;

  try {
    logger.info(
      `Tenant ${tenantId} için kısmi geri yükleme başlatılıyor. Hedef tablolar: ${targetTables.join(', ')}`
    );

    // Tam geri yükleme ile geçici şemaya yükle
    const fullRestoreResult = await restoreFullTenant(tenantId, backupId, {
      dropExistingSchema: false,
      validateAfterRestore: false,
      notifyAdmin: false,
    });

    if (!fullRestoreResult.success) {
      throw new Error(`Geçici şemaya tam geri yükleme başarısız: ${fullRestoreResult.error}`);
    }

    // Hedef tablolardan her biri için veriyi aktar
    for (const tableName of targetTables) {
      // Hedef tablodaki mevcut verileri yedekle
      const backupTableName = `${tableName}_backup_${Date.now()}`;
      await executeSQL(`ALTER TABLE tenant_${tenantId}.${tableName} RENAME TO ${backupTableName}`);

      // Geçici şemadan hedef tabloya kopya oluştur
      await executeSQL(
        `CREATE TABLE tenant_${tenantId}.${tableName} (LIKE ${tempSchema}.${tableName} INCLUDING ALL)`
      );

      // Veriyi aktar
      await executeSQL(
        `INSERT INTO tenant_${tenantId}.${tableName} SELECT * FROM ${tempSchema}.${tableName}`
      );

      logger.info(`Tablo ${tableName} başarıyla geri yüklendi`);
    }

    // Geçici şemayı temizle
    await executeSQL(`DROP SCHEMA ${tempSchema} CASCADE`);

    // Geri yükleme sonrası doğrulama
    let validationResults: ValidationResult[] = [];

    if (options.validateAfterRestore) {
      validationResults = await validateTenantTables(tenantId, targetTables);
      const validationSuccess = validationResults.every((r) => r.valid);

      if (!validationSuccess) {
        throw new Error(
          'Geri yükleme sonrası doğrulama başarısız oldu. Veri tutarsızlığı olabilir.'
        );
      }

      logger.info(`Tenant ${tenantId} kısmi geri yükleme doğrulaması başarılı`);
    }

    // Yöneticiye bildirim
    if (options.notifyAdmin) {
      await sendRestoreNotification(
        tenantId,
        true,
        undefined,
        `Kısmi geri yükleme tamamlandı. Tablolar: ${targetTables.join(', ')}`
      );
    }

    // Başarılı sonuç
    const duration = (Date.now() - startTime) / 1000;

    return {
      success: true,
      tenantId,
      backupId,
      duration,
      timestamp: new Date().toISOString(),
      restoredTables: targetTables,
      validationResults,
    };
  } catch (error) {
    logger.error(`Tenant ${tenantId} kısmi geri yükleme hatası:`, error);

    // Hata durumunda yöneticiye bildirim
    if (options.notifyAdmin) {
      await sendRestoreNotification(
        tenantId,
        false,
        error instanceof Error ? error.message : String(error)
      );
    }

    // Hata sonucu
    return {
      success: false,
      tenantId,
      backupId,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * S3'ten yedekleme dosyasını indirir
 */
async function downloadFromS3(s3Path: string): Promise<Buffer> {
  try {
    // S3 path formatı: s3://bucket/key
    const s3Url = new URL(s3Path.replace('s3://', 'https://'));
    const bucket = s3Url.hostname;
    const key = s3Url.pathname.substring(1); // İlk slash'ı kaldır

    const s3Client = new S3Client({ region: CONFIG.S3_REGION });

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    // Stream'i buffer'a dönüştür
    const chunks: Buffer[] = [];
    if (response.Body) {
      const stream = response.Body as any;

      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
    }

    return Buffer.concat(chunks);
  } catch (error) {
    logger.error(`S3'ten indirme hatası:`, error);
    throw new Error(
      `S3'ten indirme başarısız: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Şifrelenmiş veriyi çözer
 */
function decryptData(data: Buffer, key: string): Buffer {
  try {
    // 256-bit key için 32 byte'lık bir anahtar oluştur (gerekirse hash ile)
    const hash = crypto.createHash('sha256').update(key).digest();

    // İlk 16 byte IV, geri kalanı şifrelenmiş veri
    const iv = data.subarray(0, 16);
    const encrypted = data.subarray(16);

    // AES-256-CBC ile şifreyi çöz
    const decipher = crypto.createDecipheriv('aes-256-cbc', hash, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch (error) {
    logger.error('Şifre çözme hatası:', error);
    throw new Error(
      `Şifre çözme başarısız: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Bir tenant'ın şemasını siler
 */
async function dropTenantSchema(tenantId: string): Promise<void> {
  const schema = `tenant_${tenantId}`;

  try {
    // Önce tenant'a ait tüm açık bağlantıları sonlandır
    await executeSQL(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE datname = current_database() 
      AND schemaname = '${schema}'
    `);

    // Şemayı düşür
    await executeSQL(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  } catch (error) {
    logger.error(`Şema ${schema} silinirken hata:`, error);
    throw error;
  }
}

/**
 * SQL dosyasından geri yükleme yapar
 */
async function restoreFromSqlFile(sqlFilePath: string): Promise<void> {
  try {
    const command = `PGPASSWORD=${CONFIG.DB_PASSWORD} psql -h ${CONFIG.DB_HOST} -U ${CONFIG.DB_USER} `;
    const fullCommand = `${command} -p ${CONFIG.DB_PORT} -d ${CONFIG.DB_NAME} -f ${sqlFilePath}`;

    const { stdout, stderr } = await execPromise(fullCommand);

    if (stderr && !stderr.includes('CREATE SCHEMA') && !stderr.includes('CREATE TABLE')) {
      logger.warn('psql stderr:', stderr);
    }

    return;
  } catch (error) {
    logger.error('SQL dosyasından geri yükleme hatası:', error);
    throw error;
  }
}

/**
 * SQL sorgusu çalıştırır
 */
async function executeSQL(sql: string): Promise<void> {
  try {
    const command = `PGPASSWORD=${CONFIG.DB_PASSWORD} psql -h ${CONFIG.DB_HOST} -U ${CONFIG.DB_USER} `;
    const fullCommand = `${command} -p ${CONFIG.DB_PORT} -d ${CONFIG.DB_NAME} -c "${sql}"`;

    const { stdout, stderr } = await execPromise(fullCommand);

    if (
      stderr &&
      !stderr.includes('CREATE') &&
      !stderr.includes('INSERT') &&
      !stderr.includes('ALTER')
    ) {
      logger.warn('SQL çalıştırma stderr:', stderr);
    }

    return;
  } catch (error) {
    logger.error('SQL çalıştırma hatası:', error);
    throw error;
  }
}

/**
 * Tenant geri yükleme sonrası veri doğrulaması yapar
 */
async function validateTenantRestore(tenantId: string): Promise<ValidationResult[]> {
  try {
    // Tenant şemasındaki tabloları listele
    const command = `PGPASSWORD=${CONFIG.DB_PASSWORD} psql -h ${CONFIG.DB_HOST} -U ${CONFIG.DB_USER} `;
    const listTablesCommand = `${command} -p ${CONFIG.DB_PORT} -d ${CONFIG.DB_NAME} -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'tenant_${tenantId}'"`;

    const { stdout } = await execPromise(listTablesCommand);
    const tables = stdout
      .trim()
      .split('\n')
      .map((table) => table.trim())
      .filter(Boolean);

    return await validateTenantTables(tenantId, tables);
  } catch (error) {
    logger.error('Doğrulama hatası:', error);
    throw error;
  }
}

/**
 * Belirli tenant tablolarının doğrulamasını yapar
 */
async function validateTenantTables(
  tenantId: string,
  tables: string[]
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = [];

  for (const table of tables) {
    try {
      // Tablo yapısını kontrol et
      const structureCommand = `PGPASSWORD=${CONFIG.DB_PASSWORD} psql -h ${CONFIG.DB_HOST} -U ${CONFIG.DB_USER} `;
      const checkTableCommand = `${structureCommand} -p ${CONFIG.DB_PORT} -d ${CONFIG.DB_NAME} -t -c "\\d tenant_${tenantId}.${table}"`;

      await execPromise(checkTableCommand);

      // Kayıt sayısını kontrol et
      const countCommand = `PGPASSWORD=${CONFIG.DB_PASSWORD} psql -h ${CONFIG.DB_HOST} -U ${CONFIG.DB_USER} `;
      const countQuery = `${countCommand} -p ${CONFIG.DB_PORT} -d ${CONFIG.DB_NAME} -t -c "SELECT COUNT(*) FROM tenant_${tenantId}.${table}"`;

      const { stdout: countOutput } = await execPromise(countQuery);
      const recordCount = parseInt(countOutput.trim(), 10);

      results.push({
        table,
        recordCount,
        valid: true,
      });
    } catch (error) {
      results.push({
        table,
        recordCount: 0,
        valid: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
}

/**
 * Geri yükleme işlemi sonucu bildirim gönderir
 */
async function sendRestoreNotification(
  tenantId: string,
  success: boolean,
  error?: string,
  details?: string
) {
  // Slack webhook entegrasyonu varsa kullan
  if (CONFIG.SLACK_WEBHOOK) {
    try {
      const emoji = success ? '✅' : '❌';
      const color = success ? '#36a64f' : '#ff0000';
      const title = success ? 'Geri Yükleme Başarılı' : 'Geri Yükleme Başarısız';

      const message = {
        attachments: [
          {
            fallback: `${emoji} ${title} - Tenant: ${tenantId}`,
            color,
            pretext: `${emoji} *${title}*`,
            fields: [
              {
                title: 'Tenant ID',
                value: tenantId,
                short: true,
              },
              {
                title: 'Zaman',
                value: new Date().toLocaleString('tr-TR'),
                short: true,
              },
            ],
          },
        ],
      };

      // Hata varsa ekle
      if (error) {
        message.attachments[0].fields.push({
          title: 'Hata',
          value: error,
          short: false,
        });
      }

      // Detay varsa ekle
      if (details) {
        message.attachments[0].fields.push({
          title: 'Detaylar',
          value: details,
          short: false,
        });
      }

      // Slack'e webhook üzerinden bildirim gönder
      await fetch(CONFIG.SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      logger.error('Slack bildirimi gönderilirken hata:', error);
    }
  }
}
