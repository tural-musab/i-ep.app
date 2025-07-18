# Migration Scriptleri

Bu dizin, Supabase veritabanı yapısını yönetmek için gerekli migration scriptlerini içerir.

## View Migration Scripti

### `create_public_views.sql`

Bu script, `management` şemasında bulunan tablolar ile API'mizin kullandığı `public` şemasındaki isimler arasında bir köprü oluşturur.

#### Oluşturulan View'lar

1. **public.tenants**
   - `management.tenants` tablosunu yansıtır
   - `schema_name` -> `subdomain`
   - `subscription_plan` -> `plan_type`
   - `status` -> `is_active`
2. **public.tenant_domains**
   - `management.domains` tablosunu yansıtır
   - `is_custom` -> `type` ('custom' veya 'subdomain')
   - `status` -> `is_verified`

#### Tetikleyiciler

Her view için CRUD işlemlerini destekleyen tetikleyiciler oluşturulur:

- INSERT: View'a yapılan ekleme işlemlerini ana tabloya yansıtır
- UPDATE: View'da yapılan güncellemeleri ana tabloya yansıtır
- DELETE: View'da yapılan silme işlemlerini ana tabloya yansıtır

## Migration Uygulaması

Bu migration scriptlerini uygulamak için aşağıdaki adımları izleyin:

1. Supabase Studio'yu açın veya doğrudan bir SQL istemcisi bağlantısı kurun
2. Migration dosyasını açın (`create_public_views.sql`)
3. İçeriği Supabase SQL editörüne kopyalayın ve çalıştırın
4. Sonuçları kontrol edin

> **Not:** Migration'ı geri almak gerekirse aşağıdaki komutu çalıştırabilirsiniz:
>
> ```sql
> DROP VIEW IF EXISTS public.tenants CASCADE;
> DROP VIEW IF EXISTS public.tenant_domains CASCADE;
> ```

## Hata Durumunda Kontrol Listesi

Migration sırasında hata alırsanız aşağıdakileri kontrol edin:

1. `management` şemasının ve ilgili tabloların varlığı
2. Enum tipleri (`subscription_plan`, `tenant_status` vb.) doğru mu?
3. `management.tenants` ve `management.domains` tablolarının yapısı beklenen şemaya uygun mu?
