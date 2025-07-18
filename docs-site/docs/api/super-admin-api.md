# Süper Admin API Dokümantasyonu

Bu dokümantasyon, Süper Admin rolüne sahip kullanıcıların kullanabileceği API endpoint'lerini detaylandırır.

## Genel Bilgiler

### Base URL

```
https://api.iqraedu.com/v1
```

### Kimlik Doğrulama

Tüm API istekleri JWT token gerektirmektedir. Token, Authorization header'ında Bearer token olarak gönderilmelidir.

```http
Authorization: Bearer <jwt_token>
```

### Rate Limiting

- Dakikada maksimum 100 istek
- Saatte maksimum 1000 istek
- Günde maksimum 10000 istek

### Hata Kodları

| Kod | Açıklama          |
| --- | ----------------- |
| 400 | Geçersiz istek    |
| 401 | Yetkisiz erişim   |
| 403 | Erişim reddedildi |
| 404 | Kaynak bulunamadı |
| 429 | Rate limit aşıldı |
| 500 | Sunucu hatası     |

## Tenant Yönetimi API'leri

### Tenant Listesi

```http
GET /tenants
```

**Query Parametreleri:**
| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| page | number | Sayfa numarası (varsayılan: 1) |
| limit | number | Sayfa başına kayıt (varsayılan: 10) |
| status | string | Filtreleme için tenant durumu (active/suspended/deleted) |
| search | string | İsim veya domain ile arama |

**Başarılı Yanıt (200):**

