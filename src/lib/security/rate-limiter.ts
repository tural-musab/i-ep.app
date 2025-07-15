import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

const redis = Redis.fromEnv()

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: NextRequest) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  onLimitReached?: (request: NextRequest) => void
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async check(request: NextRequest): Promise<RateLimitResult> {
    const key = this.generateKey(request)
    const now = Date.now()
    const window = Math.floor(now / this.config.windowMs)
    const redisKey = `rate_limit:${key}:${window}`

    try {
      const current = await redis.get<number>(redisKey) || 0
      
      if (current >= this.config.maxRequests) {
        const reset = (window + 1) * this.config.windowMs
        const retryAfter = Math.ceil((reset - now) / 1000)
        
        if (this.config.onLimitReached) {
          this.config.onLimitReached(request)
        }

        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset,
          retryAfter
        }
      }

      // Increment counter
      const pipeline = redis.pipeline()
      pipeline.incr(redisKey)
      pipeline.expire(redisKey, Math.ceil(this.config.windowMs / 1000))
      await pipeline.exec()

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - current - 1,
        reset: (window + 1) * this.config.windowMs
      }
    } catch (error) {
      console.error("Rate limiter error:", error)
      // Fail open - allow request if Redis is down
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        reset: now + this.config.windowMs
      }
    }
  }

  private generateKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request)
    }

    // Default key generation based on IP and user agent
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get("user-agent") || "unknown"
    const userAgentHash = this.hashString(userAgent)
    
    return `${ip}:${userAgentHash}`
  }

  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get("x-forwarded-for")
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim()
    }
    
    const realIP = request.headers.get("x-real-ip")
    if (realIP) {
      return realIP
    }
    
    return request.ip || "unknown"
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  keyGenerator: (request) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "unknown"
    return `auth:${ip}`
  },
  onLimitReached: (request) => {
    console.warn("Auth rate limit reached:", {
      ip: request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip,
      userAgent: request.headers.get("user-agent"),
      timestamp: new Date().toISOString()
    })
  }
})

export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 API calls per minute
  keyGenerator: (request) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "unknown"
    return `api:${ip}`
  }
})

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
  keyGenerator: (request) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "unknown"
    return `upload:${ip}`
  }
})

export const passwordResetRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
  keyGenerator: (request) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.ip || "unknown"
    return `password_reset:${ip}`
  }
})

// Rate limiting middleware
export function withRateLimit(limiter: RateLimiter) {
  return async (request: NextRequest) => {
    const result = await limiter.check(request)
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.reset.toString(),
            "Retry-After": result.retryAfter?.toString() || "60"
          }
        }
      )
    }
    
    return NextResponse.next({
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": result.remaining.toString(),
        "X-RateLimit-Reset": result.reset.toString()
      }
    })
  }
}