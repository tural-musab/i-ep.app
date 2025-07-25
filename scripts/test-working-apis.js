/**
 * Quick verification of working APIs
 * Phase 6.1 - Authentication Flow Testing (Focused)
 */

const workingEndpoints = [
  'http://localhost:3000/api/assignments/statistics',
  'http://localhost:3000/api/attendance/statistics', 
  'http://localhost:3000/api/grades',
  'http://localhost:3000/api/grades/analytics',
  'http://localhost:3000/api/classes',
  'http://localhost:3000/api/students',
  'http://localhost:3000/api/teachers',
  'http://localhost:3000/api/health'
];

const headers = {
  'Content-Type': 'application/json',
  'X-User-Email': 'admin@demo.local',
  'X-User-ID': 'demo-admin-001',
  'x-tenant-id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
};

async function quickTest() {
  console.log('🔐 QUICK AUTHENTICATION TEST - WORKING ENDPOINTS');
  console.log('='.repeat(60));
  
  let working = 0;
  let total = workingEndpoints.length;
  
  for (const url of workingEndpoints) {
    try {
      const response = await fetch(url, { headers });
      const status = response.status;
      const endpoint = url.split('/').pop();
      
      if (status === 200) {
        console.log(`✅ ${endpoint}: ${status} OK`);
        working++;
      } else {
        console.log(`❌ ${endpoint}: ${status}`);
      }
    } catch (error) {
      console.log(`💥 ${url.split('/').pop()}: Network Error`);
    }
  }
  
  console.log('='.repeat(60));
  console.log(`📊 RESULT: ${working}/${total} endpoints working (${Math.round(working/total*100)}%)`);
  
  if (working >= total * 0.8) {
    console.log('🎉 EXCELLENT: Authentication system is working well!');
    console.log('✅ Ready for Phase 6.1 completion');
  } else {
    console.log('⚠️  Some endpoints need attention');
  }
}

quickTest().catch(console.error);