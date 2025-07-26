// @ts-nocheck
/**
 * @jest-environment node
 */

import { getJWTSecretManager, shutdownJWTSecretManager } from '@/lib/auth/jwt-rotation';
import logger from '@/lib/logger';

// Mock logger
jest.mock('@/lib/logger');

describe('JWT Secret Rotation', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Environment backup
    originalEnv = { ...process.env };

    // Clean environment for tests
    delete process.env.JWT_SECRET;
    delete process.env.JWT_ROTATION_INTERVAL_HOURS;
    delete process.env.JWT_PREVIOUS_SECRETS;

    // Mock logger methods
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Cleanup JWT manager
    shutdownJWTSecretManager();
  });

  describe('JWTSecretManager Initialization', () => {
    it('should initialize with default configuration', () => {
      const manager = getJWTSecretManager();

      expect(manager.getCurrentSecret()).toBeDefined();
      expect(manager.getCurrentSecret()).toHaveLength(128); // 64 bytes hex = 128 chars
      expect(manager.getAllValidSecrets()).toHaveLength(1);

      const status = manager.getRotationStatus();
      expect(status.previousSecretsCount).toBe(0);
      expect(status.currentSecretAge).toBeLessThan(1000); // Should be very recent
    });

    it('should load configuration from environment variables', () => {
      process.env.JWT_SECRET = 'test-secret-from-env';
      process.env.JWT_ROTATION_INTERVAL_HOURS = '48';
      process.env.JWT_PREVIOUS_SECRETS = 'old-secret-1,old-secret-2';

      const manager = getJWTSecretManager();

      expect(manager.getCurrentSecret()).toBe('test-secret-from-env');
      expect(manager.getAllValidSecrets()).toContain('old-secret-1');
      expect(manager.getAllValidSecrets()).toContain('old-secret-2');
      expect(manager.getAllValidSecrets()).toHaveLength(3); // current + 2 previous

      const status = manager.getRotationStatus();
      expect(status.previousSecretsCount).toBe(2);
    });

    it('should disable automatic rotation in development', () => {
      // Mock NODE_ENV for this test
      const originalEnv = process.env;
      process.env = { ...originalEnv, NODE_ENV: 'development' };

      const manager = getJWTSecretManager();
      const status = manager.getRotationStatus();

      expect(status.autoRotationEnabled).toBe(false);
      expect(logger.info).toHaveBeenCalledWith(
        'JWT automatic rotation disabled in development environment'
      );

      process.env = originalEnv;
    });
  });

  describe('Secret Rotation', () => {
    it('should successfully rotate JWT secret', async () => {
      const manager = getJWTSecretManager();
      const originalSecret = manager.getCurrentSecret();

      const result = await manager.rotateSecret('test_rotation');

      expect(result.success).toBe(true);
      expect(result.newSecret).toBeDefined();
      expect(result.newSecret).not.toBe(originalSecret);
      expect(manager.getCurrentSecret()).toBe(result.newSecret);
      expect(manager.getAllValidSecrets()).toContain(originalSecret);
      expect(manager.getAllValidSecrets()).toHaveLength(2);
    });

    it('should limit previous secrets to maximum of 3', async () => {
      const manager = getJWTSecretManager();

      // Rotate 5 times
      for (let i = 0; i < 5; i++) {
        await manager.rotateSecret(`rotation_${i}`);
      }

      // Should only keep current + 3 previous = 4 total
      expect(manager.getAllValidSecrets()).toHaveLength(4);

      const status = manager.getRotationStatus();
      expect(status.previousSecretsCount).toBe(3);
    });

    it('should handle emergency rotation correctly', async () => {
      const manager = getJWTSecretManager();

      // Add some previous secrets first
      await manager.rotateSecret('normal_1');
      await manager.rotateSecret('normal_2');

      expect(manager.getAllValidSecrets()).toHaveLength(3);

      // Emergency rotation should clear all previous secrets
      const result = await manager.emergencyRotation();

      expect(result.success).toBe(true);
      expect(manager.getAllValidSecrets()).toHaveLength(1); // Only current

      const status = manager.getRotationStatus();
      expect(status.previousSecretsCount).toBe(0);

      expect(logger.warn).toHaveBeenCalledWith(
        'Emergency JWT secret rotation initiated',
        expect.objectContaining({ reason: 'security_breach' })
      );
    });
  });

  describe('Secret Validation', () => {
    it('should validate current secret', () => {
      const manager = getJWTSecretManager();
      const currentSecret = manager.getCurrentSecret();

      expect(manager.isSecretValid(currentSecret)).toBe(true);
    });

    it('should validate previous secrets', async () => {
      const manager = getJWTSecretManager();
      const originalSecret = manager.getCurrentSecret();

      await manager.rotateSecret('test');

      expect(manager.isSecretValid(originalSecret)).toBe(true);
      expect(manager.isSecretValid(manager.getCurrentSecret())).toBe(true);
    });

    it('should reject invalid secrets', () => {
      const manager = getJWTSecretManager();

      expect(manager.isSecretValid('invalid-secret')).toBe(false);
      expect(manager.isSecretValid('')).toBe(false);
    });
  });

  describe('Rotation Status', () => {
    it('should provide accurate rotation status', () => {
      const manager = getJWTSecretManager();
      const status = manager.getRotationStatus();

      expect(status.currentSecretAge).toBeGreaterThanOrEqual(0);
      expect(status.nextRotationIn).toBeGreaterThan(0);
      expect(status.previousSecretsCount).toBe(0);
      expect(typeof status.autoRotationEnabled).toBe('boolean');
    });

    it('should update status after rotation', async () => {
      const manager = getJWTSecretManager();
      const statusBefore = manager.getRotationStatus();

      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
      await manager.rotateSecret('test');

      const statusAfter = manager.getRotationStatus();

      expect(statusAfter.currentSecretAge).toBeLessThan(statusBefore.currentSecretAge);
      expect(statusAfter.previousSecretsCount).toBe(1);
    });
  });

  describe('Automatic Rotation', () => {
    it('should stop automatic rotation', () => {
      const manager = getJWTSecretManager();

      manager.stopAutomaticRotation();

      const status = manager.getRotationStatus();
      expect(status.autoRotationEnabled).toBe(false);

      expect(logger.info).toHaveBeenCalledWith('JWT automatic rotation stopped');
    });
  });

  describe('Cleanup', () => {
    it('should properly cleanup resources', () => {
      const manager = getJWTSecretManager();

      manager.cleanup();

      expect(logger.info).toHaveBeenCalledWith('JWT secret manager cleaned up');
    });
  });

  describe('Error Handling', () => {
    it('should handle rotation errors gracefully', async () => {
      const manager = getJWTSecretManager();

      // Mock an error during rotation
      const managerWithPrivate = manager as unknown as { logRotationEvent: jest.Mock };
      const originalLogRotationEvent = managerWithPrivate.logRotationEvent;
      managerWithPrivate.logRotationEvent = jest
        .fn()
        .mockRejectedValue(new Error('Audit service down'));

      const result = await manager.rotateSecret('test_with_error');

      // Should still succeed despite audit logging error
      expect(result.success).toBe(true);
      expect(result.newSecret).toBeDefined();

      // Restore original method
      managerWithPrivate.logRotationEvent = originalLogRotationEvent;
    });

    it('should handle environment loading errors', () => {
      process.env.JWT_ROTATION_INTERVAL_HOURS = 'invalid-number';

      // Should not throw, just use defaults
      expect(() => {
        getJWTSecretManager();
      }).not.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load JWT secret configuration from environment',
        expect.any(Object)
      );
    });
  });

  describe('Security Features', () => {
    it('should generate cryptographically secure secrets', () => {
      const manager = getJWTSecretManager();
      const secrets = new Set();

      // Generate multiple secrets and ensure they're all unique
      for (let i = 0; i < 10; i++) {
        const secret = (manager as Record<string, unknown>).generateSecret() as string;
        expect(secret).toHaveLength(128);
        expect(secret).toMatch(/^[a-f0-9]{128}$/); // Hex format
        expect(secrets.has(secret)).toBe(false);
        secrets.add(secret);
      }
    });

    it('should mask secrets in logs', async () => {
      process.env.NODE_ENV = 'production';

      const manager = getJWTSecretManager();
      await manager.rotateSecret('test');

      // Check that secrets are masked in production logs
      const logCalls = (logger.info as jest.Mock).mock.calls;
      const secretLogCall = logCalls.find(
        (call) => call[0] === 'JWT secrets should be updated in external key management service'
      );

      if (secretLogCall) {
        const logData = secretLogCall[1];
        expect(logData.currentSecret).toMatch(/^[a-f0-9]{8}\.\.\.$/);
      }
    });

    it('should audit all rotation events', async () => {
      const manager = getJWTSecretManager();

      await manager.rotateSecret('security_audit_test');

      expect(logger.info).toHaveBeenCalledWith(
        'JWT secret rotation audit log',
        expect.objectContaining({
          event: 'jwt_secret_rotated',
          reason: 'security_audit_test',
          timestamp: expect.any(String),
          rotationCount: expect.any(Number),
          environment: expect.any(String),
        })
      );
    });
  });
});
