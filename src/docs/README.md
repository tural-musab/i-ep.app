# Iqra Eğitim Portalı Dokümantasyonu

Bu dizin, Iqra Eğitim Portalı SaaS projesi için dokümantasyon kaynak dosyalarını içerir. Dokümantasyon, geliştiricilerin projeyi anlamasını, kullanmasını ve katkıda bulunmasını kolaylaştırmak için tasarlanmıştır.

## Dokümantasyon Yapısı

Dokümantasyon, aşağıdaki ana bölümlere ayrılmıştır:

### 1. API Dokümantasyonu (`/docs/api-docs`)

Bu bölüm, REST API'leri için OpenAPI (Swagger) spesifikasyonlarını içerir. API dokümantasyonu, API rotalarındaki JSDoc yorumlarından otomatik olarak oluşturulur.

### 2. Rehberler (`/docs/guides`)

Bu bölüm, özellik kullanımı, entegrasyon ve geliştirme rehberleri gibi derinlemesine açıklamalar içeren MDX dosyalarını içerir.

### 3. Bileşen Dokümantasyonu (`/docs/components`)

Bu bölüm, UI bileşenlerinin kullanımını, props'larını ve varyantlarını açıklayan dokümantasyon dosyalarını içerir.

## Dokümantasyon Akışı

1. **Kaynak Dosyaları**: Tüm dokümantasyon kaynak dosyaları (`/src/docs`) dizininde tutulur.
2. **Derleme**: Next.js, MDX dosyalarını işler ve dokümantasyon sayfalarını oluşturur.
3. **Sunum**: Dokümantasyon, kullanıcı dostu bir arayüzle `/docs` rotasında sunulur.

## Dokümantasyon Yazma Rehberi

### Markdown/MDX Formatı

Rehberler ve açıklamalar için Markdown veya MDX formatını kullanın. MDX, Markdown içinde React bileşenlerini kullanmanıza olanak tanır, böylece interaktif örnekler ve daha zengin içerik oluşturabilirsiniz.

### API Dokümantasyonu

API endpoint'leri için JSDoc yorumlarını kullanın. Bu yorumlar, OpenAPI spesifikasyonunu otomatik olarak oluşturmak için kullanılır.

```typescript
/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Tüm tenant'ları listeler
 *     description: Sistemdeki tüm aktif tenant'ları döndürür
 *     tags:
 *       - tenant
 *     responses:
 *       200:
 *         description: Başarılı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tenant'
 */
export async function GET(request: Request) {
  // İşlem kodu
}
```

### Bileşen Dokümantasyonu

Bileşen dokümantasyonu için aşağıdaki yapıyı kullanın:

1. **Başlık ve Açıklama**: Bileşenin ne olduğunu ve ne için kullanıldığını açıklayın.
2. **Props**: Bileşenin kabul ettiği tüm props'ları listeleyin.
3. **Örnekler**: Bileşenin nasıl kullanılacağına dair kod örnekleri verin.
4. **Varyantlar**: Bileşenin farklı varyantlarını gösterin.

## Dokümantasyon Bakımı

Dokümantasyon, kod değişiklikleriyle birlikte güncellenmelidir. Bir özellik veya API değiştiğinde, ilgili dokümantasyonu da güncellemek, teknik borcun oluşmasını önler.

### Süreç

1. Bir özellik geliştirirken veya değiştirirken, ilgili dokümantasyonu da güncelleyin.
2. Pull request'lerde dokümantasyon değişikliklerini dahil edin.
3. Code review sürecinde dokümantasyon güncellemelerini de kontrol edin.

## Araçlar ve Kütüphaneler

Dokümantasyon sistemimiz aşağıdaki araçları kullanır:

- **next-mdx-remote**: MDX dosyalarını işlemek için
- **next-swagger-doc**: OpenAPI spesifikasyonlarını oluşturmak için
- **swagger-ui-react**: API dokümantasyonunu görüntülemek için
- **remark-gfm**: GitHub Flavored Markdown desteği için
- **rehype-highlight**: Kod bloklarını vurgulamak için
- **rehype-slug**: Başlıklara otomatik ID'ler eklemek için

## Katkıda Bulunma

Dokümantasyona katkıda bulunmak için lütfen şu adımları izleyin:

1. İlgili bölümde yeni bir Markdown veya MDX dosyası oluşturun.
2. Yukarıda açıklanan formatı takip edin.
3. Değişikliklerinizi bir pull request ile gönderin.

Dokümantasyon kalitesi, projenin başarısı için kritik öneme sahiptir. Katkınız için teşekkür ederiz!
