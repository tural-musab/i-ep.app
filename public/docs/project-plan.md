# Iqra Eğitim Portalı SaaS - Proje Planı

> **Not**: Bu belge genel proje planını ve stratejik bakış açısını içermektedir. Detaylı ve güncel görev takibi için [PROGRESS.md](../PROGRESS.md) dosyasını inceleyiniz.

## Proje Özeti

Iqra Eğitim Portalı, eğitim kurumları için geliştirilen çok kiracılı (multi-tenant) SaaS modelli bir okul yönetim sistemidir. Bu platform, Türkiye eğitim sistemine uygun olarak tasarlanmış olup, her eğitim kurumunun kendi alt alan adı (subdomain) veya özel alan adı üzerinden hizmet almasını sağlar.

Sistem, Next.js 14, TypeScript, Tailwind CSS ve Supabase teknolojilerini kullanarak modern ve ölçeklenebilir bir mimari üzerine inşa edilmiştir. Proje, MVP (Minimum Viable Product) yaklaşımıyla başlayıp kademeli olarak genişletilecek şekilde planlanmıştır.

## Stratejik Hedefler

1. **Kullanıcı Merkezli Tasarım**: Okul yöneticileri, öğretmenler, öğrenciler ve velilerin ihtiyaçlarını karşılayan, kullanımı kolay bir platform sunmak
2. **Ölçeklenebilir Mimari**: Yüzlerce okul ve binlerce kullanıcıyı destekleyebilen sağlam bir teknik altyapı oluşturmak
3. **KVKK Uyumlu**: Türkiye'deki veri koruma mevzuatına tam uyumlu bir sistem geliştirmek
4. **Rekabetçi SaaS Modeli**: Farklı okul büyüklükleri ve ihtiyaçlarına yönelik esnek abonelik planları sunmak
5. **Güçlü Topluluk**: Kullanıcılar arasında bilgi paylaşımını teşvik eden bir topluluk oluşturmak
6. **Kültürel Adaptasyon**: Türkiye'nin farklı bölgelerindeki eğitim kurumlarının ihtiyaçlarına duyarlı bir sistem tasarlamak

## Abonelik Modeli

Iqra Eğitim Portalı üç farklı abonelik planı sunacaktır:

1. **Ücretsiz Plan**
   - 30 öğrenciye kadar
   - Temel özellikler
   - Subdomain (okul.i-ep.app)
   - Topluluk desteği

2. **Standart Plan**
   - 300 öğrenciye kadar
   - Gelişmiş özellikler
   - E-posta desteği
   - 12 saat içinde yanıt
   - %99.9 uptime garantisi

3. **Premium Plan**
   - Sınırsız öğrenci
   - Tüm özellikler
   - Özel domain desteği
   - White-label seçeneği
   - Öncelikli destek (4 saat içinde)
   - %99.95 uptime garantisi
   - API erişimi

Tüm yeni kullanıcılara 14 günlük ücretsiz deneme süresi sunulacaktır (kredi kartı gerektirmeden).

## Geliştirme Aşamaları (PROGRESS.md ile Uyumlu)

### Aşama 1: Temel Mimari, Dokümantasyon ve Test (Ay 1-3) ✅

Temel mimari ve altyapı çalışmaları şu adımları içermiştir:
- Next.js 14 tabanlı proje yapısı oluşturma
- Çok kiracılı (multi-tenant) mimari tasarımı ve uygulaması
- Supabase veritabanı entegrasyonu ve şema tasarımı
- Kimlik doğrulama ve yetkilendirme sistemi başlangıçları
- Test stratejisi ve dokümantasyon altyapısı
- Yedekleme ve veri taşınabilirliği çözümleri

Bu aşama tamamen tamamlanmış olup, tüm alt görevler başarıyla gerçekleştirilmiştir. Detaylı görev takibi için [PROGRESS.md](../PROGRESS.md) dosyasını inceleyiniz.

### Aşama 2: Temel İşlevsellik ve Güvenlik (Ay 4-6) 🚧

Bu aşamada şu an çalışılan ana bileşenler:
- Kimlik doğrulama ve güvenlik sisteminin tamamlanması 🚧
- Domain yönetimi ve kurumsal doğrulama ✅
- Temel kullanıcı arayüzü ve yönetim paneli
- Öğrenci ve sınıf yönetimi
- Öğretmen ve ders yönetimi
- Super Admin paneli geliştirme 🚧
- Abonelik ve ödeme sistemi

