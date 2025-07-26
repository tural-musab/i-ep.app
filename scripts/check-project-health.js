#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏥 i-ep.app Proje Sağlık Kontrolü\n');
console.log('=' .repeat(50));

const checks = {
  typescript: { passed: false, errors: [] },
  eslint: { passed: false, errors: [] },
  prettier: { passed: false, errors: [] },
  dependencies: { passed: false, errors: [] },
  env: { passed: false, errors: [] },
  tests: { passed: false, errors: [] }
};

// 1. TypeScript Kontrolü
console.log('\n📝 TypeScript Kontrolü...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  checks.typescript.passed = true;
  console.log('✅ TypeScript: Hata yok');
} catch (error) {
  console.log('❌ TypeScript: Hatalar bulundu');
  checks.typescript.errors = error.stdout?.toString().split('\n').slice(0, 5) || ['TypeScript hataları mevcut'];
}

// 2. ESLint Kontrolü
console.log('\n🧹 ESLint Kontrolü...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  checks.eslint.passed = true;
  console.log('✅ ESLint: Hata yok');
} catch (error) {
  console.log('❌ ESLint: Hatalar bulundu');
  checks.eslint.errors = ['ESLint hataları mevcut. "npm run lint:fix" ile düzeltmeyi deneyin'];
}

// 3. Prettier Kontrolü
console.log('\n💅 Prettier Kontrolü...');
try {
  execSync('npm run format:check', { stdio: 'pipe' });
  checks.prettier.passed = true;
  console.log('✅ Prettier: Format doğru');
} catch (error) {
  console.log('❌ Prettier: Format hataları var');
  checks.prettier.errors = ['Format hataları mevcut. "npm run format" ile düzeltin'];
}

// 4. Dependencies Kontrolü
console.log('\n📦 Dependencies Kontrolü...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nodeModulesExists = fs.existsSync('node_modules');
  
  if (!nodeModulesExists) {
    throw new Error('node_modules klasörü bulunamadı');
  }
  
  // Kritik dependencies kontrolü
  const criticalDeps = [
    '@upstash/redis',
    '@supabase/supabase-js',
    'next-auth',
    '@sentry/nextjs'
  ];
  
  const missingDeps = criticalDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    checks.dependencies.errors = missingDeps.map(dep => `Eksik: ${dep}`);
  } else {
    checks.dependencies.passed = true;
    console.log('✅ Dependencies: Tüm kritik bağımlılıklar mevcut');
  }
} catch (error) {
  console.log('❌ Dependencies: Sorun var');
  checks.dependencies.errors = [error.message];
}

// 5. Environment Variables Kontrolü
console.log('\n🔐 Environment Variables Kontrolü...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'JWT_SECRET'
];

const envFiles = ['.env.local', '.env'];
let envVars = {};

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
  }
});

const missingEnvVars = requiredEnvVars.filter(varName => !envVars[varName] && !process.env[varName]);

if (missingEnvVars.length === 0) {
  checks.env.passed = true;
  console.log('✅ Environment: Tüm gerekli değişkenler mevcut');
} else {
  console.log('❌ Environment: Eksik değişkenler var');
  checks.env.errors = missingEnvVars.map(varName => `Eksik: ${varName}`);
}

// 6. Test Kontrolü
console.log('\n🧪 Test Kontrolü...');
try {
  const testFiles = execSync('find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l', { encoding: 'utf8' }).trim();
  console.log(`   Test dosyası sayısı: ${testFiles}`);
  
  if (parseInt(testFiles) > 0) {
    checks.tests.passed = true;
    console.log('✅ Tests: Test dosyaları mevcut');
  } else {
    console.log('⚠️  Tests: Test dosyası bulunamadı');
    checks.tests.errors = ['Test dosyası bulunamadı'];
  }
} catch (error) {
  console.log('⚠️  Tests: Kontrol edilemedi');
}

// Özet Rapor
console.log('\n' + '=' .repeat(50));
console.log('📊 ÖZET RAPOR\n');

let totalPassed = 0;
let totalFailed = 0;

Object.entries(checks).forEach(([category, result]) => {
  const status = result.passed ? '✅' : '❌';
  console.log(`${status} ${category.charAt(0).toUpperCase() + category.slice(1)}`);
  
  if (result.passed) {
    totalPassed++;
  } else {
    totalFailed++;
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`   → ${error}`));
    }
  }
});

console.log('\n' + '=' .repeat(50));
console.log(`Toplam: ${totalPassed} başarılı, ${totalFailed} başarısız`);

// Build deneme
if (totalFailed === 0) {
  console.log('\n🚀 Tüm kontroller başarılı! Build deneniyor...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('\n✅ BUILD BAŞARILI! Proje production-ready! 🎉');
  } catch (error) {
    console.log('\n❌ BUILD BAŞARISIZ! Yukarıdaki hataları düzeltin.');
  }
} else {
  console.log('\n⚠️  Build denemesi için önce yukarıdaki hataları düzeltin.');
  console.log('\n📚 Yardımcı Dokümanlar:');
  console.log('   - TYPESCRIPT-ESLINT-MIGRATION.md');
  console.log('   - SECURITY-IMPROVEMENTS.md');
  console.log('   - KRITIK-GUNCELLEMELER-OZET.md');
}

// Çıkış kodu
process.exit(totalFailed > 0 ? 1 : 0);
