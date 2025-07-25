/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * İ-EP.APP - Integration Test Utilities & Setup
 * Gerçek database ve Redis bağlantıları için test setup utilities
 */

const { createClient } = require('@supabase/supabase-js');

/**
 * Integration Test Data Manager
 * Gerçek database ile clean fixtures için test data yönetimi
 */
class IntegrationTestManager {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.testTenantId = process.env.TEST_TENANT_ID;
    this.cleanupTasks = [];
  }

  /**
   * Test tenant için clean environment hazırlar
   */
  async setupTestEnvironment() {
    console.log('🧹 Setting up clean test environment...');
    
    // Clean existing test data
    await this.cleanupTestData();
    
    // Create test tenant if not exists
    await this.ensureTestTenant();
    
    console.log('✅ Test environment ready');
  }

  /**
   * Test sonrası cleanup yapar
   */
  async cleanupTestEnvironment() {
    console.log('🧹 Cleaning up test environment...');
    
    // Execute all cleanup tasks
    for (const cleanup of this.cleanupTasks) {
      try {
        await cleanup();
      } catch (error) {
        console.warn('⚠️  Cleanup task failed:', error.message);
      }
    }
    
    // Final cleanup of test data
    await this.cleanupTestData();
    
    console.log('✅ Test environment cleaned');
  }

  /**
   * Test tenant'ın var olduğundan emin olur
   */
  async ensureTestTenant() {
    if (!this.testTenantId) {
      throw new Error('TEST_TENANT_ID environment variable is required');
    }

    const { data: existingTenant } = await this.supabase
      .from('tenants')
      .select('id')
      .eq('id', this.testTenantId)
      .single();

    if (!existingTenant) {
      const { error } = await this.supabase
        .from('tenants')
        .insert({
          id: this.testTenantId,
          name: 'Test School',
          subdomain: 'test-school',
          domain: 'test.i-ep.app',
          status: 'active',
          settings: {
            locale: 'tr',
            timezone: 'Europe/Istanbul',
            academic_year: '2024-2025'
          }
        });

      if (error) {
        console.warn('⚠️  Could not create test tenant:', error.message);
      } else {
        console.log('✅ Test tenant created');
      }
    }
  }

  /**
   * Test data'yı temizler
   */
  async cleanupTestData() {
    const tables = [
      'grade_comments',
      'grades', 
      'attendance_records',
      'assignments',
      'users',
      'classes',
      'subjects'
    ];

    for (const table of tables) {
      try {
        const { error } = await this.supabase
          .from(table)
          .delete()
          .eq('tenant_id', this.testTenantId);

        if (error && !error.message.includes('does not exist')) {
          console.warn(`⚠️  Could not clean ${table}:`, error.message);
        }
      } catch (err) {
        // Table might not exist yet, ignore
      }
    }
  }

  /**
   * Test user oluşturur ve cleanup task ekler
   */
  async createTestUser(userData = {}) {
    const defaultUser = {
      id: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: `test-${Date.now()}@i-ep.app`,
      tenant_id: this.testTenantId,
      role: 'student',
      name: 'Test User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData
    };

    const { data, error } = await this.supabase
      .from('users')
      .insert(defaultUser)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }

    // Add cleanup task
    this.cleanupTasks.push(async () => {
      await this.supabase
        .from('users')
        .delete()
        .eq('id', data.id);
    });

    return data;
  }

  /**
   * Test class oluşturur
   */
  async createTestClass(classData = {}) {
    const defaultClass = {
      id: `test-class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: this.testTenantId,
      name: 'Test Sınıfı',
      grade_level: 9,
      academic_year: '2024-2025',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...classData
    };

    const { data, error } = await this.supabase
      .from('classes')
      .insert(defaultClass)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create test class: ${error.message}`);
    }

    // Add cleanup task
    this.cleanupTasks.push(async () => {
      await this.supabase
        .from('classes')
        .delete()
        .eq('id', data.id);
    });

    return data;
  }

  /**
   * Test assignment oluşturur
   */
  async createTestAssignment(assignmentData = {}) {
    const defaultAssignment = {
      id: `test-assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: this.testTenantId,
      title: 'Test Ödevi',
      description: 'Bu bir test ödevi açıklamasıdır',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...assignmentData
    };

    const { data, error } = await this.supabase
      .from('assignments')
      .insert(defaultAssignment)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create test assignment: ${error.message}`);
    }

    // Add cleanup task
    this.cleanupTasks.push(async () => {
      await this.supabase
        .from('assignments')
        .delete()
        .eq('id', data.id);
    });

    return data;
  }

  /**
   * Database bağlantısını test eder
   */
  async testDatabaseConnection() {
    try {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('id')
        .limit(1);

      return { success: !error, error: error?.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Redis bağlantısını test eder
   */
  async testRedisConnection() {
    try {
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({
        url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL,
        token: process.env.UPSTASH_REDIS_TOKEN || 'test-token',
      });

      const testKey = `integration-test-${Date.now()}`;
      await redis.set(testKey, 'test-value', { ex: 5 });
      const result = await redis.get(testKey);
      await redis.del(testKey);

      return { 
        success: result === 'test-value', 
        error: result !== 'test-value' ? 'Redis read/write test failed' : null 
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

// Global instance for use in tests
global.testManager = new IntegrationTestManager();

// Export for direct imports
module.exports = {
  IntegrationTestManager,
  testManager: global.testManager
};

console.log('🔧 Integration test utilities loaded');
console.log('🎯 TestManager available globally as testManager');
console.log('📊 Clean fixtures and database utilities ready');