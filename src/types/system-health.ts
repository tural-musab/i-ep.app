/**
 * System Health Types
 * Sprint 7: Super Admin System Health API'si için tip tanımları
 */

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptime: number; // seconds
  checks: HealthCheck[];
  version: string;
  environment: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  duration: number; // milliseconds
  timestamp: string;
  details?: Record<string, string | number | boolean>;
}

export interface DatabaseHealth {
  connection: boolean;
  responseTime: number;
  activeConnections?: number;
  maxConnections?: number;
  lastQuery?: string;
}

export interface RedisHealth {
  connection: boolean;
  responseTime: number;
  memoryUsage?: {
    used: number;
    max: number;
    percentage: number;
  };
  keyCount?: number;
}

export interface SSLHealth {
  domain: string;
  isValid: boolean;
  expiresAt?: string;
  daysUntilExpiry?: number;
  issuer?: string;
  status: 'valid' | 'expiring' | 'expired' | 'invalid';
}

export interface SystemMetrics {
  timestamp: string;
  cpu?: {
    usage: number;
    load: number[];
  };
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  disk?: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface TenantHealth {
  tenantId: string;
  tenantName: string;
  status: 'active' | 'inactive' | 'suspended';
  userCount: number;
  lastActivity?: string;
  storageUsed?: number;
}

export interface SystemHealthReport {
  overall: SystemHealthStatus;
  database: DatabaseHealth;
  redis: RedisHealth;
  ssl: SSLHealth[];
  metrics?: SystemMetrics;
  tenants?: TenantHealth[];
}

// Health check response format
export interface HealthCheckResponse {
  success: boolean;
  data?: SystemHealthReport;
  error?: string;
  timestamp: string;
}
