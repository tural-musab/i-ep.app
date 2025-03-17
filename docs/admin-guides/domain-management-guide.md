# Admin Kullanıcıları İçin Domain Yönetimi Kılavuzu

Bu kılavuz, Maarif Okul Portalı sistem yöneticileri için domain yönetimi süreçlerini adım adım açıklamaktadır. Domain yönetimi, tenant izolasyonu ve erişim kontrolü için kritik öneme sahiptir.

## İçerik

- [Genel Bakış](#genel-bakış)
- [Domain Yönetim Paneli](#domain-yönetim-paneli)
- [Subdomain Yönetimi](#subdomain-yönetimi)
- [Özel Domain Yönetimi](#özel-domain-yönetimi)
- [SSL Sertifikaları](#ssl-sertifikaları)
- [Sorun Giderme](#sorun-giderme)
- [En İyi Uygulamalar](#en-iyi-uygulamalar)

## Genel Bakış

Maarif Okul Portalı, her okul için ayrı bir domain veya subdomain kullanarak multi-tenant mimarisi üzerinde çalışır. Bu yapı sayesinde:

- Her okul benzersiz bir URL'ye sahip olur
- Tenant izolasyonu sağlanır
- Okullar kendi marka kimliklerini yansıtabilir
- Güvenlik ve erişim kontrolü geliştirilir

## Domain Yönetim Paneli

Admin panelinde domain yönetimi için şu adımları izleyin:

1. Admin hesabınızla giriş yapın
2. Sol menüden "Sistem Yönetimi" > "Domain Yönetimi" seçeneğine tıklayın
3. Domain listesi ve yönetim seçenekleri görüntülenecektir

![Domain Yönetim Paneli](../images/domain-management-panel.png)

## Subdomain Yönetimi

### Yeni Subdomain Oluşturma

1. Domain yönetim panelinde "Yeni Subdomain Ekle" butonuna tıklayın
2. Tenant seçin veya yeni tenant oluşturun
3. Subdomain adını girin (sadece küçük harfler, rakamlar ve tire kullanılabilir)
4. "Oluştur" butonuna tıklayın
5. Subdomain otomatik olarak yapılandırılacak ve birkaç dakika içinde aktif hale gelecektir

### Subdomain Düzenleme

1. Domain listesinden düzenlemek istediğiniz subdomain'i bulun
2. "Düzenle" ikonuna tıklayın
3. Gerekli değişiklikleri yapın (not: subdomain adı değiştirilemez)
4. "Kaydet" butonuna tıklayın

### Subdomain Silme

1. Domain listesinden silmek istediğiniz subdomain'i bulun
2. "Sil" ikonuna tıklayın
3. Onay mesajını dikkatli bir şekilde okuyun
4. Subdomain adını yazarak işlemi onaylayın
5. "Sil" butonuna tıklayın

> **Uyarı**: Subdomain silme işlemi geri alınamaz ve tenant erişimini etkileyebilir.

## Özel Domain Yönetimi

### Özel Domain Ekleme

1. Domain yönetim panelinde "Özel Domain Ekle" butonuna tıklayın
2. İlgili tenant'ı seçin
3. Özel domain adını girin (örn. `okuladi.com` veya `portal.okuladi.com`)
4. "Ekle" butonuna tıklayın
5. DNS yapılandırma talimatları görüntülenecektir:

```
CNAME kaydı ekleyin:
okuladi.com -> maarifportal.com
```

6. Bu talimatları domain sağlayıcınızın DNS yönetim panelinde uygulayın
7. "DNS Yapılandırmasını Kontrol Et" butonuna tıklayın

### Domain Doğrulama

1. DNS yapılandırması tamamlandıktan sonra, domain otomatik olarak düzenli aralıklarla kontrol edilecektir
2. Manuel olarak doğrulamak için, domain listesinden ilgili domain'i bulun ve "Doğrula" butonuna tıklayın
3. Doğrulama başarılı olursa, domain durumu "Doğrulandı" olarak güncellenecektir
4. SSL sertifikası otomatik olarak sağlanacaktır (bu işlem 24 saate kadar sürebilir)

### Primary Domain Ayarlama

1. Domain listesinden primary olarak ayarlamak istediğiniz doğrulanmış domain'i bulun
2. "Primary Olarak Ayarla" butonuna tıklayın
3. Onay mesajını kabul edin
4. Domain artık tenant için primary domain olarak ayarlanmıştır

> **Not**: Sadece doğrulanmış domainler primary olarak ayarlanabilir.

## SSL Sertifikaları

SSL sertifikaları, Cloudflare tarafından otomatik olarak sağlanır ve yönetilir.

### SSL Durumu Kontrol Etme

1. Domain listesinde, ilgili domain'in "SSL Durumu" sütununu kontrol edin
2. "Aktif" durumu sertifikanın doğru yapılandırıldığını gösterir
3. "Beklemede" durumu sertifikanın hala oluşturulduğunu gösterir
4. "Hata" durumu sertifika oluşturma sorunlarını gösterir

### SSL Sorunlarını Çözme

1. Domain'in DNS yapılandırmasının doğru olduğundan emin olun
2. Domain doğrulamasının tamamlandığını kontrol edin
3. 24 saat bekleyin, SSL sağlama işlemi zaman alabilir
4. Sorunlar devam ederse "SSL'i Yenile" butonuna tıklayın

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### Domain Doğrulama Hatası

**Sorun**: Domain doğrulama işlemi başarısız oluyor.

**Çözüm**:
1. DNS sağlayıcınızın kontrol panelinde CNAME kaydını kontrol edin
2. Kaydın doğru formatta olduğundan emin olun
3. DNS değişikliklerinin yayılması için 24-48 saat bekleyin
4. `dig` veya `nslookup` araçlarıyla DNS kayıtlarını kontrol edin:
   ```
   dig CNAME okuladi.com
   ```
5. "DNS Yapılandırmasını Kontrol Et" butonunu kullanarak tekrar deneyin

#### SSL Sertifika Sorunları

**Sorun**: SSL sertifikası oluşturulmuyor veya "Geçersiz Sertifika" hatası alınıyor.

**Çözüm**:
1. Domain doğrulamasının tamamlandığını kontrol edin
2. Cloudflare SSL modunun "Full" olarak ayarlandığından emin olun
3. 24 saat bekleyin, SSL sağlama işlemi zaman alabilir
4. "SSL'i Yenile" butonuna tıklayarak sertifika oluşturma işlemini yeniden başlatın

#### Subdomain Çakışması

**Sorun**: "Subdomain zaten kullanımda" hatası alınıyor.

**Çözüm**:
1. Farklı bir subdomain adı seçin
2. Eğer bu subdomain daha önce kullanıldıysa ve artık aktif değilse, sistemde temizlenmesi için 7 gün bekleyin
3. Acil durumlarda destek ekibiyle iletişime geçin

## En İyi Uygulamalar

### Güvenlik

- Premium tenant'lar için özel domainleri teşvik edin
- Subdomain adlarını tahmin edilemez veya kurumun tam adını içermeyecek şekilde seçin
- Düzenli olarak kullanılmayan domainleri kaldırın

### Performans

- Fazla sayıda subdomain oluşturmaktan kaçının
- DNS yapılandırması için düşük TTL değerleri kullanın (hızlı değişiklik için)
- Premium tenant'lar için CDN kullanımını etkinleştirin

### Domain Seçimi

- Kısa ve hatırlanması kolay subdomain adları kullanın
- Okulun resmi adını yansıtan domainler tercih edin
- Özel karakterlerden ve uzun adlardan kaçının

## Destek

Domain yönetimi ile ilgili sorunlarınız için:

- E-posta: domain-support@maarifportal.com
- Destek portalı: https://destek.maarifportal.com
- Telefon: +90 (212) XXX-XX-XX (Mesai saatleri içinde) 