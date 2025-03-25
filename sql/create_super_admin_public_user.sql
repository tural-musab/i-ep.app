-- Süper admin kullanıcısını public.users tablosuna ekleyen SQL
-- UUID'yi auth.users tablosundan alıyoruz

-- Önce auth_id sütununu ekleyelim (eğer yoksa)
DO $$
BEGIN
  -- Sütun var mı kontrol et
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND column_name = 'auth_id'
  ) THEN
    -- Sütun yoksa ekle
    EXECUTE 'ALTER TABLE public.users ADD COLUMN auth_id UUID REFERENCES auth.users(id)';
    RAISE NOTICE 'auth_id sütunu eklendi';
  ELSE
    RAISE NOTICE 'auth_id sütunu zaten mevcut';
  END IF;
END $$;

-- Şimdi süper admin kullanıcısını ekleyelim
DO $$
DECLARE
  v_user_exists BOOLEAN;
  v_auth_user_id UUID := '11319c87-94e7-4e22-90e2-f8c97f4698f4';
BEGIN
  -- Kullanıcının public.users tablosunda var olup olmadığını kontrol et
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE auth_id = v_auth_user_id
  ) INTO v_user_exists;
  
  -- Eğer kullanıcı yoksa ekle
  IF NOT v_user_exists THEN
    INSERT INTO public.users (
      id,
      auth_id,
      email,
      role,
      tenant_id,
      first_name,
      last_name,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(), -- UUID oluştur
      v_auth_user_id,
      'admin@i-ep.app',
      'super_admin',
      '11111111-1111-1111-1111-111111111111', -- Varsayılan tenant ID
      'Süper',
      'Admin',
      TRUE,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Süper admin kullanıcısı public.users tablosuna eklendi';
  ELSE
    RAISE NOTICE 'Süper admin kullanıcısı zaten public.users tablosunda mevcut';
  END IF;
END $$; 