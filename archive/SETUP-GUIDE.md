# İ-EP.APP Proje Kapsamlı Kurulum ve Konfigürasyon Rehberi

> **Hazırlanma Tarihi**: 15 Temmuz 2025  
> **Proje Versiyonu**: 0.1.0  
> **Güncel Durum**: %65 Complete (2 sistem %95, 1 sistem %75)  
> **Hedef**: Production-ready MVP

## 📋 Proje Zaman Çizelgesi ve Aşamalar

### 🎯 **PHASE 1: Proje Kuruluş ve Temel Altyapı (Ocak 2025)**

#### **Sprint 1: Payment Integration Foundation** ✅ TAMAMLANDI

- **Tarih**: 13-17 Ocak 2025
- **Kapasite**: 80 SP
- **Tamamlanan Görevler**:
  - İyzico Payment Gateway entegrasyonu
  - Subscription plan altyapısı
  - Feature gating sistemi
  - Payment UI komponenleri
  - Billing database schema

#### **Sprint 1.5: Storage Infrastructure** ✅ TAMAMLANDI

- **Tarih**: 14 Ocak 2025
- **Kapasite**: 120 SP
- **Tamamlanan Görevler**:
  - Multi-provider storage abstraction
  - Supabase Storage entegrasyonu
  - Cloudflare R2 hazırlığı
  - File upload sistemi
  - Storage API endpoints

### 🎯 **PHASE 2: Assignment System** ✅ %95 TAMAMLANDI

- **Database**: 5 tablo + multi-tenant RLS policies
- **API**: 4 comprehensive REST endpoints
- **Frontend**: Assignment creation + file upload
- **Security**: File validation + permissions + streaming
- **Repository**: Multi-tenant BaseRepository pattern
- **Build**: Error-free compilation
- **Eksik**: Unit tests, real API integration

### 🎯 **PHASE 3: Attendance System** ✅ %95 TAMAMLANDI

- **Database**: 4 tablo + notifications + triggers
- **API**: 5 endpoint + statistics + analytics
- **Analytics**: Attendance reports + trends
- **Real-time**: Daily tracking + notifications
- **Security**: Multi-tenant isolation + audit logging
- **Build**: Error-free compilation
- **Eksik**: Unit tests, SMS/Email service integration

### 🎯 **PHASE 4: Grade Management System** ⚠️ %75 TAMAMLANDI

- **Database**: 5 tablo (yazılmış, deploy edilmemiş)
- **API**: 5 endpoint (test edilmemiş)
- **Frontend**: 4 UI component (mock data)
- **Analytics**: 7 report tipi + CSV export
- **Calculation**: Weighted averages + GPA + AA-FF grading
- **Comments**: Teacher comment system
- **Security**: Permission-based access control
- **Eksik**: Database deployment, integration testing, unit tests

### 🎯 **PHASE 5: Core Features Expansion** 🔄 PLANLANAN

- **Parent Communication**: 35% → 100% (3 hafta)
- **Report Generation**: 30% → 100% (2 hafta)
- **Class Scheduling**: 25% → 80% (3 hafta)
- **Advanced Analytics**: 10% → 60% (2 hafta)

## 🔧 Kullanıcının Yapması Gereken İşlemler

### **1. Geliştirme Ortamı Kurulumu**

#### **A. Temel Gereksinimler**

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

#### **B. Proje Kurulumu**

```bash
# Proje klonlama
git clone <repository-url>
cd i-ep.app

# Dependencies kurulumu (149 dependencies)
npm install

# Git hooks kurulumu (husky)
npx husky install

# Environment variables setup
cp .env.example .env.local
```

### **2. External Servisler ve Hesap Açma**

#### **A. Supabase - Database & Authentication**

```bash
# 1. Supabase hesabı açın: https://supabase.com
# 2. Yeni proje oluşturun
# 3. Database URL ve API keys alın
# 4. Proje ayarlarından:
#    - Project URL: https://your-project.supabase.co
#    - Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
#    - Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 5. Authentication providers enable edin:
#    - Email/Password: Enable
#    - Social logins: isteğe bağlı
```

#### **B. Upstash Redis - Caching & Session Management**

```bash
# 1. Upstash hesabı açın: https://upstash.com
# 2. Redis database oluşturun
# 3. Connection details alın:
#    - Redis URL: https://your-redis.upstash.io
#    - Redis Token: AXXXxxx_xxxxxxxxxxxxxxxxxxxxxxxx

# 4. Pricing:
#    - Free tier: 10,000 requests/day
#    - Pro tier: Production için gerekli
```

#### **C. Cloudflare - CDN & Security**

