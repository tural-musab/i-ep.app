# API Endpoints Dokümantasyonu

Bu doküman, İ-EP.APP projesindeki tüm API endpointlerini, parametrelerini ve dönüş değerlerini detaylı olarak açıklamaktadır. Bu API, multi-tenant mimari için tasarlanmış olup, tüm istekler tenant bağlamında değerlendirilir.

## Genel Bilgiler

### Temel URL

```
https://{tenant-subdomain}.i-ep.app/api
```

veya özel domain kullanıyorsanız:

```
https://{tenant-custom-domain}/api
```

### Kimlik Doğrulama

Tüm API istekleri için JWT token tabanlı kimlik doğrulama kullanılır. Token, kimlik doğrulama işleminden sonra alınır ve tüm isteklerin `Authorization` başlığında `Bearer` token olarak gönderilmelidir.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Hata Yanıtları

API, aşağıdaki hata kodlarını döndürebilir:

| Kod | Açıklama |
|-----|----------|
| 400 | İstek hatası (Bad Request). İstek formatı veya parametreleri hatalı. |
| 401 | Kimlik doğrulama hatası (Unauthorized). Geçersiz veya eksik token. |
| 403 | Yetkilendirme hatası (Forbidden). Yeterli izin yok. |
| 404 | Kaynak bulunamadı (Not Found). |
| 409 | Çakışma (Conflict). Örneğin, aynı e-posta ile kayıtlı kullanıcı. |
| 422 | İşlenemeyen varlık (Unprocessable Entity). Doğrulama hataları. |
| 429 | Çok fazla istek (Too Many Requests). Rate limit aşıldı. |
| 500 | Sunucu hatası (Internal Server Error). |
| 503 | Servis kullanılamıyor (Service Unavailable). |

Hata yanıtları şu formatta döndürülür:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata açıklaması",
    "details": { /* Varsa ek hata detayları */ }
  }
}
```

### Veri Doğrulama

Tüm istek gövdeleri (request body) Zod şemaları kullanılarak doğrulanır. Doğrulama hataları 422 durum kodu ile şu formatta döndürülür:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Veri doğrulama hatası",
    "details": {
      "fieldErrors": {
        "email": ["Geçerli bir e-posta adresi girilmelidir"],
        "password": ["Şifre en az 8 karakter olmalıdır"]
      }
    }
  }
}
```

## Auth API

### Kullanıcı Girişi

```
POST /api/auth/login
```

**İstek (Request):**

```json
{
  "email": "kullanici@test-okul-1.com",
  "password": "guclu-sifre-123"
}
```

