-- =========================================================
-- Tenant Bazlı Row Level Security (RLS) Politikaları
-- =========================================================
-- Bu script, tenant verileri için güvenlik politikalarını
-- ve veri izolasyonunu sağlayan yapılandırmaları içerir.
-- =========================================================

-- ---------------------------------------------------------
-- Tenant kontekst işlevleri
-- ---------------------------------------------------------

-- Geçerli tenant ID'sini ayarlamak için işlev
CREATE OR REPLACE FUNCTION public.set_tenant_context(tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::TEXT, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Geçerli tenant ID'sini almak için işlev
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', TRUE)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Geçerli oturum için tenant ID'si ayarlanmış mı kontrolü
CREATE OR REPLACE FUNCTION public.has_tenant_context()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', TRUE) IS NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Tenant veri erişimi için yetkilendirme kontrolü
CREATE OR REPLACE FUNCTION public.is_tenant_member(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_tenant UUID;
BEGIN
  -- Mevcut tenant ID'sini al
  current_tenant := public.get_current_tenant_id();
  
  -- Tenant ID'leri eşleşiyor mu?
  RETURN current_tenant IS NOT NULL AND current_tenant = check_tenant_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------
-- Public Şema İçindeki Tablolar için RLS Politikaları
-- ---------------------------------------------------------

-- tenants tablosu için RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Sistem yöneticileri için tenant erişimi
CREATE POLICY admin_tenant_access ON public.tenants
  FOR ALL
  TO app_admin
  USING (TRUE);

-- ---------------------------------------------------------
-- Tenant tablolarının oluşturulması ve RLS yapılandırması
-- ---------------------------------------------------------

-- Tenant oluşturulduğunda otomatik şema ve temel tablolar oluşturan işlev
CREATE OR REPLACE FUNCTION public.create_tenant_schema(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  schema_name TEXT;
  table_array TEXT[] := ARRAY['users', 'students', 'teachers', 'classes'];
  table_name TEXT;
BEGIN
  -- Şema adı oluştur
  schema_name := 'tenant_' || tenant_id;
  
  -- Şema oluştur
  EXECUTE 'CREATE SCHEMA IF NOT EXISTS ' || schema_name;
  
  -- Kullanıcılar tablosu
  EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_tenant
      FOREIGN KEY(tenant_id) 
      REFERENCES public.tenants(id)
      ON DELETE CASCADE
  )';
  
  -- Öğrenciler tablosu
  EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    student_number TEXT UNIQUE NOT NULL,
    email TEXT,
    grade TEXT,
    class_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_tenant
      FOREIGN KEY(tenant_id) 
      REFERENCES public.tenants(id)
      ON DELETE CASCADE
  )';
  
  -- Öğretmenler tablosu
  EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subjects TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_tenant
      FOREIGN KEY(tenant_id) 
      REFERENCES public.tenants(id)
      ON DELETE CASCADE
  )';
  
  -- Sınıflar tablosu
  EXECUTE 'CREATE TABLE IF NOT EXISTS ' || schema_name || '.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    teacher_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT fk_tenant
      FOREIGN KEY(tenant_id) 
      REFERENCES public.tenants(id)
      ON DELETE CASCADE
  )';
  
  -- Tüm tablolara RLS uygula
  EXECUTE 'ALTER TABLE ' || schema_name || '.users ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE ' || schema_name || '.students ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE ' || schema_name || '.teachers ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE ' || schema_name || '.classes ENABLE ROW LEVEL SECURITY';
  
  -- Tablolar için tenant izolasyon politikası oluştur
  EXECUTE 'CREATE POLICY tenant_isolation_users ON ' || schema_name || '.users
    FOR ALL
    USING (tenant_id = get_current_tenant_id())';
    
  EXECUTE 'CREATE POLICY tenant_isolation_students ON ' || schema_name || '.students
    FOR ALL
    USING (tenant_id = get_current_tenant_id())';
    
  EXECUTE 'CREATE POLICY tenant_isolation_teachers ON ' || schema_name || '.teachers
    FOR ALL
    USING (tenant_id = get_current_tenant_id())';
    
  EXECUTE 'CREATE POLICY tenant_isolation_classes ON ' || schema_name || '.classes
    FOR ALL
    USING (tenant_id = get_current_tenant_id())';
    
  -- Tetikleyici oluştur: Yeni kayıtlar için tenant_id otomatik ekle
  FOREACH table_name IN ARRAY table_array LOOP
    -- Düzeltilen kısım - FORMAT kullanarak güvenli dinamik SQL oluştur
    EXECUTE FORMAT('
      CREATE OR REPLACE FUNCTION %I.set_tenant_id()
      RETURNS TRIGGER AS $func$
      BEGIN
        NEW.tenant_id := %L::UUID;
        RETURN NEW;
      END;
      $func$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS ensure_tenant_id_%I ON %I.%I;
      
      CREATE TRIGGER ensure_tenant_id_%I
      BEFORE INSERT ON %I.%I
      FOR EACH ROW
      WHEN (NEW.tenant_id IS NULL)
      EXECUTE FUNCTION %I.set_tenant_id();
    ', 
    schema_name, -- %I: set_tenant_id() fonksiyonunun şema adı
    tenant_id,   -- %L: tenant_id değeri
    table_name,  -- %I: trigger adındaki tablo adı
    schema_name, table_name, -- %I.%I: tablo adı
    table_name,  -- %I: trigger adı
    schema_name, table_name, -- %I.%I: tablo adı
    schema_name  -- %I: fonksiyon adı
    );
  END LOOP;
  
  -- Uygulamanın şemaya erişimini sağla
  EXECUTE 'GRANT USAGE ON SCHEMA ' || schema_name || ' TO app_user';
  EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ' || schema_name || ' TO app_user';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant silme işlevi
CREATE OR REPLACE FUNCTION public.drop_tenant_schema(tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  schema_name TEXT;
BEGIN
  schema_name := 'tenant_' || tenant_id;
  
  -- Şemayı sil (içindeki tüm tabloları da siler)
  EXECUTE 'DROP SCHEMA IF EXISTS ' || schema_name || ' CASCADE';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------
-- Tenant oluşturma tetikleyicisi 
-- ---------------------------------------------------------

-- Yeni bir tenant oluşturulduğunda şema ve tabloları otomatik oluştur
CREATE OR REPLACE FUNCTION public.tenant_created_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Tenant şeması oluştur
  PERFORM public.create_tenant_schema(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tetikleyiciyi tanımla
DROP TRIGGER IF EXISTS create_tenant_schema_trigger ON public.tenants;

CREATE TRIGGER create_tenant_schema_trigger
AFTER INSERT ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.tenant_created_trigger();

-- ---------------------------------------------------------
-- Tenant silme tetikleyicisi
-- ---------------------------------------------------------

-- Tenant silindiğinde şema ve tablolarını otomatik temizle
CREATE OR REPLACE FUNCTION public.tenant_deleted_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Tenant şemasını temizle
  PERFORM public.drop_tenant_schema(OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tetikleyiciyi tanımla
DROP TRIGGER IF EXISTS drop_tenant_schema_trigger ON public.tenants;

CREATE TRIGGER drop_tenant_schema_trigger
BEFORE DELETE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.tenant_deleted_trigger();