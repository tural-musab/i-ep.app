import nock from 'nock';
import { cloudflareFixtures } from './cloudflare/dns-records';
import { supabaseAuthFixtures, supabaseDbFixtures } from './supabase/auth-responses';

/**
 * Cloudflare API mock'larını kurma helper'ı
 */
export class CloudflareMockHelper {
  static setupSuccessfulDnsRecordCreation(subdomain: string = 'test-tenant') {
    const zoneId = '023e105f4ecef8ad9ca31a8372d0c353';

    // Zone ID alma isteğini mock'la
    nock('https://api.cloudflare.com')
      .get('/client/v4/zones')
      .query({ name: 'i-ep.app' })
      .reply(200, cloudflareFixtures.getZoneIdSuccess);

    // DNS record oluşturma isteğini mock'la
    nock('https://api.cloudflare.com')
      .post(`/client/v4/zones/${zoneId}/dns_records`)
      .reply(200, {
        ...cloudflareFixtures.createDnsRecordSuccess,
        result: {
          ...cloudflareFixtures.createDnsRecordSuccess.result,
          name: `${subdomain}.i-ep.app`,
        },
      });
  }

  static setupFailedDnsRecordCreation(
    errorType: 'unauthorized' | 'rateLimit' | 'recordExists' = 'recordExists'
  ) {
    const zoneId = '023e105f4ecef8ad9ca31a8372d0c353';

    // Zone ID alma başarılı
    nock('https://api.cloudflare.com')
      .get('/client/v4/zones')
      .query({ name: 'i-ep.app' })
      .reply(200, cloudflareFixtures.getZoneIdSuccess);

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
    nock('https://api.cloudflare.com')
      .post(`/client/v4/zones/${zoneId}/dns_records`)
      .reply(statusCode, errorResponse);
  }

  static setupZoneNotFound() {
    nock('https://api.cloudflare.com')
      .get('/client/v4/zones')
      .query({ name: 'i-ep.app' })
      .reply(200, cloudflareFixtures.getZoneIdNotFound);
  }

  static setupDnsRecordsList() {
    const zoneId = '023e105f4ecef8ad9ca31a8372d0c353';

    nock('https://api.cloudflare.com')
      .get(`/client/v4/zones/${zoneId}/dns_records`)
      .query(true)
      .reply(200, cloudflareFixtures.listDnsRecordsSuccess);
  }

  static setupDnsRecordDeletion(recordId: string = '372e67954025e0ba6aaa6d586b9e0b59') {
    const zoneId = '023e105f4ecef8ad9ca31a8372d0c353';

    nock('https://api.cloudflare.com')
      .delete(`/client/v4/zones/${zoneId}/dns_records/${recordId}`)
      .reply(200, cloudflareFixtures.deleteDnsRecordSuccess);
  }

  static cleanupMocks() {
    nock.cleanAll();
  }
}

/**
 * Supabase API mock'larını kurma helper'ı
 */
export class SupabaseMockHelper {
  static setupSuccessfulSignIn(email: string = 'test@example.com') {
    // Auth sign-in isteğini mock'la
    nock('https://test.supabase.co')
      .post('/auth/v1/token', {
        grant_type: 'password',
        email,
        password: /.*/,
      })
      .reply(200, supabaseAuthFixtures.signInSuccess);

    // Kullanıcı profil bilgisi alma isteğini mock'la
    nock('https://test.supabase.co')
      .get('/rest/v1/users')
      .query(true)
      .reply(200, supabaseDbFixtures.getUserProfileSuccess.data);
  }

  static setupFailedSignIn(
    errorType: 'invalidCredentials' | 'userNotFound' = 'invalidCredentials'
  ) {
    let errorResponse;

    switch (errorType) {
      case 'userNotFound':
        errorResponse = {
          ...supabaseAuthFixtures.signInErrorInvalidCredentials,
          error: {
            name: 'AuthApiError',
            message: 'User not found',
            status: 400,
          },
        };
        break;
      case 'invalidCredentials':
      default:
        errorResponse = supabaseAuthFixtures.signInErrorInvalidCredentials;
        break;
    }

    nock('https://test.supabase.co').post('/auth/v1/token').reply(400, errorResponse);
  }

  static setupSuccessfulSignUp(email: string = 'newuser@example.com') {
    nock('https://test.supabase.co')
      .post('/auth/v1/signup')
      .reply(200, {
        ...supabaseAuthFixtures.signUpSuccess,
        user: {
          ...supabaseAuthFixtures.signUpSuccess.user,
          email,
        },
      });
  }

  static setupFailedSignUp(errorType: 'emailExists' | 'weakPassword' = 'emailExists') {
    let errorResponse;

    switch (errorType) {
      case 'weakPassword':
        errorResponse = {
          ...supabaseAuthFixtures.signUpErrorEmailExists,
          error: {
            name: 'AuthApiError',
            message: 'Password should be at least 6 characters',
            status: 422,
          },
        };
        break;
      case 'emailExists':
      default:
        errorResponse = supabaseAuthFixtures.signUpErrorEmailExists;
        break;
    }

    nock('https://test.supabase.co').post('/auth/v1/signup').reply(422, errorResponse);
  }

  static setupGetSession(hasSession: boolean = true) {
    const response = hasSession
      ? supabaseAuthFixtures.getSessionSuccess
      : supabaseAuthFixtures.getSessionEmpty;

    nock('https://test.supabase.co').get('/auth/v1/user').reply(200, response);
  }

  static setupPasswordReset(success: boolean = true) {
    const response = success
      ? supabaseAuthFixtures.resetPasswordSuccess
      : supabaseAuthFixtures.resetPasswordErrorEmailNotFound;

    const statusCode = success ? 200 : 400;

    nock('https://test.supabase.co').post('/auth/v1/recover').reply(statusCode, response);
  }

  static setupSignOut() {
    nock('https://test.supabase.co')
      .post('/auth/v1/logout')
      .reply(204, supabaseAuthFixtures.signOutSuccess);
  }

  static setupGetTenant(tenantExists: boolean = true) {
    const response = tenantExists
      ? supabaseDbFixtures.getTenantSuccess
      : supabaseDbFixtures.getTenantNotFound;

    nock('https://test.supabase.co').get('/rest/v1/tenants').query(true).reply(200, response);
  }

  static setupGetUserProfile(userExists: boolean = true) {
    if (userExists) {
      nock('https://test.supabase.co')
        .get('/rest/v1/users')
        .query(true)
        .reply(200, supabaseDbFixtures.getUserProfileSuccess.data);
    } else {
      nock('https://test.supabase.co')
        .get('/rest/v1/users')
        .query(true)
        .reply(406, supabaseDbFixtures.getUserProfileNotFound);
    }
  }

  static cleanupMocks() {
    nock.cleanAll();
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

  static cleanup() {
    CloudflareMockHelper.cleanupMocks();
    SupabaseMockHelper.cleanupMocks();
  }
}

/**
 * Test timeout ve retry helper'ı
 */
export class TestUtilityHelper {
  static async waitFor(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
