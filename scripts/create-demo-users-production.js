#!/usr/bin/env node
/**
 * İ-EP.APP Production Demo Users Creation Script
 * 
 * This script creates demo users for the production demo environment
 * at demo.i-ep.app using Supabase Auth API
 * 
 * Usage: node scripts/create-demo-users-production.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Production Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_TENANT_ID = 'demo-tenant-production-2025';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo users configuration for production
const DEMO_USERS = [
  {
    email: 'admin@demo.i-ep.app',
    password: 'DemoAdmin2025!',
    role: 'admin',
    profile: {
      first_name: 'Demo',
      last_name: 'Yönetici',
      full_name: 'Demo Yönetici',
      phone: '+90 532 100 0000',
      title: 'Okul Müdürü'
    },
    metadata: {
      tenant_id: DEMO_TENANT_ID,
      role: 'admin',
      demo_user: true,
      created_for: 'production_demo'
    }
  },
  {
    email: 'teacher@demo.i-ep.app',
    password: 'DemoTeacher2025!',
    role: 'teacher',
    profile: {
      first_name: 'Demo',
      last_name: 'Öğretmen',
      full_name: 'Demo Öğretmen',
      phone: '+90 532 100 0001',
      title: 'Sınıf Öğretmeni',
      subject_specialization: 'Matematik'
    },
    metadata: {
      tenant_id: DEMO_TENANT_ID,
      role: 'teacher',
      demo_user: true,
      created_for: 'production_demo',
      teacher_id: 'demo-teacher-001'
    }
  },
  {
    email: 'student@demo.i-ep.app',
    password: 'DemoStudent2025!',
    role: 'student',
    profile: {
      first_name: 'Demo',
      last_name: 'Öğrenci',
      full_name: 'Demo Öğrenci',
      grade_level: 5,
      class_name: '5-A Sınıfı'
    },
    metadata: {
      tenant_id: DEMO_TENANT_ID,
      role: 'student',
      demo_user: true,
      created_for: 'production_demo',
      student_id: 'demo-student-001',
      class_id: 'demo-class-5a'
    }
  },
  {
    email: 'parent@demo.i-ep.app',
    password: 'DemoParent2025!',
    role: 'parent',
    profile: {
      first_name: 'Demo',
      last_name: 'Veli',
      full_name: 'Demo Veli',
      phone: '+90 532 100 0002',
      relationship: 'Anne'
    },
    metadata: {
      tenant_id: DEMO_TENANT_ID,
      role: 'parent',
      demo_user: true,
      created_for: 'production_demo',
      student_id: 'demo-student-001'
    }
  }
];

/**
 * Creates a demo user with Supabase Auth
 */
async function createDemoUser(userConfig) {
  try {
    console.log(`📝 Creating user: ${userConfig.email}`);
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userConfig.email,
      password: userConfig.password,
      email_confirm: true, // Auto-confirm email
      app_metadata: {
        ...userConfig.metadata,
        provider: 'email',
        providers: ['email']
      },
      user_metadata: {
        ...userConfig.profile,
        demo_environment: 'production',
        created_at: new Date().toISOString()
      }
    });
    
    if (authError) {
      // If user already exists, try to update
      if (authError.message.includes('already registered')) {
        console.log(`⚠️  User ${userConfig.email} already exists, updating...`);
        
        // Get existing user
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === userConfig.email);
        
        if (user) {
          // Update existing user
          const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
            password: userConfig.password,
            app_metadata: {
              ...userConfig.metadata,
              updated_at: new Date().toISOString()
            },
            user_metadata: {
              ...userConfig.profile,
              demo_environment: 'production',
              updated_at: new Date().toISOString()
            }
          });
          
          if (updateError) {
            throw updateError;
          }
          
          console.log(`✅ Updated user: ${userConfig.email} (${userConfig.role})`);
          return { user, updated: true };
        }
      } else {
        throw authError;
      }
    } else {
      console.log(`✅ Created user: ${userConfig.email} (${userConfig.role})`);
      return { user: authData.user, created: true };
    }
    
  } catch (error) {
    console.error(`❌ Error creating/updating user ${userConfig.email}:`, error.message);
    return { error };
  }
}

