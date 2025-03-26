-- SÃ¼per admin kullanÄ±cÄ±sÄ±nÄ± public.users tablosuna ekleyen SQL
-- UUID'yi auth.users tablosundan alÄ±yoruz

-- Ã–nce auth_id sÃ¼tununu ekleyelim (eÄŸer yoksa)
DO $$
BEGIN
  -- SÃ¼tun var mÄ± kontrol et
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND column_name = 'auth_id'
  ) THEN
    -- SÃ¼tun yoksa ekle
    EXECUTE 'ALTER TABLE public.users ADD COLUMN auth_id UUID REFERENCES auth.users(id)';
    RAISE NOTICE 'auth_id sÃ¼tunu eklendi';
  ELSE
    RAISE NOTICE 'auth_id sÃ¼tunu zaten mevcut';
  END IF;
END $$;

-- Åimdi sÃ¼per admin kullanÄ±cÄ±sÄ±nÄ± ekleyelim
DO $$
DECLARE
  v_user_exists BOOLEAN;
  v_auth_user_id UUID := '11319c87-94e7-4e22-90e2-f8c97f4698f4';
BEGIN
  -- KullanÄ±cÄ±nÄ±n public.users tablosunda var olup olmadÄ±ÄŸÄ±nÄ± kontrol et
  SELECT EXISTS(
    SELECT 1 FROM public.users WHERE auth_id = v_auth_user_id
  ) INTO v_user_exists;
  
  -- EÄŸer kullanÄ±cÄ± yoksa ekle
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
      gen_random_uuid(), -- UUID oluÅŸtur
      v_auth_user_id,
      'admin@i-ep.app',
      'super_admin',
      '11111111-1111-1111-1111-111111111111', -- VarsayÄ±lan tenant ID
      'SÃ¼per',
      'Admin',
      TRUE,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'SÃ¼per admin kullanÄ±cÄ±sÄ± public.users tablosuna eklendi';
  ELSE
    RAISE NOTICE 'SÃ¼per admin kullanÄ±cÄ±sÄ± zaten public.users tablosunda mevcut';
  END IF;
END $$; 
