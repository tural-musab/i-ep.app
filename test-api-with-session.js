#!/usr/bin/env node

/**
 * Test API endpoints with session-based authentication
 * Tests the full flow: browser -> NextAuth -> API
 */

const fetch = require('node-fetch');

async function testApiWithSession() {
  console.log('🔗 Testing API endpoints with session authentication...\n');

  try {
    // 1. Login through NextAuth API
    console.log('1. Logging in through NextAuth...');

    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'teacher1@demo.local',
        password: 'demo123',
        tenantId: 'localhost-tenant',
        csrfToken: '', // Empty for testing
        callbackUrl: 'http://localhost:3000/dashboard',
        json: 'true',
      }),
      redirect: 'manual',
    });

    console.log('   Login response status:', loginResponse.status);
    console.log('   Login response headers:', Object.fromEntries(loginResponse.headers));

    // Extract session cookie if available
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('   Cookies:', cookies);

    // 2. Test with session cookie
    if (cookies) {
      console.log('\n2. Testing API with session cookie...');

      const apiResponse = await fetch('http://localhost:3000/api/assignments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookies,
          'x-tenant-id': 'localhost-tenant',
        },
      });

      console.log('   API response status:', apiResponse.status);
      const apiData = await apiResponse.text();
      console.log('   API response:', apiData);
    }

    // 3. Test health endpoint
    console.log('\n3. Testing health endpoint (should work without auth)...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    console.log('   Health status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('   Health data:', healthData);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testApiWithSession()
  .then(() => {
    console.log('\n✨ API session test completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test script failed:', err);
    process.exit(1);
  });
