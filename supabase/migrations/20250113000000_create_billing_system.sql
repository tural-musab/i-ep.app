-- İ-EP.APP Billing System - Payment & Subscription Tables
-- Sprint 1: Payment Integration Foundation
-- Created: 2025-01-13

BEGIN;

-- ==========================================
-- SUBSCRIPTION PLANS TABLE (MANAGEMENT SCHEMA)
-- ==========================================

-- Subscription plans yapılandırması - tenant-agnostic
CREATE TABLE IF NOT EXISTS management.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'free', 'standard', 'premium'
    display_name TEXT NOT NULL, -- 'Ücretsiz Plan', 'Standart Plan', 'Premium Plan'
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Plan limits and features
    max_students INTEGER DEFAULT NULL, -- NULL = unlimited
    max_teachers INTEGER DEFAULT NULL, -- NULL = unlimited
    max_classes INTEGER DEFAULT NULL, -- NULL = unlimited
    features JSONB DEFAULT '{}'::jsonb, -- feature flags
    
    -- Plan metadata
    trial_days INTEGER DEFAULT 14,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- TENANT SUBSCRIPTIONS TABLE (MANAGEMENT SCHEMA)
-- ==========================================

-- Tenant subscription assignments
CREATE TABLE IF NOT EXISTS management.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES management.subscription_plans(id),
    
    -- Subscription status
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'trial', 'active', 'cancelled', 'past_due', 'suspended'
    
    -- Billing cycle
    billing_cycle VARCHAR(10) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
    
    -- Important dates
    trial_starts_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    
    -- Payment information
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('trial', 'active', 'cancelled', 'past_due', 'suspended')),
    CONSTRAINT valid_billing_cycle CHECK (billing_cycle IN ('monthly', 'yearly')),
    CONSTRAINT valid_trial_dates CHECK (trial_starts_at IS NULL OR trial_ends_at IS NULL OR trial_starts_at < trial_ends_at),
    CONSTRAINT valid_period_dates CHECK (current_period_start < current_period_end)
);

-- ==========================================
-- PAYMENTS TABLE (MANAGEMENT SCHEMA)
-- ==========================================

-- Payment transaction records
CREATE TABLE IF NOT EXISTS management.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES management.tenant_subscriptions(id) ON DELETE SET NULL,
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded', 'cancelled'
    
    -- Payment gateway information
    gateway VARCHAR(20) NOT NULL DEFAULT 'iyzico', -- 'iyzico', 'stripe', etc.
    gateway_transaction_id TEXT, -- İyzico payment ID
    gateway_reference TEXT, -- İyzico conversation ID
    gateway_response JSONB, -- Full gateway response for debugging
    
    -- Payment metadata
    description TEXT,
    payment_method VARCHAR(20), -- 'credit_card', 'debit_card', etc.
    
    -- Important dates
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ==========================================
-- INVOICES TABLE (MANAGEMENT SCHEMA)
-- ==========================================

-- Invoice generation and tracking
CREATE TABLE IF NOT EXISTS management.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES management.tenant_subscriptions(id) ON DELETE SET NULL,
    payment_id UUID REFERENCES management.payments(id) ON DELETE SET NULL,
    
    -- Invoice details
    invoice_number TEXT NOT NULL UNIQUE, -- Auto-generated: INV-2025-000001
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
    
    -- Financial details
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0.18, -- Turkish VAT: 18%
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Billing information
    billing_period_start TIMESTAMPTZ NOT NULL,
    billing_period_end TIMESTAMPTZ NOT NULL,
    
    -- Important dates
    invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Invoice metadata
    notes TEXT,
    pdf_url TEXT, -- Generated PDF storage URL
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    CONSTRAINT positive_amounts CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount >= 0),
    CONSTRAINT valid_billing_period CHECK (billing_period_start < billing_period_end),
    CONSTRAINT calculated_total CHECK (total_amount = subtotal + tax_amount)
);

-- ==========================================
-- FEATURE USAGE TRACKING (MANAGEMENT SCHEMA)
-- ==========================================

-- Track usage for billing and analytics
CREATE TABLE IF NOT EXISTS management.feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Usage metrics
    month_year VARCHAR(7) NOT NULL, -- '2025-01' format
    
    students_count INTEGER DEFAULT 0,
    teachers_count INTEGER DEFAULT 0,
    classes_count INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    
    -- API usage
    api_calls_count INTEGER DEFAULT 0,
    sms_sent_count INTEGER DEFAULT 0,
    emails_sent_count INTEGER DEFAULT 0,
    
    -- Timestamps
    recorded_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Unique constraint per tenant per month
    CONSTRAINT unique_tenant_month UNIQUE (tenant_id, month_year)
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Subscription plans indexes
CREATE INDEX idx_subscription_plans_active ON management.subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_sort ON management.subscription_plans(sort_order);

-- Tenant subscriptions indexes
CREATE INDEX idx_tenant_subscriptions_tenant ON management.tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_plan ON management.tenant_subscriptions(plan_id);
CREATE INDEX idx_tenant_subscriptions_status ON management.tenant_subscriptions(status);
CREATE INDEX idx_tenant_subscriptions_period ON management.tenant_subscriptions(current_period_end);

-- Payments indexes
CREATE INDEX idx_payments_tenant ON management.payments(tenant_id);
CREATE INDEX idx_payments_subscription ON management.payments(subscription_id);
CREATE INDEX idx_payments_status ON management.payments(status);
CREATE INDEX idx_payments_gateway_transaction ON management.payments(gateway_transaction_id);
CREATE INDEX idx_payments_created_at ON management.payments(created_at);

