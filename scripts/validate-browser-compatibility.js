#!/usr/bin/env node

/**
 * Browser Compatibility Validation Script
 * Validates CSS fixes for Chrome blank page and Safari garbled layout issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Browser Compatibility Validation Starting...\n');

// Configuration
const GLOBALS_CSS_PATH = path.join(__dirname, '../src/app/globals.css');
const BROWSERSLIST_PATH = path.join(__dirname, '../.browserslistrc');
const POSTCSS_CONFIG_PATH = path.join(__dirname, '../postcss.config.js');

// Validation functions
const validations = [
  {
    name: 'CSS Duplicate Definitions Check',
    validate: () => {
      const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8');
      const rootMatches = css.match(/@layer base\s*{[^}]*:root\s*{/g) || [];
      const darkMatches = css.match(/@layer base\s*{[^}]*\.dark\s*{/g) || [];
      
      return {
        success: rootMatches.length <= 1 && darkMatches.length <= 1,
        details: `Found ${rootMatches.length} :root definitions, ${darkMatches.length} .dark definitions`,
        fix: rootMatches.length > 1 || darkMatches.length > 1 ? 
          'Remove duplicate :root and .dark definitions from globals.css' : null
      };
    }
  },
  
  {
    name: 'OKLCH Color Space Check',
    validate: () => {
      const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8');
      const oklchMatches = css.match(/oklch\(/g) || [];
      
      return {
        success: oklchMatches.length === 0,
        details: `Found ${oklchMatches.length} OKLCH color definitions`,
        fix: oklchMatches.length > 0 ? 
          'Replace OKLCH colors with HSL equivalents for better browser support' : null
      };
    }
  },
  
  {
    name: 'Browserslist Configuration Check',
    validate: () => {
      const exists = fs.existsSync(BROWSERSLIST_PATH);
      let content = '';
      if (exists) {
        content = fs.readFileSync(BROWSERSLIST_PATH, 'utf8');
      }
      
      return {
        success: exists && content.includes('Chrome >= 90') && content.includes('Safari >= 14'),
        details: exists ? 'Browserslist configuration found with proper targets' : 'Browserslist configuration missing',
        fix: !exists ? 'Create .browserslistrc file with browser targets' : null
      };
    }
  },
  
  {
    name: 'PostCSS Autoprefixer Configuration',
    validate: () => {
      try {
        const config = require(POSTCSS_CONFIG_PATH);
        const hasAutoprefixer = config.plugins && config.plugins.autoprefixer;
        const hasOverrides = hasAutoprefixer && config.plugins.autoprefixer.overrideBrowserslist;
        
        return {
          success: hasAutoprefixer && hasOverrides,
          details: hasOverrides ? 'Autoprefixer configured with browser overrides' : 'Autoprefixer configuration incomplete',
          fix: !hasOverrides ? 'Add overrideBrowserslist to autoprefixer configuration' : null
        };
      } catch (error) {
        return {
          success: false,
          details: `PostCSS config error: ${error.message}`,
          fix: 'Fix PostCSS configuration syntax'
        };
      }
    }
  },
  
  {
    name: 'CSS Variable Definitions Consistency',
    validate: () => {
      const css = fs.readFileSync(GLOBALS_CSS_PATH, 'utf8');
      
      // Check for consistent color format (HSL not OKLCH)
      const hslPattern = /--[\w-]+:\s*\d+(?:\.\d+)?\s+\d+(?:\.\d+)?%\s+\d+(?:\.\d+)?%/g;
      const hslMatches = css.match(hslPattern) || [];
      
      // Check for essential CSS variables
      const essentialVars = ['--background', '--foreground', '--primary', '--border'];
      const hasEssentialVars = essentialVars.every(varName => css.includes(varName));
      
      return {
        success: hslMatches.length > 10 && hasEssentialVars,
        details: `Found ${hslMatches.length} HSL color definitions, essential variables: ${hasEssentialVars}`,
        fix: !hasEssentialVars ? 'Ensure all essential CSS variables are defined' : null
      };
    }
  },
  
  {
    name: 'Build System Compatibility',
    validate: () => {
      try {
        // Check if we can run browserslist command
        const browserslistOutput = execSync('npx browserslist', { encoding: 'utf8', stdio: 'pipe' });
        const supportedBrowsers = browserslistOutput.split('\n').filter(line => line.trim());
        
        // Check for key browsers
        const hasChrome = supportedBrowsers.some(browser => browser.includes('chrome'));
        const hasSafari = supportedBrowsers.some(browser => browser.includes('safari'));
        
        return {
          success: hasChrome && hasSafari && supportedBrowsers.length > 10,
          details: `Targeting ${supportedBrowsers.length} browser versions (Chrome: ${hasChrome}, Safari: ${hasSafari})`,
          fix: !hasChrome || !hasSafari ? 'Update browserslist configuration to include Chrome and Safari' : null
        };
      } catch (error) {
        return {
          success: false,
          details: `Build system error: ${error.message}`,
          fix: 'Ensure browserslist is properly installed and configured'
        };
      }
    }
  }
];

// Run validations
let allPassed = true;
const results = [];

console.log('Running validation checks...\n');

validations.forEach((validation, index) => {
  try {
    const result = validation.validate();
    results.push({ name: validation.name, ...result });
    
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${validation.name}`);
    console.log(`   ${result.details}`);
    
    if (result.fix) {
      console.log(`   🔧 Fix: ${result.fix}`);
      allPassed = false;
    }
    
    console.log('');
  } catch (error) {
    console.log(`${index + 1}. ❌ ${validation.name}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    allPassed = false;
  }
});

// Summary
console.log('=' .repeat(60));
console.log(`\n📊 VALIDATION SUMMARY\n`);

const passed = results.filter(r => r.success).length;
const total = results.length;

console.log(`✅ Passed: ${passed}/${total} checks`);
console.log(`❌ Failed: ${total - passed}/${total} checks\n`);

if (allPassed) {
  console.log('🎉 All validations passed! Browser compatibility fixes are properly implemented.');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Replace globals.css with globals-fixed.css');
  console.log('2. Clear build cache: rm -rf .next');
  console.log('3. Test in Chrome, Safari, Firefox, and Edge');
  console.log('4. Deploy changes');
} else {
  console.log('⚠️  Some validations failed. Please address the fixes mentioned above.');
  console.log('\n📋 IMMEDIATE ACTIONS REQUIRED:');
  
  results.forEach(result => {
    if (result.fix) {
      console.log(`• ${result.fix}`);
    }
  });
}

console.log('\n' + '=' .repeat(60));

// Generate validation report
const reportPath = path.join(__dirname, '../browser-compatibility-validation-report.json');
const report = {
  timestamp: new Date().toISOString(),
  overallSuccess: allPassed,
  totalChecks: total,
  passedChecks: passed,
  failedChecks: total - passed,
  results: results,
  nextSteps: allPassed ? [
    'Replace globals.css with globals-fixed.css',
    'Clear build cache: rm -rf .next',
    'Test in Chrome, Safari, Firefox, and Edge',
    'Deploy changes'
  ] : results.filter(r => r.fix).map(r => r.fix)
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Detailed report saved to: ${reportPath}`);

process.exit(allPassed ? 0 : 1);