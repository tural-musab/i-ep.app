-- Çerez onayı ve GDPR uyumluluk tabloları
-- Bu migration GDPR ve KVKK uyumlu çerez onayı sistemi için gerekli tabloları oluşturur

-- Çerez onayı tablosu
CREATE TABLE IF NOT EXISTS public.cookie_consents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Çerez kategori tercihleri
    necessary boolean DEFAULT true NOT NULL,
    analytics boolean DEFAULT false NOT NULL,
    marketing boolean DEFAULT false NOT NULL,
    preferences boolean DEFAULT false NOT NULL,
    
    -- Onay meta bilgileri
    consent_version varchar(10) DEFAULT '1.0' NOT NULL,
    consent_timestamp timestamptz DEFAULT now() NOT NULL,
    ip_address inet,
    user_agent text,
    
    -- GDPR fields
    withdraw_timestamp timestamptz,
    withdraw_reason text,
    
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    -- Unique constraint: Bir kullanıcının tenant başına sadece bir aktif consent'i olabilir
    UNIQUE(user_id, tenant_id, consent_version)
);

-- Çerez detayları tablosu (hangi çerezlerin hangi kategoride olduğunu tutar)
CREATE TABLE IF NOT EXISTS public.cookie_definitions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Çerez bilgileri
    name varchar(255) NOT NULL,
    category varchar(50) NOT NULL CHECK (category IN ('necessary', 'analytics', 'marketing', 'preferences')),
    purpose text NOT NULL,
    duration varchar(100) NOT NULL,
    provider varchar(255) NOT NULL,
    
    -- Yasal ve compliance bilgiler
    gdpr_lawful_basis varchar(100),
    data_processor varchar(255),
    cross_border_transfer boolean DEFAULT false,
    
    -- Metadata
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    
    UNIQUE(name, category)
);

-- GDPR data deletion requests tablosu
CREATE TABLE IF NOT EXISTS public.gdpr_deletion_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Talep detayları
    deletion_type varchar(20) NOT NULL CHECK (deletion_type IN ('hard', 'soft', 'anonymize')),
    reason text,
    export_data_before_deletion boolean DEFAULT true,
    
    -- İşlem durumu
    status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    requested_at timestamptz DEFAULT now() NOT NULL,
    processed_at timestamptz,
    completed_at timestamptz,
    
    -- İşleyen kişi bilgileri
    processed_by uuid REFERENCES auth.users(id),
    admin_notes text,
    
    -- Yasal gereklilikler
    retention_end_date timestamptz, -- Soft delete için
    export_file_path text, -- Dışa aktarılan dosya yolu
    
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS Policies

-- Cookie consents için RLS
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cookie consents" ON public.cookie_consents
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_tenant_roles utr 
            WHERE utr.user_id = auth.uid() 
            AND utr.tenant_id = cookie_consents.tenant_id 
            AND utr.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert own cookie consents" ON public.cookie_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cookie consents" ON public.cookie_consents
    FOR UPDATE USING (auth.uid() = user_id);

-- Cookie definitions için RLS (public read, admin write)
ALTER TABLE public.cookie_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cookie definitions" ON public.cookie_definitions
    FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify cookie definitions" ON public.cookie_definitions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role = 'super_admin'
        )
    );

-- GDPR deletion requests için RLS
ALTER TABLE public.gdpr_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deletion requests" ON public.gdpr_deletion_requests
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.user_tenant_roles utr 
            WHERE utr.user_id = auth.uid() 
            AND utr.tenant_id = gdpr_deletion_requests.tenant_id 
            AND utr.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can create own deletion requests" ON public.gdpr_deletion_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update deletion requests" ON public.gdpr_deletion_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_tenant_roles utr 
            WHERE utr.user_id = auth.uid() 
            AND utr.tenant_id = gdpr_deletion_requests.tenant_id 
            AND utr.role IN ('admin', 'manager')
        )
    );

-- Indexes for performance
CREATE INDEX idx_cookie_consents_user_tenant ON public.cookie_consents(user_id, tenant_id);
CREATE INDEX idx_cookie_consents_timestamp ON public.cookie_consents(consent_timestamp);
CREATE INDEX idx_cookie_definitions_category ON public.cookie_definitions(category);
CREATE INDEX idx_gdpr_requests_status ON public.gdpr_deletion_requests(status);
CREATE INDEX idx_gdpr_requests_user ON public.gdpr_deletion_requests(user_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cookie_consents_updated_at BEFORE UPDATE ON public.cookie_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cookie_definitions_updated_at BEFORE UPDATE ON public.cookie_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_deletion_requests_updated_at BEFORE UPDATE ON public.gdpr_deletion_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Varsayılan çerez tanımlarını ekle
INSERT INTO public.cookie_definitions (name, category, purpose, duration, provider, gdpr_lawful_basis) VALUES
    -- Gerekli çerezler
    ('sidebar_state', 'necessary', 'Kenar çubuğu durumunu hatırlar', '7 gün', 'İ-EP.APP', 'Legitimate interest'),
    ('auth-token', 'necessary', 'Oturum kimlik doğrulaması', 'Oturum', 'İ-EP.APP', 'Contractual necessity'),
    ('tenant-id', 'necessary', 'Kiracı kimliği', '30 gün', 'İ-EP.APP', 'Contractual necessity'),
    ('cookie-consent', 'necessary', 'Çerez onayı durumu', '1 yıl', 'İ-EP.APP', 'Legal obligation'),
    
    -- Analitik çerezler
    ('va-*', 'analytics', 'Vercel Analytics - Anonim kullanım istatistikleri', '2 yıl', 'Vercel', 'Consent'),
    ('si-*', 'analytics', 'Speed Insights - Performans ölçümü', '2 yıl', 'Vercel', 'Consent'),
    
    -- Pazarlama çerezleri
    ('marketing-consent', 'marketing', 'Pazarlama onayı durumu', '1 yıl', 'İ-EP.APP', 'Consent'),
    
    -- Tercih çerezleri
    ('theme', 'preferences', 'Tema tercihi (açık/koyu)', '1 yıl', 'İ-EP.APP', 'Consent'),
    ('language', 'preferences', 'Dil tercihi', '1 yıl', 'İ-EP.APP', 'Consent')
ON CONFLICT (name, category) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.cookie_consents IS 'GDPR uyumlu kullanıcı çerez onayları';
COMMENT ON TABLE public.cookie_definitions IS 'Sistem çerezlerinin tanımları ve kategorizasyonu';
COMMENT ON TABLE public.gdpr_deletion_requests IS 'GDPR veri silme talepleri'; 