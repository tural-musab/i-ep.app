/**
 * Attendance Repository Implementation
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Devamsızlık Yönetimi
 */

import { BaseRepository, BaseEntity, QueryOptions, QueryResult } from './base-repository';

export interface AttendanceRecord extends BaseEntity {
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'sick';
  time_in?: string;
  time_out?: string;
  notes?: string;
  marked_by: string;
  marked_at: string;
  parent_notified: boolean;
  notification_sent_at?: string;
  excuse_reason?: string;
  excuse_document?: string;
  metadata?: Record<string, any>;
}

export interface AttendanceWithRelations extends AttendanceRecord {
  student?: {
    id: string;
    student_number: string;
    first_name: string;
    last_name: string;
    parent_phone?: string;
    parent_email?: string;
  };
  class?: {
    id: string;
    name: string;
    grade: string;
    section: string;
  };
  marked_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  sickDays: number;
  attendanceRate: number;
  punctualityRate: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface DailyAttendanceSummary {
  date: string;
  class_id: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  sick_count: number;
  attendance_rate: number;
  marked_by: string;
  marked_at: string;
}

export class AttendanceRepository extends BaseRepository<AttendanceRecord> {
  constructor(tenantId: string) {
    super('attendance_records', tenantId);
  }

  /**
   * Find attendance records by student ID
   */
  async findByStudentId(studentId: string, options: QueryOptions = {}): Promise<QueryResult<AttendanceRecord>> {
    return this.findAll({
      ...options,
      filters: { student_id: studentId }
    });
  }

  /**
   * Find attendance records by class ID
   */
  async findByClassId(classId: string, options: QueryOptions = {}): Promise<QueryResult<AttendanceRecord>> {
    return this.findAll({
      ...options,
      filters: { class_id: classId }
    });
  }

  /**
   * Find attendance records by date
   */
  async findByDate(date: string, options: QueryOptions = {}): Promise<QueryResult<AttendanceRecord>> {
    return this.findAll({
      ...options,
      filters: { date }
    });
  }

