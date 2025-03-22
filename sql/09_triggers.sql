-- Tenant oluşturma tetikleyicisi için fonksiyon
CREATE OR REPLACE FUNCTION management.create_tenant_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  schema_name TEXT;
BEGIN
  -- Yeni şema adını oluştur
  schema_name := 'tenant_' || NEW.id::TEXT;
  
  -- Tenant kaydındaki şema adını güncelle
  NEW.schema_name := schema_name;
  
  -- Tenant için yeni şema oluştur
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Tenant şablonundaki tabloları yeni şemaya kopyala
  -- Tüm tablo yapıları kopyalanır, veriler değil
  
  -- schools tablosu
  EXECUTE format('CREATE TABLE %I.schools (LIKE tenant_template.schools INCLUDING ALL)', schema_name);
  
  -- academic_years tablosu
  EXECUTE format('CREATE TABLE %I.academic_years (LIKE tenant_template.academic_years INCLUDING ALL)', schema_name);
  
  -- terms tablosu
  EXECUTE format('CREATE TABLE %I.terms (LIKE tenant_template.terms INCLUDING ALL)', schema_name);
  
  -- grade_levels tablosu
  EXECUTE format('CREATE TABLE %I.grade_levels (LIKE tenant_template.grade_levels INCLUDING ALL)', schema_name);
  
  -- classes tablosu
  EXECUTE format('CREATE TABLE %I.classes (LIKE tenant_template.classes INCLUDING ALL)', schema_name);
  
  -- subjects tablosu
  EXECUTE format('CREATE TABLE %I.subjects (LIKE tenant_template.subjects INCLUDING ALL)', schema_name);
  
  -- class_students tablosu
  EXECUTE format('CREATE TABLE %I.class_students (LIKE tenant_template.class_students INCLUDING ALL)', schema_name);
  
  -- schedules tablosu
  EXECUTE format('CREATE TABLE %I.schedules (LIKE tenant_template.schedules INCLUDING ALL)', schema_name);
  
  -- attendances tablosu
  EXECUTE format('CREATE TABLE %I.attendances (LIKE tenant_template.attendances INCLUDING ALL)', schema_name);
  
  -- assessment_types tablosu
  EXECUTE format('CREATE TABLE %I.assessment_types (LIKE tenant_template.assessment_types INCLUDING ALL)', schema_name);
  
  -- assessments tablosu
  EXECUTE format('CREATE TABLE %I.assessments (LIKE tenant_template.assessments INCLUDING ALL)', schema_name);
  
  -- grades tablosu
  EXECUTE format('CREATE TABLE %I.grades (LIKE tenant_template.grades INCLUDING ALL)', schema_name);
  
  -- assignments tablosu
  EXECUTE format('CREATE TABLE %I.assignments (LIKE tenant_template.assignments INCLUDING ALL)', schema_name);
  
  -- assignment_submissions tablosu
  EXECUTE format('CREATE TABLE %I.assignment_submissions (LIKE tenant_template.assignment_submissions INCLUDING ALL)', schema_name);
  
  -- announcements tablosu
  EXECUTE format('CREATE TABLE %I.announcements (LIKE tenant_template.announcements INCLUDING ALL)', schema_name);
  
  -- messages tablosu
  EXECUTE format('CREATE TABLE %I.messages (LIKE tenant_template.messages INCLUDING ALL)', schema_name);
  
  -- message_recipients tablosu
  EXECUTE format('CREATE TABLE %I.message_recipients (LIKE tenant_template.message_recipients INCLUDING ALL)', schema_name);
  
  -- parent_student_relationships tablosu
  EXECUTE format('CREATE TABLE %I.parent_student_relationships (LIKE tenant_template.parent_student_relationships INCLUDING ALL)', schema_name);
  
  -- events tablosu
  EXECUTE format('CREATE TABLE %I.events (LIKE tenant_template.events INCLUDING ALL)', schema_name);
  
  -- Her tablo için RLS politikalarını ayarla
  
  -- schools tablosu RLS
  EXECUTE format('ALTER TABLE %I.schools ENABLE ROW LEVEL SECURITY', schema_name);
  EXECUTE format('CREATE POLICY tenant_isolation_policy ON %I.schools USING (utils.get_current_tenant_id() = %L::UUID)', schema_name, NEW.id);
  
  -- Diğer tablolar için benzer RLS politikaları da eklenmeli
  
  -- Yeni tenant'a bir başlangıç okulu ekle
  EXECUTE format('INSERT INTO %I.schools (name) VALUES (%L)', schema_name, NEW.name);
  
  -- Audit log için kayıt
  INSERT INTO audit.audit_logs (
    tenant_id, 
    action, 
    entity_type, 
    entity_id, 
    new_data
  ) VALUES (
    NEW.id,
    'tenant.created',
    'tenant',
    NEW.id::TEXT,
    to_jsonb(NEW)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tenant oluşturma tetikleyicisi
CREATE TRIGGER create_tenant_trigger
  BEFORE INSERT ON management.tenants
  FOR EACH ROW
  EXECUTE FUNCTION management.create_tenant_trigger_function();

-- Tenant silme tetikleyicisi için fonksiyon
CREATE OR REPLACE FUNCTION management.delete_tenant_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Tenant'ın şemasını sil (dikkat: bunu production'da kullanırken çok dikkatli olmalısınız!)
  -- Gerçek uygulamada şemayı tamamen silmek yerine soft delete yaklaşımı daha güvenli olabilir
  -- EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', OLD.schema_name);
  
  -- Soft delete için, tenant'ı deleted_at ile işaretle
  UPDATE management.tenants 
  SET deleted_at = now() 
  WHERE id = OLD.id;
  
  -- Audit log için kayıt
  INSERT INTO audit.audit_logs (
    tenant_id, 
    action, 
    entity_type, 
    entity_id, 
    old_data
  ) VALUES (
    OLD.id,
    'tenant.deleted',
    'tenant',
    OLD.id::TEXT,
    to_jsonb(OLD)
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Tenant silme tetikleyicisi
-- NOT: Bu tehlikeli olabilir, gerçek uygulamada soft delete yaklaşımı tercih edilebilir
CREATE TRIGGER delete_tenant_trigger
  BEFORE DELETE ON management.tenants
  FOR EACH ROW
  EXECUTE FUNCTION management.delete_tenant_trigger_function();

-- Tenant güncelleme tetikleyicisi için fonksiyon
CREATE OR REPLACE FUNCTION management.update_tenant_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Tenant güncellendi, updated_at alanını güncelle
  NEW.updated_at := now();
  
  -- Audit log için kayıt
  INSERT INTO audit.audit_logs (
    tenant_id, 
    action, 
    entity_type, 
    entity_id, 
    old_data,
    new_data
  ) VALUES (
    NEW.id,
    'tenant.updated',
    'tenant',
    NEW.id::TEXT,
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tenant güncelleme tetikleyicisi
CREATE TRIGGER update_tenant_trigger
  BEFORE UPDATE ON management.tenants
  FOR EACH ROW
  EXECUTE FUNCTION management.update_tenant_trigger_function();

-- Kullanıcı için updated_at tetikleyicisi
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tüm tablolara updated_at tetikleyicisini ekle
CREATE TRIGGER set_public_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Kullanıcı audit log tetikleyicisi
CREATE OR REPLACE FUNCTION public.users_audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  action_name TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_name := 'user.created';
  ELSIF TG_OP = 'UPDATE' THEN
    action_name := 'user.updated';
  ELSIF TG_OP = 'DELETE' THEN
    action_name := 'user.deleted';
  END IF;
  
  INSERT INTO audit.audit_logs (
    tenant_id, 
    user_id,
    action, 
    entity_type, 
    entity_id, 
    old_data,
    new_data
  ) VALUES (
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.tenant_id 
      ELSE NEW.tenant_id 
    END,
    auth.uid(),
    action_name,
    'user',
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT 
      ELSE NEW.id::TEXT 
    END,
    CASE 
      WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD)
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW)
      ELSE NULL
    END
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Kullanıcı audit tetikleyicileri
CREATE TRIGGER users_audit_insert_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_audit_trigger_function();

CREATE TRIGGER users_audit_update_trigger
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_audit_trigger_function();

CREATE TRIGGER users_audit_delete_trigger
  AFTER DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.users_audit_trigger_function(); 