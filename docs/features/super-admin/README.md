# Süper Admin Panel - Genel Bakış

## Amaç ve Kapsam

Süper Admin Paneli, Iqra Eğitim Portalı'nın tüm sistem yönetimi, tenant kontrolü ve platform yapılandırmasını sağlayan merkezi yönetim arayüzüdür. Bu panel, platform yöneticilerine kapsamlı izleme, yönetim ve yapılandırma araçları sunar.

## Hedef Kullanıcılar

- Platform Yöneticileri
- Sistem Administratörleri
- Teknik Destek Ekibi
- Güvenlik Ekibi

## Temel Özellikler

### 1. Ana Dashboard

#### 1.1. Sistem Genel Bakış
- Toplam aktif tenant sayısı
- Toplam kullanıcı sayısı (rol bazlı dağılım)
- Sistem sağlık durumu
- Son 24 saat/7 gün özet metrikleri
- Kritik uyarılar ve bildirimler

#### 1.2. Performans Metrikleri
- Sistem uptime durumu
- Kaynak kullanım grafikleri
- API yanıt süreleri
- Sayfa yükleme süreleri
- SLA metrikleri (plan bazlı)

### 2. Tenant Yönetimi

#### 2.1. Tenant Listesi ve İşlemler
- Tenant arama ve filtreleme
- Tenant detay görüntüleme
- Yeni tenant oluşturma
- Tenant düzenleme/silme
- Tenant durumu değiştirme (aktif/pasif)

#### 2.2. Tenant İzleme
- Tenant sağlık skorları
- Kaynak kullanım grafikleri
- Kullanıcı aktivite metrikleri
- Özellik kullanım istatistikleri
- Performans metrikleri

#### 2.3. Plan ve Abonelik Yönetimi
- Plan değişikliği
- Özellik bayrakları yönetimi
- Kullanım limitleri ayarlama
- Fatura ve ödeme durumu
- Deneme süresi yönetimi

### 3. Domain Yönetimi

#### 3.1. Domain İşlemleri
- Domain listesi görüntüleme
- Yeni domain/subdomain ekleme
- Domain doğrulama
- SSL sertifika yönetimi
- DNS kayıtları yönetimi

#### 3.2. Domain İzleme
- Domain sağlık durumu
- SSL sertifika durumu
- DNS propagasyon durumu
- Erişilebilirlik kontrolleri
- Hata logları

### 4. Veri Yönetimi

#### 4.1. Yedekleme Yönetimi
- Yedekleme durumu izleme
- Manuel yedekleme başlatma
- Yedekleme planları yapılandırma
- Geri yükleme işlemleri
- Yedekleme logları

#### 4.2. Veri İzolasyon Kontrolleri
- Tenant veri izolasyon durumu
- Cross-tenant erişim kontrolleri
- Veri güvenliği metrikleri
- KVKK uyumluluk kontrolleri

### 5. Güvenlik ve Denetim

#### 5.1. Güvenlik İzleme
- Güvenlik olayları listesi
- Şüpheli aktivite bildirimleri
- IP kısıtlama yönetimi
- API güvenlik metrikleri

#### 5.2. Audit Log Yönetimi
- Sistem geneli audit logları
- Kullanıcı aktivite logları
- Admin işlem logları
- Log arama ve filtreleme

### 6. Topluluk ve Destek

#### 6.1. Topluluk Yönetimi
- Şampiyon kullanıcı programı
- Geribildirim yönetimi
- Forum moderasyon araçları
- İçerik yönetimi

#### 6.2. Destek Yönetimi
- Destek talepleri izleme
- SLA takibi
- Çözüm süreleri analizi
- Müşteri memnuniyet metrikleri

### 7. Sistem Yapılandırması

#### 7.1. Genel Ayarlar
- Sistem parametreleri
- E-posta şablonları
- Bildirim ayarları
- API yapılandırması

#### 7.2. Bölgesel Ayarlar
- Dil yönetimi
- Bölgesel içerik yapılandırması
- Zaman dilimi ayarları
- Para birimi ayarları

### 8. Raporlama

#### 8.1. Sistem Raporları
- Performans raporları
- Kullanım raporları
- Güvenlik raporları
- SLA raporları

#### 8.2. Özel Raporlar
- Tenant bazlı raporlar
- Bölgesel kullanım raporları
- Trend analizi raporları
- Özelleştirilebilir rapor oluşturma

## Teknik Özellikler

### Frontend Teknolojileri
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Shadcn/UI komponentleri

### Veri Yönetimi
- Supabase veritabanı entegrasyonu
- Real-time veri güncelleme
- Önbellek yönetimi
- Veri izolasyon kontrolleri

### Güvenlik
- Rol bazlı erişim kontrolü
- İki faktörlü kimlik doğrulama
- IP bazlı erişim kısıtlaması
- Oturum yönetimi

### Performans
- Sayfa önbelleğe alma
- Lazy loading
- Optimized API calls
- Real-time metrik izleme

## İlgili Dokümanlar

- [Dashboard Tasarımı](../ui-ux/layouts/super-admin/dashboard.md)
- [Tenant Yönetimi Akışı](../ui-ux/user-flows/super-admin-flows.md)
- [API Dokümantasyonu](../api/super-admin-api.md)
- [Güvenlik Politikaları](../security/super-admin-security.md) 