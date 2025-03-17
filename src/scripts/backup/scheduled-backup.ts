#!/usr/bin/env node
/**
 * Iqra Eğitim Portalı - Zamanlanmış Yedekleme Betiği
 * 
 * Bu betik, cron job olarak çalıştırılmak üzere tasarlanmıştır. 
 * Backup tipi ve hedef tenant parametreleri ile çalışır.
 * 
 * Kullanım:
 *   npm run backup -- --type=full
 *   npm run backup -- --type=incremental --plan=premium
 *   npm run backup -- --type=snapshot
 *   npm run backup -- --tenant=tenant_id --type=full
 */

import { parse } from 'ts-command-line-args';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import {
  backupTenant,
  backupMultipleTenants,
  getAllTenantsForBackup,
  cleanupOldBackups,
  BackupType,
  PlanType,
  TenantBackupInfo
} from '../../lib/backup/tenant-backup';
import { getLogger } from '../../lib/utils/logger';

// Ortam değişkenlerini yükle
dotenv.config();

// Logger
const logger = getLogger('scheduled-backup');

// CLI argümanlarını tanımla
interface BackupArguments {
  type: BackupType;
  tenant?: string;
  plan?: PlanType;
  dryRun?: boolean;
  cleanup?: boolean;
  help?: boolean;
}

// CLI argümanlarını parse et
const args = parse<BackupArguments>(
  {
    type: { type: String, alias: 't', description: 'Yedekleme tipi: full, incremental, snapshot' },
    tenant: { type: String, optional: true, alias: 'i', description: 'Belirli bir tenant ID' },
    plan: { type: String, optional: true, alias: 'p', description: 'Hedef plan: free, standard, premium' },
    dryRun: { type: Boolean, optional: true, alias: 'd', description: 'Test modu, gerçek işlem yapma' },
    cleanup: { type: Boolean, optional: true, alias: 'c', description: 'Yedekleme sonrası temizlik yap' },
    help: { type: Boolean, optional: true, alias: 'h', description: 'Yardım mesajını göster' }
  },
  {
    helpArg: 'help',
    headerContentSections: [
      { header: 'Iqra Eğitim Portalı Yedekleme Aracı', content: 'Tenant bazlı veritabanı yedekleme işlemi yapar.' }
    ],
    footerContentSections: [
      { header: 'Örnekler', content: [
        'npm run backup -- --type=full',
        'npm run backup -- --type=incremental --plan=premium',
        'npm run backup -- --type=snapshot',
        'npm run backup -- --tenant=tenant_id --type=full'
      ]}
    ]
  }
);

// Yedekleme işlemi için log dizini
const LOG_DIR = path.join(process.cwd(), 'logs', 'backups');

// Log dizinini oluştur
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Yardım mesajı isteği varsa sadece yardım göster ve çık
if (args.help) {
  process.exit(0);
}

/**
 * Ana yedekleme işlemini başlatır
 */
async function runBackup() {
  try {
    logger.info(`Yedekleme başlatılıyor: ${args.type} ${args.tenant ? 'tek tenant' : 'tüm tenantlar'}`);
    
    // Başlangıç zamanı
    const startTime = Date.now();
    
    // Yedeği alınacak tenant'ları belirle
    let tenantsToBackup: TenantBackupInfo[] = [];
    
    if (args.tenant) {
      // Tek bir tenant için yedekleme
      tenantsToBackup = [{
        tenantId: args.tenant,
        schemaName: `tenant_${args.tenant}`,
        backupType: args.type,
        plan: 'standard' as PlanType, // varsayılan plan
        includePublicTables: args.type !== 'incremental'
      }];
    } else {
      // Tüm tenant'lar veya belirli bir plandaki tenant'lar için
      tenantsToBackup = await getAllTenantsForBackup(args.type, args.plan);
    }
    
    // Yedeklenecek tenant sayısını logla
    logger.info(`${tenantsToBackup.length} tenant için ${args.type} yedekleme yapılacak`);
    
    if (args.dryRun) {
      // Test modu - sadece yedeklenecek tenant'ları göster
      logger.info('DRY RUN MODU: Gerçek yedekleme yapılmayacak');
      logger.info('Yedeklenecek tenant\'lar:', tenantsToBackup.map(t => t.tenantId).join(', '));
      return;
    }
    
    // Yedekleme işlemini başlat
    const results = await backupMultipleTenants(tenantsToBackup);
    
    // Sonuçları analiz et
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    // Toplam süreyi hesapla
    const totalDuration = (Date.now() - startTime) / 1000;
    
    // Sonucu raporla
    logger.info(`Yedekleme tamamlandı. Süre: ${totalDuration.toFixed(2)}s`);
    logger.info(`Başarılı: ${successCount}, Başarısız: ${failCount}`);
    
    // Eski yedeklemeleri temizle
    if (args.cleanup) {
      logger.info('Eski yedeklemeler temizleniyor...');
      await cleanupOldBackups();
    }
    
    // Başarısız yedekleme varsa hata kodu ile çık
    if (failCount > 0) {
      process.exit(1);
    }
    
    // Başarılı bir şekilde tamamlandı
    process.exit(0);
  } catch (error) {
    logger.error('Yedekleme işlemi sırasında beklenmeyen hata:', error);
    process.exit(1);
  }
}

// Ana fonksiyonu çalıştır
runBackup().catch(error => {
  logger.error('Kritik hata:', error);
  process.exit(1);
}); 