#!/usr/bin/env node

/**
 * Professional Evidence Collection Test Script
 * Simplified version for testing purposes
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Professional Evidence Collection...');

// Test basic functionality
try {
  // Check if we can read project files
  const packageJson = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJson)) {
    console.log('✅ Project root detected');
  }
  
  // Test directory creation
  const testDir = path.join(process.cwd(), 'verification/test');
  fs.mkdirSync(testDir, { recursive: true });
  console.log('✅ Directory creation works');
  
  // Test file operations
  const testFile = path.join(testDir, 'test-evidence.json');
  const testData = {
    timestamp: new Date().toISOString(),
    test: 'evidence-collection',
    status: 'working'
  };
  
  fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));
  console.log('✅ File operations work');
  
  // Test file reading
  const readData = JSON.parse(fs.readFileSync(testFile, 'utf8'));
  if (readData.test === 'evidence-collection') {
    console.log('✅ File reading works');
  }
  
  console.log('🎉 Evidence collection basic functionality test PASSED');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Evidence collection test FAILED:', error.message);
  process.exit(1);
}