#!/usr/bin/env node

/**
 * Direct API test with detailed debugging
 * Tests server-side authentication handling
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDirectAPI() {
  console.log('🔧 Testing direct API authentication...\n');

  try {
    // 1. Login and get session
    console.log('1. Logging in...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'teacher1@demo.local',
      password: 'demo123',
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }

    console.log('✅ Login successful');
    console.log('   Access token:', loginData.session.access_token.substring(0, 30) + '...');

    // 2. Test API with various headers
    console.log('\n2. Testing API with authorization header...');

    const testConfigs = [
      {
        name: 'Bearer token in Authorization header',
        headers: {
          Authorization: `Bearer ${loginData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      },
      {
        name: 'Supabase auth header',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${loginData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      },
      {
        name: 'With tenant header',
        headers: {
          Authorization: `Bearer ${loginData.session.access_token}`,
          'x-tenant-id': 'localhost-tenant',
          'Content-Type': 'application/json',
        },
      },
    ];

    for (const config of testConfigs) {
      console.log(`\n   Testing: ${config.name}`);
      try {
        const response = await fetch('http://localhost:3000/api/assignments', {
          method: 'GET',
          headers: config.headers,
        });

        console.log(`   Status: ${response.status}`);
        const data = await response.text();
        console.log(`   Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
      } catch (err) {
        console.log(`   Error: ${err.message}`);
      }
    }

    // 3. Logout
    await supabase.auth.signOut();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

testDirectAPI()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });
