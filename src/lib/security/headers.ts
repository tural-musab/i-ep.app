import { NextRequest, NextResponse } from 'next/server';

// --- 1. Security Headers Interface ---
export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Frame-Options'?: string;
  'X-Content-Type-Options'?: string;
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'Strict-Transport-Security'?: string;
  'Cross-Origin-Opener-Policy'?: string;
  'Cross-Origin-Embedder-Policy'?: string;
  'Cross-Origin-Resource-Policy'?: string;
  'X-DNS-Prefetch-Control'?: string;
}

// --- 2. Security Headers Manager ---
export class SecurityHeadersManager {
  /**
   * Generate a nonce for inline scripts
   */
  static generateNonce(): string {
    return crypto.randomUUID().replace(/-/g, '');
  }

  /**
   * Build CSP directives using the provided nonce
   */
  private static getCSPDirectives(nonce: string): string {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'i-ep.app';
    const sources = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-eval'" : ''} https://vercel.live https://va.vercel-scripts.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: https://${domain} https://staging.${domain} https://test.${domain} https://vercel.com`,
      `connect-src 'self' https://${domain} https://staging.${domain} https://test.${domain} https://vitals.vercel-insights.com https://vercel.live wss://ws.pusher.com`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ];
    return sources.join('; ');
  }

  /**
   * Generate the full set of security headers
   */
  static getSecurityHeaders(nonce?: string): SecurityHeaders {
    const isProduction = process.env.NODE_ENV === 'production';
    const nonceValue = nonce || this.generateNonce();

    return {
      'Content-Security-Policy': this.getCSPDirectives(nonceValue),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
      ].join(', '),
      'Strict-Transport-Security': isProduction
        ? 'max-age=31536000; includeSubDomains; preload'
        : 'max-age=0',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-DNS-Prefetch-Control': 'off',
    };
  }

  /**
   * Apply all security headers (including CSP nonce) to the response
   */
  static applySecurityHeaders(response: NextResponse): NextResponse {
    const nonce = this.generateNonce();
    const headers = this.getSecurityHeaders(nonce);

    // Expose nonce to client for use in <script nonce="...">
    response.headers.set('x-csp-nonce', nonce);

    Object.entries(headers).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });

    return response;
  }

  // --- Backward Compatibility Methods ---
  /**
   * @deprecated Use getSecurityHeaders() instead
   */
  static getCSPDirectivesLegacy(): string {
    return this.getCSPDirectives(this.generateNonce());
  }
}

// --- 3. Security Utilities ---
export class SecurityUtils {
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Comprehensive HTML injection prevention with stronger patterns
    return (
      input
        // Remove all HTML tags completely
        .replace(/<[^>]*>/g, '')
        // Remove script tags and content
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        // Remove event handlers with stronger patterns
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
        .replace(/on\w+/gi, '') // Remove any remaining on* patterns
        // Remove javascript: URLs
        .replace(/javascript:\s*[^"'\s>]+/gi, '')
        .replace(/href\s*=\s*["']?javascript:/gi, '')
        // Remove dangerous attributes
        .replace(/data-\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/style\s*=\s*["'][^"']*["']/gi, '')
        // Remove any remaining = signs that might be part of attributes
        .replace(/\s*=\s*["'][^"']*["']/g, '')
        // Remove any remaining script references
        .replace(/script/gi, '')
        // Clean up whitespace
        .trim()
    );
  }

  static isValidURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static hashPassword(password: string): string {
    // Replace with bcrypt/Argon2 in production
    return `hashed_${password}`;
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/\d/.test(password)) errors.push('Password must contain at least one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push('Password must contain at least one special character');

    return { isValid: errors.length === 0, errors };
  }
}

// --- 4. Request Validation Middleware ---
export function withRequestValidation() {
  return async (request: NextRequest) => {
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (!/application\/(json|x-www-form-urlencoded)/.test(contentType)) {
        return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
      }
    }

    const length = request.headers.get('content-length');
    if (length && parseInt(length) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const ua = request.headers.get('user-agent');
    if (!ua || ua.length > 1000) {
      return NextResponse.json({ error: 'Invalid user agent' }, { status: 400 });
    }

    return NextResponse.next();
  };
}

// --- 5. Security Headers Middleware ---
export function withSecurityHeaders() {
  return (request: NextRequest): NextResponse => {
    const response = NextResponse.next();
    return SecurityHeadersManager.applySecurityHeaders(response);
  };
}