-- Invoices indexes
CREATE INDEX idx_invoices_tenant ON management.invoices(tenant_id);
CREATE INDEX idx_invoices_subscription ON management.invoices(subscription_id);
CREATE INDEX idx_invoices_status ON management.invoices(status);
CREATE INDEX idx_invoices_number ON management.invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON management.invoices(due_date);

-- Feature usage indexes
CREATE INDEX idx_feature_usage_tenant ON management.feature_usage(tenant_id);
CREATE INDEX idx_feature_usage_month ON management.feature_usage(month_year);

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE management.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE management.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE management.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE management.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE management.feature_usage ENABLE ROW LEVEL SECURITY;

-- Subscription plans - readable by all authenticated users, writable by super admins
CREATE POLICY subscription_plans_read ON management.subscription_plans
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY subscription_plans_super_admin ON management.subscription_plans
    FOR ALL TO authenticated
    USING (is_super_admin());

-- Service role bypass for all billing tables
CREATE POLICY service_role_bypass_subscriptions ON management.tenant_subscriptions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_bypass_payments ON management.payments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_bypass_invoices ON management.invoices
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_bypass_usage ON management.feature_usage
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_bypass_plans ON management.subscription_plans
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Tenant-specific access policies
CREATE POLICY tenant_subscriptions_access ON management.tenant_subscriptions
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_super_admin());

CREATE POLICY payments_access ON management.payments
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_super_admin());

CREATE POLICY invoices_access ON management.invoices
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_super_admin());

CREATE POLICY feature_usage_access ON management.feature_usage
    FOR ALL TO authenticated
    USING (tenant_id = get_current_tenant_id() OR is_super_admin());

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION management.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all billing tables
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON management.subscription_plans
    FOR EACH ROW EXECUTE FUNCTION management.update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at
    BEFORE UPDATE ON management.tenant_subscriptions
    FOR EACH ROW EXECUTE FUNCTION management.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON management.payments
    FOR EACH ROW EXECUTE FUNCTION management.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON management.invoices
    FOR EACH ROW EXECUTE FUNCTION management.update_updated_at_column();

-- ==========================================
-- INITIAL SUBSCRIPTION PLANS DATA
-- ==========================================

-- Insert default subscription plans
INSERT INTO management.subscription_plans (
    name, display_name, description, price_monthly, price_yearly,
    max_students, max_teachers, max_classes, features, trial_days, sort_order
) VALUES 
(
    'free',
    'Ücretsiz Plan',
    'Küçük okullar için temel özellikler',
    0.00,
    0.00,
    30,
    5,
    10,
    '{"messaging": false, "reports": "basic", "api_access": false, "custom_domain": false}'::jsonb,
    14,
    1
),
(
    'standard',
    'Standart Plan', 
    'Orta büyüklükteki okullar için gelişmiş özellikler',
    299.00,
    2990.00,
    300,
    50,
    100,
    '{"messaging": true, "reports": "advanced", "api_access": false, "custom_domain": false}'::jsonb,
    14,
    2
),
(
    'premium',
    'Premium Plan',
    'Büyük okullar için sınırsız özellikler',
    599.00,
    5990.00,
    NULL,
    NULL,
    NULL,
    '{"messaging": true, "reports": "premium", "api_access": true, "custom_domain": true}'::jsonb,
    14,
    3
) ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- UTILITY FUNCTIONS
-- ==========================================

-- Function to get current tenant's subscription
CREATE OR REPLACE FUNCTION management.get_tenant_subscription(tenant_uuid UUID)
RETURNS management.tenant_subscriptions AS $$
DECLARE
    subscription management.tenant_subscriptions;
BEGIN
    SELECT * INTO subscription
    FROM management.tenant_subscriptions
    WHERE tenant_id = tenant_uuid
    AND status IN ('trial', 'active')
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if tenant can use a feature
CREATE OR REPLACE FUNCTION management.can_use_feature(tenant_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    subscription management.tenant_subscriptions;
    plan management.subscription_plans;
    feature_enabled BOOLEAN := false;
BEGIN
    -- Get current subscription
    SELECT * INTO subscription
    FROM management.tenant_subscriptions
    WHERE tenant_id = tenant_uuid
    AND status IN ('trial', 'active')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Get plan details
    SELECT * INTO plan
    FROM management.subscription_plans
    WHERE id = subscription.plan_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check feature in plan features JSON
    SELECT (plan.features ->> feature_name)::boolean INTO feature_enabled;
    
    RETURN COALESCE(feature_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION management.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_number INTEGER;
BEGIN
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CASE 
            WHEN invoice_number ~ ('^INV-' || year_part || '-[0-9]+$')
            THEN SUBSTRING(invoice_number FROM LENGTH('INV-' || year_part || '-') + 1)::INTEGER
            ELSE 0
        END
    ), 0) + 1 INTO next_number
    FROM management.invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    sequence_part := LPAD(next_number::TEXT, 6, '0');
    
    RETURN 'INV-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;

-- ==========================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ==========================================

-- This migration creates:
-- 1. subscription_plans - Plan definitions with pricing and limits
-- 2. tenant_subscriptions - Active subscriptions per tenant
-- 3. payments - Payment transaction tracking with İyzico integration
-- 4. invoices - Invoice generation and management
-- 5. feature_usage - Usage tracking for billing and analytics
-- 6. RLS policies for secure multi-tenant access
-- 7. Utility functions for subscription and feature checking
-- 8. Default subscription plans (Free, Standard, Premium)