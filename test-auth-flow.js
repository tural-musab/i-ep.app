#!/usr/bin/env node

/**
 * Test Authentication Flow for İ-EP.APP
 * Bu script demo kullanıcılarıyla authentication test eder
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test kullanıcısı
const testUser = {
  email: 'teacher1@demo.local',
  password: 'demo123',
};

async function testAuthenticationFlow() {
  console.log('🔐 Testing authentication flow...\n');

  try {
    // 1. Giriş yap
    console.log('1. Testing login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }

    console.log('✅ Login successful!');
    console.log('   User ID:', loginData.user.id);
    console.log('   Email:', loginData.user.email);
    console.log(
      '   Role:',
      loginData.user.app_metadata?.role || loginData.user.user_metadata?.role || 'No role found'
    );
    console.log('   Tenant ID:', loginData.user.user_metadata?.tenant_id);

    // 2. Session kontrolü
    console.log('\n2. Testing session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return;
    }

    console.log('✅ Session valid!');
    console.log('   Access Token:', sessionData.session.access_token.substring(0, 50) + '...');

    // 3. Test authenticated API call
    console.log('\n3. Testing authenticated API call...');

    const response = await fetch('http://localhost:3000/api/assignments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
        'x-tenant-id': 'localhost-tenant',
      },
    });

    console.log('   Response status:', response.status);
    const responseData = await response.json();
    console.log('   Response data:', JSON.stringify(responseData, null, 2));

    if (response.status === 200) {
      console.log('✅ API call successful!');
    } else {
      console.log('⚠️ API call returned error status');
    }

    // 4. Çıkış yap
    console.log('\n4. Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message);
      return;
    }

    console.log('✅ Logout successful!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test'i çalıştır
testAuthenticationFlow()
  .then(() => {
    console.log('\n✨ Authentication flow test completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test script failed:', err);
    process.exit(1);
  });
