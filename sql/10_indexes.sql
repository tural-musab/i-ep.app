-- Tenant tablosu indeksleri
CREATE INDEX idx_tenants_status ON management.tenants(status);
CREATE INDEX idx_tenants_subscription_plan ON management.tenants(subscription_plan);
CREATE INDEX idx_tenants_created_at ON management.tenants(created_at);
CREATE INDEX idx_tenants_name ON management.tenants(name);
CREATE INDEX idx_tenants_deleted_at ON management.tenants(deleted_at) WHERE deleted_at IS NOT NULL;

-- Domain tablosu indeksleri
CREATE INDEX idx_domains_tenant_id ON management.domains(tenant_id);
CREATE INDEX idx_domains_status ON management.domains(status);
CREATE INDEX idx_domains_domain ON management.domains(domain);
CREATE INDEX idx_domains_is_primary ON management.domains(is_primary) WHERE is_primary = TRUE;

-- Users tablosu indeksleri
CREATE INDEX idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_created_at ON public.users(created_at);
CREATE INDEX idx_users_is_active ON public.users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_verification_status ON public.users(verification_status);
CREATE INDEX idx_users_deleted_at ON public.users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_name ON public.users(first_name, last_name);

-- Audit logs tablosu indeksleri
CREATE INDEX idx_audit_logs_tenant_id ON audit.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(created_at);

-- API Tokens tablosu indeksleri
CREATE INDEX idx_api_tokens_tenant_id ON public.api_tokens(tenant_id);
CREATE INDEX idx_api_tokens_expires_at ON public.api_tokens(expires_at);

-- Subscriptions tablosu indeksleri
CREATE INDEX idx_subscriptions_tenant_id ON management.subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON management.subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON management.subscriptions(plan);
CREATE INDEX idx_subscriptions_current_period_end ON management.subscriptions(current_period_end);

-- Invoices tablosu indeksleri
CREATE INDEX idx_invoices_tenant_id ON management.invoices(tenant_id);
CREATE INDEX idx_invoices_subscription_id ON management.invoices(subscription_id);
CREATE INDEX idx_invoices_status ON management.invoices(status);
CREATE INDEX idx_invoices_due_date ON management.invoices(due_date);

-- Webhooks tablosu indeksleri
CREATE INDEX idx_webhooks_tenant_id ON management.webhooks(tenant_id);
CREATE INDEX idx_webhooks_status ON management.webhooks(status);

-- Webhook calls tablosu indeksleri
CREATE INDEX idx_webhook_calls_webhook_id ON management.webhook_calls(webhook_id);
CREATE INDEX idx_webhook_calls_success ON management.webhook_calls(success);
CREATE INDEX idx_webhook_calls_created_at ON management.webhook_calls(created_at);
CREATE INDEX idx_webhook_calls_next_retry_at ON management.webhook_calls(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Domain verifications tablosu indeksleri
CREATE INDEX idx_domain_verifications_domain_id ON management.domain_verifications(domain_id);
CREATE INDEX idx_domain_verifications_expires_at ON management.domain_verifications(expires_at);
CREATE INDEX idx_domain_verifications_verified ON management.domain_verifications(verified) WHERE verified = TRUE;

-- Sessions tablosu indeksleri
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_tenant_id ON public.sessions(tenant_id);
CREATE INDEX idx_sessions_expires_at ON public.sessions(expires_at);
CREATE INDEX idx_sessions_last_active_at ON public.sessions(last_active_at);

-- Tenant features tablosu indeksleri
CREATE INDEX idx_tenant_features_tenant_id ON management.tenant_features(tenant_id);
CREATE INDEX idx_tenant_features_feature_key ON management.tenant_features(feature_key);
CREATE INDEX idx_tenant_features_is_enabled ON management.tenant_features(is_enabled) WHERE is_enabled = TRUE;

-- System health tablosu indeksleri
CREATE INDEX idx_system_health_status ON super_admin.system_health(status);
CREATE INDEX idx_system_health_check_name ON super_admin.system_health(check_name);
CREATE INDEX idx_system_health_checked_at ON super_admin.system_health(checked_at);

-- Backups tablosu indeksleri
CREATE INDEX idx_backups_status ON super_admin.backups(status);
CREATE INDEX idx_backups_tenant_id ON super_admin.backups(tenant_id);
CREATE INDEX idx_backups_started_at ON super_admin.backups(started_at);
CREATE INDEX idx_backups_completed_at ON super_admin.backups(completed_at) WHERE completed_at IS NOT NULL;

-- User profiles tablosu indeksleri
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

-- IP logs tablosu indeksleri
CREATE INDEX idx_ip_logs_user_id ON public.ip_logs(user_id);
CREATE INDEX idx_ip_logs_tenant_id ON public.ip_logs(tenant_id);
CREATE INDEX idx_ip_logs_ip_address ON public.ip_logs(ip_address);
CREATE INDEX idx_ip_logs_event_type ON public.ip_logs(event_type);
CREATE INDEX idx_ip_logs_created_at ON public.ip_logs(created_at);

-- User verifications tablosu indeksleri
CREATE INDEX idx_user_verifications_user_id ON public.user_verifications(user_id);
CREATE INDEX idx_user_verifications_tenant_id ON public.user_verifications(tenant_id);
CREATE INDEX idx_user_verifications_type ON public.user_verifications(type);
CREATE INDEX idx_user_verifications_verified ON public.user_verifications(verified) WHERE verified = TRUE;
CREATE INDEX idx_user_verifications_expires_at ON public.user_verifications(expires_at); 