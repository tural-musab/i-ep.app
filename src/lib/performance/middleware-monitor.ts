/**
 * Middleware Performance Monitor
 * Sprint 2 PF-001: Performance monitoring for middleware optimization
 */

interface PerformanceMetrics {
  requestId: string;
  timestamp: number;
  pathname: string;
  hostname: string;
  processingTime: number;
  tenantResolutionTime: number;
  authCheckTime: number;
  cacheHit: boolean;
  outcome: 'success' | 'redirect' | 'error';
}

class MiddlewarePerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 requests

  startRequest(requestId: string, pathname: string, hostname: string) {
    return {
      requestId,
      pathname,
      hostname,
      startTime: Date.now(),
      tenantStart: 0,
      authStart: 0,
    };
  }

  recordTenantResolution(context: any) {
    context.tenantStart = Date.now();
    return context;
  }

  recordAuthCheck(context: any) {
    context.authStart = Date.now();
    return context;
  }

  finishRequest(
    context: any,
    outcome: 'success' | 'redirect' | 'error',
    cacheHit: boolean = false
  ) {
    const endTime = Date.now();
    const metric: PerformanceMetrics = {
      requestId: context.requestId,
      timestamp: context.startTime,
      pathname: context.pathname,
      hostname: context.hostname,
      processingTime: endTime - context.startTime,
      tenantResolutionTime: context.tenantStart
        ? (context.authStart || endTime) - context.tenantStart
        : 0,
      authCheckTime: context.authStart ? endTime - context.authStart : 0,
      cacheHit,
      outcome,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow requests
    if (metric.processingTime > 200) {
      console.warn(`Slow middleware request: ${metric.pathname} - ${metric.processingTime}ms`);
    }

    return metric;
  }

  getMetrics(limit: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-limit);
  }

  getAverageProcessingTime(minutes: number = 5): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) return 0;

    const totalTime = recentMetrics.reduce((sum, m) => sum + m.processingTime, 0);
    return totalTime / recentMetrics.length;
  }

  getCacheHitRate(minutes: number = 5): number {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) return 0;

    const cacheHits = recentMetrics.filter((m) => m.cacheHit).length;
    return (cacheHits / recentMetrics.length) * 100;
  }

  getHealthStatus(): {
    averageResponseTime: number;
    cacheHitRate: number;
    slowRequestCount: number;
    errorRate: number;
    status: 'healthy' | 'warning' | 'critical';
  } {
    const avgTime = this.getAverageProcessingTime();
    const cacheHitRate = this.getCacheHitRate();
    const recentMetrics = this.metrics.slice(-100);

    const slowRequests = recentMetrics.filter((m) => m.processingTime > 200).length;
    const errorRequests = recentMetrics.filter((m) => m.outcome === 'error').length;
    const errorRate = recentMetrics.length > 0 ? (errorRequests / recentMetrics.length) * 100 : 0;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (avgTime > 500 || errorRate > 10) {
      status = 'critical';
    } else if (avgTime > 200 || errorRate > 5 || cacheHitRate < 50) {
      status = 'warning';
    }

    return {
      averageResponseTime: avgTime,
      cacheHitRate,
      slowRequestCount: slowRequests,
      errorRate,
      status,
    };
  }
}

export const middlewareMonitor = new MiddlewarePerformanceMonitor();
export type { PerformanceMetrics };
