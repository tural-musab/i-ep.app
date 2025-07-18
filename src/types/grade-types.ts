export enum GradeType {
  EXAM = 'EXAM',
  ASSIGNMENT = 'ASSIGNMENT',
  QUIZ = 'QUIZ',
  PROJECT = 'PROJECT',
  PARTICIPATION = 'PARTICIPATION',
  PRESENTATION = 'PRESENTATION',
  HOMEWORK = 'HOMEWORK',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
}

export enum GradeScale {
  AA = 'AA',
  BA = 'BA',
  BB = 'BB',
  CB = 'CB',
  CC = 'CC',
  DC = 'DC',
  DD = 'DD',
  FF = 'FF',
}

export interface Grade {
  id: string;
  student_id: string;
  class_id: string;
  assignment_id?: string;
  grade_type: GradeType;
  points_earned: number;
  points_possible: number;
  percentage: number;
  letter_grade: GradeScale;
  gpa_value: number;
  weight: number;
  comments?: string;
  tenant_id: string;
  graded_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface GradeStatistics {
  student_id: string;
  class_id: string;
  semester: string;
  total_assignments: number;
  completed_assignments: number;
  average_score: number;
  gpa: number;
  grade_distribution: Record<GradeScale, number>;
  trend: 'improving' | 'declining' | 'stable';
}

export interface GradeReport {
  id: string;
  type: GradeReportType;
  student_id?: string;
  class_id?: string;
  semester: string;
  academic_year: string;
  generated_at: Date;
  generated_by: string;
  data: any;
  tenant_id: string;
}

export enum GradeReportType {
  TRANSCRIPT = 'TRANSCRIPT',
  REPORT_CARD = 'REPORT_CARD',
  PROGRESS_REPORT = 'PROGRESS_REPORT',
  CLASS_SUMMARY = 'CLASS_SUMMARY',
  GRADE_ANALYSIS = 'GRADE_ANALYSIS',
  PARENT_REPORT = 'PARENT_REPORT',
  TEACHER_SUMMARY = 'TEACHER_SUMMARY',
}

export interface GradeComment {
  id: string;
  grade_id: string;
  comment: string;
  visible_to_student: boolean;
  visible_to_parent: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface GradeHistory {
  id: string;
  grade_id: string;
  previous_value: number;
  new_value: number;
  changed_by: string;
  changed_at: Date;
  reason?: string;
}

export interface GradeAnalytics {
  class_id: string;
  semester: string;
  total_students: number;
  average_grade: number;
  grade_distribution: Record<GradeScale, number>;
  top_performers: string[];
  struggling_students: string[];
  improvement_suggestions: string[];
}
