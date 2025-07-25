#!/usr/bin/env node

/**
 * İ-EP.APP Test Report Generator
 * Generates comprehensive test reports and documentation
 */

const fs = require('fs');
const path = require('path');

// Test report configuration
const REPORT_CONFIG = {
  tenant: 'istanbul-demo-ortaokulu',
  tenantName: 'Istanbul Demo Ortaokulu',
  baseUrl: 'http://localhost:3000',
  supabaseUrl: 'http://127.0.0.1:54321',
  reportDate: new Date().toISOString()
};

// Demo credentials for reference
const DEMO_CREDENTIALS = [
  { role: 'admin', email: 'admin@istanbul-demo-ortaokulu.edu.tr', password: 'Demo2025!Admin' },
  { role: 'teacher', email: 'ogretmen@istanbul-demo-ortaokulu.edu.tr', password: 'Demo2025!Teacher' },
  { role: 'student', email: 'ogrenci@istanbul-demo-ortaokulu.edu.tr', password: 'Demo2025!Student' },
  { role: 'parent', email: 'veli@istanbul-demo-ortaokulu.edu.tr', password: 'Demo2025!Parent' }
];

// Comprehensive test checklist
const TEST_CHECKLIST = {
  'Environment Setup': [
    { id: 'env-01', task: 'Node.js version 18+ installed', category: 'prerequisite', priority: 'critical' },
    { id: 'env-02', task: 'npm dependencies installed', category: 'prerequisite', priority: 'critical' },
    { id: 'env-03', task: 'Environment variables configured', category: 'prerequisite', priority: 'critical' },
    { id: 'env-04', task: 'Supabase local instance running', category: 'prerequisite', priority: 'critical' },
    { id: 'env-05', task: 'Redis service available (optional)', category: 'prerequisite', priority: 'medium' },
    { id: 'env-06', task: 'MinIO service available (optional)', category: 'prerequisite', priority: 'low' }
  ],
  'Database Testing': [
    { id: 'db-01', task: 'Supabase connection established', category: 'database', priority: 'critical' },
    { id: 'db-02', task: 'Tenant table accessible', category: 'database', priority: 'critical' },
    { id: 'db-03', task: 'Demo tenant created successfully', category: 'database', priority: 'critical' },
    { id: 'db-04', task: 'Turkish demo content seeded', category: 'database', priority: 'high' },
    { id: 'db-05', task: 'Demo users created in all roles', category: 'database', priority: 'critical' },
    { id: 'db-06', task: 'RLS policies working correctly', category: 'database', priority: 'critical' },
    { id: 'db-07', task: 'Turkish character encoding working', category: 'database', priority: 'high' }
  ],
  'Authentication Testing': [
    { id: 'auth-01', task: 'Admin user can login', category: 'authentication', priority: 'critical' },
    { id: 'auth-02', task: 'Teacher user can login', category: 'authentication', priority: 'critical' },
    { id: 'auth-03', task: 'Student user can login', category: 'authentication', priority: 'critical' },
    { id: 'auth-04', task: 'Parent user can login', category: 'authentication', priority: 'critical' },
    { id: 'auth-05', task: 'Role-based navigation working', category: 'authentication', priority: 'critical' },
    { id: 'auth-06', task: 'Session management working', category: 'authentication', priority: 'high' },
    { id: 'auth-07', task: 'Logout functionality working', category: 'authentication', priority: 'medium' }
  ],
  'API Testing': [
    { id: 'api-01', task: 'Health check endpoint responding', category: 'api', priority: 'critical' },
    { id: 'api-02', task: 'Assignment API endpoints working', category: 'api', priority: 'critical' },
    { id: 'api-03', task: 'Attendance API endpoints working', category: 'api', priority: 'critical' },
    { id: 'api-04', task: 'Grade API endpoints working', category: 'api', priority: 'critical' },
    { id: 'api-05', task: 'Class management API working', category: 'api', priority: 'high' },
    { id: 'api-06', task: 'User management API working', category: 'api', priority: 'high' },
    { id: 'api-07', task: 'Statistics API endpoints working', category: 'api', priority: 'medium' },
    { id: 'api-08', task: 'API authentication properly enforced', category: 'api', priority: 'critical' },
    { id: 'api-09', task: 'API error handling working', category: 'api', priority: 'high' }
  ],
  'Frontend Testing': [
    { id: 'fe-01', task: 'Dashboard loads for all roles', category: 'frontend', priority: 'critical' },
    { id: 'fe-02', task: 'Assignment creation form working', category: 'frontend', priority: 'critical' },
    { id: 'fe-03', task: 'Grade entry interface working', category: 'frontend', priority: 'critical' },
    { id: 'fe-04', task: 'Attendance tracking interface working', category: 'frontend', priority: 'critical' },
    { id: 'fe-05', task: 'Turkish content displaying correctly', category: 'frontend', priority: 'high' },
    { id: 'fe-06', task: 'Mobile responsiveness working', category: 'frontend', priority: 'medium' },
    { id: 'fe-07', task: 'Loading states displaying correctly', category: 'frontend', priority: 'medium' },
    { id: 'fe-08', task: 'Error messages displaying correctly', category: 'frontend', priority: 'medium' }
  ],
  'Turkish Content Testing': [
    { id: 'tr-01', task: 'Turkish school name displaying correctly', category: 'localization', priority: 'high' },
    { id: 'tr-02', task: 'Turkish teacher names working', category: 'localization', priority: 'high' },
    { id: 'tr-03', task: 'Turkish student names working', category: 'localization', priority: 'high' },
    { id: 'tr-04', task: 'Turkish subject names working', category: 'localization', priority: 'high' },
    { id: 'tr-05', task: 'Turkish grade system (AA-FF) working', category: 'localization', priority: 'high' },
    { id: 'tr-06', task: 'Turkish locale settings applied', category: 'localization', priority: 'medium' },
    { id: 'tr-07', task: 'Turkish timezone (Europe/Istanbul) set', category: 'localization', priority: 'medium' }
  ],
  'Performance Testing': [
    { id: 'perf-01', task: 'Homepage loads under 2 seconds', category: 'performance', priority: 'high' },
    { id: 'perf-02', task: 'API responses under 1 second', category: 'performance', priority: 'high' },
    { id: 'perf-03', task: 'Database queries optimized', category: 'performance', priority: 'medium' },
    { id: 'perf-04', task: 'Build size under acceptable limits', category: 'performance', priority: 'medium' },
    { id: 'perf-05', task: 'Memory usage within limits', category: 'performance', priority: 'low' }
  ],
  'Analytics System Testing': [
    { id: 'analytics-01', task: 'Demo analytics data populated', category: 'analytics', priority: 'high' },
    { id: 'analytics-02', task: 'Dashboard statistics displaying', category: 'analytics', priority: 'high' },
    { id: 'analytics-03', task: 'Assignment statistics working', category: 'analytics', priority: 'medium' },
    { id: 'analytics-04', task: 'Attendance statistics working', category: 'analytics', priority: 'medium' },
    { id: 'analytics-05', task: 'Grade analytics working', category: 'analytics', priority: 'medium' },
    { id: 'analytics-06', task: 'Performance metrics tracking', category: 'analytics', priority: 'low' }
  ]
};

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