#### Super Admin Paneli Geliştirme 🚧
Platformun tüm tenant'larını ve sistem genelini yönetmek için kritik öneme sahip olan bu panel, aşağıdaki modülleri içerecektir:
- Sistem sağlığı izleme ve metrikleri (SSL durum, sistem metrikleri)
- Yedekleme ve kurtarma yönetimi
- Denetim ve güvenlik logları
- Webhook yönetimi
- Tenant ve domain yönetimi
- Super Admin API entegrasyonları

### Aşama 3: MVP Lansman ve Geri Bildirim (Ay 7-8)

Bu aşama, platformun ilk kullanılabilir versiyonunun hazırlanması ve beta kullanıcılarına sunulmasını içerecektir:
- Demo okul ortamı oluşturma
- Not ve değerlendirme sistemi geliştirme
- Devamsızlık ve yoklama takibi
- Güvenlik denetimi ve performans çalışmaları
- Beta lansman ve kullanıcı geri bildirimi toplama

### Aşama 4: Gelişmiş Özellikler ve Entegrasyonlar (Ay 9-12)

Bu aşamada daha ileri düzey özellikler eklenecektir:
- İletişim ve bildirim sistemi
- Ödeme ve finans yönetimi
- Analitik ve raporlama sistemi
- Otomatik iş akışları
- Mobil uyumluluk ve uygulama geliştirme

### Aşama 5: Ölçeklendirme ve Genişletme (Ay 12-14)

Ölçeklenebilirlik ve genişletme çalışmaları şunları içerecektir:
- API ve entegrasyon katmanı
- İçerik yönetim sistemi (CMS)
- Kapsamlı özelleştirme
- Performans optimizasyonu
- Gelişmiş güvenlik ve uyumluluk çalışmaları

### Aşama 6: Yapay Zeka ve Gelecek Özellikler (14+ ay)

Uzun vadeli planlar arasında yer alan özellikler:
- Yapay zeka ve machine learning uygulamaları
- Topluluk ve ekosistem geliştirme
- Gerçek zamanlı işbirliği özellikleri
- İş büyütme ve pazarlama araçları

## Tamamlanan Özellikler ve Mevcut Durum

### Tamamlanan Temel Mimari ve Altyapı ✅
- Next.js 14 ile proje yapısı (App Router)
- TypeScript ve Tailwind CSS entegrasyonu
- Çok kiracılı (multi-tenant) mimari (hibrit yaklaşım)
- Tenant izolasyon stratejisi ve Row Level Security
- Tenant subdomain ve özel domain desteği
- Test altyapısı ve dokümantasyon sistemleri
- Yedekleme ve veri taşınabilirliği çözümleri

### Tamamlanan Domain Yönetimi ✅
- Cloudflare API entegrasyonu
- Subdomain ve özel domain yönetimi
- SSL sertifika ve DNS yönetimi
- Domain izolasyonu ve middleware
- Domain bazlı tenant erişim kontrolü
- Kurumsal hesap doğrulama mekanizmaları

### Devam Eden Geliştirmeler 🚧

#### Kimlik Doğrulama ve Güvenlik 🚧
- Supabase Auth entegrasyonu (ilerlemekte)
- Rol tabanlı erişim kontrolleri (tasarım aşamasında)
- JWT token yapılandırması (planlanıyor)
- Güvenlik özellikleri ve iki faktörlü kimlik doğrulama (planlanıyor)

#### Super Admin Paneli 🚧
- Panel dokümantasyonu (tamamlandı)
- Panel gereksinimleri ve komponent yapıları (tamamlandı)
- Ana dashboard ve sistem sağlığı modülü (geliştiriliyor)
- Diğer panel modülleri (planlanıyor)

## Teknik Yaklaşım

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Backend**: Supabase, PostgreSQL, Serverless Functions
- **Veritabanı**: Hibrit tenant izolasyonu (şema + prefix)
- **Önbellek**: Redis
- **Kimlik Doğrulama**: Supabase Auth, JWT
- **CI/CD**: GitHub Actions, Vercel
- **İzleme**: Sentry, Vercel Analytics, Custom UX izleme

## Sürdürülebilirlik Stratejileri

### Teknik Sürdürülebilirlik
- **Teknik Borç Yönetimi**: Her sprint'in %20'si teknik borç azaltımına ayrılacak
- **Kod Kalitesi**: Pull request'lerin minimum %90 test kapsamı gerektirmesi
- **Dokümantasyon**: Kodun sürekli olarak belgelendirilmesi
- **Modüler Tasarım**: Yeni özelliklerin modüler şekilde eklenmesi

