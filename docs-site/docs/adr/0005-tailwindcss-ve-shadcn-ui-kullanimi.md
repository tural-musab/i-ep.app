# 0005. TailwindCSS ve Shadcn UI Kullanımı

## Bağlam

Iqra Eğitim Portalı'nın frontend geliştirmesi için CSS framework'ü ve UI komponent kütüphanesi seçimi yapılırken aşağıdaki gereksinimler ve kısıtlamalar dikkate alınmıştır:

- Geliştirme hızı ve verimliliği
- Tasarım tutarlılığı ve özelleştirilebilirlik
- Multi-tenant yapıya uygun dinamik temalar
- Erişilebilirlik (a11y) uyumluluğu
- Performans ve bundle boyutu optimizasyonu
- Topluluk desteği ve ekosistem
- Next.js 14 ve App Router ile uyumluluk
- Mobil uyumluluk ve responsive tasarım

CSS framework'ü ve UI komponent kütüphanesi seçimi için aşağıdaki alternatifler değerlendirilmiştir:

- TailwindCSS + Custom Components
- TailwindCSS + Shadcn UI
- Material UI (MUI)
- Chakra UI
- Bootstrap 5
- Styled Components / Emotion
- Mantine UI

## Karar

CSS framework'ü olarak **TailwindCSS** ve UI komponent kütüphanesi olarak **Shadcn UI** kullanılmasına karar verilmiştir. TailwindCSS'in utility-first yaklaşımı ve Shadcn UI'ın yüksek özelleştirilebilir, erişilebilir komponentleri, projenin gereksinimlerini en iyi şekilde karşılamaktadır.

## Durum

Kabul Edildi

## Tarih

2023-12-10

## Sonuçlar

### Olumlu

- **Utility-First Yaklaşım**: HTML içinde doğrudan stil uygulama ile hızlı geliştirme
- **Sıfır CSS Çıktı**: PurgeCSS ile kullanılmayan CSS'in otomatik olarak çıkarılması ve minimal dosya boyutu
- **Responsive Tasarım**: Breakpoint sınıfları ile kolay responsive tasarım
- **Tema Özelleştirme**: CSS değişkenleri ile tenant bazlı tema desteği
- **Erişilebilirlik**: Shadcn UI komponentleri, WAI-ARIA standartlarına uygun
- **Headless Yaklaşım**: Shadcn UI, headless komponentlerin üzerine inşa edilmiş, tam kontrol sağlar
- **Kaynak Kodu İçeride**: Shadcn UI bir kütüphane değil, komponentlerin proje içine eklenmesini sağlayan bir koleksiyon
- **TypeScript Desteği**: Tam TypeScript desteği
- **Server Components Uyumluluğu**: Next.js App Router ve Server Components ile tam uyumluluk

### Olumsuz

- **Öğrenme Eğrisi**: Utility sınıfları nedeniyle ilk başta öğrenme zorluğu
- **HTML Karmaşıklığı**: Çok sayıda sınıf HTML'i daha karmaşık hale getirebilir
- **IDE Desteği**: IDE'lerde otomatik tamamlama ve dokümentasyon desteği gerektirir
- **Komponent Bakımı**: Shadcn UI güncellemeleri manuel olarak takip edilmeli ve uygulanmalıdır

### Nötr

- TailwindCSS ve Shadcn UI tema sistemi ile tüm tenantlar için dinamik tema desteği sağlanabilir
- IntelliSense eklentisi ile geliştirme deneyimi iyileştirilebilir
- Tailwind Typography eklentisi ile Markdown içeriği kolayca stillenebilir
- Shadcn UI komponentleri, projenin ihtiyaçlarına göre özelleştirilebilir

## Alternatifler

### Material UI (MUI)

- **Avantajlar**: Kapsamlı komponent kütüphanesi, Material Design uyumluluğu, olgun ekosistem
- **Dezavantajlar**: Kalın ve özelleştirilmesi zor tasarım, daha büyük bundle boyutu, Next.js Server Components ile uyumluluk sorunları

### Chakra UI

- **Avantajlar**: İyi erişilebilirlik, iyi tema sistemi, modern tasarım
- **Dezavantajlar**: Next.js App Router ve Server Components ile uyumluluk sorunları, özelleştirme sınırlamaları

### Bootstrap 5

- **Avantajlar**: Bilinen ve yaygın, hızlı prototipleme
- **Dezavantajlar**: Daha az özelleştirilebilir, "Bootstrap görünümü", utility sınıfları daha az kapsamlı

### Styled Components / Emotion

- **Avantajlar**: Komponent bazlı CSS-in-JS, dinamik stiller
- **Dezavantajlar**: Runtime overhead, Server Components ile uyumluluk sorunları, daha fazla boilerplate kod

### Mantine UI

- **Avantajlar**: Modern, kapsamlı, headless komponentler
- **Dezavantajlar**: Nispeten daha küçük topluluk, CSS-in-JS limitasyonları

## Komponent Yapısı Stratejisi

Iqra Eğitim Portalı için aşağıdaki UI bileşen stratejisi benimsenmiştir:

1. **Atom Komponentler**: Temel UI elementleri (Button, Input, Select vb.)
   - Shadcn UI'dan alınan base komponentler
   - TailwindCSS ile stillenmiş ve özelleştirilmiş

2. **Molekül Komponentler**: Atom komponentlerin birleşimi (Form, Card, Alert vb.)
   - Atom komponentleri kullanan kompozit komponentler
   - Tenant-specific özelleştirmeler

3. **Organizma Komponentler**: Karmaşık UI blokları (Navigation, Dashboard Widgets vb.)
   - İş mantığı ile entegre edilmiş
   - Uygulama data flow'una bağlı

4. **Tenant Tema Sistemi**:
   - CSS değişkenleri ile dinamik tema
   - Tenant metadata'sından renkler ve stiller
   - Tema geçişleri için context provider

## İlgili Kararlar

- [0001](0001-nextjs-14-kullanimi.md) Next.js 14 Kullanımı

## Kaynaklar

- [TailwindCSS Dokümantasyonu](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TailwindCSS ile Tema Oluşturma](https://tailwindcss.com/docs/theme)
- [Next.js ile TailwindCSS Kurulumu](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
