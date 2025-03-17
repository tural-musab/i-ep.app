/**
 * Iqra Eğitim Portalı Otomatik Yedekleme Betiği
 * 
 * Bu betik, tenant verilerini otomatik olarak yedeklemek için kullanılır.
 * Cron görevi olarak çalıştırılmak üzere tasarlanmıştır.
 * 
 * Kullanım: npm run backup:auto [--type=full|incremental] [--tenant=tenant_id]
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { parse } from 'ts-command-line-args';
import { supabaseAdmin } from '../../lib/supabase/admin';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { format as dateFormat } from 'date-fns';
import zlib from 'zlib';
import crypto from 'crypto';

// Ortam değişkenlerini yükle
dotenv.config();

// Komut satırı parametrelerini tanımla
interface BackupArguments {
  type?: 'full' | 'incremental';
  tenant?: string;
  dryRun?: boolean;
  help?: boolean;
}

// Exec'i promisify et
const execPromise = promisify(exec);

// Yedekleme yapılandırması
const BACKUP_CONFIG = {
  LOCAL_BACKUP_DIR: process.env.LOCAL_BACKUP_DIR || './backups',
  REMOTE_BACKUP_ENABLED: process.env.REMOTE_BACKUP_ENABLED === 'true',
  S3_BUCKET: process.env.S3_BUCKET_NAME || 'i-ep-app-backups',
  S3_PREFIX: process.env.S3_PREFIX || 'database-backups',
  ENCRYPTION_KEY: process.env.BACKUP_ENCRYPTION_KEY,
  ENCRYPTION_ENABLED: process.env.BACKUP_ENCRYPTION_ENABLED === 'true',
  COMPRESSION_ENABLED: process.env.BACKUP_COMPRESSION_ENABLED !== 'false',
  RETENTION_DAYS: {
    full: parseInt(process.env.FULL_BACKUP_RETENTION_DAYS || '30', 10),
    incremental: parseInt(process.env.INCREMENTAL_BACKUP_RETENTION_DAYS || '7', 10)
  }
};

// S3 istemcisi
const s3Client = BACKUP_CONFIG.REMOTE_BACKUP_ENABLED 
  ? new S3Client({
      region: process.env.AWS_REGION || 'eu-central-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    })
  : null;

/**
 * Ana yedekleme işlevi
 */
