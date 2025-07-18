# Backend Kurulum ve Entegrasyon Rehberi

Bu rehber, Iqra Eğitim Portalı için backend altyapısının kurulumu ve yapılandırılması sürecini adım adım açıklamaktadır. Sistemimiz temel olarak Supabase, Cloudflare ve Vercel üzerine kurulmuştur.

## İçerik

1. [Genel Bakış](#genel-bakış)
2. [Ön Gereksinimler](#ön-gereksinimler)
3. [Supabase Kurulumu](#supabase-kurulumu)
4. [Cloudflare Entegrasyonu](#cloudflare-entegrasyonu)
5. [Vercel Dağıtımı](#vercel-dağıtımı)
6. [Ortam Değişkenleri](#ortam-değişkenleri)
7. [Multi-Tenant Veri Yapısı](#multi-tenant-veri-yapısı)
8. [İzleme ve Logging](#i̇zleme-ve-logging)
9. [Sorun Giderme](#sorun-giderme)
10. [İlgili Belgeler](#i̇lgili-belgeler)

## Genel Bakış

Iqra Eğitim Portalı'nın backend altyapısı şu temel bileşenlerden oluşur:

- **Veritabanı ve Kimlik Doğrulama**: [Supabase](https://supabase.io/) (PostgreSQL)
- **DNS ve CDN**: [Cloudflare](https://cloudflare.com/)
- **Frontend Dağıtımı**: [Vercel](https://vercel.com/)
- **Backend Servisler**: [AWS/ECS](https://aws.amazon.com/ecs/)

Bu yapı, çok kiracılı (multi-tenant) bir SaaS uygulaması için güvenli, ölçeklenebilir ve maliyet-etkin bir çözüm sunar.

## Ön Gereksinimler

Backend kurulumu için aşağıdaki araçlara ve hesaplara ihtiyacınız vardır:

- [Node.js](https://nodejs.org/) 18.x veya üzeri
- [Git](https://git-scm.com/)
- [Supabase](https://supabase.io/) hesabı
- [Cloudflare](https://cloudflare.com/) hesabı
- [Vercel](https://vercel.com/) hesabı
- [AWS](https://aws.amazon.com/) hesabı (isteğe bağlı)

## Supabase Kurulumu

Supabase, PostgreSQL tabanlı açık kaynaklı bir Backend-as-a-Service (BaaS) çözümüdür. Auth, realtime subscriptions, storage gibi özellikler sunar.

### 1. Proje Oluşturma

1. [Supabase Dashboard](https://app.supabase.io/)'a giriş yapın
2. "New Project" tıklayın
3. Projenize bir isim verin (örn. `i-ep-app-{ortam}` şeklinde)
4. Bölge olarak `eu-central-1` (Frankfurt) veya müşterilerinize en yakın bölgeyi seçin
5. Güçlü bir veritabanı şifresi belirleyin
6. "Create new project" butonuna tıklayın

### 2. Veritabanı Şeması

Supabase projeniz oluşturulduktan sonra, veritabanı şemasını oluşturun:

1. Supabase Dashboard'da "SQL Editor" sekmesine gidin
2. Aşağıdaki SQL sorgusunu çalıştırın (temel şema oluşturma):

```sql
-- Temel tenant tablosu
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  custom_domain TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::jsonb
);

-- Tenant bazlı erişim kontrolü için RLS politikası
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Tenant oluşturma fonksiyonu (schema per tenant)
CREATE OR REPLACE FUNCTION public.create_tenant_schema(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS tenant_%s', tenant_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant bağlamını ayarlama fonksiyonu
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Kimlik Doğrulama Ayarları

1. Supabase Dashboard'da "Authentication" sekmesine gidin
2. "Settings" alt sekmesinde:
   - Email doğrulama gereksinimlerini ayarlayın
   - Oturum süresi ve token sürelerini yapılandırın
3. "Email Templates" bölümünde e-posta şablonlarını Türkçe'ye uyarlayın

### 4. Storage Buckets

1. Supabase Dashboard'da "Storage" sekmesine gidin
2. Aşağıdaki bucketları oluşturun:
   - `public` - Genel erişime açık dosyalar için (örn. avatar resimleri)
   - `tenant-assets` - Tenant bazlı dosyalar için
   - `secure-files` - Yalnızca yetkili kullanıcılar tarafından erişilebilen dosyalar için

Her bucket için uygun RLS politikalarını tanımlayın.

### 5. API Anahtarları ve URL'ler

Supabase projenizden aşağıdaki bilgileri not edin:

- Project URL
- API Key (anon/public)
- API Key (service_role)

Bu bilgiler, uygulamanızın ortam değişkenlerinde kullanılacaktır.

## Cloudflare Entegrasyonu

Cloudflare, DNS yönetimi, CDN ve güvenlik hizmetleri için kullanılır.

### 1. Alan Adı Kaydı

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)'a giriş yapın
2. "Add site" tıklayın ve ana alan adınızı ekleyin (örn. `i-ep.app`)
3. DNS kayıtlarını Cloudflare'e aktarın
4. SSL/TLS ayarı olarak "Full" veya "Full (strict)" seçin

### 2. DNS Kayıtları

Ana domain ve subdomain'ler için gerekli DNS kayıtlarını oluşturun:

1. Cloudflare Dashboard'da sitenizi seçin
2. "DNS" sekmesine gidin
3. Aşağıdaki kayıtları ekleyin:
   - `A` kaydı: `@` → Vercel IP adresi
   - `CNAME` kaydı: `www` → `cname.vercel-dns.com.`
   - `CNAME` kaydı: `*.i-ep.app` → `cname.vercel-dns.com.`

### 3. API Token Oluşturma

1. Cloudflare Dashboard'da "Profile" > "API Tokens" seçin
2. "Create Token" tıklayın
3. "Edit zone DNS" template'i seçin
4. İzinleri yapılandırın:
   - Zone - DNS - Edit
   - Zone - Zone - Read
5. Zone Resources'ı sitenize sınırlayın
6. Token'ı oluşturun ve kaydedin

Bu API token, tenant'lar için otomatik subdomain oluşturmak için kullanılacaktır.

## Vercel Dağıtımı

Vercel, Next.js uygulamaları için tercih edilen bir dağıtım platformudur.

### 1. Vercel Projesi Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a giriş yapın
2. "New Project" tıklayın
3. GitHub repo'nuzu içe aktarın
4. Proje ayarlarını yapılandırın:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Ortam Değişkenleri

Vercel projenize aşağıdaki ortam değişkenlerini ekleyin:

- `NEXT_PUBLIC_SUPABASE_URL` = Supabase Proje URL'iniz
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anonim API anahtarı
- `SUPABASE_SERVICE_ROLE_KEY` = Supabase service role API anahtarı
- `CLOUDFLARE_API_TOKEN` = Cloudflare API token'ı
- `CLOUDFLARE_ZONE_ID` = Cloudflare zone ID'si
- `CLOUDFLARE_ACCOUNT_ID` = Cloudflare hesap ID'si

### 3. Dağıtım Ayarları

1. Vercel Dashboard'da projenizi seçin
2. "Settings" > "Git" kısmından otomatik dağıtım ayarlarını yapılandırın:
   - Production Branch: `main`
   - Preview Branches: `develop`, `feature/*`

## Ortam Değişkenleri

Uygulama için gerekli tüm ortam değişkenlerinin listesi:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_ZONE_ID=your-cloudflare-zone-id
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id

# Vercel
VERCEL_URL=your-vercel-url

# Uygulama
NODE_ENV=development
APP_URL=http://localhost:3000
PRIMARY_DOMAIN=i-ep.app
```

### Ortam Değişkenlerini Yönetme

Farklı ortamlar için (geliştirme, test, üretim) ayrı ortam değişkenleri dosyaları oluşturun:

- `.env.local` - Yerel geliştirme
- `.env.test` - Test ortamı
- `.env.production` - Üretim ortamı

## Multi-Tenant Veri Yapısı

Sistemimiz, "schema per tenant" yaklaşımını kullanarak, her okul için ayrı bir PostgreSQL şeması oluşturur.

### Tenant İzolasyonu

Her tenant için ayrı bir şema oluşturulması, verilerin güvenli bir şekilde izole edilmesini sağlar:

```
public        - Paylaşılan tablolar ve fonksiyonlar
tenant_[uuid] - Tenant özgü veriler
```

### Tenant Bağlamını Ayarlama

Tenant verilerine erişirken, mevcut tenant bağlamını ayarlamak için `set_tenant_context` fonksiyonu kullanılır:

```typescript
// Tenant bağlamını ayarla
await supabase.rpc('set_tenant_context', { tenant_id: tenantId });

// Artık tenant şemasındaki tablolara erişebilirsiniz
const { data, error } = await supabase.from('students').select('*');
```

## İzleme ve Logging

### Sentry Entegrasyonu

1. [Sentry](https://sentry.io/) hesabı oluşturun
2. Yeni bir proje oluşturun
3. Sentry SDK'yı projenize entegre edin:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

### Veritabanı Performans İzleme

Supabase Dashboard'ındaki PostgreSQL insights ile veritabanı performansını izleyin.

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

1. **Supabase bağlantı hatası**:
   - API anahtarlarını ve URL'yi kontrol edin
   - Ağ güvenlik duvarı ayarlarını kontrol edin
   - Supabase proje durumunu doğrulayın

2. **Cloudflare DNS sorunları**:
   - DNS önbelleğinin temizlenmesi için 48 saat bekleyin
   - DNS kayıtlarını doğrulayın
   - Cloudflare'in "Development Mode" özelliğini kullanın

3. **Vercel dağıtım hataları**:
   - Derleme günlüklerini inceleyin
   - Ortam değişkenlerini kontrol edin
   - `next.config.js` dosyasında dağıtım için uygun ayarlar olduğundan emin olun

## İlgili Belgeler

- [Veri İzolasyon Stratejisi](../architecture/data-isolation.md)
- [Multi-Tenant Stratejisi](../architecture/multi-tenant-strategy.md)
- [Teknoloji Yığını](../architecture/tech-stack.md)
- [CI/CD Pipeline](./ci-cd-pipeline.md)
- [Yedekleme ve Geri Yükleme](./backup-restore.md)
- [Felaketten Kurtarma Planı](./disaster-recovery.md)
