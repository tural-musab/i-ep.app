/**
 * Safe Header Management Utilities
 * İ-EP.APP - ASCII-safe header writing with Base64 fallback
 */

/**
 * Options for safe header setting
 */
export interface SafeHeaderOptions {
  /** Force Base64 encoding even for ASCII-safe values */
  base64?: boolean;
  /** Custom encoding prefix (default: "b64:") */
  encodingPrefix?: string;
}

/**
 * Check if a string contains only ASCII printable characters
 */
export function isASCIISafe(value: string): boolean {
  // ASCII printable range: 32-126 (space to tilde)
  return /^[\x20-\x7E]*$/.test(value);
}

/**
 * Normalize string to ASCII-safe format
 */
export function normalizeToASCII(value: string): string {
  return value
    .normalize('NFD') // Decompose Unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\x20-\x7E]/g, ''); // Remove non-ASCII characters
}

/**
 * Encode value as Base64 with prefix
 */
export function encodeBase64Header(value: string, prefix = 'b64:'): string {
  return prefix + Buffer.from(value, 'utf8').toString('base64');
}

/**
 * Decode Base64 header value
 */
export function decodeBase64Header(value: string, prefix = 'b64:'): string | null {
  if (!value.startsWith(prefix)) {
    return null;
  }
  
  try {
    const base64Value = value.slice(prefix.length);
    
    // Validate Base64 format before decoding
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Value)) {
      return null;
    }
    
    const decoded = Buffer.from(base64Value, 'base64').toString('utf8');
    
    // Additional validation: ensure the decoded string is valid UTF-8
    // by re-encoding and comparing
    const reencoded = Buffer.from(decoded, 'utf8').toString('base64');
    if (reencoded !== base64Value) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('🔧 Headers: Base64 decode failed:', error);
    return null;
  }
}

/**
 * Safely set header with ASCII normalization and Base64 fallback
 */
export function safeSetHeader(
  headers: Headers, 
  key: string, 
  value: string, 
  options: SafeHeaderOptions = {}
): boolean {
  const { base64 = false, encodingPrefix = 'b64:' } = options;

  try {
    // Validate inputs
    if (!key || !value) {
      console.warn('🔧 Headers: Empty key or value provided');
      return false;
    }

    // Force Base64 encoding if requested
    if (base64) {
      const encodedValue = encodeBase64Header(value, encodingPrefix);
      headers.set(key, encodedValue);
      return true;
    }

    // Try ASCII normalization first
    if (isASCIISafe(value)) {
      headers.set(key, value);
      return true;
    }

    // Attempt ASCII normalization
    const normalizedValue = normalizeToASCII(value);
    if (normalizedValue && normalizedValue.trim() && isASCIISafe(normalizedValue)) {
      headers.set(key, normalizedValue);
      console.debug(`🔧 Headers: ASCII normalized header "${key}"`);
      return true;
    }

    // Fallback to Base64 encoding for non-ASCII content
    const encodedValue = encodeBase64Header(value, encodingPrefix);
    headers.set(key, encodedValue);
    console.debug(`🔧 Headers: Base64 encoded header "${key}"`);
    return true;

  } catch (error) {
    console.error(`🔧 Headers: Failed to set header "${key}":`, error);
    return false;
  }
}

/**
 * Safely get header with automatic Base64 decoding
 */
export function safeGetHeader(
  headers: Headers, 
  key: string, 
  encodingPrefix = 'b64:'
): string | null {
  try {
    const value = headers.get(key);
    if (!value) {
      return null;
    }

    // Check if it's Base64 encoded
    const decodedValue = decodeBase64Header(value, encodingPrefix);
    return decodedValue !== null ? decodedValue : value;

  } catch (error) {
    console.error(`🔧 Headers: Failed to get header "${key}":`, error);
    return null;
  }
}

/**
 * Batch set multiple headers safely
 */
export function safeSetHeaders(
  headers: Headers, 
  headerMap: Record<string, string>, 
  options: SafeHeaderOptions = {}
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(headerMap)) {
    results[key] = safeSetHeader(headers, key, value, options);
  }

  return results;
}

/**
 * Safe header utilities for common tenant headers
 */
export const TenantHeaders = {
  TENANT_ID: 'x-tenant-id',
  TENANT_NAME: 'x-tenant-name',
  TENANT_HOSTNAME: 'x-tenant-hostname',
  
  setTenantId: (headers: Headers, tenantId: string): boolean =>
    safeSetHeader(headers, TenantHeaders.TENANT_ID, tenantId),
    
  setTenantName: (headers: Headers, tenantName: string): boolean =>
    safeSetHeader(headers, TenantHeaders.TENANT_NAME, tenantName),
    
  setTenantHostname: (headers: Headers, hostname: string): boolean =>
    safeSetHeader(headers, TenantHeaders.TENANT_HOSTNAME, hostname),
    
  getTenantId: (headers: Headers): string | null =>
    safeGetHeader(headers, TenantHeaders.TENANT_ID),
    
  getTenantName: (headers: Headers): string | null =>
    safeGetHeader(headers, TenantHeaders.TENANT_NAME),
    
  getTenantHostname: (headers: Headers): string | null =>
    safeGetHeader(headers, TenantHeaders.TENANT_HOSTNAME),
} as const;

/**
 * Safe header utilities for common auth headers
 */
export const AuthHeaders = {
  USER_ID: 'x-auth-user-id',
  USER_EMAIL: 'x-auth-user-email',
  USER_ROLE: 'x-auth-user-role',
  ALLOWED_TENANTS: 'x-auth-allowed-tenants',
  
  setUserId: (headers: Headers, userId: string): boolean =>
    safeSetHeader(headers, AuthHeaders.USER_ID, userId),
    
  setUserEmail: (headers: Headers, email: string): boolean =>
    safeSetHeader(headers, AuthHeaders.USER_EMAIL, email),
    
  setUserRole: (headers: Headers, role: string): boolean =>
    safeSetHeader(headers, AuthHeaders.USER_ROLE, role),
    
  setAllowedTenants: (headers: Headers, tenants: string[]): boolean =>
    safeSetHeader(headers, AuthHeaders.ALLOWED_TENANTS, JSON.stringify(tenants)),
    
  getUserId: (headers: Headers): string | null =>
    safeGetHeader(headers, AuthHeaders.USER_ID),
    
  getUserEmail: (headers: Headers): string | null =>
    safeGetHeader(headers, AuthHeaders.USER_EMAIL),
    
  getUserRole: (headers: Headers): string | null =>
    safeGetHeader(headers, AuthHeaders.USER_ROLE),
    
  getAllowedTenants: (headers: Headers): string[] => {
    const value = safeGetHeader(headers, AuthHeaders.ALLOWED_TENANTS);
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  },
} as const;