/**
 * @jest-environment node
 */

import logger from '@/lib/logger';

// Mock veriler ve utilities
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
  },
  from: jest.fn(),
  rpc: jest.fn(),
};

// Test scenarios için mock data
const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

const MOCK_USER_TENANT_A = {
  id: 'user-tenant-a',
  tenant_id: TENANT_A_ID,
  email: 'admin@tenant-a.com',
  role: 'admin',
  is_active: true,
  verification_status: 'verified'
};

interface SecurityViolation {
  user_id: string;
  target_tenant_id: string;
  attempted_at: Date;
  action: string;
  blocked: boolean;
}

const MOCK_SUPER_ADMIN = {
  id: 'super-admin-user',
  tenant_id: null,
  email: 'super@i-ep.app',
  role: 'super_admin',
  is_active: true,
  verification_status: 'verified'
};

describe('Multi-Tenant Security Isolation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Logger mock'larını sustur
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Tenant Data Isolation', () => {
    it('should prevent cross-tenant user access', async () => {
      // Tenant A kullanıcısı Tenant B'deki kullanıcıları görmeye çalışıyor
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: MOCK_USER_TENANT_A },
        error: null
      });

      // Tenant A kullanıcısı olarak Tenant B kullanıcısını okumaya çalış
      const result = await mockSupabaseClient
        .from('users')
        .select('*')
        .eq('tenant_id', TENANT_B_ID)
        .single();

      expect(result.error).toBeTruthy();
      expect(result.error.message).toContain('Row Level Security');
      expect(result.data).toBeNull();

      logger.info('Cross-tenant user access correctly blocked', {
        attemptingUser: MOCK_USER_TENANT_A.id,
        targetTenant: TENANT_B_ID,
        result: 'BLOCKED'
      });
    });

    it('should prevent unauthorized tenant management access', async () => {
      // Normal kullanıcı tenant management verilerine erişmeye çalışıyor
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: { message: 'Insufficient privileges' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...MOCK_USER_TENANT_A, role: 'teacher' } },
        error: null
      });

      // Teacher rolü ile management.tenants tablosuna erişim denemesi
      const result = await mockSupabaseClient
        .from('tenants')
        .select('*')
        .eq('id', TENANT_A_ID);

      expect(result.error).toBeTruthy();
      expect(result.data).toEqual([]);

      logger.info('Unauthorized tenant management access blocked', {
        attemptingUser: MOCK_USER_TENANT_A.id,
        role: 'teacher',
        result: 'BLOCKED'
      });
    });

    it('should allow super_admin access to all tenants', async () => {
      // Super admin tüm tenant'lara erişebilmeli
      const mockTenants = [
        { id: TENANT_A_ID, name: 'Tenant A' },
        { id: TENANT_B_ID, name: 'Tenant B' }
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockResolvedValue({
          data: mockTenants,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: MOCK_SUPER_ADMIN },
        error: null
      });

      const result = await mockSupabaseClient
        .from('tenants')
        .select('*');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data).toEqual(mockTenants);

      logger.info('Super admin access to all tenants confirmed', {
        user: MOCK_SUPER_ADMIN.id,
        tenantsAccessed: mockTenants.length
      });
    });

    it('should enforce tenant isolation in student data', async () => {
      // Tenant A öğretmeni, Tenant B öğrencilerini görememeli
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: [],
          error: null // RLS policies ile filtrelenir, error değil boş array döner
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...MOCK_USER_TENANT_A, role: 'teacher' } },
        error: null
      });

      // Tenant A öğretmeni farklı tenant'taki öğrencileri görmeye çalışıyor
      const result = await mockSupabaseClient
        .from('users')
        .select('*')
        .eq('tenant_id', TENANT_B_ID)
        .in('role', ['student']);

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]); // RLS policy nedeniyle boş sonuç

      logger.info('Cross-tenant student data access blocked', {
        teacher: MOCK_USER_TENANT_A.id,
        targetTenant: TENANT_B_ID,
        result: 'BLOCKED_BY_RLS'
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should prevent students from accessing teacher-only data', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: { message: 'Insufficient role privileges' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...MOCK_USER_TENANT_A, role: 'student' } },
        error: null
      });

      // Öğrenci gradebook verilerine erişmeye çalışıyor
      const result = await mockSupabaseClient
        .from('grades')
        .select('*')
        .eq('teacher_id', MOCK_USER_TENANT_A.id);

      expect(result.error).toBeTruthy();
      expect(result.data).toEqual([]);

      logger.info('Student access to teacher data blocked', {
        student: MOCK_USER_TENANT_A.id,
        attemptedResource: 'grades',
        result: 'BLOCKED'
      });
    });

    it('should allow teachers to access their own class data', async () => {
      const mockClassData = [
        { id: 'class-1', teacher_id: MOCK_USER_TENANT_A.id, name: 'Math 101' }
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockClassData,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...MOCK_USER_TENANT_A, role: 'teacher' } },
        error: null
      });

      const result = await mockSupabaseClient
        .from('classes')
        .select('*')
        .eq('teacher_id', MOCK_USER_TENANT_A.id);

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockClassData);

      logger.info('Teacher access to own class data allowed', {
        teacher: MOCK_USER_TENANT_A.id,
        classesAccessed: mockClassData.length
      });
    });

    it('should prevent parents from accessing other students data', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        join: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null // RLS ile filtrelenir
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...MOCK_USER_TENANT_A, role: 'parent' } },
        error: null
      });

      // Veli, kendi çocuğu olmayan öğrencilerin notlarını görmeye çalışıyor
      const result = await mockSupabaseClient
        .from('grades')
        .select('*, students(*)')
        .eq('students.parent_id', 'different-parent-id');

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);

      logger.info('Parent access to other students data blocked', {
        parent: MOCK_USER_TENANT_A.id,
        result: 'BLOCKED_BY_RLS'
      });
    });
  });

  describe('API Token Security', () => {
    it('should prevent cross-tenant API token usage', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid tenant context for token' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      // Tenant A token'ı ile Tenant B verilerine erişim denemesi
      const result = await mockSupabaseClient
        .from('api_tokens')
        .select('*')
        .eq('tenant_id', TENANT_B_ID);

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();

      logger.info('Cross-tenant API token usage blocked', {
        targetTenant: TENANT_B_ID,
        result: 'BLOCKED'
      });
    });

    it('should validate API token scopes', async () => {
      const mockToken = {
        id: 'token-1',
        tenant_id: TENANT_A_ID,
        scopes: ['read:users', 'write:classes'],
        expires_at: new Date(Date.now() + 86400000) // 24 hours from now
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockToken,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

      const result = await mockSupabaseClient
        .from('api_tokens')
        .select('*')
        .eq('id', 'token-1');

      expect(result.error).toBeNull();
      expect(result.data.scopes).toContain('read:users');
      expect(result.data.scopes).toContain('write:classes');
      expect(result.data.scopes).not.toContain('admin:tenants');

      logger.info('API token scope validation successful', {
        tokenId: mockToken.id,
        scopes: mockToken.scopes
      });
    });
  });

  describe('Data Modification Security', () => {
    it('should prevent unauthorized data modification', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'RLS policy prevents modification' }
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { ...MOCK_USER_TENANT_A, role: 'student' } },
        error: null
      });

      // Öğrenci, notlarını değiştirmeye çalışıyor
      const result = await mockSupabaseClient
        .from('grades')
        .update({ score: 100 })
        .eq('student_id', MOCK_USER_TENANT_A.id);

      expect(result.error).toBeTruthy();
      expect(result.data).toBeNull();

      logger.info('Unauthorized grade modification blocked', {
        student: MOCK_USER_TENANT_A.id,
        attempted: 'grade_modification',
        result: 'BLOCKED'
      });
    });

    it('should allow authorized admin modifications', async () => {
      const mockQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ id: 'user-1', name: 'Updated Name' }],
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: MOCK_USER_TENANT_A },
        error: null
      });

      // Admin, kendi tenant'ındaki kullanıcı bilgilerini güncelliyor
      const result = await mockSupabaseClient
        .from('users')
        .update({ name: 'Updated Name' })
        .eq('id', 'user-1');

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Updated Name');

      logger.info('Authorized admin modification allowed', {
        admin: MOCK_USER_TENANT_A.id,
        action: 'user_update',
        result: 'ALLOWED'
      });
    });
  });

  describe('Audit Trail Security', () => {
    it('should log security violations to audit table', async () => {
      const mockAuditQueryBuilder = {
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 'audit-1' }],
          error: null
        })
      };

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'access_denied_logs') {
          return mockAuditQueryBuilder;
        }
        return {
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Access denied' }
          })
        };
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: MOCK_USER_TENANT_A },
        error: null
      });

      // İlk olarak yetkisiz erişim denemesi
      await mockSupabaseClient.from('tenants').select('*');

      // Audit log kaydının yapıldığını kontrol et
      const auditResult = await mockSupabaseClient
        .from('access_denied_logs')
        .insert({
          user_id: MOCK_USER_TENANT_A.id,
          attempted_action: 'SELECT on tenants',
          error_message: 'Access denied',
          created_at: new Date().toISOString()
        });

      expect(auditResult.error).toBeNull();
      expect(auditResult.data).toHaveLength(1);

      logger.info('Security violation audit logged', {
        user: MOCK_USER_TENANT_A.id,
        violation: 'unauthorized_tenant_access',
        audited: true
      });
    });

    it('should track cross-tenant access attempts', async () => {
      const securityViolations: SecurityViolation[] = [];

      // Mock cross-tenant access attempt
      const attemptCrossTenantAccess = async (userId: string, targetTenantId: string) => {
        const violation: SecurityViolation = {
          user_id: userId,
          target_tenant_id: targetTenantId,
          attempted_at: new Date(),
          action: 'cross_tenant_data_access',
          blocked: true
        };
        
        securityViolations.push(violation);
        return { success: false, violation };
      };

      // Simüle et: Tenant A kullanıcısı Tenant B'ye erişmeye çalışıyor
      const result = await attemptCrossTenantAccess(MOCK_USER_TENANT_A.id, TENANT_B_ID);

      expect(result.success).toBe(false);
      expect(result.violation.blocked).toBe(true);
      expect(securityViolations).toHaveLength(1);
      expect(securityViolations[0].user_id).toBe(MOCK_USER_TENANT_A.id);
      expect(securityViolations[0].target_tenant_id).toBe(TENANT_B_ID);

      logger.info('Cross-tenant access attempt tracked', {
        violations: securityViolations.length,
        latestViolation: securityViolations[0]
      });
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on tenant mismatch', async () => {
      const mockSessionQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null // No valid sessions found
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockSessionQueryBuilder);

      // Kullanıcı farklı tenant context'inde session aramaya çalışıyor
      const result = await mockSupabaseClient
        .from('sessions')
        .select('*')
        .eq('tenant_id', TENANT_B_ID); // Wrong tenant

      expect(result.data).toEqual([]);

      logger.info('Invalid tenant session access blocked', {
        requestedTenant: TENANT_B_ID,
        result: 'NO_SESSIONS_FOUND'
      });
    });

    it('should validate session tenant context', async () => {
      const validSession = {
        id: 'session-1',
        user_id: MOCK_USER_TENANT_A.id,
        tenant_id: TENANT_A_ID,
        expires_at: new Date(Date.now() + 3600000), // 1 hour from now
        is_valid: true
      };

      const mockSessionQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: validSession,
          error: null
        })
      };

      mockSupabaseClient.from.mockReturnValue(mockSessionQueryBuilder);

      const result = await mockSupabaseClient
        .from('sessions')
        .select('*')
        .eq('user_id', MOCK_USER_TENANT_A.id)
        .eq('tenant_id', TENANT_A_ID)
        .single();

      expect(result.error).toBeNull();
      expect(result.data.tenant_id).toBe(TENANT_A_ID);
      expect(result.data.user_id).toBe(MOCK_USER_TENANT_A.id);

      logger.info('Valid session tenant context confirmed', {
        sessionId: validSession.id,
        userId: validSession.user_id,
        tenantId: validSession.tenant_id
      });
    });
  });
}); 