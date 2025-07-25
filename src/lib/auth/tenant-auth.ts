/**
 * Tenant Authentication for İ-EP.APP
 * Temporary implementation for demo purposes
 */

import { NextRequest } from 'next/server';

export interface TenantInfo {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
}

export interface TenantVerificationResult {
  tenant: TenantInfo;
  isValid: boolean;
}

export interface TenantVerificationError {
  error: string;
  code: 'TENANT_NOT_FOUND' | 'TENANT_SUSPENDED' | 'INVALID_REQUEST';
}

// Demo tenant for development
const DEMO_TENANT: TenantInfo = {
  id: 'demo-tenant',
  name: 'Demo Okul',
  domain: 'localhost',
  status: 'active'
};

export async function verifyTenantAccess(
  request: NextRequest
): Promise<TenantVerificationResult | TenantVerificationError> {
  try {
    // For demo purposes, always return the demo tenant
    // In production, this would:
    // 1. Extract tenant info from subdomain, headers, or token
    // 2. Validate tenant exists and is active
    // 3. Check user permissions for the tenant
    
    const host = request.headers.get('host') || 'localhost';
    
    // Demo logic - always allow localhost and demo domains
    if (host.includes('localhost') || host.includes('demo')) {
      return {
        tenant: DEMO_TENANT,
        isValid: true
      };
    }

    // In production, implement real tenant resolution
    // Example:
    // const subdomain = host.split('.')[0];
    // const tenant = await getTenantByDomain(subdomain);
    // if (!tenant) return { error: 'Tenant not found', code: 'TENANT_NOT_FOUND' };
    
    return {
      tenant: DEMO_TENANT,
      isValid: true
    };
    
  } catch (error) {
    console.error('Tenant verification error:', error);
    return {
      error: 'Tenant verification failed',
      code: 'INVALID_REQUEST'
    };
  }
}

export async function getTenantById(tenantId: string): Promise<TenantInfo | null> {
  // Demo implementation
  if (tenantId === 'demo-tenant') {
    return DEMO_TENANT;
  }
  
  // In production, query database for tenant
  return null;
}

export async function getTenantByDomain(domain: string): Promise<TenantInfo | null> {
  // Demo implementation
  if (domain === 'localhost' || domain === 'demo') {
    return DEMO_TENANT;
  }
  
  // In production, query database for tenant by domain
  return null;
}

export function isValidTenantId(tenantId: string): boolean {
  // Basic validation
  return typeof tenantId === 'string' && tenantId.length > 0;
}

export function extractTenantFromRequest(request: NextRequest): string | null {
  // Try to extract tenant ID from various sources
  const { searchParams } = new URL(request.url);
  
  // 1. Query parameter
  const tenantFromQuery = searchParams.get('tenantId');
  if (tenantFromQuery) return tenantFromQuery;
  
  // 2. Header
  const tenantFromHeader = request.headers.get('x-tenant-id');
  if (tenantFromHeader) return tenantFromHeader;
  
  // 3. Subdomain (for production)
  const host = request.headers.get('host');
  if (host && !host.includes('localhost')) {
    const subdomain = host.split('.')[0];
    return subdomain;
  }
  
  // 4. Default to demo tenant for development
  return 'demo-tenant';
}