import { Database } from './database.types'

export type Class = Database['public']['Tables']['classes']['Row']
export type ClassInsert = Database['public']['Tables']['classes']['Insert']
export type ClassUpdate = Database['public']['Tables']['classes']['Update']

export type ClassStudent = Database['public']['Tables']['class_students']['Row']
export type ClassStudentInsert = Database['public']['Tables']['class_students']['Insert']
export type ClassStudentUpdate = Database['public']['Tables']['class_students']['Update']

export type ClassTeacher = Database['public']['Tables']['class_teachers']['Row']
export type ClassTeacherInsert = Database['public']['Tables']['class_teachers']['Insert']
export type ClassTeacherUpdate = Database['public']['Tables']['class_teachers']['Update']

export type StudentStatus = 'active' | 'inactive' | 'transferred'
export type TeacherRole = 'homeroom_teacher' | 'subject_teacher'

export interface ClassWithDetails extends Class {
  student_count?: number
  teacher_count?: number
  class_students?: Array<{ count: number }>
  class_teachers?: Array<{
    count: number
    teacher: {
      id: string
      first_name: string
      last_name: string
    }
    role: string
  }>
  homeroom_teacher?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface ClassStudentWithDetails extends ClassStudent {
  student: {
    id: string
    first_name: string
    last_name: string
    number: string
  }
}

export interface ClassTeacherWithDetails extends ClassTeacher {
  teacher: {
    id: string
    first_name: string
    last_name: string
    subjects: string[]
  }
} 