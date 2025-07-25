/**
 * Simple rate limit utility for API endpoints
 * Uses the existing RateLimiter infrastructure
 */

import { NextRequest } from 'next/server';
import { RateLimiter, RateLimitResult } from './security/rate-limiter';

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * Simple rate limit function for API endpoints
 */
export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const limiter = new RateLimiter({
    windowMs: options.windowMs,
    maxRequests: options.maxRequests,
    keyGenerator: options.keyGenerator || ((req) => {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
      return ip;
    }),
  });

  return await limiter.check(request);
}

// Pre-configured rate limiters for common use cases
export const demoAnalyticsRateLimit = (request: NextRequest) => rateLimit(request, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 events per minute per IP
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    return `demo_analytics:${ip}`;
  },
});

export const demoBatchRateLimit = (request: NextRequest) => rateLimit(request, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 batch requests per minute per IP
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    return `demo_batch:${ip}`;
  },
});

export const demoLocationRateLimit = (request: NextRequest) => rateLimit(request, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 location requests per minute per IP
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    return `demo_location:${ip}`;
  },
});

export const demoDashboardRateLimit = (request: NextRequest) => rateLimit(request, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 dashboard requests per minute per IP
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || 'unknown';
    return `demo_dashboard:${ip}`;
  },
});