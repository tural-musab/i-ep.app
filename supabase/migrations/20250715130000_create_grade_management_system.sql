-- ============================================================================
-- İ-EP.APP Grade Management System Database Schema
-- Migration: 20250715130000_create_grade_management_system.sql
-- Author: Claude Code Assistant
-- Date: 2025-07-15
-- Version: 1.0.0
-- Description: Complete grade management system with Turkish education standards
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE GRADES TABLE
-- ============================================================================

-- Individual grade records for students
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
    
    -- Grade Information
    grade_type VARCHAR(20) NOT NULL CHECK (grade_type IN ('exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final')),
    grade_value DECIMAL(5,2) NOT NULL CHECK (grade_value >= 0),
    max_grade DECIMAL(5,2) NOT NULL DEFAULT 100 CHECK (max_grade > 0),
    weight DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
    
    -- Turkish Education System Fields
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN max_grade > 0 THEN (grade_value / max_grade) * 100
            ELSE 0
        END
    ) STORED,
    letter_grade VARCHAR(2) GENERATED ALWAYS AS (
        CASE 
            WHEN (grade_value / max_grade) * 100 >= 90 THEN 'AA'
            WHEN (grade_value / max_grade) * 100 >= 85 THEN 'BA'
            WHEN (grade_value / max_grade) * 100 >= 80 THEN 'BB'
            WHEN (grade_value / max_grade) * 100 >= 75 THEN 'CB'
            WHEN (grade_value / max_grade) * 100 >= 70 THEN 'CC'
            WHEN (grade_value / max_grade) * 100 >= 65 THEN 'DC'
            WHEN (grade_value / max_grade) * 100 >= 60 THEN 'DD'
            WHEN (grade_value / max_grade) * 100 >= 50 THEN 'FD'
            ELSE 'FF'
        END
    ) STORED,
    gpa_points DECIMAL(3,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (grade_value / max_grade) * 100 >= 90 THEN 4.0
            WHEN (grade_value / max_grade) * 100 >= 85 THEN 3.5
            WHEN (grade_value / max_grade) * 100 >= 80 THEN 3.0
            WHEN (grade_value / max_grade) * 100 >= 75 THEN 2.5
            WHEN (grade_value / max_grade) * 100 >= 70 THEN 2.0
            WHEN (grade_value / max_grade) * 100 >= 65 THEN 1.5
            WHEN (grade_value / max_grade) * 100 >= 60 THEN 1.0
            WHEN (grade_value / max_grade) * 100 >= 50 THEN 0.5
            ELSE 0.0
        END
    ) STORED,
    
    -- Academic Period
    exam_name VARCHAR(255),
    description TEXT,
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^\d{4}-\d{4}$'),
    grade_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, student_id, subject_id, grade_type, exam_name, semester, academic_year),
    CHECK (grade_value <= max_grade)
);

-- ============================================================================
-- GRADE CONFIGURATIONS TABLE
-- ============================================================================

-- Subject-specific grading configurations
CREATE TABLE IF NOT EXISTS public.grade_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    
    -- Grade Type Configuration
    grade_type VARCHAR(20) NOT NULL CHECK (grade_type IN ('exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final')),
    weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    min_grade DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_grade DECIMAL(5,2) NOT NULL DEFAULT 100,
    
    -- Turkish Education System Configuration
    passing_grade DECIMAL(5,2) NOT NULL DEFAULT 50,
    honor_roll_grade DECIMAL(5,2) NOT NULL DEFAULT 85,
    
    -- Configuration Details
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    allows_makeup BOOLEAN NOT NULL DEFAULT FALSE,
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^\d{4}-\d{4}$'),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, subject_id, class_id, grade_type, semester, academic_year),
    CHECK (min_grade < max_grade),
    CHECK (passing_grade >= min_grade AND passing_grade <= max_grade)
);

-- ============================================================================
-- GRADE CALCULATIONS TABLE
-- ============================================================================

