# Mimari Özet

Bu doküman, İ-EP.APP (Iqra Eğitim Portalı) projesinin mimari yapısını, teknoloji yığınını ve temel bileşenlerini özetlemektedir.

## Sistem Mimarisi

İ-EP.APP, çok kiracılı (multi-tenant) bir SaaS uygulaması olarak tasarlanmıştır. Her eğitim kurumu (okul, kolej, dershane vb.) ayrı bir tenant (kiracı) olarak sistemde yer almaktadır.

### Sistem Bileşenleri ve Mimarisi

```
┌─────────────────────────────────────────────────────────────────┐
│                     İstemci Tarafı (Client)                      │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │   Web App   │    │  Mobil Uyumlu  │    │    Admin Panel    │  │
│  │ (Next.js 14)│    │  Responsive UI │    │  (Super Admin &   │  │
│  │             │    │                │    │  Tenant Admin)    │  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Katmanı (Next.js API)                    │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │ Auth API    │    │  Tenant API   │    │   Domain API      │  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │ User API    │    │  School API   │    │   Analytics API   │  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Servis Katmanı (Backend Services)               │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │  Auth       │    │  Tenant       │    │   Storage         │  │
│  │  Service    │    │  Service      │    │   Service         │  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │ User        │    │  Notification │    │   Analytics       │  │
│  │ Service     │    │  Service      │    │   Service         │  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Veri Katmanı (Data Layer)                       │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │ PostgreSQL  │    │ Redis Cache   │    │ Blob Storage      │  │
│  │ (Supabase)  │    │ (Upstash)     │    │ (Supabase Storage)│  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Altyapı (Infrastructure)                        │
│                                                                 │
│  ┌─────────────┐    ┌───────────────┐    ┌───────────────────┐  │
│  │ Vercel      │    │ Supabase      │    │ Cloudflare        │  │
│  │ (Hosting)   │    │ (BaaS)        │    │ (DNS, CDN)        │  │
│  └─────────────┘    └───────────────┘    └───────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Teknoloji Yığını

İ-EP.APP projesi aşağıdaki teknolojileri kullanmaktadır:

### Frontend
- **Next.js 14**: React tabanlı full-stack framework, App Router kullanımı
- **TypeScript**: Güvenli tip sistemine sahip JavaScript süper kümesi
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Erişilebilir ve özelleştirilebilir UI komponentleri
- **React Hook Form**: Form yönetimi
- **Zod**: Form doğrulama ve veri validasyonu

### Backend
- **Next.js API Routes**: Backend API endpointleri
- **Supabase**: PostgreSQL tabanlı Backend-as-a-Service (BaaS)
- **PostgreSQL**: İlişkisel veritabanı
- **Redis**: Önbellek ve oturum yönetimi (Upstash üzerinde)

### DevOps
- **Vercel**: Frontend dağıtımı
- **Cloudflare**: DNS yönetimi, CDN ve özel domain desteği
- **GitHub Actions**: CI/CD pipeline
- **Sentry**: Hata izleme ve performans monitörü

## Multi-tenant Mimari Yapısı

İ-EP.APP, hibrit multi-tenant izolasyon yaklaşımını benimsemiştir.

### Tenant Tanımlama ve Erişim

Her tenant (kiracı) şunlara sahiptir:
- Benzersiz bir tanımlayıcı (UUID)
- Alt alan adı (subdomain): `{tenant-subdomain}.i-ep.app`
- Opsiyonel özel alan adı (premium plan): `portal.okuladi.com`

Tenant tanımlaması, domain bazlı yapılmaktadır:

1. İstek geldiğinde domain/subdomain analiz edilir
2. İlgili tenant tespit edilir
3. Tenant bilgileri istek context'ine eklenir
4. Middleware, tenant erişimini doğrular
5. İstek, tenant-specific rotalara yönlendirilir

### Veri İzolasyonu Stratejisi

İ-EP.APP, iki farklı veri izolasyon mekanizmasını birleştiren hibrit bir yaklaşım kullanır:

1. **Şema Bazlı İzolasyon (Birincil)**:
   - Her tenant için PostgreSQL veritabanında ayrı bir şema oluşturulur
   - Tenant-specific veriler kendi şemasında saklanır
   - Güçlü mantıksal izolasyon sağlar

2. **Satır Bazlı İzolasyon (Tamamlayıcı)**:
   - Çapraz tenant analizleri gerektiren veriler için kullanılır
   - PostgreSQL Row Level Security (RLS) ile izolasyon sağlanır
   - Her sorgu, tenant_id ile filtrelenir

### Tenant Yaşam Döngüsü

1. **Oluşturma**:
   - Tenant kaydı oluşturulur
   - Subdomain/domain kaydı yapılır
   - Veritabanı şeması ve tabloları oluşturulur
   - İlk admin kullanıcısı oluşturulur

2. **Yapılandırma**:
   - Tenant ayarları ve özelleştirmeleri yapılır
   - Kullanıcı rolleri ve izinleri belirlenir
   - Özellik bayrakları (feature flags) ayarlanır

3. **İşletim**:
   - Normal kullanım ve işletim süreci
   - Performans ve kaynak kullanımı izlenir
   - Yedekleme ve bakım işlemleri yapılır

4. **Sonlandırma** (gerekirse):
   - Veri dışa aktarılır
   - Tenant kaynakları temizlenir
   - Şema ve kayıtlar silinir

## Önemli Mimari Kararlar

İ-EP.APP için kritik mimari kararlar, ADR (Architecture Decision Records) formatında belgelenmiştir:

- [ADR-0001](../adr/0001-nextjs-14-kullanimi.md): Next.js 14 Kullanımı
- [ADR-0002](../adr/0002-supabase-ve-postgres-kullanimi.md): Supabase ve PostgreSQL Kullanımı
- [ADR-0003](../adr/0003-multi-tenant-mimari-stratejisi.md): Multi-tenant Mimari Stratejisi
- [ADR-0004](../adr/0004-cloudflare-ile-domain-yonetimi.md): Cloudflare ile Domain Yönetimi
- [ADR-0005](../adr/0005-tailwindcss-ve-shadcn-ui-kullanimi.md): TailwindCSS ve Shadcn UI Kullanımı
- [ADR-0006](../adr/0006-react-hook-form-ve-zod-kullanimi.md): React Hook Form ve Zod Kullanımı
- [ADR-0007](../adr/0007-jest-ve-testing-library-kullanimi.md): Jest ve Testing Library Kullanımı

## Proje Dizin Yapısı

```
i-ep.app/
├── app/               # Next.js App Router
│   ├── [tenant]/      # Tenant-specific routes
│   ├── api/           # API routes
│   ├── auth/          # Authentication
│   └── super-admin/   # Super Admin panel
├── components/        # Reusable components
│   ├── ui/            # UI components (shadcn)
│   ├── forms/         # Form components
│   └── tenant/        # Tenant-specific components
├── lib/               # Utility functions
│   ├── supabase/      # Supabase clients
│   ├── tenant/        # Tenant utilities
│   ├── auth/          # Auth utilities
│   └── redis/         # Redis client
├── public/            # Static assets
├── scripts/           # Utility scripts
├── styles/            # Global styles
├── types/             # TypeScript types
├── middleware.ts      # Next.js middleware
└── ...
```

## Güvenlik ve İzolasyon

İ-EP.APP'da güvenlik ve izolasyon, aşağıdaki mekanizmalarla sağlanır:

1. **Domain İzolasyonu**: Her tenant kendi subdomain'i üzerinden erişilir
2. **Veritabanı İzolasyonu**: Şema seviyesinde ve RLS ile izolasyon
3. **API İzolasyonu**: Her API isteği, tenant kimliği doğrulandıktan sonra işlenir
4. **Middleware Koruması**: Cross-tenant erişim denemeleri engellenir
5. **Audit Loglama**: Tüm kritik işlemler kaydedilir ve izlenir

## Veritabanı Şeması

Proje, şema bazlı izolasyon yaklaşımını kullanır. Ana şema türleri:

1. **public**: Tenant kayıtları, kullanıcılar, abonelikler gibi global verileri içerir
2. **tenant_{id}**: Her tenant için özel tablolar içerir (öğrenciler, sınıflar, notlar, vb.)
3. **auth**: Supabase Auth tabloları
4. **storage**: Supabase Storage tabloları

## Ölçeklenebilirlik Stratejisi

İ-EP.APP'ın ölçeklenebilirlik stratejisi:

1. **Yatay Ölçeklendirme**: Stateless API servisleri için kolay ölçeklendirme
2. **Önbellekleme**: Redis ile veri önbellekleme ve performans optimizasyonu
3. **Veritabanı Ölçeklendirme**: Tenant bazlı şema yaklaşımı ile kolay yatay ölçeklendirme
4. **CDN**: Statik varlıklar için Cloudflare CDN kullanımı
5. **Edge Functions**: Bölgesel yakınlık için edge fonksiyonları

## İlgili Dokümanlar

- [Veri İzolasyon Stratejisi](../architecture/data-isolation.md)
- [Multi-tenant Mimarisi](../architecture/multi-tenant-strategy.md)
- [Domain Yönetimi](../domain-management.md)
- [Supabase Kurulumu](../supabase-setup.md)

---

Bu mimari yaklaşım, İ-EP.APP'ın güvenli, ölçeklenebilir ve bakımı kolay bir SaaS uygulaması olarak hizmet vermesini sağlamaktadır. 