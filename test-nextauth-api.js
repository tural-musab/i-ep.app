#!/usr/bin/env node

/**
 * Test NextAuth authentication flow with API endpoints
 * This script tests the complete authentication flow:
 * 1. Login via NextAuth
 * 2. Get session cookie
 * 3. Test API endpoint with session
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testNextAuthFlow() {
  console.log('🔐 Testing NextAuth authentication flow...\n');

  try {
    // 1. Get CSRF token first
    console.log('1. Getting CSRF token...');
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('   CSRF Token:', csrfData.csrfToken.substring(0, 20) + '...');

    // 2. Login with credentials
    console.log('\n2. Logging in with credentials...');
    const loginFormData = new URLSearchParams({
      email: 'teacher1@demo.local',
      password: 'demo123',
      tenantId: 'localhost-tenant',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3000/dashboard',
      json: 'true',
    });

    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: loginFormData,
      redirect: 'manual',
    });

    console.log('   Login response status:', loginResponse.status);

    // Extract cookies
    const setCookies = loginResponse.headers.raw()['set-cookie'];
    console.log('   Response cookies:', setCookies ? setCookies.length : 0, 'cookies received');

    if (setCookies && setCookies.length > 0) {
      // Find session cookie
      const sessionCookie = setCookies.find(
        (cookie) =>
          cookie.includes('next-auth.session-token') ||
          cookie.includes('__Secure-next-auth.session-token')
      );

      if (sessionCookie) {
        console.log('   Session cookie found:', sessionCookie.substring(0, 50) + '...');

        // 3. Test API with session cookie
        console.log('\n3. Testing assignments API with session...');
        const apiResponse = await fetch('http://localhost:3000/api/assignments', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Cookie: sessionCookie.split(';')[0], // Use only the cookie value
          },
        });

        console.log('   API response status:', apiResponse.status);
        const apiData = await apiResponse.text();
        console.log(
          '   API response:',
          apiData.substring(0, 200) + (apiData.length > 200 ? '...' : '')
        );

        if (apiResponse.status === 200) {
          console.log('✅ Authentication and API call successful!');
        } else if (apiResponse.status === 401) {
          console.log('⚠️ API still requires authentication - investigating session handling');
        } else {
          console.log('🔍 Unexpected API response status');
        }
      } else {
        console.log('❌ No session cookie found in response');
      }
    } else {
      console.log('❌ No cookies received from login');
    }

    // 4. Test session endpoint
    console.log('\n4. Testing session endpoint...');
    const sessionResponse = await fetch('http://localhost:3000/api/auth/session');
    const sessionData = await sessionResponse.text();
    console.log('   Session data:', sessionData);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testNextAuthFlow()
  .then(() => {
    console.log('\n✨ NextAuth API test completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Test script failed:', err);
    process.exit(1);
  });
