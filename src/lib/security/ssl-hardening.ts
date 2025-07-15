import { NextRequest, NextResponse } from "next/server"

export interface SSLConfiguration {
  enforceHttps: boolean
  hstsMaxAge: number
  hstsIncludeSubdomains: boolean
  hstsPreload: boolean
  tlsMinVersion: string
  cipherSuites: string[]
  certificateValidation: boolean
}

export class SSLHardening {
  private static readonly PRODUCTION_SSL_CONFIG: SSLConfiguration = {
    enforceHttps: true,
    hstsMaxAge: 31536000, // 1 year
    hstsIncludeSubdomains: true,
    hstsPreload: true,
    tlsMinVersion: "1.2",
    cipherSuites: [
      "TLS_AES_128_GCM_SHA256",
      "TLS_AES_256_GCM_SHA384",
      "TLS_CHACHA20_POLY1305_SHA256",
      "ECDHE-RSA-AES128-GCM-SHA256",
      "ECDHE-RSA-AES256-GCM-SHA384"
    ],
    certificateValidation: true
  }

  private static readonly DEVELOPMENT_SSL_CONFIG: SSLConfiguration = {
    enforceHttps: false,
    hstsMaxAge: 0,
    hstsIncludeSubdomains: false,
    hstsPreload: false,
    tlsMinVersion: "1.2",
    cipherSuites: [],
    certificateValidation: false
  }

  static getSSLConfig(): SSLConfiguration {
    const isProduction = process.env.NODE_ENV === "production"
    return isProduction ? this.PRODUCTION_SSL_CONFIG : this.DEVELOPMENT_SSL_CONFIG
  }

  static enforceHTTPS(request: NextRequest): NextResponse | null {
    const config = this.getSSLConfig()
    
    if (!config.enforceHttps) {
      return null
    }

    const protocol = request.headers.get("x-forwarded-proto") || "https"
    const host = request.headers.get("host")
    
    if (protocol !== "https" && host) {
      const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
      return NextResponse.redirect(httpsUrl, 301)
    }

    return null
  }

  static getHSTSHeader(): string {
    const config = this.getSSLConfig()
    
    if (config.hstsMaxAge === 0) {
      return ""
    }

    let header = `max-age=${config.hstsMaxAge}`
    
    if (config.hstsIncludeSubdomains) {
      header += "; includeSubDomains"
    }
    
    if (config.hstsPreload) {
      header += "; preload"
    }

    return header
  }

  static applySSLHeaders(response: NextResponse): NextResponse {
    const config = this.getSSLConfig()
    
    // Apply HSTS header
    const hstsHeader = this.getHSTSHeader()
    if (hstsHeader) {
      response.headers.set("Strict-Transport-Security", hstsHeader)
    }

    // Apply additional SSL-related headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    
    // Expect-CT header for Certificate Transparency
    if (config.certificateValidation) {
      response.headers.set("Expect-CT", "max-age=86400, enforce")
    }

    return response
  }

  static validateCertificate(request: NextRequest): {
    valid: boolean
    issues: string[]
  } {
    const issues: string[] = []
    const config = this.getSSLConfig()

    if (!config.certificateValidation) {
      return { valid: true, issues: [] }
    }

    // Check if connection is secure
    const protocol = request.headers.get("x-forwarded-proto")
    if (protocol !== "https") {
      issues.push("Connection is not using HTTPS")
    }

    // Check for proper SSL headers
    const hstsHeader = request.headers.get("strict-transport-security")
    if (!hstsHeader) {
      issues.push("Missing HSTS header")
    }

    // Check for mixed content
    const referer = request.headers.get("referer")
    if (referer && referer.startsWith("http://")) {
      issues.push("Mixed content detected - HTTP referer on HTTPS page")
    }

    return {
      valid: issues.length === 0,
      issues
    }
  }

  static generateCSPForSSL(): string {
    const config = this.getSSLConfig()
    
    if (!config.enforceHttps) {
      return ""
    }

    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https:",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self' https:",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests"
    ]

