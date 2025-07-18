# İ-EP.APP Setup TODO Listesi

> **Oluşturulma Tarihi**: 15 Temmuz 2025  
> **Kaynak**: SETUP-GUIDE.md analizi  
> **Durum**: 30 kapsamlı görev - 3 öncelik seviyesi  
> **Hedef**: Production-ready development environment

## 📋 TODO Listesi Genel Bakış

### **🔥 Yüksek Öncelik (8 görev)**

Bu görevler proje çalışabilmesi için kritik önemdedir.

#### **Setup & Configuration**

- [ ] **Environment variables (.env.local) dosyasını oluştur ve tüm 32 değişkeni yapılandır**
- [ ] **Supabase hesabı aç, yeni proje oluştur ve API keys al**
- [ ] **Upstash Redis hesabı aç, database oluştur ve connection details al**
- [ ] **npm install komutu ile 149 dependency'yi yükle**

#### **Critical Database Issues**

- [ ] **🔴 KRİTİK: Grade Management System migration'ını database'e deploy et**
- [ ] **Grade system tablolarını verify et ve RLS policies kontrol et**
- [ ] **Grade Management System API endpoints'lerini test et**

### **⚠️ Orta Öncelik (12 görev)**

Bu görevler development workflow için gereklidir.

#### **External Services**

- [ ] **Cloudflare hesabı aç, domain ekle (i-ep.app) ve API token oluştur**
- [ ] **İyzico merchant hesabı aç ve sandbox test keys al**
- [ ] **Sentry hesabı aç, Next.js projesi oluştur ve DSN key al**
- [ ] **Vercel hesabı aç, GitHub repository connect et ve project settings yap**

#### **Development Environment**

- [ ] **npx husky install ile git hooks kurulumu yap**
- [ ] **npx supabase start ile local development environment başlat**
- [ ] **npx supabase db push ile tüm migrations'ları çalıştır**
- [ ] **Supabase Authentication providers'ı enable et (Email/Password)**
- [ ] **npm run dev ile development server'ı başlat ve test et**

#### **Quality Assurance**

- [ ] **npm run lint, npm run format, npm run test komutlarını çalıştır**
- [ ] **npm run build ile production build'i test et**
- [ ] **npm run test:security:full ile security scan çalıştır**

#### **Test Infrastructure Enhancement (Jest Configuration)**

- [x] **✅ Multi-project Jest configuration oluştur (unit/component ayrımı)**
- [x] **✅ NextJest integration ile environment-specific setup files**
- [x] **✅ Enhanced transform patterns for .mjs and ESM modules**
- [x] **✅ JUnit reporting for CI/CD integration kurulum**
- [ ] **🔴 E2E Testing stabilization - timeout fixes ve CI integration**
- [ ] **🔴 GitHub Actions workflow optimization for separate test jobs**
- [ ] **🔴 Coverage monitoring automation ve automated reporting**
- [ ] **🔴 Flaky test management with retry strategies implementation**

#### **System Testing**

- [ ] **Assignment System'i test et (Database+API+UI+File Upload)**
- [ ] **Attendance System'i test et (Database+API+Analytics+Notifications)**
- [ ] **Test coverage'ı %5'ten %80'e çıkar (Unit + Integration tests)**

### **📝 Düşük Öncelik (10 görev)**

Bu görevler production deployment için gereklidir.

#### **Production Setup**

- [ ] **Domain (i-ep.app) satın al ve Cloudflare DNS records yapılandır**
- [ ] **Cloudflare SSL/TLS settings yapılandır (Full strict mode)**
- [ ] **Production Supabase database'ini yapılandır ve scaling ayarları yap**
- [ ] **Vercel production environment variables'ları yapılandır**

#### **Monitoring & Security**

- [ ] **Sentry error alerts ve performance monitoring yapılandır**
- [ ] **API endpoints, authentication ve file uploads için rate limiting test et**
- [ ] **Database backup stratejisi oluştur (npx supabase db dump)**

