---
id: intro
title: İ-EP.APP Dokümantasyonu
sidebar_position: 1
slug: /
last_updated: 2025-01-08
---

# İ-EP.APP Dokümantasyonuna Hoş Geldiniz

İ-EP.APP (Iqra Eğitim Portalı), eğitim kurumları için geliştirilmiş çok kiracılı (multi-tenant) bir SaaS platformudur. Bu dokümantasyon, geliştirici ekibi için kapsamlı bir rehber olarak hazırlanmıştır.

## Nedir İ-EP.APP?

İ-EP.APP, eğitim kurumlarının öğrenci, öğretmen ve veli yönetimini tek bir platformda gerçekleştirebilmelerini sağlayan modern bir eğitim yönetim sistemidir. Her eğitim kurumu (okul, kolej, dershane vb.), sistemde ayrı bir tenant (kiracı) olarak yer alır ve kendi özelleştirilmiş yapılandırmasına sahiptir.

## Dizin Yapısı

```
docs/
├── api/                    # API dokümantasyonu
├── components/             # Yeniden kullanılabilir komponentler
├── features/              # Özellik dokümantasyonları
│   ├── super-admin/       # Süper Admin özellikleri
│   ├── tenant-admin/      # Tenant Admin özellikleri
│   ├── teacher/           # Öğretmen özellikleri
│   └── student/           # Öğrenci özellikleri
└── ui-ux/                 # UI/UX tasarım dokümanları
    ├── design-system/     # Tasarım sistemi ve stil rehberi
    ├── layouts/           # Sayfa düzenleri
    ├── user-flows/        # Kullanıcı akış diyagramları
    ├── wireframes/        # Tel çerçeve tasarımları
    └── prototypes/        # Prototip tasarımları
```

## Doküman Türleri

### API Dokümantasyonu
- API endpoint'leri
- Request/Response örnekleri
- Authentication
- Rate limiting

### Komponent Dokümantasyonu
- Kullanım örnekleri
- Props
- Stil varyasyonları
- Best practices

### Özellik Dokümantasyonu
- Özellik açıklaması
- Teknik gereksinimler
- Bağımlılıklar
- Konfigürasyon

### UI/UX Dokümantasyonu
- Tasarım prensipleri
- Komponent kütüphanesi
- Sayfa şablonları
- Kullanıcı akışları
- Erişilebilirlik standartları

## Doküman Yazım Kuralları

1. **Markdown Formatı**
   - Başlıklar için `#` kullanımı
   - Kod blokları için ``` kullanımı
   - Listeler için `-` veya `1.` kullanımı

2. **Diyagramlar**
   - Mermaid.js formatı
   - PlantUML desteği
   - Draw.io entegrasyonu

3. **Kod Örnekleri**
   - TypeScript/JavaScript
   - JSX/TSX
   - CSS/SCSS/Tailwind

4. **Versiyon Kontrolü**
   - Değişiklik geçmişi
   - Breaking changes
   - Deprecation notları

## Katkıda Bulunma

1. Fork repository
2. Yeni branch oluştur
3. Değişiklikleri yap
4. Pull request oluştur

## İletişim

- Teknik sorular için: [tech@iqraedu.com](mailto:tech@iqraedu.com)
- Tasarım sorular için: [design@iqraedu.com](mailto:design@iqraedu.com) 