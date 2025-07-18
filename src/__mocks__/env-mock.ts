/**
 * Mock for @t3-oss/env-nextjs to avoid ES modules issues in Jest
 */

// Mock environment variables for testing
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'fake-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'fake-service-role-key',
  NEXTAUTH_SECRET: 'fake-nextauth-secret',
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXT_PUBLIC_APP_NAME: 'Test App',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
};

// Export mock env object
module.exports = mockEnv;
