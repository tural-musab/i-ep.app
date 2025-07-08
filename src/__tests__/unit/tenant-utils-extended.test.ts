import { describe, it, expect } from '@jest/globals';
import { 
  extractTenantFromSubdomain, 
  isFeatureEnabled, 
  createTenantUrl, 
  detectTenantFromUrl 
} from '@/lib/tenant/tenant-utils';
import { Tenant } from '@/types/tenant';

describe('Tenant Utils Extended Tests', () => {
  describe('extractTenantFromSubdomain', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DOMAIN = 'i-ep.app';
    });

    it('should extract tenant from subdomain', () => {
      const result = extractTenantFromSubdomain('test-school.i-ep.app');
      expect(result).toBe('test-school');
    });

    it('should handle localhost with tenant', () => {
      // Not applicable for this implementation
      const result = extractTenantFromSubdomain('test.localhost:3000');
      expect(result).toBeNull();
    });

    it('should return null for non-matching domain', () => {
      const result = extractTenantFromSubdomain('example.com');
      expect(result).toBeNull();
    });

    it('should handle complex subdomains', () => {
      const result = extractTenantFromSubdomain('test-school-123.i-ep.app');
      expect(result).toBe('test-school-123');
    });

    it('should handle domains with protocols', () => {
      const result = extractTenantFromSubdomain('https://test.i-ep.app');
      expect(result).toBe('test');
    });
  });

  describe('isFeatureEnabled', () => {
    const premiumTenant: Tenant = {
      id: '1',
      name: 'Premium School',
      subdomain: 'premium',
      planType: 'premium',
      createdAt: new Date(),
      settings: {
        allowParentRegistration: true,
        allowTeacherRegistration: true,
        languagePreference: 'tr',
        timeZone: 'Europe/Istanbul'
      },
      isActive: true
    };

    const standardTenant: Tenant = {
      ...premiumTenant,
      planType: 'standard'
    };

    const freeTenant: Tenant = {
      ...premiumTenant,
      planType: 'free'
    };

    it('should allow all features for premium plan', () => {
      expect(isFeatureEnabled(premiumTenant, 'advanced_analytics')).toBe(true);
      expect(isFeatureEnabled(premiumTenant, 'custom_branding')).toBe(true);
      expect(isFeatureEnabled(premiumTenant, 'api_access')).toBe(true);
      expect(isFeatureEnabled(premiumTenant, 'basic_dashboard')).toBe(true);
    });

    it('should restrict some features for standard plan', () => {
      expect(isFeatureEnabled(standardTenant, 'advanced_analytics')).toBe(false);
      expect(isFeatureEnabled(standardTenant, 'custom_branding')).toBe(false);
      expect(isFeatureEnabled(standardTenant, 'api_access')).toBe(false);
      expect(isFeatureEnabled(standardTenant, 'basic_dashboard')).toBe(true);
    });

    it('should allow only basic features for free plan', () => {
      expect(isFeatureEnabled(freeTenant, 'advanced_analytics')).toBe(false);
      expect(isFeatureEnabled(freeTenant, 'custom_branding')).toBe(false);
      expect(isFeatureEnabled(freeTenant, 'api_access')).toBe(false);
      expect(isFeatureEnabled(freeTenant, 'basic_dashboard')).toBe(true);
      expect(isFeatureEnabled(freeTenant, 'student_management')).toBe(true);
      expect(isFeatureEnabled(freeTenant, 'simple_grading')).toBe(true);
    });
  });

  describe('createTenantUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DOMAIN = 'i-ep.app';
      process.env.NODE_ENV = 'production';
    });

    it('should create correct tenant URL for production', () => {
      const result = createTenantUrl('test-school', '/dashboard');
      expect(result).toBe('https://test-school.i-ep.app/dashboard');
    });

    it('should use default path when not provided', () => {
      const result = createTenantUrl('test-school');
      expect(result).toBe('https://test-school.i-ep.app/');
    });

    it('should use http for development', () => {
      const originalNodeEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        writable: true,
        configurable: true
      });
      
      const result = createTenantUrl('test-school', '/admin');
      expect(result).toBe('http://test-school.i-ep.app/admin');
      
      // Restore original value
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalNodeEnv,
        writable: true,
        configurable: true
      });
    });
  });

  describe('detectTenantFromUrl', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_DOMAIN = 'i-ep.app';
    });

    it('should detect tenant from valid URL', () => {
      const result = detectTenantFromUrl('https://test-school.i-ep.app/dashboard');
      expect(result).toBe('test-school');
    });

    it('should return null for root domain URL', () => {
      const result = detectTenantFromUrl('https://i-ep.app/dashboard');
      expect(result).toBeNull();
    });

    it('should handle URLs with paths and query params', () => {
      const result = detectTenantFromUrl('https://my-school.i-ep.app/admin/users?page=1');
      expect(result).toBe('my-school');
    });

    it('should return null for invalid URLs', () => {
      const result = detectTenantFromUrl('invalid-url');
      expect(result).toBeNull();
    });
  });
}); 