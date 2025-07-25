-- ============================================================================
-- İ-EP.APP Turkish Educational Demo Data Generator (CORRECTED)
-- File: scripts/generate-turkish-demo-data-corrected.sql
-- Author: Claude Code Assistant (DevOps Persona)
-- Date: 2025-07-24
-- Version: 1.1.0
-- Description: Realistic Turkish educational demo data matching actual schema
-- ============================================================================

-- ============================================================================
-- DEMO CLASSES (SINIFLAR) - Using correct schema
-- ============================================================================

-- Insert demo classes (4. Sınıf)
INSERT INTO public.classes (id, tenant_id, name, grade_level, capacity, academic_year, is_active, created_at) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-A Sınıfı', 4, 30, '2024-2025', true, NOW()),
    ('b2c3d4e5-f6g7-8901-bcde-f23456789012'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-B Sınıfı', 4, 30, '2024-2025', true, NOW()),
    ('c3d4e5f6-g7h8-9012-cdef-345678901234'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-C Sınıfı', 4, 30, '2024-2025', true, NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    grade_level = EXCLUDED.grade_level,
    updated_at = NOW();

-- ============================================================================
-- TURKISH DEMO USERS - Using correct schema (first_name, last_name)
-- ============================================================================

-- Demo Admin User (Müdür)
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active, created_at) VALUES
    ('admin-demo-1234-5678-9012345678ab'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'mudur@ataturkilkokulu.edu.tr', 
     'Mehmet', 
     'Yılmaz',
     'admin',
     '{
         "title": "Okul Müdürü",
         "phone": "+90 532 123 4567",
         "department": "Yönetim",
         "hire_date": "2020-09-01"
     }'::jsonb,
     true, 
     NOW())
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Demo Teachers
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active, created_at) VALUES
    ('teacher-demo-1234-5678-901234567890'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'ayse.koc@ataturkilkokulu.edu.tr', 
     'Ayşe', 
     'Koç',
     'teacher',
     '{
         "title": "Sınıf Öğretmeni",
         "phone": "+90 532 234 5678",
         "department": "4-A Sınıfı",
         "hire_date": "2018-09-01",
         "specialization": "Sınıf Öğretmenliği"
     }'::jsonb,
     true, 
     NOW()),
    ('teacher-demo-2345-6789-012345678901'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'fatma.demir@ataturkilkokulu.edu.tr', 
     'Fatma', 
     'Demir',
     'teacher',
     '{
         "title": "Sınıf Öğretmeni",
         "phone": "+90 532 345 6789",
         "department": "4-B Sınıfı",
         "hire_date": "2019-09-01",
         "specialization": "Sınıf Öğretmenliği"
     }'::jsonb,
     true, 
     NOW()),
    ('teacher-demo-3456-7890-123456789012'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'ali.ozkan@ataturkilkokulu.edu.tr', 
     'Ali', 
     'Özkan',
     'teacher',
     '{
         "title": "Beden Eğitimi Öğretmeni",
         "phone": "+90 532 456 7890",
         "department": "Beden Eğitimi",
         "hire_date": "2017-09-01",
         "specialization": "Beden Eğitimi ve Spor"
     }'::jsonb,
     true, 
     NOW())
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Demo Students
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active, created_at) VALUES
    ('student-demo-1111-2222-333344445555'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'zeynep.yilmaz@gmail.com', 
     'Zeynep', 
     'Yılmaz',
     'student',
     '{
         "student_number": "2024001",
         "birth_date": "2015-03-15",
         "parent_phone": "+90 532 111 2222",
         "address": "Fenerbahçe Mahallesi, İstanbul"
     }'::jsonb,
     true, 
     NOW()),
    ('student-demo-2222-3333-444455556666'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'ahmet.celik@gmail.com', 
     'Ahmet', 
     'Çelik',
     'student',
     '{
         "student_number": "2024002",
         "birth_date": "2015-05-22",
         "parent_phone": "+90 532 222 3333",
         "address": "Kadıköy Merkez, İstanbul"
     }'::jsonb,
     true, 
     NOW()),
    ('student-demo-3333-4444-555566667777'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'elif.ozdemir@gmail.com', 
     'Elif', 
     'Özdemir',
     'student',
     '{
         "student_number": "2024003",
         "birth_date": "2015-08-10",
         "parent_phone": "+90 532 333 4444",
         "address": "Moda Mahallesi, İstanbul"
     }'::jsonb,
     true, 
     NOW()),
    ('student-demo-4444-5555-666677778888'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'can.kaya@gmail.com', 
     'Can', 
     'Kaya',
     'student',
     '{
         "student_number": "2024004",
         "birth_date": "2015-01-30",
         "parent_phone": "+90 532 444 5555",
         "address": "Çamlıca Mahallesi, İstanbul"
     }'::jsonb,
     true, 
     NOW()),
    ('student-demo-5555-6666-777788889999'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'sude.arslan@gmail.com', 
     'Sude', 
     'Arslan',
     'student',
     '{
         "student_number": "2024005",
         "birth_date": "2015-11-12",
         "parent_phone": "+90 532 555 6666",
         "address": "Acıbadem Mahallesi, İstanbul"
     }'::jsonb,
     true, 
     NOW())
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Demo Parents
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active, created_at) VALUES
    ('parent-demo-1111-2222-333344445555'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'mehmet.yilmaz.veli@gmail.com', 
     'Mehmet', 
     'Yılmaz (Veli)',
     'parent',
     '{
         "occupation": "Mühendis",
         "phone": "+90 532 111 2222",
         "children": ["2024001"],
         "emergency_contact": "Ayşe Yılmaz - +90 532 111 2223"
     }'::jsonb,
     true, 
     NOW()),
    ('parent-demo-2222-3333-444455556666'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'ibrahim.celik.veli@gmail.com', 
     'İbrahim', 
     'Çelik (Veli)',
     'parent',
     '{
         "occupation": "Öğretmen",
         "phone": "+90 532 222 3333",
         "children": ["2024002"],
         "emergency_contact": "Fatma Çelik - +90 532 222 3334"
     }'::jsonb,
     true, 
     NOW())
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ============================================================================
-- STUDENTS TABLE INTEGRATION - Using correct schema
-- ============================================================================

