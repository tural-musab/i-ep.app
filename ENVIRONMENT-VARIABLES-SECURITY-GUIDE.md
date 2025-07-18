# İ-EP.APP Environment Variables Güvenlik Rehberi

> **Oluşturulma**: 17 Temmuz 2025  
> **Amaç**: Environment variable yönetimi için kritik güvenlik kılavuzu  
> **Durum**: 🚨 ZORUNLU - Tüm geliştiriciler bu kılavuzu takip etmelidir

## 🚨 KRİTİK GÜVENLİK KURALLARI

### **ASLA REPOSITORY'E COMMIT ETMEYİN:**

- ❌ Production API anahtarları
- ❌ Veritabanı şifreleri
- ❌ JWT secret'ları
- ❌ Üçüncü parti servis kimlik bilgileri
- ❌ E-posta şifreleri
- ❌ Gerçek Cloudflare/Supabase token'ları

### **REPOSITORY'DE HER ZAMAN PLACEHOLDER KULLANIN:**

- ✅ `production-api-anahtariniz`
- ✅ `veritabani-sifreniz`
- ✅ `jwt-secret-anahtariniz-min-32-karakter`
- ✅ Açık talimatlarla template değerleri

## 📁 Environment Dosya Yapısı

### **✅ DOĞRU Dosya Kullanımı**

| Dosya                    | Amaç                | İçerik                    | Güvenlik Seviyesi | Öncelik |
| ------------------------ | ------------------- | ------------------------- | ----------------- | ------- |
| `.env.development.local` | **Sadece Development** | Mock/test kimlik bilgileri | ✅ GÜVENLİ        | **1** |
| `.env.local`             | **Genel Override**     | Sadece genel ayarlar      | ✅ GÜVENLİ        | **2** |
| `.env.development`       | Development şablonu    | Mock credentials template | ✅ GÜVENLİ        | 3 |
| `.env.staging`           | Staging şablonu        | Placeholder değerler      | ✅ GÜVENLİ        | 3 |
| `.env.production`        | Production şablonu     | Placeholder değerler      | ✅ GÜVENLİ        | 3 |
| `.env`                   | Fallback şablonu       | Placeholder değerler      | ✅ GÜVENLİ        | 4 |
| `.env.example`           | Dokümantasyon          | Sadece placeholder değerler | ✅ GÜVENLİ        | - |

### **🚨 YANLIŞ Dosya Kullanımı (DÜZELTİLDİ)**

- ❌ Repository dosyalarında production kimlik bilgileri
- ❌ Development dosyalarında gerçek API anahtarları
- ❌ Ortamlar arası paylaşılan kimlik bilgileri
- ❌ Version control'da e-posta şifreleri

## 🔐 Güvenli Kimlik Bilgisi Yönetimi

### **Development (Geliştirme) Ortamı**

```bash
# ✅ DOĞRU - Sadece yerel/Mock servisler
UPSTASH_REDIS_URL=redis://localhost:6379
CLOUDFLARE_API_TOKEN=dev-mock-token-gercek-degil
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
```

### **Production (Üretim) Ortamı**

```bash
# ✅ DOĞRU - Server environment variables kullanın
# Bunları Vercel dashboard'unda veya server konfigürasyonunda ayarlayın
UPSTASH_REDIS_URL="gercek-production-url"
CLOUDFLARE_API_TOKEN="gercek-production-token"
NEXT_PUBLIC_SUPABASE_URL="gercek-production-url"
```

## 🛡️ Güvenlik Uygulaması

### **Vercel Environment Variables**

1. **Dashboard Konfigürasyonu**: Gerçek kimlik bilgilerini Vercel dashboard'unda ayarlayın
2. **Ortam Ayrımı**: Dev/staging/production için farklı değerler
3. **Secret Yönetimi**: Vercel'in şifrelenmiş secret depolama özelliğini kullanın

### **Yerel Geliştirme**

