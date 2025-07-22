-- İ-EP.APP Production Demo Database Setup
-- This script sets up the production demo tenant and sample data
-- Execute on production Supabase database

BEGIN;

-- 1. Create Production Demo Tenant
INSERT INTO tenants (
  id, 
  name, 
  subdomain,
  domain,
  settings, 
  is_active,
  plan_type,
  created_at, 
  updated_at
) VALUES (
  'demo-tenant-production-2025',
  'İstanbul Demo Ortaokulu',
  'demo',
  'demo.i-ep.app',
  '{
    "features": ["assignments", "attendance", "grades", "parent_communication", "analytics", "reports"],
    "theme": "professional",
    "language": "tr",
    "timezone": "Europe/Istanbul", 
    "academic_year": "2024-2025",
    "school_type": "ortaokul",
    "grade_levels": [5, 6, 7, 8],
    "demo_mode": true,
    "max_students": 200,
    "max_teachers": 20,
    "max_classes": 16,
    "auto_reset_data": true,
    "reset_interval_hours": 24,
    "school_info": {
      "address": "Demo Mahallesi, Eğitim Sokak No:1, İstanbul",
      "phone": "+90 212 555 0123",
      "email": "info@demo.i-ep.app",
      "website": "https://demo.i-ep.app",
      "principal": "Demo Müdür",
      "established": "2020"
    }
  }'::jsonb,
  true,
  'demo',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subdomain = EXCLUDED.subdomain,
  domain = EXCLUDED.domain,
  settings = EXCLUDED.settings,
  plan_type = EXCLUDED.plan_type,
  updated_at = NOW();

