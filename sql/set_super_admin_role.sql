-- Belirli bir kullanıcıya süper admin rolü atayan fonksiyon
CREATE OR REPLACE FUNCTION public.set_super_admin_role(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Kullanıcı ID'sini email adresine göre bul
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı: %', p_email;
  END IF;

  -- Kullanıcıya süper admin rolü ata
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
  WHERE id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Güvenlik - Herkes bu fonksiyonu çağırabilir, ancak üretim ortamında kısıtlamalısınız
GRANT EXECUTE ON FUNCTION public.set_super_admin_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_super_admin_role(TEXT) TO anon; 