# Süper Admin Kullanıcı Akışları

Bu doküman, süper admin kullanıcılarının temel işlem akışlarını detaylandırır.

## 1. Tenant Yönetimi Akışları

### 1.1. Yeni Tenant Oluşturma

```mermaid
graph TD
    A[Başla] --> B[Tenant Ekle butonuna tıkla]
    B --> C[Tenant bilgilerini gir]
    C --> D{Bilgiler geçerli mi?}
    D -- Evet --> E[Tenant oluştur]
    D -- Hayır --> C
    E --> F[Subdomain oluştur]
    F --> G[Admin kullanıcı oluştur]
    G --> H[Hoşgeldin e-postası gönder]
    H --> I[Bitiş]
```

**Detaylar:**
1. Tenant adı ve subdomain kontrolü
2. Plan seçimi
3. Admin kullanıcı bilgileri
4. Özel yapılandırma seçenekleri

### 1.2. Tenant Durumu Değiştirme

```mermaid
graph TD
    A[Başla] --> B[Tenant listesinden seç]
    B --> C[Durum değiştir butonuna tıkla]
    C --> D{Yeni durum seç}
    D -- Aktif --> E[Servisleri aktifleştir]
    D -- Askıya Al --> F[Servisleri durdur]
    D -- Sil --> G[Silme onayı]
    G --> H{Onaylandı mı?}
    H -- Evet --> I[Tenant'ı sil]
    H -- Hayır --> B
```

## 2. Domain Yönetimi Akışları

### 2.1. Özel Domain Ekleme

```mermaid
graph TD
    A[Başla] --> B[Domain Ekle butonuna tıkla]
    B --> C[Domain bilgilerini gir]
    C --> D[DNS kayıtlarını göster]
    D --> E[Domain doğrulama bekle]
    E --> F{Doğrulandı mı?}
    F -- Evet --> G[SSL sertifikası oluştur]
    F -- Hayır --> H[Hata mesajı göster]
    G --> I[Domain aktifleştir]
```

### 2.2. SSL Sertifika Yenileme

```mermaid
graph TD
    A[Başla] --> B[SSL durumu kontrol]
    B --> C{Yenileme gerekli mi?}
    C -- Evet --> D[Yenileme başlat]
    C -- Hayır --> E[Bitiş]
    D --> F[Yeni sertifika oluştur]
    F --> G[Sertifika uygula]
```

## 3. Güvenlik Yönetimi Akışları

### 3.1. Güvenlik Olayı İnceleme

```mermaid
graph TD
    A[Başla] --> B[Güvenlik olayı bildirimi]
    B --> C[Olay detaylarını incele]
    C --> D{Risk seviyesi?}
    D -- Yüksek --> E[Acil önlem al]
    D -- Orta --> F[İncelemeye devam et]
    D -- Düşük --> G[İzle ve kaydet]
    E --> H[Durum raporu oluştur]
```

### 3.2. Erişim Kontrolü Yönetimi

```mermaid
graph TD
    A[Başla] --> B[Erişim politikası seç]
    B --> C[Değişiklik yap]
    C --> D{Değişiklik türü}
    D -- IP Kısıtlama --> E[IP listesi güncelle]
    D -- Rol Bazlı --> F[Rol izinleri güncelle]
    D -- 2FA --> G[2FA politikası güncelle]
```

## 4. Sistem İzleme Akışları

### 4.1. Performans İzleme

```mermaid
graph TD
    A[Başla] --> B[Metrik seç]
    B --> C[Zaman aralığı belirle]
    C --> D[Grafikleri görüntüle]
    D --> E{Anomali var mı?}
    E -- Evet --> F[Detaylı analiz]
    E -- Hayır --> G[Rapor oluştur]
```

### 4.2. Hata Analizi

```mermaid
graph TD
    A[Başla] --> B[Hata bildirimi al]
    B --> C[Log analizi yap]
    C --> D{Çözüm bulundu mu?}
    D -- Evet --> E[Çözüm uygula]
    D -- Hayır --> F[Escalate et]
```

## 5. Yedekleme Yönetimi Akışları

### 5.1. Manuel Yedekleme

```mermaid
graph TD
    A[Başla] --> B[Yedekleme türü seç]
    B --> C[Tenant seç]
    C --> D[Yedekleme başlat]
    D --> E{Başarılı mı?}
    E -- Evet --> F[Yedek doğrula]
    E -- Hayır --> G[Hata raporu]
```

### 5.2. Geri Yükleme

```mermaid
graph TD
    A[Başla] --> B[Yedek seç]
    B --> C[Geri yükleme planı oluştur]
    C --> D[Onay al]
    D --> E[Geri yükleme başlat]
    E --> F{Başarılı mı?}
    F -- Evet --> G[Sistem kontrolü]
    F -- Hayır --> H[Rollback]
```

## 6. Raporlama Akışları

### 6.1. Özel Rapor Oluşturma

```mermaid
graph TD
    A[Başla] --> B[Rapor türü seç]
    B --> C[Parametreleri belirle]
    C --> D[Veri topla]
    D --> E[Rapor oluştur]
    E --> F[Rapor paylaş]
```

### 6.2. Otomatik Raporlama

```mermaid
graph TD
    A[Başla] --> B[Rapor şablonu seç]
    B --> C[Zamanlama ayarla]
    C --> D[Alıcıları belirle]
    D --> E[Otomasyonu aktifleştir]
```

## Kullanıcı Deneyimi Notları

1. **Hata Yönetimi**
   - Her adımda geri bildirim
   - Açık hata mesajları
   - Düzeltme önerileri

2. **İşlem Onayları**
   - Kritik işlemler için çift onay
   - İşlem öncesi etki analizi
   - Geri alma seçeneği

3. **Yardım ve Dokümantasyon**
   - Bağlam duyarlı yardım
   - Adım adım kılavuzlar
   - Video eğitimler

## İlgili Dokümanlar

- [Dashboard Tasarımı](../layouts/super-admin/dashboard.md)
- [Komponent Kütüphanesi](../../components/README.md)
- [API Dokümantasyonu](../../api/super-admin-api.md) 