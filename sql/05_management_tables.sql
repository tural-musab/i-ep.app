-- Tenants (Kiracılar) tablosu
CREATE TABLE management.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  schema_name TEXT NOT NULL UNIQUE,
  database_name TEXT NOT NULL DEFAULT 'default',
  status management.tenant_status NOT NULL DEFAULT 'trial',
  subscription_plan management.subscription_plan NOT NULL DEFAULT 'free',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  max_users INTEGER DEFAULT 50,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Domains tablosu (tenant'lara bağlı)
CREATE TABLE management.domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES management.tenants(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  status management.domain_status DEFAULT 'unverified',
  ssl_cert_expiry TIMESTAMP WITH TIME ZONE,
  dns_validation_record TEXT,
  dns_validation_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  cloudflare_zone_id TEXT,
  UNIQUE (tenant_id, domain)
);

-- Domain doğrulama tablosu
CREATE TABLE management.domain_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id UUID NOT NULL REFERENCES management.domains(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL, -- 'dns', 'email', vs.
  token TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Abonelikler tablosu
CREATE TABLE management.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES management.tenants(id) ON DELETE CASCADE,
  plan management.subscription_plan NOT NULL DEFAULT 'free',
  status TEXT NOT NULL, -- 'active', 'cancelled', 'past_due', 'trialing', etc.
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_provider TEXT, -- 'stripe', 'iyzico', etc.
  payment_provider_id TEXT, -- ID from payment provider
  payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE
);

-- Faturalar tablosu
CREATE TABLE management.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES management.tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES management.subscriptions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  status TEXT NOT NULL, -- 'draft', 'open', 'paid', 'uncollectible', 'void'
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  invoice_number TEXT,
  invoice_url TEXT,
  payment_provider TEXT,
  payment_provider_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Webhooks tablosu
CREATE TABLE management.webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES management.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  status management.webhook_status DEFAULT 'active',
  events management.webhook_event[] NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0
);

-- Webhook çağrı geçmişi
CREATE TABLE management.webhook_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES management.webhooks(id) ON DELETE CASCADE,
  event management.webhook_event NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  success BOOLEAN,
  error TEXT,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  next_retry_at TIMESTAMP WITH TIME ZONE
);

-- Tenant özellikleri (tenant seviyesinde ayarlar)
CREATE TABLE management.tenant_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES management.tenants(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, feature_key)
);

-- Sistem sağlık durumu
CREATE TABLE super_admin.system_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_name TEXT NOT NULL,
  status TEXT NOT NULL, -- 'healthy', 'warning', 'error'
  details JSONB DEFAULT '{}'::JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Yedeklemeler tablosu
CREATE TABLE super_admin.backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  status super_admin.backup_status NOT NULL DEFAULT 'pending',
  storage_path TEXT,
  size_bytes BIGINT,
  tenant_id UUID REFERENCES management.tenants(id) ON DELETE SET NULL,
  is_full_backup BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID, -- Reference to user who initiated the backup
  notes TEXT,
  error_message TEXT
); 