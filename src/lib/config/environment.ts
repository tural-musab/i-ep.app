export type Environment = 'development' | 'staging' | 'production' | 'test';

export interface EnvironmentConfig {
  environment: Environment;
  database: {
    url: string;
    maxConnections: number;
    sslMode: string;
    poolTimeout: number;
    statementTimeout: number;
    queryTimeout: number;
  };
  redis: {
    url: string;
    maxRetries: number;
    retryDelayOnFailover: number;
    connectTimeout: number;
  };
  security: {
    enforceHttps: boolean;
    csrfProtection: boolean;
    rateLimiting: boolean;
    auditLogging: boolean;
    encryptionEnabled: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  monitoring: {
    sentryEnabled: boolean;
    analyticsEnabled: boolean;
    performanceMonitoring: boolean;
    errorReporting: boolean;
    healthChecks: boolean;
  };
  features: {
    paymentProcessing: boolean;
    fileUploads: boolean;
    notifications: boolean;
    backgroundJobs: boolean;
    caching: boolean;
    search: boolean;
  };
  limits: {
    maxFileSize: number;
    maxRequestSize: number;
    maxConcurrentRequests: number;
    rateLimitWindow: number;
    rateLimitMaxRequests: number;
  };
  external: {
    supabase: {
      url: string;
      anonKey: string;
      serviceRoleKey: string;
      maxConnections: number;
    };
    iyzico: {
      enabled: boolean;
      apiKey: string;
      secretKey: string;
      baseUrl: string;
    };
    sentry: {
      dsn: string;
      environment: string;
      tracesSampleRate: number;
    };
  };
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig;
  private environment: Environment;

  private constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private detectEnvironment(): Environment {
    const nodeEnv = process.env.NODE_ENV;
    const vercelEnv = process.env.VERCEL_ENV;

    // Check for test environment first
    if (nodeEnv === 'test' || process.env.CI === 'true') {
      return 'test';
    }

    // Check Vercel environment
    if (vercelEnv === 'production') {
      return 'production';
    }

    if (vercelEnv === 'preview' || nodeEnv === 'staging') {
      return 'staging';
    }

    // Default to development
    return 'development';
  }

  private loadConfiguration(): EnvironmentConfig {
    const env = this.environment;

    return {
      environment: env,
      database: {
        url: process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || '',
        maxConnections: this.getNumberValue(
          'DATABASE_MAX_CONNECTIONS',
          env === 'production' ? 20 : 10
        ),
        sslMode: env === 'production' ? 'require' : 'prefer',
        poolTimeout: this.getNumberValue('DATABASE_POOL_TIMEOUT', 30000),
        statementTimeout: this.getNumberValue('DATABASE_STATEMENT_TIMEOUT', 30000),
        queryTimeout: this.getNumberValue('DATABASE_QUERY_TIMEOUT', 10000),
      },
      redis: {
        url: process.env.UPSTASH_REDIS_REST_URL || '',
        maxRetries: this.getNumberValue('REDIS_MAX_RETRIES', 3),
        retryDelayOnFailover: this.getNumberValue('REDIS_RETRY_DELAY', 100),
        connectTimeout: this.getNumberValue('REDIS_CONNECT_TIMEOUT', 10000),
      },
      security: {
        enforceHttps: env === 'production',
        csrfProtection: env !== 'development',
        rateLimiting: env !== 'development',
        auditLogging: env !== 'development',
        encryptionEnabled: env === 'production',
        passwordPolicy: {
          minLength: env === 'production' ? 12 : 8,
          requireUppercase: env === 'production',
          requireLowercase: true,
          requireNumbers: env === 'production',
          requireSymbols: env === 'production',
        },
      },
      monitoring: {
        sentryEnabled: env === 'production' || env === 'staging',
        analyticsEnabled: env === 'production',
        performanceMonitoring: env === 'production',
        errorReporting: env !== 'development',
        healthChecks: env !== 'development',
      },
      features: {
        paymentProcessing: env === 'production' || env === 'staging',
        fileUploads: true,
        notifications: env !== 'development',
        backgroundJobs: env !== 'development',
        caching: env !== 'development',
        search: true,
      },
      limits: {
        maxFileSize: this.getNumberValue(
          'MAX_FILE_SIZE',
          env === 'production' ? 10 * 1024 * 1024 : 50 * 1024 * 1024
        ),
        maxRequestSize: this.getNumberValue(
          'MAX_REQUEST_SIZE',
          env === 'production' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
        ),
        maxConcurrentRequests: this.getNumberValue(
          'MAX_CONCURRENT_REQUESTS',
          env === 'production' ? 100 : 50
        ),
        rateLimitWindow: this.getNumberValue('RATE_LIMIT_WINDOW', 60 * 1000),
        rateLimitMaxRequests: this.getNumberValue(
          'RATE_LIMIT_MAX_REQUESTS',
          env === 'production' ? 100 : 1000
        ),
      },
      external: {
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
          maxConnections: this.getNumberValue('SUPABASE_MAX_CONNECTIONS', 10),
        },
        iyzico: {
          enabled: env === 'production' || env === 'staging',
          apiKey: process.env.IYZICO_API_KEY || '',
          secretKey: process.env.IYZICO_SECRET_KEY || '',
          baseUrl:
            env === 'production' ? 'https://api.iyzipay.com' : 'https://sandbox-api.iyzipay.com',
        },
        sentry: {
          dsn: process.env.SENTRY_DSN || '',
          environment: env,
          tracesSampleRate: env === 'production' ? 0.1 : 1.0,
        },
      },
    };
  }

