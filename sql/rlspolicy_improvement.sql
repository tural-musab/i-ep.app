-- Iqra Eğitim Portalı - RLS Politikaları Genişletilmesi
-- Bu betik, ADR-0002 ve ADR-0003'te belirtilen multi-tenant mimari stratejisine uygun 
-- Row Level Security (RLS) politikalarını standartlaştırır ve genişletir.

-- ==========================================
-- 1. Rol Tanımlamaları için Yardımcı Fonksiyonlar
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Auth JWT'den role bilgisini döndürür
  RETURN coalesce(
    (current_setting('request.jwt.claims', true)::json->>'role')::text,
    'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Kullanıcının super_admin rolünde olup olmadığını kontrol eder
  RETURN (SELECT get_user_role() = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_tenant_admin(tenant_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Kullanıcının belirli bir tenant için admin olup olmadığını kontrol eder
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND tenant_id = is_tenant_admin.tenant_id
      AND role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher(tenant_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Kullanıcının belirli bir tenant için öğretmen olup olmadığını kontrol eder
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND tenant_id = is_teacher.tenant_id 
      AND role = 'teacher'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student(tenant_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Kullanıcının belirli bir tenant için öğrenci olup olmadığını kontrol eder
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND tenant_id = is_student.tenant_id
      AND role = 'student'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_parent(tenant_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  -- Kullanıcının belirli bir tenant için veli olup olmadığını kontrol eder
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND tenant_id = is_parent.tenant_id
      AND role = 'parent'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid AS $$
BEGIN
  -- Kullanıcının tenant_id'sini döndürür
  RETURN (
    SELECT tenant_id FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.belongs_to_tenant(schema_name text)
RETURNS BOOLEAN AS $$
DECLARE
  tenant_id uuid;
BEGIN
  -- Schema adındaki tenant_id'yi çıkartır ve kullanıcının bu tenant'a ait olup olmadığını kontrol eder
  IF schema_name ~ '^tenant_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    tenant_id := (SELECT uuid(substring(schema_name from 8)));
    RETURN (
      SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND tenant_id = belongs_to_tenant.tenant_id
      )
    );
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. Denetim Logları için İzleme Fonksiyonları
-- ==========================================

CREATE OR REPLACE FUNCTION audit.log_activity()
RETURNS TRIGGER AS $$
DECLARE
  old_data_record jsonb;
  new_data_record jsonb;
  changed_fields jsonb;
BEGIN
  -- Eski ve yeni veri formatlarını hazırla
  IF TG_OP = 'UPDATE' THEN
    old_data_record := to_jsonb(OLD);
    new_data_record := to_jsonb(NEW);
    changed_fields := (SELECT jsonb_object_agg(key, value) FROM jsonb_each(new_data_record) WHERE new_data_record->key IS DISTINCT FROM old_data_record->key);
  ELSIF TG_OP = 'DELETE' THEN
    old_data_record := to_jsonb(OLD);
    new_data_record := NULL;
    changed_fields := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    old_data_record := NULL;
    new_data_record := to_jsonb(NEW);
    changed_fields := NULL;
  END IF;
  
  -- Tenant ID'yi belirle
  DECLARE
    tenant_id uuid;
  BEGIN
    IF TG_TABLE_SCHEMA ~ '^tenant_' THEN
      tenant_id := uuid(substring(TG_TABLE_SCHEMA from 8));
    ELSIF TG_OP = 'DELETE' THEN
      tenant_id := OLD.tenant_id;
    ELSE
      tenant_id := NEW.tenant_id;
    END IF;
  
    -- Audit kaydını ekle
    INSERT INTO audit.audit_logs (
      table_schema, 
      table_name, 
      operation, 
      user_id, 
      tenant_id, 
      old_data, 
      new_data, 
      changed_fields
    ) VALUES (
      TG_TABLE_SCHEMA,
      TG_TABLE_NAME,
      TG_OP,
      coalesce(auth.uid()::text, 'system'),
      tenant_id,
      old_data_record,
      new_data_record,
      changed_fields
    );
  END;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Management Şeması İçin RLS Politikaları
-- ==========================================

-- 1. management.tenants için RLS politikaları
DROP POLICY IF EXISTS tenant_super_admin_policy ON management.tenants;
CREATE POLICY tenant_super_admin_policy ON management.tenants
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS tenant_user_policy ON management.tenants;
CREATE POLICY tenant_user_policy ON management.tenants
  FOR SELECT
  USING (id = get_user_tenant_id());

-- 2. management.domains için RLS politikaları
DROP POLICY IF EXISTS domain_super_admin_policy ON management.domains;
CREATE POLICY domain_super_admin_policy ON management.domains
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS domain_admin_policy ON management.domains;
CREATE POLICY domain_admin_policy ON management.domains
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS domain_user_policy ON management.domains;
CREATE POLICY domain_user_policy ON management.domains
  FOR SELECT
  USING (tenant_id = get_user_tenant_id());

-- 3. management.subscriptions için RLS politikaları
DROP POLICY IF EXISTS subscriptions_super_admin_policy ON management.subscriptions;
CREATE POLICY subscriptions_super_admin_policy ON management.subscriptions
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS subscriptions_admin_policy ON management.subscriptions;
CREATE POLICY subscriptions_admin_policy ON management.subscriptions
  FOR SELECT
  USING (is_tenant_admin(tenant_id));

-- 4. management.invoices için RLS politikaları
DROP POLICY IF EXISTS invoices_super_admin_policy ON management.invoices;
CREATE POLICY invoices_super_admin_policy ON management.invoices
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS invoices_admin_policy ON management.invoices;
CREATE POLICY invoices_admin_policy ON management.invoices
  FOR SELECT
  USING (is_tenant_admin(tenant_id));

-- ==========================================
-- 4. Public Şeması İçin RLS Politikaları
-- ==========================================

-- 1. public.users için RLS politikaları
DROP POLICY IF EXISTS users_super_admin_policy ON public.users;
CREATE POLICY users_super_admin_policy ON public.users
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS users_admin_policy ON public.users;
CREATE POLICY users_admin_policy ON public.users
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

DROP POLICY IF EXISTS users_teacher_policy ON public.users;
CREATE POLICY users_teacher_policy ON public.users
  FOR SELECT
  USING (
    (is_teacher(tenant_id) AND tenant_id = get_user_tenant_id())
  );

DROP POLICY IF EXISTS users_self_policy ON public.users;
CREATE POLICY users_self_policy ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- 2. public.api_tokens için RLS politikaları
DROP POLICY IF EXISTS api_tokens_super_admin_policy ON public.api_tokens;
CREATE POLICY api_tokens_super_admin_policy ON public.api_tokens
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

DROP POLICY IF EXISTS api_tokens_admin_policy ON public.api_tokens;
CREATE POLICY api_tokens_admin_policy ON public.api_tokens
  USING (is_tenant_admin(tenant_id))
  WITH CHECK (is_tenant_admin(tenant_id));

-- ==========================================
-- 5. Audit Şeması İçin RLS Politikaları
-- ==========================================

DROP POLICY IF EXISTS audit_logs_super_admin_policy ON audit.audit_logs;
CREATE POLICY audit_logs_super_admin_policy ON audit.audit_logs
  FOR SELECT USING (is_super_admin());

DROP POLICY IF EXISTS audit_logs_tenant_admin_policy ON audit.audit_logs;
CREATE POLICY audit_logs_tenant_admin_policy ON audit.audit_logs
  FOR SELECT
  USING (
    is_tenant_admin(tenant_id) AND
    tenant_id = get_user_tenant_id()
  );

-- ==========================================
-- 6. Tenant Şablonu İçin RLS Politikaları
-- ==========================================

-- Bu fonksiyon, mevcut tenant şemaları için şablon RLS politikalarını uygular
CREATE OR REPLACE FUNCTION management.apply_tenant_template_policies()
RETURNS void AS $$
DECLARE
  tenant_schema text;
  table_name text;
BEGIN
  -- Mevcut tenant şemalarını bul
  FOR tenant_schema IN 
    SELECT nspname FROM pg_namespace 
    WHERE nspname LIKE 'tenant_%' AND nspname != 'tenant_template'
  LOOP
    -- Her tenant şemasındaki tabloları döngüye al
    FOR table_name IN 
      SELECT c.relname 
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = tenant_schema
      AND c.relkind = 'r'
    LOOP
      -- Tenant izolasyon politikası - herkes için
      EXECUTE format('
        DROP POLICY IF EXISTS tenant_isolation_policy ON %I.%I;
        CREATE POLICY tenant_isolation_policy ON %I.%I
        USING (belongs_to_tenant(%L));
      ', tenant_schema, table_name, tenant_schema, table_name, tenant_schema);
      
      -- Admin politikası - tam erişim
      EXECUTE format('
        DROP POLICY IF EXISTS admin_policy ON %I.%I;
        CREATE POLICY admin_policy ON %I.%I
        USING (
          is_super_admin() OR 
          is_tenant_admin(get_user_tenant_id())
        )
        WITH CHECK (
          is_super_admin() OR 
          is_tenant_admin(get_user_tenant_id())
        );
      ', tenant_schema, table_name, tenant_schema, table_name);
      
      -- Öğretmen politikası - seçilmiş tablolar için (sınıflar, dersler, notlar)
      IF table_name IN ('classes', 'subjects', 'assessments', 'grades', 'assignments', 'schedules', 'attendances') THEN
        EXECUTE format('
          DROP POLICY IF EXISTS teacher_policy ON %I.%I;
          CREATE POLICY teacher_policy ON %I.%I
          USING (
            is_teacher(get_user_tenant_id()) AND
            belongs_to_tenant(%L)
          )
          WITH CHECK (
            is_teacher(get_user_tenant_id()) AND
            belongs_to_tenant(%L)
          );
        ', tenant_schema, table_name, tenant_schema, table_name, tenant_schema, tenant_schema);
      END IF;
      
      -- Öğrenci politikası - sadece görüntüleme (seçilmiş tablolar için)
      IF table_name IN ('classes', 'subjects', 'assessments', 'grades', 'assignments', 'schedules', 'attendances') THEN
        EXECUTE format('
          DROP POLICY IF EXISTS student_policy ON %I.%I;
          CREATE POLICY student_policy ON %I.%I
          FOR SELECT
          USING (
            is_student(get_user_tenant_id()) AND
            belongs_to_tenant(%L)
          );
        ', tenant_schema, table_name, tenant_schema, table_name, tenant_schema);
      END IF;
      
      -- Veli politikası - sadece kendi öğrencileriyle ilgili kayıtları görüntüleme
      IF table_name IN ('grades', 'attendances', 'assignments') THEN
        EXECUTE format('
          DROP POLICY IF EXISTS parent_policy ON %I.%I;
          CREATE POLICY parent_policy ON %I.%I
          FOR SELECT
          USING (
            is_parent(get_user_tenant_id()) AND
            belongs_to_tenant(%L) AND
            EXISTS (
              SELECT 1 FROM %I.parent_student_relationships psr
              JOIN %I.class_students cs ON psr.student_id = cs.student_id
              WHERE psr.parent_id = auth.uid()
            )
          );
        ', tenant_schema, table_name, tenant_schema, table_name, tenant_schema, tenant_schema, tenant_schema);
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Şablon uygulaması için fonksiyonu çağır
SELECT management.apply_tenant_template_policies();

-- ==========================================
-- 7. RLS Politikaları İzleme Sistemi
-- ==========================================

-- RLS politikalarını kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION management.check_rls_policies()
RETURNS TABLE (
  schema_name text,
  table_name text,
  has_policies boolean,
  policy_count int,
  missing_roles text[]
) AS $$
DECLARE
  required_roles text[] := ARRAY['super_admin', 'admin', 'teacher', 'student', 'parent'];
  current_roles text[];
BEGIN
  RETURN QUERY
  WITH policies AS (
    SELECT 
      n.nspname as schema_name,
      c.relname as table_name,
      array_agg(DISTINCT pol.polname) as policy_names
    FROM pg_policy pol
    JOIN pg_class c ON pol.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
    GROUP BY n.nspname, c.relname
  ),
  tables AS (
    SELECT 
      n.nspname as schema_name,
      c.relname as table_name
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  )
  SELECT 
    t.schema_name,
    t.table_name,
    p.policy_names IS NOT NULL as has_policies,
    COALESCE(array_length(p.policy_names, 1), 0) as policy_count,
    ARRAY(
      SELECT r FROM unnest(required_roles) r
      WHERE NOT EXISTS (
        SELECT 1 FROM unnest(p.policy_names) pn
        WHERE pn LIKE '%' || r || '%'
      )
    ) as missing_roles
  FROM tables t
  LEFT JOIN policies p ON t.schema_name = p.schema_name AND t.table_name = p.table_name
  WHERE t.schema_name NOT LIKE 'pg_%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 