async function runBackup() {
  try {
    console.log('Yedekleme işlemi başlatılıyor...');
    
    // Komut satırı argümanlarını işle
    const args = parse<BackupArguments>({
      type: { type: String, optional: true, defaultValue: 'incremental' },
      tenant: { type: String, optional: true },
      dryRun: { type: Boolean, optional: true, defaultValue: false },
      help: { type: Boolean, optional: true, alias: 'h', defaultValue: false }
    });
    
    if (args.help) {
      console.log(`
        Iqra Eğitim Portalı Otomatik Yedekleme Aracı
        
        Kullanım: npm run backup:auto [--type=full|incremental] [--tenant=tenant_id] [--dryRun]
        
        Seçenekler:
          --type          Yedekleme türü: 'full' veya 'incremental' (varsayılan: incremental)
          --tenant        Yalnızca belirli bir tenant'ı yedeklemek için tenant ID
          --dryRun        Yedekleme işlemini simüle et, gerçek yedekleme yapma
          --help, -h      Bu yardım mesajını göster
      `);
      return;
    }
    
    // Yerel yedekleme dizinini kontrol et ve oluştur
    await ensureBackupDirectory();
    
    // Tüm tenant'ları al (eğer belirli bir tenant belirtilmemişse)
    const tenants = args.tenant 
      ? [{ id: args.tenant, name: 'specified-tenant' }] 
      : await getAllTenants();
    
    console.log(`${tenants.length} tenant için ${args.type} yedekleme gerçekleştirilecek`);
    
    // Her tenant için yedekleme yap
    for (const tenant of tenants) {
      console.log(`Tenant ${tenant.id} (${tenant.name}) için yedekleme başlatılıyor...`);
      
      if (args.dryRun) {
        console.log(`[DRY RUN] Tenant ${tenant.id} için yedekleme simüle edildi`);
        continue;
      }
      
      // Yedekleme dosyası adını oluştur
      const timestamp = dateFormat(new Date(), 'yyyyMMdd_HHmmss');
      const backupFilename = `tenant_${tenant.id}_${args.type}_${timestamp}.sql`;
      const backupFilePath = path.join(BACKUP_CONFIG.LOCAL_BACKUP_DIR, backupFilename);
      
      // pg_dump komutu için şema adını oluştur
      const schemaName = `tenant_${tenant.id}`;
      
      try {
        // Yedekleme komutunu oluştur ve çalıştır
        const pgDumpCmd = createPgDumpCommand(schemaName, backupFilePath, args.type === 'full');
        console.log(`Yedekleme komutu çalıştırılıyor: ${pgDumpCmd}`);
        
        await execPromise(pgDumpCmd);
        console.log(`Yedekleme dosyası oluşturuldu: ${backupFilePath}`);
        
        // Yedeklemeyi işle (sıkıştırma, şifreleme)
        const processedFilePath = await processBackupFile(backupFilePath);
        
        // Uzak depolamaya yükle (yapılandırma etkinse)
        if (BACKUP_CONFIG.REMOTE_BACKUP_ENABLED && s3Client) {
          await uploadToS3(processedFilePath, args.type as 'full' | 'incremental', tenant.id);
          console.log(`Yedekleme S3'e yüklendi: ${processedFilePath}`);
        }
        
        // Yerel yedekleme temizliği
        await cleanupLocalBackups(tenant.id, args.type as 'full' | 'incremental');
        
        console.log(`Tenant ${tenant.id} yedekleme işlemi tamamlandı`);
      } catch (backupErr) {
        console.error(`Tenant ${tenant.id} yedeklenirken hata oluştu:`, backupErr);
        // Başarısız olsa bile diğer tenant'ları yedeklemeye devam et
      }
    }
    
    console.log('Tüm yedekleme işlemleri tamamlandı');
    
  } catch (err) {
    console.error('Yedekleme işlemi sırasında hata oluştu:', err);
    process.exit(1);
  }
}

/**
 * Tüm tenant'ları veritabanından alır
 */
async function getAllTenants() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tenants')
      .select('id, name, status')
      .eq('status', 'active');
      
    if (error) {
      throw new Error(`Tenant'lar alınırken hata: ${error.message}`);
    }
    
    return data || [];
  } catch (err) {
    console.error('Tenant\'lar alınırken hata oluştu:', err);
    return [];
  }
}

/**
 * pg_dump komutunu oluşturur
 */
function createPgDumpCommand(schemaName: string, outputFile: string, isFullBackup: boolean): string {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL ortam değişkeni tanımlanmamış');
  }
  
  // Tam veya artımlı yedekleme yapılandırması
  const backupOptions = isFullBackup
    ? '--schema' // Tam yedeklemede tüm şemayı ve verileri al
    : '--data-only'; // Artımlı yedeklemede sadece veri al, şema değil
    
  return `pg_dump ${backupOptions} "${schemaName}" -f "${outputFile}" "${connectionString}"`;
}

/**
 * Yedekleme dizininin var olduğundan emin olur
 */
async function ensureBackupDirectory() {
  try {
    if (!fs.existsSync(BACKUP_CONFIG.LOCAL_BACKUP_DIR)) {
      await fs.promises.mkdir(BACKUP_CONFIG.LOCAL_BACKUP_DIR, { recursive: true });
      console.log(`Yedekleme dizini oluşturuldu: ${BACKUP_CONFIG.LOCAL_BACKUP_DIR}`);
    }
  } catch (err) {
    console.error('Yedekleme dizini oluşturulurken hata:', err);
    throw err;
  }
}

/**
 * Yedekleme dosyasını sıkıştırır ve şifreler (yapılandırmaya göre)
 */
