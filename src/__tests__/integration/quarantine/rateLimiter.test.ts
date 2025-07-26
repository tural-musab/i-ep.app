// @ts-nocheck
/**
 * İ-EP.APP Rate Limiter Integration Tests
 *
 * Bu test suite rate limiter middleware'inin doğru çalıştığını kontrol eder:
 * - Tenant bazlı rate limiting
 * - Window reset işlevselliği
 * - 429 Too Many Requests yanıtları
 */

import { clearRateLimitStore, getRateLimitStatus } from '../../middleware/rateLimiter';
import { NextRequest } from 'next/server';

// Mock environment variables to preserve original ones
const originalEnv = process.env;

// Mock tip tanımları
interface MockNextRequest {
  nextUrl: {
    pathname: string;
  };
  headers: {
    get: (key: string) => string | null;
  };
}

// Mock NextRequest factory function
function mockNextRequest(url: string, tenantId?: string): MockNextRequest {
  return {
    nextUrl: {
      pathname: new URL(url).pathname,
    },
    headers: {
      get: (key: string) => {
        if (key === 'x-tenant-id') return tenantId || null;
        return null;
      },
    },
  };
}

describe('Rate Limiter Middleware Integration Tests', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    clearRateLimitStore();

    // Set test environment variables
    process.env = {
      ...originalEnv,
      RATE_LIMIT_WINDOW_MS: '5000', // 5 seconds for faster testing
      RATE_LIMIT_MAX: '3', // 3 requests max for easier testing
    };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Rate Limiter Core Logic', () => {
    it('should track requests per tenant correctly', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest(
        'http://localhost:3000/api/test',
        'tenant-1'
      ) as unknown as NextRequest;

      // First 3 requests should be allowed
      expect(rateLimiterMiddleware(request)).toBeNull();
      expect(rateLimiterMiddleware(request)).toBeNull();
      expect(rateLimiterMiddleware(request)).toBeNull();

      // Fourth request should be rate limited
      const response = rateLimiterMiddleware(request);
      expect(response).not.toBeNull();
      expect(response?.status).toBe(429);
    });

    it('should isolate rate limits between tenants', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const tenant1Request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');
      const tenant2Request = mockNextRequest('http://localhost:3000/api/test', 'tenant-2');

      // Use up rate limit for tenant-1
      rateLimiterMiddleware(tenant1Request);
      rateLimiterMiddleware(tenant1Request);
      rateLimiterMiddleware(tenant1Request);

      // Tenant-1 should be rate limited
      const tenant1Response = rateLimiterMiddleware(tenant1Request);
      expect(tenant1Response?.status).toBe(429);

      // Tenant-2 should still be allowed
      const tenant2Response = rateLimiterMiddleware(tenant2Request);
      expect(tenant2Response).toBeNull();
    });

    it('should handle requests without tenant-id (use default)', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/api/test'); // No tenant-id

      // Should work with default tenant
      expect(rateLimiterMiddleware(request)).toBeNull();
      expect(rateLimiterMiddleware(request)).toBeNull();
      expect(rateLimiterMiddleware(request)).toBeNull();

      // Fourth request should be rate limited
      const response = rateLimiterMiddleware(request);
      expect(response?.status).toBe(429);
    });

    it('should skip rate limiting for non-API routes', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/dashboard', 'tenant-1');
      const response = rateLimiterMiddleware(request);
      expect(response).toBeNull(); // Should skip rate limiting
    });

    it('should return proper 429 response with headers', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');

      // Use up rate limit
      rateLimiterMiddleware(request);
      rateLimiterMiddleware(request);
      rateLimiterMiddleware(request);

      // Fourth request should return 429 with proper headers
      const response = rateLimiterMiddleware(request);
      expect(response?.status).toBe(429);
      expect(response?.headers.get('Retry-After')).toBeTruthy();
      expect(response?.headers.get('X-RateLimit-Limit')).toBe('3');
      expect(response?.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should reset rate limit after window expires', (done) => {
      import('../../middleware/rateLimiter').then(({ rateLimiterMiddleware }) => {
        const request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');

        // Use up the rate limit
        rateLimiterMiddleware(request);
        rateLimiterMiddleware(request);
        rateLimiterMiddleware(request);

        // Should be rate limited
        const blockedResponse = rateLimiterMiddleware(request);
        expect(blockedResponse?.status).toBe(429);

        // Wait for window to expire (5 seconds + buffer)
        setTimeout(() => {
          const allowedResponse = rateLimiterMiddleware(request);
          expect(allowedResponse).toBeNull(); // Should be allowed again
          done();
        }, 5100);
      });
    }, 10000);
  });

  describe('Configuration Handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Remove environment variables
      delete process.env.RATE_LIMIT_WINDOW_MS;
      delete process.env.RATE_LIMIT_MAX;

      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');
      const response = rateLimiterMiddleware(request);
      expect(response).toBeNull(); // Should work with defaults
    });

    it('should handle invalid environment variables', async () => {
      process.env.RATE_LIMIT_WINDOW_MS = 'invalid';
      process.env.RATE_LIMIT_MAX = 'invalid';

      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');
      const response = rateLimiterMiddleware(request);
      expect(response).toBeNull(); // Should handle gracefully
    });
  });

  describe('Utility Functions', () => {
    it('should clear rate limit store', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');

      // Make some requests
      rateLimiterMiddleware(request);
      rateLimiterMiddleware(request);

      // Verify tenant has some rate limit status
      const statusBefore = getRateLimitStatus('tenant-1');
      expect(statusBefore).not.toBeNull();
      expect(statusBefore?.count).toBe(2);

      // Clear store
      clearRateLimitStore();

      // Verify status is cleared
      const statusAfter = getRateLimitStatus('tenant-1');
      expect(statusAfter).toBeNull();
    });

    it('should track rate limit status correctly', async () => {
      const { rateLimiterMiddleware } = await import('../../middleware/rateLimiter');

      const request = mockNextRequest('http://localhost:3000/api/test', 'tenant-1');

      // Initial status should be null
      expect(getRateLimitStatus('tenant-1')).toBeNull();

      // Make a request
      rateLimiterMiddleware(request);

      // Status should show count
      const status = getRateLimitStatus('tenant-1');
      expect(status).not.toBeNull();
      expect(status?.count).toBe(1);
      expect(typeof status?.windowStart).toBe('number');
    });
  });
});
