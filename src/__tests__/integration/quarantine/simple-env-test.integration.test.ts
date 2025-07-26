// @ts-nocheck
/**
 * İ-EP.APP - Simple Environment Test
 * Jest environment loading'i test eder
 */

describe('Environment Loading Test', () => {
  it('should load environment variables correctly', () => {
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]');
    console.log('REDIS_URL:', process.env.REDIS_URL);
    console.log('TEST_TENANT_ID:', process.env.TEST_TENANT_ID);

    // Basic checks
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(process.env.REDIS_URL).toBeDefined();
    expect(process.env.TEST_TENANT_ID).toBeDefined();
  });

  it('should have proper test environment values', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toContain('localhost');
    expect(process.env.REDIS_URL).toContain('localhost:6379');
    expect(process.env.TEST_TENANT_ID).toMatch(/^[a-f0-9-]+$/);
  });
});