**Yanıt (Response):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "kullanici@test-okul-1.com",
    "name": "Test Kullanıcı",
    "role": "admin",
    "tenantId": "123e4567-e89b-12d3-a456-426614174999"
  }
}
```

### Kullanıcı Kaydı

```
POST /api/auth/register
```

**İstek (Request):**

```json
{
  "email": "yeni.kullanici@test-okul-1.com",
  "password": "guclu-sifre-123",
  "name": "Yeni Kullanıcı",
  "role": "teacher"
}
```

**Yanıt (Response):**

```json
{
  "success": true,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "email": "yeni.kullanici@test-okul-1.com",
    "name": "Yeni Kullanıcı",
    "role": "teacher",
    "tenantId": "123e4567-e89b-12d3-a456-426614174999"
  }
}
```

### Şifre Sıfırlama Talebi

```
POST /api/auth/forgot-password
```

**İstek (Request):**

```json
{
  "email": "kullanici@test-okul-1.com"
}
```

**Yanıt (Response):**

```json
{
  "success": true,
  "message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi."
}
```

### Şifre Sıfırlama

```
POST /api/auth/reset-password
```

**İstek (Request):**

```json
{
  "token": "1234567890abcdef1234567890abcdef",
  "password": "yeni-guclu-sifre-456"
}
```

**Yanıt (Response):**

```json
{
  "success": true,
  "message": "Şifreniz başarıyla değiştirildi."
}
```

## Tenant API

### Tenant Bilgilerini Alma

```
GET /api/tenant
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174999",
  "name": "Test Okul 1",
  "subdomain": "test-okul-1",
  "customDomain": "okul.example.com",
  "status": "active",
  "createdAt": "2023-10-15T14:30:00Z",
  "features": ["student_management", "teacher_management", "class_management"],
  "config": {
    "theme": {
      "primaryColor": "#1a237e",
      "secondaryColor": "#0288d1",
      "logo": "https://storage.example.com/logos/test-okul-1-logo.png"
    }
  }
}
```

### Tenant Yapılandırmasını Güncelleme

```
PATCH /api/tenant/config
```

**İstek (Request):**

```json
{
  "config": {
    "theme": {
      "primaryColor": "#2e7d32",
      "secondaryColor": "#43a047"
    }
  }
}
```

**Yanıt (Response):**

```json
{
  "success": true,
  "tenant": {
    "id": "123e4567-e89b-12d3-a456-426614174999",
    "name": "Test Okul 1",
    "config": {
      "theme": {
        "primaryColor": "#2e7d32",
        "secondaryColor": "#43a047",
        "logo": "https://storage.example.com/logos/test-okul-1-logo.png"
      }
    }
  }
}
```

## Kullanıcı API

### Kullanıcı Listesi

```
GET /api/users
```

**Sorgu Parametreleri:**

| Parametre | Açıklama | Varsayılan | Örnek |
|-----------|----------|------------|-------|
| page | Sayfa numarası | 1 | `?page=2` |
| limit | Sayfa başına öğe sayısı | 10 | `?limit=20` |
| role | Rol filtresi | - | `?role=teacher` |
| search | İsim veya e-posta araması | - | `?search=ahmet` |

**Yanıt (Response):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "admin@test-okul-1.com",
      "name": "Admin Kullanıcı",
      "role": "admin",
      "createdAt": "2023-01-15T10:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "email": "ogretmen@test-okul-1.com",
      "name": "Test Öğretmen",
      "role": "teacher",
      "createdAt": "2023-02-20T14:30:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### Kullanıcı Detayı

```
GET /api/users/{userId}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "admin@test-okul-1.com",
  "name": "Admin Kullanıcı",
  "role": "admin",
  "phoneNumber": "+90 555 123 4567",
  "profilePicture": "https://storage.example.com/profiles/user-123.jpg",
  "createdAt": "2023-01-15T10:00:00Z",
  "updatedAt": "2023-03-20T16:45:00Z",
  "lastLogin": "2023-04-15T09:30:00Z",
  "permissions": ["user.create", "user.update", "user.delete"]
}
```

### Kullanıcı Oluşturma

```
POST /api/users
```

**İstek (Request):**

```json
{
  "email": "yeni.ogretmen@test-okul-1.com",
  "name": "Yeni Öğretmen",
  "role": "teacher",
  "password": "guclu-sifre-789",
  "phoneNumber": "+90 555 987 6543"
}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "email": "yeni.ogretmen@test-okul-1.com",
  "name": "Yeni Öğretmen",
  "role": "teacher",
  "phoneNumber": "+90 555 987 6543",
  "createdAt": "2023-04-20T11:00:00Z"
}
```

### Kullanıcı Güncelleme

```
PATCH /api/users/{userId}
```

**İstek (Request):**

```json
{
  "name": "Güncellenmiş Öğretmen Adı",
  "phoneNumber": "+90 555 111 2222"
}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174002",
  "email": "yeni.ogretmen@test-okul-1.com",
  "name": "Güncellenmiş Öğretmen Adı",
  "role": "teacher",
  "phoneNumber": "+90 555 111 2222",
  "updatedAt": "2023-04-21T09:15:00Z"
}
```

### Kullanıcı Silme

```
DELETE /api/users/{userId}
```

**Yanıt (Response):**

```json
{
  "success": true,
  "message": "Kullanıcı başarıyla silindi."
}
```

## Öğrenci API

### Öğrenci Listesi

```
GET /api/students
```

**Sorgu Parametreleri:**

| Parametre | Açıklama | Varsayılan | Örnek |
|-----------|----------|------------|-------|
| page | Sayfa numarası | 1 | `?page=2` |
| limit | Sayfa başına öğe sayısı | 10 | `?limit=20` |
| classId | Sınıf filtresi | - | `?classId=123` |
| search | İsim veya numara araması | - | `?search=ali` |

**Yanıt (Response):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174010",
      "studentNumber": "2023001",
      "firstName": "Ali",
      "lastName": "Yılmaz",
      "email": "ali.yilmaz@example.com",
      "classId": "123e4567-e89b-12d3-a456-426614174050",
      "className": "9-A"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174011",
      "studentNumber": "2023002",
      "firstName": "Ayşe",
      "lastName": "Demir",
      "email": "ayse.demir@example.com",
      "classId": "123e4567-e89b-12d3-a456-426614174050",
      "className": "9-A"
    }
  ],
  "meta": {
    "total": 35,
    "page": 1,
    "limit": 10,
    "totalPages": 4
  }
}
```

