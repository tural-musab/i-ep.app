# İ-EP.APP API Dokümantasyonu

Bu dizin, İ-EP.APP API'si için OpenAPI (Swagger) dokümantasyonunu içerir.

## İçerik

- `swagger.yaml`: OpenAPI 3.0 formatında API tanımları
- `index.html`: Swagger UI görüntüleme sayfası

## Swagger UI'yi Görüntüleme

API dokümantasyonunu interaktif olarak görüntülemek için:

1. Bu dizini bir HTTP sunucusu üzerinden servis edin:

```bash
# Yerleşik Python HTTP sunucusu ile
cd api-docs
python -m http.server 8080
```

2. Tarayıcınızda `http://localhost:8080` adresine gidin

Alternatif olarak, herhangi bir statik dosya sunucusu kullanarak da dosyaları servis edebilirsiniz.

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

## Notlar

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
