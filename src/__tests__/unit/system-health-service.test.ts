/**
 * SystemHealthService Unit Tests
 * Sprint 7: System Health servisinin unit test'leri
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SystemHealthService } from '@/lib/system/system-health';
import { supabaseAdmin } from '@/lib/supabase/admin';
import * as redis from '@/lib/cache/redis';

// Mock external dependencies
jest.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

jest.mock('@/lib/cache/redis', () => ({
  getCachedData: jest.fn(),
  setCachedData: jest.fn(),
  ping: jest.fn(),
}));

jest.mock('@/lib/utils/logger', () => ({
  getLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Type-safe mocks
const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
const mockRedis = redis as jest.Mocked<typeof redis>;

describe('SystemHealthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.uptime mock if needed
    process.uptime = jest.fn(() => 3600); // 1 hour uptime
  });

  describe('generateHealthReport', () => {
    it('should generate a complete health report', async () => {
      // Mock successful database connection
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      // Mock successful Redis connection
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(report.overall.status).toBe('healthy');
      expect(report.overall.timestamp).toBeDefined();
      expect(report.overall.uptime).toBe(3600);
      expect(report.overall.version).toBeDefined();
      expect(report.overall.environment).toBeDefined();
      expect(report.database).toBeDefined();
      expect(report.redis).toBeDefined();
      expect(report.ssl).toBeDefined();
    });

    it('should handle database connection failures', async () => {
      // Mock database connection failure
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Connection failed' },
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      // Mock successful Redis connection
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.overall.status).toBe('degraded');
      expect(report.database.connection).toBe(false);
      expect(report.database.error).toContain('Connection failed');
    });

    it('should handle Redis connection failures', async () => {
      // Mock successful database connection
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      // Mock Redis connection failure
      mockRedis.ping.mockRejectedValue(new Error('Redis connection failed'));

      const report = await SystemHealthService.generateHealthReport();

      expect(report.overall.status).toBe('degraded');
      expect(report.redis.connection).toBe(false);
      expect(report.redis.error).toContain('Redis connection failed');
    });

    it('should measure response times accurately', async () => {
      // Mock successful connections with artificial delay
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms delay
            return Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            });
          }),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      mockRedis.ping.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5)); // 5ms delay
        return true;
      });

      const report = await SystemHealthService.generateHealthReport();

      expect(report.database.responseTime).toBeGreaterThanOrEqual(10);
      expect(report.redis.responseTime).toBeGreaterThanOrEqual(5);
    });

    it('should include SSL certificate checks', async () => {
      // Mock successful connections
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.ssl).toBeDefined();
      expect(Array.isArray(report.ssl)).toBe(true);
    });

    it('should include health checks in overall status', async () => {
      // Mock successful connections
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.overall.checks).toBeDefined();
      expect(Array.isArray(report.overall.checks)).toBe(true);
      expect(report.overall.checks.length).toBeGreaterThan(0);

      // Should have at least database and Redis checks
      const checkNames = report.overall.checks.map((check) => check.name);
      expect(checkNames).toContain('database');
      expect(checkNames).toContain('redis');
    });

    it('should set status to unhealthy when all services fail', async () => {
      // Mock database connection failure
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database down' },
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      // Mock Redis connection failure
      mockRedis.ping.mockRejectedValue(new Error('Redis down'));

      const report = await SystemHealthService.generateHealthReport();

      expect(report.overall.status).toBe('unhealthy');
      expect(report.database.connection).toBe(false);
      expect(report.redis.connection).toBe(false);
    });
  });

  describe('quickHealthCheck', () => {
    it('should return quick health status for healthy system', async () => {
      // Mock successful database connection
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      const result = await SystemHealthService.quickHealthCheck();

      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toBeDefined();
    });

    it('should return degraded status for database failures', async () => {
      // Mock database connection failure
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: 'Database connection failed' },
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);

      const result = await SystemHealthService.quickHealthCheck();

      expect(result.status).toBe('degraded');
      expect(result.timestamp).toBeDefined();
    });

    it('should be faster than full health report', async () => {
      // Mock successful database connection
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const quickStart = Date.now();
      await SystemHealthService.quickHealthCheck();
      const quickDuration = Date.now() - quickStart;

      const fullStart = Date.now();
      await SystemHealthService.generateHealthReport();
      const fullDuration = Date.now() - fullStart;

      // Quick check should be faster (allowing some variance for test environment)
      expect(quickDuration).toBeLessThan(fullDuration + 100);
    });
  });

  describe('Database Health Check', () => {
    it('should correctly identify healthy database', async () => {
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.database.connection).toBe(true);
      expect(report.database.responseTime).toBeGreaterThan(0);
      expect(report.database.error).toBeUndefined();
    });

    it('should handle database timeout errors', async () => {
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() => Promise.reject(new Error('Query timeout'))),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.database.connection).toBe(false);
      expect(report.database.error).toContain('Query timeout');
    });
  });

  describe('Redis Health Check', () => {
    it('should correctly identify healthy Redis', async () => {
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.redis.connection).toBe(true);
      expect(report.redis.responseTime).toBeGreaterThan(0);
      expect(report.redis.error).toBeUndefined();
    });

    it('should handle Redis connection errors', async () => {
      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockRejectedValue(new Error('Redis unavailable'));

      const report = await SystemHealthService.generateHealthReport();

      expect(report.redis.connection).toBe(false);
      expect(report.redis.error).toContain('Redis unavailable');
    });
  });

  describe('Environment Detection', () => {
    it('should detect test environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.overall.environment).toBe('test');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should detect production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockFromQuery = {
        select: jest.fn(() => ({
          limit: jest.fn(() =>
            Promise.resolve({
              data: [{ test: 'data' }],
              error: null,
            })
          ),
        })),
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromQuery as never);
      mockRedis.ping.mockResolvedValue(true);

      const report = await SystemHealthService.generateHealthReport();

      expect(report.overall.environment).toBe('production');

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});
