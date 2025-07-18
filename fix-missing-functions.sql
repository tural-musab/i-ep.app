-- Missing RLS Functions for Parent Communication System
-- Quick Fix for Production

-- Get current tenant ID function
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
    -- Extract tenant ID from current_setting
    RETURN COALESCE(
        (current_setting('app.current_tenant_id', true))::UUID,
        NULL
    );
EXCEPTION 
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get current user role function
CREATE OR REPLACE FUNCTION get_current_user_role()
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

-- Get current user student ID function
CREATE OR REPLACE FUNCTION get_current_user_student_id()
RETURNS UUID AS $$
BEGIN
    RETURN COALESCE(
        (current_setting('app.current_student_id', true))::UUID,
        NULL
    );
EXCEPTION 
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Super admin check function
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user has super admin role
    RETURN COALESCE(
        (current_setting('app.is_super_admin', true))::BOOLEAN,
        false
    );
EXCEPTION 
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;