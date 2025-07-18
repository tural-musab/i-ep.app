---
id: swagger-ui
title: API Reference (Interactive)
sidebar_position: 2
last_updated: 2025-01-08
---

# API Reference (Interactive)

Bu sayfada İ-EP.APP'in tüm API endpoint'lerini interaktif olarak inceleyebilir ve test edebilirsiniz.

<iframe 
  src="/api-docs" 
  width="100%" 
  height="800px" 
  frameBorder="0"
  title="İ-EP.APP API Documentation"
/>

Alternatif olarak, API dokümantasyonunu yeni bir sekmede açmak için [buraya tıklayın](/api-docs).

## API Kullanımı

API dokümantasyonunu kullanırken dikkat edilmesi gereken noktalar:

1. **Kimlik Doğrulama**: Tüm API endpoint'leri JWT token gerektirir
2. **Tenant Bağlamı**: İstekler tenant subdomain'i veya custom domain üzerinden yapılmalıdır
3. **Rate Limiting**: API istekleri rate limit'e tabidir
4. **CORS**: Frontend uygulamaları için CORS ayarları yapılandırılmıştır

### Test Ortamı

API'yi test etmek için demo tenant'ı kullanabilirsiniz:

- **Tenant**: `demo.i-ep.app`
- **Demo Kullanıcı**: `demo@demo.i-ep.app`
- **Şifre**: `demo123456`

### Postman Collection

API endpoint'lerini Postman'de test etmek için [Postman collection'ımızı](/postman-collection.json) indirebilirsiniz.