#### **Database & Seeding**

- [ ] **npx supabase db seed ile seed data yükle**

## 🎯 Önerilen Çalışma Sıralaması

### **Phase 1: Foundation Setup (1-2 gün)**

```bash
# Öncelik sırası:
1. Environment variables (.env.local) oluştur
2. npm install - dependencies yükle
3. Supabase hesabı ve API keys
4. Upstash Redis kurulumu
5. Husky git hooks kurulumu
```

### **Phase 2: Critical Database Fix (1 gün)**

```bash
# KRİTİK: Grade Management System
6. Grade Management System migration'ını deploy et
7. Grade system tablolarını verify et
8. Grade system API endpoints'lerini test et
```

### **Phase 3: External Services (2-3 gün)**

```bash
# External integrations:
9. Cloudflare hesabı ve domain setup
10. İyzico merchant hesabı
11. Sentry monitoring setup
12. Vercel deployment setup
```

### **Phase 4: Development Environment (1-2 gün)**

```bash
# Local development:
13. Supabase local development başlat
14. Database migrations çalıştır
15. Authentication providers enable et
16. Development server test et
```

### **Phase 5: Quality Assurance (2-3 gün)**

```bash
# Testing ve quality:
17. Code quality checks (lint, format, test)
18. Production build test
19. Security scan çalıştır
20. Assignment System test
21. Attendance System test
22. Test coverage artır (%5 → %80)
```

### **Phase 6: Production Preparation (1-2 hafta)**

```bash
# Production ready:
23. Domain satın al ve DNS yapılandır
24. SSL/TLS settings
25. Production database scaling
26. Production environment variables
27. Monitoring alerts setup
28. Rate limiting test
29. Database backup stratejisi
30. Seed data yükle
```

## 📊 Progress Tracking

### **Current Status**

- **Toplam Görev**: 30
- **Tamamlanan**: 0
- **Devam Eden**: 0
- **Bekleyen**: 30

### **Completion Targets**

- **Phase 1-2 Complete**: Proje çalışabilir durumda
- **Phase 3-4 Complete**: Development environment hazır
- **Phase 5 Complete**: Quality assurance tamamlandı
- **Phase 6 Complete**: Production deployment hazır

### **Critical Success Factors**

1. **🔴 Grade Management System deployment** - En kritik görev
2. **Environment variables** - Tüm servisler için gerekli
3. **Database migrations** - Veri bütünlüğü için kritik
4. **Test coverage** - %5 → %80 artış hedefi

## 🚨 Önemli Notlar

### **Critical Issues**

- **Grade Management System migration deploy edilmemiş** - En yüksek öncelik
- **Test coverage %5** - Production için %80 gerekli
- **Environment variables eksik** - Tüm servisler için gerekli

### **Resource Requirements**

- **Estimated Time**: 2-3 hafta tam zamanlı çalışma
- **External Accounts**: 6 farklı servis hesabı gerekli
- **Budget**: İyzico, Cloudflare, Upstash Pro planları için bütçe

### **Success Metrics**

- **Build Success**: npm run build error-free
- **Test Coverage**: %80+ unit + integration tests
- **Security Scan**: Zero critical vulnerabilities
- **Performance**: Page load <1.5s, API response <200ms

## 🎯 Demo Tenant Setup Guide

### Demo Tenant Amaçları

Demo tenant'lar aşağıdaki amaçlara hizmet eder:

1. **Satış ve Pazarlama Aracı**: Potansiyel müşterilere platformun yeteneklerini canlı ortamda göstermek
2. **Eğitim Ortamı**: Yeni kullanıcıların sistemi risk almadan öğrenmesini sağlamak
3. **Özellik Gösterimi**: Farklı abonelik planlarındaki özellikleri karşılaştırmalı olarak sunmak
4. **Test Ortamı**: Yeni özelliklerin gerçekçi verilerle test edilmesini sağlamak
5. **Kullanım Senaryoları**: Farklı okul türleri ve kullanıcı rollerinin senaryolarını göstermek