function generateChecklistHTML() {
  let html = '';
  
  Object.entries(TEST_CHECKLIST).forEach(([category, tests]) => {
    html += `
    <div class="test-category">
      <h3>${category} (${tests.length} tests)</h3>
      <div class="test-items">
    `;
    
    tests.forEach(test => {
      const priorityClass = `priority-${test.priority}`;
      html += `
        <div class="test-item ${priorityClass}">
          <input type="checkbox" id="${test.id}" class="test-checkbox">
          <label for="${test.id}" class="test-label">
            <span class="test-id">${test.id}</span>
            <span class="test-task">${test.task}</span>
            <span class="test-priority ${priorityClass}">${test.priority}</span>
          </label>
        </div>
      `;
    });
    
    html += `
      </div>
    </div>
    `;
  });
  
  return html;
}

function generateMarkdownChecklist() {
  let markdown = '# İ-EP.APP Local Demo Testing Checklist\n\n';
  markdown += `> **Generated**: ${new Date().toLocaleDateString('tr-TR')}\n`;
  markdown += `> **Environment**: Local Demo Testing\n`;
  markdown += `> **Tenant**: ${REPORT_CONFIG.tenantName}\n\n`;
  
  Object.entries(TEST_CHECKLIST).forEach(([category, tests]) => {
    markdown += `## ${category}\n\n`;
    
    tests.forEach(test => {
      const priorityEmoji = {
        critical: '🔴',
        high: '🟡',
        medium: '🟠',
        low: '🟢'
      };
      
      markdown += `- [ ] **${test.id}**: ${test.task} ${priorityEmoji[test.priority]}\n`;
    });
    
    markdown += '\n';
  });
  
  markdown += `## Demo User Credentials\n\n`;
  DEMO_CREDENTIALS.forEach(cred => {
    markdown += `### ${cred.role.charAt(0).toUpperCase() + cred.role.slice(1)} Account\n`;
    markdown += `- **Email**: ${cred.email}\n`;
    markdown += `- **Password**: ${cred.password}\n\n`;
  });
  
  markdown += `## Quick Access URLs\n\n`;
  markdown += `- **Application**: ${REPORT_CONFIG.baseUrl}\n`;
  markdown += `- **Supabase Studio**: ${REPORT_CONFIG.supabaseUrl.replace('54321', '54323')}\n`;
  markdown += `- **Email Testing**: ${REPORT_CONFIG.supabaseUrl.replace('54321', '54324')}\n\n`;
  
  return markdown;
}

