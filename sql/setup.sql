-- Iqra Eğitim Portalı Veritabanı Kurulumu
-- Bu dosya, tüm veritabanı yapısını oluşturmak için kullanılır

-- 1. Şemaları oluştur
\i 01_schemas.sql

-- 2. Uzantıları yükle
\i 02_extensions.sql

-- 3. Temel tipleri ve enum'ları oluştur
\i 03_types.sql

-- 4. Yardımcı fonksiyonları oluştur
\i 04_functions.sql

-- 5. Yönetim tablolarını oluştur
\i 05_management_tables.sql

-- 6. Public şeması tablolarını oluştur
\i 06_public_tables.sql

-- 7. Tenant şablon tablolarını oluştur
\i 07_tenant_template_tables.sql

-- 8. RLS politikalarını oluştur
\i 08_rls_policies.sql

-- 9. Tetikleyicileri oluştur
\i 09_triggers.sql

-- 10. İndeksleri oluştur
\i 10_indexes.sql

-- 11. İlk veriyi ekle
\i 11_init_data.sql

-- Başarılı kurulum mesajı
DO $$
BEGIN
  RAISE NOTICE '--------------------------------';
  RAISE NOTICE 'Veritabanı kurulumu tamamlandı.';
  RAISE NOTICE '--------------------------------';
END $$; 