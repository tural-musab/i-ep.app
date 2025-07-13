-- İ-EP.APP Storage System - File Management Tables
-- Created: 2025-01-14
-- Description: Storage abstraction layer for future Cloudflare R2 migration

BEGIN;

-- ==========================================
-- STORAGE FILES TABLE (PUBLIC SCHEMA)
-- ==========================================

-- Main files table with provider abstraction
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- User relationship
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    
    -- File metadata
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT,
    size_bytes BIGINT NOT NULL,
    file_hash TEXT, -- SHA256 hash for deduplication
    
    -- Storage provider information
    storage_provider TEXT NOT NULL DEFAULT 'supabase', -- 'supabase', 'r2', 's3'
    storage_path TEXT NOT NULL, -- Provider-specific path
    storage_bucket TEXT DEFAULT 'files',
    cdn_url TEXT, -- Future CDN URL for R2/CloudFront
    
    -- Access control
    access_level TEXT NOT NULL DEFAULT 'private', -- 'private', 'tenant', 'public'
    folder_path TEXT DEFAULT '/', -- Virtual folder structure
    
    -- Relationships
    related_to_type TEXT, -- 'assignment', 'announcement', 'message', 'profile'
    related_to_id UUID, -- ID of related entity
    
    -- Usage tracking
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- File metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Extensible metadata
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'deleted', 'quarantined'
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_storage_provider CHECK (storage_provider IN ('supabase', 'r2', 's3')),
    CONSTRAINT valid_access_level CHECK (access_level IN ('private', 'tenant', 'public')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'deleted', 'quarantined')),
    CONSTRAINT positive_size CHECK (size_bytes > 0)
);

-- ==========================================
-- FILE SHARES TABLE
-- ==========================================

-- Manage file sharing between users
CREATE TABLE IF NOT EXISTS public.file_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    shared_with_type TEXT NOT NULL, -- 'user', 'class', 'tenant', 'public'
    shared_with_id UUID, -- NULL for public shares
    
    -- Permissions
    can_download BOOLEAN DEFAULT true,
    can_view BOOLEAN DEFAULT true,
    can_delete BOOLEAN DEFAULT false,
    
    -- Share metadata
    expires_at TIMESTAMPTZ,
    access_token TEXT, -- For public link shares
    password_hash TEXT, -- Optional password protection
    
    -- Usage
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_share_type CHECK (shared_with_type IN ('user', 'class', 'tenant', 'public')),
    CONSTRAINT unique_share_token UNIQUE (access_token)
);

-- ==========================================
-- FILE CATEGORIES TABLE
-- ==========================================

-- Categorize files for better organization
CREATE TABLE IF NOT EXISTS public.file_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id UUID REFERENCES public.file_categories(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT false, -- System categories can't be deleted
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Unique slug per tenant
    CONSTRAINT unique_category_slug_per_tenant UNIQUE (tenant_id, slug)
);

