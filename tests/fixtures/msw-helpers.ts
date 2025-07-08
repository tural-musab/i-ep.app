import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { cloudflareFixtures } from './cloudflare/dns-records';
import { supabaseAuthFixtures, supabaseDbFixtures } from './supabase/auth-responses';

/**
 * MSW Server Instance - Tüm testlerde kullanılacak
 */
export const mockServer = setupServer();

/**
 * Cloudflare API mock'larını kurma helper'ı
 */
export class CloudflareMockHelper {
  static setupSuccessfulDnsRecordCreation(subdomain: string = 'test-tenant') {
    const zoneId = "023e105f4ecef8ad9ca31a8372d0c353";
    
    // Zone ID alma isteğini mock'la
    mockServer.use(
      http.get('https://api.cloudflare.com/client/v4/zones', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('name') === 'i-ep.app') {
          return HttpResponse.json(cloudflareFixtures.getZoneIdSuccess);
        }
        return HttpResponse.json(cloudflareFixtures.getZoneIdNotFound);
      })
    );

    // DNS record oluşturma isteğini mock'la
    mockServer.use(
      http.post(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, () => {
        return HttpResponse.json({
          ...cloudflareFixtures.createDnsRecordSuccess,
          result: {
            ...cloudflareFixtures.createDnsRecordSuccess.result,
            name: `${subdomain}.i-ep.app`
          }
        });
      })
    );
  }

  static setupFailedDnsRecordCreation(errorType: 'unauthorized' | 'rateLimit' | 'recordExists' = 'recordExists') {
    const zoneId = "023e105f4ecef8ad9ca31a8372d0c353";
    
    // Zone ID alma başarılı
    mockServer.use(
      http.get('https://api.cloudflare.com/client/v4/zones', () => {
        return HttpResponse.json(cloudflareFixtures.getZoneIdSuccess);
      })
    );

    let errorResponse;
    let statusCode;

    switch (errorType) {
      case 'unauthorized':
        errorResponse = cloudflareFixtures.unauthorizedError;
        statusCode = 401;
        break;
      case 'rateLimit':
        errorResponse = cloudflareFixtures.rateLimitError;
        statusCode = 429;
        break;
      case 'recordExists':
      default:
        errorResponse = cloudflareFixtures.createDnsRecordError;
        statusCode = 400;
        break;
    }

    // DNS record oluşturma hatası
    mockServer.use(
      http.post(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, () => {
        return HttpResponse.json(errorResponse, { status: statusCode });
      })
    );
  }

  static setupZoneNotFound() {
    mockServer.use(
      http.get('https://api.cloudflare.com/client/v4/zones', () => {
        return HttpResponse.json(cloudflareFixtures.getZoneIdNotFound);
      })
    );
  }

  static setupDnsRecordsList() {
    const zoneId = "023e105f4ecef8ad9ca31a8372d0c353";
    
    mockServer.use(
      http.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, () => {
        return HttpResponse.json(cloudflareFixtures.listDnsRecordsSuccess);
      })
    );
  }

  static setupDnsRecordDeletion(recordId: string = "372e67954025e0ba6aaa6d586b9e0b59") {
    const zoneId = "023e105f4ecef8ad9ca31a8372d0c353";
    
    mockServer.use(
      http.delete(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`, () => {
        return HttpResponse.json(cloudflareFixtures.deleteDnsRecordSuccess);
      })
    );
  }
}

/**
 * Supabase API mock'larını kurma helper'ı
 */
export class SupabaseMockHelper {
  static setupSuccessfulSignIn(email: string = 'test@example.com') {
    // Auth sign-in isteğini mock'la
    mockServer.use(
      http.post('https://test.supabase.co/auth/v1/token', async ({ request }) => {
        const body = await request.json() as { grant_type: string; email: string; password: string };
        if (body.grant_type === 'password' && body.email === email) {
          return HttpResponse.json(supabaseAuthFixtures.signInSuccess);
        }
        return HttpResponse.json(supabaseAuthFixtures.signInErrorInvalidCredentials, { status: 400 });
      })
    );

    // Kullanıcı profil bilgisi alma isteğini mock'la
    mockServer.use(
      http.get('https://test.supabase.co/rest/v1/users', () => {
        return HttpResponse.json(supabaseDbFixtures.getUserProfileSuccess.data);
      })
    );
  }

  static setupFailedSignIn(errorType: 'invalidCredentials' | 'userNotFound' = 'invalidCredentials') {
    let errorResponse;

    switch (errorType) {
      case 'userNotFound':
        errorResponse = {
          ...supabaseAuthFixtures.signInErrorInvalidCredentials,
          error: {
            name: "AuthApiError",
            message: "User not found",
            status: 400
          }
        };
        break;
      case 'invalidCredentials':
      default:
        errorResponse = supabaseAuthFixtures.signInErrorInvalidCredentials;
        break;
    }

    mockServer.use(
      http.post('https://test.supabase.co/auth/v1/token', () => {
        return HttpResponse.json(errorResponse, { status: 400 });
      })
    );
  }

  static setupSuccessfulSignUp(email: string = 'newuser@example.com') {
    mockServer.use(
      http.post('https://test.supabase.co/auth/v1/signup', () => {
        return HttpResponse.json({
          ...supabaseAuthFixtures.signUpSuccess,
          user: {
            ...supabaseAuthFixtures.signUpSuccess.user,
            email
          }
        });
      })
    );
  }

  static setupFailedSignUp(errorType: 'emailExists' | 'weakPassword' = 'emailExists') {
    let errorResponse;

    switch (errorType) {
      case 'weakPassword':
        errorResponse = {
          ...supabaseAuthFixtures.signUpErrorEmailExists,
          error: {
            name: "AuthApiError",
            message: "Password should be at least 6 characters",
            status: 422
          }
        };
        break;
      case 'emailExists':
      default:
        errorResponse = supabaseAuthFixtures.signUpErrorEmailExists;
        break;
    }

    mockServer.use(
      http.post('https://test.supabase.co/auth/v1/signup', () => {
        return HttpResponse.json(errorResponse, { status: 422 });
      })
    );
  }

  static setupGetSession(hasSession: boolean = true) {
    const response = hasSession 
      ? supabaseAuthFixtures.getSessionSuccess 
      : supabaseAuthFixtures.getSessionEmpty;

    mockServer.use(
      http.get('https://test.supabase.co/auth/v1/user', () => {
        return HttpResponse.json(response);
      })
    );
  }

  static setupPasswordReset(success: boolean = true) {
    const response = success 
      ? supabaseAuthFixtures.resetPasswordSuccess 
      : supabaseAuthFixtures.resetPasswordErrorEmailNotFound;

    const statusCode = success ? 200 : 400;

    mockServer.use(
      http.post('https://test.supabase.co/auth/v1/recover', () => {
        return HttpResponse.json(response, { status: statusCode });
      })
    );
  }

  static setupSignOut() {
    mockServer.use(
      http.post('https://test.supabase.co/auth/v1/logout', () => {
        return HttpResponse.json(supabaseAuthFixtures.signOutSuccess, { status: 204 });
      })
    );
  }

  static setupGetTenant(tenantExists: boolean = true) {
    const response = tenantExists 
      ? supabaseDbFixtures.getTenantSuccess 
      : supabaseDbFixtures.getTenantNotFound;

    mockServer.use(
      http.get('https://test.supabase.co/rest/v1/tenants', () => {
        return HttpResponse.json(response);
      })
    );
  }

  static setupGetUserProfile(userExists: boolean = true) {
    if (userExists) {
      mockServer.use(
        http.get('https://test.supabase.co/rest/v1/users', () => {
          return HttpResponse.json(supabaseDbFixtures.getUserProfileSuccess.data);
        })
      );
    } else {
      mockServer.use(
        http.get('https://test.supabase.co/rest/v1/users', () => {
          return HttpResponse.json(supabaseDbFixtures.getUserProfileNotFound, { status: 406 });
        })
      );
    }
  }
}

/**
 * Test environment setup helper'ı
 */
export class TestEnvironmentHelper {
  static setupTestEnvironment() {
    // Test ortamı değişkenlerini ayarla
    // NODE_ENV jest setup'ta zaten test olarak ayarlanmış
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.CLOUDFLARE_API_TOKEN = 'test-cf-token';
    process.env.CLOUDFLARE_ZONE_ID = '023e105f4ecef8ad9ca31a8372d0c353';
    process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-purposes-only-32chars';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
  }

  static setupMockServer() {
    // Mock server'ı başlat
    mockServer.listen({
      onUnhandledRequest: 'bypass', // Handled olmayan istekleri gerçek endpoint'lere yönlendir
    });
  }

  static cleanup() {
    // Tüm mock'ları temizle
    mockServer.resetHandlers();
  }

  static teardown() {
    // Server'ı kapat
    mockServer.close();
  }
}

/**
 * Test timeout ve retry helper'ı
 */
export class TestUtilityHelper {
  static async waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 100
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.waitFor(delay);
        }
      }
    }

    throw lastError!;
  }

  static generateRandomTenantId(): string {
    return `tenant-${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateRandomEmail(): string {
    return `test-${Math.random().toString(36).substr(2, 9)}@example.com`;
  }
} 