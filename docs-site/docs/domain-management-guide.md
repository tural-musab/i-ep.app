# Domain Yönetimi ve SSL Sertifikası Rehberi

Bu teknik rehber, İ-EP.APP çok kiracılı (multi-tenant) platformunda domain yönetimi ve SSL sertifikaları için geliştiricilere yönelik kapsamlı bilgiler içerir.

## İçerik

- [Mimari Genel Bakış](#mimari-genel-bakış)
- [Domain Tipleri](#domain-tipleri)
- [Cloudflare Entegrasyonu](#cloudflare-entegrasyonu)
- [SSL Sertifikaları](#ssl-sertifikaları)
- [Teknik Yapılandırma](#teknik-yapılandırma)
- [API Endpoint'leri](#api-endpointleri)
- [Sorun Giderme](#sorun-giderme)
- [CLI Araçları](#cli-araçları)

## Mimari Genel Bakış

İ-EP.APP platformu, çok kiracılı mimarisi için dinamik subdomain ve özel domain yönetimini kullanır. Bu yapı şunları sağlar:

- Tenant izolasyonu ve güvenliği
- Marka özelleştirme imkanı
- Ölçeklenebilir hosting altyapısı
- Otomatik SSL sertifika yönetimi

İ-EP.APP uygulamasının temel domain yönetim mimarisi şu şekildedir:

```
                  +---------------+
                  |   Cloudflare  |
                  | (DNS & SSL)   |
                  +-------+-------+
                          |
                          v
+------------+    +-------+-------+
| Custom     +--->+               |
| Domains    |    |   İ-EP.APP    |
+------------+    |   Platform    |
                  |               |
+------------+    |  (Next.js +   |
| Subdomains +--->+   Supabase)   |
+------------+    |               |
                  +---------------+
```

## Domain Tipleri

### Subdomain (\*.i-ep.app)

- Otomatik yapılandırılan ve hızlıca oluşturulan alt alan adları
- Format: `{tenant-name}.i-ep.app`
- Her tenant için otomatik olarak oluşturulur
- SSL sertifikaları otomatik olarak sağlanır

### Özel Domain (CNAME ile)

- Müşterinin kendi domain adını kullanmasına olanak tanır
- CNAME kaydı ile İ-EP.APP'ye yönlendirilir
- Doğrulama ve SSL otomatik olarak yapılandırılır
- Premium tenantlar için önerilir

## Cloudflare Entegrasyonu

İ-EP.APP, tüm DNS yönetimi ve SSL sertifikaları için Cloudflare API'lerini kullanır:

### Kullanılan Cloudflare Servisleri

1. **Cloudflare DNS**: Tüm domain ve subdomain yönetimi
2. **Cloudflare SSL**: Otomatik SSL sertifika sağlama
3. **Cloudflare Workers**: Tenant-spesifik yönlendirme mantığı
4. **Cloudflare Page Rules**: Özel domain yönlendirmeleri ve cache politikaları

### Cloudflare API İşlemleri

- Zone Oluşturma ve Yönetme
- DNS Kayıt Yönetimi
- SSL Doğrulama ve Sertifika Yönetimi
- Önbellek Yapılandırması

## SSL Sertifikaları

İ-EP.APP, tüm domain ve subdomainler için otomatik olarak SSL sertifikaları sağlar:

### SSL Sağlama Süreci

1. Domain kaydı oluşturulur (subdomain veya özel domain)
2. DNS doğrulaması yapılır
3. Cloudflare aracılığıyla SSL sertifikası istenir
4. Sertifika doğrulandıktan sonra otomatik olarak yenilenir (90 günlük döngü)

### SSL Modları

- **Full SSL**: Varsayılan mod, client-to-Cloudflare ve Cloudflare-to-origin arasında güvenli bağlantı
- **Full (Strict)**: Origin sunucusunun geçerli bir SSL sertifikasına sahip olmasını gerektirir
- **Flexible SSL**: Sadece client-to-Cloudflare bağlantısı şifrelenirken kullanılır (önerilmez)

## Teknik Yapılandırma

### DNS Yapılandırması

**Subdomain Yapılandırması**:

```
{tenant-name}.i-ep.app   CNAME   i-ep.app
```

**Özel Domain Yapılandırması**:

```
example.com              CNAME   i-ep.app
*.example.com           CNAME   i-ep.app (wildcard için)
```

### Next.js Yapılandırması

Next.js yapılandırması, dinamik tenant ayrımını destekler:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<tenant>.*)\\.i-ep\\.app',
          },
        ],
        destination: '/:tenant/:path*',
      },
      // Özel domainler için
      {
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-host',
            value: '(?<customDomain>.*)',
          },
        ],
        destination: '/api/resolve-domain?domain=:customDomain&path=:path*',
      },
    ];
  },
};
```

### Supabase Tenant İzolasyonu

Domain bazlı tenant izolasyonu için Supabase yapılandırması:

```sql
-- Tenant ve domain ilişkisi için tablo
CREATE TABLE public.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  ssl_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Domain bazlı erişim kontrolü için RLS politikaları
CREATE POLICY tenant_isolation_policy
  ON schema_name.table_name
  USING (tenant_id = (SELECT tenant_id FROM public.domains
                     WHERE domain = current_setting('request.headers')::json->>'host'));
