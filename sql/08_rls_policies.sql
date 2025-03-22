-- Management.tenants tablosu için RLS
ALTER TABLE management.tenants ENABLE ROW LEVEL SECURITY;

-- Sadece super_admin'ler tüm tenant'ları görebilir
CREATE POLICY tenant_super_admin_policy ON management.tenants 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Diğer kullanıcılar kendi tenant'larını görebilir
CREATE POLICY tenant_user_policy ON management.tenants 
  FOR SELECT 
  TO authenticated 
  USING (id = utils.get_user_tenant_id(auth.uid()));

-- Domains tablosu için RLS
ALTER TABLE management.domains ENABLE ROW LEVEL SECURITY;

-- Super admin'ler tüm domain'leri görebilir
CREATE POLICY domain_super_admin_policy ON management.domains 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Kullanıcılar kendi tenant'larındaki domain'leri görebilir
CREATE POLICY domain_user_policy ON management.domains 
  FOR SELECT 
  TO authenticated 
  USING (tenant_id = utils.get_user_tenant_id(auth.uid()));

-- Admin'ler kendi tenant'larındaki domain'leri yönetebilir
CREATE POLICY domain_admin_policy ON management.domains 
  FOR ALL 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'admin'
  );

-- Users tablosu için RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Super admin'ler tüm kullanıcıları görebilir
CREATE POLICY users_super_admin_policy ON public.users 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Kullanıcılar kendi verilerini görebilir
CREATE POLICY users_self_policy ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (id = auth.uid());

-- Admin'ler kendi tenant'larındaki kullanıcıları görebilir
CREATE POLICY users_admin_policy ON public.users 
  FOR ALL 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'admin'
  );

-- Öğretmenler kendi tenant'larındaki kullanıcıları görebilir (salt okunur)
CREATE POLICY users_teacher_policy ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'teacher'
  );

-- Tüm tenant şablonu tabloları için RLS politikaları
-- Burada, tüm tenant_template tabloları için benzer politikalar oluşturulmalıdır.
-- Bu, tenant'lar oluşturulduğunda kopyalandığında düzenlenecektir.

-- Örnek olarak bir tenant şablon tablosuna politika:
ALTER TABLE tenant_template.schools ENABLE ROW LEVEL SECURITY;

-- Tenant'taki admin'ler okulları tam yönetebilir
CREATE POLICY schools_admin_policy ON tenant_template.schools 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT IN ('admin', 'super_admin'));

-- Tenant'taki öğretmenler okulları görebilir
CREATE POLICY schools_teacher_policy ON tenant_template.schools 
  FOR SELECT 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'teacher');

-- Tenant'taki öğrenciler ve veliler okulları görebilir
CREATE POLICY schools_student_parent_policy ON tenant_template.schools 
  FOR SELECT 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT IN ('student', 'parent'));

-- Benzer RLS politikalarını diğer tablolar için de oluşturmak gerekir
-- Bu, gerçek tenant'lara kopyalandığında düzenlenecektir.

-- Audit logs için RLS
ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admin tüm log'ları görebilir
CREATE POLICY audit_logs_super_admin_policy ON audit.audit_logs 
  FOR SELECT 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Admin'ler kendi tenant'larının log'larını görebilir
CREATE POLICY audit_logs_admin_policy ON audit.audit_logs 
  FOR SELECT 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'admin'
  );

-- API Tokens için RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Super admin tüm token'ları görebilir
CREATE POLICY api_tokens_super_admin_policy ON public.api_tokens 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Admin'ler kendi tenant'larının token'larını yönetebilir
CREATE POLICY api_tokens_admin_policy ON public.api_tokens 
  FOR ALL 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'admin'
  );

-- Subscriptions için RLS
ALTER TABLE management.subscriptions ENABLE ROW LEVEL SECURITY;

-- Super admin tüm abonelikleri görebilir
CREATE POLICY subscriptions_super_admin_policy ON management.subscriptions 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Admin'ler kendi tenant'larının aboneliklerini görebilir
CREATE POLICY subscriptions_admin_policy ON management.subscriptions 
  FOR SELECT 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'admin'
  );

-- Invoices için RLS
ALTER TABLE management.invoices ENABLE ROW LEVEL SECURITY;

-- Super admin tüm faturaları görebilir
CREATE POLICY invoices_super_admin_policy ON management.invoices 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role()::TEXT = 'super_admin');

-- Admin'ler kendi tenant'larının faturalarını görebilir
CREATE POLICY invoices_admin_policy ON management.invoices 
  FOR SELECT 
  TO authenticated 
  USING (
    tenant_id = utils.get_user_tenant_id(auth.uid()) AND 
    utils.get_current_user_role()::TEXT = 'admin'
  ); 