import { describe, it, expect } from '@jest/globals';
import { extractTenantFromSubdomain, createTenantUrl, detectTenantFromUrl } from '@/lib/tenant/tenant-utils';

describe('Tenant Utilities', () => {
  describe('extractTenantFromSubdomain', () => {
    it('geçerli bir alt alan adından tenant ID döndürmelidir', () => {
      // Arrange
      const host = 'okul1.i-ep.app';
      
      // Act
      const result = extractTenantFromSubdomain(host);
      
      // Assert
      expect(result).toBe('okul1');
    });
    
    it('NEXT_PUBLIC_DOMAIN içermeyen alan adından null döndürmelidir', () => {
      // Arrange
      const host = 'example.com';
      
      // Act
      const result = extractTenantFromSubdomain(host);
      
      // Assert
      expect(result).toBeNull();
    });
    
    it('protokolleri temizlemelidir', () => {
      // Arrange
      const host = 'https://okul1.i-ep.app';
      
      // Act
      const result = extractTenantFromSubdomain(host);
      
      // Assert
      expect(result).toBe('okul1');
    });
  });
  
  describe('createTenantUrl', () => {
    it('geçerli bir tenant URL oluşturmalıdır', () => {
      // Arrange
      const subdomain = 'okul1';
      const path = '/dashboard';
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // Act
      const result = createTenantUrl(subdomain, path);
      
      // Assert
      expect(result).toBe('https://okul1.i-ep.app/dashboard');
      
      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
    
    it('geliştirme ortamında http protokolünü kullanmalıdır', () => {
      // Arrange
      const subdomain = 'okul1';
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Act
      const result = createTenantUrl(subdomain);
      
      // Assert
      expect(result).toBe('http://okul1.i-ep.app/');
      
      // Cleanup
      process.env.NODE_ENV = originalEnv;
    });
  });
  
  describe('detectTenantFromUrl', () => {
    it('URL\'den tenant ID\'yi tespit etmelidir', () => {
      // Arrange
      const url = 'https://okul1.i-ep.app/dashboard';
      
      // Act
      const result = detectTenantFromUrl(url);
      
      // Assert
      expect(result).toBe('okul1');
    });
    
    it('geçersiz URL\'den null döndürmelidir', () => {
      // Arrange
      const url = 'invalid-url';
      
      // Act
      const result = detectTenantFromUrl(url);
      
      // Assert
      expect(result).toBeNull();
    });
  });
}); 