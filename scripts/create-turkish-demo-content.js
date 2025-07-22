#!/usr/bin/env node

/**
 * Turkish Educational Demo Content Creator
 * İstanbul Demo Ortaokulu için profesyonel demo data
 * Production-ready SaaS demo system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', 
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Turkish Demo School Configuration
const DEMO_SCHOOL = {
  name: "İstanbul Demo Ortaokulu",
  location: "Kadıköy, İstanbul", 
  academic_year: "2024-2025",
  tenant_id: null // Will be created
};

// Turkish Educational Content
const DEMO_CONTENT = {
  // Turkish Names Database
  students: [
    { first_name: "Ahmet", last_name: "Yılmaz", class: "6-A" },
    { first_name: "Ayşe", last_name: "Kaya", class: "6-A" },
    { first_name: "Mehmet", last_name: "Özkan", class: "6-A" },
    { first_name: "Fatma", last_name: "Demir", class: "6-A" },
    { first_name: "Ali", last_name: "Şahin", class: "7-B" },
    { first_name: "Zeynep", last_name: "Çelik", class: "7-B" },
    { first_name: "Hasan", last_name: "Arslan", class: "7-B" },
    { first_name: "Merve", last_name: "Güneş", class: "7-B" },
    { first_name: "Burak", last_name: "Köse", class: "8-C" },
    { first_name: "Elif", last_name: "Bulut", class: "8-C" }
  ],
  
  teachers: [
    { first_name: "Ayşe", last_name: "Özkan", subject: "Matematik", experience: "8 yıl" },
    { first_name: "Mehmet", last_name: "Kaya", subject: "Türkçe", experience: "12 yıl" },
    { first_name: "Fatma", last_name: "Demir", subject: "Fen Bilimleri", experience: "6 yıl" },
    { first_name: "Ali", last_name: "Şahin", subject: "Sosyal Bilgiler", experience: "10 yıl" }
  ],

  classes: [
    { name: "6-A", grade: "6", section: "A", capacity: 25 },
    { name: "7-B", grade: "7", section: "B", capacity: 28 },
    { name: "8-C", grade: "8", section: "C", capacity: 24 }
  ],

  assignments: [
    {
      title: "Matematik: Kesirlerle İşlemler",
      description: "Kesirlerle toplama, çıkarma, çarpma ve bölme işlemleri",
      subject: "Matematik",
      class: "6-A", 
      instructions: "Ders kitabınızın 45-52. sayfalarındaki tüm alıştırmaları çözünüz. Çözümleri adım adım göstermeyi unutmayınız.",
      type: "homework"
    },
    {
      title: "Türkçe: Destan Analizi", 
      description: "Dede Korkut Hikâyeleri üzerine kompozisyon yazma",
      subject: "Türkçe",
      class: "7-B",
      instructions: "Seçtiğiniz bir Dede Korkut hikâyesini okuyup, karakterler ve olaylar üzerine 2 sayfalık bir kompozisyon yazınız.",
      type: "project"
    },
    {
      title: "Fen: Işık ve Ses Deneyi",
      description: "Işık ve sesin yayılması ile ilgili deney raporu",
      subject: "Fen Bilimleri", 
      class: "8-C",
      instructions: "Evde yapabileceğiniz basit malzemelerle ışık ve ses deneyi yapıp, sonuçları raporlayınız.",
      type: "experiment"
    },
    {
      title: "Sosyal: Osmanlı İmparatorluğu",
      description: "Osmanlı İmparatorluğu'nun kuruluş dönemini araştırma",
      subject: "Sosyal Bilgiler",
      class: "7-B", 
      instructions: "Osmanlı İmparatorluğu'nun kuruluş dönemindeki önemli olayları araştırıp sunum hazırlayınız.",
      type: "research"
    }
  ]
};

async function createDemoTenant() {
  console.log('🏫 Creating Istanbul Demo Ortaokulu tenant...');
  
  const tenantData = {
    name: DEMO_SCHOOL.name,
    domain: 'demo.i-ep.app',
    subdomain: 'demo',
    settings: {
      school_type: 'ortaokul',
      location: DEMO_SCHOOL.location,
      academic_year: DEMO_SCHOOL.academic_year,
      language: 'tr',
      timezone: 'Europe/Istanbul'
    },
    status: 'active',
    is_demo: true
  };

  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert([tenantData])
    .select()
    .single();

  if (error) {
    console.log('⚠️ Tenant may exist:', error.message);
    // Try to find existing demo tenant
    const { data: existing } = await supabase
      .from('tenants')
      .select('*')
      .eq('domain', 'demo.i-ep.app')
      .single();
    
    return existing?.id;
  }

  console.log('✅ Demo tenant created:', tenant.id);
  return tenant.id;
}

async function createDemoUsers(tenantId) {
  console.log('👥 Creating demo users...');
  
  const users = [
    {
      id: 'demo-admin-001',
      tenant_id: tenantId,
      email: 'admin@demo.i-ep.app',
      role: 'admin',
      first_name: 'Demo',
      last_name: 'Yönetici',
      is_active: true,
      demo_user: true
    },
    {
      id: 'demo-teacher-001', 
      tenant_id: tenantId,
      email: 'ayse.ozkan@demo.i-ep.app',
      role: 'teacher',
      first_name: 'Ayşe',
      last_name: 'Özkan',
      is_active: true,
      demo_user: true
    },
    {
      id: 'demo-student-001',
      tenant_id: tenantId, 
      email: 'ahmet.yilmaz@demo.i-ep.app',
      role: 'student',
      first_name: 'Ahmet',
      last_name: 'Yılmaz',
      is_active: true,
      demo_user: true
    },
    {
      id: 'demo-parent-001',
      tenant_id: tenantId,
      email: 'fatma.yilmaz@demo.i-ep.app', 
      role: 'parent',
      first_name: 'Fatma',
      last_name: 'Yılmaz',
      is_active: true,
      demo_user: true
    }
  ];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert([user], { onConflict: 'id' });
      
    if (error) {
      console.log(`⚠️ User ${user.email}:`, error.message);
    } else {
      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }
  }
}

async function createDemoClasses(tenantId) {
  console.log('🎓 Creating demo classes...');
  
  const classes = DEMO_CONTENT.classes.map(cls => ({
    id: `demo-class-${cls.name.toLowerCase().replace('-', '')}`,
    tenant_id: tenantId,
    name: cls.name,
    grade_level: parseInt(cls.grade),
    section: cls.section,
    capacity: cls.capacity,
    academic_year: DEMO_SCHOOL.academic_year,
    is_active: true
  }));

  for (const cls of classes) {
    const { error } = await supabase
      .from('classes')
      .upsert([cls], { onConflict: 'id' });
      
    if (error) {
      console.log(`⚠️ Class ${cls.name}:`, error.message);
    } else {
      console.log(`✅ Created class: ${cls.name}`);
    }
  }

  return classes;
}

async function createDemoAssignments(tenantId, classes) {
  console.log('📝 Creating demo assignments...');
  
  const assignments = DEMO_CONTENT.assignments.map((assignment, index) => {
    const targetClass = classes.find(c => c.name === assignment.class);
    
    return {
      id: `demo-assignment-${index + 1}`,
      tenant_id: tenantId,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      subject: assignment.subject,
      class_id: targetClass?.id,
      teacher_id: 'demo-teacher-001',
      due_date: new Date(Date.now() + (7 + index) * 24 * 60 * 60 * 1000).toISOString(),
      max_score: 100,
      status: 'published',
      instructions: assignment.instructions
    };
  });

  for (const assignment of assignments) {
    const { error } = await supabase
      .from('assignments')
      .upsert([assignment], { onConflict: 'id' });
      
    if (error) {
      console.log(`⚠️ Assignment "${assignment.title}":`, error.message);
    } else {
      console.log(`✅ Created assignment: "${assignment.title}"`);
    }
  }
}

async function createTurkishDemoContent() {
  console.log('🇹🇷 TURKISH EDUCATIONAL DEMO CONTENT CREATION');
  console.log('================================================');
  
  try {
    // 1. Create demo tenant
    const tenantId = await createDemoTenant();
    
    if (!tenantId) {
      console.error('❌ Could not create/find demo tenant');
      return;
    }

    // 2. Create demo users
    await createDemoUsers(tenantId);

    // 3. Create demo classes  
    const classes = await createDemoClasses(tenantId);

    // 4. Create demo assignments
    await createDemoAssignments(tenantId, classes);

    console.log('\n🎉 TURKISH DEMO CONTENT CREATION COMPLETED!');
    console.log('==========================================');
    console.log(`🏫 School: ${DEMO_SCHOOL.name}`);
    console.log(`🆔 Tenant ID: ${tenantId}`);
    console.log(`👥 Users: 4 (Admin, Teacher, Student, Parent)`);
    console.log(`🎓 Classes: ${classes.length}`);
    console.log(`📝 Assignments: ${DEMO_CONTENT.assignments.length}`);
    console.log('\n🔗 Demo URL: http://localhost:3000/auth/demo');
    console.log('🌐 Production URL: https://demo.i-ep.app (when deployed)');

  } catch (error) {
    console.error('❌ Error creating Turkish demo content:', error);
  }
}

// Run the script
if (require.main === module) {
  createTurkishDemoContent();
}

module.exports = { createTurkishDemoContent };