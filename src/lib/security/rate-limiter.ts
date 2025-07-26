import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  auth: {
    login: { requests: 5, window: 60 }, // 5 attempts per minute
    register: { requests: 3, window: 300 }, // 3 attempts per 5 minutes
    passwordReset: { requests: 3, window: 900 }, // 3 attempts per 15 minutes
    mfa: { requests: 5, window: 300 }, // 5 attempts per 5 minutes
  },
  api: {
    default: { requests: 100, window: 60 }, // 100 requests per minute
    upload: { requests: 10, window: 300 }, // 10 uploads per 5 minutes
    sensitive: { requests: 30, window: 60 }, // 30 requests per minute for sensitive operations
  },
};

// Redis client initialization
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Generic rate limiter using sliding window algorithm
 */
export async function rateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const window = windowSeconds * 1000;
  const key = `rate_limit:${identifier}`;

  try {
    // Get current count
    const count = await redis.incr(key);
    
    // Set expiry on first request
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    // Get TTL for reset time
    const ttl = await redis.ttl(key);
    const reset = now + (ttl * 1000);

    // Check if limit exceeded
    if (count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        reset,
        retryAfter: ttl,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
      reset,
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: maxRequests,
      reset: now + window,
    };
  }
}

/**
 * Rate limiter for authentication endpoints
 */
export async function authRateLimit(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMIT_CONFIG.auth
): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.ip || 
             'unknown';
  
  const identifier = `auth:${endpoint}:${ip}`;
  const config = RATE_LIMIT_CONFIG.auth[endpoint];
  
  return rateLimit(identifier, config.requests, config.window);
}

/**
 * Rate limiter for general API endpoints
 */
export async function apiRateLimit(
  request: NextRequest,
  category: keyof typeof RATE_LIMIT_CONFIG.api = 'default'
): Promise<RateLimitResult> {
  const userId = request.headers.get('x-auth-user') || 'anonymous';
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.ip || 
             'unknown';
  
  // Use user ID if authenticated, otherwise use IP
  const identifier = userId !== 'anonymous' 
    ? `api:${category}:user:${userId}`
    : `api:${category}:ip:${ip}`;
  
  const config = RATE_LIMIT_CONFIG.api[category];
  
  return rateLimit(identifier, config.requests, config.window);
}

/**
 * Enhanced rate limiter with distributed sliding window
 */
export async function distributedRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const window = windowSeconds * 1000;
  const oldWindow = now - window;
  const key = `rate_limit:sliding:${identifier}`;

  try {
    // Remove old entries
    await redis.zremrangebyscore(key, '-inf', oldWindow);
    
    // Count current window requests
    const count = await redis.zcard(key);
    
    if (count >= maxRequests) {
      // Get oldest entry to calculate retry time
      const oldestEntry = await redis.zrange(key, 0, 0, { withScores: true });
      const oldestTime = oldestEntry?.[0]?.score || now;
      const retryAfter = Math.ceil((oldestTime + window - now) / 1000);
      
      return {
        allowed: false,
        remaining: 0,
        reset: now + (retryAfter * 1000),
        retryAfter,
      };
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await redis.expire(key, windowSeconds);

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      reset: now + window,
    };
  } catch (error) {
    console.error('Distributed rate limiting error:', error);
    // Fail open
    return {
      allowed: true,
      remaining: maxRequests,
      reset: now + window,
    };
  }
}

/**
 * IP-based rate limiter for DDoS protection
 */
export async function ipRateLimit(
  request: NextRequest,
  maxRequests: number = 1000,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.ip || 
             'unknown';
  
  const identifier = `ip:${ip}`;
  
  return distributedRateLimit(identifier, maxRequests, windowSeconds);
}

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set('X-RateLimit-Limit', result.allowed ? '1' : '0');
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', result.reset.toString());
  
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }
}
