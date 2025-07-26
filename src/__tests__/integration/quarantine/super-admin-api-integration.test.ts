// @ts-nocheck
/**
 * Super Admin API Integration Tests
 * Sprint 7: API endpoint'lerinin integration test'leri
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET as systemHealthGET } from '@/app/api/super-admin/system-health/route';
import { GET as quickHealthGET } from '@/app/api/super-admin/system-health/quick/route';
import { GET as tenantsGET, POST as tenantsPOST } from '@/app/api/super-admin/tenants/route';
import { GET as domainsGET, POST as domainsPOST } from '@/app/api/super-admin/domains/route';

// Mock dependencies
jest.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user', user_metadata: { role: 'super_admin' } } },
          error: null,
        })
      ),
    },
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        range: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: { id: 'new-id' }, error: null })),
    })),
  },
}));

jest.mock('@/lib/system/system-health', () => ({
  SystemHealthService: {
    getFullHealthReport: jest.fn(() =>
      Promise.resolve({
        overall: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: 3600,
          checks: [],
          version: '1.0.0',
          environment: 'test',
        },
        database: { connection: true, responseTime: 50 },
        redis: { connection: true, responseTime: 20 },
        ssl: [],
      })
    ),
    getQuickHealthCheck: jest.fn(() =>
      Promise.resolve({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: true,
        redis: true,
        ssl_certificates: 'healthy',
      })
    ),
  },
}));

jest.mock('@/lib/audit/audit-log', () => ({
  AuditLogService: {
    logSystemAction: jest.fn(() => Promise.resolve()),
    logTenantAction: jest.fn(() => Promise.resolve()),
    logDomainAction: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@/lib/domain/cloudflare-domain-manager', () => ({
  CloudflareDomainManager: {
    getAllDomains: jest.fn(() =>
      Promise.resolve([
        {
          domain: 'test.i-ep.app',
          ssl_status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
    ),
    createDomain: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

describe('Super Admin API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('System Health Endpoints', () => {
    it('should get full system health report', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/system-health', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await systemHealthGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.overall.status).toBe('healthy');
    });

    it('should get quick health check', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/system-health/quick', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await quickHealthGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('healthy');
    });
  });

  describe('Tenants Management Endpoints', () => {
    it('should list tenants with pagination', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/super-admin/tenants?page=1&limit=10',
        {
          method: 'GET',
          headers: { Authorization: 'Bearer valid-token' },
        }
      );

      const response = await tenantsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    it('should create new tenant', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/tenants', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test Tenant',
          slug: 'test-tenant',
          domain: 'test.i-ep.app',
        }),
      });

      const response = await tenantsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should handle invalid tenant creation data', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/tenants', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '', // Invalid empty name
          slug: 'test',
        }),
      });

      const response = await tenantsPOST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Domains Management Endpoints', () => {
    it('should list all domains', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/domains', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await domainsGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should create new domain', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/domains', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: 'newdomain.i-ep.app',
          tenant_id: 'test-tenant-id',
        }),
      });

      const response = await domainsPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should handle invalid domain creation', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/domains', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: '', // Invalid empty domain
        }),
      });

      const response = await domainsPOST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authorization', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/system-health', {
        method: 'GET',
      });

      const response = await systemHealthGET(request);

      expect(response.status).toBe(401);
    });

    it('should reject non-super-admin users', async () => {
      // Mock non-super-admin user
      const supabaseAdminModule = await import('@/lib/supabase/admin');
      const supabaseAdmin = supabaseAdminModule.supabaseAdmin as unknown;
      supabaseAdmin.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'regular-user', user_metadata: { role: 'user' } } },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/super-admin/system-health', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await systemHealthGET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      // Mock database error
      const supabaseAdminModule = await import('@/lib/supabase/admin');
      const supabaseAdmin = supabaseAdminModule.supabaseAdmin as unknown;
      supabaseAdmin.auth.getUser.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/super-admin/system-health', {
        method: 'GET',
        headers: { Authorization: 'Bearer valid-token' },
      });

      const response = await systemHealthGET(request);

      expect(response.status).toBe(500);
    });

    it('should handle invalid JSON in POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/super-admin/tenants', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer valid-token',
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      });

      const response = await tenantsPOST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Response Format Validation', () => {
    it('should return consistent response format for all endpoints', async () => {
      const endpoints = [
        { handler: systemHealthGET, path: '/api/super-admin/system-health' },
        { handler: quickHealthGET, path: '/api/super-admin/system-health/quick' },
        { handler: tenantsGET, path: '/api/super-admin/tenants' },
        { handler: domainsGET, path: '/api/super-admin/domains' },
      ];

      for (const endpoint of endpoints) {
        const request = new NextRequest(`http://localhost:3000${endpoint.path}`, {
          method: 'GET',
          headers: { Authorization: 'Bearer valid-token' },
        });

        const response = await endpoint.handler(request);
        const data = await response.json();

        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('data');
        expect(typeof data.success).toBe('boolean');
      }
    });
  });
});
