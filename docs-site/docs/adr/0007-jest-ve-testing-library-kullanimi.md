# 0007. Jest ve Testing Library Kullanımı

## Bağlam

Iqra Eğitim Portalı'nın test stratejisi ve test araçlarının seçimi yapılırken aşağıdaki gereksinimler ve kısıtlamalar dikkate alınmıştır:

- Next.js 14 ve React Server Components ile uyumluluk
- Unit, integration ve end-to-end test kabiliyeti
- TypeScript desteği
- CI/CD pipeline entegrasyonu
- Mocking ve spying kabiliyetleri
- Komponent testleri için kullanıcı odaklı yaklaşım
- Paralel test çalıştırma ve performans
- Test coverage raporlama
- Developer Experience (DX)

Test framework'ü ve test kütüphaneleri için aşağıdaki alternatifler değerlendirilmiştir:

- Jest + React Testing Library
- Vitest + Testing Library
- Mocha + Enzyme
- Jasmine + Enzyme
- Playwright (E2E + Component Testing)
- Cypress (E2E + Component Testing)

## Karar

Unit ve integration testleri için **Jest** ve UI komponent testleri için **React Testing Library** kullanılmasına karar verilmiştir. End-to-end testler için **Playwright** kullanımı tercih edilmiştir. Jest'in olgunluğu, ekosistem desteği ve React Testing Library'nin kullanıcı odaklı test yaklaşımı, projenin gereksinimlerini en iyi şekilde karşılamaktadır.

## Durum

Kabul Edildi

## Tarih

2024-02-05

## Sonuçlar

### Olumlu

- **Geniş Ekosistem**: Jest, en yaygın kullanılan JavaScript test framework'üdür
- **Snapshot Testing**: UI değişikliklerini kolayca yakalama imkanı
- **Mocking Özellikleri**: Modülleri, fonksiyonları ve API'leri kolayca mock'lama
- **Paralel Çalıştırma**: Testleri paralel olarak çalıştırarak hız sağlama
- **TypeScript Desteği**: Tip güvenliği sağlayan entegre TypeScript desteği
- **Kullanıcı Odaklı Testler**: React Testing Library, kullanıcı perspektifiyle test yazmayı teşvik eder
- **Etkileşim Testleri**: Kullanıcı etkileşimlerini simüle etme (tıklama, form doldurma vb.)
- **Erişilebilirlik Testleri**: ARIA ve DOM yapısıyla erişilebilirlik testleri
- **Next.js Entegrasyonu**: Next.js projelerinde kullanım için optimize edilmiş

### Olumsuz

- **Yapılandırma Karmaşıklığı**: Jest konfigürasyonu karmaşık olabilir
- **SSR Testleri**: Server-rendered komponentler için ek yapılandırma gerekir
- **Test Süreleri**: Büyük test suiteleri için uzun çalıştırma süreleri
- **Zaman Simülasyonu**: Zamana bağlı testlerde zorluklar
- **Bundle Size**: Jest, diğer bazı test framework'lerine göre daha büyük

### Nötr

- Jest Mock, spyOn ve timers API'leri kompleks senaryoları test etmeyi kolaylaştırır
- React Testing Library'nin query önceliği, daha dayanıklı testler yazmayı teşvik eder
- Jest watch modu, geliştirme sırasında anlık geri bildirim sağlar
- Bazı durumlarda custom test utils oluşturmak gerekebilir

## Alternatifler

### Vitest + Testing Library
- **Avantajlar**: Daha hızlı çalışma, Vite ile entegrasyon, modern ESM desteği
- **Dezavantajlar**: Daha yeni ve daha az olgun ekosistem, Next.js ile bazı uyumluluk sorunları

### Mocha + Enzyme
- **Avantajlar**: Esnek yapılandırma, olgun ekosistem
- **Dezavantajlar**: React 18 ile tam uyumluluk sorunları, implementasyon odaklı testler

### Jasmine + Enzyme
- **Avantajlar**: Dahili assertions ve spy, basit API
- **Dezavantajlar**: Modern React projelerinde kısıtlı destek, daha az aktif geliştirme

### Cypress Component Testing
- **Avantajlar**: Gerçek tarayıcıda komponent testi, aynı aracı E2E ve komponent testleri için kullanma
- **Dezavantajlar**: Kurulum karmaşıklığı, yavaş test çalıştırma süresi

## Test Stratejisi

Iqra Eğitim Portalı için aşağıdaki test stratejisi benimsenmiştir:

1. **Unit Testler**:
   - Karmaşık business logic için izole unit testler
   - Utility fonksiyonları ve hooks için kapsamlı testler
   - Jest test runner ve expectations kullanımı

2. **Komponent Testleri**:
   - React Testing Library ile kullanıcı odaklı testler
   - Erişilebilirlik (a11y) odaklı seçiciler
   - Minimal mocking ile entegrasyon testi yaklaşımı
   - Snapshot testler (kritik UI komponentleri için)

3. **Integration Testler**:
   - Sayfa komponentleri ve tam sayfa render testleri
   - API istekleri ve veri akışı testleri
   - Form submission süreçleri testleri

4. **End-to-End Testler**:
   - Playwright ile kritik kullanıcı akışları testleri
   - Multi-browser testleri
   - Visual regression testleri

5. **Test Coverage Hedefleri**:
   - Business logic için en az %80 test coverage
   - Komponentler için en az %70 test coverage
   - Kritik kullanıcı akışları için %100 E2E test coverage

## Test Organizasyonu

- `__tests__`: Unit ve integration testleri
- `__e2e__`: End-to-end test senaryoları
- `test-utils`: Test helpers ve custom renders
- `mocks`: Mock veri ve servisler

## İlgili Kararlar

- [0001](0001-nextjs-14-kullanimi.md) Next.js 14 Kullanımı
- [0005](0005-tailwindcss-ve-shadcn-ui-kullanimi.md) TailwindCSS ve Shadcn UI Kullanımı
- [0006](0006-react-hook-form-ve-zod-kullanimi.md) React Hook Form ve Zod Kullanımı

## Kaynaklar

- [Jest Dokümantasyonu](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Next.js Applications](https://nextjs.org/docs/testing)
- [Playwright Documentation](https://playwright.dev/)
- [Kent C. Dodds - Testing Library Principles](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 