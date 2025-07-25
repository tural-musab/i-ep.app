/**
 * Authenticated API Client
 * İ-EP.APP - NextAuth Session Integration for API Calls
 * Handles authentication headers for all API requests
 */

import { getSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface APIClientOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Authenticated fetch wrapper that includes NextAuth session
 * Automatically adds authorization headers and handles auth errors
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: APIClientOptions = {}
): Promise<APIResponse<T>> {
  try {
    // HYBRID APPROACH: Try both NextAuth and Supabase sessions
    let session = await getSession(); // NextAuth session
    let supabaseSession = null;
    let authSource = 'NextAuth';

    // If no NextAuth session, try Supabase session
    if (!session) {
      const supabase = createClientComponentClient();
      const {
        data: { session: supaSession },
      } = await supabase.auth.getSession();
      if (supaSession) {
        supabaseSession = supaSession;
        authSource = 'Supabase';
        // Create a pseudo NextAuth session structure for compatibility
        session = {
          user: {
            id: supaSession.user.id,
            email: supaSession.user.email,
            name: supaSession.user.user_metadata?.name || supaSession.user.email,
            tenantId:
              supaSession.user.user_metadata?.tenant_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          },
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
        };
      }
    }

    if (!session) {
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(80));
        console.warn('🚨 [API CLIENT] NO SESSION FOUND!');
        console.warn('📡 [API CLIENT] Endpoint:', endpoint);
        console.warn('🔒 [API CLIENT] Status: AUTHENTICATION REQUIRED');
        console.warn('💡 [API CLIENT] Solution: User needs to login at /auth/giris');
        console.warn('🔍 [API CLIENT] Checked: NextAuth + Supabase Auth');
        console.log('='.repeat(80));
      }
      return {
        error: 'Authentication required - Please login first',
        status: 401,
      };
    }

    // Development success logging
    if (process.env.NODE_ENV === 'development') {
      console.log('='.repeat(80));
      console.log('🚀 [API CLIENT] AUTHENTICATION SUCCESS!');
      console.log('🔐 [API CLIENT] Auth Source:', authSource);
      console.log('📡 [API CLIENT] Endpoint:', endpoint);
      console.log('👤 [API CLIENT] User:', session.user?.email);
      console.log('🆔 [API CLIENT] User ID:', session.user?.id);
    }

    // Prepare headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add NextAuth session to headers (if available)
    if ((session as any).accessToken) {
      headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }

    // Add user and tenant info to headers for server-side processing
    if (session.user?.email) {
      headers['X-User-Email'] = session.user.email;
    }

    if (session.user?.id) {
      headers['X-User-ID'] = session.user.id;
    }

    // Add tenant ID header (required for API authentication)
    const userTenantId = (session.user as any)?.tenantId;
    if (userTenantId) {
      headers['x-tenant-id'] = userTenantId;
    } else {
      // Fallback to localhost development tenant
      headers['x-tenant-id'] = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    }

    // Development debug logging - continued from above
    if (process.env.NODE_ENV === 'development') {
      console.log('🏢 [API CLIENT] Tenant ID:', headers['x-tenant-id']);
      console.log('🔄 [API CLIENT] Method:', options.method || 'GET');
      console.log('📋 [API CLIENT] Headers:', Object.keys(headers).join(', '));
      console.log('='.repeat(80));
    }

    // Make the authenticated request
    const response = await fetch(endpoint, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      credentials: 'include', // Include cookies for session
    });

    // Handle authentication errors
    if (response.status === 401) {
      console.error('API Authentication failed for:', endpoint);
      return {
        error: 'Authentication failed',
        status: 401,
      };
    }

    // Handle other errors
    if (!response.ok) {
      console.error(`API Error (${response.status}):`, endpoint);
      const errorText = await response.text();
      return {
        error: errorText || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    // Parse successful response
    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('API Client error:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 500,
    };
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(
  endpoint: string,
  headers?: Record<string, string>
): Promise<APIResponse<T>> {
  return apiClient<T>(endpoint, { method: 'GET', headers });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  endpoint: string,
  data?: any,
  headers?: Record<string, string>
): Promise<APIResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  endpoint: string,
  data?: any,
  headers?: Record<string, string>
): Promise<APIResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'PUT',
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(
  endpoint: string,
  headers?: Record<string, string>
): Promise<APIResponse<T>> {
  return apiClient<T>(endpoint, { method: 'DELETE', headers });
}

/**
 * File upload helper with authentication
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  headers?: Record<string, string>
): Promise<APIResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    headers: {
      // Don't set Content-Type for FormData - let browser set it with boundary
      ...headers,
    },
    body: formData,
  });
}
