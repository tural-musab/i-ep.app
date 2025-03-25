-- Tenant ve Domain View'ları ve Tetikleyicileri
-- Bu script, management şemasındaki tablolar ile public şemasındaki API kodları arasında köprü oluşturur

-- İşlemi tek bir transaction içinde yapalım
BEGIN;

-- Eğer varsa mevcut view'ları ve tetikleyicileri temizleyelim
DROP VIEW IF EXISTS public.tenants CASCADE;
DROP VIEW IF EXISTS public.tenant_domains CASCADE;
DROP FUNCTION IF EXISTS public.insert_tenant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.update_tenant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.delete_tenant_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.insert_tenant_domain_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.update_tenant_domain_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.delete_tenant_domain_trigger() CASCADE;

-- ------------------------------------------------------------------------
-- 1. Tenants View Oluşturma
-- ------------------------------------------------------------------------
CREATE VIEW public.tenants AS
SELECT 
    id,
    name,
    -- Şema adından subdomain oluştur (tenant_xyz -> xyz)
    REPLACE(schema_name, 'tenant_', '') AS subdomain,
    -- subscription_plan'dan plan_type alanını oluştur
    CASE 
        WHEN subscription_plan = 'free' THEN 'free'
        WHEN subscription_plan = 'standard' THEN 'standard'
        WHEN subscription_plan = 'premium' THEN 'premium'
        ELSE 'free'
    END AS plan_type,
    -- status alanını is_active'e dönüştür
    CASE 
        WHEN status = 'active' OR status = 'trial' THEN true
        ELSE false
    END AS is_active,
    settings,
    created_at,
    updated_at
FROM management.tenants
WHERE deleted_at IS NULL;

-- ------------------------------------------------------------------------
-- 2. Tenant Domains View Oluşturma
-- ------------------------------------------------------------------------
CREATE VIEW public.tenant_domains AS
SELECT 
    id,
    tenant_id,
    domain,
    is_primary,
    -- domain status'unu is_verified'a dönüştür
    CASE 
        WHEN status = 'active' THEN true
        ELSE false
    END AS is_verified,
    -- is_custom değerini type olarak dönüştür
    CASE 
        WHEN is_custom = true THEN 'custom'::text
        ELSE 'subdomain'::text
    END AS type,
    created_at,
    verified_at
FROM management.domains;

-- ------------------------------------------------------------------------
-- 3. Insert Tetikleyicileri
-- ------------------------------------------------------------------------

-- Tenants tablosuna INSERT işlemi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.insert_tenant_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Şema adını "tenant_" + subdomain olarak oluştur
    INSERT INTO management.tenants (
        id,
        name,
        display_name,
        schema_name,
        status,
        subscription_plan,
        settings
    ) VALUES (
        NEW.id,
        NEW.name,
        NEW.name, -- display_name için name kullan
        'tenant_' || NEW.subdomain, -- Şema adını oluştur
        CASE 
            WHEN NEW.is_active = true THEN 'active'::management.tenant_status
            ELSE 'deactivated'::management.tenant_status
        END,
        (NEW.plan_type)::management.subscription_plan,
        NEW.settings
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tenant_domains tablosuna INSERT işlemi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.insert_tenant_domain_trigger()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO management.domains (
        id,
        tenant_id,
        domain,
        is_primary,
        is_custom,
        status
    ) VALUES (
        NEW.id,
        NEW.tenant_id,
        NEW.domain,
        NEW.is_primary,
        CASE 
            WHEN NEW.type = 'custom' THEN true
            ELSE false
        END,
        CASE 
            WHEN NEW.is_verified = true THEN 'active'::management.domain_status
            ELSE 'unverified'::management.domain_status
        END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------
-- 4. Update Tetikleyicileri
-- ------------------------------------------------------------------------

-- Tenants tablosuna UPDATE işlemi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.update_tenant_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE management.tenants SET
        name = NEW.name,
        display_name = NEW.name,
        settings = NEW.settings,
        status = CASE 
            WHEN NEW.is_active = true THEN 'active'::management.tenant_status
            ELSE 'deactivated'::management.tenant_status
        END,
        subscription_plan = (NEW.plan_type)::management.subscription_plan,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tenant_domains tablosuna UPDATE işlemi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.update_tenant_domain_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE management.domains SET
        domain = NEW.domain,
        is_primary = NEW.is_primary,
        is_custom = CASE 
            WHEN NEW.type = 'custom' THEN true
            ELSE false
        END,
        status = CASE 
            WHEN NEW.is_verified = true THEN 'active'::management.domain_status
            ELSE 'unverified'::management.domain_status
        END,
        updated_at = CURRENT_TIMESTAMP,
        verified_at = NEW.verified_at
    WHERE id = OLD.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------
-- 5. Delete Tetikleyicileri
-- ------------------------------------------------------------------------

-- Tenants tablosuna DELETE işlemi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.delete_tenant_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Gerçekten silmek yerine soft delete uygula
    UPDATE management.tenants SET
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Tenant_domains tablosuna DELETE işlemi için tetikleyici fonksiyonu
CREATE OR REPLACE FUNCTION public.delete_tenant_domain_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM management.domains
    WHERE id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------
-- 6. Tetikleyicileri Görsele Ekle
-- ------------------------------------------------------------------------

-- Tenants view'u için tetikleyiciler
CREATE TRIGGER insert_tenant
INSTEAD OF INSERT ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.insert_tenant_trigger();

CREATE TRIGGER update_tenant
INSTEAD OF UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_tenant_trigger();

CREATE TRIGGER delete_tenant
INSTEAD OF DELETE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.delete_tenant_trigger();

-- Tenant_domains view'u için tetikleyiciler
CREATE TRIGGER insert_tenant_domain
INSTEAD OF INSERT ON public.tenant_domains
FOR EACH ROW EXECUTE FUNCTION public.insert_tenant_domain_trigger();

CREATE TRIGGER update_tenant_domain
INSTEAD OF UPDATE ON public.tenant_domains
FOR EACH ROW EXECUTE FUNCTION public.update_tenant_domain_trigger();

CREATE TRIGGER delete_tenant_domain
INSTEAD OF DELETE ON public.tenant_domains
FOR EACH ROW EXECUTE FUNCTION public.delete_tenant_domain_trigger();

-- İşlemi tamamla
COMMIT; 