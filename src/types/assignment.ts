export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  EXAM = 'EXAM',
  QUIZ = 'QUIZ',
  PROJECT = 'PROJECT',
  PRESENTATION = 'PRESENTATION',
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  status: AssignmentStatus;
  due_date: Date;
  points: number;
  tenant_id: string;
  teacher_id: string;
  class_id: string;
  created_at: Date;
  updated_at: Date;
  instructions?: string;
  attachments?: AssignmentAttachment[];
}

export interface AssignmentAttachment {
  id: string;
  assignment_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: Date;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: SubmissionStatus;
  submitted_at?: Date;
  grade?: number;
  feedback?: string;
  attachments?: SubmissionAttachment[];
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  RETURNED = 'RETURNED',
}

export interface SubmissionAttachment {
  id: string;
  submission_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_at: Date;
}
