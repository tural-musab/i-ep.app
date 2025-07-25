/**
 * JWT-Based Tenant Resolution System
 * İ-EP.APP - Supabase Auth Integration with Safe Header Management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { jwtVerify } from 'jose';
import { resolveTenantFromDomain } from '../tenant/tenant-domain-resolver';
import { safeSetHeader, TenantHeaders, AuthHeaders } from '../headers';

export interface TenantInfo {
  id: string;
  hostname: string;
  name: string;
  isActive: boolean;
  customDomain: boolean;
}

export interface AuthInfo {
  userId: string;
  email: string;
  role: string;
  allowedTenants: string[];
  tenantId: string;
}

export interface JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata?: {
    role?: string;
    tenant_id?: string;
    allowed_tenants?: string[];
  };
  user_metadata?: {
    tenant_id?: string;
    allowed_tenants?: string[];
  };
  tenant_id?: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

/**
 * Extract JWT token from Supabase session cookies
 */
export function extractJWTFromCookies(request: NextRequest): string | null {
  try {
    // Get all cookies
    const cookies = request.cookies.getAll();
    
    // Find Supabase auth cookie (pattern: sb-{project-ref}-auth-token)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return null;
    }

    // Extract project ref from Supabase URL
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    const authCookieName = `sb-${projectRef}-auth-token`;
    
    // Find the auth cookie
    const authCookie = cookies.find(cookie => 
      cookie.name === authCookieName || 
      cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
    );

    if (!authCookie?.value) {
      return null;
    }

    // Parse the cookie value (it's typically a JSON object with access_token)
    try {
      const cookieData = JSON.parse(authCookie.value);
      return cookieData.access_token || cookieData.accessToken || null;
    } catch {
      // If it's not JSON, assume it's the token directly
      return authCookie.value;
    }
  } catch (error) {
    console.error('🔐 JWT Resolver: Cookie extraction failed:', error);
    return null;
  }
}

/**
 * Verify and decode Supabase JWT token
 */
export async function verifySupabaseJWT(token: string): Promise<JWTPayload | null> {
  try {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      console.error('🔐 JWT Resolver: SUPABASE_JWT_SECRET not configured');
      return null;
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret, {
      issuer: process.env.NEXT_PUBLIC_SUPABASE_URL,
      audience: 'authenticated',
    });

    return payload as JWTPayload;
  } catch (error) {
    console.error('🔐 JWT Resolver: Token verification failed:', error);
    return null;
  }
}

/**
 * Extract tenant information from JWT payload
 */
export function extractTenantFromJWT(payload: JWTPayload, fallbackTenantId?: string): string | null {
  // Priority order for tenant resolution:
  // 1. app_metadata.tenant_id (most authoritative)
  // 2. user_metadata.tenant_id (user preference)
  // 3. Direct tenant_id field
  // 4. Fallback tenant ID (from domain resolution)
  
  const tenantId = 
    payload.app_metadata?.tenant_id ||
    payload.user_metadata?.tenant_id ||
    payload.tenant_id ||
    fallbackTenantId;

  return tenantId || null;
}

/**
 * Extract authentication info from JWT payload
 */
export function extractAuthFromJWT(payload: JWTPayload): AuthInfo | null {
  if (!payload.sub || !payload.email) {
    return null;
  }

  const role = payload.app_metadata?.role || (payload.user_metadata as any)?.role || payload.role || 'user';
  const allowedTenants = payload.app_metadata?.allowed_tenants || payload.user_metadata?.allowed_tenants || [];
  const tenantId = extractTenantFromJWT(payload);

  if (!tenantId) {
    return null;
  }

  return {
    userId: payload.sub,
    email: payload.email,
    role,
    allowedTenants: Array.isArray(allowedTenants) ? allowedTenants : [],
    tenantId
  };
}

/**
 * Get session using standard Supabase client as fallback
 */
async function getSupabaseSessionFallback(request: NextRequest) {
  try {
    const supabase = createMiddlewareClient({ 
      req: request, 
      res: NextResponse.next() 
    });
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('🔐 JWT Resolver: Supabase session error:', error);
      return null;
    }

    return session;
  } catch (error) {
    console.error('🔐 JWT Resolver: Session retrieval failed:', error);
    return null;
  }
}

