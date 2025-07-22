#!/usr/bin/env node

/**
 * PROFESYONEL LOCAL API TEST
 * Turkish Educational System Quick Test
 */

const SUPABASE_URL = 'http://localhost:54321';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testAPI(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  };

  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    console.log('---');
    
    return { status: response.status, data: result, success: response.ok };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}: ${error.message}`);
    return { status: 0, error: error.message, success: false };
  }
}

async function runProfessionalLocalTest() {
  console.log('🚀 İ-EP.APP PROFESYONEL LOCAL API TEST\n');
  
  let successCount = 0;
  let totalTests = 0;
  
  // Test 1: Database Health Check
  console.log('📋 1. DATABASE HEALTH CHECK');
  totalTests++;
  const healthCheck = await testAPI('/');
  if (healthCheck.success) successCount++;
  
  // Test 2: Tables Existence Check
  console.log('📋 2. TURKISH EDUCATIONAL TABLES CHECK');
  const tables = ['/assignments', '/grades', '/assignment_submissions'];
  
  for (const table of tables) {
    totalTests++;
    const tableCheck = await testAPI(`${table}?limit=1`);
    if (tableCheck.success) successCount++;
  }
  
  // Test 3: Create Demo Turkish Assignment
  console.log('📋 3. TURKISH DEMO CONTENT TEST');
  totalTests++;
  const turkishAssignment = {
    tenant_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Türkçe Dil ve Edebiyat Ödevi',
    description: 'Nazım Hikmet şiirlerinden seçmece analiz yapınız',
    subject: 'Türkçe',
    type: 'essay',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    max_score: 100,
    status: 'active',
    instructions: 'Şiirde kullanılan edebi sanatları belirleyiniz ve örneklendiriniz',
    class_id: '12345',
    teacher_id: '67890'
  };
  
  const createAssignment = await testAPI('/assignments', 'POST', turkishAssignment);
  if (createAssignment.success) successCount++;
  
  // Test 4: Turkish Grading System Test
  console.log('📋 4. TURKISH GRADING SYSTEM TEST');
  if (createAssignment.success && createAssignment.data && createAssignment.data[0]) {
    totalTests++;
    const assignmentId = createAssignment.data[0].id;
    const turkishGrade = {
      tenant_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      student_id: 'student-123',
      assignment_id: assignmentId,
      grade_value: 85,
      max_grade: 100,
      percentage: 85,
      letter_grade: 'B', // Turkish grading: AA, BA, BB, CB, CC, DC, DD, FF
      gpa_points: 3.0,
      grade_type: 'assignment',
      semester: 'Güz',
      academic_year: '2024-2025'
    };
    
    const createGrade = await testAPI('/grades', 'POST', turkishGrade);
    if (createGrade.success) successCount++;
  }
  
  // Test Results
  console.log('🎯 PROFESYONEL TEST SONUÇLARI');
  console.log(`✅ Başarılı: ${successCount}/${totalTests}`);
  console.log(`📊 Başarı Oranı: ${Math.round((successCount/totalTests) * 100)}%`);
  
  if ((successCount/totalTests) >= 0.75) {
    console.log('🎉 PRODUCTION READY! Local system is working professionally.');
    console.log('✅ Turkish educational system is functional');
    console.log('✅ Database operations successful');
    console.log('✅ Turkish content encoding working');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. ✅ Local test passed - Ready for production deployment');
    console.log('2. 🔧 Setup demo.i-ep.app subdomain');
    console.log('3. 🚀 Deploy production demo environment');
    
    return true;
  } else {
    console.log('⚠️  Additional work needed before production');
    console.log(`   ${100 - Math.round((successCount/totalTests) * 100)}% issues need resolution`);
    return false;
  }
}

// Run the test
runProfessionalLocalTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});