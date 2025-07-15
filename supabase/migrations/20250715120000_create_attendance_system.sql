-- =============================================
-- Attendance System Database Schema
-- İ-EP.APP - Attendance Management System
-- Created: 2025-07-15
-- =============================================

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'sick')),
    time_in TIME,
    time_out TIME,
    notes TEXT,
    marked_by UUID NOT NULL REFERENCES public.users(id),
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    parent_notified BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMPTZ,
    excuse_reason TEXT,
    excuse_document TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_notifications table
CREATE TABLE IF NOT EXISTS public.attendance_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    attendance_record_id UUID NOT NULL REFERENCES public.attendance_records(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('sms', 'email', 'push')),
    notification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'delivered', 'failed')),
    message_content TEXT NOT NULL,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_settings table
CREATE TABLE IF NOT EXISTS public.attendance_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    auto_notify_parents BOOLEAN DEFAULT TRUE,
    notify_on_absence BOOLEAN DEFAULT TRUE,
    notify_on_late BOOLEAN DEFAULT TRUE,
    chronic_absence_threshold INTEGER DEFAULT 20, -- percentage
    consecutive_absence_alert INTEGER DEFAULT 3,
    school_start_time TIME DEFAULT '08:00',
    school_end_time TIME DEFAULT '15:30',
    late_threshold_minutes INTEGER DEFAULT 15,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES for Performance
-- =============================================

-- Attendance Records Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_records_tenant ON public.attendance_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_class ON public.attendance_records(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON public.attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_records_marked_by ON public.attendance_records(marked_by);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_records_student_date ON public.attendance_records(student_id, date);

-- Attendance Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_notifications_tenant ON public.attendance_notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_notifications_attendance_record ON public.attendance_notifications(attendance_record_id);
CREATE INDEX IF NOT EXISTS idx_attendance_notifications_student ON public.attendance_notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_notifications_parent ON public.attendance_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_attendance_notifications_status ON public.attendance_notifications(notification_status);
CREATE INDEX IF NOT EXISTS idx_attendance_notifications_sent_at ON public.attendance_notifications(sent_at);

-- Attendance Settings Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_settings_tenant ON public.attendance_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_settings_class ON public.attendance_settings(class_id);

-- =============================================
-- DATABASE FUNCTIONS for Statistics
-- =============================================

-- Function: Get student attendance statistics
CREATE OR REPLACE FUNCTION public.get_student_attendance_stats(
    p_student_id UUID,
    p_tenant_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_days INTEGER,
    present_days INTEGER,
    absent_days INTEGER,
    late_days INTEGER,
    excused_days INTEGER,
    sick_days INTEGER,
    attendance_rate NUMERIC(5,2)
) AS $$
BEGIN
    -- Set default dates if not provided
    IF p_start_date IS NULL THEN
        p_start_date := DATE_TRUNC('month', CURRENT_DATE);
    END IF;
    
    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;
    
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_days,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::INTEGER AS present_days,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END)::INTEGER AS absent_days,
        COUNT(CASE WHEN ar.status = 'late' THEN 1 END)::INTEGER AS late_days,
        COUNT(CASE WHEN ar.status = 'excused' THEN 1 END)::INTEGER AS excused_days,
        COUNT(CASE WHEN ar.status = 'sick' THEN 1 END)::INTEGER AS sick_days,
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
                (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
                2
            )
        END AS attendance_rate
    FROM public.attendance_records ar
    WHERE ar.student_id = p_student_id 
      AND ar.tenant_id = p_tenant_id
      AND ar.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get class attendance summary for a specific date
CREATE OR REPLACE FUNCTION public.get_class_attendance_summary(
    p_class_id UUID,
    p_tenant_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_students INTEGER,
    present_count INTEGER,
    absent_count INTEGER,
    late_count INTEGER,
    excused_count INTEGER,
    sick_count INTEGER,
    attendance_rate NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(s.id)::INTEGER AS total_students,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::INTEGER AS present_count,
        COUNT(CASE WHEN ar.status = 'absent' THEN 1 END)::INTEGER AS absent_count,
        COUNT(CASE WHEN ar.status = 'late' THEN 1 END)::INTEGER AS late_count,
        COUNT(CASE WHEN ar.status = 'excused' THEN 1 END)::INTEGER AS excused_count,
        COUNT(CASE WHEN ar.status = 'sick' THEN 1 END)::INTEGER AS sick_count,
        CASE 
            WHEN COUNT(s.id) = 0 THEN 0
            ELSE ROUND(
                (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END)::NUMERIC / COUNT(s.id)::NUMERIC) * 100, 
                2
            )
        END AS attendance_rate
    FROM public.students s
    LEFT JOIN public.attendance_records ar ON s.id = ar.student_id AND ar.date = p_date
    WHERE s.class_id = p_class_id 
      AND s.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get attendance trends for a student