    return directives.join("; ")
  }

  static checkSSLConfiguration(): {
    score: number
    issues: string[]
    recommendations: string[]
  } {
    const config = this.getSSLConfig()
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check HTTPS enforcement
    if (!config.enforceHttps) {
      issues.push("HTTPS is not enforced")
      recommendations.push("Enable HTTPS enforcement in production")
      score -= 30
    }

    // Check HSTS configuration
    if (config.hstsMaxAge === 0) {
      issues.push("HSTS is not configured")
      recommendations.push("Configure HSTS with appropriate max-age")
      score -= 20
    } else if (config.hstsMaxAge < 31536000) {
      issues.push("HSTS max-age is too short")
      recommendations.push("Set HSTS max-age to at least 1 year (31536000 seconds)")
      score -= 10
    }

    // Check HSTS subdomains
    if (config.hstsMaxAge > 0 && !config.hstsIncludeSubdomains) {
      issues.push("HSTS does not include subdomains")
      recommendations.push("Enable HSTS includeSubDomains directive")
      score -= 10
    }

    // Check HSTS preload
    if (config.hstsMaxAge > 0 && !config.hstsPreload) {
      issues.push("HSTS preload is not enabled")
      recommendations.push("Enable HSTS preload for better security")
      score -= 5
    }

    // Check TLS version
    if (config.tlsMinVersion < "1.2") {
      issues.push("TLS version is too old")
      recommendations.push("Use TLS 1.2 or higher")
      score -= 25
    }

    // Check cipher suites
    if (config.cipherSuites.length === 0) {
      issues.push("No cipher suites configured")
      recommendations.push("Configure strong cipher suites")
      score -= 10
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  static generateNginxSSLConfig(): string {
    const config = this.getSSLConfig()
    
    return `
# SSL Configuration for production
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    # SSL certificates
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=${config.hstsMaxAge}; includeSubDomains; preload" always;
    
    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "${this.generateCSPForSSL()}" always;
    
    # Redirect HTTP to HTTPS
    error_page 497 https://$host$request_uri;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name _;
    return 301 https://$host$request_uri;
}
`
  }

  static generateApacheSSLConfig(): string {
    const config = this.getSSLConfig()
    
    return `
# SSL Configuration for production
<VirtualHost *:443>
    # SSL Engine
    SSLEngine on
    
    # SSL certificates
    SSLCertificateFile /path/to/fullchain.pem
    SSLCertificateKeyFile /path/to/privkey.pem
    
    # SSL Protocol and Ciphers
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-RSA-AES128-GCM-SHA256
    SSLHonorCipherOrder off
    
    # Security headers
    Header always set Strict-Transport-Security "max-age=${config.hstsMaxAge}; includeSubDomains; preload"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "${this.generateCSPForSSL()}"
    
    # OCSP Stapling
    SSLUseStapling on
    SSLStaplingResponderTimeout 5
    SSLStaplingReturnResponderErrors off
</VirtualHost>

# HTTP to HTTPS redirect
<VirtualHost *:80>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]
</VirtualHost>
`
  }
}

// SSL monitoring and alerting
export class SSLMonitoring {
  static async checkCertificateExpiry(domain: string): Promise<{
    valid: boolean
    daysUntilExpiry: number
    expiryDate: Date
    issues: string[]
  }> {
    const issues: string[] = []
    
    try {
      // In a real implementation, this would check the actual certificate
      // For now, we'll simulate the check
      const mockExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      const daysUntilExpiry = Math.floor((mockExpiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      
      if (daysUntilExpiry < 30) {
        issues.push("Certificate expires within 30 days")
      }
      
      if (daysUntilExpiry < 7) {
        issues.push("Certificate expires within 7 days - URGENT")
      }
      
      if (daysUntilExpiry < 0) {
        issues.push("Certificate has expired")
      }

      return {
        valid: daysUntilExpiry > 0,
        daysUntilExpiry,
        expiryDate: mockExpiryDate,
        issues
      }
    } catch (error) {
      return {
        valid: false,
        daysUntilExpiry: 0,
        expiryDate: new Date(),
        issues: ["Failed to check certificate expiry"]
      }
    }
  }

  static generateSSLReport(): string {
    const config = SSLHardening.getSSLConfig()
    const configCheck = SSLHardening.checkSSLConfiguration()
    
    let report = `\n=== SSL/TLS SECURITY REPORT ===\n`
    report += `Configuration Score: ${configCheck.score}/100\n\n`
    
    report += `CURRENT CONFIGURATION:\n`
    report += `- HTTPS Enforcement: ${config.enforceHttps ? "✅ Enabled" : "❌ Disabled"}\n`
    report += `- HSTS Max Age: ${config.hstsMaxAge} seconds\n`
    report += `- HSTS Include Subdomains: ${config.hstsIncludeSubdomains ? "✅ Yes" : "❌ No"}\n`
    report += `- HSTS Preload: ${config.hstsPreload ? "✅ Yes" : "❌ No"}\n`
    report += `- TLS Min Version: ${config.tlsMinVersion}\n`
    report += `- Certificate Validation: ${config.certificateValidation ? "✅ Enabled" : "❌ Disabled"}\n\n`
    
    if (configCheck.issues.length > 0) {
      report += `ISSUES FOUND:\n`
      configCheck.issues.forEach(issue => {
        report += `❌ ${issue}\n`
      })
      report += `\n`
    }
    
    if (configCheck.recommendations.length > 0) {
      report += `RECOMMENDATIONS:\n`
      configCheck.recommendations.forEach(rec => {
        report += `💡 ${rec}\n`
      })
    }
    
    return report
  }
}

// SSL middleware
export function withSSLEnforcement() {
  return (request: NextRequest) => {
    // Check for HTTPS redirect
    const httpsRedirect = SSLHardening.enforceHTTPS(request)
    if (httpsRedirect) {
      return httpsRedirect
    }

    // Validate certificate
    const certValidation = SSLHardening.validateCertificate(request)
    if (!certValidation.valid) {
      console.warn("SSL certificate validation issues:", certValidation.issues)
    }

    // Apply SSL headers
    const response = NextResponse.next()
    return SSLHardening.applySSLHeaders(response)
  }
}