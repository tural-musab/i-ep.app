import { getTenantSupabaseClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export type Class = Database['tenant_schema']['Tables']['classes']['Row'];
export type InsertClass = Database['tenant_schema']['Tables']['classes']['Insert'];
export type UpdateClass = Database['tenant_schema']['Tables']['classes']['Update'];

export type TeacherClass = Database['tenant_schema']['Tables']['teacher_class']['Row'];
export type InsertTeacherClass = Database['tenant_schema']['Tables']['teacher_class']['Insert'];

export class ClassRepository {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Tüm sınıfları getirir
   */
  async getAll(): Promise<Class[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Sınıflar getirilirken hata oluştu:', error);
      throw new Error(`Sınıflar getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * ID'ye göre sınıf getirir
   */
  async getById(id: string): Promise<Class | null> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase.from('classes').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      console.error('Sınıf getirilirken hata oluştu:', error);
      throw new Error(`Sınıf getirilirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Belirli bir sınıf seviyesindeki sınıfları getirir
   */
  async getByGradeLevel(gradeLevel: number): Promise<Class[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('grade_level', gradeLevel)
      .order('name', { ascending: true });

    if (error) {
      console.error('Sınıf seviyesine göre sınıflar getirilirken hata oluştu:', error);
      throw new Error(`Sınıf seviyesine göre sınıflar getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Belirli bir akademik yıla ait sınıfları getirir
   */
  async getByAcademicYear(academicYear: string): Promise<Class[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('academic_year', academicYear)
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Akademik yıla göre sınıflar getirilirken hata oluştu:', error);
      throw new Error(`Akademik yıla göre sınıflar getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Sınıf öğretmeninin sorumlu olduğu sınıfları getirir
   */
  async getByMainTeacherId(teacherId: string): Promise<Class[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('main_teacher_id', teacherId)
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Öğretmenin sınıfları getirilirken hata oluştu:', error);
      throw new Error(`Öğretmenin sınıfları getirilirken hata oluştu: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Bir öğretmenin ders verdiği tüm sınıfları getirir
   */
  async getClassesByTeacherId(teacherId: string): Promise<Class[]> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('teacher_class')
      .select('class_id')
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Öğretmenin ders verdiği sınıflar getirilirken hata oluştu:', error);
      throw new Error(
        `Öğretmenin ders verdiği sınıflar getirilirken hata oluştu: ${error.message}`
      );
    }

    if (!data || data.length === 0) {
      return [];
    }

    const classIds = data.map((item) => item.class_id);
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .in('id', classIds)
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (classesError) {
      console.error('Sınıflar getirilirken hata oluştu:', classesError);
      throw new Error(`Sınıflar getirilirken hata oluştu: ${classesError.message}`);
    }

    return classes || [];
  }

  /**
   * Yeni bir sınıf oluşturur
   */
  async create(classData: InsertClass): Promise<Class> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase.from('classes').insert(classData).select().single();

    if (error) {
      console.error('Sınıf oluşturulurken hata oluştu:', error);
      throw new Error(`Sınıf oluşturulurken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Sınıf bilgilerini günceller
   */
  async update(id: string, updates: UpdateClass): Promise<Class> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { data, error } = await supabase
      .from('classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Sınıf güncellenirken hata oluştu:', error);
      throw new Error(`Sınıf güncellenirken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Sınıf öğretmenini değiştirir
   */
  async changeMainTeacher(id: string, teacherId: string): Promise<Class> {
    return this.update(id, { main_teacher_id: teacherId });
  }

  /**
   * Öğretmeni bir dersle ilişkilendirir
   */
  async assignTeacherToClass(
    teacherId: string,
    classId: string,
    subject: string
  ): Promise<TeacherClass> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    // Önce böyle bir atama var mı kontrol et
    const { data: existingData, error: checkError } = await supabase
      .from('teacher_class')
      .select('*')
      .eq('teacher_id', teacherId)
      .eq('class_id', classId)
      .eq('subject', subject)
      .maybeSingle();

    if (checkError) {
      console.error('Öğretmen-sınıf ilişkisi kontrol edilirken hata oluştu:', checkError);
      throw new Error(
        `Öğretmen-sınıf ilişkisi kontrol edilirken hata oluştu: ${checkError.message}`
      );
    }

    // Zaten varsa, mevcut kaydı döndür
    if (existingData) {
      return existingData;
    }

    // Yoksa yeni kayıt oluştur
    const { data, error } = await supabase
      .from('teacher_class')
      .insert({
        teacher_id: teacherId,
        class_id: classId,
        subject: subject,
      })
      .select()
      .single();

    if (error) {
      console.error('Öğretmen sınıfa atanırken hata oluştu:', error);
      throw new Error(`Öğretmen sınıfa atanırken hata oluştu: ${error.message}`);
    }

    return data;
  }

  /**
   * Öğretmenin bir dersle ilişkisini kaldırır
   */
  async removeTeacherFromClass(teacherId: string, classId: string, subject: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { error } = await supabase
      .from('teacher_class')
      .delete()
      .eq('teacher_id', teacherId)
      .eq('class_id', classId)
      .eq('subject', subject);

    if (error) {
      console.error('Öğretmen-sınıf ilişkisi silinirken hata oluştu:', error);
      throw new Error(`Öğretmen-sınıf ilişkisi silinirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Sınıfı siler
   */
  async delete(id: string): Promise<void> {
    const supabase = getTenantSupabaseClient(this.tenantId);

    // Önce tüm teacher_class ilişkilerini temizle
    const { error: relError } = await supabase.from('teacher_class').delete().eq('class_id', id);

    if (relError) {
      console.error('Sınıf ilişkileri silinirken hata oluştu:', relError);
      throw new Error(`Sınıf ilişkileri silinirken hata oluştu: ${relError.message}`);
    }

    // Sonra sınıfı sil
    const { error } = await supabase.from('classes').delete().eq('id', id);

    if (error) {
      console.error('Sınıf silinirken hata oluştu:', error);
      throw new Error(`Sınıf silinirken hata oluştu: ${error.message}`);
    }
  }

  /**
   * Sınıf sayısını getirir
   */
  async count(): Promise<number> {
    const supabase = getTenantSupabaseClient(this.tenantId);
    const { count, error } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Sınıf sayısı hesaplanırken hata oluştu:', error);
      throw new Error(`Sınıf sayısı hesaplanırken hata oluştu: ${error.message}`);
    }

    return count || 0;
  }
}