-- Insert students into students table
INSERT INTO public.students (id, tenant_id, user_id, student_number, first_name, last_name, birth_date, gender, additional_info, is_active, created_at) VALUES
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-1111-2222-333344445555'::uuid, '2024001', 'Zeynep', 'Yılmaz', '2015-03-15', 'F', '{"class_name": "4-A", "enrollment_date": "2024-09-01"}'::jsonb, true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-2222-3333-444455556666'::uuid, '2024002', 'Ahmet', 'Çelik', '2015-05-22', 'M', '{"class_name": "4-A", "enrollment_date": "2024-09-01"}'::jsonb, true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-3333-4444-555566667777'::uuid, '2024003', 'Elif', 'Özdemir', '2015-08-10', 'F', '{"class_name": "4-A", "enrollment_date": "2024-09-01"}'::jsonb, true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-4444-5555-666677778888'::uuid, '2024004', 'Can', 'Kaya', '2015-01-30', 'M', '{"class_name": "4-A", "enrollment_date": "2024-09-01"}'::jsonb, true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-5555-6666-777788889999'::uuid, '2024005', 'Sude', 'Arslan', '2015-11-12', 'F', '{"class_name": "4-A", "enrollment_date": "2024-09-01"}'::jsonb, true, NOW())
ON CONFLICT (student_number) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- ============================================================================
-- CLASS STUDENTS RELATIONSHIP
-- ============================================================================

-- Link students to classes
INSERT INTO public.class_students (id, tenant_id, class_id, student_id, created_at) 
SELECT 
    gen_random_uuid(),
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    s.id,
    NOW()
FROM public.students s
WHERE s.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TURKISH GRADE CONFIGURATIONS (NOT YAPILANDIRMASI)
-- ============================================================================

-- Update grade configurations to use existing class
UPDATE public.grade_configurations 
SET class_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    updated_at = NOW()
WHERE tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
AND class_id IS NULL;

-- ============================================================================
-- REALISTIC TURKISH DEMO GRADES (GERÇEKÇİ NOTLAR) - CORRECTED
-- ============================================================================

-- Generate realistic grades for students - Corrected approach
DO $$
DECLARE
    student_record RECORD;
    subject_record RECORD;
    grade_data RECORD;
