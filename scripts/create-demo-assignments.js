#!/usr/bin/env node

/**
 * Create Demo Assignments for İ-EP.APP
 * Bu script local Supabase'de demo assignment data'ları oluşturur
 * Assignment Dashboard için gerçek data sağlar
 * 
 * Kullanım: node scripts/create-demo-assignments.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Demo assignment data
const getDemoAssignments = (tenantId, teacherId, classId) => [
  {
    tenant_id: tenantId,
    title: 'Matematik Problemleri Çözümü',
    description: 'Temel matematik problemleri ve çözüm yöntemleri',
    type: 'homework',
    subject: 'Matematik',
    class_id: classId,
    teacher_id: teacherId, // Use auth user ID (may cause FK error but let's try)
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    max_score: 100,
    instructions: 'Tüm problemleri adım adım çözünüz ve gösteriniz.',
    status: 'published',
    is_graded: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    tenant_id: tenantId,
    title: 'Fen Bilgisi Deney Raporu',
    description: 'Bitki büyümesi gözlem raporu',
    type: 'project',
    subject: 'Fen Bilgisi',
    class_id: classId,
    teacher_id: teacherId, // Use auth user ID (may cause FK error but let's try)
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    max_score: 100,
    instructions: 'Bitki büyümesini 1 hafta boyunca gözlemleyip rapor hazırlayınız.',
    status: 'published',
    is_graded: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    tenant_id: tenantId,
    title: 'İngilizce Kelime Testi',
    description: '50 temel İngilizce kelime testi',
    type: 'quiz',
    subject: 'İngilizce',
    class_id: classId,
    teacher_id: teacherId, // Use auth user ID (may cause FK error but let's try)
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    max_score: 50,
    instructions: 'Verilen kelimelerin Türkçe karşılıklarını yazınız.',
    status: 'published',
    is_graded: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    tenant_id: tenantId,
    title: 'Türkçe Kompozisyon',
    description: 'Sevdiğim mevsim konulu kompozisyon',
    type: 'homework',
    subject: 'Türkçe',
    class_id: classId,
    teacher_id: teacherId, // Use auth user ID (may cause FK error but let's try)
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    max_score: 100,
    instructions: 'En az 200 kelimelik kompozisyon yazınız.',
    status: 'published',
    is_graded: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    tenant_id: tenantId,
    title: 'Sosyal Bilgiler Araştırma',
    description: 'Türk tarihinde önemli şahsiyetler',
    type: 'project',
    subject: 'Sosyal Bilgiler',
    class_id: classId,
    teacher_id: teacherId, // Use auth user ID (may cause FK error but let's try)
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    max_score: 100,
    instructions: 'Bir tarihî şahsiyeti seçip hayatını araştırınız.',
    status: 'published',
    is_graded: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo assignment submissions for statistics
const getDemoSubmissions = (tenantId, assignments, students) => {
  const submissions = [];
  
  assignments.forEach((assignment, assignmentIndex) => {
    students.forEach((student, studentIndex) => {
      // Create some submissions (not all students submit all assignments)
      const shouldSubmit = Math.random() > 0.2; // 80% submission rate
      
      if (shouldSubmit) {
        const isGraded = Math.random() > 0.3; // 70% graded rate
        
        submissions.push({
          tenant_id: tenantId,
          assignment_id: assignment.id,
          student_id: student.id,
          status: isGraded ? 'graded' : 'submitted',
          content: `Demo submission for ${assignment.title} by ${student.name}`,
          grade: isGraded ? Math.floor(Math.random() * 40) + 60 : null, // Grades between 60-100
          feedback: isGraded ? 'İyi çalışma, devam et!' : null,
          submitted_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });
  });
  
  return submissions;
};

async function createDemoAssignments() {
  try {
    console.log('🚀 Creating demo assignments...\n');

    // 1. Get or create development tenant
    let { data: tenantsList, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(1);

    let tenants;
    
    if (tenantsError || !tenantsList || tenantsList.length === 0) {
      console.log('⚠️ No tenant found, creating development tenant...');
      
      // Create development tenant
      const { data: newTenant, error: createTenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Demo Okul',
          subdomain: 'localhost',
          settings: {
            school_type: 'primary',
            academic_year: '2024-2025',
            timezone: 'Europe/Istanbul',
          },
          is_active: true,
        })
        .select()
        .single();

      if (createTenantError) {
        console.error('❌ Failed to create tenant:', createTenantError.message);
        return;
      }
      
      tenants = newTenant;
      console.log('✅ Created development tenant:', tenants.name);
    } else {
      tenants = tenantsList[0]; // Use first tenant
      console.log('✅ Found development tenant:', tenants.name);
    }

    // 2. Get demo teacher from auth users (since we create auth users not teacher profiles)
    const { data: authUsers, error: teacherError } = await supabase.auth.admin.listUsers();
    
    if (teacherError) {
      console.error('❌ Failed to get users:', teacherError.message);
      return;
    }

    const teacherUser = authUsers.users.find(user => 
      user.user_metadata?.role === 'teacher' && user.email?.includes('teacher1')
    );

    if (!teacherUser) {
      console.error('❌ No demo teacher found');
      console.log('💡 Run create-demo-users.js first to create demo teacher');
      return;
    }

    // Create teacher object for compatibility
    const teacher = {
      id: teacherUser.id,
      users: {
        name: teacherUser.user_metadata?.name || 'Demo Teacher',
        email: teacherUser.email,
      }
    };

    console.log('✅ Found demo teacher:', teacher.users.name);

    // 3. Get demo class
    let { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('tenant_id', tenants.id)
      .limit(1)
      .single();

    if (classError) {
      console.log('⚠️ No demo class found, creating one...');
      
      const { data: newClass, error: createClassError } = await supabase
        .from('classes')
        .insert({
          tenant_id: tenants.id,
          name: '5-A',
          grade_level: '5',
          academic_year: '2024-2025',
        })
        .select()
        .single();

      if (createClassError) {
        console.error('❌ Failed to create demo class:', createClassError.message);
        return;
      }
      
      console.log('✅ Created demo class:', newClass.name);
      classes = newClass;
    } else {
      console.log('✅ Found demo class:', classes.name);
    }

    // 4. Get demo students
    let { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*, users(*)')
      .eq('tenant_id', tenants.id)
      .limit(10);

    if (studentsError || students.length === 0) {
      console.log('⚠️ No demo students found, creating some...');
      
      const demoStudents = [
        { name: 'Ahmet Yılmaz', email: 'ahmet@demo.localhost' },
        { name: 'Ayşe Kaya', email: 'ayse@demo.localhost' },
        { name: 'Mehmet Demir', email: 'mehmet@demo.localhost' },
        { name: 'Fatma Çelik', email: 'fatma@demo.localhost' },
        { name: 'Ali Öz', email: 'ali@demo.localhost' },
      ];

      const createdStudents = [];
      for (const studentData of demoStudents) {
        // Create user first
        const { data: user, error: userError } = await supabase
          .from('users')
          .insert({
            email: studentData.email,
            name: studentData.name,
            role: 'student',
            tenant_id: tenants.id,
            email_verified: true,
          })
          .select()
          .single();

        if (!userError && user) {
          // Create student profile
          const { data: student, error: studentError } = await supabase
            .from('students')
            .insert({
              tenant_id: tenants.id,
              user_id: user.id,
              student_number: `STU${Date.now()}${Math.floor(Math.random() * 1000)}`,
              class_id: classes.id,
              grade_level: '5',
              is_active: true,
            })
            .select('*, users(*)')
            .single();

          if (!studentError) {
            createdStudents.push(student);
          }
        }
      }
      
      students = createdStudents;
      console.log(`✅ Created ${students.length} demo students`);
    } else {
      console.log(`✅ Found ${students.length} demo students`);
    }

    // 5. Create demo assignments (use auth user id as string for now)
    console.log('📝 Creating assignments for tenant:', tenants.id, 'class:', classes.id);
    const assignmentData = getDemoAssignments(tenants.id, teacher.id, classes.id);
    
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .insert(assignmentData)
      .select();

    if (assignmentsError) {
      console.error('❌ Failed to create assignments:', assignmentsError.message);
      return;
    }

    console.log(`✅ Created ${assignments.length} demo assignments`);

    // 6. Create demo submissions
    const submissionData = getDemoSubmissions(tenants.id, assignments, students);
    
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .insert(submissionData)
      .select();

    if (submissionsError) {
      console.error('❌ Failed to create submissions:', submissionsError.message);
      return;
    }

    console.log(`✅ Created ${submissions.length} demo submissions`);

    // 7. Summary
    console.log('\n🎉 Demo assignment data created successfully!');
    console.log('📊 Summary:');
    console.log(`   - Assignments: ${assignments.length}`);
    console.log(`   - Submissions: ${submissions.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Class: ${classes.name}`);
    console.log(`   - Teacher: ${teacher.users.name}`);
    console.log('\n💡 Now visit http://localhost:3000 to see real data in Assignment Dashboard!');

  } catch (error) {
    console.error('❌ Error creating demo assignments:', error.message);
    console.error(error.stack);
  }
}

// Run script
if (require.main === module) {
  createDemoAssignments().then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { createDemoAssignments };