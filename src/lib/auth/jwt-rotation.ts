import crypto from 'crypto';
import logger from '@/lib/logger';

// JWT Secret rotation için ana interface
interface JWTSecretConfig {
  current: string;
  previous: string[];
  rotatedAt: Date;
  rotationInterval: number; // milliseconds
}

// JWT Secret storage (production'da external key management service kullanılmalı)
class JWTSecretManager {
  private secrets: JWTSecretConfig;
  private rotationTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.secrets = {
      current: this.generateSecret(),
      previous: [],
      rotatedAt: new Date(),
      rotationInterval: 7 * 24 * 60 * 60 * 1000 // 7 days default
    };

    // Load from environment if available
    this.loadFromEnvironment();
    
    // Start automatic rotation
    this.startAutomaticRotation();
  }

  /**
   * Environment'tan JWT secret konfigürasyonunu yükle
   */
  private loadFromEnvironment(): void {
    try {
      const envSecret = process.env.JWT_SECRET;
      const envRotationInterval = process.env.JWT_ROTATION_INTERVAL_HOURS;
      const envPreviousSecrets = process.env.JWT_PREVIOUS_SECRETS;

      if (envSecret) {
        this.secrets.current = envSecret;
      }

      if (envRotationInterval) {
        this.secrets.rotationInterval = parseInt(envRotationInterval) * 60 * 60 * 1000; // hours to ms
      }

      if (envPreviousSecrets) {
        this.secrets.previous = envPreviousSecrets.split(',').filter(Boolean);
      }

      logger.info('JWT secret configuration loaded from environment', {
        hasCurrentSecret: !!envSecret,
        rotationIntervalHours: this.secrets.rotationInterval / (60 * 60 * 1000),
        previousSecretsCount: this.secrets.previous.length
      });
    } catch (error) {
      logger.error('Failed to load JWT secret configuration from environment', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Güvenli JWT secret oluştur
   */
  private generateSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Mevcut aktif JWT secret'ı döndür
   */
  getCurrentSecret(): string {
    return this.secrets.current;
  }

  /**
   * Tüm geçerli secret'ları döndür (current + previous)
   */
  getAllValidSecrets(): string[] {
    return [this.secrets.current, ...this.secrets.previous];
  }

  /**
   * JWT secret'ını manually rotate et
   */
  async rotateSecret(reason?: string): Promise<{ success: boolean; newSecret: string }> {
    try {
      logger.info('Starting JWT secret rotation', { 
        reason: reason || 'manual_rotation',
        currentSecretAge: Date.now() - this.secrets.rotatedAt.getTime()
      });

      // Mevcut secret'ı previous listesine ekle
      this.secrets.previous.unshift(this.secrets.current);

      // Yeni secret oluştur
      const newSecret = this.generateSecret();
      this.secrets.current = newSecret;
      this.secrets.rotatedAt = new Date();

      // Previous secrets listesini limit ile (max 3 previous secret)
      if (this.secrets.previous.length > 3) {
        const removedSecrets = this.secrets.previous.splice(3);
        logger.info('Removed old JWT secrets', { 
          removedCount: removedSecrets.length 
        });
      }

      // Audit log
      await this.logRotationEvent(reason || 'manual_rotation');

      // Environment değişkenlerini güncelle (production'da key management service)
      await this.updateEnvironmentSecrets();

      logger.info('JWT secret rotation completed successfully', {
        newSecretGenerated: true,
        previousSecretsCount: this.secrets.previous.length,
        reason: reason || 'manual_rotation'
      });

      return { success: true, newSecret };
    } catch (error) {
      logger.error('JWT secret rotation failed', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        reason: reason || 'manual_rotation'
      });
      return { success: false, newSecret: '' };
    }
  }

  /**
   * Otomatik JWT secret rotation'ı başlat
   */
  private startAutomaticRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }

    // Development'ta otomatik rotation kapalı
    if (process.env.NODE_ENV === 'development') {
      logger.info('JWT automatic rotation disabled in development environment');
      return;
    }

    this.rotationTimer = setInterval(async () => {
      await this.rotateSecret('automatic_rotation');
    }, this.secrets.rotationInterval);

    logger.info('JWT automatic rotation started', {
      intervalHours: this.secrets.rotationInterval / (60 * 60 * 1000),
      nextRotation: new Date(Date.now() + this.secrets.rotationInterval).toISOString()
    });
  }

  /**
   * Otomatik rotation'ı durdur
   */
  stopAutomaticRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
      logger.info('JWT automatic rotation stopped');
    }
  }

  /**
   * JWT secret'ının geçerli olup olmadığını kontrol et
   */
  isSecretValid(secret: string): boolean {
    return this.getAllValidSecrets().includes(secret);
  }

  /**
   * JWT secret rotation event'ini audit log'a kaydet
   */
  private async logRotationEvent(reason: string): Promise<void> {
    try {
      // Bu production'da external audit service'e gönderilebilir
      const auditData = {
        event: 'jwt_secret_rotated',
        reason,
        timestamp: new Date().toISOString(),
        rotationCount: this.secrets.previous.length + 1,
        environment: process.env.NODE_ENV || 'unknown'
      };

      logger.info('JWT secret rotation audit log', auditData);

      // Database'e audit kayıt (production'da)
      if (process.env.NODE_ENV === 'production') {
        // TODO: Database'e audit kaydı ekle
        // await auditService.logSecurityEvent(auditData);
      }
    } catch (error) {
      logger.error('Failed to log JWT rotation audit event', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Environment secrets'ları güncelle (production'da key management service)
   */
  private async updateEnvironmentSecrets(): Promise<void> {
    try {
      // Production'da bu AWS Secrets Manager, Azure Key Vault, vs. ile yapılmalı
      if (process.env.NODE_ENV === 'production') {
        logger.info('JWT secrets should be updated in external key management service', {
          currentSecret: this.secrets.current.substring(0, 8) + '...',
          previousSecretsCount: this.secrets.previous.length
        });
        
        // TODO: External key management service integration
        // await keyManagementService.updateSecret('jwt-current', this.secrets.current);
        // await keyManagementService.updateSecret('jwt-previous', this.secrets.previous.join(','));
      }
    } catch (error) {
      logger.error('Failed to update environment secrets', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * JWT secret rotation durumunu döndür
   */
  getRotationStatus(): {
    currentSecretAge: number;
    nextRotationIn: number;
    previousSecretsCount: number;
    autoRotationEnabled: boolean;
  } {
    const currentSecretAge = Date.now() - this.secrets.rotatedAt.getTime();
    const nextRotationIn = this.secrets.rotationInterval - currentSecretAge;

    return {
      currentSecretAge,
      nextRotationIn: Math.max(0, nextRotationIn),
      previousSecretsCount: this.secrets.previous.length,
      autoRotationEnabled: this.rotationTimer !== null
    };
  }

  /**
   * Emergency rotation (güvenlik ihlali durumunda)
   */
  async emergencyRotation(): Promise<{ success: boolean; newSecret: string }> {
    logger.warn('Emergency JWT secret rotation initiated', {
      reason: 'security_breach',
      currentSecretAge: Date.now() - this.secrets.rotatedAt.getTime()
    });

    // Tüm eski secret'ları geçersiz kıl
    this.secrets.previous = [];
    
    return await this.rotateSecret('emergency_security_breach');
  }

  /**
   * Cleanup - memory'yi temizle
   */
  cleanup(): void {
    this.stopAutomaticRotation();
    
    // Sensitive data'yı temizle
    this.secrets.current = '';
    this.secrets.previous = [];
    
    logger.info('JWT secret manager cleaned up');
  }
}

// Singleton instance
let jwtSecretManager: JWTSecretManager | null = null;

/**
 * JWT Secret Manager singleton instance'ını döndür
 */
export function getJWTSecretManager(): JWTSecretManager {
  if (!jwtSecretManager) {
    jwtSecretManager = new JWTSecretManager();
  }
  return jwtSecretManager;
}

/**
 * JWT Secret Manager'ı kapat ve temizle
 */
export function shutdownJWTSecretManager(): void {
  if (jwtSecretManager) {
    jwtSecretManager.cleanup();
    jwtSecretManager = null;
  }
}

// Process exit handler'ları
if (typeof process !== 'undefined') {
  process.on('SIGTERM', shutdownJWTSecretManager);
  process.on('SIGINT', shutdownJWTSecretManager);
  process.on('exit', shutdownJWTSecretManager);
}

export default JWTSecretManager; 