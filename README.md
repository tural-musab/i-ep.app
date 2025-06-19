# Iqra Eğitim Portalı (i-ep.app)

![Iqra Eğitim Portalı Logo](public/logo.webp)

**Iqra Eğitim Portalı**, Türkiye'deki eğitim kurumları için özel olarak geliştirilmiş, çok kiracılı (multi-tenant) bir SaaS okul yönetim sistemidir. Platform, okulların yönetim süreçlerini dijitalleştirerek, öğrenci, öğretmen, veli ve yöneticiler arasında kesintisiz bir iletişim ve işbirliği sağlar.

## 🌟 Genel Bakış

Iqra Eğitim Portalı, modern eğitim teknolojileriyle Türk eğitim sisteminin ihtiyaçlarını buluşturan, ölçeklenebilir ve güvenli bir platformdur. Her okul (tenant), kendi alt alan adında izole edilmiş bir ortamda çalışır, böylece veriler güvenle korunurken, ortak altyapı sayesinde maliyet avantajı sağlanır.

### 🎯 Vizyon

Türkiye'deki her okul için kolay erişilebilir, kullanıcı dostu ve ekonomik bir eğitim yönetim çözümü sunarak, eğitimde dijital dönüşümü hızlandırmak.

### 🧩 Temel Değerler

- **Kullanıcı Odaklılık**: Tüm paydaşlar için sezgisel ve kolay kullanım
- **Veri Güvenliği**: KVKK uyumlu, güvenli veri yönetimi
- **Esneklik**: Farklı okul türleri ve büyüklüklerine uyarlanabilir çözümler
- **Sürekli İyileştirme**: Kullanıcı geri bildirimlerine dayalı geliştirme
- **Yerelleştirilmiş Çözüm**: Türk eğitim sistemine özel tasarım

## ✨ Özellikler

### 🏫 Multi-Tenant Mimari
- Her okul için ayrı subdomain (`okul-adi.i-ep.app`)
- Premium planlar için özel domain desteği
- Tenant bazlı veri izolasyonu
- Merkezi yönetim paneli
- Çok adımlı onboarding süreci ile kolay tenant oluşturma

### �� Kullanıcı Rolleri
- **Yönetici**: Okul yönetimi, kullanıcı ve yapılandırma işlemleri
- **Öğretmen**: Ders, ödev, not ve devamsızlık yönetimi
- **Öğrenci**: Ders programı, ödevler, notlar, duyurular
- **Veli**: Öğrenci gelişimi takibi, öğretmenlerle iletişim

### 💰 Abonelik Modeli
- **Ücretsiz Plan**: Temel özellikler, sınırlı öğrenci sayısı
- **Standart Plan**: Gelişmiş özellikler, orta ölçekli okullar için
- **Premium Plan**: Tüm özellikler, öncelikli destek, özel alan adı

### 📊 Akademik Yönetim
- Müfredat ve ders planlaması
- Ödev ve proje yönetimi
- Not değerlendirme ve karne sistemi
- Devam takibi ve raporlama

### 📱 İletişim ve Etkileşim
- Okul duyuruları ve etkinlik takvimi
- Öğretmen-veli mesajlaşma
- Veli toplantısı planlama
- Anket ve geri bildirim sistemleri

## 🛠️ Teknoloji Yığını

### Frontend
- **Next.js 14**: React framework, SSR ve SSG desteği
- **TypeScript**: Tip güvenli kod geliştirme
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Erişilebilir ve özelleştirilebilir UI komponentleri

### Backend
- **Supabase**: PostgreSQL tabanlı BaaS
- **PostgreSQL**: İlişkisel veritabanı
- **Redis**: Önbellek ve oturum yönetimi

### DevOps
- **Vercel**: Frontend dağıtımı
- **AWS/ECS**: Backend servisler için
- **Docker**: Konteynerizasyon
- **GitHub Actions**: CI/CD pipeline

### Güvenlik
- **Row Level Security (RLS)**: Tenant-seviyesinde veri izolasyonu
- **JWT Tabanlı Kimlik Doğrulama**: Güvenli oturum yönetimi
- **KVKK Uyumlu Veri İşleme**: Kişisel verilerin korunması

## 🚀 Başlarken

### Ön Gereksinimler
- Node.js 18.x veya üzeri
- npm 8.x veya üzeri
- PostgreSQL 14.x veya üzeri (veya Supabase hesabı)
- Git

### Kurulum

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/tural-musab/i-ep.app.git
   cd i-ep.app
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevre değişkenlerini yapılandırın:
   ```bash
   cp .env.example .env.local
   # .env.local dosyasını düzenleyin
   ```

4. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   # veya
   yarn dev
   # veya
   pnpm dev
   # veya
   bun dev
   ```

5. Tarayıcınızda ziyaret edin:
   ```
   http://localhost:3000
   ```

### İlk Tenant Oluşturma

```bash
# Tenant oluşturma script'ini çalıştırın
npm run create-tenant -- --name "Örnek Okul" --subdomain "ornek-okul" --email "admin@ornek.com"
```

### Ek Bilgiler

Bu proje [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) kullanarak [Geist](https://vercel.com/font) font ailesini otomatik olarak optimize eder ve yükler.

## 🔍 Next.js Kaynakları

Next.js hakkında daha fazla bilgi edinmek için:
- [Next.js Dokümantasyonu](https://nextjs.org/docs) - Next.js özellikleri ve API'leri
- [Learn Next.js](https://nextjs.org/learn) - İnteraktif Next.js dersleri
- [Next.js GitHub Deposu](https://github.com/vercel/next.js) - Geri bildirimleriniz ve katkılarınız bekleniyor!
- [Vercel Platform](https://vercel.com) - Next.js uygulamanızı dağıtmak için en kolay yol

## 📂 Mevcut Proje Yapısı

MOP/
├── docs/
│ ├── architecture/
│ │ ├── data-isolation.md
│ │ ├── multi-tenant-strategy.md
│ │ └── tech-stack.md
│ ├── deployment/
│ │ ├── backup-restore.md
│ │ ├── ci-cd-pipeline.md
│ │ └── disaster-recovery.md
│ ├── community-strategy.md
│ ├── cultural-adaptation.md
│ ├── demo-tenant-guide.md
│ ├── developer-docs-plan.md
│ ├── mvp-checklist.md
│ ├── project-plan.md
│ ├── sla-definitions.md
│ ├── technical-debt.md
│ └── ux-monitoring-plan.md
├── .gitignore
├── LICENSE
├── PROGRESS.md
└── README.md


## 🚀 Hedeflenen Proje Yapısı (Uygulama Geliştirme)

MOP/
├── app/ # Next.js 14 App Router
│ ├── [tenant]/ # Tenant-specific routes
│ ├── admin/ # Admin dashboard
│ ├── api/ # API routes
│ └── auth/ # Authentication routes
├── components/ # Reusable components
│ ├── ui/ # UI components (shadcn/ui)
│ ├── tenant/ # Tenant-specific components
│ └── forms/ # Form components
├── lib/ # Utility functions & business logic
│ ├── tenant/ # Tenant management logic
│ ├── supabase/ # Supabase client & utilities
│ └── auth/ # Authentication utilities
├── prisma/ # Prisma ORM schema & migrations
├── public/ # Static assets
├── scripts/ # Utility scripts
└── docs/ # Documentation
├── architecture/ # Architecture docs
└── deployment/ # Deployment docs

## 📚 Dokümantasyon

Detaylı geliştirici dokümantasyonu aşağıdaki dosyalarda bulunabilir:

### Proje Planlama ve Mimari
- [Proje Planı](docs/project-plan.md)
- [Multi-Tenant Stratejisi](docs/architecture/multi-tenant-strategy.md)
- [Veri İzolasyon Stratejisi](docs/architecture/data-isolation.md)
- [Teknoloji Yığını](docs/architecture/tech-stack.md)

### Operasyonel Dokümantasyon
- [Yedekleme ve Geri Yükleme](docs/deployment/backup-restore.md)
- [Felaketten Kurtarma Planı](docs/deployment/disaster-recovery.md)
- [CI/CD Pipeline](docs/deployment/ci-cd-pipeline.md)

### Stratejik Belgeler
- [Teknik Borç Yönetimi](docs/technical-debt.md)
- [SLA Tanımları](docs/sla-definitions.md)
- [Community Building Stratejisi](docs/community-strategy.md)
- [Kültürel ve Bölgesel Farklılıklar Yönetimi](docs/cultural-adaptation.md)

### Geliştirici Kaynakları
- [MVP Kontrol Listesi](docs/mvp-checklist.md)
- [Demo Tenant Oluşturma Kılavuzu](docs/demo-tenant-guide.md)
- [Geliştirici Dokümantasyonu Planı](docs/developer-docs-plan.md)
- [UX İzleme Planı](docs/ux-monitoring-plan.md)

## 👨‍💻 Geliştirme

### Branching Stratejisi

- `main`: Üretim kodu (korumalı)
- `develop`: Geliştirme ortamı
- `feature/***`: Yeni özellikler
- `bugfix/***`: Hata düzeltmeleri
- `release/***`: Sürüm hazırlıkları
- `hotfix/***`: Acil üretim düzeltmeleri

### Katkıda Bulunma

1. Projeyi fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Kod Standartları

- ESLint ve Prettier ile kod formatı kontrolü
- TypeScript tipi kontrolü
- Jest ve React Testing Library ile test yazmak
- Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/)

## 📝 İlerleme ve Yol Haritası

Projenin ilerleme durumu ve geliştirme adımları için [PROGRESS.md](PROGRESS.md) dosyasını inceleyebilirsiniz.

### 🗓️ Yol Haritası

#### Faz 1: Temel Mimari ve MVP (3 ay)
- Multi-tenant mimari altyapısı
- Temel kullanıcı yönetimi ve kimlik doğrulama
- Yönetici, öğretmen, öğrenci ve veli rolleri
- Basit okul, sınıf ve ders yapılandırması

#### Faz 2: Akademik Özellikler (3 ay)
- Müfredat ve ders programı yönetimi
- Not ve değerlendirme sistemi
- Ödev ve proje takibi
- Devam/devamsızlık yönetimi

#### Faz 3: İletişim ve Etkileşim (2 ay)
- Mesajlaşma ve bildirim sistemi
- Etkinlik ve duyuru yönetimi
- Veli-öğretmen iletişim kanalları
- Dosya paylaşımı ve depolama

#### Faz 4: Ticari Özellikler (3 ay)
- Abonelik ve ödeme yönetimi
- Faturalandırma sistemi
- Premium özelliklerin etkinleştirilmesi
- Self-servis tenant yönetimi

#### Faz 5: Analitik ve Raporlama (3 ay)
- Okul performans göstergeleri
- Öğrenci gelişim raporları
- Veri analizi ve görselleştirme
- İçgörü ve tavsiye motoru

## 📞 İletişim

- E-posta: info@i-ep.app
- Website: [https://i-ep.app](https://i-ep.app)
- Twitter: [@iEsApp](https://twitter.com/iEsApp)
- LinkedIn: [Iqra Eğitim Portalı](https://linkedin.com/company/i-es)

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## Redis Önbellek Yapılandırması

Proje, Upstash Redis kullanarak önbellekleme işlemleri yapar. Kurulum için:

1. [Upstash](https://upstash.com/) hesabı oluşturun
2. Yeni bir Redis veritabanı oluşturun (önerilen bölge: Frankfurt, EU Central)
3. Veritabanı detaylarından `UPSTASH_REDIS_URL` ve `UPSTASH_REDIS_TOKEN` değerlerini alın
4. Bu değerleri `.env.local` dosyanıza ekleyin:

```
UPSTASH_REDIS_URL=https://eu2-xxxxx.upstash.io
UPSTASH_REDIS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
```

Redis önbellek durumunu kontrol etmek için [http://localhost:3000/api/health/redis](http://localhost:3000/api/health/redis) adresini ziyaret edebilirsiniz.

Örnek önbellek kullanımını test etmek için: [http://localhost:3000/api/cached-example](http://localhost:3000/api/cached-example)

## Ortam Değişkenleri (Environment Variables)

Proje farklı ortamlar için farklı env dosyaları kullanmaktadır:

### Env Dosya Yapısı

- `.env.development` - Geliştirme ortamı için temel değişkenler
- `.env.development.local` - Geliştirme ortamı için yerel değişkenler (git'e eklenmez)
- `.env.production` - Üretim ortamı için temel değişkenler
- `.env.production.local` - Üretim ortamı için yerel değişkenler (git'e eklenmez)
- `.env.staging` - Staging ortamı için temel değişkenler
- `.env.staging.local` - Staging ortamı için yerel değişkenler (git'e eklenmez)
- `.env.test` - Test ortamı için temel değişkenler
- `.env.test.local` - Test ortamı için yerel değişkenler (git'e eklenmez)
- `.env.local` - Tüm ortamlarda geçerli yerel değişkenler (git'e eklenmez)
- `.env.local-remote` - Local frontend + Remote backend hibrit ortamı (git'e eklenmez)

### Kurulum

1. `.env.example` dosyasını kopyalayarak `.env.local` dosyası oluşturun
2. Gerekli değişkenleri kendi ortamınıza göre güncelleyin

### Ortam-Spesifik Komutlar

```bash
# Geliştirme
npm run dev             # Geliştirme ortamı
npm run dev:staging     # Staging ortamı
npm run dev:test        # Test ortamı
npm run dev:local-remote # Local frontend + Remote backend hibrit ortamı

# Build
npm run build             # Üretim ortamı için build
npm run build:staging     # Staging ortamı için build
npm run build:local-remote # Local frontend + Remote backend hibrit ortamı için build

# Başlatma
npm start                # Üretim ortamı
npm run start:staging     # Staging ortamı
npm run start:local-remote # Local frontend + Remote backend hibrit ortamı

# Env Doğrulama
npm run validate:env      # Env değişkenlerinin doğruluğunu kontrol et
```

### Local Frontend + Remote Backend Hibrit Geliştirme

Bazen yerel geliştirme yaparken gerçek (uzaktaki) backend servislerine bağlanmak isteyebilirsiniz. Bu durumda hibrit bir ortam oluşturabilirsiniz:

1. `.env.local-remote` dosyasını yapılandırın:
   ```
   # Yerel frontend ayarları
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development

   # Remote backend ayarları
   NEXT_PUBLIC_SUPABASE_URL=https://your-remote-instance.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-remote-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-remote-service-role-key
   ```

2. Hibrit modda geliştirme sunucusunu başlatın:
   ```bash
   npm run dev:local-remote
   ```

3. Ortamlar arasında geçiş yapmak için:
   ```bash
   # Tamamen yerel ortama geçiş
   npm run dev
   
   # Yerel frontend + Uzak backend ortamına geçiş
   npm run dev:local-remote
   
   # Gerçek staging ortamına geçiş
   npm run dev:staging
   ```

#### Hibrit Ortam için Önemli Notlar

1. **CORS Ayarları**: Remote backend'e yerel ortamdan erişirken CORS hatalarını önlemek için backend tarafındaki CORS ayarlarını yapılandırmanız gerekebilir.
2. **Güvenlik**: Geliştirme makinenizde hassas üretim bilgilerini saklamayın. `.env.local-remote` dosyasını `.gitignore` dosyasına ekleyin.
3. **Ağ Güvenliği**: Uzak backend'e erişirken gerekirse VPN kullanın ve üretim ortamı yerine staging ortamını tercih edin.
4. **Düzenli Temizleme**: Geliştirme veya test amaçlı oluşturduğunuz verileri düzenli olarak temizleyin.

### Önemli Notlar

- Hassas bilgileri içeren `.env.*.local` dosyaları asla git'e eklenmemelidir
- Üretim ortamı değişkenleri güvenli bir şekilde deployment platformunda (örn. Vercel) saklanmalıdır
- `NEXT_PUBLIC_` öneki ile başlayan değişkenler client-side'da kullanılabilir
- Diğer tüm değişkenler sadece server-side'da kullanılabilir

---

Iqra Eğitim Portalı - Türkiye'nin eğitim geleceği için

## Denetim Mekanizması (Audit)

Sistem, kapsamlı bir denetim mekanizması içermektedir. Bu mekanizma şunları sağlar:

### 1. Veritabanı Seviyesinde Denetim
- `audit.audit_logs` tablosu, veritabanındaki INSERT, UPDATE, DELETE işlemlerini otomatik olarak kayıt altına alır
- `log_activity` tetikleyici fonksiyonu ile tüm değişiklikler eski ve yeni veri ile birlikte kaydedilir

### 2. Erişim Reddi Kayıtları
- `audit.access_denied_logs` tablosu, erişim reddedilme durumlarını kayıt altına alır
- Middleware seviyesinde tenant erişim redleri
- RLS politikaları tarafından engellenen erişimler
- Fonksiyon seviyesinde erişim reddi durumları

### 3. Uygulama Seviyesinde Denetim
- Auth modülü içerisinde tüm giriş denemeleri (başarılı/başarısız) kaydedilir
- Tenant erişim kontrolleri middleware seviyesinde denetlenir ve loglanır
- Öğretmen-sınıf, öğretmen-öğrenci erişimleri RLS fonksiyonları ile kontrol edilir

### Denetim Kayıtlarına Erişim
Denetim kayıtlarına yönetici panelinden erişilebilir. Süper admin ve tenant admin kullanıcıları kendi tenant'larına ait kayıtları görüntüleyebilir.

## Güvenlik

Sistem, Row Level Security (RLS) politikaları ile güvenlik sağlar:

1. Tenant izolasyonu - Her kullanıcı sadece kendi tenant'ının verilerine erişebilir
2. Rol bazlı erişim - Kullanıcılar rollerine göre belirli verilere erişebilir
3. Öğretmen erişimi - Öğretmenler sadece kendi sınıflarının ve öğrencilerinin verilerine erişebilir

## Çok Kiracılı Mimari

Platform, çok kiracılı (multi-tenant) bir mimari kullanmaktadır. Her müşteri kendi izole edilmiş ortamında çalışır.

- Subdomain tabanlı tenant ayrımı (`tenant-name.i-ep.app`)
- Özel domain desteği 
- Tenant bazlı veri izolasyonu (RLS ile)
- Tenant bazlı özelleştirmeler

## Çevre Değişkenleri

Projenin çalışması için gerekli olan çevre değişkenleri:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```