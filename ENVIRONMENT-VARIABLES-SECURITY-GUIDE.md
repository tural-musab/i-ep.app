# İ-EP.APP Environment Variables Güvenlik Rehberi

> **Oluşturulma**: 17 Temmuz 2025  
> **Güncelleme**: 18 Temmuz 2025 - CLOUDFLARE_EMAIL validation hatası düzeltildi  
> **Amaç**: Environment variable yönetimi için kritik güvenlik kılavuzu  
> **Durum**: 🚨 ZORUNLU - Tüm geliştiriciler bu kılavuzu takip etmelidir

## 🚨 KRİTİK BUG FIX - CLOUDFLARE_EMAIL Validation Hatası

### **HATA:**
```bash
❌ Invalid environment variables: [
  {
    validation: 'email',
    code: 'invalid_string',
    message: 'Invalid email',
    path: [ 'CLOUDFLARE_EMAIL' ]
  }
]
```

### **ÇÖZÜM:**
```bash
# ❌ YANLIŞ - Build hatasına neden olur
CLOUDFLARE_EMAIL=dev@localhost

# ✅ DOĞRU - Geçerli email formatı
CLOUDFLARE_EMAIL=dev@example.com
```

### **NEDEN OLDU:**
- `src/env.ts` dosyasında Zod ile email validasyonu var
- `dev@localhost` geçerli email formatı değil
- Build sırasında environment validation yapılıyor
- Validation başarısız olunca build durur

### **KALICI ÇÖZÜM:**
Development ortamında her zaman geçerli email formatı kullanın:
```bash
# Development için önerilen formatlar
CLOUDFLARE_EMAIL=dev@example.com
CLOUDFLARE_EMAIL=test@localhost.local
CLOUDFLARE_EMAIL=noreply@dev.local
```

## 🚨 KRİTİK GÜVENLİK KURALLARI

### **ASLA REPOSITORY'E COMMIT ETMEYİN:**

- ❌ Production API anahtarları
- ❌ Veritabanı şifreleri
- ❌ JWT secret'ları
- ❌ Üçüncü parti servis kimlik bilgileri
- ❌ E-posta şifreleri
- ❌ Gerçek Cloudflare/Supabase token'ları

### **REPOSITORY'DE HER ZAMAN PLACEHOLDER KULLANIN:**

- ✅ `production-api-anahtariniz`
- ✅ `veritabani-sifreniz`
- ✅ `jwt-secret-anahtariniz-min-32-karakter`
- ✅ Açık talimatlarla template değerleri

## 📁 Environment Dosya Yapısı

### **✅ DOĞRU Dosya Kullanımı**

| Dosya                    | Amaç                | İçerik                    | Güvenlik Seviyesi | Öncelik |
| ------------------------ | ------------------- | ------------------------- | ----------------- | ------- |
| `.env.development.local` | **Sadece Development** | Mock/test kimlik bilgileri | ✅ GÜVENLİ        | **1** |
| `.env.local`             | **Genel Override**     | Sadece genel ayarlar      | ✅ GÜVENLİ        | **2** |
| `.env.development`       | Development şablonu    | Mock credentials template | ✅ GÜVENLİ        | 3 |
| `.env.staging`           | Staging şablonu        | Placeholder değerler      | ✅ GÜVENLİ        | 3 |
| `.env.production`        | Production şablonu     | Placeholder değerler      | ✅ GÜVENLİ        | 3 |
| `.env`                   | Fallback şablonu       | Placeholder değerler      | ✅ GÜVENLİ        | 4 |
| `.env.example`           | Dokümantasyon          | Sadece placeholder değerler | ✅ GÜVENLİ        | - |

### **🚨 YANLIŞ Dosya Kullanımı (DÜZELTİLDİ)**

- ❌ Repository dosyalarında production kimlik bilgileri
- ❌ Development dosyalarında gerçek API anahtarları
- ❌ Ortamlar arası paylaşılan kimlik bilgileri
- ❌ Version control'da e-posta şifreleri

## 🛠️ Environment Variable Validation Kuralları

