export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  tenant_id: string;
  recorded_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface AttendanceRecord {
  id: string;
  attendance_id: string;
  check_in_time?: Date;
  check_out_time?: Date;
  location?: string;
  device_info?: string;
}

export interface AttendanceNotification {
  id: string;
  student_id: string;
  parent_id?: string;
  type: NotificationType;
  message: string;
  sent_at: Date;
  status: NotificationStatus;
  tenant_id: string;
}

export enum NotificationType {
  ABSENCE = 'ABSENCE',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  EARLY_DEPARTURE = 'EARLY_DEPARTURE',
  CONSECUTIVE_ABSENCES = 'CONSECUTIVE_ABSENCES',
  LOW_ATTENDANCE = 'LOW_ATTENDANCE',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  READ = 'READ',
}

export interface AttendanceStatistics {
  student_id: string;
  class_id: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_days: number;
  attendance_percentage: number;
  consecutive_absences: number;
  period_start: Date;
  period_end: Date;
}

export interface AttendanceReport {
  id: string;
  type: ReportType;
  class_id?: string;
  student_id?: string;
  period_start: Date;
  period_end: Date;
  generated_at: Date;
  generated_by: string;
  data: any;
  tenant_id: string;
}

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  STUDENT_SUMMARY = 'STUDENT_SUMMARY',
  CLASS_SUMMARY = 'CLASS_SUMMARY',
}