CREATE OR REPLACE FUNCTION public.get_attendance_trends(
    p_student_id UUID,
    p_tenant_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    status VARCHAR(20),
    weekly_rate NUMERIC(5,2),
    monthly_rate NUMERIC(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ar.date,
        ar.status,
        -- Weekly attendance rate
        ROUND(
            (COUNT(CASE WHEN ar2.status IN ('present', 'late') THEN 1 END) OVER (
                PARTITION BY DATE_TRUNC('week', ar.date)
            )::NUMERIC / COUNT(*) OVER (
                PARTITION BY DATE_TRUNC('week', ar.date)
            )::NUMERIC) * 100, 2
        ) AS weekly_rate,
        -- Monthly attendance rate
        ROUND(
            (COUNT(CASE WHEN ar3.status IN ('present', 'late') THEN 1 END) OVER (
                PARTITION BY DATE_TRUNC('month', ar.date)
            )::NUMERIC / COUNT(*) OVER (
                PARTITION BY DATE_TRUNC('month', ar.date)
            )::NUMERIC) * 100, 2
        ) AS monthly_rate
    FROM public.attendance_records ar
    LEFT JOIN public.attendance_records ar2 ON ar2.student_id = ar.student_id 
        AND ar2.tenant_id = ar.tenant_id
        AND DATE_TRUNC('week', ar2.date) = DATE_TRUNC('week', ar.date)
    LEFT JOIN public.attendance_records ar3 ON ar3.student_id = ar.student_id 
        AND ar3.tenant_id = ar.tenant_id
        AND DATE_TRUNC('month', ar3.date) = DATE_TRUNC('month', ar.date)
    WHERE ar.student_id = p_student_id 
      AND ar.tenant_id = p_tenant_id
      AND ar.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    ORDER BY ar.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get chronic absentees
CREATE OR REPLACE FUNCTION public.get_chronic_absentees(
    p_tenant_id UUID,
    p_class_id UUID DEFAULT NULL,
    p_threshold INTEGER DEFAULT 20,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    student_id UUID,
    student_name VARCHAR(255),
    class_name VARCHAR(255),
    total_days INTEGER,
    absent_days INTEGER,
    absence_rate NUMERIC(5,2),
    consecutive_absences INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH student_stats AS (
        SELECT 
            s.id,
            s.first_name || ' ' || s.last_name AS name,
            c.name AS class_name,
            COUNT(ar.id) AS total_days,
            COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) AS absent_days,
            CASE 
                WHEN COUNT(ar.id) = 0 THEN 0
                ELSE ROUND(
                    (COUNT(CASE WHEN ar.status = 'absent' THEN 1 END)::NUMERIC / COUNT(ar.id)::NUMERIC) * 100, 
                    2
                )
            END AS absence_rate,
            -- Calculate consecutive absences
            (
                SELECT COUNT(*)
                FROM public.attendance_records ar_consec
                WHERE ar_consec.student_id = s.id
                  AND ar_consec.tenant_id = p_tenant_id
                  AND ar_consec.status = 'absent'
                  AND ar_consec.date <= CURRENT_DATE
                  AND ar_consec.date > CURRENT_DATE - INTERVAL '1 day' * (
                      SELECT COUNT(*) 
                      FROM public.attendance_records ar_check 
                      WHERE ar_check.student_id = s.id 
                        AND ar_check.tenant_id = p_tenant_id
                        AND ar_check.date <= CURRENT_DATE
                        AND ar_check.status != 'absent'
                      ORDER BY ar_check.date DESC
                      LIMIT 1
                  )
            ) AS consecutive_absences
        FROM public.students s
        LEFT JOIN public.classes c ON s.class_id = c.id
        LEFT JOIN public.attendance_records ar ON s.id = ar.student_id 
            AND ar.date >= CURRENT_DATE - INTERVAL '1 day' * p_days
        WHERE s.tenant_id = p_tenant_id
          AND (p_class_id IS NULL OR s.class_id = p_class_id)
        GROUP BY s.id, s.first_name, s.last_name, c.name
    )
    SELECT 
        ss.id,
        ss.name,
        ss.class_name,
        ss.total_days::INTEGER,
        ss.absent_days::INTEGER,
        ss.absence_rate,
        ss.consecutive_absences::INTEGER
    FROM student_stats ss
    WHERE ss.absence_rate >= p_threshold
    ORDER BY ss.absence_rate DESC, ss.consecutive_absences DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get perfect attendance students
CREATE OR REPLACE FUNCTION public.get_perfect_attendance_students(
    p_tenant_id UUID,
    p_class_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    student_id UUID,
    student_name VARCHAR(255),
    class_name VARCHAR(255),
    total_days INTEGER,
    present_days INTEGER,
    late_days INTEGER
) AS $$
BEGIN
    -- Set default dates if not provided
    IF p_start_date IS NULL THEN
        p_start_date := DATE_TRUNC('month', CURRENT_DATE);
    END IF;
    
    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;
    
    RETURN QUERY
    SELECT 
        s.id,
        s.first_name || ' ' || s.last_name AS name,
        c.name AS class_name,
        COUNT(ar.id)::INTEGER AS total_days,
        COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::INTEGER AS present_days,
        COUNT(CASE WHEN ar.status = 'late' THEN 1 END)::INTEGER AS late_days
    FROM public.students s
    LEFT JOIN public.classes c ON s.class_id = c.id
    LEFT JOIN public.attendance_records ar ON s.id = ar.student_id 
        AND ar.date BETWEEN p_start_date AND p_end_date
    WHERE s.tenant_id = p_tenant_id
      AND (p_class_id IS NULL OR s.class_id = p_class_id)
    GROUP BY s.id, s.first_name, s.last_name, c.name
    HAVING COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END) = COUNT(ar.id)
       AND COUNT(ar.id) > 0
    ORDER BY COUNT(ar.id) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get attendance report data
CREATE OR REPLACE FUNCTION public.get_attendance_report(
    p_tenant_id UUID,
    p_class_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_student_id UUID DEFAULT NULL
)
RETURNS TABLE (
    date DATE,
    student_id UUID,
    student_name VARCHAR(255),
    class_name VARCHAR(255),
    status VARCHAR(20),
    time_in TIME,
    time_out TIME,
    notes TEXT,
    marked_by_name VARCHAR(255)
) AS $$
BEGIN
    -- Set default dates if not provided
    IF p_start_date IS NULL THEN
        p_start_date := DATE_TRUNC('month', CURRENT_DATE);
    END IF;
    
    IF p_end_date IS NULL THEN
        p_end_date := CURRENT_DATE;
    END IF;
    
    RETURN QUERY
    SELECT 
        ar.date,
        s.id,
        s.first_name || ' ' || s.last_name AS student_name,
        c.name AS class_name,
        ar.status,
        ar.time_in,
        ar.time_out,
        ar.notes,
        u.first_name || ' ' || u.last_name AS marked_by_name
    FROM public.attendance_records ar
    JOIN public.students s ON ar.student_id = s.id
    JOIN public.classes c ON ar.class_id = c.id
    JOIN public.users u ON ar.marked_by = u.id
    WHERE ar.tenant_id = p_tenant_id
      AND ar.date BETWEEN p_start_date AND p_end_date
      AND (p_class_id IS NULL OR ar.class_id = p_class_id)
      AND (p_student_id IS NULL OR ar.student_id = p_student_id)
    ORDER BY ar.date DESC, s.first_name, s.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on attendance tables
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy for attendance_records
CREATE POLICY "Users can access attendance records for their tenant"
    ON public.attendance_records FOR ALL
    TO authenticated
    USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- RLS Policy for attendance_notifications
CREATE POLICY "Users can access attendance notifications for their tenant"
    ON public.attendance_notifications FOR ALL
    TO authenticated
    USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- RLS Policy for attendance_settings
CREATE POLICY "Users can access attendance settings for their tenant"
    ON public.attendance_settings FOR ALL
    TO authenticated
    USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- =============================================
-- TRIGGERS for Updated_At
-- =============================================

-- Update updated_at trigger for attendance_records
CREATE OR REPLACE FUNCTION public.update_attendance_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_attendance_records_updated_at
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_attendance_records_updated_at();

-- Update updated_at trigger for attendance_notifications
CREATE OR REPLACE FUNCTION public.update_attendance_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_attendance_notifications_updated_at
    BEFORE UPDATE ON public.attendance_notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_attendance_notifications_updated_at();

-- Update updated_at trigger for attendance_settings
CREATE OR REPLACE FUNCTION public.update_attendance_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_attendance_settings_updated_at
    BEFORE UPDATE ON public.attendance_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_attendance_settings_updated_at();

-- =============================================
-- AUDIT LOGGING
-- =============================================

-- Create audit table for attendance changes
CREATE TABLE IF NOT EXISTS public.attendance_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES public.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_attendance_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.attendance_audit (
            tenant_id, table_name, record_id, action, old_data, changed_by
        ) VALUES (
            OLD.tenant_id, TG_TABLE_NAME, OLD.id, 'DELETE', 
            to_jsonb(OLD), auth.uid()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.attendance_audit (
            tenant_id, table_name, record_id, action, old_data, new_data, changed_by
        ) VALUES (
            NEW.tenant_id, TG_TABLE_NAME, NEW.id, 'UPDATE', 
            to_jsonb(OLD), to_jsonb(NEW), auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.attendance_audit (
            tenant_id, table_name, record_id, action, new_data, changed_by
        ) VALUES (
            NEW.tenant_id, TG_TABLE_NAME, NEW.id, 'INSERT', 
            to_jsonb(NEW), auth.uid()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER trigger_attendance_records_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_attendance_changes();

-- =============================================
-- INITIAL DATA INSERTION
-- =============================================

-- Insert default attendance settings for existing tenants
INSERT INTO public.attendance_settings (tenant_id, auto_notify_parents, notify_on_absence, notify_on_late, chronic_absence_threshold, consecutive_absence_alert)
SELECT 
    t.id,
    TRUE,
    TRUE,
    TRUE,
    20,
    3
FROM public.tenants t
WHERE NOT EXISTS (
    SELECT 1 FROM public.attendance_settings 
    WHERE tenant_id = t.id AND class_id IS NULL
)
ON CONFLICT DO NOTHING;

-- Create indexes on audit table
CREATE INDEX IF NOT EXISTS idx_attendance_audit_tenant ON public.attendance_audit(tenant_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_table_record ON public.attendance_audit(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_attendance_audit_changed_at ON public.attendance_audit(changed_at);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_student_attendance_stats(UUID, UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_class_attendance_summary(UUID, UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_attendance_trends(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chronic_absentees(UUID, UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_perfect_attendance_students(UUID, UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_attendance_report(UUID, UUID, DATE, DATE, UUID) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance_settings TO authenticated;
GRANT SELECT ON public.attendance_audit TO authenticated;

-- =============================================
-- COMMENTS for Documentation
-- =============================================

COMMENT ON TABLE public.attendance_records IS 'Stores daily attendance records for students';
COMMENT ON TABLE public.attendance_notifications IS 'Tracks parent notifications for attendance events';
COMMENT ON TABLE public.attendance_settings IS 'Stores attendance configuration settings per tenant/class';
COMMENT ON TABLE public.attendance_audit IS 'Audit trail for attendance record changes';

COMMENT ON FUNCTION public.get_student_attendance_stats(UUID, UUID, DATE, DATE) IS 'Calculates attendance statistics for a specific student';
COMMENT ON FUNCTION public.get_class_attendance_summary(UUID, UUID, DATE) IS 'Provides attendance summary for a class on a specific date';
COMMENT ON FUNCTION public.get_attendance_trends(UUID, UUID, INTEGER) IS 'Analyzes attendance trends for a student over time';
COMMENT ON FUNCTION public.get_chronic_absentees(UUID, UUID, INTEGER, INTEGER) IS 'Identifies students with chronic absenteeism';
COMMENT ON FUNCTION public.get_perfect_attendance_students(UUID, UUID, DATE, DATE) IS 'Lists students with perfect attendance';
COMMENT ON FUNCTION public.get_attendance_report(UUID, UUID, DATE, DATE, UUID) IS 'Generates comprehensive attendance report data';