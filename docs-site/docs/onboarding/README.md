---
id: onboarding-intro
title: Geliştirici Onboarding
sidebar_position: 1
last_updated: 2025-01-08
---

# İ-EP.APP Geliştirici Onboarding Rehberi

Bu rehber, İ-EP.APP projesine yeni katılan geliştiricilerin hızlı bir şekilde ortama adapte olmasını sağlamak amacıyla oluşturulmuştur. Dokümantasyon, projenin teknik detaylarını, kurulum adımlarını ve geliştirme süreçlerini kapsamlı bir şekilde ele almaktadır.

## İçindekiler

1. [Kurulum Rehberi](./setup-guide.md)
   - Yerel geliştirme ortamının kurulumu
   - Bağımlılıkların yüklenmesi
   - Çevre değişkenlerinin yapılandırılması
   - Veritabanı kurulumu

2. [Mimari Özet](./architecture-overview.md)
   - Sistem mimarisi
   - Teknoloji yığını
   - Multi-tenant yapısı
   - Veri izolasyonu stratejisi

3. [Kod Standartları](./code-standards.md)
   - Yazım kuralları
   - Pull Request süreci
   - Kod gözden geçirme kriterleri
   - Test yazma gereksinimleri

## Hızlı Başlangıç

Aşağıdaki komutlar, projeyi hızlı bir şekilde çalıştırmanıza yardımcı olacaktır:

```bash
# Repo'yu klonla
git clone https://github.com/tural-musab/i-ep.app.git
cd i-ep.app

# Bağımlılıkları yükle
npm install

# Çevre değişkenlerini ayarla
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Geliştirme sunucusunu başlat
npm run dev
```

## Yardım ve Destek

Eğer herhangi bir sorunla karşılaşırsanız veya daha fazla bilgiye ihtiyaç duyarsanız, aşağıdaki kaynakları kullanabilirsiniz:

- GitHub Issues: Teknik sorunlar için
- Slack Kanalı: #i-ep-dev kanalında anlık yardım
- Haftalık Ekip Toplantıları: Her Çarşamba 10:00'da yapılan geliştirici toplantıları

## Katkıda Bulunma

Projeye katkıda bulunmak isteyenler, [CONTRIBUTING.md](../../CONTRIBUTING.md) dokümanını inceleyebilir. 