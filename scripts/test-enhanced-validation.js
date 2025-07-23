/**
 * Enhanced API Validation Testing
 * Phase 6.1 - Data Validation Implementation Testing
 * İ-EP.APP - Professional validation system verification
 */

console.log('🔍 PHASE 6.1 - ENHANCED DATA VALIDATION TESTING');
console.log('='.repeat(70));

// Test endpoints for validation
const TEST_ENDPOINTS = [
  {
    name: 'Assignment Statistics',
    url: 'http://localhost:3000/api/assignments/statistics',
    expectedSchema: 'AssignmentStatistics',
    critical: true
  },
  {
    name: 'Classes List',
    url: 'http://localhost:3000/api/classes',
    expectedSchema: 'ClassList',
    critical: true
  },
  {
    name: 'Students List',
    url: 'http://localhost:3000/api/students',
    expectedSchema: 'StudentList',
    critical: true
  },
  {
    name: 'Teachers List',
    url: 'http://localhost:3000/api/teachers',
    expectedSchema: 'TeacherList',
    critical: true
  },
  {
    name: 'Health Check',
    url: 'http://localhost:3000/api/health',
    expectedSchema: 'HealthCheck',
    critical: false
  }
];

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-User-Email': 'admin@demo.local',
  'X-User-ID': 'demo-admin-001',
  'x-tenant-id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
};

/**
 * Test individual endpoint validation
 */
