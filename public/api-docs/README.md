# İ-EP.APP API Dokümantasyonu

Bu dizin, İ-EP.APP API'si için OpenAPI (Swagger) dokümantasyonunu içerir. Geliştirilmiş arayüz ile daha kolay navigasyon ve daha iyi bir kullanıcı deneyimi sunmaktadır.

## İçerik

- `swagger.yaml`: OpenAPI 3.0 formatında API tanımları
- `index.html`: Geliştirilmiş Swagger UI görüntüleme sayfası

## Yeni Arayüz Özellikleri

Geliştirilmiş Swagger UI arayüzü aşağıdaki özellikleri içerir:

- **Responsive Tasarım**: Masaüstü, tablet ve mobil cihazlarda uyumlu çalışır
- **Tema Desteği**: Varsayılan (mavi), koyu ve yeşil tema seçenekleri
- **Koyu/Açık Mod Geçişi**: Kullanıcı tercihine göre koyu ve açık mod arası hızlı geçiş
- **Gelişmiş Kenar Çubuğu**: API kategorileri ve şemaları için dinamik navigasyon
- **Versiyon Seçici**: Farklı API versiyonları arasında geçiş yapabilme

## Swagger UI'yi Görüntüleme

API dokümantasyonunu interaktif olarak görüntülemek için:

1. Next.js development server'ı başlatın:

```bash
npm run dev
```

2. Tarayıcınızda `http://localhost:3000/api-docs` adresine gidin

## API Kategorileri

API dokümantasyonu aşağıdaki kategorilere ayrılmıştır:

- **Auth**: Kimlik doğrulama işlemleri
- **Tenant**: Tenant yönetimi
- **Users**: Kullanıcı yönetimi
- **Students**: Öğrenci yönetimi
- **Classes**: Sınıf yönetimi
- **Domains**: Domain yönetimi

## İstemci Kodu Oluşturma

Bu API tanımını kullanarak çeşitli programlama dilleri için istemci kodu oluşturabilirsiniz. Swagger Codegen veya OpenAPI Generator kullanarak bunu yapabilirsiniz:

```bash
# OpenAPI Generator ile TypeScript istemcisi oluşturma
npx @openapitools/openapi-generator-cli generate -i swagger.yaml -g typescript-fetch -o ./generated-client
```

## API Testleri

API'yi test etmek için Postman veya Insomnia gibi araçlar kullanabilirsiniz. Swagger tanım dosyasını bu araçlara import ederek hızlı bir şekilde test koleksiyonu oluşturabilirsiniz:

1. Postman'de "Import" düğmesine tıklayın
2. `swagger.yaml` dosyasını seçin
3. Tüm API endpoint'leri için hazır istek koleksiyonu oluşturulacaktır

## Multi-Tenant Mimarisi

Bu API çok kiracılı (multi-tenant) bir SaaS platformu için tasarlanmıştır. API istekleri her zaman bir tenant bağlamında yapılmalıdır. Bu, URL'deki subdomain (veya özel domain) ile belirlenir.

Örneğin:

- `https://tenant1.i-ep.app/api/users`
- `https://ozel-domain.com/api/users`

## API Versiyonlama

API versiyonlaması URL ve Accept başlığı üzerinden yapılır:

```
GET /api/v1/users
Accept: application/json; version=1
```

## Hata Kodları ve Çözümleri

API kullanırken karşılaşabileceğiniz yaygın hata kodları ve çözümleri için [Hata Kodları](/docs/api/error-codes.md) sayfasına bakabilirsiniz.

## SSL ve Domain Yapılandırması

Tenant'lar için SSL ve özel domain yapılandırması ile ilgili bilgiler için [Domain Yönetimi ve SSL Rehberi](/docs/domain-management-guide.md) dokümanına bakınız.
