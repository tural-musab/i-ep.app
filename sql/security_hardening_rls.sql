-- =========================================================
-- İ-EP.APP Security Hardening - Row Level Security (RLS) Improvements
-- =========================================================
-- Bu script mevcut RLS politikalarını sertleştirir ve eksikleri giderir
-- Tenant izolasyonu ve rol-based erişim kontrolü güçlendirilir
-- =========================================================

BEGIN;

-- =========================================================
-- 1. UTILITY FUNCTIONS FOR ENHANCED SECURITY
-- =========================================================

-- Daha güvenli tenant ID alma fonksiyonu
CREATE OR REPLACE FUNCTION utils.get_user_tenant_id_secure()
RETURNS UUID AS $$
DECLARE
  tenant_id UUID;
BEGIN
  -- Kullanıcının tenant_id'sini güvenli şekilde al
  SELECT u.tenant_id INTO tenant_id
  FROM public.users u 
  WHERE u.id = auth.uid() 
  AND u.is_active = TRUE 
  AND u.deleted_at IS NULL;
  
  RETURN tenant_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Audit log: Unauthorized access attempt
    INSERT INTO audit.access_denied_logs (
      user_id, attempted_action, error_message, created_at
    ) VALUES (
      auth.uid(), 'get_tenant_id', SQLERRM, now()
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced role checking with audit
CREATE OR REPLACE FUNCTION utils.get_current_user_role_secure()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT u.role INTO user_role
  FROM public.users u 
  WHERE u.id = auth.uid() 
  AND u.is_active = TRUE 
  AND u.deleted_at IS NULL;
  
  RETURN COALESCE(user_role, 'anonymous');
EXCEPTION
  WHEN OTHERS THEN
    -- Audit log: Unauthorized role access attempt
    INSERT INTO audit.access_denied_logs (
      user_id, attempted_action, error_message, created_at
    ) VALUES (
      auth.uid(), 'get_user_role', SQLERRM, now()
    );
    RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenant membership verification with stricter checks
CREATE OR REPLACE FUNCTION utils.is_tenant_member_secure(check_tenant_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_member BOOLEAN := FALSE;
BEGIN
  -- Kullanıcının bu tenant'a üye olup olmadığını kontrol et
  SELECT TRUE INTO is_member
  FROM public.users u 
  WHERE u.id = auth.uid() 
  AND u.tenant_id = check_tenant_id
  AND u.is_active = TRUE 
  AND u.deleted_at IS NULL
  AND u.verification_status = 'verified';
  
  RETURN COALESCE(is_member, FALSE);
EXCEPTION
  WHEN OTHERS THEN
    -- Audit log: Tenant access violation attempt
    INSERT INTO audit.access_denied_logs (
      user_id, attempted_action, error_message, tenant_id, created_at
    ) VALUES (
      auth.uid(), 'tenant_membership_check', SQLERRM, check_tenant_id, now()
    );
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================
-- 2. ACCESS DENIED AUDIT TABLE
-- =========================================================

CREATE TABLE IF NOT EXISTS audit.access_denied_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tenant_id UUID,
  attempted_action TEXT NOT NULL,
  table_name TEXT,
  row_id TEXT,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- RLS for access denied logs - only super admins can see
ALTER TABLE audit.access_denied_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS access_denied_logs_super_admin_policy ON audit.access_denied_logs;
CREATE POLICY access_denied_logs_super_admin_policy ON audit.access_denied_logs 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin');

-- =========================================================
-- 3. MANAGEMENT SCHEMA SECURITY HARDENING
-- =========================================================

-- Strengthen tenants table RLS
DROP POLICY IF EXISTS tenant_super_admin_policy ON management.tenants;
DROP POLICY IF EXISTS tenant_user_policy ON management.tenants;

CREATE POLICY tenant_super_admin_policy ON management.tenants 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin')
  WITH CHECK (utils.get_current_user_role_secure() = 'super_admin');

CREATE POLICY tenant_admin_read_policy ON management.tenants 
  FOR SELECT 
  TO authenticated 
  USING (
    id = utils.get_user_tenant_id_secure() AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- Domains table hardening
DROP POLICY IF EXISTS domain_super_admin_policy ON management.domains;
DROP POLICY IF EXISTS domain_user_policy ON management.domains;
DROP POLICY IF EXISTS domain_admin_policy ON management.domains;

CREATE POLICY domain_super_admin_policy ON management.domains 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin')
  WITH CHECK (utils.get_current_user_role_secure() = 'super_admin');

CREATE POLICY domain_admin_policy ON management.domains 
  FOR ALL 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  )
  WITH CHECK (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- Subscriptions RLS hardening
DROP POLICY IF EXISTS subscriptions_super_admin_policy ON management.subscriptions;
DROP POLICY IF EXISTS subscriptions_admin_policy ON management.subscriptions;

CREATE POLICY subscriptions_super_admin_policy ON management.subscriptions 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin')
  WITH CHECK (utils.get_current_user_role_secure() = 'super_admin');

CREATE POLICY subscriptions_admin_read_policy ON management.subscriptions 
  FOR SELECT 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- Invoices RLS hardening
DROP POLICY IF EXISTS invoices_super_admin_policy ON management.invoices;
DROP POLICY IF EXISTS invoices_admin_policy ON management.invoices;

CREATE POLICY invoices_super_admin_policy ON management.invoices 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin')
  WITH CHECK (utils.get_current_user_role_secure() = 'super_admin');

CREATE POLICY invoices_admin_read_policy ON management.invoices 
  FOR SELECT 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- =========================================================
-- 4. PUBLIC SCHEMA SECURITY HARDENING
-- =========================================================

-- Users table - stricter policies
DROP POLICY IF EXISTS users_super_admin_policy ON public.users;
DROP POLICY IF EXISTS users_self_policy ON public.users;
DROP POLICY IF EXISTS users_admin_policy ON public.users;
DROP POLICY IF EXISTS users_teacher_policy ON public.users;

-- Super admin sees all
CREATE POLICY users_super_admin_policy ON public.users 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin')
  WITH CHECK (utils.get_current_user_role_secure() = 'super_admin');

-- Users can read/update their own data
CREATE POLICY users_self_policy ON public.users 
  FOR ALL 
  TO authenticated 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can manage users in their tenant
CREATE POLICY users_admin_policy ON public.users 
  FOR ALL 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  )
  WITH CHECK (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- Teachers can read users in their tenant (students, parents)
CREATE POLICY users_teacher_read_policy ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'teacher' AND
    role IN ('student', 'parent')
  );

-- Students can only see teachers and other students in their tenant
CREATE POLICY users_student_read_policy ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'student' AND
    role IN ('teacher', 'student')
  );

-- Parents can see teachers and their own children
CREATE POLICY users_parent_read_policy ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'parent' AND
    (role = 'teacher' OR 
     EXISTS (
       SELECT 1 FROM tenant_template.parent_student_relationships psr 
       WHERE psr.parent_id = auth.uid() AND psr.student_id = users.id
     ))
  );