### Demo Tenant Tipleri

#### 1. Satış Demo Tenant'ı
- **Amaç**: Potansiyel müşterilere özel gösterimler için
- **Özellikler**: Tüm premium özellikler aktif, gerçekçi verilerle dolu
- **Erişim**: Geçici, kontrollü erişim (genellikle satış ekibi eşliğinde)
- **Veri**: Önceden hazırlanmış, gerçekçi ancak anonim veriler

#### 2. Self-Servis Demo Tenant'ı
- **Amaç**: Potansiyel müşterilerin kendi kendilerine keşfetmeleri için
- **Özellikler**: Temel ve orta seviye özellikler aktif, sınırlı premium özellikler
- **Erişim**: Zaman sınırlı self-servis erişim (genellikle 14-30 gün)
- **Veri**: Basitleştirilmiş, kendini açıklayan örnek veriler

#### 3. Eğitim Demo Tenant'ı
- **Amaç**: Eğitim ve onboarding süreçleri için
- **Özellikler**: Müşterinin abonelik planına göre yapılandırılmış
- **Erişim**: Eğitim süresi boyunca
- **Veri**: Eğitim senaryolarına uygun, sıfırlanabilir veriler

### Demo Tenant Oluşturma Kontrol Listesi

#### Demo Tenant Oluşturma Öncesi
- [ ] Demo tipi belirlendi (satış, self-servis, eğitim)
- [ ] Hedef kitle ve amacı tanımlandı
- [ ] Uygun veri seti seçildi
- [ ] Okul profili bilgileri hazırlandı
- [ ] Gerekli özelleştirmeler belirlendi
- [ ] Demo süresi ve erişim kısıtlamaları tanımlandı
- [ ] Demo senaryoları ve kullanım akışları hazırlandı

#### Demo Tenant Oluşturma
- [ ] Tenant temel bilgileri yapılandırıldı (ad, subdomain, logo, renkler)
- [ ] Veri seti başarıyla yüklendi
- [ ] Okul profili bilgileri girildi
- [ ] Rol bazlı demo kullanıcıları oluşturuldu
- [ ] Örnek içerikler (duyurular, etkinlikler, ödevler) yüklendi
- [ ] Demo erişim bilgileri ve kısıtlamaları yapılandırıldı
- [ ] Sıfırlama planı ve zamanlaması ayarlandı
- [ ] Demo tanıtım materyalleri hazırlandı

#### Demo Tenant Kalite Kontrol
- [ ] Tüm demo kullanıcıları ile giriş testi yapıldı
- [ ] Temel özellikler ve işlevsellik kontrol edildi
- [ ] Demo senaryolarının tamamı test edildi
- [ ] Mobil uyumluluk kontrol edildi
- [ ] Tüm özelleştirmeler doğru şekilde uygulandı
- [ ] Yardım ve rehberlik içerikleri kontrol edildi
- [ ] Demo sınırlamaları doğru şekilde uygulandı
- [ ] Sıfırlama işlemi test edildi

### Demo Tenant Yapılandırma Şablonu

```typescript
// lib/demo/demo-tenant-config.ts
interface DemoTenantConfig {
  name: string;
  type: 'sales' | 'self-service' | 'training';
  subdomain: string;
  schoolType: 'ilkokul' | 'ortaokul' | 'lise' | 'anaokulu' | 'ozelEgitim' | 'meslek';
  schoolSize: 'small' | 'medium' | 'large';
  features: {
    premium: boolean;
    analytics: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    multiLanguage: boolean;
  };
  dataSet: 'minimal' | 'standard' | 'comprehensive';
  accessPeriod: number; // Gün cinsinden
  resetFrequency: 'never' | 'daily' | 'weekly' | 'monthly';
  customizations: {
    logo?: string;
    theme?: string;
    welcomeMessage?: string;
  };
}
```