```bash
# 1. Cloudflare hesabı açın: https://cloudflare.com
# 2. Domain ekleyin (i-ep.app)
# 3. API Token oluşturun:
#    - Permissions: Zone:Zone:Read, Zone:Zone:Edit
#    - Zone Resources: Include specific zone - i-ep.app
#    - Zone ID: abcdef1234567890abcdef1234567890
#    - API Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 4. SSL/TLS settings:
#    - SSL mode: Full (strict)
#    - Edge certificates: Enable
```

#### **D. İyzico - Payment Processing**

```bash
# 1. İyzico merchant hesabı açın: https://iyzico.com
# 2. Sandbox environment için test keys alın:
#    - API Key: sandbox-xxxxxxxxxxxxxxxxxxxxx
#    - Secret Key: sandbox-xxxxxxxxxxxxxxxxxxxxx
#    - Base URL: https://sandbox-api.iyzipay.com

# 3. Production approval için gerekli belgeler:
#    - Vergi levhası
#    - İmza sirküleri
#    - Banka hesap bilgileri
#    - Faaliyet belgesi
#    - Web sitesi incelemesi

# 4. Komisyon oranları:
#    - Kredi kartı: %2.9 + 0.25₺
#    - Banka kartı: %1.9 + 0.25₺
```

#### **E. Sentry - Error Tracking & Performance**

```bash
# 1. Sentry hesabı açın: https://sentry.io
# 2. Next.js projesini oluşturun
# 3. DSN key alın:
#    - DSN: https://xxxxxxxxxxxx@o123456.ingest.sentry.io/123456
#    - Project ID: 123456
#    - Organization: your-org

# 4. Performance monitoring enable edin
# 5. Release tracking yapılandırın
```

#### **F. Vercel - Deployment & Hosting**

```bash
# 1. Vercel hesabı açın: https://vercel.com
# 2. GitHub repository'yi connect edin
# 3. Project settings:
#    - Framework: Next.js
#    - Build command: npm run build
#    - Output directory: .next
#    - Install command: npm install

# 4. Domain configuration:
#    - Custom domain: i-ep.app
#    - SSL: Automatic
```

### **3. Environment Variables Konfigürasyonu**

#### **A. .env.local dosyası oluşturun**

```bash
# Template'i kopyalayın
cp .env.example .env.local

# Gerekli değerleri doldurun
nano .env.local
```

#### **B. Zorunlu Environment Variables**

```bash
# Temel uygulama ayarları
NEXT_PUBLIC_APP_NAME="İ-EP.APP"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DOMAIN="i-ep.app"
NODE_ENV="development"

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth.js configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key-generate-secure"

# Redis configuration
UPSTASH_REDIS_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_TOKEN="your-redis-token"

# Cloudflare configuration
CLOUDFLARE_API_TOKEN="your-cloudflare-token"
CLOUDFLARE_ZONE_ID="your-zone-id"

# Sentry configuration
SENTRY_DSN="https://your-sentry-dsn"

# Logging configuration
LOG_LEVEL="info"

# Rate limiting
RATE_LIMIT_WINDOW_MS="60000"
RATE_LIMIT_MAX="100"
```

#### **C. Production Environment Variables**

```bash
# Production'da değişecek değerler
NEXT_PUBLIC_APP_URL="https://i-ep.app"
NEXTAUTH_URL="https://i-ep.app"
NODE_ENV="production"
LOG_LEVEL="warn"
RATE_LIMIT_MAX="1000"
```

### **4. Database Kurulumu**

#### **A. Local Development Setup**

```bash
# Supabase local development başlatma
npx supabase start

# Database migrations çalıştırma
npx supabase db push

# Seed data yükleme
npx supabase db seed

# Database reset (gerekirse)
npx supabase db reset
```

#### **B. Production Database Setup**

```bash
# Remote database bağlantısı
npx supabase link --project-ref your-project-ref

# Production migrations deploy etme
npx supabase db push

# Migration status check
npx supabase db diff

# Migration rollback (gerekirse)
npx supabase db reset --db-url your-db-url
```

#### **C. Critical: Grade Management System Deployment**

```bash
# 🔴 ÖNEMLİ: Grade Management System migration'ı deploy edilmemiş!
# Bu migration'ı manuel olarak çalıştırın:

# 1. Migration dosyasını check edin
ls supabase/migrations/20250715130000_create_grade_management_system.sql

# 2. Migration'ı deploy edin
npx supabase db push

# 3. Tabloları verify edin
npx supabase db shell
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'grade%';

# 4. RLS policies check edin
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE tablename LIKE 'grade%';
```

#### **D. Database Monitoring**

```bash
# Database performance monitoring
# Supabase dashboard'dan:
# - Query performance
# - Connection pooling
# - Resource usage
# - Slow queries

# Migration backup
npx supabase db dump -f backup.sql
```

### **5. Development Workflow**

#### **A. Daily Development Commands**

```bash
# Development server başlatma
npm run dev                    # Standard development
npm run dev:test              # Test environment
npm run dev:staging           # Staging environment

# Code quality checks
npm run lint                  # ESLint check
npm run lint:fix              # Auto-fix ESLint issues
npm run format                # Prettier formatting
npm run format:check          # Check formatting

# Testing
npm run test                  # Unit tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
npm run test:integration      # Integration tests
npm run e2e                   # End-to-end tests
npm run test:security         # Security tests
```

#### **B. Build & Deploy Process**

```bash
# Build verification
npm run build                 # Production build
npm run build:analyze         # Bundle analysis
npm run build:staging         # Staging build

# Environment validation
npm run validate:env          # Environment variables check

# Documentation
npm run docs:dev              # Documentation dev server
npm run docs:build            # Documentation build
```

### **6. Production Deployment Checklist**

#### **A. Domain & DNS Configuration**

```bash
# 1. Domain satın alın (i-ep.app)
# 2. Cloudflare'e domain ekleyin
# 3. DNS records yapılandırın:
#    - A record: @ → Vercel IP
#    - CNAME: www → i-ep.app
#    - MX records: Email için
# 4. SSL certificate aktif edin
# 5. CDN settings yapılandırın
```

#### **B. Production Services Setup**

```bash
# Supabase production instance
# - Database scaling
# - Connection pooling
# - Backup strategy
# - Monitoring alerts

# Upstash Redis production
# - Memory allocation
# - Persistence settings
# - Failover configuration

# İyzico production keys
# - Merchant verification
# - Webhook endpoints
# - Payment forms approval

# Sentry production project
# - Error alerts
# - Performance monitoring
# - Release tracking
```

#### **C. Environment Variables Security**

```bash
# Vercel environment variables
# - Production secrets
# - Preview environment
# - Development environment

# Security best practices:
# - Secret rotation
# - Environment separation
# - Access control
# - Audit logging
```

#### **D. Security & Performance**

```bash
# RLS policies test edin
npm run test:rls

# Security scan
npm run test:security:full

# Performance test
npm run build:analyze

# Rate limiting test
# - API endpoints
# - Authentication
# - File uploads
```

### **7. Monitoring & Analytics Setup**

#### **A. Performance Monitoring**

```bash
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID="your-analytics-id"

# Vercel Speed Insights
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID="your-speed-insights-id"

# Custom metrics
# - Page load times
# - API response times
# - Database query performance
# - User engagement metrics
```

#### **B. Error Tracking & Logging**

```bash
# Sentry configuration
SENTRY_DSN="your-sentry-dsn"
SENTRY_ENVIRONMENT="production"
SENTRY_RELEASE="your-release-version"

# Custom error tracking
# - Business logic errors
# - Payment failures
# - Database errors
# - Authentication issues
```

#### **C. Business Intelligence**

```bash
# User analytics
# - Registration funnel
# - Feature usage
# - Payment conversion
# - Churn analysis

# System metrics
# - Resource usage
# - Cost optimization
# - Scaling indicators
```

### **8. Future Integrations (Roadmap)**

#### **A. SMS Provider Integration**

```bash
# Twilio setup (Phase 5)
# 1. Twilio hesabı açın: https://twilio.com
# 2. Phone number satın alın
# 3. API credentials alın:
#    - Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
#    - Auth Token: your-auth-token
#    - Phone Number: +1234567890

# 4. Webhook endpoints yapılandırın
# 5. Rate limiting setup
# 6. Cost monitoring
```

#### **B. Email Service Integration**

```bash
# SendGrid setup (Phase 5)
# 1. SendGrid hesabı açın: https://sendgrid.com
# 2. API Key oluşturun:
#    - API Key: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# 3. Sender identity verify edin
# 4. Email templates oluşturun
# 5. Webhook endpoints setup
# 6. Bounce/spam handling
```

#### **C. Advanced Analytics**

```bash
# Google Analytics 4 (Phase 6)
# Mixpanel/Amplitude (Phase 6)
# Custom dashboard (Phase 6)
# Reporting automation (Phase 6)
```

### **9. Testing & Quality Assurance**

#### **A. Current Testing Status**

```bash
# 🔴 KRİTİK: Test coverage %5 - Artırılması gerekiyor!
npm run test:coverage

# Hedef test coverage: %80+
# Unit tests: Components, utilities, business logic
# Integration tests: API endpoints, database operations
# E2E tests: Critical user flows
```

#### **B. Test Implementation Plan**

```bash
# 1. Assignment System tests
# - Component tests
# - API endpoint tests
# - File upload tests
# - Permission tests

# 2. Attendance System tests
# - Attendance tracking tests
# - Analytics tests
# - Notification tests
# - Report generation tests

# 3. Grade Management System tests
# - Grade calculation tests
# - Database integration tests
# - Analytics tests
# - Export functionality tests
```

