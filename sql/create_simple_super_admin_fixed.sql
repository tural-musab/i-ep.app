-- Süper Admin kullanıcısını public.users tablosuna ekleyen SQL sorgusu
-- Foreign key constraint hatasını çözmek için düzeltildi

-- İlk olarak kısıtlamayı inceleyelim
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM
    pg_constraint c
JOIN
    pg_namespace n ON n.oid = c.connamespace
WHERE
    conname = 'users_id_fkey'
    AND n.nspname = 'public';

-- Önce auth.users tablosunda süper admin rolünü ayarla
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
WHERE email = 'admin@i-ep.app'
RETURNING id, email, raw_app_meta_data;

-- Admin kullanıcısının mevcut olup olmadığını kontrol et ve varsa güncelle, yoksa ekle
DO $$
DECLARE
   v_user_exists BOOLEAN;
   v_tenant_id UUID;
BEGIN
   -- Varsayılan tenant ID'yi al (ilk tenant'ı kullan)
   SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
   
   -- Eğer tenant yoksa, UUID oluştur (gerçek uygulamada tenant_id gerekli olabilir)
   IF v_tenant_id IS NULL THEN
     v_tenant_id := '11111111-1111-1111-1111-111111111111'::UUID;
   END IF;
   
   -- Kullanıcının var olup olmadığını kontrol et
   SELECT EXISTS(
     SELECT 1 FROM public.users WHERE email = 'admin@i-ep.app'
   ) INTO v_user_exists;
   
   IF v_user_exists THEN
     -- Kullanıcı varsa, rolünü güncelle
     RAISE NOTICE 'Kullanıcı zaten mevcut, süper admin rolü güncelleniyor';
     
     UPDATE public.users
     SET 
       role = 'super_admin',
       is_active = TRUE,
       first_name = 'Süper',
       last_name = 'Admin',
       updated_at = NOW()
     WHERE email = 'admin@i-ep.app';
     
   ELSE
     -- Foreign key constraint'i olan tablolarda INSERT işlemi yaparken
     -- id değerini otomatik oluşturulmasına izin verelim (DEFAULT kullanarak)
     -- NOT: ID sütunu büyük olasılıkla users tablosunda IDENTITY sütunu veya bir SEQUENCE ile dolduruluyor
     RAISE NOTICE 'Yeni süper admin kullanıcısı oluşturuluyor';
     
     INSERT INTO public.users (
       -- id sütununu belirtmiyoruz, otomatik olarak dolduruluyor
       tenant_id,
       email,
       first_name,
       last_name,
       role,
       is_active,
       verification_status,
       preferences,
       metadata,
       created_at,
       updated_at
     ) VALUES (
       v_tenant_id,
       'admin@i-ep.app',
       'Süper',
       'Admin',
       'super_admin',
       TRUE,
       'verified',
       '{}',
       '{"source": "system_setup"}',
       NOW(),
       NOW()
     );
   END IF;
END$$; 