## 🔧 Geliştirme Ortamı Kurulum Rehberi

### Temel Gereksinimler

```bash
# Node.js versiyonu (package.json'da tanımlı)
node >= 18.0.0

# Package manager
npm or yarn

# Git
git --version

# Supabase CLI (global)
npm install -g supabase
```

### Proje Kurulumu

```bash
# Proje klonlama
git clone <repository-url>
cd i-ep.app

# Dependencies kurulumu (149 dependencies)
npm install

# Husky git hooks kurulumu
npx husky install
```

### Environment Variables Setup

`.env.local` dosyasını oluşturun ve aşağıdaki 32 değişkeni yapılandırın:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# İyzico Payment (Sandbox)
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Sentry
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_token
CLOUDFLARE_ZONE_ID=your_zone_id
```

### Database Setup

```bash
# Supabase local development başlat
npx supabase start

# Database migrations çalıştır
npx supabase db push

# CRITICAL: Grade Management System migration deploy et
npx supabase db push --include-all

# Seed data yükle
npx supabase db seed
```

### Development Server

```bash
# Development server başlat
npm run dev

# Production build test
npm run build

# Tests çalıştır
npm run test

# Linting ve formatting
npm run lint
npm run format
```

### External Services Setup

#### Supabase
1. Supabase hesabı açın
2. Yeni proje oluşturun
3. API keys'leri `.env.local`'e ekleyin
4. Authentication providers'ı enable edin

#### Upstash Redis
1. Upstash hesabı açın
2. Redis database oluşturun
3. Connection details'ları `.env.local`'e ekleyin

#### Cloudflare
1. Cloudflare hesabı açın
2. Domain ekleyin (i-ep.app)
3. API token oluşturun
4. DNS records yapılandırın

#### İyzico
1. İyzico merchant hesabı açın
2. Sandbox test keys alın
3. API keys'leri `.env.local`'e ekleyin

#### Sentry
1. Sentry hesabı açın
2. Next.js projesi oluşturun
3. DSN key'i `.env.local`'e ekleyin

#### Vercel
1. Vercel hesabı açın
2. GitHub repository'yi connect edin
3. Environment variables'ları yapılandırın
4. Project settings'i tamamlayın

### Quality Assurance Commands

```bash
# Code quality checks
npm run lint
npm run format
npm run test

# Security scan
npm run test:security:full

# Performance test
npm run test:performance

# Bundle analysis
npm run build:analyze
```

### Production Setup

```bash
# Domain satın alma ve DNS yapılandırma
# Cloudflare SSL/TLS settings (Full strict mode)
# Production Supabase database scaling
# Production environment variables
# Monitoring alerts setup
# Rate limiting configuration
# Database backup strategy
```

## 🔗 İlgili Dokümantasyon

- **Ana Kaynak**: `/SETUP-GUIDE.md` (archived)
- **Demo Tenant Guide**: `/docs-site/docs/demo-tenant-guide.md` (archived)
- **Proje Context**: `/CLAUDE.md`
- **Development Guide**: `/docs/DEVELOPMENT_SETUP.md`
- **Contributing Guide**: `/CONTRIBUTING.md`
- **Code Standards**: `/docs/CODE_STANDARDS.md`

---

**Son Güncelleme**: 15 Temmuz 2025  
**Maintainer**: İ-EP.APP Development Team  
**TODO Version**: 1.1 (Consolidated with SETUP-GUIDE.md and demo-tenant-guide.md)

> 🚀 **Kullanım Talimatı**: Bu liste SETUP-GUIDE.md ve demo-tenant-guide.md'den konsolide edilmiştir. Her görev tamamlandıkça [ ] → [x] olarak işaretleyin. Kritik görevlere (🔴) öncelik verin.
