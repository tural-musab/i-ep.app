#!/usr/bin/env node

/**
 * İ-EP.APP Documentation Auto-Sync Script
 * 
 * Bu script proje dosyalarındaki değişiklikleri izler ve 
 * dokümantasyon iyileştirme planını otomatik olarak günceller.
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // İzlenecek dosyalar
  watchFiles: [
    'docs-site/docs/PROGRESS.md',
    'docs-site/docs/SPRINT-PLANNING-2025.md', 
    'docs-site/docs/PROJECT-STATUS-REPORT-*.md',
    'docs-site/docs/DEVELOPMENT-ROADMAP-2025.md'
  ],
  
  // Güncellenmesi gereken dosya
  targetFile: 'docs-site/docs/meta/dokumantasyon-iyilestirme-plani-2025.html',
  
  // İzleme yapılacak dizinler
  watchDirs: ['./'],
  
  // Hariç tutulacak dizinler
  ignorePatterns: [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.next/**'
  ]
};

class DocumentationSyncService {
  constructor() {
    this.isUpdating = false;
    this.lastUpdate = new Date();
  }

  /**
   * PROGRESS.md dosyasından mevcut durumu oku
   */
  async readProgressStatus() {
    try {
      const progressPath = path.join(process.cwd(), 'docs-site/docs/PROGRESS.md');
      if (!fs.existsSync(progressPath)) return null;

      const content = fs.readFileSync(progressPath, 'utf8');
      
      // Progress yüzdesini bul
      const progressMatch = content.match(/Toplam İlerleme:\s*(\d+)%/);
      const progress = progressMatch ? parseInt(progressMatch[1]) : 0;

      // Tamamlanan Sprint'i bul
      const sprintMatch = content.match(/Sprint (\d+(?:\.\d+)?)/g);
      const latestSprint = sprintMatch ? sprintMatch[sprintMatch.length - 1] : 'Sprint 1';

      // Son güncelleme tarihini bul
      const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
      const lastUpdateDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];

      return {
        progress,
        latestSprint,
        lastUpdateDate,
        filePath: progressPath
      };
    } catch (error) {
      console.error('Progress dosyası okunamadı:', error);
      return null;
    }
  }

  /**
   * Sprint planlama dosyasından sprint durumunu oku
   */
  async readSprintStatus() {
    try {
      const sprintPath = path.join(process.cwd(), 'docs-site/docs/SPRINT-PLANNING-2025.md');
      if (!fs.existsSync(sprintPath)) return null;

      const content = fs.readFileSync(sprintPath, 'utf8');
      
      // Aktif sprint'i bul
      const activeSprintMatch = content.match(/## (Sprint \d+(?:\.\d+)?)[^\n]*\n[\s\S]*?Status:\s*(\w+)/);
      
      return {
        activeSprint: activeSprintMatch ? activeSprintMatch[1] : 'Sprint 1',
        status: activeSprintMatch ? activeSprintMatch[2] : 'unknown',
        filePath: sprintPath
      };
    } catch (error) {
      console.error('Sprint planlama dosyası okunamadı:', error);
      return null;
    }
  }

  /**
   * Storage implementation durumunu kontrol et
   */
  async checkStorageImplementation() {
    try {
      const storageIndexPath = path.join(process.cwd(), 'src/lib/storage/index.ts');
      const storageProviderPath = path.join(process.cwd(), 'src/lib/storage/providers/supabase.provider.ts');
      
      const hasStorageIndex = fs.existsSync(storageIndexPath);
      const hasStorageProvider = fs.existsSync(storageProviderPath);
      
      let implementationStatus = 'partial';
      if (hasStorageIndex && hasStorageProvider) {
        // Repository layer kontrol et
        const indexContent = fs.readFileSync(storageIndexPath, 'utf8');
        const hasRepositoryError = indexContent.includes('StorageRepository henüz implement edilmedi');
        
        implementationStatus = hasRepositoryError ? 'repository-missing' : 'complete';
      }

      return {
        hasCore: hasStorageIndex,
        hasProvider: hasStorageProvider,
        status: implementationStatus,
        completion: implementationStatus === 'complete' ? 95 : 
                   implementationStatus === 'repository-missing' ? 75 : 50
      };
    } catch (error) {
      console.error('Storage implementation kontrol edilemedi:', error);
      return { status: 'unknown', completion: 0 };
    }
  }

  /**
   * Mevcut proje dosyalarından durum bilgilerini topla
   */
  async gatherProjectStatus() {
    console.log('📊 Proje durumu toplanıyor...');
    
    const [progressStatus, sprintStatus, storageStatus] = await Promise.all([
      this.readProgressStatus(),
      this.readSprintStatus(), 
      this.checkStorageImplementation()
    ]);

    return {
      progress: progressStatus,
      sprint: sprintStatus,
      storage: storageStatus,
      timestamp: new Date().toISOString(),
      lastSync: this.lastUpdate.toISOString()
    };
  }

  /**
   * HTML dokümantasyon planını güncelle
   */
  async updateDocumentationPlan(projectStatus) {
    try {
      const targetPath = path.join(process.cwd(), CONFIG.targetFile);
      
      if (!fs.existsSync(targetPath)) {
        console.error('❌ Hedef dokümantasyon dosyası bulunamadı:', targetPath);
        return false;
      }

      let htmlContent = fs.readFileSync(targetPath, 'utf8');

      // Progress güncellemeleri
      if (projectStatus.progress) {
        // Ana progress değerini güncelle
        htmlContent = htmlContent.replace(
          /(\d+)% → (\d+)%/g,
          `${projectStatus.progress.progress - 15}% → ${projectStatus.progress.progress}%`
        );

        // Storage system progress'i güncelle
        if (projectStatus.storage) {
          htmlContent = htmlContent.replace(
            /<div class="number">95%<\/div>\s*<div class="label">Storage System<\/div>/,
            `<div class="number">${projectStatus.storage.completion}%</div>
            <div class="label">Storage System</div>`
          );
        }

        // Son güncelleme tarihini güncelle
        const today = new Date().toLocaleDateString('tr-TR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        htmlContent = htmlContent.replace(
          /Son Güncelleme: [^<]+/g,
          `Son Güncelleme: ${today} - Otomatik Senkronizasyon`
        );
      }

      // Sprint bilgilerini güncelle
      if (projectStatus.sprint) {
        htmlContent = htmlContent.replace(
          /Sprint \d+(?:\.\d+)? başarıyla tamamlandı/g,
          `${projectStatus.sprint.activeSprint} devam ediyor`
        );
      }

      // Storage repository status'unu güncelle
      if (projectStatus.storage && projectStatus.storage.status === 'repository-missing') {
        // Acil öncelikler kısmında storage repository task'ini vurgula
        htmlContent = htmlContent.replace(
          /<h3>Storage Repository Implementation Guide<\/h3>/,
          '<h3>🔥 Storage Repository Implementation Guide (ACIL)</h3>'
        );
      }

      // Güncelleme tarih damgasını ekle
      const updateInfo = `
        <div class="update-info">
            <h3>🔄 Otomatik Güncelleme - ${new Date().toLocaleDateString('tr-TR')}</h3>
            <p><strong>Mevcut Proje Durumu:</strong> %${projectStatus.progress?.progress || 50} tamamlandı</p>
            <p><strong>Storage Durumu:</strong> ${projectStatus.storage?.status || 'unknown'} (%${projectStatus.storage?.completion || 0})</p>
            <p><strong>Aktif Sprint:</strong> ${projectStatus.sprint?.activeSprint || 'Bilinmiyor'}</p>
        </div>
      `;

      // Eski update-info'yu değiştir
      htmlContent = htmlContent.replace(
        /<div class="update-info">[\s\S]*?<\/div>/,
        updateInfo
      );

      // Dosyayı güncelle
      fs.writeFileSync(targetPath, htmlContent, 'utf8');
      
      console.log('✅ Dokümantasyon planı güncellendi:', targetPath);
      return true;

    } catch (error) {
      console.error('❌ Dokümantasyon planı güncellenemedi:', error);
      return false;
    }
  }

  /**
   * File watcher başlat
   */
  startWatching() {
    console.log('👀 Dosya değişiklikleri izleniyor...');
    
    const watcher = chokidar.watch(CONFIG.watchFiles, {
      ignored: CONFIG.ignorePatterns,
      persistent: true,
      ignoreInitial: true
    });

    watcher.on('change', async (filePath) => {
      if (this.isUpdating) return;
      
      console.log(`📝 Dosya değişti: ${filePath}`);
      await this.performSync();
    });

    watcher.on('add', async (filePath) => {
      console.log(`➕ Yeni dosya eklendi: ${filePath}`);
      await this.performSync();
    });

    console.log('✅ Dosya izleme başlatıldı. Değişiklikler otomatik olarak senkronize edilecek.');
    
    return watcher;
  }

  /**
   * Senkronizasyon işlemini gerçekleştir
   */
  async performSync() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    console.log('🔄 Dokümantasyon senkronizasyonu başlatılıyor...');

    try {
      // Proje durumunu topla
      const projectStatus = await this.gatherProjectStatus();
      
      // Dokümantasyon planını güncelle
      const success = await this.updateDocumentationPlan(projectStatus);
      
      if (success) {
        console.log('✅ Senkronizasyon tamamlandı!');
        this.lastUpdate = new Date();
      } else {
        console.log('❌ Senkronizasyon başarısız!');
      }

    } catch (error) {
      console.error('❌ Senkronizasyon hatası:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Manuel senkronizasyon
   */
  async manualSync() {
    console.log('🚀 Manuel senkronizasyon başlatılıyor...');
    await this.performSync();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const syncService = new DocumentationSyncService();

  switch (command) {
    case 'watch':
      console.log('🎯 İ-EP.APP Dokümantasyon Auto-Sync başlatılıyor...');
      syncService.startWatching();
      
      // İlk senkronizasyonu çalıştır
      await syncService.manualSync();
      
      // Process'i açık tut
      process.stdin.resume();
      break;

    case 'sync':
      await syncService.manualSync();
      break;

    case 'status':
      const status = await syncService.gatherProjectStatus();
      console.log('📊 Proje Durumu:');
      console.log(JSON.stringify(status, null, 2));
      break;

    default:
      console.log(`
🔄 İ-EP.APP Dokümantasyon Auto-Sync

Kullanım:
  node scripts/doc-sync.js watch   # Sürekli izleme modunu başlat
  node scripts/doc-sync.js sync    # Tek seferlik senkronizasyon
  node scripts/doc-sync.js status  # Proje durumunu göster

Örnekler:
  npm run doc:watch               # package.json script kullanarak
  npm run doc:sync                # Manuel senkronizasyon
      `);
  }
}

// Script'i çalıştır
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DocumentationSyncService };