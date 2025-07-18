# Iqra Eğitim Portalı - Supabase Yapılandırması

Bu klasör, Iqra Eğitim Portalı'nın Supabase yapılandırmasını ve SQL betiklerini içerir. Supabase, uygulamanın arka plan veritabanı ve kimlik doğrulama altyapısı olarak kullanılmaktadır.

## İçerik

Bu klasör aşağıdaki alt klasörleri ve dosyaları içerir:

- `migrations/`: Veritabanı şemalarını ve tabloları oluşturmak ve güncellemek için SQL betikleri
- `functions/`: Edge Functions ve PostgreSQL fonksiyonları
- `seed/`: Test verileri oluşturmak için SQL betikleri (geliştirme amaçlı)

## Multi-Tenant Mimarisi

Uygulama, ADR-0003 dokümanında açıklanan bir multi-tenant mimarisi kullanmaktadır. Her tenant (okul/kurum) için ayrı bir PostgreSQL şeması oluşturulur. Bu şemalar, `tenant_[UUID]` formatında adlandırılır.

### Row Level Security (RLS) Politikaları

Uygulamanın veri güvenliği, PostgreSQL'in Row Level Security (RLS) özelliği ile sağlanmaktadır. RLS politikaları, kullanıcıların yalnızca kendi veya yetkili oldukları tenant verilerine erişmesini sağlar.

Temel RLS rolleri:

1. **Super Admin**: Tüm verilere erişim ve yönetim yetkisi
2. **Tenant Admin**: Yalnızca kendi tenant verileri üzerinde yönetim yetkisi
3. **Öğretmen**: Belirli tenant verilerine sınırlı okuma/yazma erişimi
4. **Öğrenci**: Yalnızca kendine ait verilere ve sınırlı ortak verilere okuma erişimi
5. **Veli**: Yalnızca kendi çocuklarına ait verilere okuma erişimi

## Kurulum ve Geliştirme

### Gereksinimler

- Supabase CLI
- Node.js 18+
- npm veya yarn

### Yerel Geliştirme

1. Bu deposunu klonlayın
2. Supabase CLI'ı kurun:
   ```
   npm install supabase --save-dev
   ```
3. Yerel Supabase örneğini başlatın:
   ```
   npx supabase start
   ```
4. Migrasyonları çalıştırın:
   ```
   npx supabase db reset
   ```

### Migration Dosyaları

- `20250325_rlspolicy_implementation.sql`: Temel RLS politikaları ve yardımcı fonksiyonlar
- `20250325_tenant_tables_rls.sql`: Tenant tabloları için RLS politikaları
- `20250325_rls_test_scenarios.sql`: Test senaryoları ve örnek veriler

## RLS Politikalarını Test Etme

RLS politikalarını test etmek için `20250325_rls_test_scenarios.sql` dosyasındaki test senaryolarını kullanabilirsiniz. Bu senaryolar, farklı kullanıcı rolleri için erişim kontrollerini doğrular.

Test adımları:

1. Test veritabanına bağlanın
2. Test kullanıcıları ve tenant verilerini oluşturun
3. Farklı kullanıcı rolleri ile oturum açarak veri erişim kontrollerini test edin

## Güvenlik Uyarıları

- Production ortamında `migrations/` klasöründeki tüm betikleri dikkatlice inceleyin
- Test senaryoları güvenlik ve performans açısından sadece geliştirme ortamında kullanılmalıdır
- RLS politikalarını güncellerken mevcut veri erişimlerini dikkatle kontrol edin

## Sorun Giderme

- RLS hatalarını gidermek için:
  - `auth.uid()` fonksiyonunun doğru çalıştığından emin olun
  - JWT yapılandırmasını kontrol edin
  - RLS politikalarının uygun şekilde tanımlandığından emin olun

## Katkıda Bulunma

Yeni bir migration eklemek için:

1. `migrations/` klasöründe yeni bir SQL dosyası oluşturun (tarih_açıklama.sql formatında)
2. SQL betiklerini dikkatli bir şekilde yazın, hata durumunda geri almak için kontroller ekleyin
3. Yerel ortamda test edin
4. Değişiklikleri commit edin
