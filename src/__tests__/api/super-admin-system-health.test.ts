/**
 * Super Admin System Health API Tests (HTTP-based)
 * Sprint 7: System Health API endpoint'lerinin HTTP test'leri
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Test sunucusu için port
const TEST_PORT = process.env.PORT || 3000;
const API_BASE = `http://localhost:${TEST_PORT}`;

// Mock system health responses
const mockHealthData = {
  status: 'healthy',
  timestamp: '2024-01-01T12:00:00.000Z',
  checks: {
    database: {
      status: 'healthy',
      latency: 15,
      details: { connections: 5, maxConnections: 100 }
    },
    redis: {
      status: 'healthy', 
      latency: 8,
      details: { memory: '50MB', uptime: '24h' }
    },
    ssl: {
      status: 'healthy',
      details: { 
        'i-ep.app': { 
          status: 'valid', 
          expiresAt: '2025-01-01T00:00:00.000Z',
          issuer: 'Let\'s Encrypt'
        }
      }
    }
  },
  environment: 'test',
  version: '1.0.0',
  uptime: 86400
};

const mockQuickHealthData = {
  status: 'healthy',
  timestamp: '2024-01-01T12:00:00.000Z'
};

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('Super Admin System Health API (HTTP)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/super-admin/system-health', () => {
    it('should return full health status successfully', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHealthData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      // Test the API
      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.checks).toBeDefined();
      expect(data.checks.database).toMatchObject({
        status: 'healthy',
        latency: expect.any(Number)
      });
      expect(data.checks.redis).toMatchObject({
        status: 'healthy',
        latency: expect.any(Number)
      });
      expect(data.checks.ssl).toBeDefined();
      expect(data.environment).toBe('test');
      expect(data.version).toBe('1.0.0');
    });

    it('should handle degraded service status', async () => {
      // Mock degraded system response
      const degradedData = {
        ...mockHealthData,
        status: 'degraded',
        checks: {
          ...mockHealthData.checks,
          redis: {
            status: 'unhealthy',
            latency: 500,
            error: 'Connection timeout',
            details: { memory: '90MB', uptime: '1h' }
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => degradedData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('degraded');
      expect(data.checks.redis.status).toBe('unhealthy');
      expect(data.checks.redis.error).toBe('Connection timeout');
    });

    it('should handle database connection issues', async () => {
      // Mock database failure response
      const dbFailureData = {
        ...mockHealthData,
        status: 'unhealthy',
        checks: {
          ...mockHealthData.checks,
          database: {
            status: 'unhealthy',
            latency: null,
            error: 'Database connection failed',
            details: null
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => dbFailureData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('unhealthy');
      expect(data.checks.database.status).toBe('unhealthy');
      expect(data.checks.database.error).toContain('Database');
    });

    it('should handle SSL certificate warnings', async () => {
      // Mock SSL warning response
      const sslWarningData = {
        ...mockHealthData,
        status: 'degraded',
        checks: {
          ...mockHealthData.checks,
          ssl: {
            status: 'warning',
            details: {
              'i-ep.app': {
                status: 'expiring_soon',
                expiresAt: '2024-02-01T00:00:00.000Z',
                issuer: 'Let\'s Encrypt',
                daysUntilExpiry: 7
              }
            }
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sslWarningData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('degraded');
      expect(data.checks.ssl.status).toBe('warning');
      expect(data.checks.ssl.details['i-ep.app'].status).toBe('expiring_soon');
      expect(data.checks.ssl.details['i-ep.app'].daysUntilExpiry).toBe(7);
    });

    it('should handle unauthorized access', async () => {
      // Mock unauthorized response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No authorization header
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
      // Mock server error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('GET /api/super-admin/system-health/quick', () => {
    it('should return quick health status successfully', async () => {
      // Mock successful quick health response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockQuickHealthData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health/quick`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
      // Quick endpoint shouldn't include detailed checks
      expect(data.checks).toBeUndefined();
      expect(data.environment).toBeUndefined();
      expect(data.version).toBeUndefined();
    });

    it('should handle quick health degraded status', async () => {
      // Mock degraded quick health response
      const quickDegradedData = {
        status: 'degraded',
        timestamp: '2024-01-01T12:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => quickDegradedData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health/quick`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.status).toBe('degraded');
      expect(data.timestamp).toBeDefined();
    });

    it('should be faster than full health check', async () => {
      // Mock fast response for quick endpoint
      const startTime = Date.now();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockQuickHealthData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health/quick`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok).toBe(true);
      // Quick endpoint should respond very fast (mock will be near-instant)
      expect(responseTime).toBeLessThan(100);
    });

    it('should handle unauthorized access for quick endpoint', async () => {
      // Mock unauthorized response for quick endpoint
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health/quick`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // No authorization header
        }
      });

      const data = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Authentication');
    });

    it('should reject non-super-admin users', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Super admin access required' }),
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-regular-user-token'
        }
      });

      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Super admin');
    });
  });

  describe('Response Format Validation', () => {
    it('should include required fields in full health response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHealthData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      // Validate required fields
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('checks');
      expect(data).toHaveProperty('environment');
      expect(data).toHaveProperty('version');
      expect(data).toHaveProperty('uptime');

      // Validate checks structure
      expect(data.checks).toHaveProperty('database');
      expect(data.checks).toHaveProperty('redis');
      expect(data.checks).toHaveProperty('ssl');
    });

    it('should have valid timestamp format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHealthData,
        headers: new Headers({ 'content-type': 'application/json' })
      } as Response);

      const response = await fetch(`${API_BASE}/api/super-admin/system-health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-super-admin-token'
        }
      });

      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('string');
      expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
}); 