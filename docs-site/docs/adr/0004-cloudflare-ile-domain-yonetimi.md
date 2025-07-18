# 0004. Cloudflare ile Domain Yönetimi

## Bağlam

Iqra Eğitim Portalı, çok kiracılı (multi-tenant) bir SaaS uygulaması olarak her eğitim kurumu için ayrı bir erişim noktası sağlamalıdır. Bu erişim noktaları, tenant'lar için bir kimlik oluşturur ve sisteme güvenli erişim sağlar.

Domain yönetimi için aşağıdaki gereksinimler dikkate alınmıştır:

- Her tenant için `okuladi.i-ep.app` formatında otomatik subdomain oluşturma
- Premium tenant'lar için özel domain desteği (örn. `portal.okuladi.com`)
- Otomatik SSL sertifikası oluşturma ve yenileme
- Güvenli ve hızlı DNS yönetimi
- Programatik API ile domain yönetimi
- DDoS koruması ve güvenlik
- DNS kayıtlarının doğrulanması ve izlenmesi
- Domain doğrulama mekanizmaları

Domain yönetimi için aşağıdaki alternatifler değerlendirilmiştir:

- AWS Route 53
- Cloudflare
- GoDaddy API
- Google Cloud DNS
- Vercel Domain API

## Karar

Domain yönetimi için **Cloudflare** kullanılmasına karar verilmiştir. Cloudflare'in DNS yönetimi, SSL sertifikaları, güvenlik özellikleri ve kapsamlı API'si, projenin domain yönetimi gereksinimlerini karşılamak için en uygun çözümü sunmaktadır.

## Durum

Kabul Edildi

## Tarih

2023-12-05

## Sonuçlar

### Olumlu

- **Geniş API Desteği**: Cloudflare API ile otomatik DNS kaydı oluşturma, güncelleme ve silme
- **Hızlı DNS Yayılımı**: Cloudflare'in global CDN ağı sayesinde DNS değişiklikleri hızla yayılır
- **Ücretsiz SSL Sertifikaları**: Tüm domainler için otomatik SSL sertifikaları
- **DDoS Koruması**: Tüm domainler için otomatik DDoS koruması
- **Yüksek Performans**: CDN entegrasyonu ile hızlı sayfa yükleme süreleri
- **Programatik Yönetim**: Tenant oluşturma ve silme süreçlerine entegre edilebilir
- **Wildcard Sertifikalar**: `*.i-ep.app` için wildcard sertifika kullanımı
- **DNS İzleme**: DNS kayıtlarının durumunu ve sağlığını izleme
- **Özel Domain Doğrulama**: Özel domainler için doğrulama mekanizmaları

### Olumsuz

- **API Sınırlamaları**: Cloudflare Free plan için API istek limitleri mevcut
- **Konfigürasyon Karmaşıklığı**: Özel domainler için konfigürasyon süreci karmaşık olabilir
- **Bağımlılık**: Cloudflare'e bağımlılık, potansiyel vendor lock-in riski oluşturabilir

### Nötr

- Cloudflare Workers ile edge fonksiyonları kullanılabilir
- Domain doğrulama süreçlerinin otomatikleştirilmesi gerekir
- Özel domainler için manuel adımlar hala gerekebilir

## Alternatifler

### AWS Route 53

- **Avantajlar**: AWS entegrasyonu, güvenilirlik, programatik kontrol
- **Dezavantajlar**: Her domain/subdomain için ayrı ücret, daha karmaşık API

### GoDaddy API

- **Avantajlar**: Geniş domain portföyü, domain kayıt entegrasyonu
- **Dezavantajlar**: Sınırlı API yetenekleri, CDN ve güvenlik özelliklerinin olmaması

### Google Cloud DNS

- **Avantajlar**: Google Cloud entegrasyonu, ölçeklenebilirlik
- **Dezavantajlar**: Daha karmaşık yapılandırma, CDN ve SSL entegrasyonunun ayrıca yapılması gerekir

### Vercel Domain API

- **Avantajlar**: Vercel hosting ile entegrasyon, basit kullanım
- **Dezavantajlar**: Sınırlı özelleştirme, daha az gelişmiş DNS yönetimi

## Domain Yönetim Stratejisi

Iqra Eğitim Portalı için aşağıdaki domain yönetim stratejisi benimsenmiştir:

1. **Subdomain Otomasyonu**:
   - Her tenant oluşturulduğunda otomatik olarak `okuladi.i-ep.app` formatında subdomain oluşturma
   - DNS kaydı ve SSL sertifikası otomatik yapılandırma

2. **Özel Domain Desteği**:
   - Premium tenant'lar için özel domain ekleme imkanı
   - CNAME veya A kaydı ile doğrulama mekanizması
   - Doğrulama sonrası SSL sertifikası oluşturma

3. **İzleme ve Yönetim**:
   - Tüm domain ve SSL durumlarını izleme
   - Otomatik yenileme ve uyarı mekanizmaları
   - Admin paneli üzerinden domain yönetimi

## İlgili Kararlar

- [0003](0003-multi-tenant-mimari-stratejisi.md) Multi-Tenant Mimari Stratejisi
- [0001](0001-nextjs-14-kullanimi.md) Next.js 14 Kullanımı

## Kaynaklar

- [Cloudflare API Dokümantasyonu](https://developers.cloudflare.com/api/)
- [Cloudflare SSL Sertifikaları](https://developers.cloudflare.com/ssl/)
- [Multi-Tenant Uygulamalar için Domain Stratejileri](https://www.cloudflare.com/learning/cloud/what-is-a-multi-tenant-architecture/)