### **Zod Schema Validasyonu**
Uygulama `src/env.ts` dosyasında Zod ile runtime validation yapıyor:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  CLOUDFLARE_EMAIL: z.string().email(),           // Email formatı zorunlu
  NEXT_PUBLIC_APP_URL: z.string().url(),          // Geçerli URL zorunlu  
  NEXTAUTH_SECRET: z.string().min(32),            // Minimum 32 karakter
  UPSTASH_REDIS_URL: z.string().url(),            // Redis URL formatı
  IYZICO_API_KEY: z.string().min(1),              // Boş olamaz
  // ... diğer validasyonlar
});
```

### **Yaygın Validation Hataları ve Çözümleri**

#### **1. Invalid Email Format**
```bash
# ❌ HATA
CLOUDFLARE_EMAIL=dev@localhost
EMAIL_FROM=admin@localhost

# ✅ ÇÖZÜM
CLOUDFLARE_EMAIL=dev@example.com
EMAIL_FROM=admin@example.com
```

#### **2. Invalid URL Format**
```bash
# ❌ HATA
NEXT_PUBLIC_APP_URL=localhost:3000
UPSTASH_REDIS_URL=localhost:6379

# ✅ ÇÖZÜM
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPSTASH_REDIS_URL=redis://localhost:6379
```

#### **3. Too Short Secret**
```bash
# ❌ HATA
NEXTAUTH_SECRET=short

# ✅ ÇÖZÜM
NEXTAUTH_SECRET=32-character-minimum-secret-key-here
```

#### **4. Missing Required Variables**
```bash
# ❌ HATA - Boş bırakılması
IYZICO_API_KEY=

# ✅ ÇÖZÜM - Development için placeholder
IYZICO_API_KEY=sandbox-test-key-not-real
```

### **Validation Test Komutu**
```bash
# Environment variables'ı test et
npm run build