  /**
   * Find attendance records by date range
   */
  async findByDateRange(startDate: string, endDate: string, options: QueryOptions = {}): Promise<QueryResult<AttendanceRecord>> {
    const {
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'desc',
      filters = {}
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .gte('date', startDate)
      .lte('date', endDate)
      .match(filters)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as AttendanceRecord[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Find attendance record by student and date
   */
  async findByStudentAndDate(studentId: string, date: string): Promise<AttendanceRecord | null> {
    const { data, error } = await this.getBaseQuery()
      .eq('student_id', studentId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as AttendanceRecord;
  }

  /**
   * Find attendance with relations
   */
  async findWithRelations(id: string): Promise<AttendanceWithRelations | null> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .select(`
        *,
        student:students!student_id (
          id,
          student_number,
          first_name,
          last_name,
          parent_phone,
          parent_email
        ),
        class:classes!class_id (
          id,
          name,
          grade,
          section
        ),
        marked_by_user:users!marked_by (
          id,
          name,
          email
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

    return data as AttendanceWithRelations;
  }

  /**
   * Mark attendance for a student
   */
  async markAttendance(
    studentId: string,
    classId: string,
    date: string,
    status: AttendanceRecord['status'],
    markedBy: string,
    notes?: string
  ): Promise<AttendanceRecord> {
    // Check if attendance already exists
    const existing = await this.findByStudentAndDate(studentId, date);
    
    if (existing) {
      // Update existing record
      return await this.update(existing.id, {
        status,
        notes,
        marked_by: markedBy,
        marked_at: new Date().toISOString()
      }) as AttendanceRecord;
    } else {
      // Create new record
      return await this.create({
        student_id: studentId,
        class_id: classId,
        date,
        status,
        notes,
        marked_by: markedBy,
        marked_at: new Date().toISOString(),
        parent_notified: false
      });
    }
  }

  /**
   * Bulk mark attendance for multiple students
   */
  async bulkMarkAttendance(
    attendanceRecords: {
      studentId: string;
      classId: string;
      date: string;
      status: AttendanceRecord['status'];
      notes?: string;
    }[],
    markedBy: string
  ): Promise<AttendanceRecord[]> {
    const results: AttendanceRecord[] = [];
    
    for (const record of attendanceRecords) {
      const result = await this.markAttendance(
        record.studentId,
        record.classId,
        record.date,
        record.status,
        markedBy,
        record.notes
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get attendance statistics for a student
   */
  async getStudentAttendanceStats(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AttendanceStats> {
    const { data, error } = await this.supabase.rpc('get_student_attendance_stats', {
      student_id: studentId,
      start_date: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: endDate || new Date().toISOString().split('T')[0],
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      excusedDays: 0,
      sickDays: 0,
      attendanceRate: 0,
      punctualityRate: 0,
      trend: 'stable'
    };
  }

  /**
   * Get class attendance summary for a date
   */
  async getClassAttendanceSummary(classId: string, date: string): Promise<DailyAttendanceSummary> {
    const { data, error } = await this.supabase.rpc('get_class_attendance_summary', {
      class_id: classId,
      attendance_date: date,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      date,
      class_id: classId,
      total_students: 0,
      present_count: 0,
      absent_count: 0,
      late_count: 0,
      excused_count: 0,
      sick_count: 0,
      attendance_rate: 0,
      marked_by: '',
      marked_at: ''
    };
  }

  /**
   * Get attendance report for date range
   */
  async getAttendanceReport(
    classId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    summary: DailyAttendanceSummary[];
    studentStats: {
      student_id: string;
      student_name: string;
      student_number: string;
      stats: AttendanceStats;
    }[];
  }> {
    const { data, error } = await this.supabase.rpc('get_attendance_report', {
      class_id: classId,
      start_date: startDate,
      end_date: endDate,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      summary: [],
      studentStats: []
    };
  }

  /**
   * Mark parent as notified
   */
  async markParentNotified(attendanceId: string): Promise<AttendanceRecord | null> {
    return this.update(attendanceId, {
      parent_notified: true,
      notification_sent_at: new Date().toISOString()
    });
  }

  /**
   * Get absent students for notification
   */
  async getAbsentStudentsForNotification(date: string): Promise<AttendanceWithRelations[]> {
    const { data, error } = await this.supabase
      .from('attendance_records')
      .select(`
        *,
        student:students!student_id (
          id,
          student_number,
          first_name,
          last_name,
          parent_phone,
          parent_email
        ),
        class:classes!class_id (
          id,
          name,
          grade,
          section
        )
      `)
      .eq('date', date)
      .eq('tenant_id', this.tenantId)
      .in('status', ['absent', 'late'])
      .eq('parent_notified', false);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as AttendanceWithRelations[];
  }

  /**
   * Update attendance status
   */
  async updateAttendanceStatus(
    attendanceId: string,
    status: AttendanceRecord['status'],
    notes?: string
  ): Promise<AttendanceRecord | null> {
    return this.update(attendanceId, {
      status,
      notes,
      marked_at: new Date().toISOString()
    });
  }

  /**
   * Add excuse for absence
   */
  async addExcuse(
    attendanceId: string,
    excuseReason: string,
    excuseDocument?: string
  ): Promise<AttendanceRecord | null> {
    return this.update(attendanceId, {
      status: 'excused',
      excuse_reason: excuseReason,
      excuse_document: excuseDocument,
      marked_at: new Date().toISOString()
    });
  }

  /**
   * Get attendance trends
   */
  async getAttendanceTrends(
    classId: string,
    period: 'week' | 'month' | 'term'
  ): Promise<{
    dates: string[];
    attendance_rates: number[];
    absent_counts: number[];
    late_counts: number[];
  }> {
    const { data, error } = await this.supabase.rpc('get_attendance_trends', {
      class_id: classId,
      period,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      dates: [],
      attendance_rates: [],
      absent_counts: [],
      late_counts: []
    };
  }

  /**
   * Get chronic absentees
   */
  async getChronicAbsentees(
    classId: string,
    threshold: number = 20 // percentage
  ): Promise<{
    student_id: string;
    student_name: string;
    student_number: string;
    absence_rate: number;
    total_absences: number;
    consecutive_absences: number;
  }[]> {
    const { data, error } = await this.supabase.rpc('get_chronic_absentees', {
      class_id: classId,
      absence_threshold: threshold,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get perfect attendance students
   */
  async getPerfectAttendanceStudents(
    classId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    student_id: string;
    student_name: string;
    student_number: string;
    attendance_rate: number;
  }[]> {
    const { data, error } = await this.supabase.rpc('get_perfect_attendance_students', {
      class_id: classId,
      start_date: startDate,
      end_date: endDate,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || [];
  }
}