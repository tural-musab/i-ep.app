// @ts-nocheck
/**
 * CloudflareR2Provider Tests
 * Tests for the Cloudflare R2 storage provider implementation
 */

// Mock the env module before importing
jest.mock('@/env', () => ({
  env: {
    CLOUDFLARE_R2_ACCESS_KEY_ID: 'test-access-key',
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'test-secret-key',
    CLOUDFLARE_R2_ENDPOINT: 'https://test.r2.cloudflarestorage.com',
    CLOUDFLARE_R2_BUCKET_NAME: 'test-bucket',
  },
}));

import { CloudflareR2Provider } from '@/lib/storage/providers/cloudflare-r2.provider';

// Mock environment variables
const mockEnv = {
  CLOUDFLARE_R2_ACCESS_KEY_ID: 'test-access-key',
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'test-secret-key',
  CLOUDFLARE_R2_ENDPOINT: 'https://test.r2.cloudflarestorage.com',
  CLOUDFLARE_R2_BUCKET_NAME: 'test-bucket',
};

// Mock fetch globally
global.fetch = jest.fn();

describe('CloudflareR2Provider', () => {
  let provider: CloudflareR2Provider;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment
    Object.assign(process.env, mockEnv);

    // Create provider instance
    provider = new CloudflareR2Provider();
  });

  afterEach(() => {
    // Clean up environment
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key];
    });
  });

  describe('Configuration', () => {
    it('should detect proper configuration', () => {
      const configStatus = provider.getConfigStatus();
      expect(configStatus.configured).toBe(true);
      expect(configStatus.endpoint).toBe(mockEnv.CLOUDFLARE_R2_ENDPOINT);
      expect(configStatus.bucketName).toBe(mockEnv.CLOUDFLARE_R2_BUCKET_NAME);
    });

    it('should handle missing credentials', () => {
      // Mock empty environment for this test
      jest.doMock('@/env', () => ({
        env: {
          CLOUDFLARE_R2_ACCESS_KEY_ID: '',
          CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'test-secret',
          CLOUDFLARE_R2_ENDPOINT: 'https://test.r2.cloudflarestorage.com',
          CLOUDFLARE_R2_BUCKET_NAME: 'test-bucket',
        },
      }));

      const provider2 = new CloudflareR2Provider();
      const configStatus = provider2.getConfigStatus();
      expect(configStatus.configured).toBe(false);
    });
  });

  describe('File Operations', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    it('should upload file successfully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: () => Promise.resolve(new Blob(['test content'])),
      });

      const result = await provider.upload(mockFile, 'test/path.txt', {
        tenantId: 'test-tenant',
        category: 'documents',
      });

      expect(result).toMatchObject({
        filename: 'test.txt',
        size: expect.any(Number),
        mimeType: 'text/plain',
        tenantId: 'test-tenant',
        category: 'documents',
      });
      expect(result.id).toContain('tenants/test-tenant/documents/');
    });

    it('should handle upload failure', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(provider.upload(mockFile, 'test/path.txt')).rejects.toThrow();
    });

    it('should download file successfully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: () => Promise.resolve(new Blob(['test content'])),
      });

      const result = await provider.download('test-file-id');
      expect(result).toBeInstanceOf(Blob);
    });

    it('should delete file successfully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await expect(provider.delete('test-file-id')).resolves.not.toThrow();
    });
  });

  describe('URL Generation', () => {
    it('should generate public URL', () => {
      const url = provider.getPublicUrl('test-file-id');
      expect(url).toBe('https://storage.i-ep.app/test-file-id');
    });

    it('should generate signed URL', async () => {
      const url = await provider.getSignedUrl('test-file-id', 3600);
      expect(url).toContain('test-file-id');
      expect(url).toContain('expires=');
      expect(url).toContain('signature=');
    });
  });

  describe('Mock Mode', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    beforeEach(() => {
      // Mock empty environment for these tests
      jest.doMock('@/env', () => ({
        env: {
          CLOUDFLARE_R2_ACCESS_KEY_ID: '',
          CLOUDFLARE_R2_SECRET_ACCESS_KEY: '',
          CLOUDFLARE_R2_ENDPOINT: '',
          CLOUDFLARE_R2_BUCKET_NAME: '',
        },
      }));
    });

    it('should use mock upload when not configured', async () => {
      // Create a new provider instance that isn't configured
      const unconfiguredProvider = new CloudflareR2Provider();

      // Override the isConfigured method to return false
      (unconfiguredProvider as any).isConfigured = () => false;

      const result = await unconfiguredProvider.upload(mockFile, 'test/path.txt');
      expect(result.id).toContain('test/path.txt');
    });

    it('should use mock download when not configured', async () => {
      const unconfiguredProvider = new CloudflareR2Provider();
      (unconfiguredProvider as any).isConfigured = () => false;

      const result = await unconfiguredProvider.download('test-file-id');
      expect(result).toBeInstanceOf(Blob);
    });

    it('should use mock delete when not configured', async () => {
      const unconfiguredProvider = new CloudflareR2Provider();
      (unconfiguredProvider as any).isConfigured = () => false;

      await expect(unconfiguredProvider.delete('test-file-id')).resolves.not.toThrow();
    });
  });
});
