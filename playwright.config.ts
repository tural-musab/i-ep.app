import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E test yapılandırması
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Her testin çalışması için maksimum süre (msec)
  timeout: 30000,
  
  // Test klasörü yapılandırması
  testDir: './e2e',
  
  // Test raporunun nereye kaydedileceği
  outputDir: './test-results',
  
  // Test testlerinin paralel mi çalışacağı
  fullyParallel: true,
  
  // Test başarısız olursa yeniden deneme sayısı
  retries: process.env.CI ? 2 : 0,
  
  // Test çalıştıran işler sayısı
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter ayarları
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  
  // Test dosyalarını ayıklamak için glob kalıpları
  testMatch: '**/*.spec.ts',
  
  // Projeler için paylaşılan yapılandırma
  use: {
    // Test başarısız olduğunda otomatik ekran görüntüsü
    screenshot: 'only-on-failure',
    
    // Her testten sonra video kaydetme
    video: 'on-first-retry',
    
    // Eser izleme
    trace: 'on-first-retry',
    
    // Temel URL
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  
  // Farklı tarayıcı projeleri tanımlama
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Web sunucusunu otomatik başlatma (Next.js)
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
}); 