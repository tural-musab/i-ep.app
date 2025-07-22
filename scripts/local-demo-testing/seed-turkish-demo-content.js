#!/usr/bin/env node

/**
 * İ-EP.APP Turkish Demo Content Seeding Script
 * Seeds the database with realistic Turkish educational content
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const DEMO_TENANT_ID = 'istanbul-demo-ortaokulu';

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Turkish Educational Content Data
const DEMO_CONTENT = {
  school: {
    name: 'Istanbul Demo Ortaokulu',
    address: 'Kadıköy, Istanbul, Türkiye',
    phone: '+90 216 555 0123',
    email: 'info@istanbul-demo-ortaokulu.edu.tr',
    principal: 'Mehmet YILMAZ',
    founded: 2010,
    student_count: 450,
    teacher_count: 35,
    class_count: 18
  },
  subjects: [
    { name: 'Türkçe', code: 'TUR', grade_weight: 4 },
    { name: 'Matematik', code: 'MAT', grade_weight: 4 },
    { name: 'Fen Bilimleri', code: 'FEN', grade_weight: 3 },
    { name: 'Sosyal Bilgiler', code: 'SOS', grade_weight: 3 },
    { name: 'İngilizce', code: 'ING', grade_weight: 3 },
    { name: 'Din Kültürü ve Ahlak Bilgisi', code: 'DKAB', grade_weight: 2 },
    { name: 'Beden Eğitimi', code: 'BED', grade_weight: 2 },
    { name: 'Resim', code: 'RES', grade_weight: 1 },
    { name: 'Müzik', code: 'MUZ', grade_weight: 1 }
  ],
  teachers: [
    { name: 'Ayşe KAYA', subject: 'Türkçe', email: 'ayse.kaya@istanbul-demo-ortaokulu.edu.tr', phone: '+90 532 111 2233' },
    { name: 'Mehmet DEMİR', subject: 'Matematik', email: 'mehmet.demir@istanbul-demo-ortaokulu.edu.tr', phone: '+90 532 111 2234' },
    { name: 'Fatma ÖZDEMİR', subject: 'Fen Bilimleri', email: 'fatma.ozdemir@istanbul-demo-ortaokulu.edu.tr', phone: '+90 532 111 2235' },
    { name: 'Ali YILMAZ', subject: 'Sosyal Bilgiler', email: 'ali.yilmaz@istanbul-demo-ortaokulu.edu.tr', phone: '+90 532 111 2236' },
    { name: 'Zeynep KAAN', subject: 'İngilizce', email: 'zeynep.kaan@istanbul-demo-ortaokulu.edu.tr', phone: '+90 532 111 2237' }
  ],
  classes: [
    { name: '5/A', grade: 5, capacity: 25, student_count: 24, class_teacher: 'Ayşe KAYA' },
    { name: '5/B', grade: 5, capacity: 25, student_count: 25, class_teacher: 'Mehmet DEMİR' },
    { name: '6/A', grade: 6, capacity: 25, student_count: 23, class_teacher: 'Fatma ÖZDEMİR' },
    { name: '6/B', grade: 6, capacity: 25, student_count: 25, class_teacher: 'Ali YILMAZ' },
    { name: '7/A', grade: 7, capacity: 25, student_count: 24, class_teacher: 'Zeynep KAAN' },
    { name: '8/A', grade: 8, capacity: 25, student_count: 22, class_teacher: 'Ayşe KAYA' }
  ],
  students: [
    { name: 'Ahmet YILMAZ', class: '5/A', student_number: '2024001', parent_name: 'Mehmet YILMAZ', parent_phone: '+90 532 123 4567' },
    { name: 'Elif KAYA', class: '5/A', student_number: '2024002', parent_name: 'Ayşe KAYA', parent_phone: '+90 532 123 4568' },
    { name: 'Can DEMİR', class: '5/B', student_number: '2024003', parent_name: 'Ali DEMİR', parent_phone: '+90 532 123 4569' },
    { name: 'Selin ÖZ', class: '6/A', student_number: '2024004', parent_name: 'Fatma ÖZ', parent_phone: '+90 532 123 4570' },
    { name: 'Ege KAAN', class: '6/B', student_number: '2024005', parent_name: 'Zeynep KAAN', parent_phone: '+90 532 123 4571' },
    { name: 'Deniz ASLAN', class: '7/A', student_number: '2024006', parent_name: 'Murat ASLAN', parent_phone: '+90 532 123 4572' }
  ],
  assignments: [
    {
      title: 'Türkçe Kompozisyon - Mevsimler',
      description: 'En sevdiğiniz mevsimi anlatan 200 kelimelik bir kompozisyon yazınız.',
      subject: 'Türkçe',
      class: '5/A',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100
    },
    {
      title: 'Matematik - Kesirler',
      description: 'Ders kitabındaki kesirler konusu alıştırmaları (sayfa 45-48)',
      subject: 'Matematik',
      class: '5/B',
      due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      points: 100
    },
    {
      title: 'Fen Bilimleri - Madde ve Değişim',
      description: 'Günlük hayatta gözlemlediğiniz fiziksel ve kimyasal değişimleri listeleyin.',
      subject: 'Fen Bilimleri',
      class: '6/A',
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      points: 100
    }
  ],
  grades: [
    { student: 'Ahmet YILMAZ', subject: 'Türkçe', grade: 'AA', points: 95, exam_type: 'Yazılı Sınav', date: new Date('2025-01-15') },
    { student: 'Elif KAYA', subject: 'Türkçe', grade: 'BA', points: 85, exam_type: 'Yazılı Sınav', date: new Date('2025-01-15') },
    { student: 'Can DEMİR', subject: 'Matematik', grade: 'AA', points: 90, exam_type: 'Yazılı Sınav', date: new Date('2025-01-16') },
    { student: 'Selin ÖZ', subject: 'Fen Bilimleri', grade: 'BB', points: 75, exam_type: 'Proje Ödevi', date: new Date('2025-01-17') }
  ]
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}\x1b[0m`);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Seeding functions
async function seedTenant() {
  log('Creating demo tenant...', 'info');
  
  const tenantData = {
    id: DEMO_TENANT_ID,
    name: DEMO_CONTENT.school.name,
    domain: 'istanbul-demo-ortaokulu.edu.tr',
    status: 'active',
    settings: {
      school_info: DEMO_CONTENT.school,
      locale: 'tr',
      timezone: 'Europe/Istanbul',
      academic_year: '2024-2025',
      grading_system: 'turkish'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('tenants')
      .upsert(tenantData, { onConflict: 'id' });

    if (error) throw error;
    log('Demo tenant created successfully', 'success');
  } catch (error) {
    log(`Error creating tenant: ${error.message}`, 'error');
    throw error;
  }
}

async function seedSubjects() {
  log('Seeding subjects...', 'info');

  for (const subject of DEMO_CONTENT.subjects) {
    const subjectData = {
      id: generateUUID(),
      tenant_id: DEMO_TENANT_ID,
      name: subject.name,
      code: subject.code,
      grade_weight: subject.grade_weight,
      is_active: true,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from(`${DEMO_TENANT_ID}_subjects`)
        .upsert(subjectData, { onConflict: 'code' });

      if (error) throw error;
    } catch (error) {
      log(`Error seeding subject ${subject.name}: ${error.message}`, 'warning');
    }
  }

  log('Subjects seeded successfully', 'success');
}

async function seedClasses() {
  log('Seeding classes...', 'info');

  for (const classInfo of DEMO_CONTENT.classes) {
    const classData = {
      id: generateUUID(),
      tenant_id: DEMO_TENANT_ID,
      name: classInfo.name,
      grade_level: classInfo.grade,
      capacity: classInfo.capacity,
      student_count: classInfo.student_count,
      class_teacher: classInfo.class_teacher,
      academic_year: '2024-2025',
      is_active: true,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from(`${DEMO_TENANT_ID}_classes`)
        .upsert(classData, { onConflict: 'name' });

      if (error) throw error;
    } catch (error) {
      log(`Error seeding class ${classInfo.name}: ${error.message}`, 'warning');
    }
  }

  log('Classes seeded successfully', 'success');
}

async function seedDemoAnalytics() {
  log('Seeding demo analytics data...', 'info');

  const analyticsData = {
    tenant_id: DEMO_TENANT_ID,
    total_students: DEMO_CONTENT.school.student_count,
    total_teachers: DEMO_CONTENT.school.teacher_count,
    total_classes: DEMO_CONTENT.school.class_count,
    attendance_rate: 94.5,
    assignment_completion_rate: 87.3,
    average_grade: 3.2,
    parent_engagement_rate: 76.8,
    system_usage_rate: 89.1,
    performance_metrics: {
      monthly_active_users: 420,
      daily_active_users: 280,
      session_duration_avg: 25.4,
      feature_usage: {
        assignments: 89,
        grades: 92,
        attendance: 95,
        communication: 67,
        reports: 45
      }
    },
    generated_at: new Date().toISOString()
  };

  try {
    const { error } = await supabase
      .from('demo_analytics')
      .upsert(analyticsData, { onConflict: 'tenant_id' });

    if (error) throw error;
    log('Demo analytics data seeded successfully', 'success');
  } catch (error) {
    log(`Error seeding analytics: ${error.message}`, 'warning');
  }
}

async function generateSampleActivity() {
  log('Generating sample activity data...', 'info');

  const activities = [
    {
      id: generateUUID(),
      tenant_id: DEMO_TENANT_ID,
      type: 'assignment_created',
      title: 'Yeni ödev oluşturuldu',
      description: 'Türkçe Kompozisyon - Mevsimler ödevi eklendi',
      user_name: 'Ayşe KAYA',
      class_name: '5/A',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    },
    {
      id: generateUUID(),
      tenant_id: DEMO_TENANT_ID,
      type: 'grade_entered',
      title: 'Not girişi yapıldı',
      description: 'Matematik yazılı sınav notları girildi',
      user_name: 'Mehmet DEMİR',
      class_name: '5/B',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
    },
    {
      id: generateUUID(),
      tenant_id: DEMO_TENANT_ID,
      type: 'attendance_taken',
      title: 'Yoklama alındı',
      description: 'Günlük yoklama işlemi tamamlandı',
      user_name: 'Fatma ÖZDEMİR',
      class_name: '6/A',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
    }
  ];

  for (const activity of activities) {
    try {
      const { error } = await supabase
        .from('recent_activities')
        .upsert(activity, { onConflict: 'id' });

      if (error) throw error;
    } catch (error) {
      log(`Error creating activity: ${error.message}`, 'warning');
    }
  }

  log('Sample activities generated successfully', 'success');
}

// Main seeding function
async function seedDemoContent() {
  log('🌱 Starting Turkish demo content seeding...', 'info');

  try {
    // Step 1: Create tenant
    await seedTenant();

    // Step 2: Seed subjects
    await seedSubjects();

    // Step 3: Seed classes
    await seedClasses();

    // Step 4: Seed demo analytics
    await seedDemoAnalytics();

    // Step 5: Generate sample activities
    await generateSampleActivity();

    log('🎉 Demo content seeding completed successfully!', 'success');
    
    // Generate summary report
    const summary = {
      tenant: DEMO_CONTENT.school.name,
      tenant_id: DEMO_TENANT_ID,
      subjects_count: DEMO_CONTENT.subjects.length,
      classes_count: DEMO_CONTENT.classes.length,
      teachers_count: DEMO_CONTENT.teachers.length,
      students_count: DEMO_CONTENT.students.length,
      assignments_count: DEMO_CONTENT.assignments.length,
      grades_count: DEMO_CONTENT.grades.length,
      seeded_at: new Date().toISOString()
    };

    // Save summary to file
    const summaryPath = path.join(__dirname, '../../test-results/demo-content-summary.json');
    fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    log(`📊 Seeding summary saved to: ${summaryPath}`, 'info');

  } catch (error) {
    log(`❌ Seeding failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoContent();
}

module.exports = { seedDemoContent, DEMO_CONTENT, DEMO_TENANT_ID };