1. **Mock Servisler**: Yerel Redis, mock Cloudflare, yerel Supabase kullanın
2. **Test Kimlik Bilgileri**: Sadece sandbox/test API anahtarları kullanın
3. **Gerçek Veri Yok**: Asla yerel olarak production servislerine bağlanmayın

### **CI/CD Güvenliği**

1. **GitHub Secrets**: Kimlik bilgilerini GitHub repository secrets'ta saklayın
2. **Environment Variables**: Build işlemi sırasında secret'ları enjekte edin
3. **Hardcode Yok**: Asla kodda kimlik bilgilerini hardcode etmeyin

## 📋 Güvenlik Kontrol Listesi

### **Her Commit Öncesi**

- [ ] `.env*` dosyalarını gerçek kimlik bilgileri için kontrol edin
- [ ] Repository'de sadece placeholder değerlerinin olduğunu doğrulayın
- [ ] `.gitignore`'un tüm `.env*` dosyalarını içerdiğini onaylayın
- [ ] Yerel olarak mock kimlik bilgileriyle test edin

### **Production Deployment**

- [ ] Vercel dashboard'unda gerçek kimlik bilgilerini ayarlayın
- [ ] Environment variable ayrımını doğrulayın
- [ ] Gerçek kimlik bilgileriyle production build'i test edin
- [ ] Kimlik bilgisi sızıntılarını izleyin

### **Düzenli Güvenlik Denetimi**

- [ ] Tüm environment dosyalarını aylık olarak gözden geçirin
- [ ] Kazara kimlik bilgisi commit'lerini kontrol edin
- [ ] Güvenliği ihlal edilmişse kimlik bilgilerini değiştirin
- [ ] Placeholder şablonlarını güncelleyin

## 🚨 Acil Durum Prosedürleri

### **Kimlik Bilgileri Sızdırılırsa**

1. **Acil Eylem**: Tüm güvenliği ihlal edilmiş kimlik bilgilerini değiştirin
2. **Servis Rotasyonu**: API anahtarlarını, veritabanı şifrelerini döndürün
3. **Audit Log'ları**: Yetkisiz erişim için kontrol edin
4. **Repository Güncelleme**: Kimlik bilgilerini git geçmişinden kaldırın

### **Kimlik Bilgisi Rotasyon Programı**

- **JWT Secret'lar**: Her 90 günde bir
- **API Anahtarları**: Her 6 ayda bir
- **Veritabanı Şifreleri**: Her 6 ayda bir
- **E-posta Şifreleri**: Her 6 ayda bir

## 🔧 Uygulama Durumu

### **✅ TAMAMLANDI (17 Temmuz 2025)**

- [x] Tüm production kimlik bilgileri repository'den kaldırıldı
- [x] Güvenli placeholder şablonları oluşturuldu
- [x] Backup dosyaları için `.gitignore` güncellendi
- [x] Development mock kimlik bilgileri oluşturuldu
- [x] Güvenlik kılavuzları dokümante edildi

### **📋 YAPILACAKLAR**

- [ ] Vercel environment variables ayarlayın
- [ ] GitHub Actions secrets konfigüre edin
- [ ] Kimlik bilgisi rotasyon programını uygulayın
- [ ] Kimlik bilgisi sızıntısı izleme sistemi kurun

## 📞 Güvenlik İletişim

**Güvenlik Sorunları**: Derhal geliştirme ekibine bildirin  
**Kimlik Bilgisi Sızıntısı**: Acil durum prosedürlerini takip edin  
**Sorular**: Önce bu kılavuzu kontrol edin, sonra ekibe sorun

---

**⚠️ UNUTMAYIN**: Güvenlik herkesin sorumluluğudur. Emin olmadığınızda placeholder değerler kullanın ve ekibe sorun.

**🚨 KRİTİK**: Bu dosya gerçek kimlik bilgileri içermez - sadece güvenlik kılavuzları ve örnekler içerir.