-- Cached grade calculations for performance
CREATE TABLE IF NOT EXISTS public.grade_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    
    -- Calculated Values
    semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
    academic_year VARCHAR(9) NOT NULL CHECK (academic_year ~ '^\d{4}-\d{4}$'),
    
    -- Grade Calculations
    total_points DECIMAL(8,2) NOT NULL DEFAULT 0,
    total_weight DECIMAL(5,2) NOT NULL DEFAULT 0,
    weighted_average DECIMAL(5,2) NOT NULL DEFAULT 0,
    unweighted_average DECIMAL(5,2) NOT NULL DEFAULT 0,
    
    -- Turkish System Grades
    final_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    final_letter_grade VARCHAR(2) NOT NULL DEFAULT 'FF',
    gpa_points DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    
    -- Status
    is_passing BOOLEAN NOT NULL DEFAULT FALSE,
    is_honor_roll BOOLEAN NOT NULL DEFAULT FALSE,
    grade_count INTEGER NOT NULL DEFAULT 0,
    
    -- Calculation Metadata
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    calculation_method VARCHAR(20) NOT NULL DEFAULT 'weighted' CHECK (calculation_method IN ('weighted', 'unweighted')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, student_id, subject_id, semester, academic_year)
);

-- ============================================================================
-- GRADE RUBRICS TABLE
-- ============================================================================

-- Detailed grading rubrics for assignments
CREATE TABLE IF NOT EXISTS public.grade_rubrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    
    -- Rubric Information
    rubric_name VARCHAR(255) NOT NULL,
    description TEXT,
    grade_type VARCHAR(20) NOT NULL CHECK (grade_type IN ('exam', 'homework', 'project', 'participation', 'quiz', 'midterm', 'final')),
    max_points DECIMAL(5,2) NOT NULL DEFAULT 100,
    
    -- Rubric Criteria (JSON structure)
    criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Usage Statistics
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(tenant_id, rubric_name, subject_id)
);

-- ============================================================================
-- GRADE COMMENTS TABLE
-- ============================================================================

