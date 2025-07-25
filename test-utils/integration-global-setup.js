/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * İ-EP.APP - Integration Tests Global Setup
 * Tüm integration testleri öncesinde çalışır
 */

const { IntegrationTestManager } = require('./integration-test-setup');

module.exports = async () => {
  console.log('🚀 Starting integration tests global setup...');
  
  // CRITICAL: Load environment variables FIRST before Next.js wrapper can interfere
  const { config } = require('dotenv');
  const path = require('path');
  
  const envPath = path.resolve(process.cwd(), '.env.test');
  console.log('🔧 Loading .env.test from globalSetup:', envPath);
  
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
  
  console.log('✅ Global environment setup completed');
  console.log('📊 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('🔄 REDIS_URL:', process.env.REDIS_URL);
  
  const startTime = Date.now();
  
  try {
    // Create test manager instance
    const testManager = new IntegrationTestManager();
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const dbTest = await testManager.testDatabaseConnection();
    if (!dbTest.success) {
      throw new Error(`Database connection failed: ${dbTest.error}`);
    }
    console.log('✅ Database connection successful');
    
    // Test Redis connection
    console.log('🔍 Testing Redis connection...');
    const redisTest = await testManager.testRedisConnection();
    if (!redisTest.success) {
      console.warn('⚠️  Redis connection failed:', redisTest.error);
      console.warn('⚠️  Some tests may fail if they require Redis');
    } else {
      console.log('✅ Redis connection successful');
    }
    
    // Setup clean test environment
    console.log('🧹 Setting up clean test environment...');
    await testManager.setupTestEnvironment();
    
    // Store global test manager for cleanup
    global.__INTEGRATION_TEST_MANAGER__ = testManager;
    
    const endTime = Date.now();
    console.log(`✅ Integration tests global setup completed in ${endTime - startTime}ms`);
    console.log('🎯 Environment ready for integration testing');
    
  } catch (error) {
    console.error('❌ Integration tests global setup failed:', error.message);
    console.error('');
    console.error('🔧 Common solutions:');
    console.error('   1. Make sure Supabase is running: npx supabase start');
    console.error('   2. Make sure Redis is running: redis-server');
    console.error('   3. Check .env.test file has correct DATABASE_URL and REDIS_URL');
    console.error('   4. Verify test database is accessible');
    console.error('');
    
    // Don't fail immediately, let individual tests handle connection errors
    console.warn('⚠️  Continuing with setup warnings...');
  }
};