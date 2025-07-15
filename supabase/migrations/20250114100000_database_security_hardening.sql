-- Database Security Hardening Migration
-- This migration implements comprehensive database security measures

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit logs table for security monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    status TEXT CHECK (status IN ('success', 'failure', 'warning')) DEFAULT 'success',
    
    -- Indexes for better performance
    CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);

-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    user_id UUID,
    event_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    ip_address INET,
    user_agent TEXT,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT security_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT security_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT security_events_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(key, window_start)
);

-- Create index for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start, window_end);

-- Create failed login attempts table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locked_until TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(email, ip_address)
);

-- Create indexes for failed login attempts
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_locked_until ON failed_login_attempts(locked_until);

-- Create API keys table with proper encryption
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL, -- Hashed version of the key
    key_prefix TEXT NOT NULL, -- First 8 characters for identification
    scopes TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT api_keys_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- Create encrypted storage for sensitive data
CREATE TABLE IF NOT EXISTS encrypted_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    data_type TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    iv TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT encrypted_data_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create indexes for encrypted data
CREATE INDEX IF NOT EXISTS idx_encrypted_data_tenant_id ON encrypted_data(tenant_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_data_data_type ON encrypted_data(data_type);

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_tenant_id UUID,
    p_user_id UUID,
    p_event_type TEXT,
    p_severity TEXT,
    p_ip_address INET,
    p_user_agent TEXT,
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO security_events (
        tenant_id, user_id, event_type, severity, ip_address, 
        user_agent, description, metadata
    ) VALUES (
        p_tenant_id, p_user_id, p_event_type, p_severity, p_ip_address,
        p_user_agent, p_description, p_metadata
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_tenant_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID,
    p_ip_address INET,
    p_user_agent TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_severity TEXT DEFAULT 'low',
    p_status TEXT DEFAULT 'success'
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        tenant_id, user_id, action, resource_type, resource_id,
        ip_address, user_agent, metadata, severity, status
    ) VALUES (
        p_tenant_id, p_user_id, p_action, p_resource_type, p_resource_id,
        p_ip_address, p_user_agent, p_metadata, p_severity, p_status
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(
    p_email TEXT,
    p_ip_address INET,
    p_user_agent TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    max_attempts INTEGER := 5;
    lockout_duration INTERVAL := '15 minutes';
    current_attempts INTEGER;
    is_locked BOOLEAN := FALSE;
BEGIN
    -- Check if account is currently locked
    SELECT COUNT(*) > 0 INTO is_locked
    FROM failed_login_attempts 
    WHERE email = p_email 
    AND ip_address = p_ip_address 
    AND locked_until > NOW();
    
    IF is_locked THEN
        RETURN FALSE;
    END IF;
    
    -- Update or insert failed attempt record
    INSERT INTO failed_login_attempts (email, ip_address, user_agent, attempt_count, first_attempt, last_attempt)
    VALUES (p_email, p_ip_address, p_user_agent, 1, NOW(), NOW())
    ON CONFLICT (email, ip_address) 
    DO UPDATE SET
        attempt_count = failed_login_attempts.attempt_count + 1,
        last_attempt = NOW(),
        user_agent = COALESCE(p_user_agent, failed_login_attempts.user_agent);
    
    -- Get current attempt count
    SELECT attempt_count INTO current_attempts
    FROM failed_login_attempts
    WHERE email = p_email AND ip_address = p_ip_address;
    
    -- Lock account if max attempts exceeded
    IF current_attempts >= max_attempts THEN
        UPDATE failed_login_attempts 
        SET locked_until = NOW() + lockout_duration
        WHERE email = p_email AND ip_address = p_ip_address;
        
        -- Log security event
        INSERT INTO security_events (event_type, severity, ip_address, user_agent, description, metadata)
        VALUES (
            'account_lockout', 'high', p_ip_address, p_user_agent,
            'Account locked due to too many failed login attempts',
            jsonb_build_object('email', p_email, 'attempts', current_attempts)
        );
        
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(
    p_email TEXT,
    p_ip_address INET
) RETURNS VOID AS $$
BEGIN
    DELETE FROM failed_login_attempts
    WHERE email = p_email AND ip_address = p_ip_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
    p_retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs
    WHERE timestamp < NOW() - INTERVAL '1 day' * p_retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old security events
CREATE OR REPLACE FUNCTION cleanup_old_security_events(
    p_retention_days INTEGER DEFAULT 365
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_events
    WHERE created_at < NOW() - INTERVAL '1 day' * p_retention_days
    AND resolved = TRUE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits
    WHERE window_end < NOW() - INTERVAL '1 hour';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for security tables

-- Audit logs RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs for their tenant" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = audit_logs.tenant_id
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Service role can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Security events RLS
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security events for their tenant" ON security_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = security_events.tenant_id
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Service role can manage security events" ON security_events
    FOR ALL USING (auth.role() = 'service_role');

-- Rate limits RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage rate limits" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Failed login attempts RLS
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage failed login attempts" ON failed_login_attempts
    FOR ALL USING (auth.role() = 'service_role');

-- API keys RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Encrypted data RLS
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access encrypted data for their tenant" ON encrypted_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tenant_id = encrypted_data.tenant_id
        )
    );

CREATE POLICY "Service role can manage encrypted data" ON encrypted_data
    FOR ALL USING (auth.role() = 'service_role');

-- Create triggers for automatic cleanup
CREATE OR REPLACE FUNCTION trigger_cleanup_old_data() RETURNS TRIGGER AS $$
BEGIN
    -- Run cleanup once per day
    IF (SELECT COUNT(*) FROM audit_logs WHERE timestamp::date = CURRENT_DATE) = 1 THEN
        PERFORM cleanup_old_audit_logs();
        PERFORM cleanup_old_security_events();
        PERFORM cleanup_old_rate_limits();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup
CREATE TRIGGER trigger_daily_cleanup
    AFTER INSERT ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_cleanup_old_data();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
GRANT SELECT ON security_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT ON encrypted_data TO authenticated;

-- Grant service role permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_composite ON audit_logs(tenant_id, user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_composite ON security_events(tenant_id, severity, resolved, created_at);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_composite ON failed_login_attempts(email, ip_address, locked_until);

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for all user actions';
COMMENT ON TABLE security_events IS 'Security events and incidents tracking';
COMMENT ON TABLE rate_limits IS 'Rate limiting data for API protection';
COMMENT ON TABLE failed_login_attempts IS 'Failed login attempts tracking for account security';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access';
COMMENT ON TABLE encrypted_data IS 'Encrypted storage for sensitive data';

COMMENT ON FUNCTION log_security_event(UUID, UUID, TEXT, TEXT, INET, TEXT, TEXT, JSONB) IS 'Function to log security events';
COMMENT ON FUNCTION log_audit_event(UUID, UUID, TEXT, TEXT, UUID, INET, TEXT, JSONB, TEXT, TEXT) IS 'Function to log audit events';
COMMENT ON FUNCTION handle_failed_login(TEXT, INET, TEXT) IS 'Function to handle failed login attempts and account locking';
COMMENT ON FUNCTION reset_failed_login_attempts(TEXT, INET) IS 'Function to reset failed login attempts on successful login';
COMMENT ON FUNCTION cleanup_old_audit_logs(INTEGER) IS 'Function to clean up old audit logs';
COMMENT ON FUNCTION cleanup_old_security_events(INTEGER) IS 'Function to clean up old security events';
COMMENT ON FUNCTION cleanup_old_rate_limits() IS 'Function to clean up old rate limit records';