### Öğrenci Detayı

```
GET /api/students/{studentId}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174010",
  "studentNumber": "2023001",
  "firstName": "Ali",
  "lastName": "Yılmaz",
  "email": "ali.yilmaz@example.com",
  "dateOfBirth": "2005-05-15",
  "gender": "male",
  "phoneNumber": "+90 555 333 4444",
  "address": "Örnek Mahallesi, Okul Caddesi No:5, İstanbul",
  "classId": "123e4567-e89b-12d3-a456-426614174050",
  "className": "9-A",
  "parentInfo": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174020",
      "name": "Mehmet Yılmaz",
      "relationship": "father",
      "email": "mehmet.yilmaz@example.com",
      "phoneNumber": "+90 555 666 7777"
    }
  ],
  "createdAt": "2023-08-25T10:00:00Z",
  "updatedAt": "2023-08-25T10:00:00Z"
}
```

### Öğrenci Oluşturma

```
POST /api/students
```

**İstek (Request):**

```json
{
  "studentNumber": "2023003",
  "firstName": "Mehmet",
  "lastName": "Kaya",
  "email": "mehmet.kaya@example.com",
  "dateOfBirth": "2005-07-20",
  "gender": "male",
  "phoneNumber": "+90 555 888 9999",
  "address": "Yeni Mahalle, Atatürk Bulvarı No:10, Ankara",
  "classId": "123e4567-e89b-12d3-a456-426614174050",
  "parentInfo": [
    {
      "name": "Ahmet Kaya",
      "relationship": "father",
      "email": "ahmet.kaya@example.com",
      "phoneNumber": "+90 555 777 8888"
    }
  ]
}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174012",
  "studentNumber": "2023003",
  "firstName": "Mehmet",
  "lastName": "Kaya",
  "email": "mehmet.kaya@example.com",
  "classId": "123e4567-e89b-12d3-a456-426614174050",
  "className": "9-A",
  "createdAt": "2023-08-26T11:30:00Z"
}
```

## Sınıf API

### Sınıf Listesi

```
GET /api/classes
```

**Yanıt (Response):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174050",
      "name": "9-A",
      "grade": 9,
      "section": "A",
      "academicYear": "2023-2024",
      "teacherId": "123e4567-e89b-12d3-a456-426614174001",
      "teacherName": "Test Öğretmen",
      "studentCount": 25
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174051",
      "name": "9-B",
      "grade": 9,
      "section": "B",
      "academicYear": "2023-2024",
      "teacherId": "123e4567-e89b-12d3-a456-426614174002",
      "teacherName": "Başka Öğretmen",
      "studentCount": 23
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Sınıf Detayı

```
GET /api/classes/{classId}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174050",
  "name": "9-A",
  "grade": 9,
  "section": "A",
  "academicYear": "2023-2024",
  "teacherId": "123e4567-e89b-12d3-a456-426614174001",
  "teacherName": "Test Öğretmen",
  "studentCount": 25,
  "room": "A-101",
  "schedule": [
    {
      "day": "monday",
      "periods": [
        {
          "period": 1,
          "subject": "Matematik",
          "teacherId": "123e4567-e89b-12d3-a456-426614174001"
        },
        {
          "period": 2,
          "subject": "Fizik",
          "teacherId": "123e4567-e89b-12d3-a456-426614174002"
        }
      ]
    }
  ],
  "createdAt": "2023-08-01T09:00:00Z",
  "updatedAt": "2023-08-15T14:00:00Z"
}
```

## Domain API

### Domain Listesi

```
GET /api/domains
```

