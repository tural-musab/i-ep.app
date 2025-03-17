# Iqra Eğitim Portalı SaaS - Proje Planı

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

## Geliştirme Aşamaları

### Aşama 1: Temel Mimari ve Altyapı (Ay 1-3)
- Multi-tenant mimari tasarımı ve uygulaması
- Kimlik doğrulama ve yetkilendirme sistemi
- Temel veritabanı şeması ve ilişkileri
- Temel API rotaları
- Test ve dokümantasyon stratejisi
- Yedekleme ve veri taşınabilirliği altyapısı

### Aşama 2: MVP Geliştirme (Ay 4-6)
- Okul, sınıf, öğrenci ve öğretmen yönetimi
- Temel not sistemi
- Abonelik ve ödeme entegrasyonu
- Tenant onboarding süreci
- Kullanıcı deneyimi izleme kurulumu

### Aşama 3: MVP Lansman ve Geribildirim (Ay 7-8)
- Demo tenant oluşturma
- Güvenlik denetimi ve penetrasyon testi
- Beta kullanıcı grubu oluşturma
- MVP lansmanı
- Kullanıcı geribildirimlerinin toplanması ve analizi

### Aşama 4: İkinci Dalga Özellikler (Ay 9-12)
- Devamsızlık takibi
- Ödev sistemi
- Duyuru ve etkinlik yönetimi
- Gelişmiş raporlama ve analitik
- Topluluk özelliklerinin geliştirilmesi

### Aşama 5: İleri Özellikler ve Büyüme (Ay 12-14)
- Entegrasyonlar (Google Workspace, Microsoft 365, vb.)
- Performans ve ölçeklenebilirlik optimizasyonları
- İş büyütme ve pazarlama araçları
- Mobil deneyim iyileştirmeleri

### Gelecek Aşamalar (14+ ay)
- Gerçek zamanlı işbirliği özellikleri
- Yapay zeka destekli analitik
- Çoklu dil desteği
- Entegrasyon pazarı

## Tamamlanan Özellikler

### Multi-Tenant Altyapısı
- [x] Her tenant için subdomain desteği
- [x] Premium kullanıcılar için özel domain desteği
- [x] Domain yönetimi admin paneli
- [x] Cloudflare entegrasyonu ile otomatik DNS ve SSL yönetimi

### Temel Mimari
- [x] Next.js 14 App Router yapısı
- [x] Middleware ile tenant tespiti
- [x] TypeScript tip güvenliği
- [x] Tailwind CSS ile tutarlı UI

## Teknik Yaklaşım

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Query
- **Backend**: Supabase, PostgreSQL, Serverless Functions
- **Veritabanı**: Hibrit tenant izolasyonu (şema + prefix)
- **Önbellek**: Redis
- **Kimlik Doğrulama**: Supabase Auth, JWT
- **CI/CD**: GitHub Actions, Vercel
- **İzleme**: Sentry, Vercel Analytics, Custom UX izleme

## Kalite Güvencesi

- Birim ve entegrasyon testleri (Jest, React Testing Library)
- E2E testleri (Cypress/Playwright)
- Düzenli güvenlik denetimleri
- Performans testleri
- A/B testleri
- Kullanıcı deneyimi izleme

## Sürdürülebilirlik Stratejileri

- **Teknik Borç Yönetimi**: Her sprint'in %20'si teknik borç azaltımına ayrılacak
- **SLA Yönetimi**: Net SLA metrikleri ve ölçümü
- **Topluluk Geliştirme**: Aktif kullanıcı topluluğu oluşturma ve sürdürme
- **Kültürel Adaptasyon**: Bölgesel ihtiyaçlara uyum sağlama
- **Felaket Kurtarma**: Kapsamlı yedekleme ve iş sürekliliği planları

## Başarı Metrikleri

- Aktif tenant sayısı ve büyüme oranı
- Kullanıcı başına aylık gelir (ARPU)
- Müşteri edinme maliyeti (CAC)
- Müşteri yaşam boyu değeri (LTV)
- Churn oranı
- Net Promoter Score (NPS)
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

## İlerleme Takibi

Proje ilerlemesi PROGRESS.md dosyasında ayrıntılı olarak takip edilecek ve her sprint sonunda güncellenecektir. MVP öncesi kontrol listesi, projenin canlıya alınmadan önce tüm kritik gereksinimleri karşıladığından emin olmak için kullanılacaktır.

## Kaynaklar ve Bağlantılar

- [PROGRESS.md](../PROGRESS.md): Ayrıntılı ilerleme listesi
- [technical-debt.md](technical-debt.md): Teknik borç yönetim stratejisi
- [sla-definitions.md](sla-definitions.md): SLA tanımları ve ölçümleri
- [community-strategy.md](community-strategy.md): Topluluk oluşturma stratejisi
- [cultural-adaptation.md](cultural-adaptation.md): Kültürel ve bölgesel farklılıklar yaklaşımı
- [mvp-checklist.md](mvp-checklist.md): MVP öncesi kontrol listesi
- [demo-tenant-guide.md](demo-tenant-guide.md): Demo tenant oluşturma kılavuzu
- [developer-docs-plan.md](developer-docs-plan.md): Geliştirici dokümantasyonu planı
- [ux-monitoring-plan.md](ux-monitoring-plan.md): Kullanıcı deneyimi izleme planı