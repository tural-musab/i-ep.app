# Iqra Eğitim Portalı

![Iqra Eğitim Portalı Logo](public/logo.svg)

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

### 👥 Kullanıcı Rolleri
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
   git clone https://github.com/i-es/i-ep.app.git
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

---

Iqra Eğitim Portalı - Türkiye'nin eğitim geleceği için