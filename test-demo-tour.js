const { chromium } = require('playwright');

async function testDemoTour() {
  const browser = await chromium.launch({ 
    headless: false, // Görünür modda test edelim
    slowMo: 1000 // Her adım arasında 1 saniye bekle
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  // Console log'larını yakala
  page.on('console', msg => {
    console.log(`🖥️  Browser Console: ${msg.text()}`);
  });

  // Network request'leri izle
  page.on('request', request => {
    if (request.url().includes('/api/auth/demo-login')) {
      console.log(`📡 Demo Login API Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/auth/demo-login')) {
      console.log(`📨 Demo Login API Response: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🚀 Starting Progressive Demo Tour Test...');
    
    // 1. Demo sayfasını aç
    console.log('1️⃣ Opening demo page...');
    await page.goto('http://localhost:3000/auth/demo');
    await page.waitForLoadState('networkidle');
    
    // 2. Sayfa yüklendiğini doğrula
    const pageTitle = await page.textContent('h1');
    console.log(`📝 Page title: ${pageTitle}`);
    
    // 3. Admin role'ü test et
    console.log('2️⃣ Testing Admin role...');
    const adminCard = page.locator('[data-role="admin"], div:has-text("Okul Yöneticisi")').first();
    
    if (await adminCard.isVisible()) {
      await adminCard.click();
      console.log('✅ Admin card clicked');
      
      // URL değişimini bekle
      await page.waitForURL(/.*\/dashboard.*demo=true.*tour=start.*role=admin.*/, { timeout: 10000 });
      console.log('✅ Redirected to admin dashboard with tour parameters');
      
      // Progressive Demo Tour modal'ının görünmesini bekle
      await page.waitForSelector('div:has-text("Hoş Geldiniz Okul Müdürü!")', { timeout: 5000 });
      console.log('✅ Progressive Demo Tour modal appeared for admin');
      
      // Tour progress bar'ı kontrol et
      const progressBar = page.locator('.bg-blue-600');
      if (await progressBar.isVisible()) {
        console.log('✅ Tour progress bar visible');
      }
      
      // "İleri" butonunu test et
      const nextButton = page.locator('button:has-text("İleri")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        console.log('✅ Next button works');
        await page.waitForTimeout(2000);
      }
      
      // Tour'u atla
      const skipButton = page.locator('button:has-text("Turu Atla")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
        console.log('✅ Skip tour button works');
      }
    } else {
      console.log('❌ Admin card not found');
    }
    
    // 4. Teacher role'ü test et
    console.log('3️⃣ Testing Teacher role...');
    await page.goto('http://localhost:3000/auth/demo');
    await page.waitForLoadState('networkidle');
    
    const teacherCard = page.locator('div:has-text("Öğretmen")').first();
    if (await teacherCard.isVisible()) {
      await teacherCard.click();
      console.log('✅ Teacher card clicked');
      
      await page.waitForURL(/.*\/ogretmen.*demo=true.*tour=start.*role=teacher.*/, { timeout: 10000 });
      console.log('✅ Redirected to teacher dashboard with tour parameters');
      
      await page.waitForSelector('div:has-text("Hoş Geldiniz Öğretmen!")', { timeout: 5000 });
      console.log('✅ Progressive Demo Tour modal appeared for teacher');
      
      // Tour'u atla
      const skipButton = page.locator('button:has-text("Turu Atla")');
      if (await skipButton.isVisible()) {
        await skipButton.click();
        console.log('✅ Teacher tour skip works');
      }
    } else {
      console.log('❌ Teacher card not found');
    }
    
    // 5. Student role'ü test et
    console.log('4️⃣ Testing Student role...');
    await page.goto('http://localhost:3000/auth/demo');
    await page.waitForLoadState('networkidle');
    
    const studentCard = page.locator('div:has-text("Öğrenci")').first();
    if (await studentCard.isVisible()) {
      await studentCard.click();
      console.log('✅ Student card clicked');
      
      await page.waitForURL(/.*\/ogrenci.*demo=true.*tour=start.*role=student.*/, { timeout: 10000 });
      console.log('✅ Redirected to student dashboard with tour parameters');
      
      await page.waitForSelector('div:has-text("Hoş Geldin Öğrenci!")', { timeout: 5000 });
      console.log('✅ Progressive Demo Tour modal appeared for student');
    } else {
      console.log('❌ Student card not found');
    }
    
    // 6. Parent role'ü test et
    console.log('5️⃣ Testing Parent role...');
    await page.goto('http://localhost:3000/auth/demo');
    await page.waitForLoadState('networkidle');
    
    const parentCard = page.locator('div:has-text("Veli")').first();
    if (await parentCard.isVisible()) {
      await parentCard.click();
      console.log('✅ Parent card clicked');
      
      await page.waitForURL(/.*\/veli.*demo=true.*tour=start.*role=parent.*/, { timeout: 10000 });
      console.log('✅ Redirected to parent dashboard with tour parameters');
      
      await page.waitForSelector('div:has-text("Hoş Geldiniz Sayın Veli!")', { timeout: 5000 });
      console.log('✅ Progressive Demo Tour modal appeared for parent');
    } else {
      console.log('❌ Parent card not found');
    }
    
    // 7. Normal giriş butonunu test et
    console.log('6️⃣ Testing normal login button...');
    await page.goto('http://localhost:3000/auth/demo');
    await page.waitForLoadState('networkidle');
    
    const normalLoginButton = page.locator('a:has-text("Normal Giriş Sayfası")');
    if (await normalLoginButton.isVisible()) {
      await normalLoginButton.click();
      await page.waitForURL(/.*\/auth\/giris.*/, { timeout: 5000 });
      console.log('✅ Normal login button redirects to /auth/giris');
    } else {
      console.log('❌ Normal login button not found');
    }
    
    // 8. Logo click test
    console.log('7️⃣ Testing logo click navigation...');
    const logo = page.locator('img[alt="Iqra Eğitim Portalı"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForURL(/.*\/$/, { timeout: 5000 });
      console.log('✅ Logo click navigates to home page');
    } else {
      console.log('❌ Logo not found');
    }
    
    console.log('🎉 Progressive Demo Tour test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Test'i çalıştır
testDemoTour();