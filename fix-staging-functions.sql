-- İ-EP.APP - Staging Function Fix
-- Missing functions from billing system migration

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