# Hata durumunda:
# 1. Hatayı oku
# 2. İlgili variable'ı düzelt
# 3. Tekrar test et
```

## 🔐 Güvenli Kimlik Bilgisi Yönetimi

### **Development (Geliştirme) Ortamı**

```bash
# ✅ DOĞRU - Sadece yerel/Mock servisler
UPSTASH_REDIS_URL=redis://localhost:6379
CLOUDFLARE_API_TOKEN=dev-mock-token-gercek-degil
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
```

### **Production (Üretim) Ortamı**

```bash
# ✅ DOĞRU - Server environment variables kullanın
# Bunları Vercel dashboard'unda veya server konfigürasyonunda ayarlayın
UPSTASH_REDIS_URL="gercek-production-url"
CLOUDFLARE_API_TOKEN="gercek-production-token"
NEXT_PUBLIC_SUPABASE_URL="gercek-production-url"
```

## 🛡️ Güvenlik Uygulaması

### **Vercel Environment Variables**

1. **Dashboard Konfigürasyonu**: Gerçek kimlik bilgilerini Vercel dashboard'unda ayarlayın
2. **Ortam Ayrımı**: Dev/staging/production için farklı değerler
3. **Secret Yönetimi**: Vercel'in şifrelenmiş secret depolama özelliğini kullanın

### **Yerel Geliştirme**

1. **Mock Servisler**: Yerel Redis, mock Cloudflare, yerel Supabase kullanın
2. **Test Kimlik Bilgileri**: Sadece sandbox/test API anahtarları kullanın
3. **Gerçek Veri Yok**: Asla yerel olarak production servislerine bağlanmayın

### **CI/CD Güvenliği**

1. **GitHub Secrets**: Kimlik bilgilerini GitHub repository secrets'ta saklayın
2. **Environment Variables**: Build işlemi sırasında secret'ları enjekte edin
3. **Hardcode Yok**: Asla kodda kimlik bilgilerini hardcode etmeyin

## 📋 Güvenlik Kontrol Listesi

### **Her Commit Öncesi**

- [ ] `.env*` dosyalarını gerçek kimlik bilgileri için kontrol edin
- [ ] Repository'de sadece placeholder değerlerinin olduğunu doğrulayın
- [ ] `.gitignore`'un tüm `.env*` dosyalarını içerdiğini onaylayın
- [ ] Yerel olarak mock kimlik bilgileriyle test edin

### **Production Deployment**

- [ ] Vercel dashboard'unda gerçek kimlik bilgilerini ayarlayın
- [ ] Environment variable ayrımını doğrulayın
- [ ] Gerçek kimlik bilgileriyle production build'i test edin
- [ ] Kimlik bilgisi sızıntılarını izleyin

### **Düzenli Güvenlik Denetimi**

- [ ] Tüm environment dosyalarını aylık olarak gözden geçirin
- [ ] Kazara kimlik bilgisi commit'lerini kontrol edin
- [ ] Güvenliği ihlal edilmişse kimlik bilgilerini değiştirin
- [ ] Placeholder şablonlarını güncelleyin

## 🚨 Acil Durum Prosedürleri

### **Kimlik Bilgileri Sızdırılırsa**

1. **Acil Eylem**: Tüm güvenliği ihlal edilmiş kimlik bilgilerini değiştirin
2. **Servis Rotasyonu**: API anahtarlarını, veritabanı şifrelerini döndürün
3. **Audit Log'ları**: Yetkisiz erişim için kontrol edin
4. **Repository Güncelleme**: Kimlik bilgilerini git geçmişinden kaldırın

### **Kimlik Bilgisi Rotasyon Programı**

- **JWT Secret'lar**: Her 90 günde bir
- **API Anahtarları**: Her 6 ayda bir
- **Veritabanı Şifreleri**: Her 6 ayda bir
- **E-posta Şifreleri**: Her 6 ayda bir

## 📋 Complete Environment Variables Reference

### **🏗️ Core System Variables**

#### **Next.js Application**
```bash
NEXT_PUBLIC_APP_NAME="İ-EP.APP"                 # Uygulama adı
NEXT_PUBLIC_APP_URL="https://i-ep.app"          # Ana URL (validation: URL format)
NEXT_PUBLIC_BASE_DOMAIN="i-ep.app"              # Ana domain
ROOT_DOMAIN="i-ep.app"                          # Root domain
NODE_ENV="production"                           # Environment type
```

#### **Authentication (NextAuth.js)**
```bash
NEXTAUTH_SECRET="32-char-min-secret-key"        # JWT secret (validation: min 32 chars)
NEXTAUTH_URL="https://i-ep.app"                 # NextAuth base URL
```

### **🗄️ Database & Storage**

#### **Supabase Configuration**
```bash
NEXT_PUBLIC_SUPABASE_URL="https://project.supabase.co"    # Public URL
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJ..."           # Public anon key
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJ..."               # 🔴 SECRET - Server only
```

#### **Redis Cache**
```bash
UPSTASH_REDIS_URL="https://redis.upstash.io"    # Redis URL (validation: URL format)
UPSTASH_REDIS_TOKEN="your-redis-token"          # Redis auth token
REDIS_DB="0"                                    # Redis database number
```

### **🏢 Multi-Tenant System**

#### **Domain Management**
```bash
NEXT_PUBLIC_TENANT_DOMAIN="i-ep.app"            # Tenant base domain
NEXT_PUBLIC_ADMIN_DOMAIN="admin.i-ep.app"       # Admin subdomain
ENABLE_DOMAIN_MANAGEMENT="true"                 # Enable domain features
```

### **☁️ Cloud Services**

#### **Cloudflare DNS & CDN**
```bash
CLOUDFLARE_API_TOKEN="your-token"               # API token
CLOUDFLARE_ZONE_ID="your-zone-id"               # Zone ID
CLOUDFLARE_EMAIL="admin@example.com"            # 🚨 FIXED: Must be valid email
CLOUDFLARE_ACCOUNT_ID="your-account-id"         # Account ID
```

#### **Cloudflare R2 Storage**
```bash
CLOUDFLARE_R2_ACCESS_KEY_ID="your-key"          # R2 access key
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret"   # 🔴 SECRET - R2 secret
CLOUDFLARE_R2_ENDPOINT="https://r2.endpoint"    # R2 endpoint URL
CLOUDFLARE_R2_BUCKET_NAME="your-bucket"         # Bucket name
CLOUDFLARE_R2_TOKEN="your-token"                # R2 auth token
CLOUDFLARE_R2_PUBLIC_URL="https://cdn.url"      # Public CDN URL
```

### **💳 Payment System**

#### **İyzico Payment Gateway**
```bash
IYZICO_API_KEY="your-api-key"                   # İyzico API key
IYZICO_SECRET_KEY="your-secret-key"             # 🔴 SECRET - İyzico secret
IYZICO_BASE_URL="https://api.iyzipay.com"       # API base URL
```

### **📧 Email Services**

#### **SMTP Configuration**
```bash
EMAIL_SERVER_HOST="smtp.gmail.com"              # SMTP server host
EMAIL_SERVER_PORT="587"                         # SMTP port
EMAIL_SERVER_USER="your-email@gmail.com"        # SMTP username (validation: email)
EMAIL_SERVER_PASSWORD="your-app-password"       # 🔴 SECRET - SMTP password
EMAIL_FROM="noreply@i-ep.app"                   # From address (validation: email)
```

### **🔧 Development Settings**

#### **Debug & Development**
```bash
DEBUG="true"                                    # Enable debug mode
ENABLE_MOCK_SERVICES="true"                     # Use mock services
DISABLE_RATE_LIMITING="true"                    # Disable rate limits
```

### **🛡️ Security Variables**

#### **Security Configuration**
```bash
ENABLE_SECURITY_HEADERS="true"                  # Enable security headers
ENABLE_AUDIT_LOGGING="true"                     # Enable audit logs
CSRF_SECRET="your-csrf-secret"                  # CSRF protection secret
```

### **⚙️ Performance & Monitoring**

#### **Performance Settings**
```bash
ENABLE_REDIS_CACHE="true"                       # Enable Redis caching
CACHE_TTL="3600"                                # Cache TTL in seconds
ENABLE_COMPRESSION="true"                       # Enable gzip compression
```

### **📊 Analytics & Monitoring**

#### **Sentry Error Tracking**
```bash
SENTRY_DSN="https://sentry.dsn.url"             # Sentry DSN
SENTRY_ENVIRONMENT="production"                 # Environment name
SENTRY_RELEASE="1.0.0"                         # Release version
```

### **🔄 Environment-Specific Examples**

#### **Development (.env.local)**
```bash
# Fixed version with proper email validation
CLOUDFLARE_EMAIL=dev@example.com                # ✅ Valid email format
NEXT_PUBLIC_APP_URL=http://localhost:3000       # ✅ Valid URL format
NEXTAUTH_SECRET=dev-secret-32-chars-minimum     # ✅ 32+ characters
ENABLE_MOCK_SERVICES=true                       # Enable mocks
DEBUG=true                                      # Enable debug
```

#### **Production (.env.production)**
```bash
# Production configuration - set in deployment platform
CLOUDFLARE_EMAIL=admin@i-ep.app                 # ✅ Valid email format
NEXT_PUBLIC_APP_URL=https://i-ep.app            # ✅ Valid HTTPS URL
NEXTAUTH_SECRET=prod-secret-32-chars-minimum    # ✅ 32+ characters
ENABLE_MOCK_SERVICES=false                      # Disable mocks
DEBUG=false                                     # Disable debug
```

## 🔧 Uygulama Durumu

### **✅ TAMAMLANDI (18 Temmuz 2025)**

- [x] **CRITICAL FIX**: CLOUDFLARE_EMAIL validation hatası düzeltildi
- [x] **FIXED**: `dev@localhost` → `dev@example.com` (geçerli email formatı)
- [x] **ADDED**: Comprehensive environment variables documentation
- [x] **ADDED**: Zod validation kuralları ve yaygın hatalar
- [x] **ADDED**: Tüm environment variables için detaylı açıklamalar
- [x] Tüm production kimlik bilgileri repository'den kaldırıldı
- [x] Güvenli placeholder şablonları oluşturuldu
- [x] Backup dosyaları için `.gitignore` güncellendi
- [x] Development mock kimlik bilgileri oluşturuldu
- [x] Güvenlik kılavuzları dokümante edildi

### **📋 YAPILACAKLAR**

- [ ] Vercel environment variables ayarlayın
- [ ] GitHub Actions secrets konfigüre edin
- [ ] Kimlik bilgisi rotasyon programını uygulayın
- [ ] Kimlik bilgisi sızıntısı izleme sistemi kurun

## 📞 Güvenlik İletişim

**Güvenlik Sorunları**: Derhal geliştirme ekibine bildirin  
**Kimlik Bilgisi Sızıntısı**: Acil durum prosedürlerini takip edin  
**Sorular**: Önce bu kılavuzu kontrol edin, sonra ekibe sorun

---

**⚠️ UNUTMAYIN**: Güvenlik herkesin sorumluluğudur. Emin olmadığınızda placeholder değerler kullanın ve ekibe sorun.

**🚨 KRİTİK**: Bu dosya gerçek kimlik bilgileri içermez - sadece güvenlik kılavuzları ve örnekler içerir.
