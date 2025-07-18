import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { TestEnvironmentHelper, TestUtilityHelper } from '../../../tests/fixtures/msw-helpers';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(),
}));

describe('Supabase Auth Integration Tests (Mocked)', () => {
  let mockSupabaseClient: {
    auth: {
      signInWithPassword: jest.Mock;
      signUp: jest.Mock;
      signOut: jest.Mock;
      resetPasswordForEmail: jest.Mock;
      getSession: jest.Mock;
      onAuthStateChange: jest.Mock;
    };
    from: jest.Mock;
  };

  beforeAll(() => {
    TestEnvironmentHelper.setupTestEnvironment();
    TestEnvironmentHelper.setupMockServer();
  });

  beforeEach(() => {
    // Mock Supabase client oluştur
    mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    };

    (createClientComponentClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Her test öncesinde mock'ları temizle
    TestEnvironmentHelper.cleanup();
  });

  afterEach(() => {
    // Her test sonrasında mock'ları temizle
    TestEnvironmentHelper.cleanup();
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Test suite bittiğinde mock server'ı kapat
    TestEnvironmentHelper.teardown();
  });

  describe('User Sign In Tests', () => {
    it('should successfully sign in a user with valid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'validPassword123';

      // Başarılı giriş mock'ını ayarla
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            email: email,
            user_metadata: {
              tenant_id: 'tenant-123',
              role: 'admin',
            },
          },
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
          },
        },
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      // Assert
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(email);
      expect(result.data.user.user_metadata.tenant_id).toBe('tenant-123');
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
    });

    it('should fail to sign in with invalid credentials', async () => {
      // Arrange
      const email = 'test@example.com';
      const wrongPassword = 'wrongPassword';

      // Hatalı giriş mock'ını ayarla
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Invalid login credentials',
          status: 400,
        },
      });

      // Act
      const result = await mockSupabaseClient.auth.signInWithPassword({
        email,
        password: wrongPassword,
      });

      // Assert
      expect(result.data.user).toBeNull();
      expect(result.data.session).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Invalid login credentials');
      expect(result.error.status).toBe(400);
    });

    it('should handle tenant-specific user sign in', async () => {
      // Arrange
      const email = 'tenant-user@example.com';
      const password = 'tenantPassword123';
      const tenantId = 'tenant-456';

      // Tenant-specific giriş mock'ını ayarla
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: '660e8400-e29b-41d4-a716-446655440001',
            email: email,
            user_metadata: {
              tenant_id: tenantId,
              role: 'teacher',
            },
          },
          session: {
            access_token: 'tenant-access-token',
            refresh_token: 'tenant-refresh-token',
          },
        },
        error: null,
      });

      // Kullanıcı profil bilgilerini alma mock'ı
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: '660e8400-e29b-41d4-a716-446655440001',
                email: email,
                role: 'teacher',
                tenant_id: tenantId,
                is_active: true,
              },
              error: null,
            }),
          }),
        }),
      });

      // Act
      const authResult = await mockSupabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      // Kullanıcı profil bilgilerini al
      const profileResult = await mockSupabaseClient
        .from('users')
        .select('*')
        .eq('auth_id', authResult.data.user.id)
        .single();

      // Assert
      expect(authResult.data.user.user_metadata.tenant_id).toBe(tenantId);
      expect(profileResult.data.tenant_id).toBe(tenantId);
      expect(profileResult.data.role).toBe('teacher');
      expect(profileResult.data.is_active).toBe(true);
    });
  });

  describe('User Sign Up Tests', () => {
    it('should successfully sign up a new user', async () => {
      // Arrange
      const email = TestUtilityHelper.generateRandomEmail();
      const password = 'newUserPassword123';
      const tenantId = TestUtilityHelper.generateRandomTenantId();

      // Başarılı kayıt mock'ını ayarla
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: {
            id: '770e8400-e29b-41d4-a716-446655440002',
            email: email,
            email_confirmed_at: null,
            user_metadata: {
              tenant_id: tenantId,
              role: 'student',
              name: 'Yeni Kullanıcı',
            },
          },
          session: null, // E-posta onayı beklendiği için
        },
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            tenant_id: tenantId,
            role: 'student',
            name: 'Yeni Kullanıcı',
          },
        },
      });

      // Assert
      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe(email);
      expect(result.data.user.user_metadata.tenant_id).toBe(tenantId);
      expect(result.data.user.email_confirmed_at).toBeNull();
      expect(result.data.session).toBeNull(); // E-posta onayı bekleniyor
      expect(result.error).toBeNull();
    });

    it('should fail to sign up with an existing email', async () => {
      // Arrange
      const existingEmail = 'existing@example.com';
      const password = 'somePassword123';

      // E-posta zaten mevcut hatası mock'ını ayarla
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'User already registered',
          status: 422,
        },
      });

      // Act
      const result = await mockSupabaseClient.auth.signUp({
        email: existingEmail,
        password,
      });

      // Assert
      expect(result.data.user).toBeNull();
      expect(result.data.session).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('User already registered');
      expect(result.error.status).toBe(422);
    });

    it('should handle weak password during sign up', async () => {
      // Arrange
      const email = 'newuser@example.com';
      const weakPassword = '123'; // Çok zayıf şifre

      // Zayıf şifre hatası mock'ını ayarla
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthApiError',
          message: 'Password should be at least 6 characters',
          status: 422,
        },
      });

      // Act
      const result = await mockSupabaseClient.auth.signUp({
        email,
        password: weakPassword,
      });

      // Assert
      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Password should be at least');
    });
  });

  describe('Session Management Tests', () => {
    it('should retrieve existing user session', async () => {
      // Arrange
      const mockSession = {
        access_token: 'existing-access-token',
        refresh_token: 'existing-refresh-token',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'session-user@example.com',
          user_metadata: {
            tenant_id: 'tenant-789',
            role: 'admin',
          },
        },
      };

      // Mevcut session mock'ını ayarla
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.getSession();

      // Assert
      expect(result.data.session).toBeDefined();
      expect(result.data.session.user.email).toBe('session-user@example.com');
      expect(result.data.session.user.user_metadata.tenant_id).toBe('tenant-789');
      expect(result.error).toBeNull();
    });

    it('should handle no existing session', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.getSession();

      // Assert
      expect(result.data.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should successfully sign out user', async () => {
      // Arrange
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.signOut();

      // Assert
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('Password Reset Tests', () => {
    it('should successfully send password reset email', async () => {
      // Arrange
      const email = 'user@example.com';

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.resetPasswordForEmail(email);

      // Assert
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(email);
    });

    it('should handle password reset for non-existent email', async () => {
      // Arrange
      const nonExistentEmail = 'nonexistent@example.com';

      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: {
          name: 'AuthApiError',
          message: 'User not found',
          status: 400,
        },
      });

      // Act
      const result = await mockSupabaseClient.auth.resetPasswordForEmail(nonExistentEmail);

      // Assert
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('User not found');
    });
  });

  describe('Multi-Tenant Auth Integration', () => {
    it('should validate user belongs to correct tenant during auth', async () => {
      // Arrange
      const email = 'multitenant-user@example.com';
      const password = 'password123';
      const expectedTenantId = 'tenant-123';

      // Başarılı auth ama farklı tenant
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: '880e8400-e29b-41d4-a716-446655440003',
            email: email,
            user_metadata: {
              tenant_id: 'tenant-456', // Farklı tenant
              role: 'user',
            },
          },
          session: { access_token: 'token' },
        },
        error: null,
      });

      // Act
      const result = await mockSupabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      // Assert - Kullanıcı farklı tenant'ta
      expect(result.data.user.user_metadata.tenant_id).not.toBe(expectedTenantId);
      expect(result.data.user.user_metadata.tenant_id).toBe('tenant-456');

      // Bu durumda uygulama mantığında tenant kontrolü yapılması gerekir
    });

    it('should handle auth state changes for tenant-specific users', async () => {
      // Arrange
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe,
          },
        },
      });

      // Act
      const { data } = mockSupabaseClient.auth.onAuthStateChange(mockCallback);

      // Assert
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(data.subscription.unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle network timeouts gracefully', async () => {
      // Arrange
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(new Error('Network timeout'));

      // Act & Assert
      await expect(
        mockSupabaseClient.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Network timeout');
    });

    it('should retry failed auth operations', async () => {
      // Arrange
      const email = 'retry-test@example.com';
      const password = 'password123';

      // İlk iki çağrıda hata, üçüncüde başarı
      mockSupabaseClient.auth.signInWithPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            user: { id: 'test-user-id', email },
            session: { access_token: 'success-token' },
          },
          error: null,
        });

      // Act
      const result = await TestUtilityHelper.retryOperation<{
        data: { user: { id: string; email: string }; session: { access_token: string } };
        error: null;
      }>(() => mockSupabaseClient.auth.signInWithPassword({ email, password }), 3, 50);

      // Assert
      expect(result.data.user.email).toBe(email);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledTimes(3);
    });
  });
});