**Yanıt (Response):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174060",
      "domain": "okul.example.com",
      "type": "custom",
      "status": "active",
      "verificationStatus": "verified",
      "sslStatus": "active",
      "createdAt": "2023-07-10T11:00:00Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174061",
      "domain": "test-okul-1.i-ep.app",
      "type": "subdomain",
      "status": "active",
      "verificationStatus": "verified",
      "sslStatus": "active",
      "createdAt": "2023-07-01T10:00:00Z"
    }
  ]
}
```

### Özel Domain Ekleme

```
POST /api/domains
```

**İstek (Request):**

```json
{
  "domain": "new-domain.example.com",
  "type": "custom"
}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174062",
  "domain": "new-domain.example.com",
  "type": "custom",
  "status": "pending",
  "verificationStatus": "pending",
  "createdAt": "2023-08-27T15:30:00Z",
  "dnsRecords": [
    {
      "type": "CNAME",
      "name": "new-domain.example.com",
      "value": "tenant-proxy.i-ep.app",
      "purpose": "domain_verification"
    },
    {
      "type": "TXT",
      "name": "new-domain.example.com",
      "value": "i-ep-verification=1234567890abcdef",
      "purpose": "domain_verification"
    }
  ]
}
```

### Domain Doğrulama

```
POST /api/domains/{domainId}/verify
```

**Yanıt (Response):**

```json
{
  "success": true,
  "domain": {
    "id": "123e4567-e89b-12d3-a456-426614174062",
    "domain": "new-domain.example.com",
    "type": "custom",
    "status": "active",
    "verificationStatus": "verified",
    "sslStatus": "provisioning",
    "verifiedAt": "2023-08-27T16:00:00Z"
  }
}
```

## Sağlık Kontrolü API

### Sistem Durumu

```
GET /api/health
```

**Yanıt (Response):**

```json
{
  "status": "healthy",
  "timestamp": "2023-08-27T16:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 15
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    },
    "storage": {
      "status": "healthy",
      "responseTime": 45
    }
  }
}
```

## Webhook API

### Webhook Listesi

```
GET /api/webhooks
```

**Yanıt (Response):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174070",
      "name": "Öğrenci Kayıt Bildirimi",
      "url": "https://example.com/webhooks/student-registration",
      "events": ["student.created", "student.updated"],
      "active": true,
      "createdAt": "2023-06-15T10:00:00Z"
    }
  ]
}
```

### Webhook Oluşturma

```
POST /api/webhooks
```

**İstek (Request):**

```json
{
  "name": "Sınav Sonuçları Bildirimi",
  "url": "https://example.com/webhooks/exam-results",
  "events": ["exam.created", "exam.results_published"],
  "secret": "your-webhook-secret"
}
```

**Yanıt (Response):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174071",
  "name": "Sınav Sonuçları Bildirimi",
  "url": "https://example.com/webhooks/exam-results",
  "events": ["exam.created", "exam.results_published"],
  "active": true,
  "createdAt": "2023-08-27T16:45:00Z"
}
```

## Rate Limiting

API istekleri rate limiting ile sınırlandırılır. Sınırlar tenant tipine göre değişir:

| Tenant Tipi | Limit |
|-------------|-------|
| Free | 60 istek/dakika |
| Standard | 300 istek/dakika |
| Premium | 1000 istek/dakika |

Rate limit aşıldığında 429 Too Many Requests yanıtı döndürülür ve şu başlıklar eklenir:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1630000000
```

## Webhook Olayları

Aşağıdaki olay türleri webhook'lar için kullanılabilir:

| Olay | Açıklama |
|------|----------|
| user.created | Yeni kullanıcı oluşturulduğunda |
| user.updated | Kullanıcı bilgileri güncellendiğinde |
| user.deleted | Kullanıcı silindiğinde |
| student.created | Yeni öğrenci oluşturulduğunda |
| student.updated | Öğrenci bilgileri güncellendiğinde |
| student.deleted | Öğrenci silindiğinde |
| class.created | Yeni sınıf oluşturulduğunda |
| class.updated | Sınıf bilgileri güncellendiğinde |
| class.deleted | Sınıf silindiğinde |
| exam.created | Yeni sınav oluşturulduğunda |
| exam.updated | Sınav bilgileri güncellendiğinde |
| exam.results_published | Sınav sonuçları yayınlandığında |

## Versiyonlama

API versiyonlaması URL ve Accept başlığı üzerinden yapılır:

```
GET /api/v1/users
Accept: application/json; version=1
```

Mevcut API sürümleri:
- v1: Mevcut kararlı sürüm 