-- API Tokens - stricter access
DROP POLICY IF EXISTS api_tokens_super_admin_policy ON public.api_tokens;
DROP POLICY IF EXISTS api_tokens_admin_policy ON public.api_tokens;

CREATE POLICY api_tokens_super_admin_policy ON public.api_tokens 
  FOR ALL 
  TO authenticated 
  USING (utils.get_current_user_role_secure() = 'super_admin')
  WITH CHECK (utils.get_current_user_role_secure() = 'super_admin');

CREATE POLICY api_tokens_admin_policy ON public.api_tokens 
  FOR ALL 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  )
  WITH CHECK (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- Sessions security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sessions_owner_policy ON public.sessions;
DROP POLICY IF EXISTS sessions_admin_policy ON public.sessions;

CREATE POLICY sessions_owner_policy ON public.sessions 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY sessions_admin_policy ON public.sessions 
  FOR SELECT 
  TO authenticated 
  USING (
    utils.is_tenant_member_secure(tenant_id) AND 
    utils.get_current_user_role_secure() = 'admin'
  );

-- User profiles security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_profiles_owner_policy ON public.user_profiles;
DROP POLICY IF EXISTS user_profiles_admin_policy ON public.user_profiles;

CREATE POLICY user_profiles_owner_policy ON public.user_profiles 
  FOR ALL 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY user_profiles_admin_policy ON public.user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = user_profiles.user_id 
      AND utils.is_tenant_member_secure(u.tenant_id) 
      AND utils.get_current_user_role_secure() = 'admin'
    )
  );

