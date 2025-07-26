import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// Service role key kontrolü
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Runtime güvenlik kontrolü
if (typeof window !== 'undefined' && SERVICE_ROLE_KEY) {
  throw new Error(
    '⚠️ CRITICAL SECURITY ERROR: Service role key detected in client-side code! ' +
    'This is a severe security vulnerability. Remove all service role key usage from client components.'
  );
}

/**
 * Create a Supabase client for use in the browser (client components)
 * NEVER use service role key here
 */
export function createClient() {
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  // Double-check we're not using service role key
  if (typeof window !== 'undefined' && SERVICE_ROLE_KEY) {
    console.error('🚨 Service role key detected in browser context!');
    throw new Error('Service role key cannot be used in browser');
  }

  return createBrowserClient<Database>(
    SUPABASE_URL,
    ANON_KEY
  );
}

/**
 * Create a Supabase client for use in server components
 * Uses anon key by default, service role only when explicitly needed
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();
  
  if (!SUPABASE_URL || !ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient<Database>(
    SUPABASE_URL,
    ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client for server-side operations
 * ⚠️ WARNING: Only use in secure server contexts (API routes, server actions)
 * NEVER expose this to client components
 */
export function createAdminClient() {
  // Ensure we're in a server context
  if (typeof window !== 'undefined') {
    throw new Error(
      '🚨 SECURITY VIOLATION: Attempted to create admin client in browser context!'
    );
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase admin credentials');
  }

  // Additional security check
  const isServerContext = 
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node;

  if (!isServerContext) {
    throw new Error('Admin client can only be created in Node.js context');
  }

  // Log admin client creation for audit purposes
  if (process.env.NODE_ENV === 'production') {
    console.log('🔐 Admin client created', {
      timestamp: new Date().toISOString(),
      context: new Error().stack?.split('\n')[3]?.trim(), // Log where it was called from
    });
  }

  return createBrowserClient<Database>(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Validate that we're in a secure server context
 */
export function validateServerContext(): void {
  if (typeof window !== 'undefined') {
    throw new Error('This function can only be called in a server context');
  }
  
  if (!process.versions?.node) {
    throw new Error('Invalid server environment');
  }
}

/**
 * Safe wrapper for admin operations
 */
export async function withAdminClient<T>(
  operation: (client: ReturnType<typeof createAdminClient>) => Promise<T>
): Promise<T> {
  validateServerContext();
  
  const client = createAdminClient();
  
  try {
    return await operation(client);
  } catch (error) {
    console.error('Admin operation failed:', error);
    throw error;
  } finally {
    // Clean up if needed
  }
}
