-- ============================================================================
-- Simple Turkish Demo Data with Proper UUIDs
-- ============================================================================

-- Demo Classes
INSERT INTO public.classes (id, tenant_id, name, grade_level, capacity, academic_year, is_active) VALUES
    ('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, '4-A Sınıfı', 4, 30, '2024-2025', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Demo Admin
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active) VALUES
    ('a1111111-1111-1111-1111-111111111111'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'mudur@ataturkilkokulu.edu.tr', 
     'Mehmet', 
     'Yílmaz',
     'admin',
     '{"title": "Okul Müdürü", "phone": "+90 532 123 4567"}'::jsonb,
     true)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- Demo Teacher
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active) VALUES
    ('b2222222-2222-2222-2222-222222222222'::uuid, 
     'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 
     'ayse.koc@ataturkilkokulu.edu.tr', 
     'Ayşe', 
     'Koç',
     'teacher',
     '{"title": "Sınıf Öğretmeni", "department": "4-A Sınıfı"}'::jsonb,
     true)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- Demo Students
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active) VALUES
    ('c3333333-3333-3333-3333-333333333333'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'zeynep.yilmaz@gmail.com', 'Zeynep', 'Yılmaz', 'student', '{"student_number": "2024001"}'::jsonb, true),
    ('d4444444-4444-4444-4444-444444444444'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'ahmet.celik@gmail.com', 'Ahmet', 'Çelik', 'student', '{"student_number": "2024002"}'::jsonb, true),
    ('e5555555-5555-5555-5555-555555555555'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'elif.ozdemir@gmail.com', 'Elif', 'Özdemir', 'student', '{"student_number": "2024003"}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- Demo Parent
INSERT INTO public.users (id, tenant_id, email, first_name, last_name, role, settings, is_active) VALUES
    ('f6666666-6666-6666-6666-666666666666'::uuid, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'mehmet.yilmaz.veli@gmail.com', 'Mehmet', 'Yılmaz (Veli)', 'parent', '{"occupation": "Mühendis", "children": ["2024001"]}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;

-- Students Table
INSERT INTO public.students (id, tenant_id, user_id, student_number, first_name, last_name, birth_date, gender, is_active) VALUES
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'c3333333-3333-3333-3333-333333333333'::uuid, '2024001', 'Zeynep', 'Yílmaz', '2015-03-15', 'F', true),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'd4444444-4444-4444-4444-444444444444'::uuid, '2024002', 'Ahmet', 'Çelik', '2015-05-22', 'M', true),
    (gen_random_uuid(), 'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid, 'e5555555-5555-5555-5555-555555555555'::uuid, '2024003', 'Elif', 'Özdemir', '2015-08-10', 'F', true)
ON CONFLICT (student_number) DO UPDATE SET first_name = EXCLUDED.first_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Simple Turkish Demo Data Created!';
    RAISE NOTICE '👤 Admin: mudur@ataturkilkokulu.edu.tr';
    RAISE NOTICE '👨‍🏫 Teacher: ayse.koc@ataturkilkokulu.edu.tr';
    RAISE NOTICE '👧 Students: zeynep.yilmaz@gmail.com, ahmet.celik@gmail.com, elif.ozdemir@gmail.com';
    RAISE NOTICE '👨‍👩‍👧 Parent: mehmet.yilmaz.veli@gmail.com';
    RAISE NOTICE '🔑 Demo Password: demo123';
END
$$;