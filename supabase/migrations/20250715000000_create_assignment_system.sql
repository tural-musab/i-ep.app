-- Assignment System Migration
-- İ-EP.APP - Assignment Management System
-- Multi-tenant architecture with RLS policies
-- Referans: docs/architecture/multi-tenant-strategy.md

-- 1. Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'homework' CHECK (type IN ('homework', 'exam', 'project', 'quiz', 'presentation')),
    subject VARCHAR(100) NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    due_date TIMESTAMPTZ NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 100,
    is_graded BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'archived')),
    instructions TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    rubric JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Assignment Submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    submission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    score INTEGER,
    feedback TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned', 'late')),
    graded_by UUID REFERENCES public.teachers(id),
    graded_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id) -- Bir öğrenci aynı ödeve birden fazla submission yapamaz
);

-- 3. Assignment Attachments table (for file management)
CREATE TABLE IF NOT EXISTS public.assignment_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID NOT NULL, -- teacher_id or student_id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Either assignment_id or submission_id must be present
    CONSTRAINT attachment_parent_check CHECK (
        (assignment_id IS NOT NULL AND submission_id IS NULL) OR
        (assignment_id IS NULL AND submission_id IS NOT NULL)
    )
);

-- 4. Assignment Rubrics table (for detailed grading criteria)
CREATE TABLE IF NOT EXISTS public.assignment_rubrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    criteria VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Assignment Rubric Scores table (for individual submission scoring)
CREATE TABLE IF NOT EXISTS public.assignment_rubric_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    submission_id UUID NOT NULL REFERENCES public.assignment_submissions(id) ON DELETE CASCADE,
    rubric_id UUID NOT NULL REFERENCES public.assignment_rubrics(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, rubric_id) -- Bir submission için her rubric sadece bir kez puanlanabilir
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_assignments_tenant_id ON public.assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_type ON public.assignments(type);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_tenant_id ON public.assignment_submissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_status ON public.assignment_submissions(status);

CREATE INDEX IF NOT EXISTS idx_assignment_attachments_tenant_id ON public.assignment_attachments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignment_attachments_assignment_id ON public.assignment_attachments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_attachments_submission_id ON public.assignment_attachments(submission_id);

CREATE INDEX IF NOT EXISTS idx_assignment_rubrics_tenant_id ON public.assignment_rubrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rubrics_assignment_id ON public.assignment_rubrics(assignment_id);

CREATE INDEX IF NOT EXISTS idx_assignment_rubric_scores_tenant_id ON public.assignment_rubric_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assignment_rubric_scores_submission_id ON public.assignment_rubric_scores(submission_id);

-- RLS Policies Enable
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_rubric_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Tenant isolation for assignments
CREATE POLICY tenant_isolation_select_assignments ON public.assignments
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_insert_assignments ON public.assignments
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_update_assignments ON public.assignments
    FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_delete_assignments ON public.assignments
    FOR DELETE USING (tenant_id = auth.uid());

-- RLS Policies: Tenant isolation for assignment submissions
CREATE POLICY tenant_isolation_select_assignment_submissions ON public.assignment_submissions
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_insert_assignment_submissions ON public.assignment_submissions
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_update_assignment_submissions ON public.assignment_submissions
    FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_delete_assignment_submissions ON public.assignment_submissions
    FOR DELETE USING (tenant_id = auth.uid());

-- RLS Policies: Tenant isolation for assignment attachments
CREATE POLICY tenant_isolation_select_assignment_attachments ON public.assignment_attachments
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_insert_assignment_attachments ON public.assignment_attachments
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_update_assignment_attachments ON public.assignment_attachments
    FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_delete_assignment_attachments ON public.assignment_attachments
    FOR DELETE USING (tenant_id = auth.uid());

-- RLS Policies: Tenant isolation for assignment rubrics
CREATE POLICY tenant_isolation_select_assignment_rubrics ON public.assignment_rubrics
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_insert_assignment_rubrics ON public.assignment_rubrics
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_update_assignment_rubrics ON public.assignment_rubrics
    FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_delete_assignment_rubrics ON public.assignment_rubrics
    FOR DELETE USING (tenant_id = auth.uid());

