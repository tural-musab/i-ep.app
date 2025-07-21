-- 0-EP.APP - Fix Missing Functions in Staging
-- Description: Add missing functions that should have been deployed with billing migration

BEGIN;

-- Function to get current tenant ID from app settings
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

-- Function to check if current user is super admin
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

-- Function to get current user role from JWT
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    -- Extract role from JWT claims
    RETURN COALESCE(
        auth.jwt() ->> 'app_metadata' ->> 'role',
        'user' -- default role
    );
EXCEPTION 
    WHEN OTHERS THEN
        RETURN 'user'; -- safe default
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's student ID
CREATE OR REPLACE FUNCTION get_current_user_student_id()
RETURNS UUID AS $$
DECLARE
    student_id UUID;
BEGIN
    -- Get student ID from students table for current user
    SELECT id INTO student_id 
    FROM public.students 
    WHERE user_id = auth.uid() 
    AND tenant_id = get_current_tenant_id()
    LIMIT 1;
    
    RETURN student_id;
EXCEPTION 
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMIT;