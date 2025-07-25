-- ============================================================================
-- İ-EP.APP Turkish Educational Demo Data Generator
-- File: scripts/generate-turkish-demo-data.sql
-- Author: Claude Code Assistant (DevOps Persona)
-- Date: 2025-07-24
-- Version: 1.0.0
-- Description: Realistic Turkish educational demo data for production demo
-- ============================================================================

-- Clean up existing demo data (optional)
-- DELETE FROM public.grades WHERE tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'demo');
-- DELETE FROM public.grade_configurations WHERE tenant_id = (SELECT id FROM public.tenants WHERE subdomain = 'demo');

-- ============================================================================
-- TURKISH DEMO TENANT & SCHOOL SETUP
-- ============================================================================

-- Insert demo tenant (Atatürk İlkokulu)
INSERT INTO public.tenants (id, name, subdomain, settings, is_active, created_at)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'Atatürk İlkokulu',
    'demo',
    '{
        "school_name": "Atatürk İlkokulu",
        "address": "Cumhuriyet Mahallesi, Atatürk Caddesi No:15, Kadıköy/İstanbul",
        "phone": "+90 216 555 0123",
        "email": "info@ataturkilkokulu.edu.tr",
        "language": "tr-TR",
        "academic_year": "2024-2025",
        "semester": 1
    }'::jsonb,
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- ============================================================================
-- TURKISH SUBJECTS (DERSLER)
-- ============================================================================

-- Insert Turkish curriculum subjects
INSERT INTO public.subjects (id, tenant_id, name, code, credit_hours, description, is_active, created_at) VALUES
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Türkçe', 'TUR', 5, 'Ana dili Türkçe dersi', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Matematik', 'MAT', 5, 'Temel matematik dersi', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Fen Bilgisi', 'FEN', 3, 'Temel fen bilgisi dersi', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Sosyal Bilgiler', 'SOS', 3, 'Sosyal bilgiler dersi', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'İngilizce', 'ING', 3, 'Yabancı dil İngilizce', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Beden Eğitimi', 'BED', 2, 'Beden eğitimi ve spor', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Müzik', 'MUZ', 2, 'Müzik dersi', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'Resim', 'RES', 2, 'Görsel sanatlar dersi', true, NOW())
ON CONFLICT (tenant_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    credit_hours = EXCLUDED.credit_hours,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- TURKISH DEMO CLASSES (SINIFLAR)
-- ============================================================================

-- Insert demo classes (4. Sınıf)
INSERT INTO public.classes (id, tenant_id, name, grade_level, section, academic_year, is_active, created_at) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-A Sınıfı', 4, 'A', '2024-2025', true, NOW()),
    ('b2c3d4e5-f6g7-8901-bcde-f23456789012'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-B Sınıfı', 4, 'B', '2024-2025', true, NOW()),
    ('c3d4e5f6-g7h8-9012-cdef-345678901234'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-C Sınıfı', 4, 'C', '2024-2025', true, NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    grade_level = EXCLUDED.grade_level,
    updated_at = NOW();

-- ============================================================================
-- TURKISH DEMO USERS (ÖĞRETMENLER, ÖĞRENCİLER, VELİLER)
-- ============================================================================

-- Demo Admin User (Müdür)
INSERT INTO public.users (id, tenant_id, email, name, role, metadata, is_active, created_at) VALUES
    ('admin-demo-1234-5678-9012345678ab'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'mudur@ataturkilkokulu.edu.tr', 
     'Mehmet Yılmaz', 
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
    name = EXCLUDED.name,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Demo Teachers (Öğretmenler)
INSERT INTO public.users (id, tenant_id, email, name, role, metadata, is_active, created_at) VALUES
    ('teacher-demo-1234-5678-901234567890'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'ayse.koc@ataturkilkokulu.edu.tr', 
     'Ayşe Koç', 
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
     'Fatma Demir', 
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
     'Ali Özkan', 
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
    name = EXCLUDED.name,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Demo Students (Öğrenciler) - 4-A Sınıfı
INSERT INTO public.users (id, tenant_id, email, name, role, metadata, is_active, created_at) VALUES
    ('student-demo-1111-2222-333344445555'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'zeynep.yilmaz@gmail.com', 
     'Zeynep Yılmaz', 
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
     'Ahmet Çelik', 
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
     'Elif Özdemir', 
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
     'Can Kaya', 
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
     'Sude Arslan', 
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
    name = EXCLUDED.name,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Demo Parents (Veliler)
INSERT INTO public.users (id, tenant_id, email, name, role, metadata, is_active, created_at) VALUES
    ('parent-demo-1111-2222-333344445555'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'mehmet.yilmaz.veli@gmail.com', 
     'Mehmet Yılmaz (Veli)', 
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
     'İbrahim Çelik (Veli)', 
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
    name = EXCLUDED.name,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- ============================================================================
-- STUDENTS TABLE INTEGRATION
-- ============================================================================

-- Insert students into students table
INSERT INTO public.students (id, tenant_id, user_id, student_number, class_id, grade_level, enrollment_date, is_active, created_at) VALUES
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-1111-2222-333344445555'::uuid, '2024001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 4, '2024-09-01', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-2222-3333-444455556666'::uuid, '2024002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 4, '2024-09-01', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-3333-4444-555566667777'::uuid, '2024003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 4, '2024-09-01', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-4444-5555-666677778888'::uuid, '2024004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 4, '2024-09-01', true, NOW()),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'student-demo-5555-6666-777788889999'::uuid, '2024005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 4, '2024-09-01', true, NOW())
ON CONFLICT (tenant_id, student_number) DO UPDATE SET
    class_id = EXCLUDED.class_id,
    enrollment_date = EXCLUDED.enrollment_date,
    updated_at = NOW();

-- ============================================================================
-- TURKISH GRADE CONFIGURATIONS (NOT YAPILANDIRMASI)
-- ============================================================================

-- Grade configurations for Turkish curriculum
INSERT INTO public.grade_configurations (
    id, tenant_id, subject_id, class_id, grade_type, weight, 
    min_grade, max_grade, passing_grade, honor_roll_grade, 
    is_required, allows_makeup, semester, academic_year, created_at
)
SELECT 
    gen_random_uuid(),
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    s.id,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    config.grade_type,
    config.weight,
    0,
    100,
    50,
    85,
    config.is_required,
    config.allows_makeup,
    1,
    '2024-2025',
    NOW()
FROM public.subjects s
CROSS JOIN (
    VALUES 
        ('exam', 0.40, true, true),
        ('homework', 0.20, true, false),
        ('project', 0.20, true, false),
        ('participation', 0.10, true, false),
        ('quiz', 0.10, true, false)
) AS config(grade_type, weight, is_required, allows_makeup)
WHERE s.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
ON CONFLICT (tenant_id, subject_id, class_id, grade_type, semester, academic_year) DO UPDATE SET
    weight = EXCLUDED.weight,
    updated_at = NOW();

-- ============================================================================
-- REALISTIC TURKISH DEMO GRADES (GERÇEKÇİ NOTLAR)
-- ============================================================================

-- Generate realistic grades for students
INSERT INTO public.grades (
    id, tenant_id, student_id, class_id, subject_id, teacher_id,
    grade_type, grade_value, max_grade, weight,
    exam_name, description, semester, academic_year, grade_date, created_at
)
SELECT 
    gen_random_uuid(),
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    st.id,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
    s.id,
    'teacher-demo-1234-5678-901234567890'::uuid, -- Ayşe Koç
    grades_data.grade_type,
    grades_data.grade_value,
    100,
    grades_data.weight,
    grades_data.exam_name,
    grades_data.description,
    1,
    '2024-2025',
    grades_data.grade_date,
    NOW()
FROM public.students st
CROSS JOIN public.subjects s
CROSS JOIN (
    VALUES 
        -- Zeynep Yılmaz (Başarılı öğrenci)
        ('student-demo-1111-2222-333344445555'::uuid, 'exam', 85, 0.4, '1. Yazılı Sınavı', 'Çok başarılı bir sınav performansı', '2024-10-15'::date),
        ('student-demo-1111-2222-333344445555'::uuid, 'homework', 90, 0.2, 'Haftalık Ödevler', 'Ödevlerini zamanında ve özenle yapıyor', '2024-10-01'::date),
        ('student-demo-1111-2222-333344445555'::uuid, 'project', 95, 0.2, 'Bilim Projesi', 'Yaratıcı ve araştırmacı bir proje', '2024-11-01'::date),
        ('student-demo-1111-2222-333344445555'::uuid, 'participation', 88, 0.1, 'Sınıf İçi Katılım', 'Derslere aktif katılım gösteriyor', '2024-11-15'::date),
        ('student-demo-1111-2222-333344445555'::uuid, 'quiz', 87, 0.1, 'Kısa Sınavlar', 'Düzenli çalışmasının meyvesi', '2024-11-20'::date),
        
        -- Ahmet Çelik (Orta seviye)
        ('student-demo-2222-3333-444455556666'::uuid, 'exam', 72, 0.4, '1. Yazılı Sınavı', 'Gelişime açık performans', '2024-10-15'::date),
        ('student-demo-2222-3333-444455556666'::uuid, 'homework', 78, 0.2, 'Haftalık Ödevler', 'Ödevlerini yapıyor ancak daha özenli olabilir', '2024-10-01'::date),
        ('student-demo-2222-3333-444455556666'::uuid, 'project', 80, 0.2, 'Bilim Projesi', 'İyi bir çalışma', '2024-11-01'::date),
        ('student-demo-2222-3333-444455556666'::uuid, 'participation', 75, 0.1, 'Sınıf İçi Katılım', 'Derse katılımını artırabilir', '2024-11-15'::date),
        ('student-demo-2222-3333-444455556666'::uuid, 'quiz', 74, 0.1, 'Kısa Sınavlar', 'Düzenli çalışma öneriliyor', '2024-11-20'::date),
        
        -- Elif Özdemir (Çok başarılı)
        ('student-demo-3333-4444-555566667777'::uuid, 'exam', 92, 0.4, '1. Yazılı Sınavı', 'Mükemmel sınav performansı', '2024-10-15'::date),
        ('student-demo-3333-4444-555566667777'::uuid, 'homework', 94, 0.2, 'Haftalık Ödevler', 'Örnek ödev çalışmaları', '2024-10-01'::date),
        ('student-demo-3333-4444-555566667777'::uuid, 'project', 96, 0.2, 'Bilim Projesi', 'Çok yaratıcı ve detaylı proje', '2024-11-01'::date),
        ('student-demo-3333-4444-555566667777'::uuid, 'participation', 90, 0.1, 'Sınıf İçi Katılım', 'Sınıfın en aktif öğrencisi', '2024-11-15'::date),
        ('student-demo-3333-4444-555566667777'::uuid, 'quiz', 91, 0.1, 'Kısa Sınavlar', 'Sürekli yüksek performans', '2024-11-20'::date),
        
        -- Can Kaya (Orta-iyi seviye)
        ('student-demo-4444-5555-666677778888'::uuid, 'exam', 79, 0.4, '1. Yazılı Sınavı', 'İyi bir çalışma', '2024-10-15'::date),
        ('student-demo-4444-5555-666677778888'::uuid, 'homework', 82, 0.2, 'Haftalık Ödevler', 'Ödevlerini düzenli yapıyor', '2024-10-01'::date),
        ('student-demo-4444-5555-666677778888'::uuid, 'project', 85, 0.2, 'Bilim Projesi', 'Başarılı bir proje çalışması', '2024-11-01'::date),
        ('student-demo-4444-5555-666677778888'::uuid, 'participation', 77, 0.1, 'Sınıf İçi Katılım', 'Derse iyi katılım gösteriyor', '2024-11-15'::date),
        ('student-demo-4444-5555-666677788888'::uuid, 'quiz', 80, 0.1, 'Kısa Sınavlar', 'İstikrarlı performans', '2024-11-20'::date),
        
        -- Sude Arslan (Başarılı)
        ('student-demo-5555-6666-777788889999'::uuid, 'exam', 86, 0.4, '1. Yazılı Sınavı', 'Başarılı sınav performansı', '2024-10-15'::date),
        ('student-demo-5555-6666-777788889999'::uuid, 'homework', 89, 0.2, 'Haftalık Ödevler', 'Özenli ödev çalışmaları', '2024-10-01'::date),
        ('student-demo-5555-6666-777788889999'::uuid, 'project', 91, 0.2, 'Bilim Projesi', 'Detaylı ve başarılı proje', '2024-11-01'::date),
        ('student-demo-5555-6666-777788889999'::uuid, 'participation', 84, 0.1, 'Sínıf İçi Katılım', 'Aktif ve katkılı katılım', '2024-11-15'::date),
        ('student-demo-5555-6666-777788889999'::uuid, 'quiz', 85, 0.1, 'Kısa Sınavlar', 'Düzenli başarı', '2024-11-20'::date)
) AS grades_data(student_user_id, grade_type, grade_value, weight, exam_name, description, grade_date)
WHERE st.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
AND s.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
AND st.user_id = grades_data.student_user_id
ON CONFLICT (tenant_id, student_id, subject_id, grade_type, exam_name, semester, academic_year) DO UPDATE SET
    grade_value = EXCLUDED.grade_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- GRADE COMMENTS (ÖĞRETMEN YORUMLARı)
-- ============================================================================

-- Insert teacher comments on grades
INSERT INTO public.grade_comments (
    id, tenant_id, grade_id, teacher_id, comment_text, comment_type,
    is_visible_to_student, is_visible_to_parent, created_at
)
SELECT 
    gen_random_uuid(),
    g.tenant_id,
    g.id,
    g.teacher_id,
    comments.comment_text,
    comments.comment_type,
    true,
    true,
    NOW()
FROM public.grades g
CROSS JOIN (
    VALUES 
        ('Çok başarılı bir performans gösterdi. Böyle devam etmesi tavsiye edilir.', 'strength'),
        ('Derse katılımını artırırsa daha başarılı olabilir.', 'improvement'),
        ('Ödevlerini daha özenli yapması önerilir.', 'recommendation'),
        ('Sınıfın en başarılı öğrencilerinden biri.', 'strength'),
        ('Ek çalışma ile daha yüksek notlar alabilir.', 'improvement')
) AS comments(comment_text, comment_type)
WHERE g.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
AND g.grade_type = 'exam'
LIMIT 15 -- Limit to prevent too many comments
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRADE CALCULATIONS UPDATE
-- ============================================================================

-- Update grade calculations for all students
SELECT update_grade_calculations(
    st.id,
    s.id,
    1,
    '2024-2025',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
)
FROM public.students st
CROSS JOIN public.subjects s
WHERE st.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid
AND s.tenant_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid;

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
    RAISE NOTICE '🎉 Turkish Educational Demo Data Generated Successfully!';
    RAISE NOTICE '🏫 School: Atatürk İlkokulu (demo.i-ep.app)';
    RAISE NOTICE '👥 Users: 1 Admin, 3 Teachers, 5 Students, 2 Parents';
    RAISE NOTICE '📚 Subjects: 8 Turkish curriculum subjects (Türkçe, Matematik, etc.)';
    RAISE NOTICE '🏛️ Classes: 3 classes (4-A, 4-B, 4-C)';
    RAISE NOTICE '📊 Grades: Realistic grade data with Turkish education system';
    RAISE NOTICE '💬 Comments: Teacher feedback in Turkish';
    RAISE NOTICE '🔐 Demo Login: Use any email above with password: demo123';
    RAISE NOTICE '🌐 Access: https://demo.i-ep.app or localhost:3000';
END
$$;