-- RLS Policies: Tenant isolation for assignment rubric scores
CREATE POLICY tenant_isolation_select_assignment_rubric_scores ON public.assignment_rubric_scores
    FOR SELECT USING (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_insert_assignment_rubric_scores ON public.assignment_rubric_scores
    FOR INSERT WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_update_assignment_rubric_scores ON public.assignment_rubric_scores
    FOR UPDATE USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE POLICY tenant_isolation_delete_assignment_rubric_scores ON public.assignment_rubric_scores
    FOR DELETE USING (tenant_id = auth.uid());

-- Updated_at trigger functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_submissions_updated_at BEFORE UPDATE ON public.assignment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_rubrics_updated_at BEFORE UPDATE ON public.assignment_rubrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_rubric_scores_updated_at BEFORE UPDATE ON public.assignment_rubric_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Database functions for assignment statistics
CREATE OR REPLACE FUNCTION get_assignment_statistics(assignment_uuid UUID)
RETURNS TABLE (
    total_submissions INTEGER,
    graded_submissions INTEGER,
    average_score NUMERIC,
    completion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_submissions,
        COUNT(CASE WHEN status = 'graded' THEN 1 END)::INTEGER as graded_submissions,
        AVG(score)::NUMERIC as average_score,
        (COUNT(CASE WHEN status IN ('submitted', 'graded', 'returned') THEN 1 END) * 100.0 / 
         NULLIF(COUNT(*), 0))::NUMERIC as completion_rate
    FROM public.assignment_submissions 
    WHERE assignment_id = assignment_uuid
    AND tenant_id = auth.uid();
END;
$$;

-- Function to get assignment with relations
CREATE OR REPLACE FUNCTION get_assignment_with_relations(assignment_uuid UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    type VARCHAR,
    subject VARCHAR,
    due_date TIMESTAMPTZ,
    max_score INTEGER,
    status VARCHAR,
    class_name VARCHAR,
    teacher_name VARCHAR,
    total_submissions INTEGER,
    graded_submissions INTEGER,
    average_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.type,
        a.subject,
        a.due_date,
        a.max_score,
        a.status,
        c.name as class_name,
        (t.first_name || ' ' || t.last_name) as teacher_name,
        COALESCE(stats.total_submissions, 0) as total_submissions,
        COALESCE(stats.graded_submissions, 0) as graded_submissions,
        COALESCE(stats.average_score, 0) as average_score
    FROM public.assignments a
    LEFT JOIN public.classes c ON a.class_id = c.id
    LEFT JOIN public.teachers t ON a.teacher_id = t.id
    LEFT JOIN LATERAL (
        SELECT 
            COUNT(*)::INTEGER as total_submissions,
            COUNT(CASE WHEN status = 'graded' THEN 1 END)::INTEGER as graded_submissions,
            AVG(score)::NUMERIC as average_score
        FROM public.assignment_submissions 
        WHERE assignment_id = a.id
    ) stats ON true
    WHERE a.id = assignment_uuid
    AND a.tenant_id = auth.uid();
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.assignments IS 'Assignment definitions with multi-tenant support';
COMMENT ON TABLE public.assignment_submissions IS 'Student submissions for assignments';
COMMENT ON TABLE public.assignment_attachments IS 'File attachments for assignments and submissions';
COMMENT ON TABLE public.assignment_rubrics IS 'Grading criteria for assignments';
COMMENT ON TABLE public.assignment_rubric_scores IS 'Individual rubric scores for submissions';

COMMENT ON COLUMN public.assignments.rubric IS 'JSON array of rubric criteria: [{"criteria": "string", "points": number, "description": "string"}]';
COMMENT ON COLUMN public.assignments.attachments IS 'JSON array of attachment file paths';
COMMENT ON COLUMN public.assignment_submissions.attachments IS 'JSON array of submission file paths';
COMMENT ON COLUMN public.assignments.metadata IS 'Additional assignment configuration and settings';
COMMENT ON COLUMN public.assignment_submissions.metadata IS 'Additional submission data and tracking info';