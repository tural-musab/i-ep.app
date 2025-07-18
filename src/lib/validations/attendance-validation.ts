import { z } from 'zod';

export const attendanceValidation = z.object({
  id: z.string().optional(),
  student_id: z.string().min(1),
  class_id: z.string().min(1),
  date: z.date(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  tenant_id: z.string().min(1),
  notes: z.string().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type AttendanceValidation = z.infer<typeof attendanceValidation>;
