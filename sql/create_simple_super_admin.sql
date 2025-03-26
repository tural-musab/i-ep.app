-- Süper Admin kullanıcısını public.users tablosuna ekleyen SQL sorgusu
-- public.users tablosunun mevcut yapısına dayanarak oluşturuldu

-- Önce auth.users tablosunda süper admin rolünü ayarla
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
WHERE email = 'admin@i-ep.app'
RETURNING id, email, raw_app_meta_data;

-- Mevcut tenant ID'yi kontrol et
SELECT id, name FROM public.tenants LIMIT 1;

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
     -- Kullanıcı yoksa yeni bir kayıt ekle
     RAISE NOTICE 'Yeni süper admin kullanıcısı oluşturuluyor';
     
     INSERT INTO public.users (
       id,
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
       gen_random_uuid(),
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