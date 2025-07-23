/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * İ-EP.APP - Integration Test Environment Variables Loader
 * Bu dosya integration testleri öncesinde gerekli env değişkenlerini yükler
 */

const { config } = require('dotenv');
const path = require('path');

// FORCE load .env.test file directly
const envPath = path.resolve(process.cwd(), '.env.test');
console.log('🔧 Loading .env.test from:', envPath);

const result = config({ path: envPath, override: true });

// MANUAL environment variable setting for critical ones
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
}
if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379';
}
if (!process.env.TEST_TENANT_ID) {
  process.env.TEST_TENANT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
}

if (result.error) {
  console.warn('⚠️  Integration Test Environment Warning:', result.error.message);
  console.warn('📝 Make sure .env.test file exists with required variables');
}

// Validate critical environment variables for integration tests
const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REDIS_URL',
  'NEXTAUTH_SECRET',
  'TEST_TENANT_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Integration Test Environment Error:');
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('');
  console.error('🔧 Required variables in .env.test:');
  missingVars.forEach(varName => {
    console.error(`   ${varName}=your-value-here`);
  });
  console.error('');
  console.error('📖 See .env.example for reference values');
  process.exit(1);
}

// Set NODE_ENV to test if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Ensure test environment isolation
process.env.NODE_ENV = 'test';

// Integration test specific environment setup
process.env.TEST_ENVIRONMENT = 'integration';
process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';

console.log('✅ Integration test environment loaded successfully');
console.log(`📊 Database: ${process.env.DATABASE_URL?.includes('localhost') ? 'Local Supabase' : 'Remote'}`);
console.log(`🔄 Redis: ${process.env.REDIS_URL?.includes('localhost') ? 'Local Redis' : 'Remote'}`);
console.log(`🏢 Test Tenant: ${process.env.TEST_TENANT_ID}`);