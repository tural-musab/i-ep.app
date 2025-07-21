const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

class EvidenceValidator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.evidenceConfig = this.loadEvidenceConfig();
    this.results = {};
  }

  loadEvidenceConfig() {
    try {
      const configPath = path.join(this.projectRoot, 'tracking/evidence-config.json');
      console.log(`📁 Loading evidence config from: ${configPath}`);

      if (!fs.existsSync(configPath)) {
        console.error(`❌ Evidence config not found at: ${configPath}`);
        console.log(`📁 Project root: ${this.projectRoot}`);
        console.log(`📁 Current working directory: ${process.cwd()}`);
        process.exit(1);
      }

      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load evidence config:', error.message);
      process.exit(1);
    }
  }

  async validateAll() {
    console.log('🔍 Starting Evidence-Based Validation...');
    console.log('========================================');

    for (const [taskId, task] of Object.entries(this.evidenceConfig.tasks)) {
      console.log(`\n📋 Validating: ${task.description}`);
      console.log(`   Claimed Status: ${task.claimed_status}`);
      console.log(`   Critical: ${task.critical ? '🔴 YES' : '🟡 NO'}`);

      const taskResult = await this.validateTask(taskId, task);
      this.results[taskId] = taskResult;

      // Real-time feedback
      const status = taskResult.verified ? '✅ VERIFIED' : '❌ EVIDENCE INSUFFICIENT';
      const score = `${taskResult.evidence_score}%`;
      console.log(`   Result: ${status} (${score})`);
    }

    return this.results;
  }

  async validateTask(taskId, task) {
    const evidenceResults = [];
    let totalScore = 0;
    let maxScore = 0;
    let criticalFailures = [];

    for (const validator of task.validators) {
      const result = await this.runValidator(validator);
      evidenceResults.push(result);

      if (result.passed) {
        totalScore += validator.weight;
      } else if (validator.required) {
        criticalFailures.push(validator.description);
      }
      maxScore += validator.weight;
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const meetsThreshold = percentage >= this.evidenceConfig.validation_threshold;
    const hasCriticalFailures = criticalFailures.length > 0;
    const isVerified = meetsThreshold && !hasCriticalFailures;

    return {
      task_id: taskId,
      description: task.description,
      claimed_complete: task.claimed_status === 'complete',
      evidence_score: percentage,
      meets_threshold: meetsThreshold,
      critical_failures: criticalFailures,
      verified: isVerified,
      status: isVerified ? 'VERIFIED' : 'EVIDENCE_INSUFFICIENT',
      evidence_details: evidenceResults,
      validation_timestamp: new Date().toISOString(),
    };
  }

  async runValidator(validator) {
    try {
      switch (validator.type) {
        case 'file_exists':
          return this.validateFileExists(validator);

        case 'api_endpoint':
          return this.validateApiEndpoint(validator);

        case 'test_suite':
          return this.validateTestSuite(validator);

        case 'component_exists':
          return this.validateComponentExists(validator);

        case 'file_upload_integration':
          return this.validateFileUploadIntegration(validator);

        case 'notification_system':
          return this.validateNotificationSystem(validator);

        case 'auth_config':
          return this.validateAuthConfig(validator);

        case 'demo_users':
          return this.validateDemoUsers(validator);

        case 'api_count':
          return this.validateApiCount(validator);

        case 'auth_pattern':
          return this.validateAuthPattern(validator);

        case 'error_handling':
          return this.validateErrorHandling(validator);

        case 'validation':
          return this.validateValidationSchemas(validator);

        case 'calculation_engine':
          return this.validateCalculationEngine(validator);

        case 'turkish_grading':
          return this.validateTurkishGrading(validator);

        case 'role_routing':
          return this.validateRoleRouting(validator);

        case 'session_management':
          return this.validateSessionManagement(validator);

        default:
          return {
            validator_type: validator.type,
            description: validator.description,
            passed: false,
            evidence: `Unknown validator type: ${validator.type}`,
            weight: validator.weight,
          };
      }
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Validation error: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateFileExists(validator) {
    const searchPath = path.join(this.projectRoot, validator.path);
    const { execSync } = require('child_process');

    try {
      // Use glob pattern to find files
      const command = `find "${path.dirname(searchPath)}" -name "${path.basename(validator.path)}" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const files = result.split('\n').filter((f) => f.length > 0);

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: files.length > 0,
        evidence:
          files.length > 0
            ? `Found ${files.length} matching files: ${files.slice(0, 3).join(', ')}`
            : 'No matching files found',
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Search failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateApiEndpoint(validator) {
    // For now, just check if the API route file exists
    const routePath = path.join(
      this.projectRoot,
      'src/app/api',
      validator.endpoint.substring(5),
      'route.ts'
    );
    const exists = fs.existsSync(routePath);

    return {
      validator_type: validator.type,
      description: validator.description,
      passed: exists,
      evidence: exists
        ? `API route file exists: ${routePath}`
        : `API route file missing: ${routePath}`,
      weight: validator.weight,
    };
  }

  validateTestSuite(validator) {
    try {
      // Check if test files exist
      const testDir = path.join(this.projectRoot, 'src/__tests__');
      const command = `find "${testDir}" -name "${validator.pattern}" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const testFiles = result.split('\n').filter((f) => f.length > 0);

      if (testFiles.length === 0) {
        return {
          validator_type: validator.type,
          description: validator.description,
          passed: false,
          evidence: `No test files found matching pattern: ${validator.pattern}`,
          weight: validator.weight,
        };
      }

      // Try to run tests and count them
      try {
        const testCommand = `cd "${this.projectRoot}" && npm test -- --testPathPattern="${validator.pattern}" --passWithNoTests --silent 2>&1`;
        const testOutput = execSync(testCommand, { encoding: 'utf8' });

        // Extract test count from output
        const testCountMatch = testOutput.match(/(\d+) passed/);
        const testCount = testCountMatch ? parseInt(testCountMatch[1]) : 0;
        const meetsMinimum = validator.min_tests ? testCount >= validator.min_tests : testCount > 0;

        return {
          validator_type: validator.type,
          description: validator.description,
          passed: meetsMinimum,
          evidence: `Found ${testFiles.length} test files, ${testCount} tests passed. Required: ${validator.min_tests || 'any'}`,
          weight: validator.weight,
        };
      } catch (testError) {
        return {
          validator_type: validator.type,
          description: validator.description,
          passed: false,
          evidence: `Test execution failed: ${testError.message}`,
          weight: validator.weight,
        };
      }
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateComponentExists(validator) {
    const searchPath = path.join(this.projectRoot, validator.path);

    try {
      const command = `find "${path.dirname(searchPath)}" -name "*.tsx" -o -name "*.ts" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const components = result.split('\n').filter((f) => f.length > 0);

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: components.length > 0,
        evidence:
          components.length > 0
            ? `Found ${components.length} component files`
            : 'No component files found',
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Component search failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateAuthConfig(validator) {
    const authPath = path.join(this.projectRoot, validator.path);

    try {
      const command = `find "${authPath}" -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const authFiles = result.split('\n').filter((f) => f.length > 0);

      // Check for NextAuth specific files
      const hasAuthConfig = authFiles.some(
        (file) =>
          file.includes('auth') &&
          (file.includes('config') || file.includes('context') || file.includes('session'))
      );

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: hasAuthConfig,
        evidence: hasAuthConfig
          ? `Found auth configuration files: ${authFiles.length} files`
          : 'No auth configuration found',
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Auth config validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateDemoUsers(validator) {
    // Check if demo user creation script exists
    const demoScript = path.join(this.projectRoot, 'scripts/create-demo-users.js');
    const exists = fs.existsSync(demoScript);

    return {
      validator_type: validator.type,
      description: validator.description,
      passed: exists,
      evidence: exists ? 'Demo users script exists' : 'Demo users script not found',
      weight: validator.weight,
    };
  }

  validateApiCount(validator) {
    try {
      const apiDir = path.join(this.projectRoot, 'src/app/api');
      const command = `find "${apiDir}" -name "route.ts" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const apiFiles = result.split('\n').filter((f) => f.length > 0);

      const meetsMinimum = apiFiles.length >= validator.min_endpoints;

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: meetsMinimum,
        evidence: `Found ${apiFiles.length} API endpoints. Required: ${validator.min_endpoints}`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `API count validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateCalculationEngine(validator) {
    // Look for calculation logic in grade repository and related files
    const gradeRepoPath = path.join(this.projectRoot, 'src/lib/repository/grade-repository.ts');
    const analyticsPath = path.join(this.projectRoot, 'src/lib/analytics');
    
    try {
      let calcFiles = [];
      
      // Check grade repository
      if (fs.existsSync(gradeRepoPath)) {
        const content = fs.readFileSync(gradeRepoPath, 'utf8');
        if (content.includes('calculateGPA') || content.includes('calculation')) {
          calcFiles.push(gradeRepoPath);
        }
      }
      
      // Check analytics directory
      if (fs.existsSync(analyticsPath)) {
        const command = `find "${analyticsPath}" -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`;
        const result = execSync(command, { encoding: 'utf8' }).trim();
        const analyticsFiles = result.split('\n').filter((f) => f.length > 0);
        calcFiles = calcFiles.concat(analyticsFiles);
      }

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: calcFiles.length > 0,
        evidence:
          calcFiles.length > 0
            ? `Found ${calcFiles.length} calculation files in repository and analytics`
            : 'No calculation files found',
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Calculation engine validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateFileUploadIntegration(validator) {
    const storagePath = path.join(this.projectRoot, validator.path);

    try {
      const command = `find "${storagePath}" -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const storageFiles = result.split('\n').filter((f) => f.length > 0);

      // Check for key storage components
      const hasStorageIndex = storageFiles.some(f => f.includes('index.ts'));
      const hasProviders = storageFiles.some(f => f.includes('provider'));
      const hasRepository = storageFiles.some(f => f.includes('repository'));

      const integrationComplete = hasStorageIndex && hasProviders && hasRepository;

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: integrationComplete,
        evidence: integrationComplete 
          ? `Complete storage integration found: ${storageFiles.length} files`
          : `Partial storage integration: ${storageFiles.length} files`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `File upload validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateNotificationSystem(validator) {
    // Check for notification-related files
    const notificationPaths = [
      'src/lib/notifications',
      'src/components/notifications',
      'src/app/api/notifications'
    ];

    try {
      let notificationFiles = [];

      for (const notifPath of notificationPaths) {
        const fullPath = path.join(this.projectRoot, notifPath);
        if (fs.existsSync(fullPath)) {
          const command = `find "${fullPath}" -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`;
          const result = execSync(command, { encoding: 'utf8' }).trim();
          const files = result.split('\n').filter((f) => f.length > 0);
          notificationFiles = notificationFiles.concat(files);
        }
      }

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: notificationFiles.length > 0,
        evidence: notificationFiles.length > 0
          ? `Found ${notificationFiles.length} notification files`
          : 'No notification system files found',
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Notification system validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateAuthPattern(validator) {
    try {
      const apiDir = path.join(this.projectRoot, 'src/app/api');
      const command = `find "${apiDir}" -name "route.ts" -exec grep -l "${validator.pattern}" {} \\; 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const authPatternFiles = result.split('\n').filter((f) => f.length > 0);

      // Get total API files for percentage
      const totalApiCommand = `find "${apiDir}" -name "route.ts" 2>/dev/null || true`;
      const totalResult = execSync(totalApiCommand, { encoding: 'utf8' }).trim();
      const totalApiFiles = totalResult.split('\n').filter((f) => f.length > 0).length;

      const percentage = totalApiFiles > 0 ? Math.round((authPatternFiles.length / totalApiFiles) * 100) : 0;
      const hasConsistentPattern = percentage >= 50; // At least 50% coverage

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: hasConsistentPattern,
        evidence: `Auth pattern found in ${authPatternFiles.length}/${totalApiFiles} API endpoints (${percentage}%)`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Auth pattern validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateErrorHandling(validator) {
    try {
      const apiDir = path.join(this.projectRoot, 'src/app/api');
      let errorHandlingFiles = 0;
      let totalApiFiles = 0;

      // Check each API route for proper error handling
      const command = `find "${apiDir}" -name "route.ts" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const apiFiles = result.split('\n').filter((f) => f.length > 0);

      for (const apiFile of apiFiles) {
        totalApiFiles++;
        const content = fs.readFileSync(apiFile, 'utf8');
        
        // Check for proper error handling patterns
        const hasErrorHandling = content.includes('try') && content.includes('catch') &&
                                (content.includes('NextResponse.json') || content.includes('Response'));
        const hasStatusCodes = validator.expected_codes.some(code => content.includes(code.toString()));
        
        if (hasErrorHandling && hasStatusCodes) {
          errorHandlingFiles++;
        }
      }

      const percentage = totalApiFiles > 0 ? Math.round((errorHandlingFiles / totalApiFiles) * 100) : 0;
      const hasProperErrorHandling = percentage >= 60; // At least 60% coverage

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: hasProperErrorHandling,
        evidence: `Proper error handling in ${errorHandlingFiles}/${totalApiFiles} API endpoints (${percentage}%)`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Error handling validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateValidationSchemas(validator) {
    const validationPath = path.join(this.projectRoot, validator.path);

    try {
      const command = `find "${validationPath}" -name "*.ts" -o -name "*.tsx" 2>/dev/null || true`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const validationFiles = result.split('\n').filter((f) => f.length > 0);

      let zodSchemas = 0;
      for (const file of validationFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('z.') && (content.includes('schema') || content.includes('Schema'))) {
          zodSchemas++;
        }
      }

      const hasValidationSchemas = zodSchemas >= 3; // At least 3 validation schemas

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: hasValidationSchemas,
        evidence: hasValidationSchemas 
          ? `Found ${zodSchemas} Zod validation schemas in ${validationFiles.length} files`
          : `Only ${zodSchemas} validation schemas found`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Validation schemas check failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateTurkishGrading(validator) {
    const gradeTypesPath = path.join(this.projectRoot, validator.path);

    if (!fs.existsSync(gradeTypesPath)) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Grade types file not found: ${validator.path}`,
        weight: validator.weight,
      };
    }

    try {
      const content = fs.readFileSync(gradeTypesPath, 'utf8');
      const hasAllGrades = validator.expected_content.every((grade) => content.includes(grade));

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: hasAllGrades,
        evidence: hasAllGrades ? 'All Turkish grades (AA-FF) found' : 'Some Turkish grades missing',
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Turkish grading validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateRoleRouting(validator) {
    try {
      let foundPaths = [];
      let totalPaths = validator.paths ? validator.paths.length : 0;

      for (const routePath of validator.paths || []) {
        // Check if route page exists
        let pageFound = false;

        if (routePath === '/dashboard') {
          const dashboardPath = path.join(this.projectRoot, 'src/app/dashboard/page.tsx');
          pageFound = fs.existsSync(dashboardPath);
        } else if (routePath === '/ogretmen') {
          const teacherPath = path.join(this.projectRoot, 'src/app/ogretmen/page.tsx');
          pageFound = fs.existsSync(teacherPath);
        } else if (routePath === '/veli') {
          const parentPath = path.join(this.projectRoot, 'src/app/veli/page.tsx');
          pageFound = fs.existsSync(parentPath);
        }

        if (pageFound) {
          foundPaths.push(routePath);
        }
      }

      const allPathsFound = foundPaths.length === totalPaths;

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: allPathsFound,
        evidence: allPathsFound
          ? `All ${totalPaths} role-based routes found: ${foundPaths.join(', ')}`
          : `Found ${foundPaths.length}/${totalPaths} routes: ${foundPaths.join(', ')}`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Role routing validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  validateSessionManagement(validator) {
    try {
      const authFiles = [
        'src/lib/auth/server-session.ts',
        'src/lib/auth/auth-context.tsx',
        'src/lib/auth/auth-options.ts',
      ];

      let foundFiles = [];

      for (const authFile of authFiles) {
        const filePath = path.join(this.projectRoot, authFile);
        if (fs.existsSync(filePath)) {
          foundFiles.push(authFile);
        }
      }

      const hasSessionSupport = foundFiles.length >= 2; // At least 2 session-related files

      return {
        validator_type: validator.type,
        description: validator.description,
        passed: hasSessionSupport,
        evidence: hasSessionSupport
          ? `Session management files found: ${foundFiles.join(', ')}`
          : `Insufficient session files: ${foundFiles.join(', ')}`,
        weight: validator.weight,
      };
    } catch (error) {
      return {
        validator_type: validator.type,
        description: validator.description,
        passed: false,
        evidence: `Session management validation failed: ${error.message}`,
        weight: validator.weight,
      };
    }
  }

  generateSummaryReport() {
    console.log('\n📊 EVIDENCE VALIDATION SUMMARY');
    console.log('==============================');

    const totalTasks = Object.keys(this.results).length;
    const verifiedTasks = Object.values(this.results).filter((r) => r.verified).length;
    const criticalTasks = Object.values(this.results).filter(
      (r) => this.evidenceConfig.tasks[r.task_id].critical
    ).length;
    const verifiedCritical = Object.values(this.results).filter(
      (r) => r.verified && this.evidenceConfig.tasks[r.task_id].critical
    ).length;

    console.log(`\n🎯 Overall Status:`);
    console.log(`   Total Tasks: ${totalTasks}`);
    console.log(
      `   Verified: ${verifiedTasks}/${totalTasks} (${Math.round((verifiedTasks / totalTasks) * 100)}%)`
    );
    console.log(`   Critical Tasks: ${criticalTasks}`);
    console.log(
      `   Critical Verified: ${verifiedCritical}/${criticalTasks} (${Math.round((verifiedCritical / criticalTasks) * 100)}%)`
    );

    console.log(`\n📋 Task Details:`);
    for (const [taskId, result] of Object.entries(this.results)) {
      const critical = this.evidenceConfig.tasks[taskId].critical ? '🔴' : '🟡';
      const status = result.verified ? '✅' : '❌';
      console.log(`   ${critical} ${status} ${result.description} (${result.evidence_score}%)`);

      if (!result.verified && result.critical_failures.length > 0) {
        console.log(`      🚨 Critical failures: ${result.critical_failures.join(', ')}`);
      }
    }

    return {
      total_tasks: totalTasks,
      verified_tasks: verifiedTasks,
      verification_rate: Math.round((verifiedTasks / totalTasks) * 100),
      critical_tasks: criticalTasks,
      critical_verified: verifiedCritical,
      critical_rate: Math.round((verifiedCritical / criticalTasks) * 100),
      overall_health: verifiedCritical === criticalTasks ? 'HEALTHY' : 'NEEDS_ATTENTION',
    };
  }

  async updateUnifiedTracking() {
    try {
      const configPath = path.join(this.projectRoot, 'tracking/unified-tracking.yaml');
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));

      // Update evidence validation results
      config.evidence_validation.last_validation = new Date().toISOString();

      for (const [taskId, result] of Object.entries(this.results)) {
        if (config.evidence_validation.results[taskId]) {
          config.evidence_validation.results[taskId] = {
            claimed: result.claimed_complete,
            evidence_score: result.evidence_score,
            verified: result.verified,
            status: result.status.toLowerCase(),
            last_checked: result.validation_timestamp,
          };
        }
      }

      // Save updated config
      fs.writeFileSync(configPath, yaml.dump(config));
      console.log('\n✅ Updated unified-tracking.yaml with evidence results');
    } catch (error) {
      console.error('\n❌ Failed to update unified tracking:', error.message);
    }
  }
}

// CLI execution
if (require.main === module) {
  (async () => {
    const validator = new EvidenceValidator();

    try {
      await validator.validateAll();
      const summary = validator.generateSummaryReport();
      await validator.updateUnifiedTracking();

      console.log('\n🎉 Evidence validation completed!');
      console.log(`Overall health: ${summary.overall_health}`);

      // Note: For GitHub Actions, we don't exit with error code
      // This allows continuous tracking even with low evidence scores
      console.log(`\n📊 Critical verification rate: ${summary.critical_rate}%`);
      process.exit(0); // Always exit successfully for tracking purposes
    } catch (error) {
      console.error('\n❌ Validation failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { EvidenceValidator };
