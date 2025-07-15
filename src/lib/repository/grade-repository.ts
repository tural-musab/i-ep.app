/**
 * Grade Repository - Enhanced
 * İ-EP.APP - Grade Management System
 * 
 * Comprehensive grade repository with Turkish education system support
 * Database integration with PostgreSQL functions and stored procedures
 * Enterprise-grade features with multi-tenant architecture
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface Grade {
  id: string;
  tenantId: string;
  studentId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  assignmentId?: string;
  gradeType: 'exam' | 'homework' | 'project' | 'participation' | 'quiz' | 'midterm' | 'final';
  gradeValue: number;
  maxGrade: number;
  weight: number;
  percentage: number;
  letterGrade: string;
  gpaPoints: number;
  examName?: string;
  description?: string;
  semester: 1 | 2;
  academicYear: string;
  gradeDate: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  studentName?: string;
  subjectName?: string;
  className?: string;
  teacherName?: string;
  comments?: GradeComment[];
}

export interface GradeConfiguration {
  id: string;
  tenantId: string;
  subjectId: string;
  classId?: string;
  gradeType: Grade['gradeType'];
  weight: number;
  minGrade: number;
  maxGrade: number;
  passingGrade: number;
  honorRollGrade: number;
  isRequired: boolean;
  allowsMakeup: boolean;
  semester: 1 | 2;
  academicYear: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeCalculation {
  id: string;
  tenantId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  semester: 1 | 2;
  academicYear: string;
  totalPoints: number;
  totalWeight: number;
  weightedAverage: number;
  unweightedAverage: number;
  finalPercentage: number;
  finalLetterGrade: string;
  gpaPoints: number;
  isPassing: boolean;
  isHonorRoll: boolean;
  gradeCount: number;
  lastCalculatedAt: Date;
  calculationMethod: 'weighted' | 'unweighted';
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeRubric {
  id: string;
  tenantId: string;
  teacherId: string;
  subjectId: string;
  assignmentId?: string;
  rubricName: string;
  description?: string;
  gradeType: Grade['gradeType'];
  maxPoints: number;
  criteria: RubricCriteria[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RubricCriteria {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
  qualityIndicators: string[];
}

export interface GradeComment {
  id: string;
  tenantId: string;
  gradeId: string;
  teacherId: string;
  commentText: string;
  commentType: 'general' | 'strength' | 'improvement' | 'recommendation';
  isVisibleToStudent: boolean;
  isVisibleToParent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Query options interfaces
export interface GradeQueryOptions {
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  gradeType?: Grade['gradeType'];
  semester?: number;
  academicYear?: string;
  startDate?: Date;
  endDate?: Date;
  minGrade?: number;
  maxGrade?: number;
  includeCalculations?: boolean;
  includeComments?: boolean;
  includeStudent?: boolean;
  limit?: number;
  offset?: number;
}

export interface GradeStatistics {
  totalGrades: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
  medianGrade: number;
  standardDeviation: number;
  passingGrades: number;
  passingPercentage: number;
  gradeDistribution: Record<string, number>;
  letterGradeDistribution: Record<string, number>;
}

// ============================================================================
// GRADE REPOSITORY CLASS
// ============================================================================

export class GradeRepository extends BaseRepository<Grade> {
  constructor(supabase: SupabaseClient, tenantId: string) {
    super(supabase, 'grades', tenantId);
  }

  // ============================================================================
  // CORE GRADE OPERATIONS
  // ============================================================================

  /**
   * Create a new grade record
   */
  async createGrade(data: {
    studentId: string;
    classId: string;
    subjectId: string;
    assignmentId?: string;
    gradeType: Grade['gradeType'];
    gradeValue: number;
    maxGrade: number;
    weight?: number;
    examName?: string;
    description?: string;
    semester: 1 | 2;
    academicYear: string;
    gradeDate: Date;
    teacherId: string;
  }): Promise<Grade> {
    const { data: result, error } = await this.supabase
      .from('grades')
      .insert({
        tenant_id: this.tenantId,
        student_id: data.studentId,
        class_id: data.classId,
        subject_id: data.subjectId,
        assignment_id: data.assignmentId,
        teacher_id: data.teacherId,
        grade_type: data.gradeType,
        grade_value: data.gradeValue,
        max_grade: data.maxGrade,
        weight: data.weight || 1.0,
        exam_name: data.examName,
        description: data.description,
        semester: data.semester,
        academic_year: data.academicYear,
        grade_date: data.gradeDate.toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create grade: ${error.message}`);
    return this.transformGrade(result);
  }

  /**
   * Update an existing grade record
   */
  async updateGrade(id: string, data: {
    gradeValue?: number;
    maxGrade?: number;
    weight?: number;
    examName?: string;
    description?: string;
    gradeDate?: Date;
  }): Promise<Grade> {
    const updateData: any = {};
    
    if (data.gradeValue !== undefined) updateData.grade_value = data.gradeValue;
    if (data.maxGrade !== undefined) updateData.max_grade = data.maxGrade;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.examName !== undefined) updateData.exam_name = data.examName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.gradeDate !== undefined) updateData.grade_date = data.gradeDate.toISOString().split('T')[0];
    
    const { data: result, error } = await this.supabase
      .from('grades')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update grade: ${error.message}`);
    return this.transformGrade(result);
  }

  /**
   * Delete a grade record
   */
  async deleteGrade(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('grades')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw new Error(`Failed to delete grade: ${error.message}`);
  }

  /**
   * Get grade by ID with optional details
   */
  async getGradeById(id: string, options: {
    includeComments?: boolean;
    includeCalculations?: boolean;
    includeStudent?: boolean;
  } = {}): Promise<Grade | null> {
    let query = this.supabase
      .from('grades')
      .select(`
        *,
        ${options.includeStudent ? 'students(name, student_number),' : ''}
        subjects(name),
        classes(name),
        users(name)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get grade: ${error.message}`);
    }

    const grade = this.transformGrade(data);

    if (options.includeComments) {
      grade.comments = await this.getGradeComments(id);
    }

    return grade;
  }

  /**
   * Get grades with filtering and pagination
   */
  async getGrades(options: GradeQueryOptions): Promise<Grade[]> {
    let query = this.supabase
      .from('grades')
      .select(`
        *,
        ${options.includeStudent ? 'students(name, student_number),' : ''}
        subjects(name),
        classes(name),
        users(name)
      `)
      .eq('tenant_id', this.tenantId);

    // Apply filters
    if (options.studentId) query = query.eq('student_id', options.studentId);
    if (options.classId) query = query.eq('class_id', options.classId);
    if (options.subjectId) query = query.eq('subject_id', options.subjectId);
    if (options.teacherId) query = query.eq('teacher_id', options.teacherId);
    if (options.gradeType) query = query.eq('grade_type', options.gradeType);
    if (options.semester) query = query.eq('semester', options.semester);
    if (options.academicYear) query = query.eq('academic_year', options.academicYear);
    if (options.startDate) query = query.gte('grade_date', options.startDate.toISOString().split('T')[0]);
    if (options.endDate) query = query.lte('grade_date', options.endDate.toISOString().split('T')[0]);
    if (options.minGrade) query = query.gte('percentage', options.minGrade);
    if (options.maxGrade) query = query.lte('percentage', options.maxGrade);

    // Apply pagination
    if (options.limit) query = query.limit(options.limit);
    if (options.offset) query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);

    // Order by grade date descending
    query = query.order('grade_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get grades: ${error.message}`);
    
    const grades = (data || []).map(grade => this.transformGrade(grade));

    // Include comments if requested
    if (options.includeComments) {
      for (const grade of grades) {
        grade.comments = await this.getGradeComments(grade.id);
      }
    }

    return grades;
  }

  /**
   * Get grades count for pagination
   */
  async getGradesCount(options: GradeQueryOptions): Promise<number> {
    let query = this.supabase
      .from('grades')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', this.tenantId);

    // Apply same filters as getGrades
    if (options.studentId) query = query.eq('student_id', options.studentId);
    if (options.classId) query = query.eq('class_id', options.classId);
    if (options.subjectId) query = query.eq('subject_id', options.subjectId);
    if (options.teacherId) query = query.eq('teacher_id', options.teacherId);
    if (options.gradeType) query = query.eq('grade_type', options.gradeType);
    if (options.semester) query = query.eq('semester', options.semester);
    if (options.academicYear) query = query.eq('academic_year', options.academicYear);
    if (options.startDate) query = query.gte('grade_date', options.startDate.toISOString().split('T')[0]);
    if (options.endDate) query = query.lte('grade_date', options.endDate.toISOString().split('T')[0]);
    if (options.minGrade) query = query.gte('percentage', options.minGrade);
    if (options.maxGrade) query = query.lte('percentage', options.maxGrade);

    const { count, error } = await query;

    if (error) throw new Error(`Failed to get grades count: ${error.message}`);
    return count || 0;
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  /**
   * Create multiple grades in bulk
   */
  async createBulkGrades(
    classId: string,
    subjectId: string,
    gradeConfig: {
      gradeType: Grade['gradeType'];
      examName?: string;
      maxGrade: number;
      weight: number;
      semester: 1 | 2;
      academicYear: string;
      gradeDate: Date;
      teacherId: string;
    },
    grades: {
      studentId: string;
      gradeValue: number;
      description?: string;
    }[]
  ): Promise<Grade[]> {
    const gradeRecords = grades.map(grade => ({
      tenant_id: this.tenantId,
      student_id: grade.studentId,
      class_id: classId,
      subject_id: subjectId,
      teacher_id: gradeConfig.teacherId,
      grade_type: gradeConfig.gradeType,
      grade_value: grade.gradeValue,
      max_grade: gradeConfig.maxGrade,
      weight: gradeConfig.weight,
      exam_name: gradeConfig.examName,
      description: grade.description,
      semester: gradeConfig.semester,
      academic_year: gradeConfig.academicYear,
      grade_date: gradeConfig.gradeDate.toISOString().split('T')[0],
    }));

    const { data, error } = await this.supabase
      .from('grades')
      .insert(gradeRecords)
      .select();

    if (error) throw new Error(`Failed to create bulk grades: ${error.message}`);
    return (data || []).map(grade => this.transformGrade(grade));
  }

  // ============================================================================
  // SPECIALIZED RETRIEVAL METHODS
  // ============================================================================

  /**
   * Get student grades with optional subject filtering
   */
  async getStudentGrades(studentId: string, options: {
    subjectId?: string;
    semester?: number;
    academicYear?: string;
    includeComments?: boolean;
    includeCalculations?: boolean;
  } = {}): Promise<Grade[]> {
    return this.getGrades({
      studentId,
      ...options,
    });
  }

  /**
   * Get class grades with optional subject filtering
   */
  async getClassGrades(classId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<Grade[]> {
    return this.getGrades({
      classId,
      subjectId,
      semester,
      academicYear,
    });
  }

  /**
   * Get subject grades with optional class filtering
   */
  async getSubjectGrades(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<Grade[]> {
    return this.getGrades({
      subjectId,
      classId,
      semester,
      academicYear,
    });
  }

  /**
   * Get grade by student and exam (for duplicate checking)
   */
  async getGradeByStudentAndExam(
    studentId: string,
    subjectId: string,
    gradeType: Grade['gradeType'],
    examName?: string,
    semester?: number,
    academicYear?: string
  ): Promise<Grade | null> {
    let query = this.supabase
      .from('grades')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('student_id', studentId)
      .eq('subject_id', subjectId)
      .eq('grade_type', gradeType);

    if (examName) query = query.eq('exam_name', examName);
    if (semester) query = query.eq('semester', semester);
    if (academicYear) query = query.eq('academic_year', academicYear);

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to get grade: ${error.message}`);
    }

    return this.transformGrade(data);
  }

  // ============================================================================
  // GRADE CALCULATIONS
  // ============================================================================

  /**
   * Get student grade calculations
   */
  async getStudentGradeCalculations(
    studentId: string,
    semester?: number,
    academicYear?: string,
    subjectId?: string
  ): Promise<GradeCalculation[]> {
    let query = this.supabase
      .from('grade_calculations')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('student_id', studentId);

    if (semester) query = query.eq('semester', semester);
    if (academicYear) query = query.eq('academic_year', academicYear);
    if (subjectId) query = query.eq('subject_id', subjectId);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get grade calculations: ${error.message}`);
    return (data || []).map(calc => this.transformGradeCalculation(calc));
  }

  /**
   * Calculate student GPA
   */
  async calculateStudentGPA(studentId: string, semester?: number, academicYear?: string): Promise<number> {
    const { data, error } = await this.supabase.rpc('calculate_student_gpa', {
      p_student_id: studentId,
      p_semester: semester,
      p_academic_year: academicYear,
      p_tenant_id: this.tenantId,
    });

    if (error) throw new Error(`Failed to calculate GPA: ${error.message}`);
    return data || 0;
  }

  /**
   * Trigger grade calculations for a student
   */
  async triggerStudentCalculations(
    studentId: string,
    subjectId?: string,
    semester?: number,
    academicYear?: string,
    force: boolean = false
  ): Promise<{ calculationsTriggered: number; calculationsUpdated: number }> {
    // Get all subjects for the student if not specified
    const subjects = subjectId ? [subjectId] : await this.getStudentSubjects(studentId, semester, academicYear);
    
    let calculationsTriggered = 0;
    let calculationsUpdated = 0;

    for (const subject of subjects) {
      const { error } = await this.supabase.rpc('update_grade_calculations', {
        p_student_id: studentId,
        p_subject_id: subject,
        p_semester: semester,
        p_academic_year: academicYear,
        p_tenant_id: this.tenantId,
      });

      if (error) {
        console.error(`Failed to update calculations for subject ${subject}:`, error);
        continue;
      }

      calculationsTriggered++;
      calculationsUpdated++;
    }

    return { calculationsTriggered, calculationsUpdated };
  }

  // ============================================================================
  // STATISTICS AND ANALYTICS
  // ============================================================================

  /**
   * Get grade analytics for a class and subject
   */
  async getGradeAnalytics(
    classId: string,
    subjectId: string,
    semester?: number,
    academicYear?: string
  ): Promise<GradeStatistics> {
    const { data, error } = await this.supabase.rpc('get_class_grade_statistics', {
      p_class_id: classId,
      p_subject_id: subjectId,
      p_semester: semester,
      p_academic_year: academicYear,
      p_tenant_id: this.tenantId,
    });

    if (error) throw new Error(`Failed to get grade analytics: ${error.message}`);
    
    return {
      totalGrades: data?.total_count || 0,
      averageGrade: data?.average_grade || 0,
      highestGrade: data?.highest_grade || 0,
      lowestGrade: data?.lowest_grade || 0,
      medianGrade: data?.median_grade || 0,
      standardDeviation: 0, // Calculate from data if needed
      passingGrades: data?.passing_count || 0,
      passingPercentage: data?.passing_percentage || 0,
      gradeDistribution: {},
      letterGradeDistribution: {},
    };
  }

  /**
   * Get student grade statistics
   */
  async getStudentGradeStatistics(
    studentId: string,
    subjectId?: string,
    semester?: number,
    academicYear?: string
  ): Promise<GradeStatistics> {
    const grades = await this.getStudentGrades(studentId, {
      subjectId,
      semester,
      academicYear,
    });

    return this.calculateStatistics(grades);
  }

  /**
   * Get class grade statistics
   */
  async getClassGradeStatistics(
    classId: string,
    subjectId?: string,
    semester?: number,
    academicYear?: string
  ): Promise<GradeStatistics> {
    const grades = await this.getClassGrades(classId, subjectId, semester, academicYear);
    return this.calculateStatistics(grades);
  }

  /**
   * Get subject grade statistics
   */
  async getSubjectGradeStatistics(
    subjectId: string,
    classId?: string,
    semester?: number,
    academicYear?: string
  ): Promise<GradeStatistics> {
    const grades = await this.getSubjectGrades(subjectId, classId, semester, academicYear);
    return this.calculateStatistics(grades);
  }

  // ============================================================================
  // GRADE COMMENTS
  // ============================================================================

  /**
   * Add comment to grade
   */
  async addGradeComment(gradeId: string, comment: {
    commentText: string;
    commentType: GradeComment['commentType'];
    isVisibleToStudent: boolean;
    isVisibleToParent: boolean;
    teacherId: string;
  }): Promise<GradeComment> {
    const { data, error } = await this.supabase
      .from('grade_comments')
      .insert({
        tenant_id: this.tenantId,
        grade_id: gradeId,
        teacher_id: comment.teacherId,
        comment_text: comment.commentText,
        comment_type: comment.commentType,
        is_visible_to_student: comment.isVisibleToStudent,
        is_visible_to_parent: comment.isVisibleToParent,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to add grade comment: ${error.message}`);
    return this.transformGradeComment(data);
  }

  /**
   * Get comments for a grade
   */
  async getGradeComments(gradeId: string): Promise<GradeComment[]> {
    const { data, error } = await this.supabase
      .from('grade_comments')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('grade_id', gradeId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to get grade comments: ${error.message}`);
    return (data || []).map(comment => this.transformGradeComment(comment));
  }

  // ============================================================================
  // PERMISSION VERIFICATION
  // ============================================================================

  /**
   * Verify user has permission to grade students in a class and subject
   */
  async verifyGradingPermission(classId: string, subjectId: string, userId: string): Promise<boolean> {
    // Check if user is teacher for this class and subject
    const { data, error } = await this.supabase
      .from('class_subjects')
      .select('id')
      .eq('class_id', classId)
      .eq('subject_id', subjectId)
      .eq('teacher_id', userId)
      .eq('tenant_id', this.tenantId);

    if (error) return false;
    return (data || []).length > 0;
  }

  /**
   * Verify user has permission to view a grade
   */
  async verifyGradeViewPermission(gradeId: string, userId: string): Promise<boolean> {
    // Check if user is the teacher who assigned the grade or has admin role
    const { data, error } = await this.supabase
      .from('grades')
      .select('teacher_id')
      .eq('id', gradeId)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) return false;
    return data?.teacher_id === userId; // Add admin role check here
  }

  // ============================================================================
  // CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Update grade configurations
   */
  async updateGradeConfigurations(configurations: Omit<GradeConfiguration, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[]): Promise<GradeConfiguration[]> {
    const configRecords = configurations.map(config => ({
      tenant_id: this.tenantId,
      subject_id: config.subjectId,
      class_id: config.classId,
      grade_type: config.gradeType,
      weight: config.weight,
      min_grade: config.minGrade,
      max_grade: config.maxGrade,
      passing_grade: config.passingGrade,
      honor_roll_grade: config.honorRollGrade,
      is_required: config.isRequired,
      allows_makeup: config.allowsMakeup,
      semester: config.semester,
      academic_year: config.academicYear,
    }));

    const { data, error } = await this.supabase
      .from('grade_configurations')
      .upsert(configRecords, {
        onConflict: 'tenant_id,subject_id,class_id,grade_type,semester,academic_year',
      })
      .select();

    if (error) throw new Error(`Failed to update grade configurations: ${error.message}`);
    return (data || []).map(config => this.transformGradeConfiguration(config));
  }

  /**
   * Verify user has permission to update configurations
   */
  async verifyConfigurationUpdatePermission(userId: string): Promise<boolean> {
    // Check if user has admin or teacher role
    const { data, error } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) return false;
    return ['admin', 'teacher'].includes(data?.role);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get subjects for a student
   */
  private async getStudentSubjects(studentId: string, semester?: number, academicYear?: string): Promise<string[]> {
    let query = this.supabase
      .from('grades')
      .select('subject_id')
      .eq('tenant_id', this.tenantId)
      .eq('student_id', studentId);

    if (semester) query = query.eq('semester', semester);
    if (academicYear) query = query.eq('academic_year', academicYear);

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get student subjects: ${error.message}`);
    return [...new Set((data || []).map(item => item.subject_id))];
  }

  /**
   * Calculate statistics from grades array
   */
  private calculateStatistics(grades: Grade[]): GradeStatistics {
    if (grades.length === 0) {
      return {
        totalGrades: 0,
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        medianGrade: 0,
        standardDeviation: 0,
        passingGrades: 0,
        passingPercentage: 0,
        gradeDistribution: {},
        letterGradeDistribution: {},
      };
    }

    const percentages = grades.map(grade => grade.percentage);
    const sortedPercentages = percentages.sort((a, b) => a - b);
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const median = sortedPercentages[Math.floor(sortedPercentages.length / 2)];
    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / percentages.length;
    const standardDeviation = Math.sqrt(variance);

    const passingGrades = grades.filter(grade => grade.percentage >= 50).length;
    const passingPercentage = (passingGrades / grades.length) * 100;

    const letterGradeDistribution = grades.reduce((dist, grade) => {
      dist[grade.letterGrade] = (dist[grade.letterGrade] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalGrades: grades.length,
      averageGrade: average,
      highestGrade: Math.max(...percentages),
      lowestGrade: Math.min(...percentages),
      medianGrade: median,
      standardDeviation,
      passingGrades,
      passingPercentage,
      gradeDistribution: {},
      letterGradeDistribution,
    };
  }

  /**
   * Transform database grade record to Grade interface
   */
  private transformGrade(data: any): Grade {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      studentId: data.student_id,
      classId: data.class_id,
      subjectId: data.subject_id,
      teacherId: data.teacher_id,
      assignmentId: data.assignment_id,
      gradeType: data.grade_type,
      gradeValue: data.grade_value,
      maxGrade: data.max_grade,
      weight: data.weight,
      percentage: data.percentage,
      letterGrade: data.letter_grade,
      gpaPoints: data.gpa_points,
      examName: data.exam_name,
      description: data.description,
      semester: data.semester,
      academicYear: data.academic_year,
      gradeDate: new Date(data.grade_date),
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      // Joined fields
      studentName: data.students?.name,
      subjectName: data.subjects?.name,
      className: data.classes?.name,
      teacherName: data.users?.name,
    };
  }

  /**
   * Transform database grade calculation record
   */
  private transformGradeCalculation(data: any): GradeCalculation {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      studentId: data.student_id,
      subjectId: data.subject_id,
      classId: data.class_id,
      semester: data.semester,
      academicYear: data.academic_year,
      totalPoints: data.total_points,
      totalWeight: data.total_weight,
      weightedAverage: data.weighted_average,
      unweightedAverage: data.unweighted_average,
      finalPercentage: data.final_percentage,
      finalLetterGrade: data.final_letter_grade,
      gpaPoints: data.gpa_points,
      isPassing: data.is_passing,
      isHonorRoll: data.is_honor_roll,
      gradeCount: data.grade_count,
      lastCalculatedAt: new Date(data.last_calculated_at),
      calculationMethod: data.calculation_method,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Transform database grade configuration record
   */
  private transformGradeConfiguration(data: any): GradeConfiguration {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      subjectId: data.subject_id,
      classId: data.class_id,
      gradeType: data.grade_type,
      weight: data.weight,
      minGrade: data.min_grade,
      maxGrade: data.max_grade,
      passingGrade: data.passing_grade,
      honorRollGrade: data.honor_roll_grade,
      isRequired: data.is_required,
      allowsMakeup: data.allows_makeup,
      semester: data.semester,
      academicYear: data.academic_year,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Transform database grade comment record
   */
  private transformGradeComment(data: any): GradeComment {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      gradeId: data.grade_id,
      teacherId: data.teacher_id,
      commentText: data.comment_text,
      commentType: data.comment_type,
      isVisibleToStudent: data.is_visible_to_student,
      isVisibleToParent: data.is_visible_to_parent,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // ============================================================================
  // PLACEHOLDER METHODS FOR API COMPATIBILITY
  // ============================================================================

  // These methods are referenced by the API endpoints but need implementation
  // based on specific business requirements

  async verifyStudentAccess(studentId: string): Promise<boolean> {
    // TODO: Implement student access verification
    return true;
  }

  async verifyClassAccess(classId: string): Promise<boolean> {
    // TODO: Implement class access verification
    return true;
  }

  async getStudentInfo(studentId: string): Promise<any> {
    // TODO: Implement student info retrieval
    return { id: studentId, name: 'Student Name' };
  }

  async getClassInfo(classId: string): Promise<any> {
    // TODO: Implement class info retrieval
    return { id: classId, name: 'Class Name' };
  }

  async getSubjectInfo(subjectId: string): Promise<any> {
    // TODO: Implement subject info retrieval
    return { id: subjectId, name: 'Subject Name' };
  }

  // Additional placeholder methods for analytics API
  async getStudentGradeDistribution(studentId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getStudentClassRankings(studentId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getStudentSubjectComparisons(studentId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getClassGradeDistribution(classId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getClassTopPerformers(classId: string, subjectId?: string, semester?: number, academicYear?: string, limit?: number): Promise<any[]> {
    return [];
  }

  async getClassStrugglingStudents(classId: string, subjectId?: string, semester?: number, academicYear?: string, limit?: number): Promise<any[]> {
    return [];
  }

  async getClassSubjectBreakdown(classId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getSubjectGradeDistribution(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getSubjectGradeTypeBreakdown(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getSubjectClassComparisons(subjectId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getTeacherGradeStatistics(teacherId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getTeacherGradingPatterns(teacherId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getTeacherClassBreakdown(teacherId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getTeacherSubjectBreakdown(teacherId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getGradeTrends(timePeriod: string, options: any): Promise<any> {
    return {};
  }

  async getPerformanceTrends(timePeriod: string, options: any): Promise<any> {
    return {};
  }

  async getGradeDistribution(classId?: string, subjectId?: string, gradeType?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getLetterGradeDistribution(classId?: string, subjectId?: string, gradeType?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getPercentileRanges(classId?: string, subjectId?: string, gradeType?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getClassComparisons(semester?: number, academicYear?: string, subjectId?: string): Promise<any> {
    return {};
  }

  async getSubjectComparisons(classId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getHistoricalComparisons(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  // Report generation methods
  async getGradeSummary(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getDetailedGradeReport(classId?: string, subjectId?: string, studentId?: string, semester?: number, academicYear?: string, gradeTypes?: string[], includeComments?: boolean): Promise<any[]> {
    return [];
  }

  async getGradeBreakdown(classId?: string, subjectId?: string, studentId?: string, semester?: number, academicYear?: string, gradeTypes?: string[]): Promise<any> {
    return {};
  }

  async getClassStudentSummaries(classId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any[]> {
    return [];
  }

  async getStudentProgress(studentId: string, subjectId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    return {};
  }

  async getStudentGradeTrends(studentId: string, subjectId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    return {};
  }

  async getStudentAnalytics(studentId: string, subjectId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    return {};
  }

  async getClassOverallStatistics(classId: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getClassAnalytics(classId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getSubjectAnalytics(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getComparativeData(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any[]> {
    return [];
  }

  async getGradeBenchmarks(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getComparativeAnalytics(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  // Calculation methods
  async recalculateStudentGrades(studentId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<void> {
    // TODO: Implement student grade recalculation
  }

  async recalculateClassGrades(classId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<void> {
    // TODO: Implement class grade recalculation
  }

  async recalculateSubjectGrades(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<void> {
    // TODO: Implement subject grade recalculation
  }

  async recalculateBulkGrades(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<void> {
    // TODO: Implement bulk grade recalculation
  }

  async getStudentCalculationDetails(studentId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getClassCalculationDetails(classId: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getSubjectCalculationDetails(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getBulkCalculationDetails(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async getClassGradeCalculations(classId: string, semester?: number, academicYear?: string, subjectId?: string): Promise<GradeCalculation[]> {
    return [];
  }

  async getSubjectGradeCalculations(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<GradeCalculation[]> {
    return [];
  }

  async getBulkGradeCalculations(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<GradeCalculation[]> {
    return [];
  }

  async getBulkGradeStatistics(classId?: string, subjectId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }

  async triggerClassCalculations(classId: string, subjectId?: string, semester?: number, academicYear?: string, force?: boolean): Promise<any> {
    return {};
  }

  async triggerSubjectCalculations(subjectId: string, classId?: string, semester?: number, academicYear?: string, force?: boolean): Promise<any> {
    return {};
  }

  async triggerBulkCalculations(classId?: string, subjectId?: string, semester?: number, academicYear?: string, force?: boolean): Promise<any> {
    return {};
  }

  async triggerRecalculationForConfiguration(subjectId: string, classId?: string, semester?: number, academicYear?: string): Promise<any> {
    return {};
  }
}