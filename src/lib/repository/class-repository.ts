/**
 * Class Repository Implementation
 * Sprint 2 BL-001: Repository Pattern Foundation
 * İ-EP.APP - Class Management
 */

import { BaseRepository, BaseEntity, QueryOptions, QueryResult } from './base-repository';

export interface Class extends BaseEntity {
  name: string;
  grade: string;
  section: string;
  academic_year: string;
  teacher_id?: string;
  room_number?: string;
  capacity: number;
  current_enrollment: number;
  status: 'active' | 'inactive' | 'archived';
  schedule?: {
    day: string;
    start_time: string;
    end_time: string;
    subject: string;
  }[];
  description?: string;
  metadata?: Record<string, any>;
}

export interface ClassWithRelations extends Class {
  teacher?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
  };
  students?: {
    id: string;
    student_number: string;
    first_name: string;
    last_name: string;
    status: string;
  }[];
  enrollment_stats?: {
    total_students: number;
    active_students: number;
    attendance_rate: number;
  };
}

export class ClassRepository extends BaseRepository<Class> {
  constructor(tenantId: string) {
    super('classes', tenantId);
  }

  /**
   * Find classes by teacher ID
   */
  async findByTeacherId(teacherId: string, options: QueryOptions = {}): Promise<QueryResult<Class>> {
    return this.findAll({
      ...options,
      filters: { teacher_id: teacherId }
    });
  }

  /**
   * Find classes by grade
   */
  async findByGrade(grade: string, options: QueryOptions = {}): Promise<QueryResult<Class>> {
    return this.findAll({
      ...options,
      filters: { grade }
    });
  }

  /**
   * Find classes by academic year
   */
  async findByAcademicYear(academicYear: string, options: QueryOptions = {}): Promise<QueryResult<Class>> {
    return this.findAll({
      ...options,
      filters: { academic_year: academicYear }
    });
  }

  /**
   * Search classes by name
   */
  async searchByName(searchTerm: string, options: QueryOptions = {}): Promise<QueryResult<Class>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .ilike('name', `%${searchTerm}%`)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Class[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Find class with relations (teacher, students, etc.)
   */
  async findWithRelations(id: string): Promise<ClassWithRelations | null> {
    const { data, error } = await this.supabase
      .from('classes')
      .select(`
        *,
        teacher:teachers!teacher_id (
          id,
          name,
          email,
          phone,
          subject
        ),
        students:students!class_id (
          id,
          student_number,
          first_name,
          last_name,
          status
        )
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as ClassWithRelations;
  }

  /**
   * Get class enrollment statistics
   */
  async getEnrollmentStats(classId: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    capacity: number;
    availableSpots: number;
    enrollmentRate: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_class_enrollment_stats', {
      class_id: classId,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      totalStudents: 0,
      activeStudents: 0,
      capacity: 0,
      availableSpots: 0,
      enrollmentRate: 0
    };
  }

  /**
   * Get class schedule
   */
  async getSchedule(classId: string): Promise<{
    day: string;
    start_time: string;
    end_time: string;
    subject: string;
    teacher_name?: string;
  }[]> {
    const { data, error } = await this.supabase.rpc('get_class_schedule', {
      class_id: classId,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update class capacity
   */
  async updateCapacity(classId: string, capacity: number): Promise<Class | null> {
    return this.update(classId, { capacity });
  }

  /**
   * Assign teacher to class
   */
  async assignTeacher(classId: string, teacherId: string): Promise<Class | null> {
    return this.update(classId, { teacher_id: teacherId });
  }

  /**
   * Remove teacher from class
   */
  async removeTeacher(classId: string): Promise<Class | null> {
    return this.update(classId, { teacher_id: null });
  }

  /**
   * Update class status
   */
  async updateStatus(classId: string, status: Class['status']): Promise<Class | null> {
    return this.update(classId, { status });
  }

  /**
   * Get classes by capacity range
   */
  async findByCapacityRange(minCapacity: number, maxCapacity: number, options: QueryOptions = {}): Promise<QueryResult<Class>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .gte('capacity', minCapacity)
      .lte('capacity', maxCapacity)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Class[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Get available classes (not at capacity)
   */
  async findAvailableClasses(options: QueryOptions = {}): Promise<QueryResult<Class>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('classes')
      .select('*', { count: 'exact' })
      .eq('tenant_id', this.tenantId)
      .eq('status', 'active')
      .filter('current_enrollment', 'lt', 'capacity')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Class[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Bulk update class academic year
   */
  async bulkUpdateAcademicYear(classIds: string[], academicYear: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('classes')
      .update({ 
        academic_year: academicYear,
        updated_at: new Date().toISOString()
      })
      .in('id', classIds)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }

  /**
   * Get class performance statistics
   */
  async getPerformanceStats(classId: string): Promise<{
    averageGrade: number;
    attendanceRate: number;
    completionRate: number;
    totalAssignments: number;
    completedAssignments: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_class_performance_stats', {
      class_id: classId,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      averageGrade: 0,
      attendanceRate: 0,
      completionRate: 0,
      totalAssignments: 0,
      completedAssignments: 0
    };
  }
}