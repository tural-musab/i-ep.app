import { getTenantSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type Student = Database['tenant_schema']['Tables']['students']['Row'];
export type InsertStudent = Database['tenant_schema']['Tables']['students']['Insert'];
export type UpdateStudent = Database['tenant_schema']['Tables']['students']['Update'];

export class StudentRepository {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Bütün öğrencileri getirir
   */
  async getAll(): Promise<Student[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Öğrenciler getirilirken hata oluştu:', error);
      throw new Error(`Öğrenciler getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * ID'ye göre öğrenci getirir
   */
  async getById(id: string): Promise<Student | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      console.error('Öğrenci getirilirken hata oluştu:', error);
      throw new Error(`Öğrenci getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Kullanıcı ID'sine göre öğrenci getirir
   */
  async getByUserId(userId: string): Promise<Student | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      console.error('Öğrenci getirilirken hata oluştu:', error);
      throw new Error(`Öğrenci getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Öğrenci numarasına göre öğrenci getirir
   */
  async getByStudentNumber(studentNumber: string): Promise<Student | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_number', studentNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      console.error('Öğrenci getirilirken hata oluştu:', error);
      throw new Error(`Öğrenci getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Sınıfa göre öğrencileri getirir
   */
  async getByClassId(classId: string): Promise<Student[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Sınıftaki öğrenciler getirilirken hata oluştu:', error);
      throw new Error(`Sınıftaki öğrenciler getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Veliye göre öğrencileri getirir
   */
  async getByParentId(parentId: string): Promise<Student[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('parent_id', parentId)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Velinin öğrencileri getirilirken hata oluştu:', error);
      throw new Error(`Velinin öğrencileri getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Öğrenci bilgisi ekler
   */
  async create(student: InsertStudent): Promise<Student> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single();

    if (error) {
      console.error('Öğrenci eklenirken hata oluştu:', error);
      throw new Error(`Öğrenci eklenirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Öğrenci bilgilerini günceller
   */
  async update(id: string, updates: UpdateStudent): Promise<Student> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Öğrenci güncellenirken hata oluştu:', error);
      throw new Error(`Öğrenci güncellenirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Öğrenciyi bir sınıfa atar
   */
  async assignToClass(id: string, classId: string): Promise<Student> {
    return this.update(id, { class_id: classId });
  }

  /**
   * Öğrenciyi siler
   */
  async delete(id: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Öğrenci silinirken hata oluştu:', error);
      throw new Error(`Öğrenci silinirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * İsme göre öğrenci arar
   */
  async searchByName(query: string): Promise<Student[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Öğrenci araması yapılırken hata oluştu:', error);
      throw new Error(`Öğrenci araması yapılırken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Öğrenci sayısını getirir
   */
  async count(): Promise<number> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Öğrenci sayısı hesaplanırken hata oluştu:', error);
      throw new Error(`Öğrenci sayısı hesaplanırken hata oluştu: ${error.message}`);
    }

    return count || 0;
  }
} 