-- ==========================================
-- FILE CATEGORY ASSIGNMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.file_category_assignments (
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.file_categories(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (file_id, category_id)
);

-- ==========================================
-- STORAGE QUOTAS TABLE
-- ==========================================

-- Track storage usage and limits per tenant
CREATE TABLE IF NOT EXISTS public.storage_quotas (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Quotas in MB
    total_quota_mb INTEGER DEFAULT 10240, -- 10GB default
    used_storage_mb INTEGER DEFAULT 0,
    
    -- File count limits
    max_file_count INTEGER DEFAULT NULL, -- NULL = unlimited
    current_file_count INTEGER DEFAULT 0,
    
    -- Individual file size limit in MB
    max_file_size_mb INTEGER DEFAULT 100, -- 100MB default
    
    -- Usage by type
    usage_by_type JSONB DEFAULT '{}'::jsonb, -- {"images": 1024, "documents": 512, ...}
    
    -- Alerts
    alert_at_percent INTEGER DEFAULT 80, -- Alert when 80% full
    last_alert_sent_at TIMESTAMPTZ,
    
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- FILE MIGRATIONS TABLE
-- ==========================================

-- Track file migrations between storage providers
CREATE TABLE IF NOT EXISTS public.file_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
    
    -- Migration details
    from_provider TEXT NOT NULL,
    to_provider TEXT NOT NULL,
    from_path TEXT NOT NULL,
    to_path TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_migration_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'))
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Files indexes
CREATE INDEX idx_files_tenant ON public.files(tenant_id);
CREATE INDEX idx_files_uploaded_by ON public.files(uploaded_by);
CREATE INDEX idx_files_status ON public.files(status);
CREATE INDEX idx_files_provider ON public.files(storage_provider);
CREATE INDEX idx_files_related ON public.files(related_to_type, related_to_id);
CREATE INDEX idx_files_folder ON public.files(tenant_id, folder_path);
CREATE INDEX idx_files_created ON public.files(created_at DESC);
CREATE INDEX idx_files_size ON public.files(size_bytes);
CREATE INDEX idx_files_mime ON public.files(mime_type);

-- File shares indexes
CREATE INDEX idx_file_shares_file ON public.file_shares(file_id);
CREATE INDEX idx_file_shares_shared_by ON public.file_shares(shared_by);
CREATE INDEX idx_file_shares_shared_with ON public.file_shares(shared_with_type, shared_with_id);
CREATE INDEX idx_file_shares_token ON public.file_shares(access_token) WHERE access_token IS NOT NULL;
CREATE INDEX idx_file_shares_expires ON public.file_shares(expires_at) WHERE expires_at IS NOT NULL;

-- Categories indexes
CREATE INDEX idx_file_categories_tenant ON public.file_categories(tenant_id);
CREATE INDEX idx_file_categories_parent ON public.file_categories(parent_id);

-- Migrations indexes
CREATE INDEX idx_file_migrations_file ON public.file_migrations(file_id);
CREATE INDEX idx_file_migrations_status ON public.file_migrations(status);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_migrations ENABLE ROW LEVEL SECURITY;

-- Service role bypass for all tables
CREATE POLICY service_role_files ON public.files
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_shares ON public.file_shares
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_categories ON public.file_categories
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_assignments ON public.file_category_assignments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_quotas ON public.storage_quotas
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_migrations ON public.file_migrations
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Files access policies
CREATE POLICY files_tenant_isolation ON public.files
    FOR ALL TO authenticated
    USING (
        tenant_id = get_current_tenant_id() 
        OR is_super_admin()
    );

CREATE POLICY files_owner_access ON public.files
    FOR ALL TO authenticated
    USING (
        uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.file_shares
            WHERE file_id = files.id
            AND shared_with_type = 'user'
            AND shared_with_id = auth.uid()
            AND (expires_at IS NULL OR expires_at > now())
        )
    );

-- File shares policies
CREATE POLICY shares_creator_access ON public.file_shares
    FOR ALL TO authenticated
    USING (shared_by = auth.uid() OR is_super_admin());

CREATE POLICY shares_recipient_view ON public.file_shares
    FOR SELECT TO authenticated
    USING (
        (shared_with_type = 'user' AND shared_with_id = auth.uid())
        OR (shared_with_type = 'tenant' AND EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND tenant_id = file_shares.shared_with_id
        ))
    );

-- Categories policies
CREATE POLICY categories_tenant_access ON public.file_categories
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_super_admin());

-- Category assignments policies
CREATE POLICY assignments_file_access ON public.file_category_assignments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.files
            WHERE id = file_category_assignments.file_id
            AND (tenant_id = get_current_tenant_id() OR uploaded_by = auth.uid())
        )
    );

-- Quotas policies
CREATE POLICY quotas_tenant_access ON public.storage_quotas
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_super_admin());

