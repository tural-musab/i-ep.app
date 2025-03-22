# Iqra Eğitim Portalı Veritabanı Kurulumu

Bu dizin, Iqra Eğitim Portalı (i-ep.app) için gerekli veritabanı yapısını oluşturan SQL dosyalarını içerir.

## Gereksinimler

- PostgreSQL 14 veya üzeri
- Supabase CLI (opsiyonel)
- psql (PostgreSQL komut satırı aracı)

## Kurulum Adımları

### 1. Supabase Kullanarak

Supabase projenizi oluşturduktan sonra, bu SQL dosyalarını Supabase Studio aracılığıyla veya Supabase CLI kullanarak çalıştırabilirsiniz.

#### Supabase Studio ile

1. Supabase Dashboard'a giriş yapın
2. Projenizi seçin
3. SQL Editor sekmesine tıklayın
4. `setup.sql` dosyasını kopyalayıp yapıştırın ve çalıştırın

#### Supabase CLI ile

```bash
# Supabase CLI'yi kullanarak oturum açın
supabase login

# Proje dizinine gidin
cd /path/to/project

# SQL dosyalarını Supabase projenize uygulayın
supabase db push --db-url=<SUPABASE_DB_URL>
```

### 2. PostgreSQL ile Doğrudan Kurulum

PostgreSQL veritabanınıza doğrudan SQL dosyalarını uygulayabilirsiniz:

```bash
# PostgreSQL'e bağlanın
psql -h <host> -U <username> -d <database> -f sql/setup.sql
```

## Dosya Yapısı

- `setup.sql` - Ana kurulum dosyası, tüm diğer dosyaları çağırır
- `01_schemas.sql` - Şemaları oluşturur
- `02_extensions.sql` - Gerekli PostgreSQL uzantılarını kurar
- `03_types.sql` - Enum ve kompozit tipleri tanımlar
- `04_functions.sql` - Yardımcı fonksiyonları tanımlar
- `05_management_tables.sql` - Tenant yönetimi ve sistem tablolarını oluşturur
- `06_public_tables.sql` - Public şemasındaki ortak tabloları oluşturur
- `07_tenant_template_tables.sql` - Tenant şablon tablolarını oluşturur
- `08_rls_policies.sql` - Row Level Security politikalarını tanımlar
- `09_triggers.sql` - Tetikleyicileri oluşturur
- `10_indexes.sql` - Veritabanı indekslerini oluşturur
- `11_init_data.sql` - İlk veriyi ekler (demo tenant ve süper admin)

## Çok Kiracılı (Multi-Tenant) Mimari

Bu veritabanı kurulumu, hibrit bir tenant izolasyon stratejisi kullanır:

1. **Şema İzolasyonu**: Her tenant için ayrı bir PostgreSQL şeması oluşturulur (`tenant_{id}`)
2. **Prefix İzolasyonu**: Bazı ortak tablolarda `tenant_id` sütunu ve Row Level Security (RLS) kullanılır
3. **Row Level Security (RLS)**: Tüm tablolarda tenant erişimi için RLS politikaları uygulanır

Bu hibrit yaklaşım, güvenli tenant izolasyonu sağlarken ortak tablolar için esneklik sunar.

## Tenant Oluşturma

Yeni bir tenant oluşturmak için:

```sql
-- Yeni tenant ekle (tetikleyici otomatik olarak şema ve tabloları oluşturacak)
INSERT INTO management.tenants (
  name, 
  display_name, 
  status,
  subscription_plan
) VALUES (
  'okul-adi', 
  'Okul Adı', 
  'trial',
  'free'
) RETURNING id;
```

## Süper Admin Kullanıcı Oluşturma

Ek süper admin kullanıcısı eklemek için:

```sql
-- Önce auth.users tablosuna kullanıcı ekleyin
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at
) VALUES (
  'yeni-admin@i-ep.app',
  crypt('guvenli-sifre', gen_salt('bf')),
  now()
) RETURNING id;

-- Sonra public.users tablosuna kullanıcı ekleyin
INSERT INTO public.users (
  id, -- auth.users'dan dönen ID'yi kullanın
  email,
  first_name,
  last_name,
  role
) VALUES (
  '...', -- auth.users'dan dönen ID
  'yeni-admin@i-ep.app',
  'Ad',
  'Soyad',
  'super_admin'
);
```

## Güvenlik Notları

1. Bu SQL dosyaları hassas bilgiler içerebilir, güvenli şekilde saklayın
2. Üretim ortamında kullanmadan önce `11_init_data.sql` dosyasındaki şifreleri değiştirin
3. Tenant izolasyonunu test edin ve güvenlik açıklarına karşı kontrol edin
4. Row Level Security politikalarının doğru çalıştığından emin olun

## Sorun Giderme

Kurulum sırasında hata alırsanız:

1. Hata mesajını dikkatlice okuyun
2. SQL dosyalarını sırayla manuel olarak çalıştırın hataları tespit edin
3. PostgreSQL sürümünüzün 14 veya üzeri olduğundan emin olun
4. Gerekli uzantıların kurulu olduğunu kontrol edin

## İletişim

Sorularınız veya sorunlarınız için: info@i-ep.app 