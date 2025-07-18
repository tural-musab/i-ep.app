-- İ-EP.APP Demo Data Seed
-- Bu dosya Docker local Supabase için demo veri oluşturur
-- Dikkat: auth.users tablosuna doğrudan ekleme yapmıyoruz, bunun için ayrı script kullanacağız

-- Demo Tenant (Okul)
INSERT INTO tenants (id, name, domain, settings, created_at, updated_at) 
VALUES (
  'localhost-tenant',
  'Demo İlköğretim Okulu', 
  'localhost:3000',
  '{
    "features": ["assignments", "attendance", "grades", "parent_communication"],
    "theme": "default",
    "language": "tr",
    "timezone": "Europe/Istanbul"
  }'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Demo Classes (Sınıflar)
INSERT INTO classes (id, tenant_id, name, grade_level, section, academic_year, teacher_id, capacity, created_at, updated_at)
VALUES 
  ('class-5a', 'localhost-tenant', '5-A Sınıfı', 5, 'A', '2024-2025', NULL, 30, NOW(), NOW()),
  ('class-5b', 'localhost-tenant', '5-B Sınıfı', 5, 'B', '2024-2025', NULL, 30, NOW(), NOW()),
  ('class-6a', 'localhost-tenant', '6-A Sınıfı', 6, 'A', '2024-2025', NULL, 30, NOW(), NOW()),
  ('class-6b', 'localhost-tenant', '6-B Sınıfı', 6, 'B', '2024-2025', NULL, 30, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- Demo Students (Öğrenciler)
-- Not: user_id'ler sonradan auth oluşturulduktan sonra güncellenecek
INSERT INTO students (id, tenant_id, user_id, student_number, class_id, first_name, last_name, date_of_birth, gender, blood_type, parent_phone, parent_email, address, created_at, updated_at)
VALUES 
  -- 5-A Sınıfı Öğrencileri
  ('student-001', 'localhost-tenant', NULL, '2024001', 'class-5a', 'Ahmet', 'Yılmaz', '2013-03-15', 'male', 'A+', '0532-111-1111', 'ahmet.parent@demo.local', 'Demo Mah. No:1', NOW(), NOW()),
  ('student-002', 'localhost-tenant', NULL, '2024002', 'class-5a', 'Ayşe', 'Demir', '2013-05-20', 'female', 'B+', '0532-222-2222', 'ayse.parent@demo.local', 'Demo Mah. No:2', NOW(), NOW()),
  ('student-003', 'localhost-tenant', NULL, '2024003', 'class-5a', 'Mehmet', 'Kaya', '2013-01-10', 'male', 'O+', '0532-333-3333', 'mehmet.parent@demo.local', 'Demo Mah. No:3', NOW(), NOW()),
  ('student-004', 'localhost-tenant', NULL, '2024004', 'class-5a', 'Fatma', 'Şahin', '2013-07-25', 'female', 'AB+', '0532-444-4444', 'fatma.parent@demo.local', 'Demo Mah. No:4', NOW(), NOW()),
  ('student-005', 'localhost-tenant', NULL, '2024005', 'class-5a', 'Ali', 'Öztürk', '2013-09-12', 'male', 'A-', '0532-555-5555', 'ali.parent@demo.local', 'Demo Mah. No:5', NOW(), NOW()),
  
  -- 5-B Sınıfı Öğrencileri
  ('student-006', 'localhost-tenant', NULL, '2024006', 'class-5b', 'Zeynep', 'Arslan', '2013-02-18', 'female', 'B-', '0532-666-6666', 'zeynep.parent@demo.local', 'Demo Mah. No:6', NOW(), NOW()),
  ('student-007', 'localhost-tenant', NULL, '2024007', 'class-5b', 'Mustafa', 'Çelik', '2013-04-22', 'male', 'O-', '0532-777-7777', 'mustafa.parent@demo.local', 'Demo Mah. No:7', NOW(), NOW()),
  ('student-008', 'localhost-tenant', NULL, '2024008', 'class-5b', 'Elif', 'Aydın', '2013-06-30', 'female', 'AB-', '0532-888-8888', 'elif.parent@demo.local', 'Demo Mah. No:8', NOW(), NOW()),
  ('student-009', 'localhost-tenant', NULL, '2024009', 'class-5b', 'Hasan', 'Yıldız', '2013-08-14', 'male', 'A+', '0532-999-9999', 'hasan.parent@demo.local', 'Demo Mah. No:9', NOW(), NOW()),
  ('student-010', 'localhost-tenant', NULL, '2024010', 'class-5b', 'Esra', 'Koç', '2013-11-05', 'female', 'B+', '0532-000-0000', 'esra.parent@demo.local', 'Demo Mah. No:10', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET 
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Demo Subjects (Dersler)
INSERT INTO subjects (id, tenant_id, name, code, description, created_at, updated_at)
VALUES 
  ('subject-math', 'localhost-tenant', 'Matematik', 'MAT', 'Matematik dersi', NOW(), NOW()),
  ('subject-turkish', 'localhost-tenant', 'Türkçe', 'TUR', 'Türkçe dersi', NOW(), NOW()),
  ('subject-science', 'localhost-tenant', 'Fen Bilgisi', 'FEN', 'Fen Bilgisi dersi', NOW(), NOW()),
  ('subject-social', 'localhost-tenant', 'Sosyal Bilgiler', 'SOS', 'Sosyal Bilgiler dersi', NOW(), NOW()),
  ('subject-english', 'localhost-tenant', 'İngilizce', 'ING', 'İngilizce dersi', NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  updated_at = NOW();

-- Demo Assignments (Ödevler)
-- Not: teacher_id'ler sonradan auth oluşturulduktan sonra güncellenecek
INSERT INTO assignments (id, tenant_id, title, description, class_id, subject_id, teacher_id, due_date, status, total_points, created_at, updated_at)
VALUES 
  -- Matematik Ödevleri
  ('assign-001', 'localhost-tenant', 'Matematik - Kesirler', 'Kesirlerle ilgili problemleri çözün. Sayfa 45-48', 'class-5a', 'subject-math', NULL, NOW() + INTERVAL '3 days', 'active', 100, NOW(), NOW()),
  ('assign-002', 'localhost-tenant', 'Matematik - Doğal Sayılar', 'Doğal sayılar konusu alıştırmaları', 'class-5b', 'subject-math', NULL, NOW() + INTERVAL '5 days', 'active', 100, NOW(), NOW()),
  
  -- Türkçe Ödevleri
  ('assign-003', 'localhost-tenant', 'Türkçe - Kompozisyon', 'Tatil anılarınızı anlatan bir kompozisyon yazın', 'class-5a', 'subject-turkish', NULL, NOW() + INTERVAL '7 days', 'active', 100, NOW(), NOW()),
  ('assign-004', 'localhost-tenant', 'Türkçe - Okuma', 'Verilen metni okuyup soruları cevaplayın', 'class-5b', 'subject-turkish', NULL, NOW() + INTERVAL '4 days', 'active', 100, NOW(), NOW()),
  
  -- Fen Bilgisi Ödevleri
  ('assign-005', 'localhost-tenant', 'Fen - Canlılar', 'Canlıların özellikleri konusu araştırması', 'class-5a', 'subject-science', NULL, NOW() + INTERVAL '6 days', 'active', 100, NOW(), NOW())
ON CONFLICT (id) DO UPDATE
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Demo Attendance Records (Yoklama Kayıtları - Son 5 gün)
-- Not: marked_by sonradan auth oluşturulduktan sonra güncellenecek
INSERT INTO attendance (id, tenant_id, student_id, class_id, date, status, arrival_time, departure_time, marked_by, notes, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'localhost-tenant',
  s.id,
  s.class_id,
  d.date,
  CASE 
    WHEN random() < 0.85 THEN 'present'
    WHEN random() < 0.95 THEN 'late'
    ELSE 'absent'
  END,
  CASE 
    WHEN random() < 0.85 THEN d.date + TIME '08:00:00'
    WHEN random() < 0.95 THEN d.date + TIME '08:15:00'
    ELSE NULL
  END,
  CASE 
    WHEN random() < 0.85 THEN d.date + TIME '15:00:00'
    ELSE NULL
  END,
  NULL,
  CASE 
    WHEN random() < 0.1 THEN 'Hasta'
    ELSE NULL
  END,
  NOW(),
  NOW()
FROM students s
CROSS JOIN (
  SELECT CURRENT_DATE - INTERVAL '4 days' AS date
  UNION ALL SELECT CURRENT_DATE - INTERVAL '3 days'
  UNION ALL SELECT CURRENT_DATE - INTERVAL '2 days'
  UNION ALL SELECT CURRENT_DATE - INTERVAL '1 day'
  UNION ALL SELECT CURRENT_DATE
) d
WHERE s.tenant_id = 'localhost-tenant'
  AND d.date NOT IN (SELECT CURRENT_DATE - INTERVAL '2 days' WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '2 days') IN (0, 6))
  AND d.date NOT IN (SELECT CURRENT_DATE - INTERVAL '3 days' WHERE EXTRACT(DOW FROM CURRENT_DATE - INTERVAL '3 days') IN (0, 6))
ON CONFLICT DO NOTHING;

-- Demo Grades (Notlar)
-- Not: teacher_id sonradan auth oluşturulduktan sonra güncellenecek
INSERT INTO grades (id, tenant_id, student_id, assignment_id, grade, feedback, graded_by, graded_at, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'localhost-tenant',
  s.id,
  a.id,
  FLOOR(random() * 30 + 70)::numeric, -- 70-100 arası not
  CASE 
    WHEN random() < 0.3 THEN 'Çok güzel!'
    WHEN random() < 0.6 THEN 'İyi çalışma.'
    ELSE 'Başarılı.'
  END,
  NULL,
  NOW() - INTERVAL '1 day' * FLOOR(random() * 3),
  NOW(),
  NOW()
FROM students s
CROSS JOIN assignments a
WHERE s.tenant_id = 'localhost-tenant'
  AND a.tenant_id = 'localhost-tenant'
  AND s.class_id = a.class_id
  AND random() < 0.8 -- %80 öğrenci ödev teslim etmiş
ON CONFLICT DO NOTHING;

-- Demo Grade Management Records (Not Yönetimi)
-- Dönem notları için
INSERT INTO grade_management (
  id, tenant_id, student_id, subject_id, semester, academic_year,
  exam1_grade, exam2_grade, performance_grade, project_grade,
  semester_average, letter_grade, gpa_points,
  teacher_id, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  'localhost-tenant',
  s.id,
  sub.id,
  1, -- 1. dönem
  '2024-2025',
  FLOOR(random() * 30 + 70)::numeric, -- 1. sınav
  FLOOR(random() * 30 + 70)::numeric, -- 2. sınav
  FLOOR(random() * 20 + 80)::numeric, -- Performans
  FLOOR(random() * 20 + 80)::numeric, -- Proje
  NULL, -- semester_average hesaplanacak
  NULL, -- letter_grade hesaplanacak
  NULL, -- gpa_points hesaplanacak
  NULL, -- teacher_id sonradan
  NOW(),
  NOW()
FROM students s
CROSS JOIN subjects sub
WHERE s.tenant_id = 'localhost-tenant'
  AND sub.tenant_id = 'localhost-tenant'
ON CONFLICT DO NOTHING;

-- Semester average, letter grade ve GPA hesapla
UPDATE grade_management
SET 
  semester_average = ROUND((exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2), 2),
  letter_grade = CASE
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 90 THEN 'AA'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 85 THEN 'BA'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 80 THEN 'BB'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 75 THEN 'CB'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 70 THEN 'CC'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 65 THEN 'DC'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 60 THEN 'DD'
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 50 THEN 'FD'
    ELSE 'FF'
  END,
  gpa_points = CASE
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 90 THEN 4.0
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 85 THEN 3.5
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 80 THEN 3.0
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 75 THEN 2.5
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 70 THEN 2.0
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 65 THEN 1.5
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 60 THEN 1.0
    WHEN (exam1_grade * 0.3 + exam2_grade * 0.3 + performance_grade * 0.2 + project_grade * 0.2) >= 50 THEN 0.5
    ELSE 0.0
  END
WHERE semester_average IS NULL;

-- Demo Parent Messages (Veli İletişimi)
-- Not: sender_id ve receiver_id sonradan auth oluşturulduktan sonra güncellenecek
INSERT INTO parent_messages (
  id, tenant_id, sender_id, receiver_id, student_id, 
  subject, message, status, priority, 
  read_at, created_at, updated_at
)
VALUES
  ('msg-001', 'localhost-tenant', NULL, NULL, 'student-001', 
   'Ödev Hakkında', 'Ahmet''in matematik ödevinde yardıma ihtiyacı var.', 
   'unread', 'normal', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  ('msg-002', 'localhost-tenant', NULL, NULL, 'student-003', 
   'Devamsızlık Bilgisi', 'Mehmet yarın doktor randevusu nedeniyle gelmeyecek.', 
   'read', 'high', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  
  ('msg-003', 'localhost-tenant', NULL, NULL, 'student-006', 
   'Başarı Durumu', 'Zeynep''in son sınavdaki başarısından çok memnunuz.', 
   'read', 'normal', NOW(), NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week')
ON CONFLICT (id) DO UPDATE
SET 
  subject = EXCLUDED.subject,
  message = EXCLUDED.message,
  updated_at = NOW();

-- Başarı mesajı
DO $$
BEGIN
  RAISE NOTICE 'Demo data seed completed successfully!';
  RAISE NOTICE 'Created: 1 tenant, 4 classes, 10 students, 5 subjects, 5 assignments';
  RAISE NOTICE 'Generated: Attendance records, grades, and parent messages';
  RAISE NOTICE 'Note: User authentication data will be created separately';
END $$;
