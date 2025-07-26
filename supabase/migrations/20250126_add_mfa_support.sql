-- Multi-Factor Authentication (MFA) Tables
-- Migration: Add MFA support to i-ep.app

-- Create MFA factors table
CREATE TABLE IF NOT EXISTS user_mfa_factors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('totp', 'backup_codes', 'sms', 'email')),
    secret TEXT, -- Encrypted in production
    backup_codes JSONB, -- Array of hashed backup codes
    phone_number VARCHAR(20), -- For SMS MFA
    email VARCHAR(255), -- For email MFA
    is_enabled BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure one factor per type per user
    UNIQUE(user_id, type)
);

-- Create MFA verification logs table
CREATE TABLE IF NOT EXISTS user_mfa_verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    factor_id UUID REFERENCES user_mfa_factors(id) ON DELETE SET NULL,
    factor_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'expired')),
    ip_address INET,
    user_agent TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create user sessions table with MFA tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    mfa_verified BOOLEAN DEFAULT false,
    mfa_verified_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add MFA preferences to user profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS mfa_enforcement_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS require_mfa_for_sensitive_ops BOOLEAN DEFAULT true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_mfa_factors_user_id ON user_mfa_factors(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mfa_factors_type ON user_mfa_factors(type);
CREATE INDEX IF NOT EXISTS idx_user_mfa_factors_enabled ON user_mfa_factors(is_enabled, is_verified);
CREATE INDEX IF NOT EXISTS idx_mfa_verification_logs_user_id ON user_mfa_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_verification_logs_created_at ON user_mfa_verification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- RLS Policies
ALTER TABLE user_mfa_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mfa_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own MFA factors
CREATE POLICY "Users can view own MFA factors" ON user_mfa_factors
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own MFA factors
CREATE POLICY "Users can create own MFA factors" ON user_mfa_factors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own MFA factors
CREATE POLICY "Users can update own MFA factors" ON user_mfa_factors
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own MFA factors
CREATE POLICY "Users can delete own MFA factors" ON user_mfa_factors
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own verification logs
CREATE POLICY "Users can view own MFA logs" ON user_mfa_verification_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert verification logs (via service role)
-- No INSERT policy for regular users

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log MFA verification attempts
CREATE OR REPLACE FUNCTION log_mfa_verification(
    p_user_id UUID,
    p_factor_id UUID,
    p_factor_type VARCHAR,
    p_status VARCHAR,
    p_ip_address INET,
    p_user_agent TEXT,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO user_mfa_verification_logs (
        user_id,
        factor_id,
        factor_type,
        status,
        ip_address,
        user_agent,
        error_message
    ) VALUES (
        p_user_id,
        p_factor_id,
        p_factor_type,
        p_status,
        p_ip_address,
        p_user_agent,
        p_error_message
    ) RETURNING id INTO v_log_id;
    
    -- Update last_used_at if successful
    IF p_status = 'success' AND p_factor_id IS NOT NULL THEN
        UPDATE user_mfa_factors
        SET last_used_at = timezone('utc'::text, now())
        WHERE id = p_factor_id;
    END IF;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mfa_factors_updated_at
    BEFORE UPDATE ON user_mfa_factors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON user_mfa_factors TO authenticated;
GRANT ALL ON user_mfa_verification_logs TO authenticated;
GRANT ALL ON user_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO authenticated;
GRANT EXECUTE ON FUNCTION log_mfa_verification(UUID, UUID, VARCHAR, VARCHAR, INET, TEXT, TEXT) TO authenticated;
