-- Demo Analytics System Migration
-- Creates tables and functions for demo.i-ep.app analytics tracking
-- Privacy-compliant design following GDPR/KVKK requirements

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Demo Sessions Table
-- Stores demo session information with privacy compliance
CREATE TABLE demo_sessions (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in milliseconds
    locale TEXT NOT NULL DEFAULT 'tr-TR',
    country TEXT, -- country code only for privacy
    referrer TEXT, -- sanitized referrer domain only
    user_agent TEXT, -- sanitized user agent
    screen_resolution TEXT, -- categorized (mobile, tablet, desktop, large)
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    conversion_action TEXT,
    ip_hash TEXT, -- privacy-compliant IP hash
    user_agent_hash TEXT, -- privacy-compliant UA hash
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Demo Events Table
-- Stores individual demo events and interactions
CREATE TABLE demo_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL REFERENCES demo_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'feature_interaction', 'conversion_attempt', 'error', 'completion')),
    event_name TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    page TEXT NOT NULL,
    feature TEXT,
    duration INTEGER, -- in milliseconds
    metadata JSONB NOT NULL DEFAULT '{}',
    ip_hash TEXT, -- privacy-compliant IP hash
    user_agent_hash TEXT, -- privacy-compliant UA hash
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Demo Daily Metrics Table
-- Aggregated daily metrics for faster dashboard queries
CREATE TABLE demo_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    sessions_count INTEGER NOT NULL DEFAULT 0,
    total_duration BIGINT NOT NULL DEFAULT 0, -- total duration in milliseconds
    completions_count INTEGER NOT NULL DEFAULT 0,
    conversions_count INTEGER NOT NULL DEFAULT 0,
    unique_features_used INTEGER NOT NULL DEFAULT 0,
    average_session_duration INTEGER NOT NULL DEFAULT 0,
    completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(date, role)
);

-- Demo Feature Usage Table
-- Tracks feature usage statistics
CREATE TABLE demo_feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    feature_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
    usage_count INTEGER NOT NULL DEFAULT 0,
    unique_sessions INTEGER NOT NULL DEFAULT 0,
    total_duration BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(date, feature_name, role)
);

-- Demo Geographic Stats Table
-- Aggregated geographic statistics (country level only)
CREATE TABLE demo_geographic_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    country TEXT NOT NULL,
    continent TEXT,
    sessions_count INTEGER NOT NULL DEFAULT 0,
    conversions_count INTEGER NOT NULL DEFAULT 0,
    average_session_duration INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(date, country)
);

-- Indexes for performance
CREATE INDEX idx_demo_sessions_start_time ON demo_sessions(start_time);
CREATE INDEX idx_demo_sessions_role ON demo_sessions(role);
CREATE INDEX idx_demo_sessions_country ON demo_sessions(country);
CREATE INDEX idx_demo_sessions_completed ON demo_sessions(completed);
CREATE INDEX idx_demo_sessions_conversion ON demo_sessions(conversion_action) WHERE conversion_action IS NOT NULL;

CREATE INDEX idx_demo_events_session_id ON demo_events(session_id);
CREATE INDEX idx_demo_events_timestamp ON demo_events(timestamp);
CREATE INDEX idx_demo_events_event_type ON demo_events(event_type);
CREATE INDEX idx_demo_events_role ON demo_events(role);
CREATE INDEX idx_demo_events_feature ON demo_events(feature) WHERE feature IS NOT NULL;
CREATE INDEX idx_demo_events_page ON demo_events(page);

CREATE INDEX idx_demo_daily_metrics_date ON demo_daily_metrics(date);
CREATE INDEX idx_demo_daily_metrics_role ON demo_daily_metrics(role);
CREATE INDEX idx_demo_daily_metrics_date_role ON demo_daily_metrics(date, role);

CREATE INDEX idx_demo_feature_usage_date ON demo_feature_usage(date);
CREATE INDEX idx_demo_feature_usage_feature ON demo_feature_usage(feature_name);
CREATE INDEX idx_demo_feature_usage_role ON demo_feature_usage(role);

CREATE INDEX idx_demo_geographic_stats_date ON demo_geographic_stats(date);
CREATE INDEX idx_demo_geographic_stats_country ON demo_geographic_stats(country);

