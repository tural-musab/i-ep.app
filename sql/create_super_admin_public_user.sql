-- Süper admin kullanıcısını public.users tablosuna ekleyen SQL
-- UUID'yi auth.users tablosundan alıyoruz

-- Önce kullanıcının zaten var olup olmadığını kontrol et
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
      auth_id,
      email,
      role,
      tenant_id,
      status,
      name,
      created_at,
      updated_at
    ) VALUES (
      v_auth_user_id,
      'admin@i-ep.app',
      'super_admin',
      'tenant_i-ep.app', -- Varsayılan tenant ID
      'active',
      'Süper Admin',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Süper admin kullanıcısı public.users tablosuna eklendi';
  ELSE
    RAISE NOTICE 'Süper admin kullanıcısı zaten public.users tablosunda mevcut';
  END IF;
END $$; 