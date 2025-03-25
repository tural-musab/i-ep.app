-- Süper admin kullanıcısını public.users tablosuna ekleyen basitleştirilmiş SQL
-- Supabase Studio SQL Editöründe çalıştırılmak üzere tasarlanmıştır

-- Önce auth_id sütununu kontrol et ve ekle (eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
    AND column_name = 'auth_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN auth_id UUID REFERENCES auth.users(id);
    RAISE NOTICE 'auth_id sütunu eklendi';
  ELSE
    RAISE NOTICE 'auth_id sütunu zaten mevcut';
  END IF;
END $$;

-- Süper admin rolünü auth.users tablosunda ayarla
UPDATE auth.users 
SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
WHERE id = '11319c87-94e7-4e22-90e2-f8c97f4698f4'
RETURNING id, email, raw_app_meta_data;

-- Eğer public.users tablosunda kayıt varsa güncelle, yoksa oluştur
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
  '11319c87-94e7-4e22-90e2-f8c97f4698f4', -- Auth kullanıcısının ID'si
  'admin@i-ep.app',
  'super_admin',
  '11111111-1111-1111-1111-111111111111', -- Varsayılan tenant ID
  'Süper',
  'Admin',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
  auth_id = EXCLUDED.auth_id,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW()
RETURNING id, email, role, auth_id; 