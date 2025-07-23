#!/usr/bin/env node

/**
 * Professional Evidence Collection Automation
 * İ-EP.APP - Automatic evidence gathering for verification
 * 
 * This script automatically collects evidence for professional verification
 * instead of relying on manual documentation claims.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProfessionalEvidenceCollector {
  constructor() {
    this.projectRoot = process.cwd();
    this.evidenceDir = path.join(this.projectRoot, 'verification/evidence');
    this.timestamp = new Date().toISOString();
    this.results = {
      timestamp: this.timestamp,
      methodology: 'professional-evidence-collection',
      evidence: {},
      summary: {}
    };
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      'verification/evidence',
      'verification/reports',
      'verification/api-tests',
      'verification/build-logs'
    ];
    
    dirs.forEach(dir => {
      const fullPath = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * API Implementation Evidence Collection
   */
  async collectAPIEvidence() {
    console.log('🔗 Collecting API Implementation Evidence...');
    
    const apiEvidence = {
      endpoints: [],
      implementations: [],
      tests: [],
      validationSchemas: []
    };

    try {
      // Find API route files
      const apiRoutes = this.findFiles('src/app/api', '**/*.ts');
      apiEvidence.endpoints = apiRoutes.map(file => ({
        path: file,
        size: fs.statSync(file).size,
        lastModified: fs.statSync(file).mtime
      }));

      // Find API implementation files
      const apiLibs = this.findFiles('src/lib/api', '**/*.ts');
      apiEvidence.implementations = apiLibs.map(file => ({
        path: file,
        size: fs.statSync(file).size,
        exports: this.extractExports(file)
      }));

      // Find validation schemas
      const validationFiles = this.findFiles('src', '**/validation.ts');
      apiEvidence.validationSchemas = validationFiles.map(file => ({
        path: file,
        schemas: this.extractZodSchemas(file)
      }));

      // Find API tests
      const apiTests = this.findFiles('src/__tests__', '**/*api*.test.*');
      apiEvidence.tests = apiTests.map(file => ({
        path: file,
        testCount: this.countTests(file)
      }));

      console.log(`📊 API Evidence: ${apiEvidence.endpoints.length} endpoints, ${apiEvidence.implementations.length} implementations, ${apiEvidence.tests.length} test files`);
      
    } catch (error) {
      console.error('❌ API Evidence Collection Error:', error.message);
    }

    this.results.evidence.api = apiEvidence;
    return apiEvidence;
  }

  /**
   * Database Implementation Evidence Collection
   */
  async collectDatabaseEvidence() {
    console.log('🗄️ Collecting Database Implementation Evidence...');
    
    const dbEvidence = {
      migrations: [],
      repositories: [],
      schemas: []
    };

    try {
      // Find migration files  
      const migrations = this.findFiles('supabase/migrations', '*.sql');
      dbEvidence.migrations = migrations.map(file => ({
        path: file,
        size: fs.statSync(file).size,
        tables: this.extractSQLTables(file),
        lastModified: fs.statSync(file).mtime
      }));

      // Find repository implementations
      const repositories = this.findFiles('src/lib/repository', '*.ts');
      dbEvidence.repositories = repositories.map(file => ({
        path: file,
        methods: this.extractRepositoryMethods(file)
      }));

      console.log(`📊 Database Evidence: ${dbEvidence.migrations.length} migrations, ${dbEvidence.repositories.length} repositories`);
      
    } catch (error) {
      console.error('❌ Database Evidence Collection Error:', error.message);
    }

    this.results.evidence.database = dbEvidence;
    return dbEvidence;
  }

  /**
   * Component Implementation Evidence Collection
   */
  async collectComponentEvidence() {
    console.log('🎨 Collecting Component Implementation Evidence...');
    
    const componentEvidence = {
      dashboards: [],
      pages: [],
      uiComponents: []
    };

    try {
      // Find dashboard components
      const dashboards = this.findFiles('src/components/dashboard', '*.tsx');
      componentEvidence.dashboards = dashboards.map(file => ({
        path: file,
        size: fs.statSync(file).size,
        apiCalls: this.extractAPICallsFromComponent(file)
      }));

      // Find page components
      const pages = this.findFiles('src/app', '**/page.tsx');
      componentEvidence.pages = pages.map(file => ({
        path: file,
        route: this.extractRouteFromPagePath(file)
      }));

      // Find UI components
      const uiComponents = this.findFiles('src/components/ui', '*.tsx');
      componentEvidence.uiComponents = uiComponents.map(file => ({
        path: file,
        component: path.basename(file, '.tsx')
      }));

      console.log(`📊 Component Evidence: ${componentEvidence.dashboards.length} dashboards, ${componentEvidence.pages.length} pages, ${componentEvidence.uiComponents.length} UI components`);
      
    } catch (error) {
      console.error('❌ Component Evidence Collection Error:', error.message);
    }

    this.results.evidence.components = componentEvidence;
    return componentEvidence;
  }

  /**
   * Test Coverage Evidence Collection
   */
  async collectTestEvidence() {
    console.log('🧪 Collecting Test Coverage Evidence...');
    
    const testEvidence = {
      unitTests: [],
      integrationTests: [],
      coverage: null
    };

    try {
      // Find unit tests
      const unitTests = this.findFiles('src/__tests__', '*-unit.test.*');
      testEvidence.unitTests = unitTests.map(file => ({
        path: file,
        testCount: this.countTests(file),
        describes: this.extractDescribeBlocks(file)
      }));

      // Find integration tests
      const integrationTests = this.findFiles('src/__tests__', '*integration*.test.*');
      testEvidence.integrationTests = integrationTests.map(file => ({
        path: file,
        testCount: this.countTests(file)
      }));

      // Try to get test coverage
      try {
        const coverageOutput = execSync('npm test -- --coverage --passWithNoTests --silent', { 
          encoding: 'utf8',
          timeout: 30000
        });
        testEvidence.coverage = this.parseCoverageOutput(coverageOutput);
      } catch (error) {
        console.log('⚠️ Could not get test coverage:', error.message);
      }

      console.log(`📊 Test Evidence: ${testEvidence.unitTests.length} unit tests, ${testEvidence.integrationTests.length} integration tests`);
      
    } catch (error) {
      console.error('❌ Test Evidence Collection Error:', error.message);
    }

    this.results.evidence.tests = testEvidence;
    return testEvidence;
  }

  /**
   * Build System Evidence Collection
   */
  async collectBuildEvidence() {
    console.log('🏗️ Collecting Build System Evidence...');
    
    const buildEvidence = {
      buildStatus: null,
      buildOutput: null,
      typeErrors: [],
      warnings: []
    };

    try {
      console.log('Running TypeScript build check...');
      const buildOutput = execSync('npm run build', { 
        encoding: 'utf8',
        timeout: 120000
      });
      
      buildEvidence.buildStatus = 'success';
      buildEvidence.buildOutput = buildOutput;
      buildEvidence.warnings = this.extractWarnings(buildOutput);
      
      console.log('✅ Build successful');
      
    } catch (error) {
      buildEvidence.buildStatus = 'failed';
      buildEvidence.buildOutput = error.stdout || error.message;
      buildEvidence.typeErrors = this.extractTypeErrors(buildEvidence.buildOutput);
      
      console.log('❌ Build failed');
    }

    this.results.evidence.build = buildEvidence;
    return buildEvidence;
  }

  /**
   * Generate Professional Evidence Summary
   */
  generateSummary() {
    console.log('📋 Generating Professional Evidence Summary...');
    
    const summary = {
      totalFiles: 0,
      evidenceStrength: {},
      criticalIssues: [],
      verificationScore: 0
    };

    // Calculate evidence strength for each category
    Object.entries(this.results.evidence).forEach(([category, evidence]) => {
      let strength = 0;
      let fileCount = 0;

      switch (category) {
        case 'api':
          fileCount = evidence.endpoints?.length || 0;
          strength = Math.min(100, (fileCount * 10) + (evidence.implementations?.length || 0) * 15);
          break;
        case 'database':
          fileCount = evidence.migrations?.length || 0;
          strength = Math.min(100, (fileCount * 20) + (evidence.repositories?.length || 0) * 15);
          break;
        case 'components':
          fileCount = (evidence.dashboards?.length || 0) + (evidence.pages?.length || 0);
          strength = Math.min(100, fileCount * 5);
          break;
        case 'tests':
          fileCount = (evidence.unitTests?.length || 0) + (evidence.integrationTests?.length || 0);
          strength = Math.min(100, fileCount * 8);
          break;
        case 'build':
          strength = evidence.buildStatus === 'success' ? 100 : 0;
          break;
      }

      summary.evidenceStrength[category] = {
        strength: Math.round(strength),
        fileCount
      };
      summary.totalFiles += fileCount;
    });

    // Calculate overall verification score
    const strengths = Object.values(summary.evidenceStrength).map(s => s.strength);
    summary.verificationScore = Math.round(strengths.reduce((a, b) => a + b, 0) / strengths.length);

    // Identify critical issues
    if (summary.evidenceStrength.build?.strength < 100) {
      summary.criticalIssues.push('Build system failure detected');
    }
    if (summary.evidenceStrength.api?.strength < 70) {
      summary.criticalIssues.push('Insufficient API implementation evidence');
    }
    if (summary.evidenceStrength.tests?.strength < 60) {
      summary.criticalIssues.push('Low test coverage evidence');
    }

    this.results.summary = summary;
    return summary;
  }

  /**
   * Save Evidence Report
   */
  async saveReport() {
    const reportPath = path.join(this.projectRoot, 'verification/reports', `evidence-collection-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`📄 Professional Evidence Report saved: ${reportPath}`);
    return reportPath;
  }

  // Helper methods
  findFiles(dir, pattern) {
    const files = [];
    try {
      const fullDir = path.join(this.projectRoot, dir);
      if (!fs.existsSync(fullDir)) return files;
      
      const items = fs.readdirSync(fullDir, { recursive: true });
      items.forEach(item => {
        const fullPath = path.join(fullDir, item);
        if (fs.statSync(fullPath).isFile() && this.matchesPattern(item, pattern)) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      console.log(`⚠️ Error reading directory ${dir}:`, error.message);
    }
    return files;
  }

  matchesPattern(filename, pattern) {
    // Simple pattern matching - can be enhanced
    return filename.includes(pattern.replace('**/', '').replace('*', ''));
  }

  extractExports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const exports = [];
      const exportMatches = content.match(/export\s+(const|function|class|interface|type)\s+(\w+)/g) || [];
      exportMatches.forEach(match => {
        const name = match.split(/\s+/).pop();
        exports.push(name);
      });
      return exports;
    } catch (error) {
      return [];
    }
  }

  extractZodSchemas(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const schemas = [];
      const schemaMatches = content.match(/const\s+(\w*Schema)\s*=/g) || [];
      schemaMatches.forEach(match => {
        const name = match.match(/const\s+(\w*Schema)/)[1];
        schemas.push(name);
      });
      return schemas;
    } catch (error) {
      return [];
    }
  }

  countTests(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const testMatches = content.match(/^\s*(it|test)\s*\(/gm) || [];
      return testMatches.length;
    } catch (error) {
      return 0;
    }
  }

  extractSQLTables(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const tableMatches = content.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi) || [];
      return tableMatches.map(match => match.match(/(\w+)$/)[1]);
    } catch (error) {
      return [];
    }
  }

  extractRepositoryMethods(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const methodMatches = content.match(/async\s+(\w+)\s*\(/g) || [];
      return methodMatches.map(match => match.match(/async\s+(\w+)/)[1]);
    } catch (error) {
      return [];
    }
  }

  extractAPICallsFromComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const apiCalls = [];
      
      // Look for fetch calls
      const fetchMatches = content.match(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
      fetchMatches.forEach(match => {
        const url = match.match(/['"`]([^'"`]+)['"`]/)[1];
        apiCalls.push({ type: 'fetch', url });
      });
      
      // Look for API client calls
      const apiMatches = content.match(/\w+Api\.\w+\(/g) || [];
      apiMatches.forEach(match => {
        apiCalls.push({ type: 'api-client', call: match });
      });
      
      return apiCalls;
    } catch (error) {
      return [];
    }
  }

  extractRouteFromPagePath(filePath) {
    const relativePath = path.relative(path.join(this.projectRoot, 'src/app'), filePath);
    return '/' + relativePath.replace(/\/page\.tsx$/, '').replace(/\\/g, '/');
  }

  extractDescribeBlocks(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const describeMatches = content.match(/describe\s*\(\s*['"`]([^'"`]+)['"`]/g) || [];
      return describeMatches.map(match => match.match(/['"`]([^'"`]+)['"`]/)[1]);
    } catch (error) {
      return [];
    }
  }

  parseCoverageOutput(output) {
    try {
      const lines = output.split('\n');
      const coverageLine = lines.find(line => line.includes('All files'));
      if (coverageLine) {
        const match = coverageLine.match(/(\d+\.?\d*)/g);
        if (match) {
          return {
            statements: parseFloat(match[0]),
            branches: parseFloat(match[1]),
            functions: parseFloat(match[2]),
            lines: parseFloat(match[3])
          };
        }
      }
    } catch (error) {
      console.log('Could not parse coverage output');
    }
    return null;
  }

  extractWarnings(buildOutput) {
    const warnings = [];
    const lines = buildOutput.split('\n');
    lines.forEach(line => {
      if (line.toLowerCase().includes('warning')) {
        warnings.push(line.trim());
      }
    });
    return warnings;
  }

  extractTypeErrors(buildOutput) {
    const errors = [];
    const lines = buildOutput.split('\n');
    lines.forEach(line => {
      if (line.includes('error TS')) {
        errors.push(line.trim());
      }
    });
    return errors;
  }

  /**
   * Main collection method
   */
  async collectAll() {
    console.log('🔍 Starting Professional Evidence Collection...');
    console.log('==============================================');
    
    await this.collectAPIEvidence();
    await this.collectDatabaseEvidence();
    await this.collectComponentEvidence();
    await this.collectTestEvidence();
    await this.collectBuildEvidence();
    
    const summary = this.generateSummary();
    const reportPath = await this.saveReport();
    
    console.log('\n📊 Professional Evidence Collection Complete!');
    console.log('==============================================');
    console.log(`📁 Total Files Analyzed: ${summary.totalFiles}`);
    console.log(`🎯 Verification Score: ${summary.verificationScore}%`);
    console.log(`🚨 Critical Issues: ${summary.criticalIssues.length}`);
    console.log(`📄 Report: ${reportPath}`);
    
    if (summary.criticalIssues.length > 0) {
      console.log('\n🚨 Critical Issues Detected:');
      summary.criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return this.results;
  }
}

// CLI Usage
if (require.main === module) {
  const collector = new ProfessionalEvidenceCollector();
  collector.collectAll()
    .then(results => {
      process.exit(results.summary.criticalIssues.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Evidence Collection Failed:', error);
      process.exit(1);
    });
}

module.exports = ProfessionalEvidenceCollector;