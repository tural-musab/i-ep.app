# İ-EP.APP Backend Setup - Manuel İşlemler Listesi
*Sprint 1 Tamamlandıktan Sonra Yapılması Gerekenler*

## 🎯 ÖNCE BUNLARI YAP (Critical - Payment System)

### 1. İyzico Hesap Kurulumu
**Ne yapacaksın:**
1. https://www.iyzico.com/entegrasyon adresinden hesap aç
2. Sandbox hesabını aktif et (test için)
3. API anahtarlarını al

**Nereye ekleyeceksin:**
```bash
# .env.local dosyasına ekle:
IYZICO_API_KEY=sandbox-your-api-key-here
IYZICO_SECRET_KEY=sandbox-your-secret-key-here  
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

**Örnek:**
```bash
IYZICO_API_KEY=sandbox-iyzipay12345678
IYZICO_SECRET_KEY=sandbox-abcdef123456789
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### 2. Supabase Billing Database Setup
**Ne yapacaksın:**
1. Supabase dashboard'a git: https://app.supabase.com
2. SQL Editor'ı aç
3. Yeni migration dosyasını çalıştır

**Hangi dosyayı çalıştır:**
```sql
-- Bu dosyanın tüm içeriğini kopyala ve Supabase SQL Editor'da çalıştır:
/Users/turanmusabosman/Projects/i-ep.app/supabase/migrations/20250113000000_create_billing_system.sql
```

**Adım adım:**
1. Supabase'de proje aç → SQL Editor
2. "New query" buton'a tıkla  
3. Dosyadaki tüm SQL kodunu yapıştır
4. "Run" buton'a tıkla
5. Hata yoksa → Success ✅

### 3. Environment Variables Complete Setup
**Mevcut .env.local dosyanda bunlar olmalı:**
```bash
# Database (Supabase'den al)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth (yeni generate et)
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=http://localhost:3000

# App Info
NEXT_PUBLIC_APP_NAME=İ-EP.APP
NEXT_PUBLIC_APP_URL=http://localhost:3000

# İyzico (yukarıda eklediğin)
IYZICO_API_KEY=sandbox-your-api-key
IYZICO_SECRET_KEY=sandbox-your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Domain Settings
ROOT_DOMAIN=i-ep.app
NEXT_PUBLIC_BASE_DOMAIN=i-ep.app
```

---

## 🚀 SONRA BUNLARI YAP (Important)

### 4. Email Provider Setup (Opsiyonel ama önerilen)
**Ne yapacaksın:**
1. Gmail veya AWS SES hesabı kur
2. SMTP bilgilerini al

**Nereye ekle:**
```bash
# .env.local'e ekle:
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@i-ep.app
```

### 5. Redis Cache Setup (Opsiyonel)
**Ne yapacaksın:**
1. https://console.upstash.com hesap aç
2. Yeni Redis database oluştur
3. Connection string'leri al

**Nereye ekle:**
```bash
# .env.local'e ekle:
UPSTASH_REDIS_URL=redis://your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token
```

---

## 🌐 DOMAIN & HOSTING (Production için)

### 6. Cloudflare Setup
**Eğer özel domain kullanacaksan:**
1. Cloudflare hesap aç: https://cloudflare.com
2. Domain'i Cloudflare'e ekle
3. API token oluştur

**Nereye ekle:**
```bash
# .env.local'e ekle:
CLOUDFLARE_API_TOKEN=your-cloudflare-token
CLOUDFLARE_ZONE_ID=your-zone-id
CLOUDFLARE_EMAIL=your-email@domain.com
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### 7. Vercel Deployment Setup
**Production deploy için:**
1. https://vercel.com hesap aç
2. GitHub repo'yu connect et
3. Environment variables'ları ekle

**Vercel'de bu env var'ları ekle:**
- Tüm yukarıdaki .env.local'dekiler
- Production URL'leri güncellle:
  ```bash
  NEXTAUTH_URL=https://your-domain.com
  NEXT_PUBLIC_APP_URL=https://your-domain.com
  ```

---

## 🧪 TEST ETME (Önemli!)

### 8. Payment Test Workflow
**Nasıl test edeceksin:**

1. **Local server çalıştır:**
   ```bash
   npm run dev
   ```

2. **Test tenant oluştur:**
   ```bash
   # Supabase'de manuel olarak test tenant ekle:
   INSERT INTO public.tenants (name, subdomain, is_active) 
   VALUES ('Test Okulu', 'test', true);
   ```

3. **Payment test et:**
   - http://test.localhost:3000 adresine git
   - Billing sayfasına git
   - Test kartı kullan: `4242 4242 4242 4242`
   - Expiry: herhangi gelecek tarih
   - CVC: `123`

### 9. Database Verification
**Kontrol et:**
1. Supabase'de bu tabloların oluştuğunu doğrula:
   - `management.subscription_plans` (3 plan olmalı: free, standard, premium)
   - `management.tenant_subscriptions`  
   - `management.payments`
   - `management.invoices`
   - `management.feature_usage`

2. **SQL ile kontrol:**
   ```sql
   -- Planları kontrol et
   SELECT * FROM management.subscription_plans;
   
   -- 3 plan görmelisin: free, standard, premium
   ```

---

## 🚨 PROBLEM ÇÖZME

### Sık Karşılaşılan Sorunlar:

**1. Environment validation hatası:**
```bash
# Eğer "Invalid environment variables" görürsen:
# .env.local dosyasında eksik olan değişkenleri kontrol et
npm run validate:env
```

**2. Database connection hatası:**
```bash
# Supabase keys'leri kontrol et
# NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY doğru mu?
```

**3. İyzico payment hatası:**
```bash
# API keys'leri kontrol et
# IYZICO_API_KEY ve IYZICO_SECRET_KEY sandbox için mi?
```

**4. Build hatası:**
```bash
# Type errors varsa:
npm run lint:fix
npm run build
```

---

## 📋 CHECKLIST

**Yapmam gerekenler:**
- [ ] İyzico hesap aç ve API keys al
- [ ] .env.local dosyasını güncelle  
- [ ] Supabase'de billing migration'ı çalıştır
- [ ] Test tenant oluştur
- [ ] Payment flow'u test et
- [ ] Database'de payment record'larını kontrol et
- [ ] Email provider setup (opsiyonel)
- [ ] Redis setup (opsiyonel)
- [ ] Production deployment (Vercel)

**Hangi dosyaları düzenleyeceğim:**
- `.env.local` (ana dosya)
- Supabase SQL Editor (migration çalıştırmak için)
- Vercel Dashboard (production env vars)

**Test etmek için:**
- Local: `npm run dev`
- Build: `npm run build`  
- Tests: `npm run test`

---

## 💡 ÖNEMLİ NOTLAR

1. **Sandbox vs Production:**
   - Şimdilik sandbox İyzico kullan
   - Production'a geçerken URL'leri değiştir

2. **Security:**
   - .env.local dosyasını ASLA git'e commit etme
   - Production'da strong secret'lar kullan

3. **Database:**
   - Migration'ı production'da da çalıştırman gerekecek
   - Backup'lar almayı unutma

4. **İyzico Limits:**
   - Sandbox'da transaction limit var
   - Production'a geçmek için verification gerekli

Bu dosyayı takip ederek tüm backend setup'ını tamamlayabilirsin! 🚀