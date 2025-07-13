# Yeni Domain'e Geçiş Planı

## 1. Ön Hazırlık Aşaması

### 1.1. Domain Satın Alma ve DNS Yapılandırması
- [x] Yeni domain adını satın alın
- [x] DNS sağlayıcısında gerekli kayıtları oluşturun
- [x] DNS sağlayıcısı olarak Cloudflare kullanımına devam edilecekse, yeni domain için Cloudflare'de hesap açın/mevcut hesaba ekleyin

### 1.2. Geçiş Stratejisi Belirleme
- [x] Geçiş tarihini belirleyin 
- [x] Bakım penceresi planlayın
- [x] Kiracı (tenant) bilgilendirme planı oluşturun

### 1.3. Geliştirme Ortamı Hazırlığı
- [x] Geliştirme ortamında test edebilmek için gerekli alt yapıyı hazırlayın
- [x] Test için yeni domain adını yapılandırın

## 2. Kod Tabanında Değişiklikler

### 2.1. Ortam Değişkenlerini Yapılandırma
- [x] `.env.local` dosyasında `NEXT_PUBLIC_BASE_DOMAIN` değerini yeni domain ile güncelleyin
- [x] Domain ile ilgili diğer çevre değişkenlerini kontrol edin ve güncelleyin
- [x] Cloudflare yapılandırmasını güncelleyin (`CLOUDFLARE_ZONE_ID` vb.)

### 2.2. Sabit Kodlanmış Değerleri Değiştirme
Aşağıdaki dosyalarda geçen tüm "i-ep.app" referanslarını yeni domain ile değiştirin:

- [x] `src/middleware.ts`
- [x] `src/lib/swagger.ts`
- [x] `src/lib/domain/cloudflare-domain-manager.ts`
- [x] `src/app/[tenant]/layout.tsx`
- [x] `src/app/[tenant]/page.tsx`
- [x] `README.md`

### 2.3. Dokümantasyon Güncellemeleri
- [ ] `docs/` klasöründeki tüm belgeleri kontrol edin ve domain referanslarını güncelleyin
- [ ] API endpoint örneklerini güncelleyin
- [ ] E-posta adreslerini yeni domain ile güncelleyin

## 3. Veritabanı Güncellemeleri

### 3.1. Tenant Kayıtlarını Güncelleme
- [ ] Tenant subdomain bilgilerini içeren tabloda gerekli güncellemeleri yapın
```sql
UPDATE tenants
SET domain = REPLACE(domain, 'i-ep.app', 'yenidomain.com')
WHERE domain LIKE '%.i-ep.app';
```

### 3.2. E-posta Adresleri
- [ ] Kullanıcı e-posta adreslerini kontrol edin ve gerekiyorsa güncelleyin
```sql
UPDATE users
SET email = REPLACE(email, '@i-ep.app', '@yenidomain.com')
WHERE email LIKE '%@i-ep.app';
```

### 3.3. Diğer Domain Referansları
- [ ] Veritabanında depolanan URL'leri, domain referanslarını güncelleyin

## 4. Altyapı Güncellemeleri

### 4.1. SSL Sertifikaları
- [ ] Yeni domain için SSL sertifikası alın
- [ ] Subdomain'ler için wildcard SSL sertifikası alın
- [ ] SSL sertifikalarını sunuculara yükleyin

### 4.2. DNS Yapılandırması
- [ ] Ana domain için A/AAAA kayıtlarını oluşturun
- [ ] Gerekli subdomainler için CNAME kayıtları oluşturun:
  - `*.yenidomain.com` → Tenant subdomainleri için
  - `api.yenidomain.com` → API
  - `auth.yenidomain.com` → Kimlik doğrulama hizmetleri
  - `status.yenidomain.com` → Durum sayfası

### 4.3. E-posta Yapılandırması
- [ ] E-posta sunucularını yapılandırın
- [ ] MX, SPF, DKIM, DMARC kayıtlarını oluşturun
- [ ] E-posta yönlendirmelerini ayarlayın

## 5. Servis Güncellemeleri

### 5.1. Supabase Yapılandırması
- [ ] Supabase projesinde URL ve domain ayarlarını güncelleyin
- [ ] Auth URL'leri güncelleyin
- [ ] CORS yapılandırmasını güncelleyin

### 5.2. CI/CD Pipeline
- [ ] GitHub Actions veya diğer CI/CD araçlarınızda environment değişkenlerini güncelleyin
- [ ] Deployment hedeflerini güncelleyin

### 5.3. Üçüncü Parti Servisler
- [ ] Üçüncü parti servislerde (analitik, izleme vb.) domain ayarlarını güncelleyin

## 6. Test Aşaması

### 6.1. Geliştirme Ortamında Test
- [ ] Geliştirme ortamında tüm özellikleri test edin
- [ ] Tenant izolasyonunu test edin
- [ ] Auth akışını test edin
- [ ] API endpoint'lerini test edin

### 6.2. Staging Ortamında Test
- [ ] Üretim benzeri bir ortamda testleri tekrarlayın
- [ ] Performans testleri yapın
- [ ] Güvenlik testleri yapın

## 7. Geçiş Süreci

### 7.1. Kiracı Bilgilendirmesi
- [ ] Tüm kiracılara planlanan domain değişikliği hakkında bilgilendirme e-postası gönderin
- [ ] Değişiklik tarihini ve olası etkileri açıklayın
- [ ] SSS sayfası oluşturun

### 7.2. Yeni Domain'e Geçiş
- [ ] Planlanan bakım penceresinde geçişi başlatın
- [ ] DNS yönlendirmelerini aktifleştirin
- [ ] Veritabanı güncellemelerini yapın
- [ ] Eski domain'den yeni domain'e 301 yönlendirmeleri yapılandırın

### 7.3. Doğrulama
- [ ] Ana sitede tüm özellikleri doğrulayın
- [ ] Örnek kiracı sitelerinde tüm özellikleri doğrulayın
- [ ] E-posta gönderim ve alımını test edin
- [ ] API erişimini test edin

## 8. Geçiş Sonrası

### 8.1. İzleme
- [ ] Hata oranlarını izleyin
- [ ] Performans metriklerini izleyin
- [ ] Kullanıcı şikayetlerini takip edin

### 8.2. Eski Domain Yönetimi
- [ ] Eski domain yönlendirmelerini en az 6 ay sürdürün
- [ ] Yönlendirmelerin düzgün çalıştığını periyodik olarak kontrol edin
- [ ] Eski domain'in kayıtlarını yenilemeyi unutmayın

### 8.3. Dokümantasyon Güncellemesi
- [ ] Tüm dış dokümantasyonu güncelleyin
- [ ] Domain değişikliği hakkında teknik not yayınlayın

## 9. SEO ve Pazarlama Güncellemeleri

### 9.1. SEO Optimizasyonu
- [ ] Arama motorlarına site haritası gönderin
- [ ] Search Console'da domain değişikliğini bildirin
- [ ] Canonical URL'leri kontrol edin ve güncelleyin

### 9.2. Sosyal Medya ve Pazarlama
- [ ] Sosyal medya profillerindeki linkleri güncelleyin
- [ ] Pazarlama materyallerini güncelleyin

## 10. İlerleme Takibi

Bu belgeyi yeni domain'e geçiş sürecinde ilerlemenizi takip etmek için kullanabilirsiniz. Her adımı tamamladıkça işaretleyin ve gerekirse notlar ekleyin. 