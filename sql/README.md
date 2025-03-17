# Iqra Eğitim Portalı - Supabase SQL Kurulumu

Bu klasör, Iqra Eğitim Portalı'nın veritabanı yapılandırması için gerekli SQL dosyalarını içermektedir. Bu dosyalar, Supabase projenizin veritabanı yapılandırmasını otomatize etmek için kullanılır.

## İçerikler

- `initial-setup.sql`: Temel veritabanı yapısını oluşturan ana script
  - Tenant tabloları ve ilişkileri
  - Demo tenant ve ilgili şema
  - Row Level Security (RLS) politikaları
  - Yardımcı fonksiyonlar

## Kurulum Adımları

Aşağıdaki adımları takip ederek SQL scriptlerini Supabase projenize uygulayabilirsiniz:

### 1. Supabase Studio'yu Kullanarak

1. [Supabase Dashboard](https://app.supabase.io)'a giriş yapın
2. Projenizi seçin
3. Sol menüden "SQL Editor" seçeneğine tıklayın
4. "New Query" butonuna tıklayın
5. `initial-setup.sql` dosyasının içeriğini kopyalayıp SQL editörüne yapıştırın
6. "Run" butonuna tıklayarak scripti çalıştırın

### 2. Supabase CLI'ı Kullanarak

Supabase CLI kurulu ise, aşağıdaki komutu kullanabilirsiniz:

```bash
supabase db execute --file ./sql/initial-setup.sql
```

## Multi-tenant Yapısı

Bu SQL scriptleri, multi-tenant yapısını destekleyecek şekilde tasarlanmıştır:

1. Her tenant için ayrı bir şema oluşturulur (`tenant_[UUID]` formatında)
2. Her tenant kendi izole edilmiş verilerine sahiptir
3. Row Level Security (RLS) politikaları, tenant izolasyonunu güçlendirir
4. Public şema, tüm tenant'lar için ortak meta verileri içerir

## Demo Tenant

Script, otomatik olarak bir demo tenant oluşturur:

- Subdomain: `demo`
- Domain: `demo.i-es.app`
- Plan: `premium`

## Row Level Security (RLS)

Veritabanı güvenliği, Row Level Security (RLS) politikaları ile sağlanır:

- Her tenant, yalnızca kendi verilerine erişebilir
- Sistem yöneticileri, tüm tenant'ların verilerine erişebilir
- Kullanıcılar, yalnızca izin verilen kaynaklara erişebilir

## Supabase ile Entegrasyon

Bu veritabanı yapısını kullanmak için uygulamanın Supabase bağlantı kodunu doğru şekilde yapılandırmanız gerekmektedir. Daha fazla bilgi için `src/lib/supabase/server.ts` dosyasını inceleyebilirsiniz.

## Sorun Giderme

SQL scriptleri çalıştırılırken hatalarla karşılaşırsanız:

1. Hata mesajlarını dikkatlice okuyun
2. Scriptin parçalarını ayrı ayrı çalıştırmayı deneyin
3. Mevcut veritabanı durumunu kontrol edin

## Referans Dokümanlar

- `docs/architecture/multi-tenant-strategy.md`
- `docs/architecture/data-isolation.md`
- `docs/architecture/backup-restore.md` 