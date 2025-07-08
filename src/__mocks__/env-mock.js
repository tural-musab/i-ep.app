/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Mock for @t3-oss/env-nextjs to avoid ES modules issues in Jest
 */

// Mock environment variables for testing
const mockEnv = {
  NEXTAUTH_SECRET: 'test-secret-123',
  NEXTAUTH_URL: 'http://localhost:3000',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  NEXT_PUBLIC_APP_NAME: 'Test App',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  CLOUDFLARE_API_TOKEN: 'test-cf-token',
  CLOUDFLARE_ZONE_ID: 'test-zone-id',
  REDIS_URL: 'redis://localhost:6379',
  NODE_ENV: 'test',
};

// Export mock env object
module.exports = {
  env: mockEnv,
  createEnv: () => mockEnv,
  __esModule: true,
  default: mockEnv,
}; 