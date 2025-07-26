import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import crypto from 'crypto';

interface JWTSecretConfig {
  current: string;
  previous?: string;
  rotatedAt: Date;
  nextRotation: Date;
}

/**
 * JWT Secret Manager with rotation support
 */
export class JWTSecretManager {
  private static instance: JWTSecretManager;
  private config: JWTSecretConfig;
  private rotationInterval: number = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  private constructor() {
    this.config = this.initializeSecrets();
    this.scheduleRotation();
  }

  public static getInstance(): JWTSecretManager {
    if (!JWTSecretManager.instance) {
      JWTSecretManager.instance = new JWTSecretManager();
    }
    return JWTSecretManager.instance;
  }

  /**
   * Initialize JWT secrets from environment or generate new ones
   */
  private initializeSecrets(): JWTSecretConfig {
    const currentSecret = process.env.JWT_SECRET;
    const previousSecret = process.env.JWT_SECRET_PREVIOUS;
    
    if (!currentSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    // Validate secret strength
    if (currentSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    const rotatedAtStr = process.env.JWT_ROTATED_AT;
    const rotatedAt = rotatedAtStr ? new Date(rotatedAtStr) : new Date();
    const nextRotation = new Date(rotatedAt.getTime() + this.rotationInterval);

    return {
      current: currentSecret,
      previous: previousSecret,
      rotatedAt,
      nextRotation,
    };
  }

  /**
   * Generate a new cryptographically secure secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(64).toString('base64');
  }

  /**
   * Rotate JWT secrets
   */
  public async rotateSecrets(): Promise<void> {
    const newSecret = this.generateSecret();
    
    // Update configuration
    this.config = {
      current: newSecret,
      previous: this.config.current,
      rotatedAt: new Date(),
      nextRotation: new Date(Date.now() + this.rotationInterval),
    };

    // Log rotation event (in production, this should trigger alerts)
    console.log('🔐 JWT secrets rotated successfully', {
      rotatedAt: this.config.rotatedAt,
      nextRotation: this.config.nextRotation,
    });

    // In production, you would update environment variables or secret management service
    // For now, we'll just update the in-memory config
  }

  /**
   * Schedule automatic secret rotation
   */
  private scheduleRotation(): void {
    const timeUntilRotation = this.config.nextRotation.getTime() - Date.now();
    
    if (timeUntilRotation > 0) {
      setTimeout(() => {
        this.rotateSecrets().then(() => {
          this.scheduleRotation(); // Schedule next rotation
        });
      }, timeUntilRotation);
    }
  }

  /**
   * Sign a JWT token
   */
  public async signToken(
    payload: JWTPayload,
    options?: {
      expiresIn?: string;
      audience?: string;
      issuer?: string;
    }
  ): Promise<string> {
    const secret = new TextEncoder().encode(this.config.current);
    
    let jwt = new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setJti(crypto.randomUUID());

    if (options?.expiresIn) {
      jwt = jwt.setExpirationTime(options.expiresIn);
    }
    
    if (options?.audience) {
      jwt = jwt.setAudience(options.audience);
    }
    
    if (options?.issuer) {
      jwt = jwt.setIssuer(options.issuer);
    }

    return await jwt.sign(secret);
  }

  /**
   * Verify a JWT token (supports current and previous secrets)
   */
  public async verifyToken(
    token: string,
    options?: {
      audience?: string;
      issuer?: string;
    }
  ): Promise<JWTPayload> {
    // Try current secret first
    try {
      const currentSecret = new TextEncoder().encode(this.config.current);
      const { payload } = await jwtVerify(token, currentSecret, options);
      return payload;
    } catch (error) {
      // If current secret fails and we have a previous secret, try that
      if (this.config.previous) {
        try {
          const previousSecret = new TextEncoder().encode(this.config.previous);
          const { payload } = await jwtVerify(token, previousSecret, options);
          
          // Log that token was verified with previous secret (for monitoring)
          console.warn('🔐 JWT verified with previous secret - consider token refresh');
          
          return payload;
        } catch (previousError) {
          // Both secrets failed
          throw new Error('Invalid JWT token');
        }
      }
      
      throw error;
    }
  }

  /**
   * Get secret rotation status
   */
  public getRotationStatus(): {
    rotatedAt: Date;
    nextRotation: Date;
    daysUntilRotation: number;
  } {
    const daysUntilRotation = Math.ceil(
      (this.config.nextRotation.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    return {
      rotatedAt: this.config.rotatedAt,
      nextRotation: this.config.nextRotation,
      daysUntilRotation,
    };
  }

  /**
   * Force immediate rotation (for emergency situations)
   */
  public async forceRotation(): Promise<void> {
    await this.rotateSecrets();
  }
}

// Export singleton instance
export const jwtManager = JWTSecretManager.getInstance();

/**
 * Utility functions for common JWT operations
 */
export const jwtUtils = {
  /**
   * Create an access token
   */
  async createAccessToken(
    userId: string,
    tenantId: string,
    role: string,
    additionalClaims?: Record<string, any>
  ): Promise<string> {
    return jwtManager.signToken(
      {
        sub: userId,
        tenantId,
        role,
        type: 'access',
        ...additionalClaims,
      },
      {
        expiresIn: '15m',
        audience: 'i-ep.app',
        issuer: 'i-ep.app',
      }
    );
  },

  /**
   * Create a refresh token
   */
  async createRefreshToken(
    userId: string,
    tenantId: string
  ): Promise<string> {
    return jwtManager.signToken(
      {
        sub: userId,
        tenantId,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
        audience: 'i-ep.app',
        issuer: 'i-ep.app',
      }
    );
  },

  /**
   * Verify and decode a token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    return jwtManager.verifyToken(token, {
      audience: 'i-ep.app',
      issuer: 'i-ep.app',
    });
  },
};
