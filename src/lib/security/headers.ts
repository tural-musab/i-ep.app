import { NextRequest, NextResponse } from "next/server"

export interface SecurityHeaders {
  "Content-Security-Policy"?: string
  "X-Frame-Options"?: string
  "X-Content-Type-Options"?: string
  "Referrer-Policy"?: string
  "Permissions-Policy"?: string
  "Strict-Transport-Security"?: string
  "X-XSS-Protection"?: string
  "X-DNS-Prefetch-Control"?: string
}

export class SecurityHeadersManager {
  private static getCSPDirectives(): string {
    const isDevelopment = process.env.NODE_ENV === "development"
    const domain = process.env.NEXT_PUBLIC_DOMAIN || "i-ep.app"
    
    const directives = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval'" : ""} https://vercel.live https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: https://${domain} https://staging.${domain} https://test.${domain} https://vercel.com`,
      `connect-src 'self' https://${domain} https://staging.${domain} https://test.${domain} https://vitals.vercel-insights.com https://vercel.live wss://ws.pusher.com`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ]

    return directives.join("; ")
  }

  static getSecurityHeaders(): SecurityHeaders {
    const isProduction = process.env.NODE_ENV === "production"
    
    return {
      "Content-Security-Policy": this.getCSPDirectives(),
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": [
        "camera=()",
        "microphone=()",
        "geolocation=()",
        "interest-cohort=()"
      ].join(", "),
      "Strict-Transport-Security": isProduction 
        ? "max-age=31536000; includeSubDomains; preload"
        : "max-age=0",
      "X-XSS-Protection": "1; mode=block",
      "X-DNS-Prefetch-Control": "off"
    }
  }

  static applySecurityHeaders(response: NextResponse): NextResponse {
    const headers = this.getSecurityHeaders()
    
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        response.headers.set(key, value)
      }
    })

    return response
  }
}

// Security headers middleware
export function withSecurityHeaders() {
  return (request: NextRequest) => {
    const response = NextResponse.next()
    return SecurityHeadersManager.applySecurityHeaders(response)
  }
}

// Additional security utilities
export class SecurityUtils {
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim()
  }

  static isValidURL(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      return ["http:", "https:"].includes(parsedUrl.protocol)
    } catch {
      return false
    }
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static generateNonce(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  static hashPassword(password: string): string {
    // This would typically use bcrypt or similar
    // For now, returning a placeholder
    return `hashed_${password}`
  }

  static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    
    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number")
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character")
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Request validation middleware
export function withRequestValidation() {
  return async (request: NextRequest) => {
    // Validate content type for POST requests
    if (request.method === "POST") {
      const contentType = request.headers.get("content-type")
      if (!contentType || (!contentType.includes("application/json") && !contentType.includes("application/x-www-form-urlencoded"))) {
        return NextResponse.json(
          { error: "Invalid content type" },
          { status: 400 }
        )
      }
    }

    // Validate request size
    const contentLength = request.headers.get("content-length")
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: "Request too large" },
        { status: 413 }
      )
    }

    // Validate user agent
    const userAgent = request.headers.get("user-agent")
    if (!userAgent || userAgent.length > 1000) {
      return NextResponse.json(
        { error: "Invalid user agent" },
        { status: 400 }
      )
    }

    return NextResponse.next()
  }
}