  private getNumberValue(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  private validateConfiguration(): void {
    const errors: string[] = [];

    // Validate required environment variables
    if (!this.config.external.supabase.url) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
    }

    if (!this.config.external.supabase.anonKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    }

    if (!this.config.external.supabase.serviceRoleKey) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
    }

    // Validate production-specific requirements
    if (this.environment === 'production') {
      if (!this.config.redis.url) {
        errors.push('UPSTASH_REDIS_REST_URL is required in production');
      }

      if (
        this.config.external.iyzico.enabled &&
        (!this.config.external.iyzico.apiKey || !this.config.external.iyzico.secretKey)
      ) {
        errors.push('IYZICO_API_KEY and IYZICO_SECRET_KEY are required in production');
      }

      if (this.config.monitoring.sentryEnabled && !this.config.external.sentry.dsn) {
        errors.push('SENTRY_DSN is required in production');
      }
    }

    // Validate staging-specific requirements
    if (this.environment === 'staging') {
      if (!this.config.redis.url) {
        errors.push('UPSTASH_REDIS_REST_URL is required in staging');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Environment configuration errors:\n${errors.join('\n')}`);
    }
  }

  getConfig(): EnvironmentConfig {
    return this.config;
  }

  getEnvironment(): Environment {
    return this.environment;
  }

  isDevelopment(): boolean {
    return this.environment === 'development';
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }

  isStaging(): boolean {
    return this.environment === 'staging';
  }

  isTest(): boolean {
    return this.environment === 'test';
  }

  getFeatureFlag(feature: keyof EnvironmentConfig['features']): boolean {
    return this.config.features[feature];
  }

  getSecurityConfig(): EnvironmentConfig['security'] {
    return this.config.security;
  }

  getMonitoringConfig(): EnvironmentConfig['monitoring'] {
    return this.config.monitoring;
  }

  getLimitsConfig(): EnvironmentConfig['limits'] {
    return this.config.limits;
  }

  getExternalConfig(): EnvironmentConfig['external'] {
    return this.config.external;
  }

  updateConfig(updates: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.validateConfiguration();
  }

  generateConfigReport(): string {
    const config = this.config;

    let report = `\n=== ENVIRONMENT CONFIGURATION REPORT ===\n`;
    report += `Environment: ${config.environment}\n`;
    report += `Node Environment: ${process.env.NODE_ENV}\n`;
    report += `Vercel Environment: ${process.env.VERCEL_ENV || 'none'}\n\n`;

    report += `DATABASE CONFIGURATION:\n`;
    report += `- Max Connections: ${config.database.maxConnections}\n`;
    report += `- SSL Mode: ${config.database.sslMode}\n`;
    report += `- Pool Timeout: ${config.database.poolTimeout}ms\n`;
    report += `- Statement Timeout: ${config.database.statementTimeout}ms\n`;
    report += `- Query Timeout: ${config.database.queryTimeout}ms\n\n`;

    report += `SECURITY CONFIGURATION:\n`;
    report += `- HTTPS Enforcement: ${config.security.enforceHttps ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- CSRF Protection: ${config.security.csrfProtection ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Rate Limiting: ${config.security.rateLimiting ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Audit Logging: ${config.security.auditLogging ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Encryption: ${config.security.encryptionEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Password Min Length: ${config.security.passwordPolicy.minLength}\n\n`;

    report += `MONITORING CONFIGURATION:\n`;
    report += `- Sentry: ${config.monitoring.sentryEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Analytics: ${config.monitoring.analyticsEnabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Performance Monitoring: ${config.monitoring.performanceMonitoring ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Error Reporting: ${config.monitoring.errorReporting ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Health Checks: ${config.monitoring.healthChecks ? '✅ Enabled' : '❌ Disabled'}\n\n`;

    report += `FEATURES:\n`;
    report += `- Payment Processing: ${config.features.paymentProcessing ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- File Uploads: ${config.features.fileUploads ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Notifications: ${config.features.notifications ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Background Jobs: ${config.features.backgroundJobs ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Caching: ${config.features.caching ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Search: ${config.features.search ? '✅ Enabled' : '❌ Disabled'}\n\n`;

    report += `LIMITS:\n`;
    report += `- Max File Size: ${(config.limits.maxFileSize / (1024 * 1024)).toFixed(1)}MB\n`;
    report += `- Max Request Size: ${(config.limits.maxRequestSize / (1024 * 1024)).toFixed(1)}MB\n`;
    report += `- Max Concurrent Requests: ${config.limits.maxConcurrentRequests}\n`;
    report += `- Rate Limit Window: ${config.limits.rateLimitWindow}ms\n`;
    report += `- Rate Limit Max Requests: ${config.limits.rateLimitMaxRequests}\n\n`;

    report += `EXTERNAL SERVICES:\n`;
    report += `- Supabase: ${config.external.supabase.url ? '✅ Configured' : '❌ Not configured'}\n`;
    report += `- İyzico: ${config.external.iyzico.enabled ? '✅ Enabled' : '❌ Disabled'}\n`;
    report += `- Sentry: ${config.external.sentry.dsn ? '✅ Configured' : '❌ Not configured'}\n`;
    report += `- Redis: ${config.redis.url ? '✅ Configured' : '❌ Not configured'}\n`;

    return report;
  }
}

// Global instance
export const environmentManager = EnvironmentManager.getInstance();

// Utility functions
export function getEnvironment(): Environment {
  return environmentManager.getEnvironment();
}

export function getConfig(): EnvironmentConfig {
  return environmentManager.getConfig();
}

export function isProduction(): boolean {
  return environmentManager.isProduction();
}

export function isDevelopment(): boolean {
  return environmentManager.isDevelopment();
}

export function isStaging(): boolean {
  return environmentManager.isStaging();
}

export function isTest(): boolean {
  return environmentManager.isTest();
}

export function getFeatureFlag(feature: keyof EnvironmentConfig['features']): boolean {
  return environmentManager.getFeatureFlag(feature);
}

export function getSecurityConfig(): EnvironmentConfig['security'] {
  return environmentManager.getSecurityConfig();
}

export function getMonitoringConfig(): EnvironmentConfig['monitoring'] {
  return environmentManager.getMonitoringConfig();
}

export function getLimitsConfig(): EnvironmentConfig['limits'] {
  return environmentManager.getLimitsConfig();
}

export function getExternalConfig(): EnvironmentConfig['external'] {
  return environmentManager.getExternalConfig();
}
