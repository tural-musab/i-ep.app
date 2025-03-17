// Jest DOM'u içe aktarma
import '@testing-library/jest-dom';

// MSW (Mock Service Worker) kurulumu
import { afterAll, afterEach, beforeAll } from 'jest';
import { setupServer } from 'msw/node';

// Mock sunucuyu oluştur
export const server = setupServer();

// Test ortamını hazırla
beforeAll(() => {
  // Mock sunucuyu başlat
  server.listen({ onUnhandledRequest: 'warn' });
});

// Her testten sonra işleyicileri sıfırla
afterEach(() => {
  server.resetHandlers();
});

// Tüm testler tamamlandıktan sonra sunucuyu kapat
afterAll(() => {
  server.close();
});

// Global ortam değişkenlerini ayarla
process.env = {
  ...process.env,
  NEXT_PUBLIC_DOMAIN: 'i-es.app',
  NODE_ENV: 'test',
}; 