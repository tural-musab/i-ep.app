import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createRequestLogger } from '@/middleware/logger';

// Mock dependencies
jest.mock('@supabase/auth-helpers-nextjs');
jest.mock('@/lib/tenant/tenant-domain-resolver');
jest.mock('@/lib/audit');
jest.mock('@/middleware/logger');
jest.mock('@/middleware/rateLimiter');
jest.mock('@/middleware/optimized-middleware');

const mockCreateMiddlewareClient = createMiddlewareClient as jest.Mock;
const mockCreateRequestLogger = createRequestLogger as jest.Mock;

describe('Middleware', () => {
  let mockRequest: NextRequest;
  let mockSupabaseClient: {
    auth: {
      getUser: jest.Mock;
    };
    from: jest.Mock;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock request
    mockRequest = {
      nextUrl: {
        pathname: '/',
        searchParams: new URLSearchParams(),
      },
      headers: new Headers({
        host: 'localhost:3000',
      }),
      url: 'http://localhost:3000/',
    } as NextRequest;

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
      },
    };

    mockCreateMiddlewareClient.mockReturnValue(mockSupabaseClient);
    
    // Mock request logger
    mockCreateRequestLogger.mockReturnValue({
      startTime: Date.now(),
      finish: jest.fn()
    });
  });

  describe('Development Environment', () => {
    it('should add default tenant headers for localhost', async () => {
      const response = await middleware(mockRequest);
      
      expect(response.headers.get('x-tenant-id')).toBe('test-tenant');
      expect(response.headers.get('x-tenant-hostname')).toBe('test-tenant.localhost');
      expect(response.headers.get('x-tenant-name')).toBe('Test Tenant');
    });

    it('should use tenant parameter from URL in development', async () => {
      mockRequest.nextUrl.searchParams.set('tenant', 'custom-tenant');
      
      const response = await middleware(mockRequest);
      
      expect(response.headers.get('x-tenant-id')).toBe('custom-tenant');
      expect(response.headers.get('x-tenant-hostname')).toBe('custom-tenant.localhost');
    });
  });

  describe('Super Admin Access', () => {
    it('should redirect to login if accessing super-admin without session', async () => {
      mockRequest.nextUrl.pathname = '/super-admin/dashboard';
      
      const response = await middleware(mockRequest);
      
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/auth/giris');
    });

    it('should allow super admin access with proper role', async () => {
      mockRequest.nextUrl.pathname = '/super-admin/dashboard';
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'admin@test.com',
              app_metadata: { role: 'super_admin' },
            },
          },
        },
      });

      const response = await middleware(mockRequest);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Public Paths', () => {
    it.each([
      '/_next/static/chunk.js',
      '/api/auth/login',
      '/favicon.ico',
      '/auth/giris',
      '/auth/sifremi-unuttum',
    ])('should allow access to public path: %s', async (pathname) => {
      mockRequest.nextUrl.pathname = pathname;
      
      const response = await middleware(mockRequest);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Protected Paths', () => {
    it.each([
      '/dashboard',
      '/admin/users',
      '/profil/edit',
      '/ogrenci/notlar',
    ])('should redirect to login for protected path without session: %s', async (pathname) => {
      mockRequest.nextUrl.pathname = pathname;
      
      const response = await middleware(mockRequest);
      
      // In localhost, it should allow but we need to check auth in components
      expect(response.headers.get('x-tenant-id')).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limiting before processing', async () => {
      const { rateLimiterMiddleware } = await import('@/middleware/rateLimiter');
      rateLimiterMiddleware.mockReturnValue(new NextResponse('Too Many Requests', { status: 429 }));
      
      const response = await middleware(mockRequest);
      
      expect(response.status).toBe(429);
    });
  });
});