/**
 * Links demo user to appropriate tenant records
 */
async function linkUserToTenantRecords(user, userConfig) {
  try {
    console.log(`🔗 Linking user ${user.email} to tenant records...`);
    
    // Link to appropriate tenant table based on role
    switch (userConfig.role) {
      case 'admin':
        // Admins don't need specific linking - they have full tenant access
        break;
        
      case 'teacher':
        // Link to teachers table
        const { error: teacherError } = await supabase
          .from('teachers')
          .update({ user_id: user.id })
          .eq('id', userConfig.metadata.teacher_id)
          .eq('tenant_id', DEMO_TENANT_ID);
          
        if (teacherError && !teacherError.message.includes('No rows')) {
          console.error(`⚠️  Warning: Could not link teacher record:`, teacherError.message);
        } else {
          console.log(`✅ Linked teacher record for ${user.email}`);
        }
        break;
        
      case 'student':
        // Link to students table
        const { error: studentError } = await supabase
          .from('students')
          .update({ user_id: user.id })
          .eq('id', userConfig.metadata.student_id)
          .eq('tenant_id', DEMO_TENANT_ID);
          
        if (studentError && !studentError.message.includes('No rows')) {
          console.error(`⚠️  Warning: Could not link student record:`, studentError.message);
        } else {
          console.log(`✅ Linked student record for ${user.email}`);
        }
        break;
        
      case 'parent':
        // Link to parent_student_relationships table
        const { error: parentError } = await supabase
          .from('parent_student_relationships')
          .upsert({
            parent_user_id: user.id,
            student_id: userConfig.metadata.student_id,
            tenant_id: DEMO_TENANT_ID,
            relationship_type: userConfig.profile.relationship?.toLowerCase() || 'parent',
            is_primary_contact: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (parentError) {
          console.error(`⚠️  Warning: Could not create parent relationship:`, parentError.message);
        } else {
          console.log(`✅ Created parent relationship for ${user.email}`);
        }
        break;
    }
    
  } catch (error) {
    console.error(`❌ Error linking user ${user.email} to tenant records:`, error.message);
  }
}

/**
 * Verifies demo tenant exists
 */
async function verifyDemoTenant() {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, domain')
      .eq('id', DEMO_TENANT_ID)
      .single();
    
    if (error) {
      throw new Error(`Demo tenant not found: ${error.message}`);
    }
    
    console.log(`✅ Demo tenant verified: ${data.name} (${data.domain})`);
    return data;
  } catch (error) {
    console.error('❌ Demo tenant verification failed:', error.message);
    console.error('   Make sure to run production-demo-setup.sql first!');
    process.exit(1);
  }
}

/**
 * Main function to create all demo users
 */
async function createAllDemoUsers() {
  console.log('🚀 İ-EP.APP Production Demo Users Creation');
  console.log('==============================================');
  console.log(`📍 Target tenant: ${DEMO_TENANT_ID}`);
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}`);
  console.log('');
  
  try {
    // Verify demo tenant exists
    await verifyDemoTenant();
    
    // Create all demo users
    const results = [];
    for (const userConfig of DEMO_USERS) {
      const result = await createDemoUser(userConfig);
      if (result.user) {
        await linkUserToTenantRecords(result.user, userConfig);
      }
      results.push(result);
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('📊 CREATION SUMMARY');
    console.log('===================');
    
    const created = results.filter(r => r.created).length;
    const updated = results.filter(r => r.updated).length;
    const errors = results.filter(r => r.error).length;
    
    console.log(`✅ Users created: ${created}`);
    console.log(`🔄 Users updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('');
    
    if (errors === 0) {
      console.log('🎉 All demo users created/updated successfully!');
      console.log('');
      console.log('📋 DEMO USER CREDENTIALS');
      console.log('========================');
      DEMO_USERS.forEach(user => {
        console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
      });
      console.log('');
      console.log('🌐 Access your demo at: https://demo.i-ep.app');
    } else {
      console.log('⚠️  Some errors occurred. Please check the logs above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error during demo users creation:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createAllDemoUsers()
    .then(() => {
      console.log('✨ Demo users creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  createAllDemoUsers,
  createDemoUser,
  linkUserToTenantRecords,
  DEMO_USERS
};