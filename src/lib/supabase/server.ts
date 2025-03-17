import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { Database } from '@/types/database.types';

// Supabase URL ve anahtarı için ortam değişkenlerini kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Tenant bazlı istemci oluşturma - client taraflı kullanılacak
export function getClientSupabaseClient(tenantId?: string) {
  // Client tarafı için basit oluşturma
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: tenantId ? {
        'x-tenant-id': tenantId,
      } : undefined,
    },
    db: {
      schema: tenantId ? `tenant_${tenantId}` as any : 'public',
    },
  });
  
  return supabase;
}

// Tenant bazlı istemci oluşturma - request bazlı
export function getTenantSupabaseClient(tenantId: string, req?: NextRequest) {  
  // Supabase istemcisini oluştur
  const options: any = {
    auth: {
      persistSession: false,
    },
    global: {
      // Her sorgu için current_tenant_id ayarla
      headers: {
        'x-tenant-id': tenantId,
      },
    },
    // Önbelleklemeyi devre dışı bırak
    db: {
      schema: tenantId ? `tenant_${tenantId}` as any : 'public',
    },
  };
  
  // Request nesnesi varsa, cookie'leri ekle
  if (req) {
    options.auth.cookies = {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
    };
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
}

// Genel sunucu istemcisi (tenant olmadan)
export function createServerSupabaseClient(req?: NextRequest) {
  const options: any = {
    auth: {
      persistSession: false,
    },
  };
  
  // Request nesnesi varsa, cookie'leri ekle
  if (req) {
    options.auth.cookies = {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
    };
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, options);
} 