```

## API Endpoint'leri

### Domain Yönetim API'leri

| Endpoint                       | Metod  | Açıklama                             |
| ------------------------------ | ------ | ------------------------------------ |
| `/api/domains`                 | GET    | Tenant'a ait tüm domainleri listeler |
| `/api/domains`                 | POST   | Yeni domain ekler                    |
| `/api/domains/:id`             | GET    | Domain detaylarını getirir           |
| `/api/domains/:id`             | PATCH  | Domain bilgilerini günceller         |
| `/api/domains/:id`             | DELETE | Domain'i siler                       |
| `/api/domains/:id/verify`      | POST   | Domain doğrulamasını başlatır        |
| `/api/domains/:id/set-primary` | POST   | Domain'i primary olarak ayarlar      |
| `/api/domains/:id/renew-ssl`   | POST   | SSL sertifikasını yeniler            |

### API Kullanım Örnekleri

**Yeni Domain Ekleme**:

```javascript
// Örnek istek
const response = await fetch('/api/domains', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    domain: 'example.com',
    tenantId: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab'
  })
});

// Örnek yanıt
{
  "id": "d1e2f3a4-b5c6-7890-abcd-1234567890ab",
  "domain": "example.com",
  "tenantId": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
  "isPrimary": false,
  "isVerified": false,
  "sslStatus": "pending",
  "verificationInstructions": {
    "type": "CNAME",
    "name": "example.com",
    "value": "i-ep.app"
  }
}
```

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### Domain Doğrulama Hatası

**Sorun**: Domain doğrulama işlemi başarısız oluyor.

**Çözüm**:

```bash
# DNS kayıtlarını kontrol et
dig CNAME example.com

# Doğrulama durumunu kontrol et
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/ssl/verification" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"

# Manuel olarak doğrulamayı yeniden başlat
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/ssl/verification" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"
```

#### SSL Sertifika Sorunları

**Sorun**: SSL sertifikası oluşturulmuyor veya hatalar alınıyor.

**Çözüm**:

```bash
# SSL durumunu kontrol et
curl -X GET "https://api.cloudflare.com/client/v4/zones/{zone_id}/ssl/certificate_packs" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json"

# SSL yapılandırmasını yeniden başlat
curl -X PATCH "https://api.cloudflare.com/client/v4/zones/{zone_id}/settings/ssl" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data '{"value":"full"}'
```

## CLI Araçları

İ-EP.APP, domain yönetimi için çeşitli CLI araçları sunar:

### Domain Yönetim Komutları

```bash
# Yeni subdomain oluşturma
i-ep-cli domain:create-subdomain <tenant-name>

# Özel domain ekleme
i-ep-cli domain:add-custom <tenant-id> <domain-name>

# Domain doğrulama durumunu kontrol etme
i-ep-cli domain:check-verification <domain-id>

# SSL durumunu kontrol etme
i-ep-cli domain:check-ssl <domain-id>

# Tüm domainleri listeleme
i-ep-cli domain:list --tenant=<tenant-id>

# Domain silme
i-ep-cli domain:delete <domain-id> --force
```

### İleri Düzey CLI Seçenekleri

```bash
# Toplu domain ekleme (CSV'den)
i-ep-cli domain:bulk-import --file=domains.csv

# SSL sertifikalarını zorla yenileme
i-ep-cli domain:renew-all-ssl --tenant=<tenant-id>

# DNS kayıtlarını senkronize et
i-ep-cli domain:sync-dns --tenant=<tenant-id>
```

## Yardımcı Kaynaklar

- [Cloudflare API Dokümantasyonu](https://developers.cloudflare.com/api/)
- [Let's Encrypt Dokümantasyonu](https://letsencrypt.org/docs/)
- [Next.js Rewrites ve Headers Rehberi](https://nextjs.org/docs/api-reference/next.config.js/rewrites)
- [Multi-tenant Mimari En İyi Uygulamaları](/docs/architecture/multi-tenant-best-practices.md)
