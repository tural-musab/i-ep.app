import { z } from 'zod';
import { GradeScale, GradeType } from '@/types/grades';

export const gradeValidation = z.object({
  id: z.string().optional(),
  student_id: z.string().min(1),
  class_id: z.string().min(1),
  assignment_id: z.string().min(1),
  grade_type: z.nativeEnum(GradeType),
  points_earned: z.number().min(0),
  points_possible: z.number().min(1),
  percentage: z.number().min(0).max(100),
  letter_grade: z.nativeEnum(GradeScale),
  gpa_value: z.number().min(0).max(4),
  weight: z.number().min(0).max(1),
  comments: z.string().optional(),
  tenant_id: z.string().min(1),
  graded_by: z.string().min(1),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type GradeValidation = z.infer<typeof gradeValidation>;
