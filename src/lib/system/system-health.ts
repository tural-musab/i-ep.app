/**
 * System Health Service
 * Sprint 7: Super Admin Paneli - Sistem Sağlığı İzleme
 * 
 * Bu servis sistem bileşenlerinin sağlığını kontrol eder:
 * - Database bağlantısı ve performansı
 * - Redis cache durumu
 * - SSL sertifika durumları
 * - Sistem metrikleri
 */

import { 
  SystemHealthReport, 
  DatabaseHealth, 
  RedisHealth, 
  SSLHealth, 
  HealthCheck, 
  SystemHealthStatus 
} from '@/types/system-health';
import { redis } from '@/lib/cache/redis';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('system-health');
const startTime = Date.now();

export class SystemHealthService {
  /**
   * Tam sistem sağlığı raporu oluşturur
   */
  static async generateHealthReport(): Promise<SystemHealthReport> {
    const timestamp = new Date().toISOString();
    const checks: HealthCheck[] = [];

    // Paralel sağlık kontrolleri
    const [databaseHealth, redisHealth, sslHealths] = await Promise.allSettled([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkSSLHealth()
    ]);

    // Database health check
    const dbHealth = databaseHealth.status === 'fulfilled' 
      ? databaseHealth.value 
      : { connection: false, responseTime: 0 };
    
    checks.push({
      name: 'database',
      status: dbHealth.connection ? 'pass' : 'fail',
      message: dbHealth.connection ? 'Database connection healthy' : 'Database connection failed',
      duration: dbHealth.responseTime,
      timestamp
    });

    // Redis health check
    const redisHealthResult = redisHealth.status === 'fulfilled' 
      ? redisHealth.value 
      : { connection: false, responseTime: 0 };
    
    checks.push({
      name: 'redis',
      status: redisHealthResult.connection ? 'pass' : 'fail',
      message: redisHealthResult.connection ? 'Redis connection healthy' : 'Redis connection failed',
      duration: redisHealthResult.responseTime,
      timestamp
    });

    // SSL health checks
    const sslResults = sslHealths.status === 'fulfilled' ? sslHealths.value : [];
    const sslFailures = sslResults.filter(ssl => ssl.status === 'expired' || ssl.status === 'invalid');
    const sslWarnings = sslResults.filter(ssl => ssl.status === 'expiring');
    
    checks.push({
      name: 'ssl_certificates',
      status: sslFailures.length > 0 ? 'fail' : (sslWarnings.length > 0 ? 'warn' : 'pass'),
      message: `${sslResults.length} certificates checked, ${sslFailures.length} failures, ${sslWarnings.length} warnings`,
      duration: 0,
      timestamp
    });

    // Overall status determination
    const failedChecks = checks.filter(check => check.status === 'fail').length;
    const warnChecks = checks.filter(check => check.status === 'warn').length;
    
    let overallStatus: SystemHealthStatus['status'] = 'healthy';
    if (failedChecks > 0) {
      overallStatus = 'down';
    } else if (warnChecks > 0) {
      overallStatus = 'degraded';
    }

    const overall: SystemHealthStatus = {
      status: overallStatus,
      timestamp,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return {
      overall,
      database: dbHealth,
      redis: redisHealthResult,
      ssl: sslResults
    };
  }

  /**
   * Database sağlığını kontrol eder
   */
  static async checkDatabaseHealth(): Promise<DatabaseHealth> {
    const startTime = Date.now();
    
    try {
      // Simple connectivity test
      const { error } = await supabaseAdmin
        .from('tenants')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        logger.error('Database health check failed:', error);
        return {
          connection: false,
          responseTime,
          lastQuery: 'SELECT count FROM tenants LIMIT 1'
        };
      }

      // Get connection stats if available
      let connectionStats = {};
      try {
        const { data: stats } = await supabaseAdmin.rpc('pg_stat_database');
        if (stats && stats.length > 0) {
          connectionStats = {
            activeConnections: stats[0].numbackends || 0,
            maxConnections: 100 // Default, should be configurable
          };
        }
      } catch (statsError) {
        // Connection stats are optional
        logger.warn('Could not fetch connection stats:', statsError);
      }

      return {
        connection: true,
        responseTime,
        lastQuery: 'SELECT count FROM tenants LIMIT 1',
        ...connectionStats
      };

    } catch (error) {
      logger.error('Database health check error:', error);
      return {
        connection: false,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Redis sağlığını kontrol eder
   */
  static async checkRedisHealth(): Promise<RedisHealth> {
    const startTime = Date.now();
    
    try {
      // Test Redis connection with ping
      const pingResult = await redis.ping();
      const responseTime = Date.now() - startTime;

      if (pingResult !== 'PONG') {
        return {
          connection: false,
          responseTime
        };
      }

      // Get Redis info if available
      let additionalInfo = {};
      try {
        // Get key count from default database
        const keyCount = await redis.dbsize();
        
        // Try to get memory info (this might not work with Upstash REST API)
        additionalInfo = {
          keyCount: keyCount || 0
        };
      } catch (infoError) {
        // Additional info is optional
        logger.warn('Could not fetch Redis additional info:', infoError);
      }

      return {
        connection: true,
        responseTime,
        ...additionalInfo
      };

    } catch (error) {
      logger.error('Redis health check error:', error);
      return {
        connection: false,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * SSL sertifika durumlarını kontrol eder
   */
  static async checkSSLHealth(): Promise<SSLHealth[]> {
    try {
      // Get all domains from database
      const { data: domains, error } = await supabaseAdmin
        .from('tenant_domains')
        .select('domain, tenant_id, is_verified')
        .eq('is_verified', true);

      if (error) {
        logger.error('Failed to fetch domains for SSL check:', error);
        return [];
      }

      if (!domains || domains.length === 0) {
        return [];
      }

      // Check SSL for each domain (in parallel, but limited)
      const sslChecks = domains.slice(0, 10).map(domain => 
        this.checkDomainSSL(domain.domain)
      );

      const results = await Promise.allSettled(sslChecks);
      
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<SSLHealth>).value)
        .filter(ssl => ssl !== null);

    } catch (error) {
      logger.error('SSL health check error:', error);
      return [];
    }
  }

  /**
   * Einzelne Domain için SSL kontrolü
   */
  private static async checkDomainSSL(domain: string): Promise<SSLHealth> {
    try {
      // For now, we'll do a basic check. In production, you might want to use
      // a proper SSL certificate checking library
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Basic SSL validation - if HTTPS request succeeds, SSL is likely valid
      const isValid = response.ok;
      
      return {
        domain,
        isValid,
        status: isValid ? 'valid' : 'invalid'
      };

    } catch (error) {
      logger.warn(`SSL check failed for ${domain}:`, error);
      return {
        domain,
        isValid: false,
        status: 'invalid'
      };
    }
  }

  /**
   * Hızlı sistem durumu kontrolü (sadece kritik bileşenler)
   */
  static async quickHealthCheck(): Promise<{ status: string; timestamp: string }> {
    const timestamp = new Date().toISOString();
    
    try {
      // Parallel quick checks
      const [dbCheck, redisCheck] = await Promise.allSettled([
        this.quickDatabaseCheck(),
        this.quickRedisCheck()
      ]);

      const dbHealthy = dbCheck.status === 'fulfilled' && dbCheck.value;
      const redisHealthy = redisCheck.status === 'fulfilled' && redisCheck.value;

      let status = 'healthy';
      if (!dbHealthy || !redisHealthy) {
        status = 'unhealthy';
      }

      return { status, timestamp };

    } catch (error) {
      logger.error('Quick health check failed:', error);
      return { status: 'unhealthy', timestamp };
    }
  }

  private static async quickDatabaseCheck(): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('tenants')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  private static async quickRedisCheck(): Promise<boolean> {
    try {
      const result = await redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }
} 