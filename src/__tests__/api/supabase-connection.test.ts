import { supabaseServer, createServerSupabaseClient } from '@/lib/supabase/server';

describe('Supabase Connection Tests', () => {
  it('should connect to Supabase with server client', async () => {
    const { data, error } = await supabaseServer.from('tenants').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should connect to Supabase with anon client', async () => {
    const client = createServerSupabaseClient();
    const { data, error } = await client.from('tenants').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should be able to query classes table', async () => {
    const { data, error } = await supabaseServer.from('classes').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });

  it('should be able to query students table', async () => {
    const { data, error } = await supabaseServer.from('students').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
