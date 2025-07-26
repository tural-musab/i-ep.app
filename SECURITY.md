# 🔒 Güvenlik Politikası

## 📋 Genel Bakış

Bu proje, eğitim yönetim sistemi olarak hassas veriler işlediği için güvenlik en önemli önceliğimizdir. Güvenlik açıklarını ciddiye alıyor ve hızlı yanıt vermeyi taahhüt ediyoruz.

## 🚨 Güvenlik Açığı Bildirimi

### Öncelikli Bildirim Yöntemi

**GitHub Security Advisories** kullanarak güvenlik açıklarını bildirin:

1. Bu repository'de **Security** sekmesine gidin
2. **Report a vulnerability** butonuna tıklayın
3. Detaylı açıklama ve reprodüksiyon adımlarını sağlayın

### Alternatif Bildirim Yöntemi

Eğer GitHub Security Advisories kullanamıyorsanız:

- **Email:** <security@i-ep.app>
- **Güvenli İletişim:** [Güvenlik ekibimizle iletişime geçin](mailto:security@i-ep.app)

## ⏱️ Yanıt Süreleri

| Güvenlik Seviyesi | İlk Yanıt | Çözüm Süresi |
| ----------------- | --------- | ------------ |
| **Kritik**        | 24 saat   | 7 gün        |
| **Yüksek**        | 48 saat   | 14 gün       |
| **Orta**          | 72 saat   | 30 gün       |
| **Düşük**         | 1 hafta   | 90 gün       |

## 🔍 Güvenlik Açığı Kategorileri

### Kritik (Critical)

- **Veri sızıntısı** - Kullanıcı verilerinin yetkisiz erişimi
- **Kimlik doğrulama bypass** - Yetkisiz erişim
- **SQL Injection** - Veritabanı güvenlik açıkları
- **RCE (Remote Code Execution)** - Uzaktan kod çalıştırma

### Yüksek (High)

- **XSS (Cross-Site Scripting)** - Client-side güvenlik açıkları
- **CSRF (Cross-Site Request Forgery)** - Yetkisiz işlemler
- **Privilege Escalation** - Yetki yükseltme
- **Sensitive Data Exposure** - Hassas veri açığa çıkması

### Orta (Medium)

- **Information Disclosure** - Bilgi açığa çıkması
- **Rate Limiting Bypass** - Hız sınırı aşımı
- **Input Validation** - Girdi doğrulama sorunları

### Düşük (Low)

- **UI/UX Security Issues** - Kullanıcı arayüzü güvenlik sorunları
- **Best Practice Violations** - En iyi uygulama ihlalleri

## 🛡️ Güvenlik Önlemleri

### Mevcut Güvenlik Kontrolleri

- ✅ **Multi-Factor Authentication (MFA)** - Çok faktörlü kimlik doğrulama
- ✅ **Rate Limiting** - API hız sınırlaması
- ✅ **Row Level Security (RLS)** - Satır seviyesi güvenlik
- ✅ **Security Headers** - Güvenlik başlıkları
- ✅ **Input Validation** - Girdi doğrulama
- ✅ **SQL Injection Protection** - SQL enjeksiyon koruması
- ✅ **XSS Protection** - Cross-site scripting koruması
- ✅ **CSRF Protection** - Cross-site request forgery koruması

### Sürekli Güvenlik İzleme

- 🔍 **Dependabot** - Otomatik güvenlik açığı taraması
- 🔍 **CodeQL** - Kod analizi
- 🔍 **Security Scanning** - Güvenlik taraması
- 🔍 **Penetration Testing** - Penetrasyon testleri

## 📋 Güvenlik Açığı Bildirimi Formatı

Güvenlik açığı bildirirken aşağıdaki bilgileri sağlayın:

```markdown
## Güvenlik Açığı Raporu

### Özet

[Kısa açıklama]

### Etkilenen Bileşenler

- [Bileşen adı ve versiyonu]

### Reprodüksiyon Adımları

1. [Adım 1]
2. [Adım 2]
3. [Adım 3]

### Beklenen Davranış

[Ne olması gerekiyor]

### Gerçekleşen Davranış

[Ne oluyor]

### Ek Bilgiler

- Tarayıcı: [Chrome/Firefox/Safari]
- İşletim Sistemi: [Windows/macOS/Linux]
- Ekran görüntüleri: [Varsa]

### Güvenlik Etkisi

[Bu açığın potansiyel etkisi]
```

## 🔄 Güvenlik Açığı Yönetim Süreci

### 1. Bildirim Alınması

- Güvenlik açığı bildirimi alınır
- Öncelik seviyesi belirlenir
- İlk yanıt verilir

### 2. Araştırma ve Doğrulama

- Açık doğrulanır ve reprodüksiyon edilir
- Etki analizi yapılır
- Çözüm stratejisi geliştirilir

### 3. Çözüm Geliştirme

- Güvenlik yaması geliştirilir
- Test edilir
- Dokümantasyon güncellenir

### 4. Yayınlama

- Güvenlik yaması yayınlanır
- Güvenlik danışmanlığı (Security Advisory) oluşturulur
- Kullanıcılar bilgilendirilir

### 5. İzleme

- Çözümün etkinliği izlenir
- Benzer açıklar için önlem alınır
- Süreç iyileştirilir

## 🏆 Güvenlik Katkıları

Güvenlik araştırmacılarına teşekkür ediyoruz! Katkılarınız için:

### Güvenlik Araştırmacıları İçin

- **Responsible Disclosure** - Sorumlu açıklama
- **Credit** - Katkı sağlayanlar listesinde yer alma
- **Recognition** - Güvenlik katkıları sayfasında tanınma

### Güvenlik Programı

- **Bug Bounty** - Güvenlik açığı ödül programı (gelecekte)
- **Hall of Fame** - Güvenlik araştırmacıları onur listesi

## 📞 İletişim

### Güvenlik Ekibi

- **Email:** <security@i-ep.app>
- **GitHub:** [Security Advisories](https://github.com/tural-musab/i-ep.app/security/advisories)
- **Response Time:** 24-72 saat

### Acil Durumlar

Kritik güvenlik açıkları için:

- **Email:** <security-emergency@i-ep.app>
- **Response Time:** 24 saat içinde

## 📅 Güvenlik Güncellemeleri

### Düzenli Güvenlik Güncellemeleri

- **Haftalık:** Dependency güvenlik taraması
- **Aylık:** Güvenlik değerlendirmesi
- **Çeyreklik:** Penetrasyon testi
- **Yıllık:** Güvenlik politikası gözden geçirme

### Güvenlik Yayınları

- **Security Advisories:** GitHub Security Advisories
- **Release Notes:** Güvenlik güncellemeleri
- **Blog Posts:** Güvenlik iyileştirmeleri

## 🔗 Faydalı Bağlantılar

- [GitHub Security Advisories](https://github.com/tural-musab/i-ep.app/security/advisories)
- [Dependabot Alerts](https://github.com/tural-musab/i-ep.app/security/dependabot)
- [Code Scanning](https://github.com/tural-musab/i-ep.app/security/code-scanning)
- [Security Policy](https://github.com/tural-musab/i-ep.app/security/policy)

---

**Son Güncelleme:** 26 Ocak 2025  
**Versiyon:** 1.0  
**İletişim:** <security@i-ep.app>
