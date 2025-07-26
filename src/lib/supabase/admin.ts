import { createClient } from '@supabase/supabase-js';

// Runtime güvenlik kontrolü - Bu dosya sadece server-side'da kullanılmalı
if (typeof window !== 'undefined') {
  throw new Error(
    '⚠️ CRITICAL SECURITY ERROR: Admin client attempted to load in browser context! ' +
    'This file should only be imported in server-side code (API routes, server components, etc.)'
  );
}

// Supabase URL ve admin anahtarı için ortam değişkenlerini kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Güvenlik kontrolleri
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required Supabase admin environment variables');
}

// Node.js ortamında olduğumuzu doğrula
if (!process.versions?.node) {
  throw new Error('Admin client can only be created in Node.js environment');
}

// Service role key ile istemci oluşturulması, bu istemci RLS politikalarını bypass eder
// Bu istemci sadece güvenli sunucu tarafı işlemlerinde kullanılmalıdır
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Güvenli wrapper fonksiyon
export async function withAdminAccess<T>(
  operation: (client: typeof supabaseAdmin) => Promise<T>,
  context?: string
): Promise<T> {
  // Production'da admin erişimlerini logla
  if (process.env.NODE_ENV === 'production') {
    console.log('🔐 Admin access requested', {
      timestamp: new Date().toISOString(),
      context: context || 'Unknown',
      stack: new Error().stack?.split('\n')[3]?.trim(),
    });
  }

  try {
    return await operation(supabaseAdmin);
  } catch (error) {
    console.error('Admin operation failed:', {
      context,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

// Export type-safe admin client type
export type AdminClient = typeof supabaseAdmin;
