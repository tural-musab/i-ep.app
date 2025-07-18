import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly SALT_LENGTH = 32;
  private static readonly TAG_LENGTH = 16;

  private static getEncryptionKey(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
  }

  static encrypt(text: string, password: string): string {
    try {
      const salt = randomBytes(this.SALT_LENGTH);
      const iv = randomBytes(this.IV_LENGTH);
      const key = this.getEncryptionKey(password, salt);

      const cipher = createCipheriv(this.ALGORITHM, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine salt, iv, tag, and encrypted data
      const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);
      return result.toString('base64');
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedData: string, password: string): string {
    try {
      const data = Buffer.from(encryptedData, 'base64');

      // Extract components
      const salt = data.subarray(0, this.SALT_LENGTH);
      const iv = data.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
      const tag = data.subarray(
        this.SALT_LENGTH + this.IV_LENGTH,
        this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH
      );
      const encrypted = data.subarray(this.SALT_LENGTH + this.IV_LENGTH + this.TAG_LENGTH);

      const key = this.getEncryptionKey(password, salt);

      const decipher = createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  static hashPassword(password: string): string {
    const salt = randomBytes(this.SALT_LENGTH);
    const hash = pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha256');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const saltBuffer = Buffer.from(salt, 'hex');
      const hashBuffer = Buffer.from(hash, 'hex');

      const computedHash = pbkdf2Sync(password, saltBuffer, 100000, this.KEY_LENGTH, 'sha256');

      return computedHash.equals(hashBuffer);
    } catch (error) {
      return false;
    }
  }

  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  static generateAPIKey(): string {
    const prefix = 'iep_';
    const key = randomBytes(32).toString('hex');
    return prefix + key;
  }
}

// Field-level encryption for sensitive data
export class FieldEncryption {
  private static readonly MASTER_KEY = process.env.FIELD_ENCRYPTION_KEY || 'fallback-master-key';

  static encryptField(value: string, fieldName: string): string {
    const fieldKey = this.deriveFieldKey(fieldName);
    return EncryptionService.encrypt(value, fieldKey);
  }

  static decryptField(encryptedValue: string, fieldName: string): string {
    const fieldKey = this.deriveFieldKey(fieldName);
    return EncryptionService.decrypt(encryptedValue, fieldKey);
  }

  private static deriveFieldKey(fieldName: string): string {
    const salt = Buffer.from(fieldName, 'utf8');
    const key = pbkdf2Sync(this.MASTER_KEY, salt, 100000, 32, 'sha256');
    return key.toString('hex');
  }

  static encryptPII(data: {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    [key: string]: any;
  }): any {
    const encrypted = { ...data };

    if (data.email) {
      encrypted.email = this.encryptField(data.email, 'email');
    }

    if (data.phone) {
      encrypted.phone = this.encryptField(data.phone, 'phone');
    }

    if (data.address) {
      encrypted.address = this.encryptField(data.address, 'address');
    }

    if (data.ssn) {
      encrypted.ssn = this.encryptField(data.ssn, 'ssn');
    }

    return encrypted;
  }

  static decryptPII(encryptedData: {
    email?: string;
    phone?: string;
    address?: string;
    ssn?: string;
    [key: string]: any;
  }): any {
    const decrypted = { ...encryptedData };

    try {
      if (encryptedData.email) {
        decrypted.email = this.decryptField(encryptedData.email, 'email');
      }

      if (encryptedData.phone) {
        decrypted.phone = this.decryptField(encryptedData.phone, 'phone');
      }

      if (encryptedData.address) {
        decrypted.address = this.decryptField(encryptedData.address, 'address');
      }

      if (encryptedData.ssn) {
        decrypted.ssn = this.decryptField(encryptedData.ssn, 'ssn');
      }
    } catch (error) {
      console.error('Failed to decrypt PII:', error);
      throw new Error('Failed to decrypt personal information');
    }

    return decrypted;
  }
}

// Token management for JWT alternatives
export class TokenManager {
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly SECRET_KEY = process.env.TOKEN_SECRET || 'fallback-token-secret';

  static generateToken(payload: Record<string, any>): string {
    const tokenData = {
      ...payload,
      exp: Date.now() + this.TOKEN_EXPIRY,
      iat: Date.now(),
    };

    return EncryptionService.encrypt(JSON.stringify(tokenData), this.SECRET_KEY);
  }

  static verifyToken(token: string): { valid: boolean; payload?: Record<string, any> } {
    try {
      const decrypted = EncryptionService.decrypt(token, this.SECRET_KEY);
      const payload = JSON.parse(decrypted);

      if (payload.exp < Date.now()) {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }

  static refreshToken(token: string): string | null {
    const { valid, payload } = this.verifyToken(token);

    if (!valid || !payload) {
      return null;
    }

    // Remove old timestamps
    const { exp, iat, ...tokenPayload } = payload;

    return this.generateToken(tokenPayload);
  }
}

// Secure session management
export class SecureSessionManager {
  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly SECRET_KEY = process.env.SESSION_SECRET || 'fallback-session-secret';

  static createSession(
    userId: string,
    tenantId: string,
    metadata: Record<string, any> = {}
  ): string {
    const sessionData = {
      userId,
      tenantId,
      ...metadata,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
    };

    return EncryptionService.encrypt(JSON.stringify(sessionData), this.SECRET_KEY);
  }

  static validateSession(sessionToken: string): {
    valid: boolean;
    userId?: string;
    tenantId?: string;
    metadata?: Record<string, any>;
  } {
    try {
      const decrypted = EncryptionService.decrypt(sessionToken, this.SECRET_KEY);
      const sessionData = JSON.parse(decrypted);

      if (sessionData.expiresAt < Date.now()) {
        return { valid: false };
      }

      const { userId, tenantId, ...metadata } = sessionData;
      return { valid: true, userId, tenantId, metadata };
    } catch (error) {
      return { valid: false };
    }
  }

  static extendSession(sessionToken: string): string | null {
    const { valid, userId, tenantId, metadata } = this.validateSession(sessionToken);

    if (!valid || !userId || !tenantId) {
      return null;
    }

    return this.createSession(userId, tenantId, metadata);
  }
}
