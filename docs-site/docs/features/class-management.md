# Sınıf Yönetimi

Bu dokümantasyon, sınıf yönetimi modülünün kullanımını ve özelliklerini açıklar.

## Özellikler

- Sınıf listesi görüntüleme ve filtreleme
- Yeni sınıf oluşturma
- Sınıf detaylarını görüntüleme ve düzenleme
- Öğrenci atama ve çıkarma
- Öğretmen atama ve çıkarma (sınıf öğretmeni ve branş öğretmeni)

## API Endpoint'leri

### Sınıf İşlemleri

#### `GET /api/classes`

Tüm sınıfların listesini döndürür.

**Yanıt:**

```json
[
  {
    "id": "123",
    "name": "6-A",
    "grade_level": 6,
    "capacity": 30,
    "academic_year": "2023-2024",
    "is_active": true,
    "homeroom_teacher": {
      "id": "teacher-1",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "student_count": 25,
    "teacher_count": 3
  }
]
```

#### `POST /api/classes`

Yeni bir sınıf oluşturur.

**İstek:**

```json
{
  "name": "7-B",
  "grade_level": 7,
  "capacity": 25,
  "academic_year": "2023-2024",
  "is_active": true
}
```

#### `PUT /api/classes`

Mevcut bir sınıfı günceller.

**İstek:**

```json
{
  "id": "123",
  "name": "7-B",
  "grade_level": 7,
  "capacity": 30,
  "academic_year": "2023-2024",
  "is_active": true
}
```

#### `GET /api/classes/[id]`

Belirli bir sınıfın detaylarını döndürür.

**Yanıt:**

```json
{
  "id": "123",
  "name": "6-A",
  "grade_level": 6,
  "capacity": 30,
  "academic_year": "2023-2024",
  "is_active": true,
  "homeroom_teacher": {
    "id": "teacher-1",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  },
  "student_count": 25,
  "teacher_count": 3
}
```

#### `DELETE /api/classes/[id]`

Belirli bir sınıfı siler.

### Öğrenci İşlemleri

#### `GET /api/class-students/[classId]`

Bir sınıftaki öğrencilerin listesini döndürür.

**Yanıt:**

```json
[
  {
    "id": "student-1",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "student_number": "2023001",
    "is_active": true
  }
]
```

#### `POST /api/class-students/[classId]`

Bir sınıfa öğrenci atar.

**İstek:**

```json
{
  "student_id": "student-1"
}
```

#### `DELETE /api/class-students/[classId]/[studentId]`

Bir öğrenciyi sınıftan çıkarır.

### Öğretmen İşlemleri

#### `GET /api/class-teachers/[classId]`

Bir sınıftaki öğretmenlerin listesini döndürür.

**Yanıt:**

```json
[
  {
    "id": "teacher-1",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "is_active": true,
    "role": "homeroom_teacher"
  }
]
```

#### `POST /api/class-teachers/[classId]`

Bir sınıfa öğretmen atar.

**İstek:**

```json
{
  "teacher_id": "teacher-1",
  "role": "subject_teacher"
}
```

#### `DELETE /api/class-teachers/[classId]/[teacherId]`

Bir öğretmeni sınıftan çıkarır.

## UI Bileşenleri

### ClassList

Sınıf listesini görüntülemek ve yönetmek için kullanılan ana bileşen.

**Özellikler:**

- Sınıf listesi görüntüleme
- İsme göre filtreleme
- Sınıf seviyesine göre filtreleme
- Sıralama (sınıf adı, öğrenci sayısı)
- Yeni sınıf oluşturma

### ClassDetails

Sınıf detaylarını görüntülemek ve düzenlemek için kullanılan bileşen.

**Özellikler:**

- Sınıf bilgilerini görüntüleme
- Sınıf bilgilerini düzenleme
- Sınıfı silme

### AssignStudentForm

Sınıfa öğrenci atamak için kullanılan form bileşeni.

**Özellikler:**

- Öğrenci listesi görüntüleme
- İsme göre filtreleme
- Öğrenci seçme ve atama

### AssignTeacherForm

Sınıfa öğretmen atamak için kullanılan form bileşeni.

**Özellikler:**

- Öğretmen listesi görüntüleme
- İsme göre filtreleme
- Öğretmen seçme ve atama
- Rol seçimi (sınıf öğretmeni/branş öğretmeni)

## Kullanım Örnekleri

### Yeni Sınıf Oluşturma

1. Sınıf listesi sayfasında "Yeni Sınıf" butonuna tıklayın
2. Sınıf bilgilerini girin:
   - Sınıf adı (örn. "6-A")
   - Sınıf seviyesi (1-12)
   - Kapasite (1-50)
   - Akademik yıl (örn. "2023-2024")
3. "Kaydet" butonuna tıklayın

### Öğrenci Atama

1. Sınıf detay sayfasında "Öğrenci Ekle" butonuna tıklayın
2. Öğrenci listesinden bir öğrenci seçin
3. "Ekle" butonuna tıklayın

### Öğretmen Atama

1. Sınıf detay sayfasında "Öğretmen Ekle" butonuna tıklayın
2. Öğretmen listesinden bir öğretmen seçin
3. Öğretmenin rolünü seçin (sınıf öğretmeni/branş öğretmeni)
4. "Ekle" butonuna tıklayın

## Hata Durumları

### Sınıf Oluşturma/Güncelleme

- Sınıf adı en az 2, en fazla 100 karakter olmalıdır
- Sınıf seviyesi 1-12 arasında olmalıdır
- Kapasite 1-50 arasında olmalıdır
- Akademik yıl "YYYY-YYYY" formatında olmalıdır

### Öğrenci Atama

- Sınıf kapasitesi doluysa öğrenci atanamaz
- Bir öğrenci aynı anda birden fazla sınıfa atanamaz

### Öğretmen Atama

- Bir sınıfın yalnızca bir sınıf öğretmeni olabilir
- Bir öğretmen aynı anda birden fazla sınıfın sınıf öğretmeni olamaz
