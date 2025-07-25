#!/usr/bin/env node

/**
 * İ-EP.APP Local Demo Users Creation Script
 * Creates demo users for all roles in the local environment
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const DEMO_TENANT_ID = 'istanbul-demo-ortaokulu';

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo Users Configuration
const DEMO_USERS = [
  {
    email: 'admin@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Admin',
    name: 'Sistem Yöneticisi',
    role: 'admin',
    metadata: {
      full_name: 'Sistem Yöneticisi',
      tenant_id: DEMO_TENANT_ID,
      department: 'Bilgi İşlem',
      phone: '+90 216 555 0100',
      title: 'Sistem Yöneticisi'
    }
  },
  {
    email: 'ogretmen@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Teacher',
    name: 'Ayşe KAYA',
    role: 'teacher',
    metadata: {
      full_name: 'Ayşe KAYA',
      tenant_id: DEMO_TENANT_ID,
      department: 'Türkçe',
      phone: '+90 532 111 2233',
      title: 'Türkçe Öğretmeni',
      employee_id: 'T2024001',
      class_teacher_of: '5/A'
    }
  },
  {
    email: 'ogrenci@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Student',
    name: 'Ahmet YILMAZ',
    role: 'student',
    metadata: {
      full_name: 'Ahmet YILMAZ',
      tenant_id: DEMO_TENANT_ID,
      class: '5/A',
      student_number: '2024001',
      grade_level: 5,
      parent_phone: '+90 532 123 4567',
      parent_name: 'Mehmet YILMAZ'
    }
  },
  {
    email: 'veli@istanbul-demo-ortaokulu.edu.tr',
    password: 'Demo2025!Parent',
    name: 'Mehmet YILMAZ',
    role: 'parent',
    metadata: {
      full_name: 'Mehmet YILMAZ',
      tenant_id: DEMO_TENANT_ID,
      phone: '+90 532 123 4567',
      children: [
        {
          name: 'Ahmet YILMAZ',
          student_number: '2024001',
          class: '5/A'
        }
      ],
      emergency_contact: true
    }
  }
];

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

// User creation functions
async function createAuthUser(userData) {
  try {
    log(`Creating auth user for ${userData.email}...`, 'info');

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: userData.metadata
    });

    if (error) {
      throw error;
    }

    log(`Auth user created successfully: ${userData.email}`, 'success');
    return data.user;
  } catch (error) {
    log(`Error creating auth user ${userData.email}: ${error.message}`, 'error');
    throw error;
  }
}

async function createTenantUser(authUser, userData) {
  try {
    log(`Creating tenant user record for ${userData.email}...`, 'info');

    const tenantUserData = {
      id: authUser.id,
      tenant_id: DEMO_TENANT_ID,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      metadata: userData.metadata,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseAdmin
      .from(`${DEMO_TENANT_ID}_users`)
      .upsert(tenantUserData, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    log(`Tenant user record created successfully: ${userData.email}`, 'success');
  } catch (error) {
    log(`Error creating tenant user ${userData.email}: ${error.message}`, 'error');
    throw error;
  }
}

async function assignUserPermissions(authUser, userData) {
  try {
    log(`Assigning permissions for ${userData.email}...`, 'info');

    const permissions = {
      admin: [
        'users:read', 'users:write', 'users:delete',
        'classes:read', 'classes:write', 'classes:delete',
        'assignments:read', 'assignments:write', 'assignments:delete',
        'grades:read', 'grades:write', 'grades:delete',
        'attendance:read', 'attendance:write', 'attendance:delete',
        'reports:read', 'reports:write',
        'system:admin'
      ],
      teacher: [
        'classes:read', 'classes:write',
        'assignments:read', 'assignments:write',
        'grades:read', 'grades:write',
        'attendance:read', 'attendance:write',
        'students:read'
      ],
      student: [
        'assignments:read',
        'grades:read',
        'attendance:read'
      ],
      parent: [
        'assignments:read',
        'grades:read',
        'attendance:read',
        'communication:read'
      ]
    };

    const userPermissions = permissions[userData.role] || [];

    for (const permission of userPermissions) {
      const permissionData = {
        id: generateUUID(),
        user_id: authUser.id,
        tenant_id: DEMO_TENANT_ID,
        permission: permission,
        granted_at: new Date().toISOString()
      };

      const { error } = await supabaseAdmin
        .from(`${DEMO_TENANT_ID}_user_permissions`)
        .upsert(permissionData, { onConflict: 'user_id,permission' });

      if (error) {
        log(`Warning: Could not assign permission ${permission}: ${error.message}`, 'warning');
      }
    }

    log(`Permissions assigned successfully for ${userData.email}`, 'success');
  } catch (error) {
    log(`Error assigning permissions for ${userData.email}: ${error.message}`, 'error');
  }
}

async function createDemoUser(userData) {
  try {
    log(`\n🔄 Creating demo user: ${userData.email} (${userData.role})`, 'info');

    // Step 1: Create auth user
    const authUser = await createAuthUser(userData);

    // Step 2: Create tenant user record
    await createTenantUser(authUser, userData);

    // Step 3: Assign permissions
    await assignUserPermissions(authUser, userData);

    log(`✅ Demo user created successfully: ${userData.email}`, 'success');
    
    return {
      auth_id: authUser.id,
      email: userData.email,
      role: userData.role,
      name: userData.name,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    log(`❌ Failed to create demo user ${userData.email}: ${error.message}`, 'error');
    throw error;
  }
}

async function createAllDemoUsers() {
  log('🚀 Starting local demo users creation...', 'info');

  const createdUsers = [];

  try {
    // Create each demo user
    for (const userData of DEMO_USERS) {
      const user = await createDemoUser(userData);
      createdUsers.push(user);
      
      // Add small delay between user creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    log('\n🎉 All demo users created successfully!', 'success');

    // Generate credentials summary
    const credentials = {
      tenant: 'Istanbul Demo Ortaokulu',
      tenant_id: DEMO_TENANT_ID,
      base_url: 'http://localhost:3000',
      users: DEMO_USERS.map(user => ({
        role: user.role,
        email: user.email,
        password: user.password,
        name: user.name
      })),
      created_at: new Date().toISOString()
    };

    // Save credentials to file
    const credentialsPath = path.join(__dirname, '../../test-results/demo-user-credentials.json');
    fs.mkdirSync(path.dirname(credentialsPath), { recursive: true });
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));

    // Generate readable credentials file
    const readableCredentialsPath = path.join(__dirname, '../../test-results/demo-user-credentials.md');
    const readableContent = `# İ-EP.APP Local Demo User Credentials

## Test Environment Information
- **Tenant**: ${credentials.tenant}
- **Tenant ID**: ${credentials.tenant_id}
- **Base URL**: ${credentials.base_url}
- **Created**: ${credentials.created_at}

## Demo User Accounts

### 👨‍💼 Admin Account
- **Email**: ${credentials.users.find(u => u.role === 'admin').email}
- **Password**: ${credentials.users.find(u => u.role === 'admin').password}
- **Name**: ${credentials.users.find(u => u.role === 'admin').name}
- **Access**: Full system administration

### 🎓 Teacher Account
- **Email**: ${credentials.users.find(u => u.role === 'teacher').email}
- **Password**: ${credentials.users.find(u => u.role === 'teacher').password}
- **Name**: ${credentials.users.find(u => u.role === 'teacher').name}
- **Access**: Classes, assignments, grades, attendance

### 📚 Student Account
- **Email**: ${credentials.users.find(u => u.role === 'student').email}
- **Password**: ${credentials.users.find(u => u.role === 'student').password}
- **Name**: ${credentials.users.find(u => u.role === 'student').name}
- **Access**: Assignments, grades, attendance (read-only)

### 👨‍👩‍👧‍👦 Parent Account
- **Email**: ${credentials.users.find(u => u.role === 'parent').email}
- **Password**: ${credentials.users.find(u => u.role === 'parent').password}
- **Name**: ${credentials.users.find(u => u.role === 'parent').name}
- **Access**: Child's assignments, grades, attendance, communication

## Quick Login URLs
- **Login Page**: http://localhost:3000/auth/signin
- **Dashboard**: http://localhost:3000/dashboard

## Notes
- All passwords follow the format: Demo2025![Role]
- Users are associated with tenant: ${credentials.tenant_id}
- Email confirmations are automatically verified
- Users have appropriate role-based permissions

## Testing Checklist
- [ ] Admin can access system administration
- [ ] Teacher can manage classes and assignments
- [ ] Student can view assignments and grades
- [ ] Parent can view child's information
- [ ] All role-based navigation works correctly
`;

    fs.writeFileSync(readableCredentialsPath, readableContent);

    log(`📊 Credentials saved to: ${credentialsPath}`, 'info');
    log(`📋 Readable credentials: ${readableCredentialsPath}`, 'info');

    // Display summary
    console.log('\n📋 Demo Users Created:');
    console.log('├── 📚 Admin: admin@istanbul-demo-ortaokulu.edu.tr');
    console.log('├── 🎓 Teacher: ogretmen@istanbul-demo-ortaokulu.edu.tr');
    console.log('├── 📖 Student: ogrenci@istanbul-demo-ortaokulu.edu.tr');
    console.log('└── 👨‍👩‍👧‍👦 Parent: veli@istanbul-demo-ortaokulu.edu.tr');
    console.log('\n🔑 Default password pattern: Demo2025![Role]');

    return createdUsers;

  } catch (error) {
    log(`❌ Demo users creation failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Cleanup function for testing
async function cleanupDemoUsers() {
  log('🧹 Cleaning up existing demo users...', 'info');

  for (const userData of DEMO_USERS) {
    try {
      // Get user by email
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.users.find(user => user.email === userData.email);

      if (existingUser) {
        // Delete auth user
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        
        // Delete tenant user record
        await supabaseAdmin
          .from(`${DEMO_TENANT_ID}_users`)
          .delete()
          .eq('id', existingUser.id);

        log(`Cleaned up user: ${userData.email}`, 'info');
      }
    } catch (error) {
      log(`Warning: Could not cleanup ${userData.email}: ${error.message}`, 'warning');
    }
  }

  log('Cleanup completed', 'success');
}

// Main function
async function main() {
  const command = process.argv[2];

  if (command === 'cleanup') {
    await cleanupDemoUsers();
  } else {
    await createAllDemoUsers();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { 
  createAllDemoUsers, 
  cleanupDemoUsers, 
  DEMO_USERS, 
  DEMO_TENANT_ID 
};