### Operasyonel Sürdürülebilirlik
- **SLA Yönetimi**: Net SLA metrikleri tanımlama ve ölçüm mekanizmaları
- **Otomasyon**: Rutin işlemlerin otomatikleştirilmesi
- **İzleme**: Kapsamlı sistem izleme ve uyarı mekanizmaları
- **Felaket Kurtarma**: Kapsamlı yedekleme ve iş sürekliliği planları

### Topluluk ve Kültürel Sürdürülebilirlik
- **Kullanıcı Eğitimi**: Eğitim materyalleri ve webinarlar
- **Topluluk Geliştirme**: Aktif kullanıcı topluluğu oluşturma
- **Kültürel Adaptasyon**: Bölgesel ihtiyaçlara uyum sağlama
- **Eğitim Sistemi Uyumluluğu**: MEB müfredatı ve gereksinimlerine uygunluk

## Başarı Metrikleri

### Kullanıcı ve Finansal Metrikler
- Aktif tenant sayısı ve büyüme oranı
- Kullanıcı başına aylık gelir (ARPU)
- Müşteri edinme maliyeti (CAC)
- Müşteri yaşam boyu değeri (LTV)
- Aylık tekrarlayan gelir (MRR) ve büyüme oranı

### Operasyonel ve Memnuniyet Metrikleri
- Sistem uptime yüzdesi ve ortalama yanıt süresi
- Net Promoter Score (NPS)
- Churn oranı
- Özellik kullanım oranları
- Destek ticket sayısı ve çözüm süresi

## Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| Teknik ölçeklenebilirlik sorunları | Orta | Yüksek | Erken yük testleri, hibrit izolasyon yaklaşımı |
| Düşük kullanıcı adaptasyonu | Orta | Yüksek | Kullanıcı merkezli tasarım, kapsamlı onboarding |
| Veri güvenliği ihlalleri | Düşük | Çok Yüksek | Düzenli güvenlik denetimleri, penetrasyon testleri |
| Rekabet baskısı | Orta | Orta | Farklılaştırma, topluluk odaklı yaklaşım |
| Mevzuat değişiklikleri | Düşük | Orta | Proaktif mevzuat takibi, uyarlanabilir tasarım |
| Teknik borç birikimi | Yüksek | Orta | Sprint'lerin %20'sinin teknik borca ayrılması |
| Tenant izolasyon hataları | Düşük | Çok Yüksek | Kapsamlı test senaryoları, izolasyon denetimleri |

## Risk Yönetim Süreci

Proje boyunca aşağıdaki risk yönetim süreçleri uygulanacaktır:
- Düzenli risk değerlendirme toplantıları (iki haftada bir)
- Risk göstergelerinin tanımlanması ve takibi
- Erken uyarı sistemleri
- Risk azaltma planları ve iş sürekliliği testleri

## İlerleme Takibi

Proje ilerlemesi [PROGRESS.md](../PROGRESS.md) dosyasında ayrıntılı olarak takip edilmektedir. Bu dosya tüm aşamaları, görevleri ve tamamlanma durumlarını içerir. Super Admin panelinin detaylı geliştirme süreci de bu dosyada belgelenmiştir.

Geliştirme ekibi haftalık olarak ilerlemeyi gözden geçirecek ve PROGRESS.md dosyasını güncelleyecektir. Bu yaklaşım, projenin şeffaf bir şekilde izlenmesini ve ekip üyeleri arasında etkili iletişimi sağlayacaktır.

## Kaynaklar ve Bağlantılar

- [PROGRESS.md](../PROGRESS.md): Ayrıntılı ilerleme listesi
- [Super Admin Documentation](../docs/features/super-admin/README.md): Super Admin paneli dokümantasyonu
- [technical-debt.md](technical-debt.md): Teknik borç yönetim stratejisi
- [sla-definitions.md](sla-definitions.md): SLA tanımları ve ölçümleri
- [community-strategy.md](community-strategy.md): Topluluk oluşturma stratejisi
- [cultural-adaptation.md](cultural-adaptation.md): Kültürel ve bölgesel farklılıklar yaklaşımı
- [mvp-checklist.md](mvp-checklist.md): MVP öncesi kontrol listesi
- [demo-tenant-guide.md](demo-tenant-guide.md): Demo tenant oluşturma kılavuzu
- [developer-docs-plan.md](developer-docs-plan.md): Geliştirici dokümantasyonu planı
- [ux-monitoring-plan.md](ux-monitoring-plan.md): Kullanıcı deneyimi izleme planı