async function processBackupFile(filePath: string): Promise<string> {
  let currentFilePath = filePath;
  let processedFilePath = filePath;
  
  try {
    // Sıkıştırma
    if (BACKUP_CONFIG.COMPRESSION_ENABLED) {
      processedFilePath = `${filePath}.gz`;
      const inputFile = fs.createReadStream(currentFilePath);
      const outputFile = fs.createWriteStream(processedFilePath);
      const gzip = zlib.createGzip();
      
      await new Promise<void>((resolve, reject) => {
        inputFile.pipe(gzip).pipe(outputFile)
          .on('finish', () => {
            fs.unlinkSync(currentFilePath); // Orijinal dosyayı sil
            currentFilePath = processedFilePath;
            resolve();
          })
          .on('error', reject);
      });
      
      console.log(`Yedekleme sıkıştırıldı: ${processedFilePath}`);
    }
    
    // Şifreleme
    if (BACKUP_CONFIG.ENCRYPTION_ENABLED && BACKUP_CONFIG.ENCRYPTION_KEY) {
      processedFilePath = `${currentFilePath}.enc`;
      const data = await fs.promises.readFile(currentFilePath);
      
      const cipher = crypto.createCipher('aes-256-cbc', BACKUP_CONFIG.ENCRYPTION_KEY);
      const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
      
      await fs.promises.writeFile(processedFilePath, encrypted);
      fs.unlinkSync(currentFilePath); // Sıkıştırılmış dosyayı sil
      
      console.log(`Yedekleme şifrelendi: ${processedFilePath}`);
    }
    
    return processedFilePath;
  } catch (err) {
    console.error('Yedekleme dosyası işlenirken hata:', err);
    return currentFilePath; // Hata durumunda mevcut dosyayı döndür
  }
}

/**
 * Yedekleme dosyasını S3'e yükler
 */
async function uploadToS3(filePath: string, backupType: 'full' | 'incremental', tenantId: string) {
  if (!s3Client) {
    throw new Error('S3 Client başlatılmamış');
  }
  
  try {
    const fileContent = await fs.promises.readFile(filePath);
    const fileName = path.basename(filePath);
    const s3Key = `${BACKUP_CONFIG.S3_PREFIX}/${backupType}/${tenantId}/${fileName}`;
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BACKUP_CONFIG.S3_BUCKET,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/octet-stream',
        Metadata: {
          'tenant-id': tenantId,
          'backup-type': backupType,
          'backup-date': new Date().toISOString()
        }
      })
    );
    
    console.log(`Yedekleme S3'e yüklendi: s3://${BACKUP_CONFIG.S3_BUCKET}/${s3Key}`);
  } catch (err) {
    console.error('S3 yükleme hatası:', err);
    throw err;
  }
}

/**
 * Eski yerel yedekleme dosyalarını temizler
 */
async function cleanupLocalBackups(tenantId: string, backupType: 'full' | 'incremental') {
  try {
    const backupDir = BACKUP_CONFIG.LOCAL_BACKUP_DIR;
    const files = await fs.promises.readdir(backupDir);
    
    // Tenant ve yedekleme türüne göre filtreleme
    const relevantFiles = files.filter(file => 
      file.startsWith(`tenant_${tenantId}_${backupType}_`) && 
      (file.endsWith('.sql') || file.endsWith('.sql.gz') || file.endsWith('.sql.gz.enc'))
    );
    
    // Dosya zaman damgalarına göre sırala (en yeni en başta)
    relevantFiles.sort().reverse();
    
    // Belirlenen tutma süresinden daha eski olan dosyaları sil
    const retentionDays = BACKUP_CONFIG.RETENTION_DAYS[backupType];
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - retentionDays);
    
    for (const file of relevantFiles) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.promises.stat(filePath);
      
      if (stats.mtime < retentionDate) {
        await fs.promises.unlink(filePath);
        console.log(`Eski yedekleme dosyası silindi: ${filePath}`);
      }
    }
  } catch (err) {
    console.error('Yerel yedeklemeler temizlenirken hata:', err);
  }
}

// Betiği doğrudan çalıştırdığımızda backup işlemini başlat
if (require.main === module) {
  runBackup();
}

export { runBackup }; 