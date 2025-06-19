# API Endpoints Dokümantasyonu - Domain Yönetimi

Bu belge, Iqra Eğitim Portalı'nın domain yönetimi API endpointlerini açıklamaktadır.

## Domain Endpoints

Tüm domain endpointleri `/api/domains` altında gruplanmıştır ve kimlik doğrulama gerektirir.

### Domain Listesi

Domain listesini getirir. Yalnızca yöneticiler ve domain yönetimi yetkisi olan kullanıcılar erişebilir.

```
GET /api/domains
```

#### Query Parametreleri

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| tenantId | string | hayır | Belirli bir tenant'a ait domainleri filtreler |
| type | string | hayır | Domain tipine göre filtreler: "subdomain" veya "custom" |
| isVerified | boolean | hayır | Doğrulama durumuna göre filtreler |

#### Yanıt

```json
{
  "success": true,
  "data": [
    {
      "id": "domain-uuid-1",
      "tenant_id": "tenant-uuid-1",
      "domain": "ornek.i-ep.app",
      "is_primary": true,
      "is_verified": true,
      "type": "subdomain",
      "created_at": "2023-07-01T10:30:00Z",
      "verified_at": "2023-07-01T10:35:00Z"
    },
    {
      "id": "domain-uuid-2",
      "tenant_id": "tenant-uuid-1",
      "domain": "ornek.com",
      "is_primary": false,
      "is_verified": false,
      "type": "custom",
      "created_at": "2023-07-05T14:20:00Z",
      "verified_at": null
    }
  ],
  "count": 2
}
```

### Domain Detayları

Belirli bir domain'in detaylarını getirir.

```
GET /api/domains/{domainId}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "id": "domain-uuid-1",
    "tenant_id": "tenant-uuid-1",
    "domain": "ornek.i-ep.app",
    "is_primary": true,
    "is_verified": true,
    "type": "subdomain",
    "created_at": "2023-07-01T10:30:00Z",
    "verified_at": "2023-07-01T10:35:00Z",
    "dns_status": {
      "dnsConfigured": true,
      "sslActive": true,
      "lastChecked": "2023-07-15T08:45:00Z"
    }
  }
}
```

### Subdomain Oluşturma

Yeni bir subdomain oluşturur. Otomatik olarak DNS kaydını yapılandırır ve SSL sertifikası oluşturur.

```
POST /api/domains/subdomain
```

#### İstek Gövdesi

```json
{
  "tenantId": "tenant-uuid-1",
  "subdomain": "ornek"
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "id": "domain-uuid-1",
    "tenant_id": "tenant-uuid-1",
    "domain": "ornek.i-ep.app",
    "is_primary": true,
    "is_verified": true,
    "type": "subdomain",
    "created_at": "2023-07-01T10:30:00Z",
    "verified_at": "2023-07-01T10:35:00Z"
  }
}
```

### Özel Domain Ekleme

Yeni bir özel domain ekler. Doğrulama için DNS yapılandırması gerektirir.

```
POST /api/domains/custom
```

#### İstek Gövdesi

```json
{
  "tenantId": "tenant-uuid-1",
  "domain": "ornek.com",
  "isPrimary": false
}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "id": "domain-uuid-2",
    "tenant_id": "tenant-uuid-1",
    "domain": "ornek.com",
    "is_primary": false,
    "is_verified": false,
    "type": "custom",
    "created_at": "2023-07-05T14:20:00Z",
    "verified_at": null,
    "verification_instructions": {
      "type": "CNAME",
      "host": "ornek.com",
      "value": "i-ep.app",
      "ttl": "3600"
    }
  }
}
```

### Domain Doğrulama

Bir domain'in DNS yapılandırmasını doğrular ve SSL sertifikası oluşturma sürecini başlatır.

```
POST /api/domains/verify/{domainId}
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "verified": true,
    "dnsConfigured": true,
    "sslStatus": "provisioning",
    "message": "Domain başarıyla doğrulandı. SSL sertifikası oluşturuluyor."
  }
}
```

### Domain Silme

Bir domain'i sistemden kaldırır. Primary domain silinemez.

```
DELETE /api/domains/{domainId}
```

#### Yanıt

```json
{
  "success": true,
  "message": "Domain başarıyla silindi"
}
```

### Primary Domain Ayarlama

Bir domain'i tenant için primary olarak ayarlar. Sadece doğrulanmış domainler primary olarak ayarlanabilir.

```
PUT /api/domains/{domainId}/primary
```

#### İstek Gövdesi

```json
{
  "tenantId": "tenant-uuid-1"
}
```

#### Yanıt

```json
{
  "success": true,
  "message": "Domain primary olarak ayarlandı",
  "data": {
    "id": "domain-uuid-2",
    "domain": "ornek.com",
    "is_primary": true
  }
}
```

### SSL Durum Kontrolü

Domain'in SSL durumunu kontrol eder.

```
GET /api/domains/{domainId}/ssl-status
```

#### Yanıt

```json
{
  "success": true,
  "data": {
    "domain": "ornek.com",
    "sslActive": true,
    "issuer": "Cloudflare Inc.",
    "validFrom": "2023-07-05T14:30:00Z",
    "validTo": "2024-07-05T14:30:00Z",
    "status": "active"
  }
}
```

### SSL Yenileme

Domain'in SSL sertifikasını yeniler veya sıfırlar.

```
POST /api/domains/{domainId}/renew-ssl
```

#### Yanıt

```json
{
  "success": true,
  "message": "SSL yenileme işlemi başlatıldı",
  "data": {
    "domain": "ornek.com",
    "status": "processing"
  }
}
```

## Hata Kodları

Domain API'leri aşağıdaki hata kodlarını döndürebilir:

| Hata Kodu | Açıklama |
|-----------|----------|
| domain_not_found | Belirtilen domain bulunamadı |
| subdomain_conflict | Bu subdomain zaten kullanılıyor |
| invalid_domain_format | Geçersiz domain formatı |
| dns_verification_failed | DNS doğrulama başarısız oldu |
| ssl_provision_failed | SSL sertifikası oluşturulamadı |
| primary_domain_required | Her tenant'ın en az bir primary domain'i olmalıdır |
| domain_not_verified | Doğrulanmamış domain primary olarak ayarlanamaz |
| cloudflare_api_error | Cloudflare API ile iletişim hatası |
| permission_denied | Bu işlem için yetkiniz yok |

## Örnek Kullanımlar

### cURL

```bash
# Domain listesi
curl -X GET "https://api.i-ep.app/api/domains" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Subdomain oluşturma
curl -X POST "https://api.i-ep.app/api/domains/subdomain" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "tenant-uuid-1", "subdomain": "ornek"}'

# Domain doğrulama
curl -X POST "https://api.i-ep.app/api/domains/verify/domain-uuid-2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### JavaScript/TypeScript

```typescript
// Domain listesi
const getDomains = async () => {
  const response = await fetch('/api/domains', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Özel domain ekleme
const addCustomDomain = async (tenantId: string, domain: string) => {
  const response = await fetch('/api/domains/custom', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tenantId, domain })
  });
  
  return await response.json();
};
``` 