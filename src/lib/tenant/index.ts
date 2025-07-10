import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function getCurrentTenant() {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    throw new Error('Oturum bulunamadı')
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', session.user.app_metadata.tenant_id)
    .single()

  if (error || !tenant) {
    throw new Error('Tenant bulunamadı')
  }

  return tenant
} 