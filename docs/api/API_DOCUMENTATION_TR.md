# İ-EP.APP - API Dokümantasyonu

> **Kapsamlı Türkçe Teknik API Dokümantasyonu**
>
> İ-EP.APP çoklu kiracılı okul yönetim sistemi için RESTful API referansı
>
> **Versiyon**: 1.0.0  
> **Son Güncelleme**: 24 Temmuz 2025

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kimlik Doğrulama](#kimlik-doğrulama)
3. [API Kategorileri](#api-kategorileri)
4. [Ortak Yapılar](#ortak-yapılar)
5. [Hata Yönetimi](#hata-yönetimi)
6. [Entegrasyon Örnekleri](#entegrasyon-örnekleri)

---

## 🔍 Genel Bakış

### API Mimarisi

- **Mimari**: RESTful API with JSON
- **Base URL**: `https://api.i-ep.app` (Production) / `http://localhost:3000/api` (Development)
- **Protokol**: HTTPS zorunlu (Production)
- **İçerik Tipi**: `application/json`
- **Karakter Kodlaması**: UTF-8
- **Çoklu Kiracı**: Tenant tabanlı veri izolasyonu

### Desteklenen HTTP Metodları

- `GET` - Veri okuma ve listeleme
- `POST` - Yeni kayıt oluşturma
- `PUT` - Mevcut kayıt güncelleme
- `PATCH` - Kısmi kayıt güncelleme
- `DELETE` - Kayıt silme

### API Versiyonlama

- **Mevcut Versiyon**: v1
- **Versiyon Belirtme**: URL path'inde (`/api/v1/`)
- **Geriye Uyumluluk**: 6 ay süreyle desteklenir

---

## 🔐 Kimlik Doğrulama

### Kimlik Doğrulama Türleri

#### 1. NextAuth.js Credentials

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "ogretmen@okul.edu.tr",
  "password": "guvenli_sifre",
  "tenantId": "okul-abc-123"
}
```

#### 2. Header Tabanlı Kimlik Doğrulama

```http
X-User-Email: ogretmen@okul.edu.tr
X-User-ID: demo-teacher-001
x-tenant-id: localhost-tenant
Authorization: Bearer <token>
```

### Roller ve Yetkiler

| Rol           | Açıklama          | Yetkiler                |
| ------------- | ----------------- | ----------------------- |
| `super_admin` | Sistem yöneticisi | Tüm sistem erişimi      |
| `admin`       | Okul yöneticisi   | Okul geneli yönetim     |
| `teacher`     | Öğretmen          | Sınıf ve ders yönetimi  |
| `student`     | Öğrenci           | Sadece kendi verileri   |
| `parent`      | Veli              | Çocuk verilerine erişim |

### Multi-Tenant Yapısı

```http
# Tenant ID her istekte header'da gönderilir
x-tenant-id: abc123-okul-ankara
```

---

## 🏫 API Kategorileri

### 1. Ödev Yönetimi (Assignments)

#### **GET** `/api/assignments` - Ödev Listesi

Ödevleri filtrele ve listele

**Parametreler:**

- `page` (int): Sayfa numarası (varsayılan: 1)
- `limit` (int): Sayfa başına kayıt (varsayılan: 10, max: 100)
- `class_id` (uuid): Sınıf ID'si
- `teacher_id` (uuid): Öğretmen ID'si
- `type` (enum): Ödev türü (`homework`, `exam`, `project`, `quiz`, `presentation`)
- `status` (enum): Durum (`draft`, `published`, `completed`, `archived`)
- `subject` (string): Ders adı
- `due_date_from` (datetime): Teslim tarihi (başlangıç)
- `due_date_to` (datetime): Teslim tarihi (bitiş)
- `search` (string): Arama terimi

**Yanıt:**

```json
{
  "data": [
    {
      "id": "assignment-001",
      "title": "Türkçe Kompozisyon - Okulum",
      "description": "Okulunuz hakkında 200 kelimelik bir kompozisyon yazınız.",
      "type": "homework",
      "subject": "Türkçe",
      "class_id": "class-5a",
      "teacher_id": "demo-teacher-001",
      "due_date": "2025-07-31T23:59:59Z",
      "max_score": 100,
      "instructions": "Kompozisyonunuzda giriş, gelişme ve sonuç bölümleri olsun.",
      "status": "published",
      "is_graded": false,
      "tenant_id": "localhost-tenant",
      "created_at": "2025-07-24T10:00:00Z",
      "updated_at": "2025-07-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### **POST** `/api/assignments` - Yeni Ödev Oluştur

Yeni ödev oluşturur (Öğretmen/Admin yetkisi gerekli)

**İstek Gövdesi:**

```json
{
  "title": "Matematik - Kesirler Konusu",
  "description": "Kesirlerle toplama ve çıkarma işlemleri çalışma kağıdı.",
  "type": "homework",
  "subject": "Matematik",
  "class_id": "class-5a",
  "teacher_id": "demo-teacher-001",
  "due_date": "2025-07-27T23:59:59Z",
  "max_score": 50,
  "instructions": "Tüm işlemleri gösteriniz.",
  "attachments": ["file-001", "file-002"],
  "rubric": [
    {
      "criteria": "Doğruluk",
      "points": 25,
      "description": "İşlem doğruluğu"
    },
    {
      "criteria": "Sunum",
      "points": 15,
      "description": "Düzen ve temizlik"
    }
  ]
}
```

**Yanıt (201 Created):**

```json
{
  "id": "assignment-003",
  "title": "Matematik - Kesirler Konusu",
  "status": "draft",
  "created_at": "2025-07-24T14:30:00Z"
}
```

### 2. Devam Takibi (Attendance)

#### **GET** `/api/attendance` - Devam Kayıtları

Devam kayıtlarını filtreli olarak getir

**Parametreler:**

- `studentId` (uuid): Öğrenci ID'si
- `classId` (uuid): Sınıf ID'si
- `date` (date): Belirli tarih
- `startDate` (date): Başlangıç tarihi
- `endDate` (date): Bitiş tarihi
- `status` (enum): Devam durumu (`present`, `absent`, `late`, `excused`, `sick`)
- `limit` (int): Kayıt limiti (varsayılan: 50)
- `offset` (int): Başlangıç pozisyonu

**Yanıt:**

```json
{
  "data": [
    {
      "id": "attendance-001",
      "student_id": "student-001",
      "student_name": "Ahmet YILMAZ",
      "class_id": "class-5a",
      "date": "2025-07-24",
      "status": "present",
      "time_in": "08:30:00",
      "time_out": "15:30:00",
      "notes": "",
      "marked_by": "teacher-001",
      "created_at": "2025-07-24T08:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### **POST** `/api/attendance` - Devam Kaydı Oluştur

Tek veya toplu devam kaydı oluşturur

**Tek Kayıt:**

```json
{
  "studentId": "student-001",
  "classId": "class-5a",
  "date": "2025-07-24",
  "status": "present",
  "timeIn": "08:30:00",
  "notes": "Zamanında geldi"
}
```

**Toplu Kayıt:**

```json
{
  "classId": "class-5a",
  "date": "2025-07-24",
  "attendance": [
    {
      "studentId": "student-001",
      "status": "present",
      "timeIn": "08:30:00"
    },
    {
      "studentId": "student-002",
      "status": "absent",
      "excuseReason": "Hastalık"
    }
  ]
}
```

### 3. Not Yönetimi (Grades)

#### **GET** `/api/grades` - Not Listesi

Notları filtreli olarak getir

**Parametreler:**

- `studentId` (uuid): Öğrenci ID'si
- `classId` (uuid): Sınıf ID'si
- `subjectId` (uuid): Ders ID'si
- `teacherId` (uuid): Öğretmen ID'si
- `gradeType` (enum): Not türü (`exam`, `homework`, `project`, `participation`, `quiz`, `midterm`, `final`)
- `semester` (int): Dönem (1 veya 2)
- `academicYear` (string): Akademik yıl (YYYY-YYYY)
- `includeCalculations` (boolean): Hesaplama sonuçları dahil
- `includeComments` (boolean): Yorumları dahil

**Yanıt:**

```json
{
  "data": [
    {
      "id": "grade-001",
      "student_id": "student-001",
      "student_name": "Ahmet YILMAZ",
      "class_id": "class-5a",
      "subject_id": "subject-turkish",
      "subject_name": "Türkçe",
      "assignment_id": "assignment-001",
      "grade_type": "homework",
      "grade_value": 85,
      "max_grade": 100,
      "weight": 1.0,
      "exam_name": "Kompozisyon Ödevi",
      "description": "Okulum konulu kompozisyon",
      "semester": 1,
      "academic_year": "2024-2025",
      "grade_date": "2025-07-24T10:00:00Z",
      "teacher_id": "demo-teacher-001",
      "tenant_id": "localhost-tenant",
      "created_at": "2025-07-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### **POST** `/api/grades` - Not Girişi

Yeni not kaydı oluşturur

**İstek:**

```json
{
  "studentId": "student-001",
  "classId": "class-5a",
  "subjectId": "subject-math",
  "gradeType": "exam",
  "gradeValue": 92,
  "maxGrade": 100,
  "examName": "1. Yazılı Sınavı",
  "semester": 1,
  "academicYear": "2024-2025",
  "description": "Kesirler konusu sınavı"
}
```

### 4. Sınıf Yönetimi (Classes)

#### **GET** `/api/classes` - Sınıf Listesi

Sınıfları listeler

**Yanıt:**

```json
{
  "data": [
    {
      "id": "class-5a",
      "name": "5/A",
      "grade": "5",
      "section": "A",
      "capacity": 25,
      "current_enrollment": 22,
      "academic_year": "2024-2025",
      "teacher_id": "demo-teacher-001",
      "room_number": "101",
      "status": "active",
      "description": "Beşinci sınıf A şubesi",
      "tenant_id": "localhost-tenant",
      "created_at": "2025-07-24T10:00:00Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

#### **POST** `/api/classes` - Yeni Sınıf

Yeni sınıf oluşturur

**İstek:**

```json
{
  "name": "6/A",
  "grade": "6",
  "section": "A",
  "capacity": 30,
  "academic_year": "2024-2025",
  "teacher_id": "teacher-002",
  "room_number": "201",
  "description": "Altıncı sınıf A şubesi"
}
```

### 5. Dosya Yönetimi (Storage)

#### **POST** `/api/storage/upload` - Dosya Yükleme

Dosya yükler ve metadata kaydeder

**İstek (multipart/form-data):**

```
POST /api/storage/upload
Content-Type: multipart/form-data

file: [binary_file_data]
type: assignment
assignment_id: assignment-001
public: false
```

**Yanıt:**

```json
{
  "success": true,
  "file": {
    "id": "file-abc123",
    "name": "odev_cozumu.pdf",
    "path": "assignments/2025/07/abc123/odev_cozumu.pdf",
    "size": 2048576,
    "mimeType": "application/pdf",
    "url": "https://storage.i-ep.app/assignments/2025/07/abc123/odev_cozumu.pdf",
    "provider": "supabase",
    "metadata": {
      "uploadedBy": "student-001",
      "uploadedAt": "2025-07-24T14:30:00Z",
      "type": "assignment",
      "assignmentId": "assignment-001"
    }
  }
}
```

#### **GET** `/api/storage/upload` - Yükleme Yapılandırması

Dosya yükleme limitlerini ve kısıtlamaları getirir

**Yanıt:**

```json
{
  "maxFileSize": {
    "assignment": 52428800,
    "profile": 5242880,
    "document": 104857600,
    "image": 10485760
  },
  "allowedMimeTypes": {
    "assignment": [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png"
    ],
    "profile": ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }
}
```

### 6. Dashboard ve İstatistikler

#### **GET** `/api/dashboard/recent-activities` - Son Aktiviteler

Dashboard için son aktiviteleri getirir

**Yanıt:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "assignment",
      "title": "Matematik Ödev 3 teslim edildi",
      "description": "Ahmet Yılmaz tarafından matematik ödevi teslim edildi",
      "timestamp": "2025-07-24T13:30:00Z",
      "user": "Ahmet Yılmaz",
      "icon": "assignment"
    },
    {
      "id": "2",
      "type": "attendance",
      "title": "Devamsızlık kaydı güncellendi",
      "description": "9A sınıfı için günlük devam kaydı tamamlandı",
      "timestamp": "2025-07-24T12:00:00Z",
      "user": "Fatma Özdemir",
      "icon": "attendance"
    }
  ]
}
```

### 7. Sistem Sağlığı

#### **GET** `/api/health` - Sistem Durumu

Sistem sağlık kontrolü yapar

**Yanıt:**

```json
{
  "status": "healthy",
  "timestamp": "2025-07-24T14:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "externalApis": "healthy"
  }
}
```

---

## 🔧 Ortak Yapılar

### Sayfalama (Pagination)

```json
{
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Filtreleme Parametreleri

```http
GET /api/resource?filter=value&sort=created_at:desc&limit=20&offset=0
```

### Tarih Formatları

- **ISO 8601**: `2025-07-24T14:30:00Z`
- **Tarih**: `2025-07-24`
- **Saat**: `14:30:00`

### UUID Formatı

- **Standart**: `abc123e4-e89b-12d3-a456-426614174000`

---

## ⚠️ Hata Yönetimi

### HTTP Durum Kodları

| Kod | Açıklama              | Kullanım                 |
| --- | --------------------- | ------------------------ |
| 200 | OK                    | Başarılı istek           |
| 201 | Created               | Kayıt oluşturuldu        |
| 400 | Bad Request           | Geçersiz istek           |
| 401 | Unauthorized          | Kimlik doğrulama gerekli |
| 403 | Forbidden             | Yetkisiz erişim          |
| 404 | Not Found             | Kayıt bulunamadı         |
| 409 | Conflict              | Veri çakışması           |
| 422 | Unprocessable Entity  | Validasyon hatası        |
| 500 | Internal Server Error | Sunucu hatası            |
| 501 | Not Implemented       | Henüz uygulanmadı        |

### Hata Yanıt Formatı

```json
{
  "error": "Geçersiz öğrenci ID'si",
  "details": [
    {
      "field": "studentId",
      "message": "UUID formatında olmalıdır",
      "code": "INVALID_UUID"
    }
  ],
  "timestamp": "2025-07-24T14:30:00Z",
  "path": "/api/assignments",
  "method": "POST"
}
```

### Yaygın Hata Durumları

#### 1. Kimlik Doğrulama Hatası

```json
{
  "error": "Authentication required or insufficient permissions",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-07-24T14:30:00Z"
}
```

#### 2. Validasyon Hatası

```json
{
  "error": "Invalid request data",
  "details": [
    {
      "field": "title",
      "message": "Title is required",
      "code": "REQUIRED_FIELD"
    },
    {
      "field": "due_date",
      "message": "Invalid due date",
      "code": "INVALID_DATE"
    }
  ]
}
```

#### 3. Kaynak Bulunamadı

```json
{
  "error": "Assignment not found",
  "code": "RESOURCE_NOT_FOUND",
  "resource": "assignment",
  "id": "assignment-999"
}
```

#### 4. Tenant Erişim Hatası

```json
{
  "error": "Tenant ID not found in headers",
  "code": "MISSING_TENANT",
  "message": "x-tenant-id header'ı gereklidir"
}
```

---

## 💡 Entegrasyon Örnekleri

### JavaScript/TypeScript ile API Kullanımı

#### 1. Temel API İstemci

```typescript
class IEpApiClient {
  private baseUrl: string;
  private tenantId: string;
  private authToken?: string;

  constructor(baseUrl: string, tenantId: string) {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'x-tenant-id': this.tenantId,
      ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Kimlik doğrulama
  async signIn(email: string, password: string) {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenantId: this.tenantId }),
    });

    this.authToken = response.accessToken;
    return response;
  }

  // Ödev listesi
  async getAssignments(params: AssignmentFilters = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<AssignmentListResponse>(`/assignments?${queryString}`);
  }

  // Yeni ödev oluştur
  async createAssignment(assignment: CreateAssignmentData) {
    return this.request<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  // Dosya yükleme
  async uploadFile(file: File, type: string, assignmentId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (assignmentId) {
      formData.append('assignment_id', assignmentId);
    }

    return this.request<FileUploadResponse>('/storage/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Content-Type'ı otomatik olarak ayarla
    });
  }
}
```

#### 2. React Hook Örneği

```typescript
import { useState, useEffect } from 'react';
import { IEpApiClient } from './api-client';

// API hook'u
export function useAssignments(filters: AssignmentFilters = {}) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = new IEpApiClient(
    process.env.NEXT_PUBLIC_API_URL!,
    'localhost-tenant'
  );

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setLoading(true);
        const response = await api.getAssignments(filters);
        setAssignments(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [filters]);

  return { assignments, loading, error };
}

// Component içinde kullanım
function AssignmentList() {
  const { assignments, loading, error } = useAssignments({
    class_id: 'class-5a',
    status: 'published'
  });

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div>
      {assignments.map(assignment => (
        <div key={assignment.id}>
          <h3>{assignment.title}</h3>
          <p>{assignment.description}</p>
          <p>Teslim: {new Date(assignment.due_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

#### 3. Devam Kaydı Örneği

```typescript
// Toplu devam kaydı
async function markClassAttendance(
  classId: string,
  date: string,
  attendanceData: AttendanceRecord[]
) {
  const api = new IEpApiClient(API_BASE_URL, TENANT_ID);

  try {
    const result = await api.request('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        classId,
        date,
        attendance: attendanceData,
      }),
    });

    console.log(`${result.data.length} devam kaydı oluşturuldu`);
    return result;
  } catch (error) {
    console.error('Devam kaydı hatası:', error);
    throw error;
  }
}

// Kullanım
const attendanceRecords = [
  { studentId: 'student-001', status: 'present', timeIn: '08:30' },
  { studentId: 'student-002', status: 'absent', excuseReason: 'Hastalık' },
  { studentId: 'student-003', status: 'late', timeIn: '08:45' },
];

await markClassAttendance('class-5a', '2025-07-24', attendanceRecords);
```

### Python ile API Kullanımı

```python
import requests
from typing import Dict, List, Optional
import json

class IEpApiClient:
    def __init__(self, base_url: str, tenant_id: str):
        self.base_url = base_url
        self.tenant_id = tenant_id
        self.auth_token = None
        self.session = requests.Session()

    def _request(self, endpoint: str, method: str = 'GET',
                data: Optional[Dict] = None) -> Dict:
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Content-Type': 'application/json',
            'x-tenant-id': self.tenant_id
        }

        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'

        response = self.session.request(
            method=method,
            url=url,
            headers=headers,
            json=data if data else None
        )

        if not response.ok:
            error_data = response.json()
            raise Exception(f"API Error: {error_data.get('error', 'Unknown error')}")

        return response.json()

    def get_assignments(self, **filters) -> Dict:
        """Ödev listesini getirir"""
        params = '&'.join([f"{k}={v}" for k, v in filters.items()])
        endpoint = f"/assignments?{params}" if params else "/assignments"
        return self._request(endpoint)

    def create_assignment(self, assignment_data: Dict) -> Dict:
        """Yeni ödev oluşturur"""
        return self._request('/assignments', 'POST', assignment_data)

    def get_grades(self, student_id: Optional[str] = None,
                  class_id: Optional[str] = None) -> Dict:
        """Not listesini getirir"""
        filters = {}
        if student_id:
            filters['studentId'] = student_id
        if class_id:
            filters['classId'] = class_id

        params = '&'.join([f"{k}={v}" for k, v in filters.items()])
        endpoint = f"/grades?{params}" if params else "/grades"
        return self._request(endpoint)

# Kullanım örneği
if __name__ == "__main__":
    api = IEpApiClient("http://localhost:3000/api", "localhost-tenant")

    # Ödev listesi
    assignments = api.get_assignments(class_id="class-5a", status="published")
    print(f"Toplam ödev: {assignments['pagination']['total']}")

    # Yeni ödev oluştur
    new_assignment = {
        "title": "Python Projesi",
        "description": "Basit hesap makinesi uygulaması",
        "type": "project",
        "subject": "Bilgisayar",
        "class_id": "class-5a",
        "teacher_id": "demo-teacher-001",
        "due_date": "2025-08-15T23:59:59Z",
        "max_score": 100
    }

    result = api.create_assignment(new_assignment)
    print(f"Yeni ödev oluşturuldu: {result['id']}")
```

### cURL Örnekleri

#### 1. Ödev Listesi

```bash
# Tüm ödevleri listele
curl -X GET "http://localhost:3000/api/assignments" \
  -H "x-tenant-id: localhost-tenant" \
  -H "X-User-Email: teacher1@demo.local" \
  -H "X-User-ID: demo-teacher-001"

# Filtreleme ile
curl -X GET "http://localhost:3000/api/assignments?class_id=class-5a&status=published&limit=5" \
  -H "x-tenant-id: localhost-tenant" \
  -H "X-User-Email: teacher1@demo.local"
```

#### 2. Yeni Ödev Oluştur

```bash
curl -X POST "http://localhost:3000/api/assignments" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: localhost-tenant" \
  -H "X-User-Email: teacher1@demo.local" \
  -H "X-User-ID: demo-teacher-001" \
  -d '{
    "title": "Fen Bilgisi Deneyi",
    "description": "Bitki büyümesi deneyi raporu",
    "type": "project",
    "subject": "Fen Bilgisi",
    "class_id": "class-5a",
    "teacher_id": "demo-teacher-001",
    "due_date": "2025-08-10T23:59:59Z",
    "max_score": 100,
    "instructions": "Deney sürecini detaylı olarak rapor ediniz."
  }'
```

#### 3. Devam Kaydı

```bash
# Tek öğrenci devam kaydı
curl -X POST "http://localhost:3000/api/attendance" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: localhost-tenant" \
  -H "X-User-Email: teacher1@demo.local" \
  -d '{
    "studentId": "student-001",
    "classId": "class-5a",
    "date": "2025-07-24",
    "status": "present",
    "timeIn": "08:30:00"
  }'

# Toplu devam kaydı
curl -X POST "http://localhost:3000/api/attendance" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: localhost-tenant" \
  -d '{
    "classId": "class-5a",
    "date": "2025-07-24",
    "attendance": [
      {
        "studentId": "student-001",
        "status": "present",
        "timeIn": "08:30:00"
      },
      {
        "studentId": "student-002",
        "status": "absent",
        "excuseReason": "Hastalık"
      }
    ]
  }'
```

#### 4. Dosya Yükleme

```bash
curl -X POST "http://localhost:3000/api/storage/upload" \
  -H "x-tenant-id: localhost-tenant" \
  -H "X-User-Email: student1@demo.local" \
  -F "file=@odev_cozumu.pdf" \
  -F "type=assignment" \
  -F "assignment_id=assignment-001"
```

---

## 📋 API Durum Takibi

### Mevcut API Durumu

- ✅ **Assignments API**: %95 Complete - CRUD operations working
- ✅ **Attendance API**: %90 Complete - Bulk operations implemented
- ✅ **Grades API**: %90 Complete - Turkish grading system support
- ✅ **Classes API**: %95 Complete - Multi-tenant support
- ✅ **Storage API**: %100 Complete - File upload/download working
- ✅ **Dashboard API**: %90 Complete - Recent activities working
- ✅ **Health API**: %100 Complete - System monitoring active
- ✅ **Authentication**: %95 Complete - NextAuth + Supabase hybrid

### Planlanan Geliştirmeler

- 🔄 **Parent Communication API**: Development phase
- 🔄 **Report Generation API**: Planning phase
- 🔄 **Advanced Analytics API**: Specification phase
- 🔄 **Real-time Notifications**: WebSocket integration planned

---

## 📞 Destek ve İletişim

### Teknik Destek

- **Geliştirici Dokümantasyonu**: `/docs/api/`
- **API Test Arayüzü**: `/docs/api/swagger/` (Yakında)
- **GitHub Issues**: [İ-EP.APP Issues](https://github.com/iepapp/issues)

### Güncelleme Bildirimleri

- **Changelog**: `/CHANGELOG.md`
- **Migration Guide**: `/docs/api/migrations/`
- **Breaking Changes**: 30 gün önceden duyurulur

---

**Son Güncelleme**: 24 Temmuz 2025  
**Doküman Versiyonu**: 1.0.0  
**API Versiyonu**: v1.0.0  
**Dil**: Türkçe (TR)
