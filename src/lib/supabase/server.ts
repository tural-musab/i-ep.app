import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

// Supabase URL ve anahtarı için ortam değişkenlerini kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Tenant bazlı istemci oluşturma
export function getTenantSupabaseClient(tenantId: string) {
  const cookieStore = cookies();
  
  // Supabase istemcisini oluştur
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      // Cookie'den session bilgisini al
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
    global: {
      // Her sorgu için current_tenant_id ayarla
      headers: {
        'x-tenant-id': tenantId,
      },
    },
    // Önbelleklemeyi devre dışı bırak
    db: {
      schema: tenantId ? `tenant_${tenantId}` : 'public',
    },
  });
  
  return supabase;
}

// Genel sunucu istemcisi (tenant olmadan)
export function createServerSupabaseClient() {
  const cookieStore = cookies();
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  });
} 