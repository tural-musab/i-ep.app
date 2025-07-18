-- Iqra Eğitim Portalı - Tenants Tablosu
BEGIN;

-- Tenants tablosu
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- RLS politikaları
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Super admin için erişim politikası
CREATE POLICY super_admin_tenant_access ON public.tenants
    FOR ALL
    TO authenticated
    USING (is_super_admin());

-- Service role için bypass politikası
CREATE POLICY service_role_bypass ON public.tenants
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Tenant admin için kendi tenant'ına erişim
CREATE POLICY tenant_admin_access ON public.tenants
    FOR ALL
    TO authenticated
    USING (is_tenant_admin(id));

-- İndeksler
CREATE INDEX idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX idx_tenants_is_active ON public.tenants(is_active);

-- Trigger fonksiyonu - updated_at alanını günceller
CREATE OR REPLACE FUNCTION update_tenant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ı ekle
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();

COMMIT; 