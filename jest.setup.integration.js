/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * İ-EP.APP - Integration Test Setup Configuration
 * Bu dosya integration testleri için Jest setup'ını yapar
 */

// Set up test timeout for integration tests
jest.setTimeout(30000); // 30 seconds for database operations

// Global test utilities and mocks for integration tests
global.console = {
  ...console,
  // Less verbose logging in integration tests
  log: process.env.JEST_VERBOSE === 'true' ? console.log : jest.fn(),
  debug: jest.fn(), // Always mock debug
  info: process.env.JEST_VERBOSE === 'true' ? console.info : jest.fn(),
  warn: console.warn, // Always show warnings
  error: console.error, // Always show errors
};

// Mock external services for integration tests (but keep DB/Redis real)
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setLevel: jest.fn() })),
}));

// Mock email services in integration tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

// Mock payment services in integration tests
jest.mock('iyzipay', () => ({
  init: jest.fn(() => ({
    payment: {
      create: jest.fn().mockResolvedValue({ status: 'success' }),
    },
  })),
}));

// Setup global error handling for integration tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Integration Test - Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global test helpers for integration tests
global.testHelpers = {
  // Database connection check utility
  async checkDatabaseConnection() {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      return { connected: !error, error };
    } catch (err) {
      return { connected: false, error: err };
    }
  },

  // Redis connection check utility
  async checkRedisConnection() {
    try {
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({
        url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL,
        token: process.env.UPSTASH_REDIS_TOKEN || 'test-token',
      });
      
      await redis.set('test-key', 'test-value', { ex: 1 });
      const result = await redis.get('test-key');
      await redis.del('test-key');
      
      return { connected: result === 'test-value', error: null };
    } catch (err) {
      return { connected: false, error: err };
    }
  },

  // Test tenant ID generator
  getTestTenantId() {
    return process.env.TEST_TENANT_ID || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  },

  // Test user data generator
  generateTestUser(role = 'student') {
    const baseUser = {
      id: `test-${role}-${Date.now()}`,
      email: `test-${role}@i-ep.app`,
      tenant_id: this.getTestTenantId(),
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    switch (role) {
      case 'admin':
        return { ...baseUser, name: 'Test Admin', permissions: ['all'] };
      case 'teacher':
        return { ...baseUser, name: 'Test Teacher', permissions: ['grade', 'assignment'] };
      case 'student':
        return { ...baseUser, name: 'Test Student', permissions: ['view'] };
      case 'parent':
        return { ...baseUser, name: 'Test Parent', permissions: ['view_child'] };
      default:
        return baseUser;
    }
  }
};

console.log('🔧 Integration test setup completed');
console.log('🎯 Test environment: integration');
console.log('⏱️  Test timeout: 30 seconds');
console.log('🛠️  Global test helpers available');