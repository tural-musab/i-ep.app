-- Iqra Eğitim Portalı - RLS Politika Güncellemeleri
BEGIN;

-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS super_admin_tenant_access ON public.tenants;
DROP POLICY IF EXISTS super_admin_class_access ON public.classes;
DROP POLICY IF EXISTS super_admin_student_access ON public.students;
DROP POLICY IF EXISTS tenant_admin_tenant_access ON public.tenants;
DROP POLICY IF EXISTS tenant_admin_class_access ON public.classes;
DROP POLICY IF EXISTS tenant_admin_student_access ON public.students;

-- Super admin için tüm tablolara erişim politikası
CREATE POLICY super_admin_tenant_access ON public.tenants
  FOR ALL
  TO authenticated
  USING (is_super_admin());

CREATE POLICY super_admin_class_access ON public.classes
  FOR ALL
  TO authenticated
  USING (is_super_admin());

CREATE POLICY super_admin_student_access ON public.students
  FOR ALL
  TO authenticated
  USING (is_super_admin());

-- Service role için bypass politikası
ALTER TABLE public.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.classes FORCE ROW LEVEL SECURITY;
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;

-- Tenant admin için kendi tenant'ına ait kayıtlara erişim
CREATE POLICY tenant_admin_tenant_access ON public.tenants
  FOR ALL
  TO authenticated
  USING (is_tenant_admin(id));

CREATE POLICY tenant_admin_class_access ON public.classes
  FOR ALL
  TO authenticated
  USING (is_tenant_admin(tenant_id));

CREATE POLICY tenant_admin_student_access ON public.students
  FOR ALL
  TO authenticated
  USING (is_tenant_admin(tenant_id));

COMMIT; 