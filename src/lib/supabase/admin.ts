import { createClient } from '@supabase/supabase-js';

// Supabase URL ve admin anahtarı için ortam değişkenlerini kullan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Service role key ile istemci oluşturulması, bu istemci RLS politikalarını bypass eder
// Bu istemci sadece güvenli sunucu tarafı işlemlerinde kullanılmalıdır
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
