/**
 * Jest Environment Variables Setup
 * Centralized environment variable management for all tests
 * This file runs before any test setup files
 */

// Core Supabase Configuration
process.env.SUPABASE_URL = 'http://localhost:54322';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54322';
process.env.SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
process.env.SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.DaYlNEoUrrEn2Ig7tqibS-PHK5E4s9YK88K6Sj0X4AY';

// Next.js Configuration
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only-not-secure';

// Application Configuration
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_ENV = 'test';
process.env.NEXT_PUBLIC_APP_NAME = 'İ-EP.APP (Test)';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3001';
process.env.ROOT_DOMAIN = 'localhost:3001';
process.env.ENABLE_DOMAIN_MANAGEMENT = 'false';

// Redis Configuration (for testing)
process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:6379';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';

// Payment Gateway (Test Mode)
process.env.IYZICO_API_KEY = 'test-api-key';
process.env.IYZICO_SECRET_KEY = 'test-secret-key';
process.env.IYZICO_BASE_URL = 'https://sandbox-api.iyzipay.com';

// Cloudflare Configuration (for testing)
process.env.CLOUDFLARE_API_TOKEN = 'test-cloudflare-token';
process.env.CLOUDFLARE_ZONE_ID = 'test-zone-id';
process.env.CLOUDFLARE_ACCOUNT_ID = 'test-account-id';
process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = 'test-r2-access-key';
process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = 'test-r2-secret-key';
process.env.CLOUDFLARE_R2_BUCKET_NAME = 'test-bucket';
process.env.CLOUDFLARE_R2_ENDPOINT = 'https://test-endpoint.r2.cloudflarestorage.com';

// Monitoring & Analytics
process.env.SENTRY_DSN = 'https://test-sentry-dsn@sentry.io/test';
process.env.SENTRY_ORG = 'test-org';
process.env.SENTRY_PROJECT = 'test-project';

// Feature Flags
process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false';
process.env.NEXT_PUBLIC_ENABLE_PWA = 'false';
process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING = 'false';

// Test-specific Configuration
process.env.JEST_WORKER_ID = '1';
process.env.CI = 'false';
process.env.DEBUG = 'true';
process.env.ENABLE_MOCK_SERVICES = 'true';
process.env.DISABLE_RATE_LIMITING = 'true';
process.env.SKIP_ENV_VALIDATION = 'true';

// Email Services (Mock/Test)
process.env.EMAIL_SERVER_HOST = 'localhost';
process.env.EMAIL_SERVER_PORT = '1025';
process.env.EMAIL_SERVER_USER = 'test@localhost';
process.env.EMAIL_SERVER_PASSWORD = 'test';
process.env.EMAIL_FROM = 'test@localhost';

// Super Admin Configuration
process.env.SUPER_ADMIN_EMAIL = 'test-admin@example.com';
process.env.SUPER_ADMIN_PASSWORD = 'test-admin-password';

// Storage Configuration
process.env.STORAGE_PROVIDER = 'supabase'; // Default to Supabase for tests
process.env.NEXT_PUBLIC_STORAGE_BUCKET = 'test-storage-bucket';

console.log('🧪 Jest environment variables configured for testing');
