-- Tenant Durumu
CREATE TYPE management.tenant_status AS ENUM (
  'active',      -- Aktif tenant
  'suspended',   -- Geçici olarak askıya alınmış
  'deactivated', -- Devre dışı bırakılmış
  'trial',       -- Deneme süresi
  'expired'      -- Süresi dolmuş
);

-- Abonelik Planları
CREATE TYPE management.subscription_plan AS ENUM (
  'free',     -- Ücretsiz plan
  'standard', -- Standart plan
  'premium'   -- Premium plan
);

-- Kullanıcı Rolleri
CREATE TYPE public.user_role AS ENUM (
  'super_admin',  -- Sistem yöneticisi
  'admin',        -- Okul/tenant yöneticisi
  'teacher',      -- Öğretmen
  'student',      -- Öğrenci
  'parent'        -- Veli
);

-- Doğrulama Durumu
CREATE TYPE public.verification_status AS ENUM (
  'unverified',    -- Doğrulanmamış
  'pending',       -- Beklemede
  'verified',      -- Doğrulanmış
  'rejected'       -- Reddedilmiş
);

-- Domain Doğrulama Durumu
CREATE TYPE management.domain_status AS ENUM (
  'unverified',     -- Doğrulanmamış
  'dns_pending',    -- DNS kaydı bekleniyor
  'ssl_pending',    -- SSL sertifikası bekleniyor
  'active',         -- Aktif ve çalışıyor
  'error'           -- Hatalı
);

-- Webhook Olay Türleri
CREATE TYPE management.webhook_event AS ENUM (
  'tenant.created',
  'tenant.updated',
  'tenant.deleted',
  'user.created',
  'user.updated',
  'user.deleted',
  'subscription.created',
  'subscription.updated',
  'subscription.canceled'
);

-- Yedekleme Durumu
CREATE TYPE super_admin.backup_status AS ENUM (
  'pending', 
  'in_progress',
  'completed', 
  'failed'
);

-- Webhook Durumu
CREATE TYPE management.webhook_status AS ENUM (
  'active',
  'inactive',
  'failed'
); 