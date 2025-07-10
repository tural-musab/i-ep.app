-- Sınıf tablosu
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade_level INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    academic_year VARCHAR(9) NOT NULL, -- Format: 2023-2024
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sınıf-Öğrenci ilişki tablosu
CREATE TABLE IF NOT EXISTS public.class_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, transferred
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id) -- Bir öğrenci aynı sınıfa birden fazla kez eklenemez
);

-- Sınıf-Öğretmen ilişki tablosu
CREATE TABLE IF NOT EXISTS public.class_teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'subject_teacher', -- homeroom_teacher, subject_teacher
    subject VARCHAR(100), -- Sadece branş öğretmenleri için
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, teacher_id, subject) -- Bir öğretmen aynı sınıfta aynı dersi birden fazla veremez
);

-- RLS Politikaları
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teachers ENABLE ROW LEVEL SECURITY;

-- Tenant bazlı okuma politikaları
CREATE POLICY tenant_isolation_select_classes ON public.classes
    FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_select_class_students ON public.class_students
    FOR SELECT USING (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_select_class_teachers ON public.class_teachers
    FOR SELECT USING (tenant_id = auth.tenant_id());

-- Tenant bazlı yazma politikaları
CREATE POLICY tenant_isolation_insert_classes ON public.classes
    FOR INSERT WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_insert_class_students ON public.class_students
    FOR INSERT WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_insert_class_teachers ON public.class_teachers
    FOR INSERT WITH CHECK (tenant_id = auth.tenant_id());

-- Tenant bazlı güncelleme politikaları
CREATE POLICY tenant_isolation_update_classes ON public.classes
    FOR UPDATE USING (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_update_class_students ON public.class_students
    FOR UPDATE USING (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_update_class_teachers ON public.class_teachers
    FOR UPDATE USING (tenant_id = auth.tenant_id());

-- Tenant bazlı silme politikaları
CREATE POLICY tenant_isolation_delete_classes ON public.classes
    FOR DELETE USING (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_delete_class_students ON public.class_students
    FOR DELETE USING (tenant_id = auth.tenant_id());

CREATE POLICY tenant_isolation_delete_class_teachers ON public.class_teachers
    FOR DELETE USING (tenant_id = auth.tenant_id());

-- Indexes
CREATE INDEX idx_classes_tenant ON public.classes(tenant_id);
CREATE INDEX idx_class_students_tenant ON public.class_students(tenant_id);
CREATE INDEX idx_class_teachers_tenant ON public.class_teachers(tenant_id);
CREATE INDEX idx_classes_academic_year ON public.classes(academic_year);
CREATE INDEX idx_class_students_status ON public.class_students(status);
CREATE INDEX idx_class_teachers_role ON public.class_teachers(role);

-- Trigger fonksiyonu - updated_at alanını günceller
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları ekle
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_students_updated_at
    BEFORE UPDATE ON public.class_students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_teachers_updated_at
    BEFORE UPDATE ON public.class_teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 