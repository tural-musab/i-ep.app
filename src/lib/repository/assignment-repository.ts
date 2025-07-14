/**
 * Assignment Repository Implementation
 * Sprint 2 BL-001: Repository Pattern Foundation
 * İ-EP.APP - Assignment Management
 */

import { BaseRepository, BaseEntity, QueryOptions, QueryResult } from './base-repository';

export interface Assignment extends BaseEntity {
  title: string;
  description?: string;
  type: 'homework' | 'exam' | 'project' | 'quiz' | 'presentation';
  subject: string;
  class_id: string;
  teacher_id: string;
  due_date: string;
  max_score: number;
  is_graded: boolean;
  status: 'draft' | 'published' | 'completed' | 'archived';
  instructions?: string;
  attachments?: string[];
  rubric?: {
    criteria: string;
    points: number;
    description: string;
  }[];
  metadata?: Record<string, any>;
}

export interface AssignmentWithRelations extends Assignment {
  class?: {
    id: string;
    name: string;
    grade: string;
    section: string;
  };
  teacher?: {
    id: string;
    name: string;
    email: string;
    subject: string;
  };
  submissions?: {
    id: string;
    student_id: string;
    student_name: string;
    submission_date: string;
    score?: number;
    status: string;
  }[];
  statistics?: {
    total_submissions: number;
    graded_submissions: number;
    average_score: number;
    completion_rate: number;
  };
}

export interface AssignmentSubmission extends BaseEntity {
  assignment_id: string;
  student_id: string;
  submission_date: string;
  content?: string;
  attachments?: string[];
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'returned' | 'late';
  graded_by?: string;
  graded_at?: string;
  metadata?: Record<string, any>;
}

export class AssignmentRepository extends BaseRepository<Assignment> {
  constructor(tenantId: string) {
    super('assignments', tenantId);
  }

  /**
   * Find assignments by class ID
   */
  async findByClassId(classId: string, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    return this.findAll({
      ...options,
      filters: { class_id: classId }
    });
  }

  /**
   * Find assignments by teacher ID
   */
  async findByTeacherId(teacherId: string, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    return this.findAll({
      ...options,
      filters: { teacher_id: teacherId }
    });
  }

  /**
   * Find assignments by type
   */
  async findByType(type: Assignment['type'], options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    return this.findAll({
      ...options,
      filters: { type }
    });
  }

  /**
   * Find assignments by subject
   */
  async findBySubject(subject: string, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    return this.findAll({
      ...options,
      filters: { subject }
    });
  }

