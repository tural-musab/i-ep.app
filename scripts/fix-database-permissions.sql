-- Fix Database Permissions for i-ep.app
-- Purpose: Grant necessary permissions to authenticated role for public schema access

-- Grant USAGE permission on public schema to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT permission on all existing tables in public schema
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant SELECT permission on all future tables in public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

-- Grant USAGE on all sequences (for auto-increment fields)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE ON SEQUENCES TO authenticated;

-- Grant EXECUTE on all functions in public schema (for RPC calls)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;

-- Additional permissions for tenant-related operations
-- Grant INSERT, UPDATE, DELETE permissions if needed for tenant operations
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;

-- Specific permissions for common tables that might be accessed by middleware
-- Note: Adjust table names based on your actual schema
DO $$ 
BEGIN
    -- Grant permissions on tenants table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tenants') THEN
        GRANT ALL ON public.tenants TO authenticated;
    END IF;
    
    -- Grant permissions on domains table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'domains') THEN
        GRANT ALL ON public.domains TO authenticated;
    END IF;
    
    -- Grant permissions on users table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        GRANT ALL ON public.users TO authenticated;
    END IF;
END $$;

-- Verify permissions (optional - for debugging)
-- List all permissions for authenticated role
SELECT 
    schemaname,
    tablename,
    array_agg(privilege_type) as privileges
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated' 
AND schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;