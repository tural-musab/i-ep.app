# İ-EP.APP Dokümantasyon Dizin Yapısı

## 📁 Dokümantasyon Organizasyonu

Bu dizin, İ-EP.APP projesinin tüm dokümantasyonunu organize edilmiş bir şekilde içerir.

### 🗂️ Ana Dizin Yapısı

```
docs/
├── 📋 Ana Dokümantasyon
│   ├── PROGRESS.md                           # Proje ilerleme takibi
│   ├── DEVELOPMENT-ROADMAP-2025.md           # 2025 geliştirme yol haritası
│   ├── SPRINT-PLANNING-2025.md               # Sprint planlama rehberi
│   ├── PROJECT-STATUS-REPORT-2025-01-13.md  # Proje durum raporu
│   └── mvp-checklist.md                      # MVP kontrol listesi
│
├── 🏗️ implementation/                        # Uygulama rehberleri
│   └── depolama-sistemi-uygulama-rehberi.md  # Storage system implementation
│
├── 📊 planning/                               # Planlama dokümantasyonu
│   ├── project-plan.md                       # Proje planı
│   ├── README.md                             # Sprint dokümantasyonu
│   └── sprint-07.md                          # Sprint 7 detayları
│
├── 🔄 migration/                              # Geçiş dokümantasyonu
│   ├── DOMAIN_MIGRATION_PLAN.md              # Domain geçiş planı
│   └── MIGRATION-READINESS-FINAL.md          # Geçiş hazırlık raporu
│
├── 📈 analysis/                               # Analiz raporları
│   ├── supabase_analysis_report.md           # Supabase analiz raporu
│   ├── REORGANIZATION-SUMMARY.md             # Yeniden organizasyon özeti
│   └── EXECUTIVE-SUMMARY.md                  # Yönetici özeti
│
├── 🚀 deployment/                             # Deployment rehberleri
│   ├── backend-setup.md                      # Backend kurulum
│   ├── supabase-integration.md               # Supabase entegrasyonu
│   ├── cloudflare-setup.md                   # Cloudflare kurulum
│   ├── GITHUB_SECRETS_SETUP.md               # GitHub secrets yapılandırması
│   ├── backup-restore.md                     # Yedekleme ve geri yükleme
│   ├── disaster-recovery.md                  # Felaket kurtarma
│   └── ci-cd-pipeline.md                     # CI/CD pipeline
│
├── 🏛️ architecture/                           # Mimari dokümantasyonu
│   ├── system-architecture-diagram.md        # Sistem mimari diyagramı
│   ├── multi-tenant-strategy.md              # Multi-tenant strateji
│   ├── data-isolation.md                     # Veri izolasyonu
│   ├── domain-management.md                  # Domain yönetimi
│   └── tech-stack.md                         # Teknoloji stack
│
├── 🔌 api/                                    # API dokümantasyonu
│   ├── endpoints.md                          # API endpoint'leri
│   ├── error-codes.md                        # Hata kodları
│   ├── super-admin-api.md                    # Super admin API
│   ├── swagger.yaml                          # OpenAPI spesifikasyonu
│   └── super-admin/webhooks.md               # Webhook API
│
├── 🧩 components/                             # Komponenet dokümantasyonu
│   └── super-admin/                          # Super admin komponentleri
│       ├── system/                           # Sistem komponentleri
│       ├── backup/                           # Yedekleme komponentleri
│       ├── audit/                            # Denetim komponentleri
│       ├── webhook/                          # Webhook komponentleri
│       └── tenant/                           # Tenant komponentleri
│
├── 🏫 features/                               # Özellik dokümantasyonu
│   ├── class-management.md                   # Sınıf yönetimi
│   └── super-admin/                          # Super admin özellikleri
│
├── 🎨 ui-ux/                                  # UI/UX dokümantasyonu
│   ├── layouts/                              # Layout tasarımları
│   └── user-flows/                           # Kullanıcı akışları
│
├── 🧪 testing/                                # Test dokümantasyonu
│   ├── multi-tenant-testing.md               # Multi-tenant test
│   └── mock-integration-tests.md             # Mock entegrasyon testleri
│
├── 📚 onboarding/                             # Onboarding rehberleri
│   ├── setup-guide.md                        # Kurulum rehberi
│   ├── architecture-overview.md              # Mimari genel bakış
│   └── code-standards.md                     # Kod standartları
│
└── 📏 adr/                                    # Architecture Decision Records
    ├── 0001-nextjs-14-kullanimi.md           # Next.js 14 kararı
    ├── 0002-supabase-ve-postgres-kullanimi.md # Supabase kararı
    ├── 0003-multi-tenant-mimari-stratejisi.md # Multi-tenant mimari
    ├── 0004-cloudflare-ile-domain-yonetimi.md # Cloudflare domain
    ├── 0005-tailwindcss-ve-shadcn-ui-kullanimi.md # UI kütüphanesi
    ├── 0006-react-hook-form-ve-zod-kullanimi.md # Form yönetimi
    └── 0007-jest-ve-testing-library-kullanimi.md # Test framework
```

## 🎯 Dokümantasyon Standartları

### Dosya Adlandırma
- **Türkçe dosyalar**: kebab-case kullan (`depolama-sistemi-uygulama-rehberi.md`)
- **İngilizce dosyalar**: Sadece teknik referans için
- **Tarih içeren dosyalar**: `YYYY-MM-DD` formatı kullan

### Kategori Rehberi

| Kategori | Açıklama | Örnekler |
|----------|----------|----------|
| **📋 Ana** | Proje yönetimi ve ilerleme | PROGRESS.md, ROADMAP.md |
| **🏗️ Implementation** | Teknik uygulama rehberleri | Storage guide, API implementation |
| **📊 Planning** | Sprint ve proje planlama | Sprint docs, project plans |
| **🔄 Migration** | Geçiş ve migrasyon | Domain migration, data migration |
| **📈 Analysis** | Analiz ve raporlar | Performance reports, analysis |
| **🚀 Deployment** | Deployment ve DevOps | Setup guides, CI/CD configs |
| **🏛️ Architecture** | Sistem mimarisi | Architecture diagrams, decisions |
| **🔌 API** | API dokümantasyonu | Endpoints, schemas, examples |
| **🧩 Components** | Komponent dokümantasyonu | Component specs, usage |
| **🏫 Features** | Özellik spesifikasyonları | Feature requirements, designs |

## 🔍 Hızlı Referans

### Yeni Geliştiriciler İçin
1. [Kurulum Rehberi](onboarding/setup-guide.md)
2. [Mimari Genel Bakış](onboarding/architecture-overview.md)
3. [Kod Standartları](onboarding/code-standards.md)

### Proje Yöneticileri İçin
1. [Proje İlerleme](PROGRESS.md)
2. [Geliştirme Yol Haritası](DEVELOPMENT-ROADMAP-2025.md)
3. [Sprint Planlama](SPRINT-PLANNING-2025.md)

### DevOps İçin
1. [Backend Kurulum](deployment/backend-setup.md)
2. [CI/CD Pipeline](deployment/ci-cd-pipeline.md)
3. [Felaket Kurtarma](deployment/disaster-recovery.md)

### Geliştiriciler İçin
1. [API Endpoints](api/endpoints.md)
2. [Uygulama Rehberleri](implementation/)
3. [Komponent Dokümantasyonu](components/)

---

Bu dokümantasyon organizasyonu, projenin sürdürülebilirliği ve yeni ekip üyelerinin hızla adapte olabilmesi için tasarlanmıştır.