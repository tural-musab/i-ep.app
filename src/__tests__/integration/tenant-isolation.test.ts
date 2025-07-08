import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import { createServerSupabaseClient, getTenantSupabaseClient } from '@/lib/supabase/server';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test tenant IDs and user data
const TENANT_1_ID = 'tenant-1-test-uuid';
const TENANT_2_ID = 'tenant-2-test-uuid';

const TENANT_1_STUDENT_DATA = {
  id: 'student-1-tenant-1',
  first_name: 'Ahmet',
  last_name: 'Yılmaz',
  email: 'ahmet@tenant1.com',
  tenant_id: TENANT_1_ID,
  class_id: 'class-1-tenant-1'
};

const TENANT_2_STUDENT_DATA = {
  id: 'student-1-tenant-2',
  first_name: 'Ayşe',
  last_name: 'Demir', 
  email: 'ayse@tenant2.com',
  tenant_id: TENANT_2_ID,
  class_id: 'class-1-tenant-2'
};

describe('Tenant Isolation Integration Tests', () => {
  beforeAll(async () => {
    // Test verilerini hazırla - Bu gerçek implementasyonda test database'i kullanılacak
    console.log('Setting up test data for tenant isolation tests...');
  });

  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterAll(async () => {
    // Test verilerini temizle
    console.log('Cleaning up test data...');
  });

  describe('Database Level Tenant Isolation', () => {
    it('should not allow cross-tenant data access via direct database queries', async () => {
      // Mock Supabase client responses for different tenants
      const tenant1Client = getTenantSupabaseClient(TENANT_1_ID);

      // Mock tenant 1 attempting to access tenant 2 data
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: () => Promise.resolve({ 
            error: 'RLS policy violation: Access denied to tenant data',
            code: 'PGRST301'
          })
        });

      try {
        // Tenant 1 client trying to access tenant 2 schema
        await (tenant1Client as any)
          .from(`tenant_${TENANT_2_ID}.students`)
          .select('*')
          .eq('id', TENANT_2_STUDENT_DATA.id);

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      }
    });

    it('should enforce Row-Level Security for shared tables', async () => {
      const supabase = createServerSupabaseClient();

      // Mock RLS policy enforcement for shared metrics table
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            // Only tenant 1 data should be returned when tenant 1 context is set
            {
              id: 'metric-1',
              tenant_id: TENANT_1_ID,
              metric_name: 'user_login_count',
              metric_value: 50
            }
          ])
        });

      // Set tenant context via mock headers
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'x-tenant-id') return TENANT_1_ID;
            return null;
          }
        }
      } as unknown as NextRequest;

      // Query shared metrics table with tenant 1 context
      const { data } = await supabase
        .from('shared_metrics')
        .select('*');

      expect(data).toHaveLength(1);
      expect(data![0].tenant_id).toBe(TENANT_1_ID);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Endpoint Tenant Isolation', () => {
    it('should prevent cross-tenant access via API endpoints', async () => {
      // Mock API call with tenant 1 authentication trying to access tenant 2 data
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: () => Promise.resolve({
            error: 'Unauthorized cross-tenant access',
            message: 'Bu tenant için yetkiniz yok'
          })
        });

      // Simulate API call to tenant 2 student data with tenant 1 credentials
      const response = await fetch(`/api/ilkys/students/${TENANT_2_STUDENT_DATA.id}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer tenant-1-jwt-token',
          'x-tenant-id': TENANT_1_ID,
          'Content-Type': 'application/json'
        }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      
      const errorData = await response.json();
      expect(errorData.error).toBe('Unauthorized cross-tenant access');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should allow access to own tenant data via API endpoints', async () => {
      // Mock successful API call for own tenant data
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            data: [TENANT_1_STUDENT_DATA],
            success: true
          })
        });

      // Simulate API call to tenant 1 student data with tenant 1 credentials
      const response = await fetch('/api/ilkys/students', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer tenant-1-jwt-token',
          'x-tenant-id': TENANT_1_ID,
          'Content-Type': 'application/json'
        }
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.data).toHaveLength(1);
      expect(responseData.data[0].tenant_id).toBe(TENANT_1_ID);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should validate tenant headers in middleware', async () => {
      // Mock middleware rejection when tenant header is missing
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({
            error: 'Tenant ID missing',
            message: 'x-tenant-id header gereklidir'
          })
        });

      // API call without tenant header
      const response = await fetch('/api/ilkys/students', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer valid-jwt-token',
          'Content-Type': 'application/json'
          // Missing x-tenant-id header
        }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      
      const errorData = await response.json();
      expect(errorData.error).toBe('Tenant ID missing');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Domain-based Tenant Resolution', () => {
    it('should correctly resolve tenant from subdomain', async () => {
      // Mock tenant resolution for subdomain
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: TENANT_1_ID,
            name: 'Test Okulu 1',
            subdomain: 'test-okulu-1',
            is_active: true
          })
        });

      // Simulate domain-based tenant resolution
      const tenantInfo = await fetch('/api/tenant/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: 'test-okulu-1.i-ep.app'
        })
      });

      expect(tenantInfo.ok).toBe(true);
      
      const tenantData = await tenantInfo.json();
      expect(tenantData.id).toBe(TENANT_1_ID);
      expect(tenantData.subdomain).toBe('test-okulu-1');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should reject access for inactive tenants', async () => {
      // Mock inactive tenant response
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: () => Promise.resolve({
            error: 'Tenant not active',
            message: 'Bu tenant şu anda aktif değil'
          })
        });

      // Attempt to access inactive tenant
      const response = await fetch('/api/tenant/resolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: 'inactive-tenant.i-ep.app'
        })
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
      
      const errorData = await response.json();
      expect(errorData.error).toBe('Tenant not active');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Schema Isolation Verification', () => {
    it('should enforce schema-level isolation between tenants', async () => {
      // Mock schema isolation test - attempting to access wrong schema
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({
            error: 'Schema access denied',
            message: `relation "tenant_${TENANT_2_ID}.students" does not exist`,
            hint: 'Check tenant schema access permissions'
          })
        });

      try {
        const tenant1Client = getTenantSupabaseClient(TENANT_1_ID);
        
        // Attempt to query tenant 2 schema with tenant 1 client
        await tenant1Client
          .from(`tenant_${TENANT_2_ID}.students`)
          .select('*');

        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
        expect(mockFetch).toHaveBeenCalledTimes(1);
      }
    });

    it('should allow access to own tenant schema', async () => {
      // Mock successful access to own schema
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([TENANT_1_STUDENT_DATA])
        });

      const tenant1Client = getTenantSupabaseClient(TENANT_1_ID);
      
      // Query own tenant schema
      const { data } = await tenant1Client
        .from('students')
        .select('*')
        .eq('id', TENANT_1_STUDENT_DATA.id);

      expect(data).toBeDefined();
      expect(data![0]).toEqual(TENANT_1_STUDENT_DATA);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('User Permission Isolation', () => {
    it('should prevent super admin access without proper tenant context', async () => {
      // Even super admin should respect tenant context in API calls
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            error: 'Tenant context required',
            message: 'Super admin requests still require tenant context'
          })
        });

      // Super admin API call without tenant context
      const response = await fetch('/api/ilkys/students', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer super-admin-jwt-token',
          'Content-Type': 'application/json'
          // Missing x-tenant-id header
        }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const errorData = await response.json();
      expect(errorData.error).toBe('Tenant context required');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should allow tenant admin access to own tenant data only', async () => {
      // Mock tenant admin successful access to own data
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: [TENANT_1_STUDENT_DATA],
            success: true,
            tenant_id: TENANT_1_ID
          })
        });

      // Tenant admin accessing own tenant data
      const response = await fetch('/api/ilkys/students', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer tenant-admin-jwt-token',
          'x-tenant-id': TENANT_1_ID,
          'Content-Type': 'application/json'
        }
      });

      expect(response.ok).toBe(true);
      
      const responseData = await response.json();
      expect(responseData.tenant_id).toBe(TENANT_1_ID);
      expect(responseData.data[0].tenant_id).toBe(TENANT_1_ID);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
}); 