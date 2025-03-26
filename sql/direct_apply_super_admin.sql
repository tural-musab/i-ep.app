-- Süper admin kullanıcısını public.users tablosuna ekleyen basitleştirilmiş SQL
-- Supabase Studio SQL Editöründe çalıştırılmak üzere tasarlanmıştır

-- Önce tablonun kısıtlamalarını kontrol edelim
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

-- Eğer constraint varsa, hangi tabloya referans veriyor onu inceleyelim
SELECT 
    tc.table_schema, 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
JOIN 
    information_schema.key_column_usage AS kcu
ON 
    tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN 
    information_schema.constraint_column_usage AS ccu
ON 
    ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'users';

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

-- Geçici olarak foreign key constraint'i devre dışı bırakarak ekleme yapma denemesi:
-- (Mevcut yapıya müdahale etmek istenmiyorsa, bu yöntemi kullanabiliriz)
BEGIN;
  -- Süper admin varlığını kontrol et
  DO $$
  DECLARE
    v_user_exists BOOLEAN;
  BEGIN
    SELECT EXISTS(
      SELECT 1 FROM public.users WHERE email = 'admin@i-ep.app'
    ) INTO v_user_exists;
    
    IF v_user_exists THEN
      RAISE NOTICE 'Kullanıcı zaten mevcut, güncelleme yapılacak';
      
      -- Kullanıcıyı güncelle
      UPDATE public.users
      SET 
        auth_id = '11319c87-94e7-4e22-90e2-f8c97f4698f4',
        role = 'super_admin',
        is_active = TRUE,
        updated_at = NOW(),
        first_name = 'Süper', 
        last_name = 'Admin'
      WHERE email = 'admin@i-ep.app';
      
    ELSE
      RAISE NOTICE 'Kullanıcı bulunamadı. UUID ile çakışmayacak yeni ekleme yapmak gerekiyor.';
      
      -- Bu tabloyla ilgili mevcut UUID'leri kontrol et ve çakışma olmayacak şekilde ekle
      INSERT INTO public.users (
        id,  -- UUID oluşturma işlemi otomatik yapılsın
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
        gen_random_uuid(), -- Otomatik UUID oluştur
        '11319c87-94e7-4e22-90e2-f8c97f4698f4',
        'admin@i-ep.app',
        'super_admin',
        '11111111-1111-1111-1111-111111111111',
        'Süper',
        'Admin',
        TRUE,
        NOW(),
        NOW()
      );
    END IF;
  END $$;
COMMIT; 