/**
 * Student Repository Implementation
 * Sprint 2 BL-001: Repository Pattern Foundation
 * İ-EP.APP - Student Management
 */

import { BaseRepository, BaseEntity, QueryOptions, QueryResult } from './base-repository';

export interface Student extends BaseEntity {
  student_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth: string;
  address?: string;
  parent_id?: string;
  class_id?: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  enrollment_date: string;
  graduation_date?: string;
  notes?: string;
  profile_image_url?: string;
  metadata?: Record<string, any>;
}

export interface StudentWithRelations extends Student {
  parent?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  class?: {
    id: string;
    name: string;
    grade: string;
    section: string;
  };
  attendance_rate?: number;
  grade_average?: number;
}

export class StudentRepository extends BaseRepository<Student> {
  constructor(tenantId: string) {
    super('students', tenantId);
  }

  /**
   * Find students by class ID
   */
  async findByClassId(classId: string, options: QueryOptions = {}): Promise<QueryResult<Student>> {
    return this.findAll({
      ...options,
      filters: { class_id: classId },
    });
  }

  /**
   * Find students by parent ID
   */
  async findByParentId(
    parentId: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<Student>> {
    return this.findAll({
      ...options,
      filters: { parent_id: parentId },
    });
  }

  /**
   * Find student by student number
   */
  async findByStudentNumber(studentNumber: string): Promise<Student | null> {
    const { data, error } = await this.getBaseQuery().eq('student_number', studentNumber).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as Student;
  }

  /**
   * Search students by name
   */
  async searchByName(
    searchTerm: string,
    options: QueryOptions = {}
  ): Promise<QueryResult<Student>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Student[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Find students with relations (parent, class, etc.)
   */
  async findWithRelations(id: string): Promise<StudentWithRelations | null> {
    const { data, error } = await this.supabase
      .from('students')
      .select(
        `
        *,
        parent:parents!parent_id (
          id,
          name,
          email,
          phone
        ),
        class:classes!class_id (
          id,
          name,
          grade,
          section
        )
      `
      )
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as StudentWithRelations;
  }

  /**
   * Get student statistics
   */
  async getStudentStats(studentId: string): Promise<{
    attendanceRate: number;
    gradeAverage: number;
    totalAssignments: number;
    completedAssignments: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_student_statistics', {
      student_id: studentId,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return (
      data || {
        attendanceRate: 0,
        gradeAverage: 0,
        totalAssignments: 0,
        completedAssignments: 0,
      }
    );
  }

  /**
   * Update student status
   */
  async updateStatus(studentId: string, status: Student['status']): Promise<Student | null> {
    return this.update(studentId, { status });
  }

  /**
   * Generate unique student number
   */
  async generateStudentNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const { data, error } = await this.supabase
      .from('students')
      .select('student_number')
      .eq('tenant_id', this.tenantId)
      .like('student_number', `${currentYear}%`)
      .order('student_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].student_number;
      const lastSequence = parseInt(lastNumber.substring(4));
      nextNumber = lastSequence + 1;
    }

    return `${currentYear}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Get class enrollment stats
   */
  async getClassEnrollmentStats(classId: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    maleStudents: number;
    femaleStudents: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_class_enrollment_stats', {
      class_id: classId,
      tenant_id: this.tenantId,
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return (
      data || {
        totalStudents: 0,
        activeStudents: 0,
        maleStudents: 0,
        femaleStudents: 0,
      }
    );
  }

  /**
   * Bulk update student class
   */
  async bulkUpdateClass(studentIds: string[], classId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('students')
      .update({
        class_id: classId,
        updated_at: new Date().toISOString(),
      })
      .in('id', studentIds)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }
}
