# İ-EP.APP Dokümantasyon Yönergeleri

Bu doküman, İ-EP.APP projesinde dokümantasyon yazarken ve güncellerken izlenmesi gereken standartları ve en iyi uygulamaları açıklar.

## Dokümantasyon Yapısı

Proje dokümantasyonu aşağıdaki ana kategorilere ayrılmıştır:

1. **Geliştirici Onboarding (`/docs/onboarding/`)**: Projeye yeni katılan geliştiriciler için rehberler
2. **API Dokümantasyonu (`/docs/api/` ve `/api-docs/`)**: API endpoint'leri ve kullanımları
3. **Mimari Dokümantasyon (`/docs/architecture/`)**: Sistem mimarisi ve tasarım kararları
4. **Test Dokümantasyonu (`/docs/testing/`)**: Test stratejileri ve yöntemleri
5. **Komponent Dokümantasyonu (`/docs/components/`)**: UI komponentleri ve kullanım örnekleri
6. **ADR (Architecture Decision Records) (`/docs/adr/`)**: Mimari kararların kayıtları

## Dokümantasyon Yazım Kuralları

### Genel Kurallar

- Tüm dokümanlar **Markdown** formatında yazılmalıdır
- Dokümanların dili **Türkçe** olmalıdır
- Teknik terimler orijinal halleriyle kullanılabilir (örn. "multi-tenant", "API endpoint" vb.)
- Doküman başlıkları açıklayıcı ve kısa olmalıdır
- Teknik dokümanlarda 2. şahıs anlatımından kaçının, 3. şahıs veya edilgen çatı kullanın
- Cümlelerin kısa ve anlaşılır olmasına dikkat edin

### Dosya Adlandırma

- Dosya adları küçük harflerle yazılmalıdır
- Boşluk yerine kısa çizgi (`-`) kullanılmalıdır
- Dosya isimleri açıklayıcı olmalıdır (örn. `multi-tenant-testing.md`, `api-endpoints.md`)

### Markdown Yapısı

- Her dokümanda bir adet H1 (`#`) başlık bulunmalıdır
- Alt başlıklar hiyerarşik olarak H2, H3, H4 şeklinde kullanılmalıdır
- Kod blokları için triple backtick (\`\`\`) kullanılmalı ve dil belirtilmelidir
- Liste öğeleri için tutarlı semboller kullanın (- veya \* veya 1., 2., ...)
- Tablolar için standart Markdown tablo sözdizimi kullanılmalıdır
- Diyagramlar için [Mermaid](https://mermaid-js.github.io/mermaid/) sözdizimi kullanılmalıdır

### Diyagramlar

- Mimari ve veri akışı diyagramları Mermaid ile oluşturulmalıdır
- Diyagramlar `.md` dosyaları içinde gömülü olarak tanımlanmalıdır
- Diyagramların anlaşılır ve basit olmasına dikkat edin
- Her diyagramın altında açıklama bulunmalıdır

## Dokümantasyon Güncelleme Süreci

### Yeni Dokümantasyon Ekleme

1. İlgili kategorideki klasöre yeni Markdown dosyası ekleyin
2. Dokümantasyonu yazım kurallarına uygun şekilde yazın
3. Gerekiyorsa ilgili `sidebar.js` veya diğer içindekiler listelerine ekleyin
4. Pull Request (PR) açın ve PR template'deki dokümantasyon kontrol listesini tamamlayın

### Mevcut Dokümantasyonu Güncelleme

1. İlgili Markdown dosyasını bulun ve düzenleyin
2. Değişikliklerin diğer dokümanlarda da güncellenmesi gerekiyorsa, ilgili dosyaları da düzenleyin
3. Pull Request açın ve değişiklikleri açıklayın

### API Dokümantasyonu Güncelleme

1. API değişikliği yapıldığında `/api-docs/swagger.yaml` dosyasını güncelleyin
2. API davranışı veya parametreleri hakkındaki açıklamaları güncelleyin
3. Gerekiyorsa API kullanım örneklerini güncelleyin

### Mimari Kararlar (ADR) Ekleme

1. `/docs/adr/` dizinine yeni bir ADR dosyası ekleyin (örn. `0008-yeni-mimari-karar.md`)
2. ADR template'ini kullanarak kararı dokümante edin
3. Karar indeksine (`adr-index.md`) yeni kararı ekleyin

## Dokümantasyon Kalite Kontrolü

Dokümantasyon güncellemelerinde şu kriterlere dikkat edilmelidir:

- **Doğruluk**: Bilgiler güncel ve doğru olmalıdır
- **Kapsam**: Konu kapsamlı bir şekilde ele alınmalıdır
- **Anlaşılırlık**: Açıklamalar net ve anlaşılır olmalıdır
- **Örnekler**: Karmaşık konular için örnekler eklenmelidir
- **Format**: Markdown formatı doğru kullanılmalıdır
- **Görsel Öğeler**: Gerektiğinde diyagramlar, tablolar veya ekran görüntüleri eklenmelidir

## Dokümantasyon Araçları

- **Docusaurus**: Dokümantasyon web sitesi için kullanılmaktadır (`/docs-site/`)
- **Swagger/OpenAPI**: API dokümantasyonu için kullanılmaktadır (`/api-docs/`)
- **Mermaid**: Diyagramlar için kullanılmaktadır
- **GitHub**: Versiyon kontrolü ve işbirliği için kullanılmaktadır

## En İyi Uygulamalar

- Dokümantasyonu, kod değişiklikleriyle aynı PR'da güncelleyin
- Dokümantasyonu, geliştirme süreci tamamlandıktan sonraya bırakmayın
- Karmaşık konularda adım adım rehberler oluşturun
- Hata mesajları ve olası çözümleri dokümante edin
- Tekrar kullanılabilir bilgileri DRY (Don't Repeat Yourself) prensibiyle yönetin
- Dokümantasyonu düzenli olarak gözden geçirin ve güncelleyin

## Dokümantasyon Değerlendirme Kriterleri

PR'lardaki dokümantasyon değişiklikleri şu kriterlere göre değerlendirilecektir:

1. Yazım kurallarına uygunluk
2. Teknik doğruluk
3. Eksiksizlik
4. Anlaşılırlık
5. Formatlama ve düzen
6. Diğer dokümantasyonla tutarlılık