-- Function to update daily metrics
CREATE OR REPLACE FUNCTION increment_demo_metrics(
    p_date DATE,
    p_role TEXT,
    p_duration INTEGER,
    p_completed BOOLEAN,
    p_converted BOOLEAN
) RETURNS VOID AS $$
BEGIN
    INSERT INTO demo_daily_metrics (
        date,
        role,
        sessions_count,
        total_duration,
        completions_count,
        conversions_count
    )
    VALUES (
        p_date,
        p_role,
        1,
        COALESCE(p_duration, 0),
        CASE WHEN p_completed THEN 1 ELSE 0 END,
        CASE WHEN p_converted THEN 1 ELSE 0 END
    )
    ON CONFLICT (date, role) DO UPDATE SET
        sessions_count = demo_daily_metrics.sessions_count + 1,
        total_duration = demo_daily_metrics.total_duration + COALESCE(p_duration, 0),
        completions_count = demo_daily_metrics.completions_count + (CASE WHEN p_completed THEN 1 ELSE 0 END),
        conversions_count = demo_daily_metrics.conversions_count + (CASE WHEN p_converted THEN 1 ELSE 0 END),
        average_session_duration = CASE 
            WHEN demo_daily_metrics.sessions_count + 1 > 0 
            THEN (demo_daily_metrics.total_duration + COALESCE(p_duration, 0)) / (demo_daily_metrics.sessions_count + 1)
            ELSE 0
        END,
        completion_rate = CASE 
            WHEN demo_daily_metrics.sessions_count + 1 > 0 
            THEN (demo_daily_metrics.completions_count + (CASE WHEN p_completed THEN 1 ELSE 0 END))::DECIMAL / (demo_daily_metrics.sessions_count + 1) * 100
            ELSE 0
        END,
        conversion_rate = CASE 
            WHEN demo_daily_metrics.sessions_count + 1 > 0 
            THEN (demo_daily_metrics.conversions_count + (CASE WHEN p_converted THEN 1 ELSE 0 END))::DECIMAL / (demo_daily_metrics.sessions_count + 1) * 100
            ELSE 0
        END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update feature usage stats
CREATE OR REPLACE FUNCTION update_feature_usage(
    p_date DATE,
    p_feature TEXT,
    p_role TEXT,
    p_session_id TEXT,
    p_duration INTEGER DEFAULT 0
) RETURNS VOID AS $$
BEGIN
    INSERT INTO demo_feature_usage (
        date,
        feature_name,
        role,
        usage_count,
        unique_sessions,
        total_duration
    )
    VALUES (
        p_date,
        p_feature,
        p_role,
        1,
        1,
        p_duration
    )
    ON CONFLICT (date, feature_name, role) DO UPDATE SET
        usage_count = demo_feature_usage.usage_count + 1,
        unique_sessions = (
            SELECT COUNT(DISTINCT session_id)
            FROM demo_events
            WHERE DATE(timestamp) = p_date
            AND feature = p_feature
            AND role = p_role
        ),
        total_duration = demo_feature_usage.total_duration + p_duration,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update geographic stats
CREATE OR REPLACE FUNCTION update_geographic_stats(
    p_date DATE,
    p_country TEXT,
    p_continent TEXT,
    p_duration INTEGER,
    p_converted BOOLEAN
) RETURNS VOID AS $$
BEGIN
    INSERT INTO demo_geographic_stats (
        date,
        country,
        continent,
        sessions_count,
        conversions_count,
        average_session_duration
    )
    VALUES (
        p_date,
        p_country,
        p_continent,
        1,
        CASE WHEN p_converted THEN 1 ELSE 0 END,
        COALESCE(p_duration, 0)
    )
    ON CONFLICT (date, country) DO UPDATE SET
        sessions_count = demo_geographic_stats.sessions_count + 1,
        conversions_count = demo_geographic_stats.conversions_count + (CASE WHEN p_converted THEN 1 ELSE 0 END),
        average_session_duration = CASE 
            WHEN demo_geographic_stats.sessions_count + 1 > 0 
            THEN (demo_geographic_stats.average_session_duration * demo_geographic_stats.sessions_count + COALESCE(p_duration, 0)) / (demo_geographic_stats.sessions_count + 1)
            ELSE COALESCE(p_duration, 0)
        END,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old demo data (GDPR compliance - data retention)