  /**
   * Find assignments due within date range
   */
  async findByDueDateRange(startDate: string, endDate: string, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'due_date',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Assignment[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Find upcoming assignments
   */
  async findUpcoming(daysAhead: number = 7, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    return this.findByDueDateRange(startDate, endDate, options);
  }

  /**
   * Find overdue assignments
   */
  async findOverdue(options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'due_date',
      sortOrder = 'desc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const now = new Date().toISOString();

    const { data, error, count } = await this.getBaseQuery()
      .lt('due_date', now)
      .eq('status', 'published')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Assignment[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Search assignments by title
   */
  async searchByTitle(searchTerm: string, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .ilike('title', `%${searchTerm}%`)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Assignment[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Find assignment with relations
   */
  async findWithRelations(id: string): Promise<AssignmentWithRelations | null> {
    const { data, error } = await this.supabase
      .from('assignments')
      .select(`
        *,
        class:classes!class_id (
          id,
          name,
          grade,
          section
        ),
        teacher:teachers!teacher_id (
          id,
          name,
          email,
          subject
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

    return data as AssignmentWithRelations;
  }

  /**
   * Get assignment statistics
   */
  async getStatistics(assignmentId: string): Promise<{
    totalSubmissions: number;
    gradedSubmissions: number;
    averageScore: number;
    completionRate: number;
    onTimeSubmissions: number;
    lateSubmissions: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_assignment_statistics', {
      assignment_id: assignmentId,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      totalSubmissions: 0,
      gradedSubmissions: 0,
      averageScore: 0,
      completionRate: 0,
      onTimeSubmissions: 0,
      lateSubmissions: 0
    };
  }

  /**
   * Update assignment status
   */
  async updateStatus(assignmentId: string, status: Assignment['status']): Promise<Assignment | null> {
    return this.update(assignmentId, { status });
  }

  /**
   * Publish assignment
   */
  async publish(assignmentId: string): Promise<Assignment | null> {
    return this.updateStatus(assignmentId, 'published');
  }

  /**
   * Archive assignment
   */
  async archive(assignmentId: string): Promise<Assignment | null> {
    return this.updateStatus(assignmentId, 'archived');
  }

  /**
   * Update assignment due date
   */
  async updateDueDate(assignmentId: string, dueDate: string): Promise<Assignment | null> {
    return this.update(assignmentId, { due_date: dueDate });
  }

  /**
   * Get assignments for student
   */
  async findForStudent(studentId: string, options: QueryOptions = {}): Promise<QueryResult<Assignment>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'due_date',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Get student's class first
    const { data: student, error: studentError } = await this.supabase
      .from('students')
      .select('class_id')
      .eq('id', studentId)
      .eq('tenant_id', this.tenantId)
      .single();

    if (studentError) {
      throw new Error(`Repository error: ${studentError.message}`);
    }

    const { data, error, count } = await this.getBaseQuery()
      .eq('class_id', student.class_id)
      .eq('status', 'published')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Assignment[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Bulk update assignment class
   */
  async bulkUpdateClass(assignmentIds: string[], classId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('assignments')
      .update({ 
        class_id: classId,
        updated_at: new Date().toISOString()
      })
      .in('id', assignmentIds)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }

  /**
   * Clone assignment
   */
  async clone(assignmentId: string, updates: Partial<Assignment> = {}): Promise<Assignment> {
    const originalAssignment = await this.findById(assignmentId);
    if (!originalAssignment) {
      throw new Error('Assignment not found');
    }

    const { id, created_at, updated_at, tenant_id, ...assignmentData } = originalAssignment;

    const clonedAssignment = {
      ...assignmentData,
      title: `${assignmentData.title} (Copy)`,
      status: 'draft' as const,
      ...updates
    };

    return this.create(clonedAssignment);
  }
}

/**
 * Assignment Submission Repository
 */
export class AssignmentSubmissionRepository extends BaseRepository<AssignmentSubmission> {
  constructor(tenantId: string) {
    super('assignment_submissions', tenantId);
  }

  /**
   * Find submissions by assignment ID
   */
  async findByAssignmentId(assignmentId: string, options: QueryOptions = {}): Promise<QueryResult<AssignmentSubmission>> {
    return this.findAll({
      ...options,
      filters: { assignment_id: assignmentId }
    });
  }

  /**
   * Find submissions by student ID
   */
  async findByStudentId(studentId: string, options: QueryOptions = {}): Promise<QueryResult<AssignmentSubmission>> {
    return this.findAll({
      ...options,
      filters: { student_id: studentId }
    });
  }

  /**
   * Find submission by assignment and student
   */
  async findByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<AssignmentSubmission | null> {
    const { data, error } = await this.getBaseQuery()
      .eq('assignment_id', assignmentId)
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as AssignmentSubmission;
  }

  /**
   * Grade submission
   */
  async grade(submissionId: string, score: number, feedback?: string, gradedBy?: string): Promise<AssignmentSubmission | null> {
    return this.update(submissionId, {
      score,
      feedback,
      graded_by: gradedBy,
      graded_at: new Date().toISOString(),
      status: 'graded'
    });
  }

  /**
   * Return graded submission
   */
  async returnGraded(submissionId: string): Promise<AssignmentSubmission | null> {
    return this.update(submissionId, { status: 'returned' });
  }

  /**
   * Get ungraded submissions
   */
  async findUngraded(options: QueryOptions = {}): Promise<QueryResult<AssignmentSubmission>> {
    return this.findAll({
      ...options,
      filters: { status: 'submitted' }
    });
  }
}