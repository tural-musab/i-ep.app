/**
 * Grade Repository
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Yönetim Repository
 */

import { BaseRepository } from './base-repository';
import { SupabaseClient } from '@supabase/supabase-js';

export interface Grade {
  id: string;
  tenant_id: string;
  student_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  grade_type: 'exam' | 'homework' | 'project' | 'participation' | 'quiz';
  grade_value: number;
  max_grade: number;
  weight: number;
  grade_date: string;
  exam_name?: string;
  description?: string;
  semester: 1 | 2;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

export interface GradeCalculation {
  student_id: string;
  subject_id: string;
  semester: 1 | 2;
  academic_year: string;
  exam_average: number;
  homework_average: number;
  project_average: number;
  participation_average: number;
  quiz_average: number;
  weighted_average: number;
  letter_grade: string;
  gpa_points: number;
  total_grades: number;
}

export interface GradeStatistics {
  subject_id: string;
  class_id: string;
  grade_type: string;
  average: number;
  highest: number;
  lowest: number;
  median: number;
  std_deviation: number;
  total_students: number;
  grade_distribution: {
    'A': number;
    'B': number;
    'C': number;
    'D': number;
    'F': number;
  };
}

export interface StudentGradeReport {
  student_id: string;
  student_name: string;
  student_number: string;
  class_name: string;
  subjects: {
    subject_id: string;
    subject_name: string;
    teacher_name: string;
    grades: Grade[];
    average: number;
    letter_grade: string;
    gpa_points: number;
  }[];
  semester_gpa: number;
  academic_year: string;
  semester: 1 | 2;
}

export class GradeRepository extends BaseRepository<Grade> {
  constructor(supabase: SupabaseClient, tenantId: string) {
    super(supabase, 'grades', tenantId);
  }

