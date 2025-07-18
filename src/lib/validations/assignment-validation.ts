import { z } from 'zod';

export const assignmentValidation = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']),
  subject: z.string().min(1),
  class_id: z.string().min(1),
  teacher_id: z.string().min(1),
  tenant_id: z.string().min(1),
  due_date: z.string().min(1), // ISO string format
  max_score: z.number().min(0),
  is_graded: z.boolean(),
  status: z.enum(['draft', 'published', 'completed', 'archived']),
  instructions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type AssignmentValidation = z.infer<typeof assignmentValidation>;