```json
{
  "data": [
    {
      "id": "tenant_id",
      "name": "Okul Adı",
      "domain": "okul.iqraedu.com",
      "status": "active",
      "createdAt": "2024-03-20T10:00:00Z",
      "subscription": {
        "plan": "premium",
        "validUntil": "2025-03-20T10:00:00Z"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Tenant Oluşturma

```http
POST /tenants
```

**İstek Gövdesi:**

```json
{
  "name": "Yeni Okul",
  "domain": "yeniokul",
  "plan": "premium",
  "adminUser": {
    "email": "admin@yeniokul.com",
    "firstName": "Admin",
    "lastName": "User"
  }
}
```

**Başarılı Yanıt (201):**

```json
{
  "id": "new_tenant_id",
  "name": "Yeni Okul",
  "domain": "yeniokul.iqraedu.com",
  "status": "active",
  "createdAt": "2024-03-20T10:00:00Z",
  "adminUser": {
    "id": "user_id",
    "email": "admin@yeniokul.com"
  }
}
```

### Tenant Detayları

```http
GET /tenants/{tenant_id}
```

**Başarılı Yanıt (200):**

```json
{
  "id": "tenant_id",
  "name": "Okul Adı",
  "domain": "okul.iqraedu.com",
  "status": "active",
  "createdAt": "2024-03-20T10:00:00Z",
  "subscription": {
    "plan": "premium",
    "validUntil": "2025-03-20T10:00:00Z",
    "features": ["feature1", "feature2"]
  },
  "stats": {
    "totalUsers": 1000,
    "activeUsers": 750,
    "storageUsed": "10GB"
  }
}
```

### Tenant Güncelleme

```http
PATCH /tenants/{tenant_id}
```

**İstek Gövdesi:**

```json
{
  "name": "Güncellenmiş Okul Adı",
  "status": "suspended",
  "subscription": {
    "plan": "enterprise",
    "validUntil": "2026-03-20T10:00:00Z"
  }
}
```

## Domain Yönetimi API'leri

### Domain Doğrulama

```http
POST /tenants/{tenant_id}/domains/verify
```

**İstek Gövdesi:**

```json
{
  "domain": "okul.com"
}
```

**Başarılı Yanıt (200):**

```json
{
  "status": "pending",
  "verificationRecord": {
    "type": "TXT",
    "name": "_iqraedu-verify.okul.com",
    "value": "iqraedu-verify=abc123"
  }
}
```

### SSL Sertifika Durumu

```http
GET /tenants/{tenant_id}/domains/ssl
```

**Başarılı Yanıt (200):**

```json
{
  "status": "active",
  "expiresAt": "2025-03-20T10:00:00Z",
  "issuer": "Let's Encrypt",
  "domains": ["okul.com", "*.okul.com"]
}
```

## Sistem Yönetimi API'leri

### Sistem Metrikleri

```http
GET /system/metrics
```

**Query Parametreleri:**
| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| from | string | Başlangıç tarihi (ISO 8601) |
| to | string | Bitiş tarihi (ISO 8601) |
| metrics | string[] | İstenen metrikler |

**Başarılı Yanıt (200):**

```json
{
  "timeRange": {
    "from": "2024-03-01T00:00:00Z",
    "to": "2024-03-20T23:59:59Z"
  },
  "metrics": {
    "totalActiveUsers": {
      "current": 10000,
      "change": "+5%"
    },
    "averageResponseTime": {
      "value": "120ms",
      "threshold": "200ms"
    },
    "errorRate": {
      "value": "0.1%",
      "threshold": "1%"
    }
  }
}
```

### Sistem Durumu

```http
GET /system/health
```

**Başarılı Yanıt (200):**

```json
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "healthy",
      "latency": "5ms"
    },
    "cache": {
      "status": "healthy",
      "latency": "2ms"
    },
    "storage": {
      "status": "healthy",
      "latency": "10ms"
    }
  }
}
```

## Yedekleme ve Geri Yükleme API'leri

### Yedekleme Başlatma

```http
POST /tenants/{tenant_id}/backups
```

**İstek Gövdesi:**

```json
{
  "type": "full",
  "description": "Manuel yedekleme"
}
```

**Başarılı Yanıt (202):**

```json
{
  "id": "backup_id",
  "status": "in_progress",
  "estimatedCompletionTime": "2024-03-20T10:30:00Z"
}
```

### Yedekleme Durumu

```http
GET /tenants/{tenant_id}/backups/{backup_id}
```

**Başarılı Yanıt (200):**

```json
{
  "id": "backup_id",
  "status": "completed",
  "type": "full",
  "startedAt": "2024-03-20T10:00:00Z",
  "completedAt": "2024-03-20T10:15:00Z",
  "size": "2.5GB",
  "downloadUrl": "https://storage.iqraedu.com/backups/backup_id"
}
```

## Güvenlik ve Denetim API'leri

### Denetim Logları

```http
GET /audit-logs
```

**Query Parametreleri:**
| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| from | string | Başlangıç tarihi |
| to | string | Bitiş tarihi |
| type | string | Log tipi |
| tenant | string | Tenant ID |

**Başarılı Yanıt (200):**

```json
{
  "logs": [
    {
      "id": "log_id",
      "timestamp": "2024-03-20T10:00:00Z",
      "type": "tenant_create",
      "actor": {
        "id": "user_id",
        "email": "admin@iqraedu.com"
      },
      "details": {
        "tenantId": "tenant_id",
        "action": "create",
        "changes": {}
      }
    }
  ],
  "pagination": {
    "total": 1000,
    "page": 1,
    "limit": 10
  }
}
```

## Webhook'lar

Sistem olaylarını dinlemek için webhook'lar kullanılabilir.

### Webhook Kaydetme

```http
POST /webhooks
```

**İstek Gövdesi:**

```json
{
  "url": "https://example.com/webhook",
  "events": ["tenant.created", "tenant.updated", "backup.completed"],
  "secret": "webhook_secret"
}
```

**Başarılı Yanıt (201):**

```json
{
  "id": "webhook_id",
  "url": "https://example.com/webhook",
  "events": ["tenant.created", "tenant.updated", "backup.completed"],
  "status": "active"
}
```

## Webhook Event Örnekleri

### Tenant Oluşturuldu

```json
{
  "event": "tenant.created",
  "timestamp": "2024-03-20T10:00:00Z",
  "data": {
    "tenantId": "tenant_id",
    "name": "Yeni Okul",
    "domain": "yeniokul.iqraedu.com"
  }
}
```

### Yedekleme Tamamlandı

```json
{
  "event": "backup.completed",
  "timestamp": "2024-03-20T10:15:00Z",
  "data": {
    "backupId": "backup_id",
    "tenantId": "tenant_id",
    "size": "2.5GB",
    "type": "full"
  }
}
```
