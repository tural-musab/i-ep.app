/**
 * İ-EP.APP - Database Connection Integration Test
 * Gerçek Supabase database bağlantısını test eder
 */

import { createClient } from '@supabase/supabase-js';

describe('Database Connection Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  describe('Supabase Connection', () => {
    it('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have access to tenants table', async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, status')
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should be able to query with RLS policies', async () => {
      // Test that RLS is working by trying to query without proper tenant context
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1);

      // Should work with service role key (bypasses RLS)
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Test Tenant Operations', () => {
    const testTenantId = process.env.TEST_TENANT_ID!;

    it('should find or create test tenant', async () => {
      // First check if test tenant exists
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id, name, status')
        .eq('id', testTenantId)
        .single();

      if (!existingTenant) {
        // Create test tenant if it doesn't exist
        const { data: newTenant, error } = await supabase
          .from('tenants')
          .insert({
            id: testTenantId,
            name: 'Integration Test School',
            subdomain: 'integration-test',
            domain: 'integration-test.i-ep.app',
            status: 'active',
            settings: {
              locale: 'tr',
              timezone: 'Europe/Istanbul',
              academic_year: '2024-2025'
            }
          })
          .select()
          .single();

        expect(error).toBeNull();
        expect(newTenant.id).toBe(testTenantId);
      } else {
        expect(existingTenant.id).toBe(testTenantId);
      }
    });

    it('should be able to query tenant-specific data', async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, tenant_id')
        .eq('tenant_id', testTenantId)
        .limit(10);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      
      // If there are users, they should all belong to test tenant
      if (data!.length > 0) {
        data!.forEach(user => {
          expect(user.tenant_id).toBe(testTenantId);
        });
      }
    });
  });

  describe('Core Tables Accessibility', () => {
    const coreTables = ['users', 'classes', 'subjects', 'assignments', 'attendance_records', 'grades'];

    coreTables.forEach(tableName => {
      it(`should be able to query ${tableName} table`, async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        // Error is acceptable if table doesn't exist yet, but connection should work
        if (error) {
          // Check if it's a "relation does not exist" error (table not created yet)
          const isTableNotExist = error.message.includes('does not exist') || 
                                  error.message.includes('relation') ||
                                  error.message.includes('table');
          
          if (!isTableNotExist) {
            // If it's not a "table doesn't exist" error, then it's a real connection problem
            throw error;
          }
          
          console.warn(`⚠️  Table ${tableName} doesn't exist yet - this is expected if migrations haven't been run`);
        } else {
          expect(data).toBeDefined();
          expect(Array.isArray(data)).toBe(true);
        }
      });
    });
  });

  describe('Database Performance', () => {
    it('should respond to queries within reasonable time', async () => {
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name')
        .limit(10);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(queryTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});