  // Grade Entry Methods
  async createGrade(gradeData: Omit<Grade, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Grade> {
    const { data, error } = await this.supabase
      .from('grades')
      .insert({
        ...gradeData,
        tenant_id: this.tenantId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateGrade(id: string, updates: Partial<Grade>): Promise<Grade> {
    const { data, error } = await this.supabase
      .from('grades')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteGrade(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('grades')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId);

    if (error) throw error;
  }

  // Grade Retrieval Methods
  async getGradesByStudent(
    studentId: string,
    semester?: 1 | 2,
    academicYear?: string
  ): Promise<Grade[]> {
    let query = this.getBaseQuery()
      .eq('student_id', studentId)
      .order('grade_date', { ascending: false });

    if (semester) {
      query = query.eq('semester', semester);
    }

    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getGradesByClass(
    classId: string,
    subjectId?: string,
    semester?: 1 | 2
  ): Promise<Grade[]> {
    let query = this.getBaseQuery()
      .eq('class_id', classId)
      .order('grade_date', { ascending: false });

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    if (semester) {
      query = query.eq('semester', semester);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getGradesBySubject(
    subjectId: string,
    classId?: string,
    gradeType?: Grade['grade_type']
  ): Promise<Grade[]> {
    let query = this.getBaseQuery()
      .eq('subject_id', subjectId)
      .order('grade_date', { ascending: false });

    if (classId) {
      query = query.eq('class_id', classId);
    }

    if (gradeType) {
      query = query.eq('grade_type', gradeType);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getGradesByTeacher(
    teacherId: string,
    classId?: string,
    subjectId?: string
  ): Promise<Grade[]> {
    let query = this.getBaseQuery()
      .eq('teacher_id', teacherId)
      .order('grade_date', { ascending: false });

    if (classId) {
      query = query.eq('class_id', classId);
    }

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Grade Calculation Methods
  async calculateStudentGrades(
    studentId: string,
    subjectId: string,
    semester: 1 | 2,
    academicYear: string
  ): Promise<GradeCalculation> {
    const grades = await this.getGradesByStudent(studentId, semester, academicYear);
    const subjectGrades = grades.filter(g => g.subject_id === subjectId);

    const gradesByType = {
      exam: subjectGrades.filter(g => g.grade_type === 'exam'),
      homework: subjectGrades.filter(g => g.grade_type === 'homework'),
      project: subjectGrades.filter(g => g.grade_type === 'project'),
      participation: subjectGrades.filter(g => g.grade_type === 'participation'),
      quiz: subjectGrades.filter(g => g.grade_type === 'quiz')
    };

    const calculateAverage = (gradeList: Grade[]) => {
      if (gradeList.length === 0) return 0;
      const total = gradeList.reduce((sum, grade) => sum + (grade.grade_value / grade.max_grade) * 100, 0);
      return total / gradeList.length;
    };

    const exam_average = calculateAverage(gradesByType.exam);
    const homework_average = calculateAverage(gradesByType.homework);
    const project_average = calculateAverage(gradesByType.project);
    const participation_average = calculateAverage(gradesByType.participation);
    const quiz_average = calculateAverage(gradesByType.quiz);

    // Weighted average calculation (configurable weights)
    const weights = {
      exam: 0.4,
      homework: 0.2,
      project: 0.2,
      participation: 0.1,
      quiz: 0.1
    };

    const weighted_average = 
      (exam_average * weights.exam) +
      (homework_average * weights.homework) +
      (project_average * weights.project) +
      (participation_average * weights.participation) +
      (quiz_average * weights.quiz);

    const letter_grade = this.calculateLetterGrade(weighted_average);
    const gpa_points = this.calculateGPAPoints(letter_grade);

    return {
      student_id: studentId,
      subject_id: subjectId,
      semester,
      academic_year: academicYear,
      exam_average,
      homework_average,
      project_average,
      participation_average,
      quiz_average,
      weighted_average,
      letter_grade,
      gpa_points,
      total_grades: subjectGrades.length
    };
  }

  async calculateClassStatistics(
    classId: string,
    subjectId: string,
    gradeType: Grade['grade_type']
  ): Promise<GradeStatistics> {
    const grades = await this.getGradesByClass(classId, subjectId);
    const filteredGrades = grades.filter(g => g.grade_type === gradeType);

    if (filteredGrades.length === 0) {
      return {
        subject_id: subjectId,
        class_id: classId,
        grade_type: gradeType,
        average: 0,
        highest: 0,
        lowest: 0,
        median: 0,
        std_deviation: 0,
        total_students: 0,
        grade_distribution: { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 }
      };
    }

    const percentages = filteredGrades.map(g => (g.grade_value / g.max_grade) * 100);
    const sortedPercentages = percentages.sort((a, b) => a - b);

    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);
    const median = sortedPercentages[Math.floor(sortedPercentages.length / 2)];

    // Standard deviation calculation
    const variance = percentages.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / percentages.length;
    const std_deviation = Math.sqrt(variance);

    // Grade distribution
    const grade_distribution = percentages.reduce((dist, p) => {
      const letterGrade = this.calculateLetterGrade(p);
      dist[letterGrade as keyof typeof dist]++;
      return dist;
    }, { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 });

    return {
      subject_id: subjectId,
      class_id: classId,
      grade_type: gradeType,
      average,
      highest,
      lowest,
      median,
      std_deviation,
      total_students: filteredGrades.length,
      grade_distribution
    };
  }

  // Bulk Grade Operations
  async createBulkGrades(grades: Omit<Grade, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>[]): Promise<Grade[]> {
    const gradesWithMetadata = grades.map(grade => ({
      ...grade,
      tenant_id: this.tenantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await this.supabase
      .from('grades')
      .insert(gradesWithMetadata)
      .select();

    if (error) throw error;
    return data || [];
  }

  async updateBulkGrades(updates: { id: string; updates: Partial<Grade> }[]): Promise<Grade[]> {
    const results: Grade[] = [];

    for (const { id, updates: gradeUpdates } of updates) {
      const updated = await this.updateGrade(id, gradeUpdates);
      results.push(updated);
    }

    return results;
  }

  // Grade Report Methods
  async generateStudentGradeReport(
    studentId: string,
    semester: 1 | 2,
    academicYear: string
  ): Promise<StudentGradeReport> {
    // This would be implemented with proper joins in a real application
    const grades = await this.getGradesByStudent(studentId, semester, academicYear);
    
    // Mock implementation - in real app, this would join with students, subjects, teachers tables
    const student = {
      id: studentId,
      name: 'Mock Student',
      number: '2025001',
      class_name: 'Mock Class'
    };

    const subjectGroups = grades.reduce((acc, grade) => {
      if (!acc[grade.subject_id]) {
        acc[grade.subject_id] = [];
      }
      acc[grade.subject_id].push(grade);
      return acc;
    }, {} as Record<string, Grade[]>);

    const subjects = await Promise.all(
      Object.entries(subjectGroups).map(async ([subjectId, subjectGrades]) => {
        const calculation = await this.calculateStudentGrades(studentId, subjectId, semester, academicYear);
        
        return {
          subject_id: subjectId,
          subject_name: 'Mock Subject',
          teacher_name: 'Mock Teacher',
          grades: subjectGrades,
          average: calculation.weighted_average,
          letter_grade: calculation.letter_grade,
          gpa_points: calculation.gpa_points
        };
      })
    );

    const semester_gpa = subjects.reduce((sum, subject) => sum + subject.gpa_points, 0) / subjects.length;

    return {
      student_id: studentId,
      student_name: student.name,
      student_number: student.number,
      class_name: student.class_name,
      subjects,
      semester_gpa,
      academic_year: academicYear,
      semester
    };
  }

  // Grade Configuration Methods
  async getGradeWeights(subjectId: string): Promise<Record<Grade['grade_type'], number>> {
    // In a real application, this would be stored in database
    return {
      exam: 0.4,
      homework: 0.2,
      project: 0.2,
      participation: 0.1,
      quiz: 0.1
    };
  }

  async updateGradeWeights(subjectId: string, weights: Record<Grade['grade_type'], number>): Promise<void> {
    // This would update the grade weights configuration
    console.log('Updating grade weights for subject:', subjectId, weights);
  }

  // Helper Methods
  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  private calculateGPAPoints(letterGrade: string): number {
    const gpaMap = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    };
    return gpaMap[letterGrade as keyof typeof gpaMap] || 0.0;
  }

  // Analytics Methods
  async getGradeTrends(
    studentId: string,
    subjectId: string,
    academicYear: string
  ): Promise<{ date: string; average: number }[]> {
    const grades = await this.getGradesByStudent(studentId);
    const subjectGrades = grades.filter(g => g.subject_id === subjectId && g.academic_year === academicYear);

    // Group by month and calculate monthly averages
    const monthlyGrades = subjectGrades.reduce((acc, grade) => {
      const month = grade.grade_date.substring(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push((grade.grade_value / grade.max_grade) * 100);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(monthlyGrades).map(([month, percentages]) => ({
      date: month,
      average: percentages.reduce((sum, p) => sum + p, 0) / percentages.length
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getSubjectPerformance(classId: string, academicYear: string): Promise<{
    subject_id: string;
    subject_name: string;
    class_average: number;
    passing_rate: number;
    total_students: number;
  }[]> {
    const grades = await this.getGradesByClass(classId);
    const yearGrades = grades.filter(g => g.academic_year === academicYear);

    const subjectGroups = yearGrades.reduce((acc, grade) => {
      if (!acc[grade.subject_id]) {
        acc[grade.subject_id] = [];
      }
      acc[grade.subject_id].push(grade);
      return acc;
    }, {} as Record<string, Grade[]>);

    return Object.entries(subjectGroups).map(([subjectId, subjectGrades]) => {
      const studentAverages = subjectGrades.reduce((acc, grade) => {
        if (!acc[grade.student_id]) {
          acc[grade.student_id] = [];
        }
        acc[grade.student_id].push((grade.grade_value / grade.max_grade) * 100);
        return acc;
      }, {} as Record<string, number[]>);

      const averages = Object.values(studentAverages).map(grades => 
        grades.reduce((sum, g) => sum + g, 0) / grades.length
      );

      const class_average = averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
      const passing_students = averages.filter(avg => avg >= 60).length;
      const passing_rate = (passing_students / averages.length) * 100;

      return {
        subject_id: subjectId,
        subject_name: 'Mock Subject', // In real app, this would come from subjects table
        class_average,
        passing_rate,
        total_students: averages.length
      };
    });
  }
}