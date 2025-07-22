/**
 * Authenticated API Client for İ-EP.APP
 * Automatically handles authentication headers for API calls
 * Professional SaaS approach with session management
 */

import { getCurrentUser, getCurrentTenant } from '@/lib/auth/session';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Authenticated fetch wrapper
 * Automatically adds authentication headers to API requests
 */
export async function authenticatedFetch(url: string, options: RequestOptions = {}): Promise<Response> {
  try {
    // Get current user and tenant from session/context
    const user = await getCurrentUser();
    const tenant = await getCurrentTenant();

    // Prepare authentication headers
    const authHeaders: Record<string, string> = {};

    if (user) {
      authHeaders['X-User-Email'] = user.email;
      authHeaders['X-User-ID'] = user.id;
    }

    if (tenant) {
      authHeaders['x-tenant-id'] = tenant.id;
    }

    // For demo/development: Use demo values if no session
    if (!user || !tenant) {
      console.log('🔧 Using demo authentication headers');
      authHeaders['X-User-Email'] = 'admin@demo.i-ep.app';
      authHeaders['X-User-ID'] = 'demo-admin-001';
      authHeaders['x-tenant-id'] = 'f9f948e5-d486-4694-a863-bf11c999c643';
    }

    // Merge with existing headers
    const finalOptions: RequestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    };

    return fetch(url, finalOptions);
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * Authenticated API client with common methods
 */
export const apiClient = {
  get: async (url: string, options?: RequestOptions) => {
    return authenticatedFetch(url, { method: 'GET', ...options });
  },

  post: async (url: string, data?: any, options?: RequestOptions) => {
    return authenticatedFetch(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  put: async (url: string, data?: any, options?: RequestOptions) => {
    return authenticatedFetch(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  delete: async (url: string, options?: RequestOptions) => {
    return authenticatedFetch(url, { method: 'DELETE', ...options });
  },
};

// Browser console helper for testing
if (typeof window !== 'undefined') {
  (window as any).testAPI = async function() {
    console.log('🔧 Testing authenticated API calls...');
    
    try {
      const classesRes = await apiClient.get('/api/classes');
      const classesData = await classesRes.json();
      console.log('Classes:', classesData);

      const assignmentsRes = await apiClient.get('/api/assignments');  
      const assignmentsData = await assignmentsRes.json();
      console.log('Assignments:', assignmentsData);
      
      console.log('✅ Authenticated API test completed');
    } catch (error) {
      console.error('❌ API test error:', error);
    }
  };
}