-- 2. Create Demo Classes (Turkish Middle School System: 5-8th grades)
INSERT INTO classes (id, tenant_id, name, grade_level, section, academic_year, capacity, is_active, created_at, updated_at)
VALUES 
  -- 5th Grade Classes
  ('demo-class-5a', 'demo-tenant-production-2025', '5-A Sınıfı', 5, 'A', '2024-2025', 30, true, NOW(), NOW()),
  ('demo-class-5b', 'demo-tenant-production-2025', '5-B Sınıfı', 5, 'B', '2024-2025', 28, true, NOW(), NOW()),
  
  -- 6th Grade Classes
  ('demo-class-6a', 'demo-tenant-production-2025', '6-A Sınıfı', 6, 'A', '2024-2025', 32, true, NOW(), NOW()),
  ('demo-class-6b', 'demo-tenant-production-2025', '6-B Sınıfı', 6, 'B', '2024-2025', 29, true, NOW(), NOW()),
  
  -- 7th Grade Classes
  ('demo-class-7a', 'demo-tenant-production-2025', '7-A Sınıfı', 7, 'A', '2024-2025', 31, true, NOW(), NOW()),
  ('demo-class-7b', 'demo-tenant-production-2025', '7-B Sınıfı', 7, 'B', '2024-2025', 33, true, NOW(), NOW()),
  
  -- 8th Grade Classes  
  ('demo-class-8a', 'demo-tenant-production-2025', '8-A Sınıfı', 8, 'A', '2024-2025', 27, true, NOW(), NOW()),
  ('demo-class-8b', 'demo-tenant-production-2025', '8-B Sınıfı', 8, 'B', '2024-2025', 30, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  updated_at = NOW();

-- 3. Create Turkish Curriculum Subjects
INSERT INTO subjects (id, tenant_id, name, code, grade_level, is_required, weekly_hours, created_at, updated_at)
VALUES
  -- 5th Grade Subjects
  ('demo-subj-5-matematik', 'demo-tenant-production-2025', 'Matematik', 'MAT', 5, true, 6, NOW(), NOW()),
  ('demo-subj-5-turkce', 'demo-tenant-production-2025', 'Türkçe', 'TUR', 5, true, 8, NOW(), NOW()),
  ('demo-subj-5-fen', 'demo-tenant-production-2025', 'Fen Bilimleri', 'FEN', 5, true, 4, NOW(), NOW()),
  ('demo-subj-5-sosyal', 'demo-tenant-production-2025', 'Sosyal Bilgiler', 'SOS', 5, true, 3, NOW(), NOW()),
  ('demo-subj-5-ingilizce', 'demo-tenant-production-2025', 'İngilizce', 'ING', 5, true, 4, NOW(), NOW()),
  
  -- 6th Grade Subjects
  ('demo-subj-6-matematik', 'demo-tenant-production-2025', 'Matematik', 'MAT', 6, true, 6, NOW(), NOW()),
  ('demo-subj-6-turkce', 'demo-tenant-production-2025', 'Türkçe', 'TUR', 6, true, 8, NOW(), NOW()),
  ('demo-subj-6-fen', 'demo-tenant-production-2025', 'Fen Bilimleri', 'FEN', 6, true, 4, NOW(), NOW()),
  ('demo-subj-6-sosyal', 'demo-tenant-production-2025', 'Sosyal Bilgiler', 'SOS', 6, true, 3, NOW(), NOW()),
  ('demo-subj-6-ingilizce', 'demo-tenant-production-2025', 'İngilizce', 'ING', 6, true, 4, NOW(), NOW()),
  
  -- 7th Grade Subjects
  ('demo-subj-7-matematik', 'demo-tenant-production-2025', 'Matematik', 'MAT', 7, true, 6, NOW(), NOW()),
  ('demo-subj-7-turkce', 'demo-tenant-production-2025', 'Türkçe', 'TUR', 7, true, 6, NOW(), NOW()),
  ('demo-subj-7-fen', 'demo-tenant-production-2025', 'Fen Bilimleri', 'FEN', 7, true, 5, NOW(), NOW()),
  ('demo-subj-7-sosyal', 'demo-tenant-production-2025', 'Sosyal Bilgiler', 'SOS', 7, true, 3, NOW(), NOW()),
  ('demo-subj-7-ingilizce', 'demo-tenant-production-2025', 'İngilizce', 'ING', 7, true, 4, NOW(), NOW()),
  
  -- 8th Grade Subjects
  ('demo-subj-8-matematik', 'demo-tenant-production-2025', 'Matematik', 'MAT', 8, true, 6, NOW(), NOW()),
  ('demo-subj-8-turkce', 'demo-tenant-production-2025', 'Türkçe', 'TUR', 8, true, 6, NOW(), NOW()),
  ('demo-subj-8-fen', 'demo-tenant-production-2025', 'Fen Bilimleri', 'FEN', 8, true, 5, NOW(), NOW()),
  ('demo-subj-8-sosyal', 'demo-tenant-production-2025', 'T.C. İnkılap Tarihi ve Atatürkçülük', 'TCITA', 8, true, 2, NOW(), NOW()),
  ('demo-subj-8-ingilizce', 'demo-tenant-production-2025', 'İngilizce', 'ING', 8, true, 4, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  weekly_hours = EXCLUDED.weekly_hours,
  updated_at = NOW();

-- 4. Create Sample Demo Students
INSERT INTO students (id, tenant_id, user_id, student_number, class_id, first_name, last_name, date_of_birth, gender, blood_type, parent_phone, parent_email, address, is_active, created_at, updated_at)
VALUES 
  -- 5-A Sınıfı Students
  ('demo-student-001', 'demo-tenant-production-2025', NULL, '2024001', 'demo-class-5a', 'Ahmet', 'Yılmaz', '2013-03-15', 'male', 'A+', '0532-111-1111', 'ahmet.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:1 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-002', 'demo-tenant-production-2025', NULL, '2024002', 'demo-class-5a', 'Ayşe', 'Demir', '2013-05-20', 'female', 'B+', '0532-222-2222', 'ayse.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:2 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-003', 'demo-tenant-production-2025', NULL, '2024003', 'demo-class-5a', 'Mehmet', 'Kaya', '2013-01-10', 'male', 'O+', '0532-333-3333', 'mehmet.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:3 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-004', 'demo-tenant-production-2025', NULL, '2024004', 'demo-class-5a', 'Fatma', 'Şahin', '2013-07-25', 'female', 'AB+', '0532-444-4444', 'fatma.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:4 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-005', 'demo-tenant-production-2025', NULL, '2024005', 'demo-class-5a', 'Ali', 'Öztürk', '2013-09-12', 'male', 'A-', '0532-555-5555', 'ali.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:5 Kadıköy/İstanbul', true, NOW(), NOW()),
  
  -- 6-A Sınıfı Students  
  ('demo-student-006', 'demo-tenant-production-2025', NULL, '2024006', 'demo-class-6a', 'Zeynep', 'Arslan', '2012-02-18', 'female', 'B-', '0532-666-6666', 'zeynep.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:6 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-007', 'demo-tenant-production-2025', NULL, '2024007', 'demo-class-6a', 'Mustafa', 'Çelik', '2012-04-22', 'male', 'O-', '0532-777-7777', 'mustafa.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:7 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-008', 'demo-tenant-production-2025', NULL, '2024008', 'demo-class-6a', 'Elif', 'Korkmaz', '2012-06-30', 'female', 'A+', '0532-888-8888', 'elif.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:8 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-009', 'demo-tenant-production-2025', NULL, '2024009', 'demo-class-6a', 'Emre', 'Güven', '2012-08-14', 'male', 'B+', '0532-999-9999', 'emre.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:9 Kadıköy/İstanbul', true, NOW(), NOW()),
  ('demo-student-010', 'demo-tenant-production-2025', NULL, '2024010', 'demo-class-6a', 'Selin', 'Yıldız', '2012-10-05', 'female', 'O+', '0532-101-1010', 'selin.veli@demo.i-ep.app', 'Demo Mah. Eğitim Sk. No:10 Kadıköy/İstanbul', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- 5. Create Sample Demo Teachers
INSERT INTO teachers (id, tenant_id, user_id, employee_number, first_name, last_name, email, phone, subject_specialization, hire_date, is_active, created_at, updated_at)
VALUES
  ('demo-teacher-001', 'demo-tenant-production-2025', NULL, 'OGR001', 'Aylin', 'Özkan', 'aylin.ozkan@demo.i-ep.app', '0532-100-0001', 'Matematik', '2020-09-01', true, NOW(), NOW()),
  ('demo-teacher-002', 'demo-tenant-production-2025', NULL, 'OGR002', 'Kemal', 'Aydın', 'kemal.aydin@demo.i-ep.app', '0532-100-0002', 'Türkçe', '2019-09-01', true, NOW(), NOW()),
  ('demo-teacher-003', 'demo-tenant-production-2025', NULL, 'OGR003', 'Sevgi', 'Koç', 'sevgi.koc@demo.i-ep.app', '0532-100-0003', 'Fen Bilimleri', '2021-09-01', true, NOW(), NOW()),
  ('demo-teacher-004', 'demo-tenant-production-2025', NULL, 'OGR004', 'Hakan', 'Doğan', 'hakan.dogan@demo.i-ep.app', '0532-100-0004', 'Sosyal Bilgiler', '2018-09-01', true, NOW(), NOW()),
  ('demo-teacher-005', 'demo-tenant-production-2025', NULL, 'OGR005', 'Deniz', 'Arslan', 'deniz.arslan@demo.i-ep.app', '0532-100-0005', 'İngilizce', '2022-09-01', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- 6. Create Sample Assignments
INSERT INTO assignments (id, tenant_id, title, description, subject_id, class_id, teacher_id, due_date, max_points, status, created_at, updated_at)
VALUES
  -- Mathematics Assignments
  ('demo-assign-001', 'demo-tenant-production-2025', 'Kesirler ve Ondalık Sayılar', 
   'Kesir ve ondalık sayılar arasında dönüşüm yapma, toplama ve çıkarma işlemleri', 
   'demo-subj-5-matematik', 'demo-class-5a', 'demo-teacher-001', 
   CURRENT_DATE + INTERVAL '7 days', 100, 'active', NOW(), NOW()),
   
  ('demo-assign-002', 'demo-tenant-production-2025', 'Geometrik Şekiller', 
   'Üçgen, kare, dikdörtgen ve dairenin alan ve çevre hesaplamaları', 
   'demo-subj-6-matematik', 'demo-class-6a', 'demo-teacher-001', 
   CURRENT_DATE + INTERVAL '5 days', 100, 'active', NOW(), NOW()),
  
  -- Turkish Language Assignments  
  ('demo-assign-003', 'demo-tenant-production-2025', 'Hikaye Yazma Etkinliği', 
   'Kendi yaşantınızdan bir anıyı hikaye formatında yazınız (En az 300 kelime)', 
   'demo-subj-5-turkce', 'demo-class-5a', 'demo-teacher-002', 
   CURRENT_DATE + INTERVAL '10 days', 100, 'active', NOW(), NOW()),
   
  ('demo-assign-004', 'demo-tenant-production-2025', 'Şiir Analizi', 
   'Nazim Hikmet''in bir şiirini seçerek tema, dil ve anlatım özelliklerini inceleyiniz', 
   'demo-subj-6-turkce', 'demo-class-6a', 'demo-teacher-002', 
   CURRENT_DATE + INTERVAL '12 days', 100, 'active', NOW(), NOW()),
  
  -- Science Assignments
  ('demo-assign-005', 'demo-tenant-production-2025', 'Bitkilerde Fotosentez', 
   'Bitkilerde fotosentez olayını açıklayarak önemini ve etkilerini araştırınız', 
   'demo-subj-5-fen', 'demo-class-5a', 'demo-teacher-003', 
   CURRENT_DATE + INTERVAL '8 days', 100, 'active', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 7. Create Sample Attendance Records (Recent 30 days)
INSERT INTO attendance_records (id, tenant_id, student_id, class_id, date, status, notes, created_at, updated_at)
SELECT 
  'demo-att-' || s.id || '-' || d.date_val,
  'demo-tenant-production-2025',
  s.id,
  s.class_id,
  d.date_val,
  CASE 
    WHEN RANDOM() < 0.85 THEN 'present'
    WHEN RANDOM() < 0.95 THEN 'late'
    ELSE 'absent'
  END,
  CASE 
    WHEN RANDOM() < 0.1 THEN 'Doktor raporu'
    ELSE NULL
  END,
  NOW(),
  NOW()
FROM 
  (SELECT id, class_id FROM students WHERE tenant_id = 'demo-tenant-production-2025' LIMIT 10) s
CROSS JOIN
  (SELECT CURRENT_DATE - INTERVAL '1 day' * i AS date_val 
   FROM generate_series(0, 29) i 
   WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '1 day' * i) BETWEEN 1 AND 5) d
ON CONFLICT (id) DO NOTHING;

-- 8. Create Sample Grades
INSERT INTO grades (id, tenant_id, student_id, subject_id, exam_type, grade_value, letter_grade, exam_date, weight, semester, academic_year, created_at, updated_at)
SELECT 
  'demo-grade-' || s.id || '-' || sub.id || '-' || et.exam_type,
  'demo-tenant-production-2025',
  s.id,
  sub.id,
  et.exam_type,
  (RANDOM() * 40 + 60)::numeric(5,2), -- Grades between 60-100
  CASE 
    WHEN (RANDOM() * 40 + 60) >= 85 THEN 'AA'
    WHEN (RANDOM() * 40 + 60) >= 75 THEN 'BA' 
    WHEN (RANDOM() * 40 + 60) >= 70 THEN 'BB'
    WHEN (RANDOM() * 40 + 60) >= 65 THEN 'CB'
    WHEN (RANDOM() * 40 + 60) >= 60 THEN 'CC'
    ELSE 'FF'
  END,
  CURRENT_DATE - INTERVAL '1 day' * (RANDOM() * 60)::int,
  et.weight,
  1,
  '2024-2025',
  NOW(),
  NOW()
FROM 
  (SELECT id FROM students WHERE tenant_id = 'demo-tenant-production-2025' LIMIT 10) s
CROSS JOIN
  (SELECT id FROM subjects WHERE tenant_id = 'demo-tenant-production-2025' AND grade_level IN (5, 6)) sub
CROSS JOIN
  (VALUES 
    ('midterm', 40),
    ('quiz', 20),
    ('homework', 20),
    ('participation', 20)
  ) et(exam_type, weight)
ON CONFLICT (id) DO NOTHING;

-- 9. Create Demo Domain Entry
INSERT INTO tenant_domains (id, tenant_id, domain, type, is_primary, is_verified, created_at, updated_at)
VALUES 
  ('demo-domain-001', 'demo-tenant-production-2025', 'demo.i-ep.app', 'custom', true, true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  is_verified = true,
  updated_at = NOW();

COMMIT;

-- Display Setup Summary
SELECT 
  'Demo Tenant Setup Complete' as status,
  (SELECT COUNT(*) FROM tenants WHERE id = 'demo-tenant-production-2025') as tenants,
  (SELECT COUNT(*) FROM classes WHERE tenant_id = 'demo-tenant-production-2025') as classes,
  (SELECT COUNT(*) FROM subjects WHERE tenant_id = 'demo-tenant-production-2025') as subjects,
  (SELECT COUNT(*) FROM students WHERE tenant_id = 'demo-tenant-production-2025') as students,
  (SELECT COUNT(*) FROM teachers WHERE tenant_id = 'demo-tenant-production-2025') as teachers,
  (SELECT COUNT(*) FROM assignments WHERE tenant_id = 'demo-tenant-production-2025') as assignments,
  (SELECT COUNT(*) FROM attendance_records WHERE tenant_id = 'demo-tenant-production-2025') as attendance_records,
  (SELECT COUNT(*) FROM grades WHERE tenant_id = 'demo-tenant-production-2025') as grades;