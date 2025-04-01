# İ-EP.APP Dokümantasyonuna Hoş Geldiniz

İ-EP.APP (Iqra Eğitim Portalı), eğitim kurumları için geliştirilmiş çok kiracılı (multi-tenant) bir SaaS platformudur. Bu dokümantasyon, geliştirici ekibi için kapsamlı bir rehber olarak hazırlanmıştır.

## Nedir İ-EP.APP?

İ-EP.APP, eğitim kurumlarının öğrenci, öğretmen ve veli yönetimini tek bir platformda gerçekleştirebilmelerini sağlayan modern bir eğitim yönetim sistemidir. Her eğitim kurumu (okul, kolej, dershane vb.), sistemde ayrı bir tenant (kiracı) olarak yer alır ve kendi özelleştirilmiş yapılandırmasına sahiptir.

## Dokümantasyon Bölümleri

Bu dokümantasyon aşağıdaki bölümlerden oluşmaktadır:

### Geliştirici Onboarding
- [Geliştirici Onboarding Rehberi](onboarding/README.md)
- [Kurulum Rehberi](onboarding/setup-guide.md)
- [Mimari Özet](onboarding/architecture-overview.md)
- [Kod Standartları](onboarding/code-standards.md)

### API
- [API Endpoints](api/endpoints.md)

### Test
- [Multi-tenant Mimarisi Test Rehberi](testing/multi-tenant-testing.md)

### Komponentler
- [Super Admin Panel](components/super-admin-panel.md)

## Teknik Yığın

İ-EP.APP, modern web geliştirme teknolojilerini kullanmaktadır:

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Veritabanı**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Depolama**: Supabase Storage
- **Dağıtım**: Vercel, Cloudflare

## Başlarken

Projeye katkıda bulunmaya başlamak için [Kurulum Rehberi](onboarding/setup-guide.md) bölümünden devam edebilirsiniz. 