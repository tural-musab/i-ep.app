# Domain Yönetimi ve SSL Sertifikası Rehberi

Bu doküman, İ-EP.APP multi-tenant platformunda domain yönetimi ve SSL sertifikaları hakkında kapsamlı bilgi sağlar.

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Domain Yapılandırma](#domain-yapılandırma)
   - [Subdomain Yapısı](#subdomain-yapısı)
   - [Özel Domain Kurulumu](#özel-domain-kurulumu)
3. [Cloudflare Entegrasyonu](#cloudflare-entegrasyonu)
   - [Cloudflare Hesabı Oluşturma](#cloudflare-hesabı-oluşturma)
   - [Domain Ekleme](#domain-ekleme)
   - [DNS Ayarları](#dns-ayarları)
   - [Proxy Yapılandırma](#proxy-yapılandırma)
4. [SSL Sertifikası Yönetimi](#ssl-sertifikası-yönetimi)
   - [SSL Sertifikası Oluşturma](#ssl-sertifikası-oluşturma)
   - [Sertifika Yenileme](#sertifika-yenileme)
   - [SSL Sorun Giderme](#ssl-sorun-giderme)
5. [Domain Doğrulama](#domain-doğrulama)
6. [Birden Çok Domain ve Subdomain Yönetimi](#birden-çok-domain-ve-subdomain-yönetimi)

## Genel Bakış

İ-EP.APP platformu, her tenant (kiracı) için aşağıdaki iki domain yapılandırma seçeneğini sunar:

1. **Subdomain Yapısı**: Her tenant için otomatik olarak oluşturulan bir subdomain (`tenant-name.i-ep.app`)
2. **Özel Domain**: Tenant'in kendi özel domainini kullanma seçeneği (`www.tenant-domain.com`)

Her iki durumda da, güvenli bağlantı için SSL sertifikaları otomatik olarak oluşturulur ve yönetilir.

## Domain Yapılandırma

### Subdomain Yapısı

Her yeni tenant oluşturulduğunda, sistem otomatik olarak bir subdomain atar. Subdomain adı, tenant oluşturma sırasında belirtilen subdomain adı kullanılarak belirlenir.

**Format**: `{subdomain}.i-ep.app`

**Örnek**: `test-okul-1.i-ep.app`

Subdomain'ler için DNS yapılandırması otomatik olarak yapılır ve herhangi bir ek işlem gerektirmez.

### Özel Domain Kurulumu

Tenant'lar kendi özel domainlerini kullanmak isterlerse, aşağıdaki adımlar izlenir:

1. Tenant, Super Admin panelinden "Domain Yönetimi" bölümüne gider
2. "Yeni Domain Ekle" butonuna tıklar
3. Domain adını (örn. `okul.example.com`) girer
4. Platform, gerekli DNS kayıtlarını gösterir (doğrulama için)
5. Tenant, domain sağlayıcısında bu DNS kayıtlarını ekler
6. Doğrulama işlemi tamamlandığında domain aktif hale gelir

## Cloudflare Entegrasyonu

İ-EP.APP platformu, domain yönetimi ve SSL sertifikalarını otomatikleştirmek için Cloudflare ile entegre çalışır.

### Cloudflare Hesabı Oluşturma

1. Eğer henüz bir Cloudflare hesabınız yoksa, [Cloudflare'de bir hesap oluşturun](https://dash.cloudflare.com/sign-up)
2. E-posta adresinizi doğrulayın
3. Cloudflare kontrol paneline giriş yapın

### Domain Ekleme

1. Cloudflare kontrol panelinde "Add a Site" (Site Ekle) düğmesine tıklayın
2. İ-EP.APP için kullanmak istediğiniz ana domaini ekleyin (örn. `i-ep.app`)
3. Uygun plan seçin (Free plan başlangıç için yeterli olabilir)
4. Cloudflare'in DNS sunucularını domain sağlayıcınıza kaydedin
   - Cloudflare size iki ad sunucusu (nameserver) adresi verecektir
   - Bu adresleri domain sağlayıcınızın kontrol panelinde nameserver olarak ayarlayın

### DNS Ayarları

Cloudflare'de temel DNS kayıtlarını ayarlayın:

1. Ana domain için A kaydı:

   ```
   Tip: A
   Ad: @
   İçerik: [Sunucu IP Adresi]
   Proxy durumu: Proxy'lendi (turuncu bulut)
   TTL: Otomatik
   ```

2. www subdomaini için CNAME kaydı:

   ```
   Tip: CNAME
   Ad: www
   İçerik: @
   Proxy durumu: Proxy'lendi (turuncu bulut)
   TTL: Otomatik
   ```

3. Tenant subdomain'leri için wildcard CNAME kaydı:
   ```
   Tip: CNAME
   Ad: *
   İçerik: tenant-proxy.i-ep.app
   Proxy durumu: Proxy'lendi (turuncu bulut)
   TTL: Otomatik
   ```

### Proxy Yapılandırma

Cloudflare'de optimum güvenlik ve performans için aşağıdaki ayarları yapın:

1. **SSL Ayarı**: "SSL/TLS" bölümünde "Full (Strict)" modunu seçin
2. **HTTPS Yönlendirme**: "SSL/TLS" > "Edge Certificates" altında "Always Use HTTPS" seçeneğini etkinleştirin
3. **Minimum TLS Sürümü**: "SSL/TLS" > "Edge Certificates" altında minimum TLS sürümünü 1.2 olarak ayarlayın
4. **Bot Koruması**: "Security" > "Bot Fight Mode" özelliğini etkinleştirin
5. **Page Rules**: Gerekiyorsa cache ve yönlendirme kuralları oluşturun

## SSL Sertifikası Yönetimi

### SSL Sertifikası Oluşturma

İ-EP.APP platformu, SSL sertifikalarını iki farklı şekilde yönetir:

1. **Subdomain SSL**: Ana `i-ep.app` domaini için wildcard SSL sertifikası kullanılır, tüm subdomain'ler bu sertifikayı otomatik olarak kullanır.

2. **Özel Domain SSL**: Özel domainler için aşağıdaki SSL sertifika türleri kullanılır:
   - **Cloudflare Universal SSL**: Cloudflare ile entegre edilmiş domainler için otomatik olarak sağlanır
   - **Let's Encrypt SSL**: Cloudflare kullanılmayan domainler için otomatik olarak oluşturulur

Özel domainler için SSL sertifikası oluşturma adımları:

1. Domain doğrulama işlemi tamamlandıktan sonra, sistem otomatik olarak Let's Encrypt SSL sertifikası oluşturma işlemini başlatır
2. SSL sertifikası oluşturma durumu "SSL" sekmesinde izlenebilir
3. Sertifika başarıyla oluşturulduğunda, domain statüsü "active" olarak güncellenir ve HTTPS protokolü üzerinden erişilebilir hale gelir

### Sertifika Yenileme

SSL sertifikaları otomatik olarak yenilenir:

1. **Let's Encrypt SSL**: Let's Encrypt sertifikaları 90 gün geçerlidir ve sistem tarafından her 60 günde bir otomatik olarak yenilenir
2. **Cloudflare SSL**: Cloudflare sertifikaları 15 yıl geçerlidir ve Cloudflare tarafından otomatik olarak yönetilir

### SSL Sorun Giderme

SSL sertifikaları ile ilgili yaygın sorunlar ve çözümleri:

1. **Sertifika Doğrulama Hatası**:
   - DNS kayıtlarının doğru yapılandırıldığından emin olun
   - Domaininin Cloudflare'in DNS sunucularını kullandığını doğrulayın
   - HTTP doğrulama kullanılıyorsa, domain'in HTTP üzerinden erişilebilir olduğunu kontrol edin

2. **Mixed Content Hatası**:
   - Frontend uygulamanızda tüm kaynakların (JS, CSS, resimler) HTTPS üzerinden yüklendiğinden emin olun
   - Kaynak kodda HTTP url'leri olup olmadığını kontrol edin

3. **Sertifika Uyumsuzluğu**:
   - Domain adı ile sertifikanın aynı olduğunu kontrol edin
   - Alt domain kullanıyorsanız, wildcard sertifikasının (\*) doğru yapılandırıldığından emin olun

## Domain Doğrulama

Özel domain eklerken, domain sahipliğini doğrulamak için iki yöntem sunulur:

1. **DNS Doğrulama** (Önerilen):
   - Sistem, domain için bir TXT kaydı verir
   - Bu TXT kaydını domain DNS ayarlarınıza eklemeniz gerekir
   - Format: `i-ep-verification=xxxxxxxxxxxxx`
   - DNS değişikliklerinin yayılması 24 saate kadar sürebilir

2. **HTTP Doğrulama**:
   - Domain root dizinine özel bir .txt dosyası yerleştirmeniz istenir
   - Dosya adı ve içeriği sistem tarafından belirtilir
   - Domain HTTP üzerinden erişilebilir olmalıdır

Doğrulama işlemi tamamlandıktan sonra, "Doğrula" düğmesine tıklayarak doğrulama sürecini başlatabilirsiniz.

## Birden Çok Domain ve Subdomain Yönetimi

Bir tenant birden fazla domain ve subdomain kullanabilir:

1. **Ana Domain**: Tenant'ın temel web sitesi için ana domain (örn. `okul.example.com`)
2. **Alt Servisler**: Farklı uygulamalar için subdomainler (örn. `panel.okul.example.com`, `ogrenci.okul.example.com`)
3. **Ek Domainler**: Farklı markalar veya bölümler için ek domainler (örn. `okulsitesi.com`, `okul-bilgi.com`)

Her bir domain veya subdomain, Super Admin panelinden aynı tenant'a bağlanabilir.

---

Bu dokümanı güncel tutmak önemlidir. Domain yönetimi veya SSL sertifikası ile ilgili sorunlar yaşıyorsanız, lütfen teknik destek ekibiyle iletişime geçin.