#### **C. Quality Gates**

```bash
# Pre-commit hooks
# - ESLint check
# - Prettier formatting
# - TypeScript compilation
# - Unit test run

# CI/CD pipeline
# - Build verification
# - Test execution
# - Security scan
# - Performance check
```

### **10. Troubleshooting & Support**

#### **A. Common Issues**

```bash
# Build errors
# - Node.js version mismatch
# - Missing environment variables
# - Database connection issues
# - Type errors

# Runtime errors
# - Authentication failures
# - Database query errors
# - File upload issues
# - Payment processing errors
```

#### **B. Debug Tools**

```bash
# Logging
npm run dev                   # Development logs
LOG_LEVEL="debug"            # Verbose logging

# Database debugging
npx supabase db shell        # Database access
npx supabase logs            # Supabase logs

# Network debugging
# - Browser DevTools
# - Sentry error tracking
# - Vercel function logs
```

#### **C. Support Resources**

```bash
# Documentation
# - /docs/DEVELOPMENT_SETUP.md
# - /CONTRIBUTING.md
# - /docs-site/docs/

# Community
# - GitHub Issues
# - Discord community
# - Stack Overflow
```

## 📊 Proje Mevcut Durumu ve Hedefler

### **✅ Tamamlanan Sistemler (65% Complete)**

- **Technical Architecture**: %90 (Enterprise-grade Next.js 15 stack)
- **Storage System**: %95 (Multi-provider file management)
- **Authentication**: %85 (NextAuth.js + Supabase)
- **Security**: %80 (RLS, middleware, security tests)
- **Performance**: %75 (Middleware optimized 166kB→137kB)
- **Payment**: %70 (İyzico integration)
- **CI/CD**: %90 (GitHub Actions pipeline)

### **✅ Core Academic Features**

- **Assignment System**: %95 (Database+API+UI+File Upload, test coverage eksik)
- **Attendance System**: %95 (Database+API+Analytics+Notifications, SMS/Email pending)
- **Grade Management**: %75 (Code complete, database deployment pending)

### **🔄 Devam Eden Görevler (Phase 4.5)**

- **Grade System Database Deployment** (2-3 gün)
- **Grade System Integration Testing** (3-4 gün)
- **Grade System Unit Testing** (1 hafta)

### **⏳ Planlanan Görevler (Phase 5)**

- **Parent Communication System** (35% → 100%, 3 hafta)
- **Report Generation System** (30% → 100%, 2 hafta)
- **Class Scheduling System** (25% → 80%, 3 hafta)
- **Advanced Analytics** (10% → 60%, 2 hafta)

### **🎯 Milestone Hedefleri**

- **Current Progress**: %65
- **Phase 4.5 Target**: %70 (Grade system deployment)
- **Phase 5 Target**: %85 (Core features complete)
- **Commercial Launch**: %90 (Q3 2025)

### **📈 Commercial Readiness**

- **MVP Launch**: 3-5 ay ek geliştirme gerekli
- **Full Commercial Launch**: 6-9 ay kapsamlı geliştirme gerekli
- **Market Readiness**: %65 (Technical foundation excellent)
- **Pricing Model**: Tiered SaaS (₺299-₺1299/ay)

## 🔗 Önemli Bağlantılar ve Kaynaklar

### **📚 Proje Dokümantasyonu**

- **Ana Rehber**: `/CLAUDE.md`
- **Kurulum Rehberi**: `/docs/DEVELOPMENT_SETUP.md`
- **Katkıda Bulunma**: `/CONTRIBUTING.md`
- **Kod Standartları**: `/docs/CODE_STANDARDS.md`
- **İlerleme Takibi**: `/docs-site/docs/PROGRESS.md`
- **Sprint Planlama**: `/docs-site/docs/SPRINT-PLANNING-2025.md`

### **🔧 Geliştirme Araçları**

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Sentry Dashboard**: https://sentry.io
- **Upstash Console**: https://console.upstash.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com

### **📖 External Documentation**

- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **NextAuth.js**: https://next-auth.js.org
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

---

**Son Güncelleme**: 15 Temmuz 2025  
**Proje Versiyonu**: 0.1.0  
**Documentation Version**: 1.0  
**Maintainer**: İ-EP.APP Development Team

> 🚀 **Not**: Bu rehber projenin başından şimdiye kadar tüm aşamalarını ve kullanıcının yapması gereken tüm işlemleri kapsamaktadır. Proje güçlü bir technical foundation üzerine kurulmuş ve production-ready duruma çok yakındır. Grade Management System'in database deployment'ı tamamlandıktan sonra proje %70 completion'a ulaşacaktır.
