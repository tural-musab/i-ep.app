import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Supabase URL ve anahtarı için ortam değişkenlerini kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase istemcisini oluştur
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Create client function for hooks and other modules
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}; 