-- =========================================================
-- 5. TENANT TEMPLATE SCHEMA HARDENING
-- =========================================================

-- Function to apply tenant isolation to all tenant_template tables
CREATE OR REPLACE FUNCTION apply_tenant_template_rls()
RETURNS VOID AS $$
DECLARE
  table_record RECORD;
  policy_name TEXT;
BEGIN
  -- Get all tables in tenant_template schema
  FOR table_record IN 
    SELECT schemaname, tablename 
    FROM pg_tables 
    WHERE schemaname = 'tenant_template'
  LOOP
    -- Enable RLS
    EXECUTE 'ALTER TABLE ' || table_record.schemaname || '.' || table_record.tablename || ' ENABLE ROW LEVEL SECURITY';
    
    -- Create admin policy
    policy_name := table_record.tablename || '_admin_policy';
    EXECUTE 'DROP POLICY IF EXISTS ' || policy_name || ' ON ' || table_record.schemaname || '.' || table_record.tablename;
    EXECUTE 'CREATE POLICY ' || policy_name || ' ON ' || table_record.schemaname || '.' || table_record.tablename || 
            ' FOR ALL TO authenticated USING (utils.get_current_user_role_secure() IN (''admin'', ''super_admin''))' ||
            ' WITH CHECK (utils.get_current_user_role_secure() IN (''admin'', ''super_admin''))';
    
    -- Create teacher policy (read/update)
    policy_name := table_record.tablename || '_teacher_policy';
    EXECUTE 'DROP POLICY IF EXISTS ' || policy_name || ' ON ' || table_record.schemaname || '.' || table_record.tablename;
    EXECUTE 'CREATE POLICY ' || policy_name || ' ON ' || table_record.schemaname || '.' || table_record.tablename || 
            ' FOR SELECT TO authenticated USING (utils.get_current_user_role_secure() = ''teacher'')';
    
    -- Create student/parent policy (read-only)
    policy_name := table_record.tablename || '_student_parent_policy';
    EXECUTE 'DROP POLICY IF EXISTS ' || policy_name || ' ON ' || table_record.schemaname || '.' || table_record.tablename;
    EXECUTE 'CREATE POLICY ' || policy_name || ' ON ' || table_record.schemaname || '.' || table_record.tablename || 
            ' FOR SELECT TO authenticated USING (utils.get_current_user_role_secure() IN (''student'', ''parent''))';
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Apply RLS to all tenant_template tables
SELECT apply_tenant_template_rls();

-- =========================================================
-- 6. AUDIT TRIGGERS FOR SECURITY MONITORING
-- =========================================================

-- Enhanced audit function with security focus
CREATE OR REPLACE FUNCTION audit.security_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  user_tenant_id UUID;
  row_tenant_id UUID;
BEGIN
  -- Get user's tenant ID
  user_tenant_id := utils.get_user_tenant_id_secure();
  
  -- Get row's tenant ID (if column exists)
  BEGIN
    IF TG_OP = 'DELETE' THEN
      row_tenant_id := OLD.tenant_id;
    ELSE
      row_tenant_id := NEW.tenant_id;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      row_tenant_id := NULL;
  END;
  
  -- Log potential security violations
  IF row_tenant_id IS NOT NULL AND user_tenant_id != row_tenant_id AND utils.get_current_user_role_secure() != 'super_admin' THEN
    INSERT INTO audit.access_denied_logs (
      user_id, tenant_id, attempted_action, table_name, 
      error_message, created_at
    ) VALUES (
      auth.uid(), row_tenant_id, TG_OP || ' on ' || TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      'Cross-tenant access attempt detected', now()
    );
  END IF;
  
  -- Continue with normal audit logging
  INSERT INTO audit.audit_logs (
    tenant_id, user_id, action, entity_type, entity_id,
    old_data, new_data, created_at
  ) VALUES (
    COALESCE(row_tenant_id, user_tenant_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
         WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
         ELSE NULL END,
    now()
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT; 