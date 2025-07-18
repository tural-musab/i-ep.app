# 0006. React Hook Form ve Zod Kullanımı

## Bağlam

Iqra Eğitim Portalı'nda form yönetimi ve veri doğrulama (validasyon) için kullanılacak kütüphanelerin seçimi yapılırken aşağıdaki gereksinimler ve kısıtlamalar dikkate alınmıştır:

- Performans ve yeniden render optimizasyonu
- TypeScript ile tip güvenliği ve otomatik tamamlama
- Server-side validation ile client-side validation entegrasyonu
- Karmaşık form durumları yönetimi
- Form verilerinin transformasyonu ve validasyonu
- Next.js 14 ve React Server Components ile uyumluluk
- Boilerplate kod miktarının azaltılması
- Kullanım kolaylığı ve öğrenme eğrisi

Form yönetimi ve validasyon kütüphaneleri için aşağıdaki alternatifler değerlendirilmiştir:

- React Hook Form + Zod
- Formik + Yup
- React Final Form + Joi
- HTML native form + custom validation
- Uncontrolled forms + validation libraries

## Karar

Form yönetimi için **React Hook Form** ve form validasyonu için **Zod** kullanılmasına karar verilmiştir. React Hook Form'un performans odaklı yaklaşımı ve Zod'un TypeScript entegrasyonu, projenin gereksinimlerini en iyi şekilde karşılamaktadır.

## Durum

Kabul Edildi

## Tarih

2024-01-15

## Sonuçlar

### Olumlu

- **Performans Optimizasyonu**: React Hook Form, gereksiz render'ları minimize eder
- **Uncontrolled Components**: Controlled component'lere göre daha yüksek performans
- **TypeScript Integration**: Zod şemaları otomatik olarak TypeScript tipleri oluşturur
- **End-to-End Type Safety**: Form verilerinden veritabanına kadar tip güvenliği
- **Schema Validation**: Hem client hem server tarafında aynı validasyon şeması kullanılabilir
- **Form State Management**: Form durumu, hatalar, dirty fields gibi bilgiler kolay erişilebilir
- **Düşük Bundle Size**: Minimal paket boyutu
- **Esnek API**: Basit ve karmaşık form senaryoları için uygun

### Olumsuz

- **Öğrenme Eğrisi**: React Hook Form API'sinin anlaşılması için zaman gerekebilir
- **Dinamik Formlar**: Çok karmaşık, dinamik formlar için ek konfigürasyon gerekebilir
- **Server Actions Entegrasyonu**: Next.js Server Actions ile entegrasyon için ek wrapper'lar gerektirebilir
- **Form Reset Mekanizmaları**: Form temizleme ve reset işlemlerinde dikkatli olunmalıdır

### Nötr

- Zod şemaları, hem istemci hem de sunucu tarafında form doğrulaması için kullanılabilir
- React Hook Form'un devtools eklentisi ile debugging kolaylaştırılabilir
- Zod, form verilerinin transformasyonu için de kullanılabilir
- Server-side rendering (SSR) ile kompatibilite için özel yaklaşımlar gerekebilir

## Alternatifler

### Formik + Yup

- **Avantajlar**: Popüler, olgun ekosistem, iyi dokümantasyon
- **Dezavantajlar**: Daha fazla re-render, React 18 ile bazı uyumluluk sorunları, daha geniş bundle size

### React Final Form + Joi

- **Avantajlar**: Subscription-based render optimizasyonu, esnek API
- **Dezavantajlar**: TypeScript entegrasyonu daha az güçlü, Joi şema syntax'ı daha verbose olabilir

### HTML Native Form + Custom Validation

- **Avantajlar**: Minimal bağımlılık, tam kontrol
- **Dezavantajlar**: Çok fazla boilerplate kod, validation mantığını her yerde tekrarlama

### Uncontrolled Forms + Validation Libraries

- **Avantajlar**: Basit uygulamalar için yeterli, düşük overhead
- **Dezavantajlar**: Karmaşık form senaryolarını yönetmek zor, durumu takip etmek zor

## Form Stratejisi

Iqra Eğitim Portalı için aşağıdaki form yönetim stratejisi benimsenmiştir:

1. **Form Şema Tanımları**:
   - Zod şemaları ile merkezi form şema tanımları oluşturulacak
   - Her form için TypeScript tip çıkarımları otomatik oluşturulacak
   - Şemalar, hem client hem server validation için kullanılacak

2. **Form Komponenti Yapısı**:
   - Atom form elementleri (Input, Select, Checkbox vb.) için wrappers
   - Form grupları için kompozit komponentler (FormGroup, FormSection)
   - Ortak form mantığı için custom hooks

3. **Form Submission Stratejisi**:
   - Client-side validasyon ile kullanıcı deneyimini iyileştirme
   - Server Actions veya API Routes ile server validasyonu
   - Error handling ve kullanıcı geri bildirimi için standart pattern

4. **Performans Optimizasyonu**:
   - Devtools ile form render performansı analizi
   - React Hook Form'un `shouldUnregister` ve `defaultValues` optimizasyonları
   - Form parçalarını gerektiğinde React.memo ile sarmak

## İlgili Kararlar

- [0001](0001-nextjs-14-kullanimi.md) Next.js 14 Kullanımı
- [0005](0005-tailwindcss-ve-shadcn-ui-kullanimi.md) TailwindCSS ve Shadcn UI Kullanımı

## Kaynaklar

- [React Hook Form Dokümantasyonu](https://react-hook-form.com/)
- [Zod Dokümantasyonu](https://zod.dev/)
- [React Hook Form ile Server Actions Kullanımı](https://react-hook-form.com/advanced-usage#ServerSideRendering)
- [Zod ile TypeScript Entegrasyonu](https://github.com/colinhacks/zod#type-inference)
- [Form Validation Patterns](https://www.smashingmagazine.com/2022/09/frontend-form-validation-guide/)
