# Kurulum Rehberi

Bu rehber, İ-EP.APP projesinin yerel geliştirme ortamını kurmanız için gereken adımları içermektedir.

## Ön Gereksinimler

İ-EP.APP projesi için aşağıdaki yazılımların yüklü olması gerekmektedir:

- **Node.js**: 18.x veya üzeri
- **npm**: 8.x veya üzeri
- **Git**: En son versiyon
- **PostgreSQL**: 14.x veya üzeri (veya Supabase hesabı)
- **Redis**: 6.x veya üzeri (veya Upstash hesabı)

## Kurulum Adımları

### 1. Repo'yu Klonla

```bash
git clone https://github.com/tural-musab/i-ep.app.git
cd i-ep.app
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Çevre Değişkenlerini Yapılandır

Örnek çevre değişkenleri dosyasını kopyalayın ve düzenleyin:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını açın ve aşağıdaki değişkenleri kendi ortamınıza göre düzenleyin:

```env
# Supabase Konfigürasyonu
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis Konfigürasyonu
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-token

# Uygulama Konfigürasyonu
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Veritabanı Kurulumu

#### A. Supabase Kullanımı

1. [Supabase](https://supabase.io/) üzerinde yeni bir proje oluşturun
2. Proje ayarlarından API URL ve anahtarlarını alın
3. Bu bilgileri `.env.local` dosyasında ilgili değişkenlere ekleyin

#### B. Yerel PostgreSQL Kurulumu

Eğer yerel PostgreSQL kullanmak istiyorsanız:

1. PostgreSQL veritabanı oluşturun:
   ```bash
   createdb i_ep_app
   ```

2. Şema ve tabloları oluşturmak için migration scriptlerini çalıştırın:
   ```bash
   npm run supabase:local:start
   npm run db:migrate
   ```

### 5. Redis Kurulumu

#### A. Upstash Kullanımı

1. [Upstash](https://upstash.com/) üzerinde yeni bir Redis veritabanı oluşturun
2. Bağlantı bilgilerini alın
3. Bu bilgileri `.env.local` dosyasında ilgili değişkenlere ekleyin

#### B. Yerel Redis Kurulumu

Yerel bir Redis sunucusu kurmak için:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Redis Windows için resmi olarak desteklenmez, WSL kullanın veya
# https://github.com/microsoftarchive/redis/releases adresinden kurulum yapın
```

### 6. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama şu adreste çalışacaktır: http://localhost:3000

## Test Tenant'ı Oluşturma

Geliştirme ortamında test için bir tenant oluşturmak istiyorsanız:

```bash
npm run create-tenant -- --name "Test Okul" --subdomain "test-okul" --email "admin@test-okul.com"
```

Bu komut, veritabanınızda yeni bir tenant oluşturacak ve ilgili şemaları ve tabloları ayarlayacaktır.

## Farklı Ortamlarla Çalışma

İ-EP.APP, farklı ortamlar için farklı env dosyaları kullanmaktadır:

| Komut | Ortam | Açıklama |
|-------|-------|----------|
| `npm run dev` | Development | Yerel geliştirme ortamı |
| `npm run dev:staging` | Staging | Staging ortamı konfigürasyonu |
| `npm run dev:local-remote` | Hibrit | Yerel frontend + uzak backend |

## Yaygın Sorunlar ve Çözümleri

### Supabase Bağlantı Hatası

```
Error: Failed to connect to Supabase
```

**Çözüm:**
- `.env.local` dosyasındaki Supabase URL ve anahtarlarının doğru olduğundan emin olun
- Supabase projenizin aktif olduğunu kontrol edin
- Ağ bağlantınızı kontrol edin

### .env Değişkenleri Tanımlanmamış Hatası

```
Error: Please define the NEXT_PUBLIC_SUPABASE_URL environment variable
```

**Çözüm:**
- `.env.local` dosyasının doğru konumda olduğundan emin olun
- Geliştirme sunucusunu yeniden başlatın
- Tüm gerekli çevre değişkenlerinin tanımlandığını kontrol edin

### Redis Bağlantı Hatası

```
Error: Redis connection failed
```

**Çözüm:**
- Redis sunucusunun çalıştığından emin olun
- `.env.local` dosyasındaki Redis bağlantı bilgilerini kontrol edin

## Sonraki Adımlar

Yerel geliştirme ortamınızı başarıyla kurduktan sonra, şunları yapabilirsiniz:

1. [Mimari Özet](./architecture-overview.md) dokümanını inceleyerek projenin yapısını anlayabilirsiniz
2. [Kod Standartları](./code-standards.md) dokümanını okuyarak geliştirme standartlarını öğrenebilirsiniz
3. [Multi-tenant Mimarisi Test Rehberi](../testing/multi-tenant-testing.md) ile tenant izolasyonu test süreçlerini anlayabilirsiniz 