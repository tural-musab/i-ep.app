-- Iqra Eğitim Portalı - Service Role İzinleri
BEGIN;

-- Service role için gerekli yetkileri ver
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS service_role_bypass ON public.tenants;
DROP POLICY IF EXISTS service_role_bypass ON public.classes;
DROP POLICY IF EXISTS service_role_bypass ON public.students;

-- Service role için RLS bypass politikası
CREATE POLICY service_role_bypass ON public.tenants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_bypass ON public.classes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_bypass ON public.students
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS'yi yeniden etkinleştir
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.classes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;

-- Tablo durumlarını kontrol et
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'RLS Politika Durumları:';
    
    -- Tenants tablosu politikaları
    FOR r IN (
        SELECT pol.policyname, 
               pol.permissive,
               pol.roles,
               pol.cmd,
               pol.qual,
               pol.with_check
        FROM pg_policies pol
        WHERE pol.tablename = 'tenants'
          AND pol.schemaname = 'public'
    ) LOOP
        RAISE NOTICE 'Tenant Politikası: % (% - %)', 
            r.policyname, 
            r.cmd, 
            array_to_string(r.roles, ',');
    END LOOP;
    
    -- Classes tablosu politikaları
    FOR r IN (
        SELECT pol.policyname, 
               pol.permissive,
               pol.roles,
               pol.cmd,
               pol.qual,
               pol.with_check
        FROM pg_policies pol
        WHERE pol.tablename = 'classes'
          AND pol.schemaname = 'public'
    ) LOOP
        RAISE NOTICE 'Class Politikası: % (% - %)', 
            r.policyname, 
            r.cmd, 
            array_to_string(r.roles, ',');
    END LOOP;
    
    -- Students tablosu politikaları
    FOR r IN (
        SELECT pol.policyname, 
               pol.permissive,
               pol.roles,
               pol.cmd,
               pol.qual,
               pol.with_check
        FROM pg_policies pol
        WHERE pol.tablename = 'students'
          AND pol.schemaname = 'public'
    ) LOOP
        RAISE NOTICE 'Student Politikası: % (% - %)', 
            r.policyname, 
            r.cmd, 
            array_to_string(r.roles, ',');
    END LOOP;
END $$;

COMMIT; 