async function testEndpointValidation(endpoint) {
  console.log(`\n📡 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  console.log(`   Expected Schema: ${endpoint.expectedSchema}`);
  console.log(`   Critical: ${endpoint.critical ? 'YES' : 'NO'}`);

  try {
    const response = await fetch(endpoint.url, { headers: AUTH_HEADERS });
    
    if (!response.ok) {
      console.log(`   ❌ HTTP Error: ${response.status}`);
      return {
        endpoint: endpoint.name,
        success: false,
        error: `HTTP ${response.status}`,
        critical: endpoint.critical
      };
    }

    const data = await response.json();
    
    // Basic data validation checks
    const validationResults = performBasicValidation(data, endpoint.expectedSchema);
    
    if (validationResults.valid) {
      console.log(`   ✅ SUCCESS: Data structure valid`);
      console.log(`   📊 Fields: ${validationResults.fieldCount}`);
      if (validationResults.sampleData) {
        console.log(`   🔍 Sample: ${validationResults.sampleData}`);
      }
      
      return {
        endpoint: endpoint.name,
        success: true,
        fieldCount: validationResults.fieldCount,
        critical: endpoint.critical
      };
    } else {
      console.log(`   ⚠️  VALIDATION WARNING: ${validationResults.issue}`);
      return {
        endpoint: endpoint.name,
        success: false,
        error: validationResults.issue,
        critical: endpoint.critical
      };
    }

  } catch (error) {
    console.log(`   💥 ERROR: ${error.message}`);
    return {
      endpoint: endpoint.name,
      success: false,
      error: error.message,
      critical: endpoint.critical
    };
  }
}

/**
 * Basic validation logic for different schemas
 */
function performBasicValidation(data, schemaType) {
  try {
    switch (schemaType) {
      case 'AssignmentStatistics':
        if (typeof data.totalAssignments === 'number' && 
            typeof data.activeAssignments === 'number') {
          return {
            valid: true,
            fieldCount: Object.keys(data).length,
            sampleData: `Total: ${data.totalAssignments}, Active: ${data.activeAssignments}`
          };
        }
        return { valid: false, issue: 'Missing required statistics fields' };

      case 'ClassList':
        if (data.data && Array.isArray(data.data)) {
          const sample = data.data[0];
          if (sample && sample.id && sample.name) {
            return {
              valid: true,
              fieldCount: data.data.length,
              sampleData: `${data.data.length} classes, first: ${sample.name}`
            };
          }
        }
        return { valid: false, issue: 'Invalid class list structure' };

      case 'StudentList':
        if (data.data && Array.isArray(data.data)) {
          const sample = data.data[0];
          if (sample && sample.id && sample.first_name) {
            return {
              valid: true,
              fieldCount: data.data.length,
              sampleData: `${data.data.length} students, first: ${sample.first_name}`
            };
          }
        }
        return { valid: false, issue: 'Invalid student list structure' };

      case 'TeacherList':
        if (data.data && Array.isArray(data.data)) {
          const sample = data.data[0];
          if (sample && sample.id && sample.first_name) {
            return {
              valid: true,
              fieldCount: data.data.length,
              sampleData: `${data.data.length} teachers, first: ${sample.first_name}`
            };
          }
        }
        return { valid: false, issue: 'Invalid teacher list structure' };

      case 'HealthCheck':
        if (data.status && data.timestamp) {
          return {
            valid: true,
            fieldCount: Object.keys(data).length,
            sampleData: `Status: ${data.status}`
          };
        }
        return { valid: false, issue: 'Missing health check fields' };

      default:
        return { valid: true, fieldCount: Object.keys(data).length };
    }
  } catch (error) {
    return { valid: false, issue: `Validation error: ${error.message}` };
  }
}

/**
 * Generate professional validation report
 */
function generateValidationReport(results) {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 ENHANCED DATA VALIDATION TEST RESULTS');
  console.log('='.repeat(70));

  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = results.filter(r => !r.success).length;
  const criticalFailures = results.filter(r => !r.success && r.critical).length;

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Endpoints: ${totalTests}`);
  console.log(`   ✅ Successful: ${successfulTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   🚨 Critical Failures: ${criticalFailures}`);
  console.log(`   📈 Success Rate: ${Math.round((successfulTests / totalTests) * 100)}%`);

  // Critical analysis
  console.log(`\n🎯 CRITICAL ANALYSIS:`);
  if (criticalFailures === 0) {
    console.log(`   ✅ All critical endpoints passing validation`);
    console.log(`   ✅ Data validation system working correctly`);
    console.log(`   ✅ Ready for production deployment`);
  } else {
    console.log(`   🚨 ${criticalFailures} critical endpoints failing`);
    console.log(`   ⚠️  Requires immediate attention before production`);
  }

  // Detailed results
  console.log(`\n📋 DETAILED RESULTS:`);
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const critical = result.critical ? '🚨' : '  ';
    console.log(`   ${index + 1}. ${status} ${critical} ${result.endpoint}`);
    if (!result.success) {
      console.log(`      Error: ${result.error}`);
    } else if (result.fieldCount) {
      console.log(`      Fields: ${result.fieldCount}`);
    }
  });

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (successfulTests === totalTests) {
    console.log(`   🎉 Excellent! All endpoints validated successfully`);
    console.log(`   ✅ Enhanced validation system is working perfectly`);
    console.log(`   🚀 Phase 6.1 Data Validation: READY FOR COMPLETION`);
  } else {
    console.log(`   🔧 Fix ${failedTests} endpoint validation issues`);
    if (criticalFailures > 0) {
      console.log(`   🚨 Priority: Fix ${criticalFailures} critical failures first`);
    }
    console.log(`   🔍 Review data structure schemas`);
  }

  console.log('\n' + '='.repeat(70));

  return {
    totalTests,
    successfulTests,
    failedTests,
    criticalFailures,
    successRate: Math.round((successfulTests / totalTests) * 100),
    allCriticalPassing: criticalFailures === 0
  };
}

/**
 * Main validation testing execution
 */
async function runEnhancedValidationTests() {
  console.log('🚀 Starting enhanced data validation testing...');
  console.log(`📊 Testing ${TEST_ENDPOINTS.length} endpoints with professional validation`);

  const results = [];

  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpointValidation(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const report = generateValidationReport(results);
  
  // Save detailed results
  const reportData = {
    timestamp: new Date().toISOString(),
    phase: 'Phase 6.1 - Enhanced Data Validation Testing',
    results,
    summary: report
  };

  const fs = require('fs');
  fs.writeFileSync('./ENHANCED_VALIDATION_TEST_RESULTS.json', JSON.stringify(reportData, null, 2));
  console.log(`💾 Detailed results saved to: ENHANCED_VALIDATION_TEST_RESULTS.json`);

  return report;
}

// Run the tests
if (require.main === module) {
  runEnhancedValidationTests()
    .then(report => {
      process.exit(report.allCriticalPassing ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}