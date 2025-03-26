-- Veritabanı yapısını analiz etmek için sorgu seti
-- Bu sorgular sadece bilgi toplar, herhangi bir değişiklik yapmaz

-- 1. users tablosunun yapısını kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'users'
ORDER BY 
    ordinal_position;

-- 2. users tablosundaki kısıtlamaları incele
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM
    pg_constraint c
JOIN
    pg_namespace n ON n.oid = c.connamespace
WHERE
    conrelid = 'public.users'::regclass
    AND n.nspname = 'public';

-- 3. Özellikle users_id_fkey kısıtlamasını incele
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

-- 4. users tablosuna referans veren tabloları bul
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
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN 
    information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE 
    tc.constraint_type = 'FOREIGN KEY' 
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'public';

-- 5. Tenants tablosunun yapısını kontrol et
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'tenants'
ORDER BY 
    ordinal_position;

-- 6. Mevcut tenant ID'lerini kontrol et
SELECT id, name FROM public.tenants LIMIT 10;

-- 7. Yabancı anahtar (foreign key) hatası veren tablonun yapısını incele
-- Hatada referans verilen tablo hangisiyse, o tablonun yapısını kontrol et
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%user%';

-- 8. Auth kullanıcı yapısını kontrol et
SELECT id, email, raw_app_meta_data 
FROM auth.users 
WHERE email = 'admin@i-ep.app';

-- 9. Mevcut kullanıcı kayıtlarını kontrol et (auth_id sütunu yokmuş, çıkardık)
SELECT id, email, role FROM public.users WHERE email = 'admin@i-ep.app';

-- 10. Basit bir admin kullanıcısını users tablosuna ekleme sorgusu oluşturalım
-- Önce user_profiles tablosunun yapısını kontrol edelim (varsa)
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- 11. Temel bir kullanıcı bilgisi çıkartalım
SELECT * FROM public.users LIMIT 1;

-- 12. users tablosundaki sütunları daha detaylı görüntüleyelim
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position; 