function generateHTMLReport() {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>İ-EP.APP Local Demo Test Checklist</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 { margin: 0 0 10px 0; font-size: 2.5rem; }
        .header p { margin: 5px 0; opacity: 0.9; }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .summary-card h3 { margin: 0 0 10px 0; font-size: 2rem; }
        .summary-card.critical h3 { color: #dc3545; }
        .summary-card.high h3 { color: #fd7e14; }
        .summary-card.medium h3 { color: #ffc107; }
        .summary-card.low h3 { color: #28a745; }
        
        .test-category {
            background: white;
            border-radius: 8px;
            margin-bottom: 25px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .test-category h3 {
            background: #f8f9fa;
            margin: 0;
            padding: 15px 20px;
            border-bottom: 1px solid #dee2e6;
            font-size: 1.2rem;
        }
        
        .test-items { padding: 10px 0; }
        
        .test-item {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            border-left: 4px solid transparent;
            transition: all 0.2s ease;
        }
        
        .test-item:hover { background: #f8f9fa; }
        
        .test-item.priority-critical { border-left-color: #dc3545; }
        .test-item.priority-high { border-left-color: #fd7e14; }
        .test-item.priority-medium { border-left-color: #ffc107; }
        .test-item.priority-low { border-left-color: #28a745; }
        
        .test-checkbox {
            margin-right: 15px;
            transform: scale(1.2);
        }
        
        .test-label {
            display: flex;
            align-items: center;
            flex: 1;
            cursor: pointer;
        }
        
        .test-id {
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.85rem;
            margin-right: 15px;
            min-width: 80px;
            text-align: center;
        }
        
        .test-task { flex: 1; }
        
        .test-priority {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 15px;
        }
        
        .test-priority.priority-critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .test-priority.priority-high {
            background: #fdeadb;
            color: #a05a2c;
        }
        
        .test-priority.priority-medium {
            background: #fff3cd;
            color: #856404;
        }
        
        .test-priority.priority-low {
            background: #d4edda;
            color: #155724;
        }
        
        .credentials-section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .credentials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .credential-card {
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 15px;
            background: #f8f9fa;
        }
        
        .credential-card h4 { margin: 0 0 10px 0; color: #495057; }
        .credential-card p { margin: 5px 0; font-family: 'Courier New', monospace; font-size: 0.9rem; }
        
        .urls-section {
            background: white;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .urls-section a {
            color: #007bff;
            text-decoration: none;
            font-family: 'Courier New', monospace;
        }
        
        .urls-section a:hover { text-decoration: underline; }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
            .summary-cards { grid-template-columns: 1fr 1fr; }
            .test-label { flex-direction: column; align-items: flex-start; }
            .test-id { margin: 0 0 5px 0; }
            .test-priority { margin: 5px 0 0 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 İ-EP.APP</h1>
        <h2>Local Demo Testing Checklist</h2>
        <p><strong>Environment:</strong> Local Demo Testing</p>
        <p><strong>Tenant:</strong> ${REPORT_CONFIG.tenantName}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</p>
    </div>

    <div class="summary-cards">
        <div class="summary-card critical">
            <h3>${Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'critical').length}</h3>
            <p>Critical Tests</p>
        </div>
        <div class="summary-card high">
            <h3>${Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'high').length}</h3>
            <p>High Priority</p>
        </div>
        <div class="summary-card medium">
            <h3>${Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'medium').length}</h3>
            <p>Medium Priority</p>
        </div>
        <div class="summary-card low">
            <h3>${Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'low').length}</h3>
            <p>Low Priority</p>
        </div>
    </div>

    ${generateChecklistHTML()}

    <div class="credentials-section">
        <h2>🔑 Demo User Credentials</h2>
        <div class="credentials-grid">
            ${DEMO_CREDENTIALS.map(cred => `
            <div class="credential-card">
                <h4>${cred.role.charAt(0).toUpperCase() + cred.role.slice(1)} Account</h4>
                <p><strong>Email:</strong> ${cred.email}</p>
                <p><strong>Password:</strong> ${cred.password}</p>
            </div>
            `).join('')}
        </div>
    </div>

    <div class="urls-section">
        <h2>🔗 Quick Access URLs</h2>
        <ul>
            <li><strong>Application:</strong> <a href="${REPORT_CONFIG.baseUrl}" target="_blank">${REPORT_CONFIG.baseUrl}</a></li>
            <li><strong>Supabase Studio:</strong> <a href="${REPORT_CONFIG.supabaseUrl.replace('54321', '54323')}" target="_blank">${REPORT_CONFIG.supabaseUrl.replace('54321', '54323')}</a></li>
            <li><strong>Email Testing (Inbucket):</strong> <a href="${REPORT_CONFIG.supabaseUrl.replace('54321', '54324')}" target="_blank">${REPORT_CONFIG.supabaseUrl.replace('54321', '54324')}</a></li>
        </ul>
    </div>

    <div class="footer">
        <p>Generated by İ-EP.APP Local Demo Testing System</p>
        <p>For support, contact the development team</p>
    </div>

    <script>
        // Add interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const checkboxes = document.querySelectorAll('.test-checkbox');
            const updateProgress = () => {
                const total = checkboxes.length;
                const checked = document.querySelectorAll('.test-checkbox:checked').length;
                const percentage = Math.round((checked / total) * 100);
                
                // Update title with progress
                document.title = \`İ-EP.APP Test Progress (\${percentage}%)\`;
                
                // Store progress in localStorage
                localStorage.setItem('testProgress', JSON.stringify({
                    total,
                    checked,
                    percentage,
                    timestamp: new Date().toISOString()
                }));
            };
            
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateProgress);
                
                // Load saved state
                const savedState = localStorage.getItem(\`checkbox-\${checkbox.id}\`);
                if (savedState === 'true') {
                    checkbox.checked = true;
                }
                
                // Save state on change
                checkbox.addEventListener('change', function() {
                    localStorage.setItem(\`checkbox-\${this.id}\`, this.checked);
                });
            });
            
            updateProgress();
        });
    </script>
</body>
</html>
`;
}

function generateTestInstructions() {
  return `# İ-EP.APP Local Demo Testing Instructions

## Pre-Testing Setup

### 1. Environment Preparation
\`\`\`bash
# Run the setup script
chmod +x scripts/local-demo-testing/setup-local-demo-environment.sh
./scripts/local-demo-testing/setup-local-demo-environment.sh
\`\`\`

### 2. Start Development Environment
\`\`\`bash
# Start Next.js development server
npm run dev

# In another terminal, start Supabase
npx supabase start
\`\`\`

## Testing Procedures

### 1. Manual Testing
1. Open the test checklist: \`test-results/local-demo-test-checklist.html\`
2. Go through each test systematically
3. Check off completed items
4. Note any failures or issues

### 2. Automated Testing
\`\`\`bash
# Run comprehensive automated tests
node scripts/local-demo-testing/comprehensive-test-runner.js

# Run specific test categories
npm test  # Unit tests
npm run test:e2e  # End-to-end tests
\`\`\`

### 3. Authentication Testing
Test login for each role:
- Admin: admin@istanbul-demo-ortaokulu.edu.tr
- Teacher: ogretmen@istanbul-demo-ortaokulu.edu.tr  
- Student: ogrenci@istanbul-demo-ortaokulu.edu.tr
- Parent: veli@istanbul-demo-ortaokulu.edu.tr

All passwords follow: Demo2025![Role]

### 4. Turkish Content Verification
- Verify Turkish characters display correctly
- Check Turkish educational content
- Test Turkish grading system (AA-FF)
- Validate Turkish locale settings

### 5. Performance Testing
- Measure page load times
- Test API response times
- Monitor memory usage
- Check build performance

## Issue Resolution

### Common Issues
1. **Supabase connection fails**: Restart Supabase local
2. **Authentication errors**: Check user creation scripts
3. **Database errors**: Verify migrations applied
4. **Turkish characters**: Check UTF-8 encoding

### Debugging Steps
1. Check browser console for errors
2. Verify Supabase logs: \`npx supabase logs\`
3. Check Next.js logs in terminal
4. Verify environment variables

## Reporting Results

### Test Report Locations
- HTML Report: \`test-results/local-demo-test-report.html\`
- JSON Results: \`test-results/local-demo-test-results.json\`
- Checklist: \`test-results/local-demo-test-checklist.html\`

### Success Criteria
- All critical tests must pass
- 95%+ of high priority tests pass
- No major Turkish content issues
- Authentication working for all roles
- Performance within acceptable limits

## Next Steps After Testing
1. Document any issues found
2. Fix critical and high priority issues
3. Re-run tests to verify fixes
4. Prepare for production deployment
5. Create production deployment checklist
`;
}

async function generateAllReports() {
  log('📊 Generating comprehensive test documentation...', 'info');

  const reportsDir = path.join(__dirname, '../../test-results');
  fs.mkdirSync(reportsDir, { recursive: true });

  try {
    // Generate HTML checklist
    const htmlReport = generateHTMLReport();
    const htmlPath = path.join(reportsDir, 'local-demo-test-checklist.html');
    fs.writeFileSync(htmlPath, htmlReport);
    log(`📋 HTML Checklist: ${htmlPath}`, 'success');

    // Generate Markdown checklist
    const markdownReport = generateMarkdownChecklist();
    const markdownPath = path.join(reportsDir, 'local-demo-test-checklist.md');
    fs.writeFileSync(markdownPath, markdownReport);
    log(`📝 Markdown Checklist: ${markdownPath}`, 'success');

    // Generate test instructions
    const instructions = generateTestInstructions();
    const instructionsPath = path.join(reportsDir, 'local-demo-testing-instructions.md');
    fs.writeFileSync(instructionsPath, instructions);
    log(`📖 Testing Instructions: ${instructionsPath}`, 'success');

    // Generate configuration summary
    const configSummary = {
      reportConfig: REPORT_CONFIG,
      testCategories: Object.keys(TEST_CHECKLIST),
      totalTests: Object.values(TEST_CHECKLIST).flat().length,
      priorityBreakdown: {
        critical: Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'critical').length,
        high: Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'high').length,
        medium: Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'medium').length,
        low: Object.values(TEST_CHECKLIST).flat().filter(t => t.priority === 'low').length
      },
      demoCredentials: DEMO_CREDENTIALS,
      generatedAt: new Date().toISOString()
    };

    const configPath = path.join(reportsDir, 'test-configuration-summary.json');
    fs.writeFileSync(configPath, JSON.stringify(configSummary, null, 2));
    log(`⚙️ Configuration Summary: ${configPath}`, 'success');

    log('🎉 All test documentation generated successfully!', 'success');

    // Display summary
    console.log('\n📋 Generated Test Documentation:');
    console.log('├── 📋 Interactive HTML Checklist');
    console.log('├── 📝 Markdown Checklist');
    console.log('├── 📖 Testing Instructions');
    console.log('└── ⚙️ Configuration Summary');
    console.log(`\n📊 Test Summary:`);
    console.log(`├── Total Tests: ${configSummary.totalTests}`);
    console.log(`├── Critical: ${configSummary.priorityBreakdown.critical}`);
    console.log(`├── High: ${configSummary.priorityBreakdown.high}`);
    console.log(`├── Medium: ${configSummary.priorityBreakdown.medium}`);
    console.log(`└── Low: ${configSummary.priorityBreakdown.low}`);
    console.log(`\n🚀 Open: ${htmlPath}`);

  } catch (error) {
    log(`❌ Report generation failed: ${error.message}`, 'error');
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateAllReports();
}

module.exports = { 
  generateAllReports, 
  TEST_CHECKLIST, 
  DEMO_CREDENTIALS, 
  REPORT_CONFIG 
};