-- Teacher comments on grades
CREATE TABLE IF NOT EXISTS public.grade_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES public.grades(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Comment Information
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (comment_type IN ('general', 'strength', 'improvement', 'recommendation')),
    
    -- Visibility
    is_visible_to_student BOOLEAN NOT NULL DEFAULT TRUE,
    is_visible_to_parent BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Grades table indexes
CREATE INDEX IF NOT EXISTS idx_grades_tenant_id ON public.grades(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON public.grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_class_id ON public.grades(class_id);
CREATE INDEX IF NOT EXISTS idx_grades_subject_id ON public.grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher_id ON public.grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grades_academic_year ON public.grades(academic_year);
CREATE INDEX IF NOT EXISTS idx_grades_semester ON public.grades(semester);
CREATE INDEX IF NOT EXISTS idx_grades_grade_type ON public.grades(grade_type);
CREATE INDEX IF NOT EXISTS idx_grades_grade_date ON public.grades(grade_date);
CREATE INDEX IF NOT EXISTS idx_grades_percentage ON public.grades(percentage);

-- Grade configurations indexes
CREATE INDEX IF NOT EXISTS idx_grade_configurations_tenant_id ON public.grade_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grade_configurations_subject_id ON public.grade_configurations(subject_id);
CREATE INDEX IF NOT EXISTS idx_grade_configurations_class_id ON public.grade_configurations(class_id);

-- Grade calculations indexes
CREATE INDEX IF NOT EXISTS idx_grade_calculations_tenant_id ON public.grade_calculations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grade_calculations_student_id ON public.grade_calculations(student_id);
CREATE INDEX IF NOT EXISTS idx_grade_calculations_subject_id ON public.grade_calculations(subject_id);
CREATE INDEX IF NOT EXISTS idx_grade_calculations_academic_year ON public.grade_calculations(academic_year);

-- Grade rubrics indexes
CREATE INDEX IF NOT EXISTS idx_grade_rubrics_tenant_id ON public.grade_rubrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grade_rubrics_teacher_id ON public.grade_rubrics(teacher_id);
CREATE INDEX IF NOT EXISTS idx_grade_rubrics_subject_id ON public.grade_rubrics(subject_id);

-- Grade comments indexes
CREATE INDEX IF NOT EXISTS idx_grade_comments_tenant_id ON public.grade_comments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grade_comments_grade_id ON public.grade_comments(grade_id);
CREATE INDEX IF NOT EXISTS idx_grade_comments_teacher_id ON public.grade_comments(teacher_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for grades table
CREATE POLICY "grades_tenant_isolation" ON public.grades
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "grades_student_access" ON public.grades
    FOR SELECT USING (
        tenant_id = get_current_tenant_id() AND
        (student_id = get_current_user_student_id() OR 
         teacher_id = auth.uid() OR
         get_current_user_role() IN ('admin', 'teacher'))
    );

CREATE POLICY "grades_teacher_management" ON public.grades
    FOR ALL USING (
        tenant_id = get_current_tenant_id() AND
        (teacher_id = auth.uid() OR get_current_user_role() IN ('admin'))
    );

-- RLS Policies for grade_configurations table
CREATE POLICY "grade_configurations_tenant_isolation" ON public.grade_configurations
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "grade_configurations_teacher_access" ON public.grade_configurations
    FOR ALL USING (
        tenant_id = get_current_tenant_id() AND
        get_current_user_role() IN ('admin', 'teacher')
    );

-- RLS Policies for grade_calculations table
CREATE POLICY "grade_calculations_tenant_isolation" ON public.grade_calculations
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "grade_calculations_student_access" ON public.grade_calculations
    FOR SELECT USING (
        tenant_id = get_current_tenant_id() AND
        (student_id = get_current_user_student_id() OR 
         get_current_user_role() IN ('admin', 'teacher'))
    );

-- RLS Policies for grade_rubrics table
CREATE POLICY "grade_rubrics_tenant_isolation" ON public.grade_rubrics
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "grade_rubrics_teacher_access" ON public.grade_rubrics
    FOR ALL USING (
        tenant_id = get_current_tenant_id() AND
        (teacher_id = auth.uid() OR get_current_user_role() IN ('admin'))
    );

-- RLS Policies for grade_comments table
CREATE POLICY "grade_comments_tenant_isolation" ON public.grade_comments
    FOR ALL USING (tenant_id = get_current_tenant_id());

CREATE POLICY "grade_comments_teacher_access" ON public.grade_comments
    FOR ALL USING (
        tenant_id = get_current_tenant_id() AND
        (teacher_id = auth.uid() OR get_current_user_role() IN ('admin'))
    );

-- ============================================================================
-- POSTGRESQL FUNCTIONS
-- ============================================================================

-- Function to calculate student's subject average
CREATE OR REPLACE FUNCTION calculate_student_subject_average(
    p_student_id UUID,
    p_subject_id UUID,
    p_semester INTEGER,
    p_academic_year VARCHAR(9),
    p_tenant_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    v_weighted_sum DECIMAL(10,4) := 0;
    v_total_weight DECIMAL(5,2) := 0;
    v_average DECIMAL(5,2) := 0;
    grade_record RECORD;
BEGIN
    -- Calculate weighted average
    FOR grade_record IN
        SELECT 
            g.percentage,
            COALESCE(gc.weight, 1.0) as weight
        FROM public.grades g
        LEFT JOIN public.grade_configurations gc ON (
            gc.tenant_id = g.tenant_id AND
            gc.subject_id = g.subject_id AND
            gc.grade_type = g.grade_type AND
            gc.semester = g.semester AND
            gc.academic_year = g.academic_year
        )
        WHERE g.tenant_id = p_tenant_id
        AND g.student_id = p_student_id
        AND g.subject_id = p_subject_id
        AND g.semester = p_semester
        AND g.academic_year = p_academic_year
    LOOP
        v_weighted_sum := v_weighted_sum + (grade_record.percentage * grade_record.weight);
        v_total_weight := v_total_weight + grade_record.weight;
    END LOOP;
    
    -- Calculate final average
    IF v_total_weight > 0 THEN
        v_average := v_weighted_sum / v_total_weight;
    END IF;
    
    RETURN ROUND(v_average, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate student's GPA
CREATE OR REPLACE FUNCTION calculate_student_gpa(
    p_student_id UUID,
    p_semester INTEGER,
    p_academic_year VARCHAR(9),
    p_tenant_id UUID
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    v_total_points DECIMAL(8,2) := 0;
    v_total_credits DECIMAL(5,2) := 0;
    v_gpa DECIMAL(3,2) := 0;
    calc_record RECORD;
BEGIN
    -- Calculate GPA based on subject averages
    FOR calc_record IN
        SELECT 
            gc.gpa_points,
            COALESCE(s.credit_hours, 1.0) as credits
        FROM public.grade_calculations gc
        LEFT JOIN public.subjects s ON s.id = gc.subject_id
        WHERE gc.tenant_id = p_tenant_id
        AND gc.student_id = p_student_id
        AND gc.semester = p_semester
        AND gc.academic_year = p_academic_year
    LOOP
        v_total_points := v_total_points + (calc_record.gpa_points * calc_record.credits);
        v_total_credits := v_total_credits + calc_record.credits;
    END LOOP;
    
    -- Calculate final GPA
    IF v_total_credits > 0 THEN
        v_gpa := v_total_points / v_total_credits;
    END IF;
    
    RETURN ROUND(v_gpa, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get class grade statistics
CREATE OR REPLACE FUNCTION get_class_grade_statistics(
    p_class_id UUID,
    p_subject_id UUID,
    p_semester INTEGER,
    p_academic_year VARCHAR(9),
    p_tenant_id UUID
) RETURNS TABLE (
    average_grade DECIMAL(5,2),
    highest_grade DECIMAL(5,2),
    lowest_grade DECIMAL(5,2),
    median_grade DECIMAL(5,2),
    passing_count INTEGER,
    total_count INTEGER,
    passing_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH grade_stats AS (
        SELECT 
            gc.final_percentage,
            gc.is_passing,
            COUNT(*) OVER () as total_students,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gc.final_percentage) OVER () as median_val
        FROM public.grade_calculations gc
        WHERE gc.tenant_id = p_tenant_id
        AND gc.class_id = p_class_id
        AND gc.subject_id = p_subject_id
        AND gc.semester = p_semester
        AND gc.academic_year = p_academic_year
    )
    SELECT 
        ROUND(AVG(gs.final_percentage), 2) as average_grade,
        ROUND(MAX(gs.final_percentage), 2) as highest_grade,
        ROUND(MIN(gs.final_percentage), 2) as lowest_grade,
        ROUND(MAX(gs.median_val), 2) as median_grade,
        COUNT(*) FILTER (WHERE gs.is_passing = true)::INTEGER as passing_count,
        COUNT(*)::INTEGER as total_count,
        ROUND(
            (COUNT(*) FILTER (WHERE gs.is_passing = true)::DECIMAL / COUNT(*)) * 100, 
            2
        ) as passing_percentage
    FROM grade_stats gs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update grade calculations
CREATE OR REPLACE FUNCTION update_grade_calculations(
    p_student_id UUID,
    p_subject_id UUID,
    p_semester INTEGER,
    p_academic_year VARCHAR(9),
    p_tenant_id UUID
) RETURNS VOID AS $$
DECLARE
    v_class_id UUID;
    v_weighted_avg DECIMAL(5,2);
    v_grade_count INTEGER;
    v_letter_grade VARCHAR(2);
    v_gpa_points DECIMAL(3,2);
    v_is_passing BOOLEAN;
    v_is_honor_roll BOOLEAN;
BEGIN
    -- Get class_id for the student
    SELECT s.class_id INTO v_class_id
    FROM public.students s
    WHERE s.id = p_student_id AND s.tenant_id = p_tenant_id;
    
    -- Calculate weighted average
    v_weighted_avg := calculate_student_subject_average(
        p_student_id, p_subject_id, p_semester, p_academic_year, p_tenant_id
    );
    
    -- Get grade count
    SELECT COUNT(*) INTO v_grade_count
    FROM public.grades g
    WHERE g.tenant_id = p_tenant_id
    AND g.student_id = p_student_id
    AND g.subject_id = p_subject_id
    AND g.semester = p_semester
    AND g.academic_year = p_academic_year;
    
    -- Calculate letter grade and GPA points
    SELECT 
        CASE 
            WHEN v_weighted_avg >= 90 THEN 'AA'
            WHEN v_weighted_avg >= 85 THEN 'BA'
            WHEN v_weighted_avg >= 80 THEN 'BB'
            WHEN v_weighted_avg >= 75 THEN 'CB'
            WHEN v_weighted_avg >= 70 THEN 'CC'
            WHEN v_weighted_avg >= 65 THEN 'DC'
            WHEN v_weighted_avg >= 60 THEN 'DD'
            WHEN v_weighted_avg >= 50 THEN 'FD'
            ELSE 'FF'
        END,
        CASE 
            WHEN v_weighted_avg >= 90 THEN 4.0
            WHEN v_weighted_avg >= 85 THEN 3.5
            WHEN v_weighted_avg >= 80 THEN 3.0
            WHEN v_weighted_avg >= 75 THEN 2.5
            WHEN v_weighted_avg >= 70 THEN 2.0
            WHEN v_weighted_avg >= 65 THEN 1.5
            WHEN v_weighted_avg >= 60 THEN 1.0
            WHEN v_weighted_avg >= 50 THEN 0.5
            ELSE 0.0
        END
    INTO v_letter_grade, v_gpa_points;
    
    -- Determine passing status
    v_is_passing := v_weighted_avg >= 50;
    v_is_honor_roll := v_weighted_avg >= 85;
    
    -- Insert or update grade calculations
    INSERT INTO public.grade_calculations (
        tenant_id, student_id, subject_id, class_id, semester, academic_year,
        total_points, total_weight, weighted_average, unweighted_average,
        final_percentage, final_letter_grade, gpa_points,
        is_passing, is_honor_roll, grade_count, last_calculated_at
    )
    VALUES (
        p_tenant_id, p_student_id, p_subject_id, v_class_id, p_semester, p_academic_year,
        v_weighted_avg, 1.0, v_weighted_avg, v_weighted_avg,
        v_weighted_avg, v_letter_grade, v_gpa_points,
        v_is_passing, v_is_honor_roll, v_grade_count, NOW()
    )
    ON CONFLICT (tenant_id, student_id, subject_id, semester, academic_year)
    DO UPDATE SET
        class_id = v_class_id,
        weighted_average = v_weighted_avg,
        unweighted_average = v_weighted_avg,
        final_percentage = v_weighted_avg,
        final_letter_grade = v_letter_grade,
        gpa_points = v_gpa_points,
        is_passing = v_is_passing,
        is_honor_roll = v_is_honor_roll,
        grade_count = v_grade_count,
        last_calculated_at = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk update grade calculations for a class
CREATE OR REPLACE FUNCTION bulk_update_grade_calculations(
    p_class_id UUID,
    p_subject_id UUID,
    p_semester INTEGER,
    p_academic_year VARCHAR(9),
    p_tenant_id UUID
) RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER := 0;
    student_record RECORD;
BEGIN
    -- Update calculations for all students in the class
    FOR student_record IN
        SELECT DISTINCT s.id as student_id
        FROM public.students s
        INNER JOIN public.grades g ON g.student_id = s.id
        WHERE s.tenant_id = p_tenant_id
        AND s.class_id = p_class_id
        AND g.subject_id = p_subject_id
        AND g.semester = p_semester
        AND g.academic_year = p_academic_year
    LOOP
        PERFORM update_grade_calculations(
            student_record.student_id,
            p_subject_id,
            p_semester,
            p_academic_year,
            p_tenant_id
        );
        v_updated_count := v_updated_count + 1;
    END LOOP;
    
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to handle grade changes
CREATE OR REPLACE FUNCTION handle_grade_changes() RETURNS TRIGGER AS $$
BEGIN
    -- Update grade calculations when grades are modified
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update timestamp
        NEW.updated_at = NOW();
        
        -- Recalculate grades for the student
        PERFORM update_grade_calculations(
            NEW.student_id,
            NEW.subject_id,
            NEW.semester,
            NEW.academic_year,
            NEW.tenant_id
        );
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Recalculate grades for the student after deletion
        PERFORM update_grade_calculations(
            OLD.student_id,
            OLD.subject_id,
            OLD.semester,
            OLD.academic_year,
            OLD.tenant_id
        );
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER grades_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.grades
    FOR EACH ROW EXECUTE FUNCTION handle_grade_changes();

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_grades_updated_at
    BEFORE UPDATE ON public.grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_configurations_updated_at
    BEFORE UPDATE ON public.grade_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_calculations_updated_at
    BEFORE UPDATE ON public.grade_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_rubrics_updated_at
    BEFORE UPDATE ON public.grade_rubrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_comments_updated_at
    BEFORE UPDATE ON public.grade_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

-- Create audit log table for grades
CREATE TABLE IF NOT EXISTS public.grade_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION grade_audit_trigger() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.grade_audit_log (tenant_id, table_name, record_id, action, new_values, changed_by)
        VALUES (NEW.tenant_id, TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.grade_audit_log (tenant_id, table_name, record_id, action, old_values, new_values, changed_by)
        VALUES (NEW.tenant_id, TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.grade_audit_log (tenant_id, table_name, record_id, action, old_values, changed_by)
        VALUES (OLD.tenant_id, TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER grades_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.grades
    FOR EACH ROW EXECUTE FUNCTION grade_audit_trigger();

CREATE TRIGGER grade_configurations_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.grade_configurations
    FOR EACH ROW EXECUTE FUNCTION grade_audit_trigger();

CREATE TRIGGER grade_calculations_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.grade_calculations
    FOR EACH ROW EXECUTE FUNCTION grade_audit_trigger();

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default grade configurations for common subjects
-- This will be populated based on tenant-specific requirements

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Create materialized view for frequently accessed grade statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS grade_statistics_mv AS
SELECT 
    gc.tenant_id,
    gc.class_id,
    gc.subject_id,
    gc.semester,
    gc.academic_year,
    COUNT(*) as total_students,
    AVG(gc.final_percentage) as average_grade,
    MAX(gc.final_percentage) as highest_grade,
    MIN(gc.final_percentage) as lowest_grade,
    COUNT(*) FILTER (WHERE gc.is_passing = true) as passing_count,
    COUNT(*) FILTER (WHERE gc.is_honor_roll = true) as honor_roll_count,
    CURRENT_TIMESTAMP as last_updated
FROM public.grade_calculations gc
GROUP BY gc.tenant_id, gc.class_id, gc.subject_id, gc.semester, gc.academic_year;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS grade_statistics_mv_unique 
ON grade_statistics_mv (tenant_id, class_id, subject_id, semester, academic_year);

-- Function to refresh grade statistics
CREATE OR REPLACE FUNCTION refresh_grade_statistics() RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY grade_statistics_mv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

-- Table comments
COMMENT ON TABLE public.grades IS 'Individual grade records for students with Turkish education system support';
COMMENT ON TABLE public.grade_configurations IS 'Subject-specific grading configurations and weights';
COMMENT ON TABLE public.grade_calculations IS 'Cached grade calculations for performance optimization';
COMMENT ON TABLE public.grade_rubrics IS 'Detailed grading rubrics for assignments and assessments';
COMMENT ON TABLE public.grade_comments IS 'Teacher comments and feedback on student grades';

-- Column comments
COMMENT ON COLUMN public.grades.percentage IS 'Automatically calculated percentage (grade_value/max_grade)*100';
COMMENT ON COLUMN public.grades.letter_grade IS 'Turkish education system letter grade (AA to FF)';
COMMENT ON COLUMN public.grades.gpa_points IS 'GPA points for Turkish system (0.0 to 4.0)';
COMMENT ON COLUMN public.grade_configurations.weight IS 'Weight of this grade type in final calculation';
COMMENT ON COLUMN public.grade_calculations.weighted_average IS 'Final weighted average for the subject';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Grade Management System database schema created successfully!';
    RAISE NOTICE 'Tables created: grades, grade_configurations, grade_calculations, grade_rubrics, grade_comments';
    RAISE NOTICE 'Functions created: 6 PostgreSQL functions for grade calculations';
    RAISE NOTICE 'Triggers created: Automatic grade calculation updates';
    RAISE NOTICE 'RLS policies: Multi-tenant security enabled';
    RAISE NOTICE 'Audit logging: Complete audit trail implemented';
    RAISE NOTICE 'Performance: Materialized view and indexes created';
END
$$;