-- Basit çözüm: Sadece auth.users tablosunda süper admin rolünü ayarla
-- Super Admin sayfasına erişim için gereken minimum değişiklik

-- Super Admin rolünü auth.users tablosunda ayarla
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
WHERE email = 'admin@i-ep.app'
RETURNING id, email, raw_app_meta_data;

-- Güncellendiğini kontrol et
SELECT id, email, raw_app_meta_data 
FROM auth.users 
WHERE email = 'admin@i-ep.app'; 