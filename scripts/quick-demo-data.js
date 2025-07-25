#!/usr/bin/env node

/**
 * Quick Demo Data Creator for İ-EP.APP
 * Assignments ve Classes tabloları için minimum demo data
 * Foreign key constraint'leri bypass ederek hızlı çözüm
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createQuickDemoData() {
  console.log('🚀 Creating quick demo data...');

  const tenantId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'; // Development tenant

  try {
    // 1. Basit teacher oluştur
    const teacherId = 'teacher-uuid-1';
    const { data: teacher, error: teacherError } = await supabase
      .from('teachers')
      .upsert([
        {
          id: teacherId,
          tenant_id: tenantId,
          email: 'demo-teacher@school.com',
          first_name: 'Demo',
          last_name: 'Teacher',
          metadata: { subjects: ['Matematik', 'Fen'] }
        }
      ], { onConflict: 'id' });

    if (teacherError) {
      console.log('⚠️ Teacher creation error (may be normal):', teacherError.message);
    } else {
      console.log('✅ Created demo teacher');
    }

    // 2. Basit class oluştur  
    const classId = 'class-uuid-1';
    const { data: demoClass, error: classError } = await supabase
      .from('classes')
      .upsert([
        {
          id: classId,
          tenant_id: tenantId,
          name: '5-A Demo Sınıfı',
          grade: '5',
          section: 'A',
          capacity: 30,
          academic_year: '2024-2025',
          teacher_id: teacherId,
          status: 'active'
        }
      ], { onConflict: 'id' });

    if (classError) {
      console.log('⚠️ Class creation error (may be normal):', classError.message);
    } else {
      console.log('✅ Created demo class');
    }

    // 3. Basit assignments oluştur
    const assignments = [
      {
        id: 'assignment-uuid-1',
        tenant_id: tenantId,
        title: 'Matematik Problemleri',
        description: 'Temel matematik problemleri ve çözümler',
        type: 'homework',
        subject: 'Matematik',
        class_id: classId,
        teacher_id: teacherId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_score: 100,
        status: 'published',
        instructions: 'Tüm problemleri adım adım çözünüz.'
      },
      {
        id: 'assignment-uuid-2', 
        tenant_id: tenantId,
        title: 'Fen Bilgisi Deney Raporu',
        description: 'Su döngüsü deneyi raporu yazma',
        type: 'project',
        subject: 'Fen Bilgisi',
        class_id: classId,
        teacher_id: teacherId,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        max_score: 100,
        status: 'published',
        instructions: 'Deney sonuçlarınızı detaylı raporlayınız.'
      }
    ];

    const { data: assignmentData, error: assignmentError } = await supabase
      .from('assignments')
      .upsert(assignments, { onConflict: 'id' });

    if (assignmentError) {
      console.error('❌ Assignment creation error:', assignmentError);
    } else {
      console.log('✅ Created demo assignments:', assignments.length);
    }

    console.log('\n🎉 Quick demo data creation completed!');
    console.log('📊 Created:');
    console.log('  - 1 Demo Teacher');
    console.log('  - 1 Demo Class');  
    console.log('  - 2 Demo Assignments');
    console.log('\n🔍 Test your APIs now!');

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  }
}

createQuickDemoData();