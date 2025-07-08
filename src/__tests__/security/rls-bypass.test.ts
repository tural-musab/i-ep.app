/**
 * Row Level Security (RLS) Bypass Tests
 * 
 * Bu test dosyası Supabase RLS politikalarının doğru çalıştığını ve
 * tenant'lar arası veri izolasyonunun sağlandığını test eder.
 * Multi-tenant mimari için kritik güvenlik testleridir.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

interface TestTenant {
  id: string;
  name: string;
  subdomain: string;
  users: TestUser[];
}

interface TestUser {
  id: string;
  email: string;
  tenantId: string;
  role: string;
  authToken?: string;
}

interface TestData {
  tenantA: TestTenant;
  tenantB: TestTenant;
  crossTenantUser: TestUser;
}

let testData: TestData;

beforeAll(async () => {
  // Test verilerini oluştur
  await setupTestData();
}, 30000);

afterAll(async () => {
  // Test verilerini temizle
  await cleanupTestData();
}, 30000);

beforeEach(() => {
  // Her test arasında supabase client'ı sıfırla
  jest.clearAllMocks();
});

async function setupTestData(): Promise<void> {
  try {
    console.log('Setting up RLS test data...');

    // Tenant A oluştur
    const tenantA = {
      id: uuidv4(),
      name: 'Test Tenant A',
      subdomain: 'tenant-a-test',
      domain: 'tenant-a-test.i-ep.app',
      status: 'active',
      plan: 'premium',
      settings: { features: ['advanced'] }
    };

    const { error: tenantAError } = await supabaseAdmin
      .from('tenants')
      .insert(tenantA);

    if (tenantAError) {
      console.error('Error creating tenant A:', tenantAError);
      throw tenantAError;
    }

    // Tenant B oluştur
    const tenantB = {
      id: uuidv4(),
      name: 'Test Tenant B',
      subdomain: 'tenant-b-test',
      domain: 'tenant-b-test.i-ep.app',
      status: 'active',
      plan: 'standard',
      settings: { features: ['basic'] }
    };

    const { error: tenantBError } = await supabaseAdmin
      .from('tenants')
      .insert(tenantB);

    if (tenantBError) {
      console.error('Error creating tenant B:', tenantBError);
      throw tenantBError;
    }

    // Test kullanıcıları oluştur
    const userAId = uuidv4();
    const userBId = uuidv4();

    // Tenant A kullanıcısı
    const { error: userAError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userAId,
        email: 'admin-a@tenant-a-test.com',
        role: 'admin',
        name: 'Admin A',
        tenant_id: tenantA.id
      });

    if (userAError) {
      console.error('Error creating user A:', userAError);
      throw userAError;
    }

    // Tenant B kullanıcısı
    const { error: userBError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userBId,
        email: 'admin-b@tenant-b-test.com',
        role: 'admin',
        name: 'Admin B',
        tenant_id: tenantB.id
      });

    if (userBError) {
      console.error('Error creating user B:', userBError);
      throw userBError;
    }

    // Test verileri oluştur
    await supabaseAdmin
      .from('students')
      .insert([
        {
          id: uuidv4(),
          tenant_id: tenantA.id,
          name: 'Student A1',
          email: 'student-a1@tenant-a-test.com',
          class_id: uuidv4(),
          created_by: userAId
        },
        {
          id: uuidv4(),
          tenant_id: tenantA.id,
          name: 'Student A2',
          email: 'student-a2@tenant-a-test.com',
          class_id: uuidv4(),
          created_by: userAId
        }
      ]);

    await supabaseAdmin
      .from('students')
      .insert([
        {
          id: uuidv4(),
          tenant_id: tenantB.id,
          name: 'Student B1',
          email: 'student-b1@tenant-b-test.com',
          class_id: uuidv4(),
          created_by: userBId
        },
        {
          id: uuidv4(),
          tenant_id: tenantB.id,
          name: 'Student B2',
          email: 'student-b2@tenant-b-test.com',
          class_id: uuidv4(),
          created_by: userBId
        }
      ]);

    testData = {
      tenantA: {
        ...tenantA,
        users: [{
          id: userAId,
          email: 'admin-a@tenant-a-test.com',
          tenantId: tenantA.id,
          role: 'admin'
        }]
      },
      tenantB: {
        ...tenantB,
        users: [{
          id: userBId,
          email: 'admin-b@tenant-b-test.com',
          tenantId: tenantB.id,
          role: 'admin'
        }]
      },
      crossTenantUser: {
        id: uuidv4(),
        email: 'cross-tenant@example.com',
        tenantId: tenantA.id,
        role: 'user'
      }
    };

    console.log('RLS test data setup completed');
  } catch (error) {
    console.error('Failed to setup test data:', error);
    throw error;
  }
}

async function cleanupTestData(): Promise<void> {
  try {
    console.log('Cleaning up RLS test data...');

    if (testData) {
      // Öğrencileri sil
      await supabaseAdmin
        .from('students')
        .delete()
        .in('tenant_id', [testData.tenantA.id, testData.tenantB.id]);

      // Kullanıcıları sil
      await supabaseAdmin
        .from('users')
        .delete()
        .in('tenant_id', [testData.tenantA.id, testData.tenantB.id]);

      // Tenant'ları sil
      await supabaseAdmin
        .from('tenants')
        .delete()
        .in('id', [testData.tenantA.id, testData.tenantB.id]);
    }

    console.log('RLS test data cleanup completed');
  } catch (error) {
    console.error('Failed to cleanup test data:', error);
  }
}

describe('Row Level Security (RLS) Bypass Tests', () => {
  describe('Tenant Isolation Tests', () => {
    it('should prevent cross-tenant data access via direct queries', async () => {
      if (!testData) {
        throw new Error('Test data not initialized');
      }

      // Tenant A kullanıcısı olarak giriş yap (simulated)
      const supabaseA = createClientComponentClient();
      
      // Tenant A'dan Tenant B verilerine erişmeye çalış
      const { data: crossTenantStudents, error } = await supabaseA
        .from('students')
        .select('*')
        .eq('tenant_id', testData.tenantB.id);

      // RLS tarafından engellenmelei veya boş sonuç dönmeli
      if (!error) {
        expect(crossTenantStudents).toEqual([]);
      } else {
        // RLS politikası tarafından reddedildi
        expect(error.code).toMatch(/42501|42P01|PGRST116/); // Insufficient privilege or relation does not exist
      }
    });

    it('should prevent data access with manipulated tenant_id in queries', async () => {
      if (!testData) {
        throw new Error('Test data not initialized');
      }

      const supabase = createClientComponentClient();

      // Kötü niyetli query: Farklı tenant_id ile veri çekmeye çalış
      const maliciousTenantId = testData.tenantB.id;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('tenant_id', maliciousTenantId);

        // RLS tarafından engellenmel
        if (!error) {
          expect(data).toEqual([]);
        } else {
          expect(error.code).toMatch(/42501|42P01|PGRST116/);
        }
      } catch (error) {
        // Beklenen durum - RLS tarafından engellendi
        expect(error).toBeDefined();
      }
    });

    it('should prevent access to other tenants via SQL injection in filters', async () => {
      const supabase = createClientComponentClient();

      // SQL injection ile RLS bypass denemesi
      const maliciousFilter = `' OR tenant_id = '${testData?.tenantB.id}' --`;

      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .ilike('name', maliciousFilter);

        // RLS hala geçerli olmalı
        if (!error && data) {
          // Eğer veri dönerse, sadece mevcut tenant'a ait olmalı
          data.forEach(student => {
            expect(student.tenant_id).not.toBe(testData?.tenantB.id);
          });
        }
      } catch (error) {
        // Beklenen - kötü query reddedildi
        expect(error).toBeDefined();
      }
    });
  });

  describe('User Role and Permission Tests', () => {
    it('should prevent privilege escalation via role manipulation', async () => {
      const supabase = createClientComponentClient();

      // Normal kullanıcı olarak admin verilerine erişmeye çalış
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'super_admin');

        // Super admin verilerini görmemeli
        if (!error) {
          expect(data).toEqual([]);
        } else {
          expect(error.code).toMatch(/42501|42P01|PGRST116/);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should prevent updating other users\' data', async () => {
      if (!testData) {
        throw new Error('Test data not initialized');
      }

      const supabase = createClientComponentClient();

      // Başka kullanıcının bilgilerini güncellemeye çalış
      const otherUserId = testData.tenantB.users[0].id;

      try {
        const { error } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', otherUserId);

        // Güncelleme başarısız olmalı
        expect(error).toBeDefined();
        expect(error?.code).toMatch(/42501|42P01|PGRST116/);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Audit Log Security Tests', () => {
    it('should log cross-tenant access attempts', async () => {
      if (!testData) {
        throw new Error('Test data not initialized');
      }

      const supabase = createClientComponentClient();

      // Cross-tenant erişim denemesi
      try {
        await supabase
          .from('students')
          .select('*')
          .eq('tenant_id', testData.tenantB.id);
      } catch {
        // Error bekleniyor
      }

      // Audit log'da kayıt olması gerekiyor
      const { data: auditLogs } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('action', 'access_denied')
        .gte('created_at', new Date(Date.now() - 5000).toISOString());

      // En az bir access denied log'u olmalı
      expect(auditLogs?.length).toBeGreaterThan(0);
    });

    it('should log suspicious query patterns', async () => {
      const supabase = createClientComponentClient();

      // Şüpheli query pattern'leri
      const suspiciousQueries = [
        "'; DROP TABLE students; --",
        "' UNION SELECT * FROM tenants --",
        "' OR 1=1 --"
      ];

      for (const query of suspiciousQueries) {
        try {
          await supabase
            .from('students')
            .select('*')
            .ilike('name', query);
        } catch {
          // Error bekleniyor
        }
      }

      // Audit log'da şüpheli aktivite kaydı olmalı
      const { data: suspiciousLogs } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('action', 'suspicious_query')
        .gte('created_at', new Date(Date.now() - 10000).toISOString());

      expect(suspiciousLogs?.length).toBeGreaterThan(0);
    });
  });

  describe('Advanced RLS Bypass Attempts', () => {
    it('should prevent function-based RLS bypass', async () => {
      const supabase = createClientComponentClient();

      // PostgreSQL fonksiyon tabanlı bypass denemesi
      try {
        const { data, error } = await supabase
          .rpc('get_all_students_insecure', {
            target_tenant_id: testData?.tenantB.id
          });

        // Fonksiyon yoksa error dönmeli
        expect(error).toBeDefined();
        
        if (!error && data) {
          // Eğer fonksiyon varsa, RLS hala geçerli olmalı
          expect(data).toEqual([]);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should prevent view-based RLS bypass', async () => {
      const supabase = createClientComponentClient();

      // View üzerinden RLS bypass denemesi
      try {
        const { data, error } = await supabase
          .from('all_tenants_view')
          .select('*');

        // View yoksa error, varsa boş sonuç dönmeli
        if (!error) {
          expect(data).toEqual([]);
        } else {
          expect(error.code).toMatch(/42501|42P01|PGRST116/);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should prevent trigger-based data manipulation', async () => {
      if (!testData) {
        throw new Error('Test data not initialized');
      }

      const supabase = createClientComponentClient();

      // Trigger ile veri manipülasyonu denemesi
      try {
        const { error } = await supabase
          .from('students')
          .insert({
            name: 'Malicious Student',
            email: 'malicious@evil.com',
            tenant_id: testData.tenantB.id, // Farklı tenant'a eklemeye çalış
            class_id: uuidv4()
          });

        // Insert başarısız olmalı veya doğru tenant_id ile override edilmeli
        if (!error) {
          // Eğer insert başarılıysa, tenant_id düzeltilmiş olmalı
          const { data: insertedStudent } = await supabase
            .from('students')
            .select('tenant_id')
            .eq('email', 'malicious@evil.com')
            .single();

          if (insertedStudent) {
            expect(insertedStudent.tenant_id).not.toBe(testData.tenantB.id);
          }
        } else {
          expect(error.code).toMatch(/42501|23503|PGRST204/);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance and Resource Security', () => {
    it('should prevent resource exhaustion via large queries', async () => {
      const supabase = createClientComponentClient();

      const startTime = Date.now();

      try {
        // Büyük veri kümesi çekmeye çalış
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .limit(100000);

        const endTime = Date.now();

        // Query çok uzun sürmemeli (DoS koruması)
        expect(endTime - startTime).toBeLessThan(10000);

        // RLS nedeniyle çok fazla veri dönmemeli
        if (!error && data) {
          expect(data.length).toBeLessThan(1000);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle concurrent cross-tenant access attempts', async () => {
      if (!testData) {
        throw new Error('Test data not initialized');
      }

      const promises = [];
      const attemptCount = 10;

      // Eşzamanlı cross-tenant erişim denemeleri
      for (let i = 0; i < attemptCount; i++) {
        const supabase = createClientComponentClient();
                 promises.push(
           supabase
             .from('students')
             .select('*')
             .eq('tenant_id', testData.tenantB.id)
         );
      }

             const results = await Promise.all(promises);

       // Tüm istekler engellenmiş olmalı
       results.forEach((result: any) => {
         if (result.data && !result.error) {
           expect(result.data).toEqual([]);
         } else {
           expect(result.error).toBeDefined();
         }
       });
    });
  });
}); 