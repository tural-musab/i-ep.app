import { createClient } from '@supabase/supabase-js';

// Supabase URL ve anahtarı için ortam değişkenlerini kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 