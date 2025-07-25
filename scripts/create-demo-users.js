#!/usr/bin/env node

/**
 * Create Demo Users for İ-EP.APP
 * Bu script local Supabase'de demo kullanıcıları oluşturur
 *
 * Kullanım: node scripts/create-demo-users.js
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

// Demo users data
const demoUsers = [
  {
    email: 'admin@demo.local',
    password: 'demo123',
    user_metadata: {
      name: 'Demo Admin',
      role: 'admin',
      tenant_id: 'localhost-tenant',
    },
  },
  {
    email: 'teacher1@demo.local',
    password: 'demo123',
    user_metadata: {
      name: 'Ayşe Öğretmen',
      role: 'teacher',
      tenant_id: 'localhost-tenant',
      subject: 'Matematik',
    },
  },
  {
    email: 'teacher2@demo.local',
    password: 'demo123',
    user_metadata: {
      name: 'Mehmet Öğretmen',
      role: 'teacher',
      tenant_id: 'localhost-tenant',
      subject: 'Türkçe',
    },
  },
  {
    email: 'student1@demo.local',
    password: 'demo123',
    user_metadata: {
      name: 'Ahmet Yılmaz',
      role: 'student',
      tenant_id: 'localhost-tenant',
      student_id: 'student-001',
      class_id: 'class-5a',
    },
  },
  {
    email: 'parent1@demo.local',
    password: 'demo123',
    user_metadata: {
      name: 'Ali Yılmaz',
      role: 'parent',
      tenant_id: 'localhost-tenant',
      student_ids: ['student-001'],
    },
  },
];

async function createDemoUsers() {
  console.log('🚀 Creating demo users...\n');

  for (const userData of demoUsers) {
    try {
      // Create user with Admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: userData.user_metadata,
      });

      if (error) {
        console.error(`❌ Failed to create ${userData.email}:`, error.message);

        // If user exists, try to update instead
        if (error.message.includes('already registered')) {
          console.log(`   Trying to update existing user...`);
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            data?.id || '',
            {
              user_metadata: userData.user_metadata,
            }
          );

          if (updateError) {
            console.error(`   ❌ Update also failed:`, updateError.message);
          } else {
            console.log(`   ✅ Updated existing user: ${userData.email}`);
          }
        }
      } else {
        console.log(`✅ Created user: ${userData.email} (Role: ${userData.user_metadata.role})`);

        // Update related tables based on role
        if (userData.user_metadata.role === 'teacher' && data.user) {
          // Update teacher_id in classes
          if (userData.user_metadata.subject === 'Matematik') {
            await supabase
              .from('classes')
              .update({ teacher_id: data.user.id })
              .in('id', ['class-5a', 'class-5b']);
          }

          // Update teacher_id in assignments
          await supabase
            .from('assignments')
            .update({ teacher_id: data.user.id })
            .eq(
              'subject_id',
              userData.user_metadata.subject === 'Matematik' ? 'subject-math' : 'subject-turkish'
            );
        }

        if (userData.user_metadata.role === 'student' && data.user) {
          // Update user_id in students table
          await supabase
            .from('students')
            .update({ user_id: data.user.id })
            .eq('id', userData.user_metadata.student_id);
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${userData.email}:`, err);
    }
  }

  console.log('\n✨ Demo user creation completed!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@demo.local / demo123');
  console.log('   Teacher: teacher1@demo.local / demo123');
  console.log('   Student: student1@demo.local / demo123');
  console.log('   Parent: parent1@demo.local / demo123');
}

// Run the script
createDemoUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Script failed:', err);
    process.exit(1);
  });
