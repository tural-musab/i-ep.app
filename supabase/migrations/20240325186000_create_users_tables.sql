-- Iqra Eğitim Portalı - Kullanıcı Tabloları
BEGIN;

-- Users tablosu
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    first_name TEXT,
    last_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Students tablosu
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    student_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    additional_info JSONB DEFAULT '{}'::jsonb
);

-- Teachers tablosu
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    teacher_number TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialization TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    additional_info JSONB DEFAULT '{}'::jsonb
);

-- RLS politikaları
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Super admin için erişim politikaları
CREATE POLICY super_admin_users_access ON public.users
    FOR ALL
    TO authenticated
    USING (is_super_admin());

CREATE POLICY super_admin_students_access ON public.students
    FOR ALL
    TO authenticated
    USING (is_super_admin());

CREATE POLICY super_admin_teachers_access ON public.teachers
    FOR ALL
    TO authenticated
    USING (is_super_admin());

-- Service role için bypass politikaları
CREATE POLICY service_role_users_bypass ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_role_students_bypass ON public.students
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY service_role_teachers_bypass ON public.teachers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Tenant admin için kendi tenant'ına erişim
CREATE POLICY tenant_admin_users_access ON public.users
    FOR ALL
    TO authenticated
    USING (is_tenant_admin(tenant_id));

CREATE POLICY tenant_admin_students_access ON public.students
    FOR ALL
    TO authenticated
    USING (is_tenant_admin(tenant_id));

CREATE POLICY tenant_admin_teachers_access ON public.teachers
    FOR ALL
    TO authenticated
    USING (is_tenant_admin(tenant_id));

-- İndeksler
CREATE INDEX idx_users_tenant ON public.users(tenant_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_students_tenant ON public.students(tenant_id);
CREATE INDEX idx_students_user ON public.students(user_id);
CREATE INDEX idx_students_number ON public.students(student_number);

CREATE INDEX idx_teachers_tenant ON public.teachers(tenant_id);
CREATE INDEX idx_teachers_user ON public.teachers(user_id);
CREATE INDEX idx_teachers_number ON public.teachers(teacher_number);

-- Trigger fonksiyonları
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();

CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON public.teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_updated_at();

COMMIT; 