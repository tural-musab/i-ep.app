# Webhook API

Super Admin panelinde webhook yönetimi için kullanılan API endpoint'leri.

## Base URL

```
/api/super-admin/webhooks
```

## Endpoints

### Webhook Listesi

```http
GET /api/super-admin/webhooks
```

Sistemdeki tüm webhook'ları listeler.

#### Query Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| page | number | Sayfa numarası |
| pageSize | number | Sayfa başına kayıt sayısı |
| sort | string | Sıralama alanı ve yönü (örn: `createdAt:desc`) |
| search | string | Arama terimi |
| status | string[] | Durum filtreleri |
| events | string[] | Event filtreleri |

#### Response

```typescript
interface WebhookListResponse {
  data: WebhookData[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: WebhookStatus;
  createdAt: string;
  updatedAt: string;
}
```

### Webhook Oluşturma

```http
POST /api/super-admin/webhooks
```

Yeni bir webhook oluşturur.

#### Request Body

```typescript
interface CreateWebhookRequest {
  name: string;
  description?: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  events: string[];
  headers?: Record<string, string>;
  security: {
    type: 'none' | 'basic' | 'bearer' | 'hmac';
    username?: string;
    password?: string;
    token?: string;
    secret?: string;
  };
  retry: {
    enabled: boolean;
    maxAttempts?: number;
    backoff?: {
      type: 'fixed' | 'exponential';
      interval: number;
    };
  };
  filters?: {
    condition: 'and' | 'or';
    rules: FilterRule[];
  };
  transform?: {
    template: string;
    contentType: string;
  };
}
```

#### Response

```typescript
interface CreateWebhookResponse {
  id: string;
  name: string;
  url: string;
  events: string[];
  createdAt: string;
}
```

### Webhook Detayı

```http
GET /api/super-admin/webhooks/:id
```

Belirli bir webhook'un detaylarını getirir.

#### Response

```typescript
interface WebhookDetailResponse {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: string;
  events: string[];
  headers: Record<string, string>;
  security: {
    type: string;
    username?: string;
    token?: string;
  };
  retry: {
    enabled: boolean;
    maxAttempts: number;
    backoff: {
      type: string;
      interval: number;
    };
  };
  filters: {
    condition: string;
    rules: FilterRule[];
  };
  transform: {
    template: string;
    contentType: string;
  };
  status: WebhookStatus;
  stats: {
    total: number;
    success: number;
    failed: number;
    lastDelivery?: {
      timestamp: string;
      status: string;
      statusCode: number;
      duration: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

### Webhook Güncelleme

```http
PATCH /api/super-admin/webhooks/:id
```

Belirli bir webhook'u günceller.

#### Request Body

```typescript
interface UpdateWebhookRequest {
  name?: string;
  description?: string;
  url?: string;
  method?: string;
  events?: string[];
  headers?: Record<string, string>;
  security?: {
    type: string;
    username?: string;
    password?: string;
    token?: string;
    secret?: string;
  };
  retry?: {
    enabled: boolean;
    maxAttempts?: number;
    backoff?: {
      type: string;
      interval: number;
    };
  };
  filters?: {
    condition: string;
    rules: FilterRule[];
  };
  transform?: {
    template: string;
    contentType: string;
  };
}
```

#### Response

```typescript
interface UpdateWebhookResponse {
  id: string;
  name: string;
  url: string;
  updatedAt: string;
}
```

### Webhook Silme

```http
DELETE /api/super-admin/webhooks/:id
```

Belirli bir webhook'u siler.

#### Response

```typescript
interface DeleteWebhookResponse {
  id: string;
  deleted: boolean;
}
```

### Webhook Test

```http
POST /api/super-admin/webhooks/:id/test
```

Belirli bir webhook'u test eder.

#### Request Body

```typescript
interface TestWebhookRequest {
  event?: string;
  payload?: Record<string, any>;
}
```

#### Response

```typescript
interface TestWebhookResponse {
  success: boolean;
  duration: number;
  statusCode?: number;
  response?: any;
  error?: {
    code: string;
    message: string;
  };
}
```

### Webhook İstatistikleri

```http
GET /api/super-admin/webhooks/:id/stats
```

Belirli bir webhook'un istatistiklerini getirir.

#### Query Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| start | string | Başlangıç tarihi |
| end | string | Bitiş tarihi |
| interval | string | Zaman aralığı (1h, 1d, 1w, 1m) |

#### Response

```typescript
interface WebhookStatsResponse {
  period: {
    start: string;
    end: string;
    interval: string;
  };
  metrics: {
    deliveryCount: number;
    successRate: number;
    averageDuration: number;
    errorRates: Record<string, number>;
    statusCodes: Record<string, number>;
  };
  trends: {
    successRate: Point[];
    duration: Point[];
    volume: Point[];
  };
}

interface Point {
  timestamp: string;
  value: number;
}
```

### Webhook Teslimat Geçmişi

```http
GET /api/super-admin/webhooks/:id/deliveries
```

Belirli bir webhook'un teslimat geçmişini getirir.

#### Query Parameters

| Parametre | Tip | Açıklama |
|-----------|-----|----------|
| page | number | Sayfa numarası |
| pageSize | number | Sayfa başına kayıt sayısı |
| status | string | Durum filtresi |
| event | string | Event filtresi |

#### Response

```typescript
interface WebhookDeliveriesResponse {
  data: DeliveryRecord[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface DeliveryRecord {
  id: string;
  timestamp: string;
  event: string;
  status: 'success' | 'failed';
  statusCode?: number;
  duration: number;
  requestSize: number;
  responseSize?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Webhook Event Listesi

```http
GET /api/super-admin/webhooks/events
```

Kullanılabilir webhook event'lerini listeler.

#### Response

```typescript
interface WebhookEventsResponse {
  events: WebhookEvent[];
}

interface WebhookEvent {
  id: string;
  name: string;
  description: string;
  category: string;
  payload: Record<string, any>;
}
```

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek |
| 401 | Yetkilendirme hatası |
| 403 | Erişim engellendi |
| 404 | Webhook bulunamadı |
| 409 | URL çakışması |
| 422 | Doğrulama hatası |
| 429 | Çok fazla istek |
| 500 | Sunucu hatası |

## Örnek İstekler

### Webhook Listesi

```bash
curl -X GET \
  'https://api.example.com/api/super-admin/webhooks?page=1&pageSize=10' \
  -H 'Authorization: Bearer {token}'
```

### Webhook Oluşturma

```bash
curl -X POST \
  'https://api.example.com/api/super-admin/webhooks' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Yeni Webhook",
    "url": "https://example.com/webhook",
    "method": "POST",
    "events": ["user.created"],
    "security": {
      "type": "bearer",
      "token": "secret-token"
    }
  }'
```

### Webhook Test

```bash
curl -X POST \
  'https://api.example.com/api/super-admin/webhooks/123/test' \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "event": "user.created",
    "payload": {
      "id": "123",
      "email": "test@example.com"
    }
  }'
```

## Best Practices

1. Rate limiting uygula
2. İstekleri doğrula
3. Güvenlik kontrollerini yap
4. Hata mesajlarını standartlaştır
5. API versiyonlamasını destekle
6. Önbelleğe alma stratejisi belirle
7. İstek boyutlarını sınırla
8. Yanıt sürelerini optimize et
9. Loglama mekanizması ekle
10. Dokümantasyonu güncel tut 