/**
 * Resolve tenant info using existing domain resolver with service role authentication
 */
async function resolveTenantInfo(tenantId: string, hostname: string): Promise<TenantInfo | null> {
  try {
    // Use existing tenant domain resolver (now uses service role authentication)
    const tenantData = await resolveTenantFromDomain(hostname);
    
    if (tenantData) {
      return {
        id: tenantData.id || tenantId,
        hostname,
        name: tenantData.name || `Tenant ${tenantId}`,
        isActive: (tenantData as any).isActive !== false,
        customDomain: (tenantData as any).isCustomDomain || (tenantData as any).customDomain || false,
      };
    }

    // Fallback tenant info
    return {
      id: tenantId,
      hostname,
      name: `Tenant ${tenantId}`,
      isActive: true,
      customDomain: false,
    };
  } catch (error) {
    console.error('🔐 JWT Resolver: Tenant resolution failed:', error);
    return {
      id: tenantId,
      hostname,
      name: `Tenant ${tenantId}`,
      isActive: true,
      customDomain: false,
    };
  }
}

/**
 * Main JWT-based tenant and auth resolution
 */
export async function resolveJWTTenantAuth(
  request: NextRequest, 
  fallbackTenantId?: string
): Promise<{ tenant: TenantInfo | null; auth: AuthInfo | null }> {
  try {
    const hostname = request.headers.get('host') || '';

    // Method 1: Try to extract JWT from cookies
    const jwtToken = extractJWTFromCookies(request);
    
    if (jwtToken) {
      const payload = await verifySupabaseJWT(jwtToken);
      
      if (payload) {
        const authInfo = extractAuthFromJWT(payload);
        const tenantId = extractTenantFromJWT(payload, fallbackTenantId);
        
        if (authInfo && tenantId) {
          const tenantInfo = await resolveTenantInfo(tenantId, hostname);
          return { tenant: tenantInfo, auth: authInfo };
        }
      }
    }

    // Method 2: Fallback to standard Supabase session
    const session = await getSupabaseSessionFallback(request);
    
    if (session?.user) {
      const payload: JWTPayload = {
        sub: session.user.id,
        email: session.user.email,
        role: session.user.app_metadata?.role,
        app_metadata: session.user.app_metadata as any,
        user_metadata: session.user.user_metadata as any,
        tenant_id: session.user.user_metadata?.tenant_id,
        iss: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        aud: 'authenticated',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const authInfo = extractAuthFromJWT(payload);
      const tenantId = extractTenantFromJWT(payload, fallbackTenantId);
      
      if (authInfo && tenantId) {
        const tenantInfo = await resolveTenantInfo(tenantId, hostname);
        return { tenant: tenantInfo, auth: authInfo };
      }
    }

    return { tenant: null, auth: null };
  } catch (error) {
    console.error('🔐 JWT Resolver: Resolution failed:', error);
    return { tenant: null, auth: null };
  }
}

/**
 * Apply resolved tenant and auth info to response headers using safe header writing
 */
export function applyJWTHeadersToResponse(
  response: NextResponse,
  tenant: TenantInfo | null,
  auth: AuthInfo | null
): NextResponse {
  if (tenant) {
    TenantHeaders.setTenantId(response.headers, tenant.id);
    TenantHeaders.setTenantName(response.headers, tenant.name);
    TenantHeaders.setTenantHostname(response.headers, tenant.hostname);
    
    // Additional tenant metadata
    safeSetHeader(response.headers, 'x-tenant-active', tenant.isActive.toString());
    safeSetHeader(response.headers, 'x-tenant-custom-domain', tenant.customDomain.toString());
  }

  if (auth) {
    AuthHeaders.setUserId(response.headers, auth.userId);
    AuthHeaders.setUserEmail(response.headers, auth.email);
    AuthHeaders.setUserRole(response.headers, auth.role);
    AuthHeaders.setAllowedTenants(response.headers, auth.allowedTenants);
  }

  return response;
}