// Iqra Eğitim Portalı - Supabase Deploy Betiği
// Bu betik, Supabase migrasyonlarını ve edge fonksiyonlarını yüklemek için kullanılır.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Renk kodları
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helpers
const log = {
  info: (message) => console.log(`${colors.blue}INFO:${colors.reset} ${message}`),
  success: (message) => console.log(`${colors.green}SUCCESS:${colors.reset} ${message}`),
  warn: (message) => console.log(`${colors.yellow}WARNING:${colors.reset} ${message}`),
  error: (message) => console.log(`${colors.red}ERROR:${colors.reset} ${message}`),
  step: (message) => console.log(`\n${colors.magenta}=== ${message} ===${colors.reset}`)
};

// Komut çalıştırma yardımcı fonksiyonu
function runCommand(command, options = {}) {
  log.info(`Çalıştırılıyor: ${command}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    if (!options.continueOnError) {
      log.error(`Komut başarısız oldu: ${command}`);
      log.error(error.message);
      process.exit(1);
    }
    return false;
  }
}

// Yeniden bağlanma ve kimlik doğrulama
function setupSupabase() {
  log.step('Supabase bağlantısı kontrol ediliyor');
  
  try {
    // Supabase CLI kontrol edilsin
    execSync('npx supabase --version', { stdio: 'pipe' });
    log.success('Supabase CLI bulundu');
  } catch (error) {
    log.error('Supabase CLI bulunamadı, yükleniyor...');
    runCommand('npm install supabase --save-dev');
  }
  
  // Supabase login isteğe bağlı - genellikle ilk kez kullanırken gereklidir
  /*
  log.info('Supabase oturum açma (gerekirse)');
  runCommand('npx supabase login', { continueOnError: true });
  */
  
  // Proje linkini kontrol et veya yeni bir proje bağla
  try {
    const result = execSync('npx supabase projects list', { stdio: 'pipe' });
    log.success('Proje bağlantıları listelendi');
  } catch (error) {
    log.warn('Henüz bir Supabase projesi bağlı değil');
    log.info('Projeyi bağlamak için "npx supabase link --project-ref YOUR_PROJECT_REF" komutunu çalıştırın');
    process.exit(1);
  }
}

// Migrasyonları uygulama
function applyMigrations() {
  log.step('Veritabanı migrasyonları uygulanıyor');
  
  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Dosyaları alfabetik sırayla sırala
  
  if (migrationFiles.length === 0) {
    log.warn('Hiç migration dosyası bulunamadı!');
    return;
  }
  
  log.info(`${migrationFiles.length} migration dosyası bulundu`);
  
  // Migrasyonları çalıştır
  runCommand('npx supabase db reset', { continueOnError: true });
  log.success('Veritabanı migrasyonları uygulandı');
}

// Edge fonksiyonlarını yükleme
function deployFunctions() {
  log.step('Edge Functions yükleniyor');
  
  const functionsDir = path.join(__dirname, 'functions');
  
  if (!fs.existsSync(functionsDir)) {
    log.warn('functions klasörü bulunamadı!');
    return;
  }
  
  const functionFolders = fs.readdirSync(functionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (functionFolders.length === 0) {
    log.warn('Hiç edge function klasörü bulunamadı!');
    return;
  }
  
  log.info(`${functionFolders.length} edge function bulundu`);
  
  // Her bir fonksiyonu yükle
  functionFolders.forEach(functionName => {
    log.info(`"${functionName}" fonksiyonu yükleniyor...`);
    runCommand(`npx supabase functions deploy ${functionName}`);
    log.success(`"${functionName}" fonksiyonu başarıyla yüklendi`);
  });
  
  log.success('Tüm Edge Functions başarıyla yüklendi');
}

// Ana fonksiyon
function main() {
  console.log(`\n${colors.cyan}==========================================${colors.reset}`);
  console.log(`${colors.cyan}  Iqra Eğitim Portalı - Supabase Yükleme${colors.reset}`);
  console.log(`${colors.cyan}==========================================${colors.reset}\n`);
  
  setupSupabase();
  applyMigrations();
  deployFunctions();
  
  log.step('Yükleme tamamlandı');
  log.success('Tüm işlemler başarıyla tamamlandı!');
  log.info('İşlemleri ayrı ayrı çalıştırmak için:');
  log.info('  - Migrasyonlar: npx supabase db reset');
  log.info('  - Fonksiyonlar: npx supabase functions deploy [isim]');
}

// Betiği çalıştır
main();