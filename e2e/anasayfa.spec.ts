import { test, expect } from '@playwright/test';

test.describe('Anasayfa Testleri', () => {
  test.beforeEach(async ({ page }) => {
    // Her testten önce anasayfaya git
    await page.goto('/');
  });

  test('Anasayfa başlığını kontrol et', async ({ page }) => {
    // Sayfa başlığını kontrol et
    await expect(page).toHaveTitle(/Maarif Okul Portalı/);
  });

  test('Anasayfa ana bileşenlerini kontrol et', async ({ page }) => {
    // Navigasyon menüsünün görünür olduğunu kontrol et
    await expect(page.locator('nav')).toBeVisible();
    
    // Logo görünür mü?
    await expect(page.locator('img[alt="Maarif Okul Portalı Logo"]')).toBeVisible();
    
    // Giriş butonu mevcut mu?
    await expect(page.getByRole('link', { name: /giriş/i })).toBeVisible();
  });

  test('Giriş sayfasına yönlendirme', async ({ page }) => {
    // Giriş butonuna tıkla
    await page.getByRole('link', { name: /giriş/i }).click();
    
    // Giriş sayfasına yönlendirildi mi?
    await expect(page).toHaveURL(/.*giris/);
    
    // Giriş formu görünür mü?
    await expect(page.getByRole('heading', { name: /giriş yap/i })).toBeVisible();
    await expect(page.getByLabel(/e-posta/i)).toBeVisible();
    await expect(page.getByLabel(/şifre/i)).toBeVisible();
  });
}); 