CREATE OR REPLACE FUNCTION cleanup_old_demo_data(retention_days INTEGER DEFAULT 90) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old events first (due to foreign key)
    DELETE FROM demo_events WHERE timestamp < cutoff_date;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old sessions
    DELETE FROM demo_sessions WHERE start_time < cutoff_date;
    
    -- Keep aggregated data longer (retain daily metrics for reporting)
    -- Only clean up very old aggregated data (1 year)
    DELETE FROM demo_daily_metrics WHERE date < (CURRENT_DATE - INTERVAL '1 year');
    DELETE FROM demo_feature_usage WHERE date < (CURRENT_DATE - INTERVAL '1 year');
    DELETE FROM demo_geographic_stats WHERE date < (CURRENT_DATE - INTERVAL '1 year');
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_demo_sessions_updated_at
    BEFORE UPDATE ON demo_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_daily_metrics_updated_at
    BEFORE UPDATE ON demo_daily_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_feature_usage_updated_at
    BEFORE UPDATE ON demo_feature_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_geographic_stats_updated_at
    BEFORE UPDATE ON demo_geographic_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_geographic_stats ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for demo tracking (from demo environment only)
-- Note: In production, add additional checks for demo domain
CREATE POLICY "Allow anonymous demo session inserts" ON demo_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous demo event inserts" ON demo_events
    FOR INSERT WITH CHECK (true);

-- Allow admin users to read all demo analytics data
CREATE POLICY "Allow admin users to read demo sessions" ON demo_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow admin users to read demo events" ON demo_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow admin users to read demo daily metrics" ON demo_daily_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow admin users to read demo feature usage" ON demo_feature_usage
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Allow admin users to read demo geographic stats" ON demo_geographic_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Create a view for demo dashboard summary
CREATE VIEW demo_dashboard_summary AS
SELECT 
    COUNT(DISTINCT ds.id) as total_sessions,
    COUNT(DISTINCT CASE WHEN ds.completed THEN ds.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN ds.conversion_action IS NOT NULL THEN ds.id END) as converted_sessions,
    AVG(ds.duration)::INTEGER as avg_duration_ms,
    COUNT(de.id) as total_events,
    COUNT(DISTINCT ds.country) as unique_countries,
    COUNT(DISTINCT de.feature) as unique_features_used,
    (COUNT(DISTINCT CASE WHEN ds.completed THEN ds.id END)::DECIMAL / COUNT(DISTINCT ds.id) * 100) as completion_rate,
    (COUNT(DISTINCT CASE WHEN ds.conversion_action IS NOT NULL THEN ds.id END)::DECIMAL / COUNT(DISTINCT ds.id) * 100) as conversion_rate
FROM demo_sessions ds
LEFT JOIN demo_events de ON ds.id = de.session_id
WHERE ds.start_time >= (CURRENT_DATE - INTERVAL '7 days');

-- Grant permissions to service role
GRANT ALL ON demo_sessions TO service_role;
GRANT ALL ON demo_events TO service_role;
GRANT ALL ON demo_daily_metrics TO service_role;
GRANT ALL ON demo_feature_usage TO service_role;
GRANT ALL ON demo_geographic_stats TO service_role;
GRANT SELECT ON demo_dashboard_summary TO service_role;

-- Grant read permissions to authenticated users with appropriate roles
GRANT SELECT ON demo_dashboard_summary TO authenticated;

-- Comment on tables for documentation
COMMENT ON TABLE demo_sessions IS 'Demo session tracking with privacy-compliant data collection';
COMMENT ON TABLE demo_events IS 'Individual demo events and feature interactions';
COMMENT ON TABLE demo_daily_metrics IS 'Aggregated daily demo metrics for fast dashboard queries';
COMMENT ON TABLE demo_feature_usage IS 'Feature usage statistics by date, feature, and role';
COMMENT ON TABLE demo_geographic_stats IS 'Geographic usage statistics (country-level only for privacy)';

-- Success message
SELECT 'Demo Analytics System created successfully! Tables: demo_sessions, demo_events, demo_daily_metrics, demo_feature_usage, demo_geographic_stats' as message;