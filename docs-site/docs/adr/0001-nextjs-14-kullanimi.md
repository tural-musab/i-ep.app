# 0001. Next.js 14 Kullanımı

## Bağlam

Iqra Eğitim Portalı için frontend çerçevesi seçimi yapılırken aşağıdaki gereksinimler ve kısıtlamalar dikkate alınmıştır:

- Yüksek performans ve SEO uyumluluğu
- Hızlı sayfa yükleme süreleri
- Kompleks UI bileşenlerini destekleme kapasitesi
- Server-side ve client-side rendering yetenekleri
- Türkiye'deki geliştirici ekosistemi ile uyumluluk
- Uzun vadeli sürdürülebilirlik ve topluluk desteği
- Çok kiracılı mimariye uyumluluk

Frontend çerçevesi seçimi için birden fazla alternatif değerlendirildi:

- React + Custom Setup
- Next.js
- Remix
- Nuxt.js (Vue.js tabanlı)
- SvelteKit

## Karar

Next.js 14 kullanılmasına karar verildi. Next.js'in App Router API'si, React Server Components desteği ve gelişmiş routing özellikleri, projenin gereksinimlerini en iyi şekilde karşılamaktadır.

## Durum

Kabul Edildi

## Tarih

2023-11-15

## Sonuçlar

### Olumlu

- Server-side rendering (SSR) ve statik site generation (SSG) desteği sayesinde daha iyi SEO ve performans
- App Router API ile gelişmiş routing yetenekleri ve daha net kod yapısı
- React Server Components desteği ile daha verimli UI rendering
- API Routes desteği sayesinde backend ve frontend arasında daha iyi entegrasyon
- Otomatik kod bölme ve optimizasyon
- Büyük ve aktif topluluk desteği
- Vercel tarafından geliştirilen ve bakımı yapılan istikrarlı bir çerçeve

### Olumsuz

- React ekosistemi dışındaki geliştiriciler için daha dik bir öğrenme eğrisi
- Vercel'e potansiyel bağımlılık (hosting ve tool desteği açısından)
- Server Components ve Client Components arasındaki ayrım, bazı kompleks durumlarda kod organizasyonunu zorlaştırabilir

### Nötr

- Next.js'in sık güncellemeler alması yeni özellikleri hızlıca kullanmamızı sağlar, ancak potansiyel breaking change'ler içerebilir
- TypeScript ile iyi entegrasyon sağlar ancak tüm özelliklerden yararlanmak için dikkatli tip tanımları gerektirir

## Alternatifler

### React + Custom Setup

- **Avantajlar**: Tam kontrol, özel ihtiyaçlara göre yapılandırma
- **Dezavantajlar**: SSR, routing gibi özellikleri sıfırdan yapılandırmak gerekir, bakım maliyeti yüksek

### Remix

- **Avantajlar**: İyi veri yükleme paradigması, hızlı geliştirme
- **Dezavantajlar**: Nispeten daha küçük topluluk, Türkiye'de daha az yaygın

### Nuxt.js (Vue.js)

- **Avantajlar**: Vue.js'in daha basit sözdizimi, iyi dokümantasyon
- **Dezavantajlar**: Türkiye'de React kadar yaygın bir ekosistem değil, geliştirici bulma zorluğu

### SvelteKit

- **Avantajlar**: Daha az boilerplate kod, daha iyi performans
- **Dezavantajlar**: Daha küçük ekosistem ve topluluk, olgunlaşmamış üçüncü parti kütüphane desteği

## İlgili Kararlar

- [0005](0005-tailwindcss-ve-shadcn-ui-kullanimi.md) TailwindCSS ve Shadcn UI Kullanımı

## Kaynaklar

- [Next.js Resmi Dokümantasyonu](https://nextjs.org/docs)
- [Next.js App Router Mimarisi](https://nextjs.org/docs/app)
- [React Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html)
- [Next.js SEO ve Performans İncelemesi](https://web.dev/articles/nextjs-performance)
