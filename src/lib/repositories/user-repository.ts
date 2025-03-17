import { getTenantSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type User = Database['tenant_schema']['Tables']['users']['Row'];
export type InsertUser = Database['tenant_schema']['Tables']['users']['Insert'];
export type UpdateUser = Database['tenant_schema']['Tables']['users']['Update'];

export class UserRepository {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Bütün kullanıcıları getirir
   */
  async getAll(): Promise<User[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Kullanıcılar getirilirken hata oluştu:', error);
      throw new Error(`Kullanıcılar getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * ID'ye göre kullanıcı getirir
   */
  async getById(id: string): Promise<User | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      console.error('Kullanıcı getirilirken hata oluştu:', error);
      throw new Error(`Kullanıcı getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * E-postaya göre kullanıcı getirir
   */
  async getByEmail(email: string): Promise<User | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      console.error('Kullanıcı getirilirken hata oluştu:', error);
      throw new Error(`Kullanıcı getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Belirli bir role sahip kullanıcıları getirir
   */
  async getByRole(role: string): Promise<User[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('full_name', { ascending: true });

    if (error) {
      console.error(`${role} rolündeki kullanıcılar getirilirken hata oluştu:`, error);
      throw new Error(`${role} rolündeki kullanıcılar getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Yeni bir kullanıcı oluşturur
   */
  async create(user: InsertUser): Promise<User> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();

    if (error) {
      console.error('Kullanıcı oluşturulurken hata oluştu:', error);
      throw new Error(`Kullanıcı oluşturulurken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Var olan bir kullanıcıyı günceller
   */
  async update(id: string, updates: UpdateUser): Promise<User> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Kullanıcı güncellenirken hata oluştu:', error);
      throw new Error(`Kullanıcı güncellenirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Kullanıcının son giriş zamanını günceller
   */
  async updateLastLogin(id: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Son giriş zamanı güncellenirken hata oluştu:', error);
      throw new Error(`Son giriş zamanı güncellenirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Kullanıcıyı siler
   */
  async delete(id: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Kullanıcı silinirken hata oluştu:', error);
      throw new Error(`Kullanıcı silinirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Kullanıcı sayısını getirir
   */
  async count(): Promise<number> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Kullanıcı sayısı hesaplanırken hata oluştu:', error);
      throw new Error(`Kullanıcı sayısı hesaplanırken hata oluştu: ${error.message}`);
    }

    return count || 0;
  }
} 