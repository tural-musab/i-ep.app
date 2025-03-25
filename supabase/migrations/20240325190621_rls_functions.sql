-- Iqra Eğitim Portalı - RLS Fonksiyonları
-- Bu betik, tüm RLS fonksiyonlarını ve yapılandırmasını içerir

BEGIN;

-- ==========================================
-- 1. Temel RLS Fonksiyonları
-- ==========================================

-- Kullanıcının rolünü döndüren fonksiyon
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Auth JWT'den role bilgisini döndürür
  RETURN coalesce(
    (current_setting('request.jwt.claims', true)::json->>'role')::text,
    'authenticated'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'authenticated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının super_admin rolünde olup olmadığını kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_user_role() = 'super_admin');
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının belirli bir tenant için admin olup olmadığını kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION public.is_tenant_admin(tenant_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND tenant_id = is_tenant_admin.tenant_id
      AND role = 'admin'
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcının tenant_id'sini döndüren fonksiyon
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT tenant_id FROM public.users
    WHERE id = auth.uid()
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 2. Tenant Yönetim Fonksiyonları
-- ==========================================

-- Tenant şema adını döndüren yardımcı fonksiyon
CREATE OR REPLACE FUNCTION management.get_tenant_schema(tenant_id uuid)
RETURNS text AS $$
BEGIN
  RETURN 'tenant_' || tenant_id::text;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. Öğretmen Erişim Fonksiyonları
-- ==========================================

-- Öğretmenin sınıfa erişimini kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION public.teacher_has_class(teacher_id uuid, class_id uuid, schema_name text DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  result boolean;
  actual_schema text;
BEGIN
  -- Şema belirtilmemişse kullanıcının tenant şemasını al
  IF schema_name IS NULL THEN
    SELECT 'tenant_' || tenant_id INTO actual_schema
    FROM public.users WHERE id = auth.uid();
  ELSE
    actual_schema := schema_name;
  END IF;
  
  IF actual_schema IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Öğretmenin sınıfta ders verip vermediğini kontrol et
  BEGIN
    EXECUTE format('
      SELECT EXISTS (
        SELECT 1 
        FROM %I.class_teachers ct
        WHERE ct.teacher_id = $1 
        AND ct.class_id = $2
      )', actual_schema)
    INTO result
    USING teacher_id, class_id;
    
    RETURN COALESCE(result, FALSE);
  EXCEPTION
    WHEN OTHERS THEN
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut giriş yapmış öğretmenin belirli bir sınıfa erişim kontrolü
CREATE OR REPLACE FUNCTION public.current_teacher_has_class_access(class_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT teacher_has_class(auth.uid(), class_id)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Öğretmenin öğrenciye erişimini kontrol eden fonksiyon
CREATE OR REPLACE FUNCTION public.teacher_has_student(teacher_id uuid, student_id uuid, schema_name text DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  result boolean;
  actual_schema text;
BEGIN
  -- Şema belirtilmemişse kullanıcının tenant şemasını al
  IF schema_name IS NULL THEN
    SELECT 'tenant_' || tenant_id INTO actual_schema
    FROM public.users WHERE id = auth.uid();
  ELSE
    actual_schema := schema_name;
  END IF;
  
  IF actual_schema IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Öğretmenin öğrencinin olduğu herhangi bir sınıfta ders verip vermediğini kontrol et
  BEGIN
    EXECUTE format('
      SELECT EXISTS (
        SELECT 1 
        FROM %I.class_students cs
        JOIN %I.class_teachers ct ON cs.class_id = ct.class_id
        WHERE ct.teacher_id = $1 
        AND cs.student_id = $2
      )', actual_schema, actual_schema)
    INTO result
    USING teacher_id, student_id;
    
    RETURN COALESCE(result, FALSE);
  EXCEPTION
    WHEN OTHERS THEN
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mevcut giriş yapmış öğretmenin belirli bir öğrenciye erişim kontrolü
CREATE OR REPLACE FUNCTION public.current_teacher_has_student_access(student_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT teacher_has_student(auth.uid(), student_id)
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. Denetim Log Mekanizmaları
-- ==========================================

-- Audit log tablosu oluşturalım - yoksa
CREATE TABLE IF NOT EXISTS audit.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_schema text NOT NULL,
  table_name text NOT NULL,
  operation text NOT NULL,
  user_id text NOT NULL,
  tenant_id uuid,
  old_data jsonb,
  new_data jsonb,
  changed_fields jsonb,
  created_at timestamptz DEFAULT now()
);

-- Log aktivitesi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION audit.log_activity()
RETURNS TRIGGER AS $$
DECLARE
  old_data_record jsonb;
  new_data_record jsonb;
  changed_fields jsonb;
  tenant_id_val uuid;
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
  IF TG_TABLE_SCHEMA ~ '^tenant_' THEN
    tenant_id_val := uuid(substring(TG_TABLE_SCHEMA from 8));
  ELSIF TG_OP = 'DELETE' THEN
    tenant_id_val := OLD.tenant_id;
  ELSE
    tenant_id_val := NEW.tenant_id;
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
    tenant_id_val,
    old_data_record,
    new_data_record,
    changed_fields
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erişim reddedilen olayları izleme tablosu
CREATE TABLE IF NOT EXISTS audit.access_denied_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  attempted_operation text NOT NULL,
  target_schema text NOT NULL,
  target_table text NOT NULL,
  target_record_id text,
  reason text,
  request_details jsonb,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 5. RLS Test Ortamı
-- ==========================================

-- Test kullanıcıları tablosu
CREATE TABLE IF NOT EXISTS rls_test.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  tenant_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Test sınıflar tablosu
CREATE TABLE IF NOT EXISTS rls_test.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Test öğretmen-sınıf ilişki tablosu
CREATE TABLE IF NOT EXISTS rls_test.class_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES rls_test.classes(id),
  teacher_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Test öğrenci-sınıf ilişki tablosu
CREATE TABLE IF NOT EXISTS rls_test.class_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES rls_test.classes(id),
  student_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Test veri tablosu (erişim kontrolünü test etmek için)
CREATE TABLE IF NOT EXISTS rls_test.test_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  class_id uuid REFERENCES rls_test.classes(id),
  student_id uuid,
  data_type text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- Tüm test tablolarına RLS'i aktifleştir
ALTER TABLE rls_test.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_test.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_test.class_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_test.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE rls_test.test_data ENABLE ROW LEVEL SECURITY;

COMMIT; 