-- Migrations policies (super admin only)
CREATE POLICY migrations_super_admin ON public.file_migrations
    FOR ALL TO authenticated
    USING (is_super_admin());

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Update timestamps
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION update_tenant_updated_at();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.file_categories
    FOR EACH ROW EXECUTE FUNCTION update_tenant_updated_at();

CREATE TRIGGER update_quotas_updated_at
    BEFORE UPDATE ON public.storage_quotas
    FOR EACH ROW EXECUTE FUNCTION update_tenant_updated_at();

-- ==========================================
-- UTILITY FUNCTIONS
-- ==========================================

-- Function to calculate folder size
CREATE OR REPLACE FUNCTION public.calculate_folder_size(
    p_tenant_id UUID,
    p_folder_path TEXT
)
RETURNS BIGINT AS $$
DECLARE
    total_size BIGINT;
BEGIN
    SELECT COALESCE(SUM(size_bytes), 0) INTO total_size
    FROM public.files
    WHERE tenant_id = p_tenant_id
    AND folder_path LIKE p_folder_path || '%'
    AND status = 'active';
    
    RETURN total_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update storage quota
CREATE OR REPLACE FUNCTION public.update_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.storage_quotas
        SET 
            used_storage_mb = used_storage_mb + (NEW.size_bytes / 1024 / 1024),
            current_file_count = current_file_count + 1,
            updated_at = now()
        WHERE tenant_id = NEW.tenant_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.storage_quotas
        SET 
            used_storage_mb = used_storage_mb - (OLD.size_bytes / 1024 / 1024),
            current_file_count = current_file_count - 1,
            updated_at = now()
        WHERE tenant_id = OLD.tenant_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.size_bytes != NEW.size_bytes THEN
        UPDATE public.storage_quotas
        SET 
            used_storage_mb = used_storage_mb - (OLD.size_bytes / 1024 / 1024) + (NEW.size_bytes / 1024 / 1024),
            updated_at = now()
        WHERE tenant_id = NEW.tenant_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply quota update trigger
CREATE TRIGGER update_quota_on_file_change
    AFTER INSERT OR DELETE OR UPDATE OF size_bytes ON public.files
    FOR EACH ROW
    WHEN (NEW.status = 'active' OR OLD.status = 'active')
    EXECUTE FUNCTION public.update_storage_quota();

-- ==========================================
-- DEFAULT CATEGORIES
-- ==========================================

-- Function to create default categories for new tenants
CREATE OR REPLACE FUNCTION public.create_default_file_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default categories for new tenant
    INSERT INTO public.file_categories (tenant_id, name, slug, icon, color, is_system, sort_order)
    VALUES 
        (NEW.id, 'Belgeler', 'documents', 'file-text', '#3B82F6', true, 1),
        (NEW.id, 'Resimler', 'images', 'image', '#10B981', true, 2),
        (NEW.id, 'Videolar', 'videos', 'video', '#8B5CF6', true, 3),
        (NEW.id, 'Ödevler', 'assignments', 'book-open', '#F59E0B', true, 4),
        (NEW.id, 'Duyurular', 'announcements', 'megaphone', '#EF4444', true, 5);
    
    -- Create storage quota entry
    INSERT INTO public.storage_quotas (tenant_id)
    VALUES (NEW.id)
    ON CONFLICT (tenant_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to create categories for new tenants
CREATE TRIGGER create_tenant_file_categories
    AFTER INSERT ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_file_categories();

COMMIT;

-- ==========================================
-- MIGRATION COMPLETED
-- ==========================================

-- This migration creates:
-- 1. files - Main file storage table with provider abstraction
-- 2. file_shares - Secure file sharing between users
-- 3. file_categories - Organize files into categories
-- 4. storage_quotas - Track and limit storage usage per tenant
-- 5. file_migrations - Track migrations between storage providers
-- 6. RLS policies for secure multi-tenant access
-- 7. Utility functions for storage management
-- 8. Default file categories for new tenants