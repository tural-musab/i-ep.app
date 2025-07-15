import { NextRequest, NextResponse } from "next/server"
import { randomBytes, createHmac } from "crypto"
import { cookies } from "next/headers"

const SECRET_KEY = process.env.CSRF_SECRET || "fallback-secret-key"
const CSRF_COOKIE_NAME = "_csrf"
const CSRF_HEADER_NAME = "x-csrf-token"

export class CSRFProtection {
  private static generateToken(): string {
    return randomBytes(32).toString("hex")
  }

  private static hashToken(token: string): string {
    return createHmac("sha256", SECRET_KEY).update(token).digest("hex")
  }

  static generateCSRFToken(): string {
    const token = this.generateToken()
    return `${token}.${this.hashToken(token)}`
  }

  static validateCSRFToken(token: string): boolean {
    if (!token) return false

    const [tokenPart, hashPart] = token.split(".")
    if (!tokenPart || !hashPart) return false

    const expectedHash = this.hashToken(tokenPart)
    return expectedHash === hashPart
  }

  static setCSRFCookie(response: NextResponse, token: string) {
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    })
  }

  static getCSRFTokenFromRequest(request: NextRequest): string | null {
    // Check header first
    const headerToken = request.headers.get(CSRF_HEADER_NAME)
    if (headerToken) return headerToken

    // Check form data for POST requests
    if (request.method === "POST") {
      const contentType = request.headers.get("content-type")
      if (contentType?.includes("application/x-www-form-urlencoded")) {
        // This would need to be handled in the API route
        return null
      }
    }

    return null
  }

  static async validateRequest(request: NextRequest): Promise<boolean> {
    // Skip CSRF validation for safe methods
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return true
    }

    // Skip CSRF validation for API routes with proper authentication
    if (request.nextUrl.pathname.startsWith("/api/")) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        return true // API token authentication bypasses CSRF
      }
    }

    const cookieStore = cookies()
    const csrfCookie = cookieStore.get(CSRF_COOKIE_NAME)
    const csrfToken = this.getCSRFTokenFromRequest(request)

    if (!csrfCookie?.value || !csrfToken) {
      return false
    }

    return csrfCookie.value === csrfToken && this.validateCSRFToken(csrfToken)
  }
}

// Middleware for CSRF protection
export function withCSRFProtection() {
  return async (request: NextRequest) => {
    const isValid = await CSRFProtection.validateRequest(request)
    
    if (!isValid) {
      return NextResponse.json(
        {
          error: "CSRF token validation failed",
          message: "Invalid or missing CSRF token"
        },
        { status: 403 }
      )
    }

    const response = NextResponse.next()
    
    // Set CSRF token for GET requests
    if (request.method === "GET" && !request.nextUrl.pathname.startsWith("/api/")) {
      const token = CSRFProtection.generateCSRFToken()
      CSRFProtection.setCSRFCookie(response, token)
    }

    return response
  }
}

// Hook for React components to get CSRF token
export function useCSRFToken() {
  if (typeof window === "undefined") return null
  
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=")
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies[CSRF_COOKIE_NAME] || null
}

// Helper function to add CSRF token to fetch requests
export function withCSRFToken(init: RequestInit = {}): RequestInit {
  if (typeof window === "undefined") return init

  const csrfToken = useCSRFToken()
  if (!csrfToken) return init

  return {
    ...init,
    headers: {
      ...init.headers,
      [CSRF_HEADER_NAME]: csrfToken
    }
  }
}