BEGIN
    -- Loop through students and subjects to create realistic grades
    FOR student_record IN 
        SELECT s.id as student_id, s.first_name, s.last_name
        FROM public.students s
        WHERE s.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
    LOOP
        FOR subject_record IN 
            SELECT sub.id as subject_id, sub.name as subject_name
            FROM public.subjects sub
            WHERE sub.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
            LIMIT 3 -- Türkçe, Matematik, Fen Bilgisi
        LOOP
            -- Insert exam grade for each student-subject pair
            INSERT INTO public.grades (
                id, tenant_id, student_id, class_id, subject_id, teacher_id,
                grade_type, grade_value, max_grade, weight,
                exam_name, description, semester, academic_year, grade_date, created_at
            ) VALUES (
                gen_random_uuid(),
                'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
                student_record.student_id,
                'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
                subject_record.subject_id,
                'teacher-demo-1234-5678-901234567890'::uuid,
                'exam',
                CASE 
                    WHEN student_record.first_name = 'Zeynep' THEN 85
                    WHEN student_record.first_name = 'Elif' THEN 92
                    WHEN student_record.first_name = 'Sude' THEN 86
                    WHEN student_record.first_name = 'Can' THEN 79
                    ELSE 72
                END,
                100,
                0.4,
                '1. Yazılı Sınavı',
                CASE 
                    WHEN student_record.first_name = 'Zeynep' THEN 'Çok başarılı bir sınav performansı'
                    WHEN student_record.first_name = 'Elif' THEN 'Mükemmel sınav performansı'
                    WHEN student_record.first_name = 'Sude' THEN 'Başarılı sınav performansı'
                    WHEN student_record.first_name = 'Can' THEN 'İyi bir çalışma'
                    ELSE 'Gelişime açık performans'
                END,
                1,
                '2024-2025',
                '2024-10-15'::date,
                NOW()
            ) ON CONFLICT (tenant_id, student_id, subject_id, grade_type, exam_name, semester, academic_year) DO NOTHING;
            
            -- Insert homework grade
            INSERT INTO public.grades (
                id, tenant_id, student_id, class_id, subject_id, teacher_id,
                grade_type, grade_value, max_grade, weight,
                exam_name, description, semester, academic_year, grade_date, created_at
            ) VALUES (
                gen_random_uuid(),
                'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
                student_record.student_id,
                'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
                subject_record.subject_id,
                'teacher-demo-1234-5678-901234567890'::uuid,
                'homework',
                CASE 
                    WHEN student_record.first_name = 'Zeynep' THEN 90
                    WHEN student_record.first_name = 'Elif' THEN 94
                    WHEN student_record.first_name = 'Sude' THEN 89
                    WHEN student_record.first_name = 'Can' THEN 82
                    ELSE 78
                END,
                100,
                0.2,
                'Haftalık Ödevler',
                'Ödev çalışması değerlendirmesi',
                1,
                '2024-2025',
                '2024-10-01'::date,
                NOW()
            ) ON CONFLICT (tenant_id, student_id, subject_id, grade_type, exam_name, semester, academic_year) DO NOTHING;
        END LOOP;
    END LOOP;
END
$$;

-- ============================================================================
-- UPDATE GRADE CALCULATIONS
-- ============================================================================

-- Update grade calculations for all students
DO $$
DECLARE
    student_record RECORD;
    subject_record RECORD;
BEGIN
    FOR student_record IN 
        SELECT s.id as student_id
        FROM public.students s
        WHERE s.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
    LOOP
        FOR subject_record IN 
            SELECT sub.id as subject_id
            FROM public.subjects sub
            WHERE sub.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
            LIMIT 3
        LOOP
            PERFORM update_grade_calculations(
                student_record.student_id,
                subject_record.subject_id,
                1,
                '2024-2025',
                'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
            );
        END LOOP;
    END LOOP;
END
$$;

-- ============================================================================
-- REFRESH MATERIALIZED VIEW
-- ============================================================================

-- Refresh the grade statistics materialized view
REFRESH MATERIALIZED VIEW grade_statistics_mv;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 CORRECTED Turkish Educational Demo Data Generated Successfully!';
    RAISE NOTICE '🏫 School: Atatürk İlkokulu (demo.i-ep.app)';
    RAISE NOTICE '👥 Users: 1 Admin, 3 Teachers, 5 Students, 2 Parents';
    RAISE NOTICE '📚 Subjects: Turkish curriculum subjects';
    RAISE NOTICE '🏛️ Classes: 3 classes (4-A, 4-B, 4-C)';
    RAISE NOTICE '📊 Grades: Realistic grade data with Turkish education system';
    RAISE NOTICE '🔐 Demo Login: Use any email above with password: demo123';
    RAISE NOTICE '🌐 Access: localhost:3000 (demo tenant)';
END
$$;