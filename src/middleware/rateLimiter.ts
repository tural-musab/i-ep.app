/**
 * İ-EP.APP Rate Limiter Middleware
 * 
 * Tenant-aware rate limiting for API routes
 * Each tenant has separate rate limit counters
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
}

// Tenant rate limit store
interface TenantRateStore {
  count: number;
  windowStart: number;
}

// In-memory store for tenant rate limits
const tenantStores = new Map<string, TenantRateStore>();

/**
 * Get rate limit configuration from environment variables
 */
function getRateLimitConfig(): RateLimitConfig {
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000') || 60000; // Default: 1 minute
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100') || 100; // Default: 100 requests
  
  return { windowMs, maxRequests };
}

/**
 * Extract tenant ID from request headers
 */
function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  return tenantId || 'default'; // Fallback to 'default' if no tenant specified
}

/**
 * Check if request is within rate limit for given tenant
 */
function checkRateLimit(tenantId: string, config: RateLimitConfig): {
  allowed: boolean;
  retryAfter?: number;
  remaining: number;
} {
  const now = Date.now();
  const store = tenantStores.get(tenantId);
  
  // If no store exists or window has expired, create new window
  if (!store || (now - store.windowStart) >= config.windowMs) {
    tenantStores.set(tenantId, {
      count: 1,
      windowStart: now
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1
    };
  }
  
  // Increment request count
  store.count++;
  
  // Check if limit exceeded
  if (store.count > config.maxRequests) {
    const retryAfter = Math.ceil((config.windowMs - (now - store.windowStart)) / 1000);
    return {
      allowed: false,
      retryAfter,
      remaining: 0
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - store.count
  };
}

/**
 * Rate limiter middleware function
 */
export function rateLimiterMiddleware(request: NextRequest): NextResponse | null {
  // Only apply rate limiting to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return null; // Continue with normal processing
  }
  
  const config = getRateLimitConfig();
  const tenantId = getTenantId(request);
  const result = checkRateLimit(tenantId, config);
  
  if (!result.allowed) {
    // Rate limit exceeded - return 429 response
    const errorResponse = {
      error: 'Too many requests',
      retryAfter: result.retryAfter
    };
    
    return NextResponse.json(errorResponse, {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter?.toString() || '60',
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + (result.retryAfter || 60) * 1000).toISOString()
      }
    });
  }
  
  // Rate limit OK - add headers and continue
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + config.windowMs).toISOString());
  
  return response;
}

/**
 * Utility function to clear rate limit store (useful for testing)
 */
export function clearRateLimitStore(): void {
  tenantStores.clear();
}

/**
 * Utility function to get current rate limit status for a tenant
 */
export function getRateLimitStatus(tenantId: string): TenantRateStore | null {
  return tenantStores.get(tenantId) || null;
} 