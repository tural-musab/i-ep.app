/**
 * Assignment Data Validation Schemas
 * Phase 6.1: Frontend-Backend Integration
 * Zod schemas for API response validation
 */

import { z } from 'zod';

// Assignment Status enum
export const AssignmentStatusSchema = z.enum(['draft', 'published', 'completed', 'archived', 'active']);

// Assignment Type enum  
export const AssignmentTypeSchema = z.enum(['homework', 'project', 'exam', 'quiz', 'presentation']);

// Base Assignment Schema
export const AssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: AssignmentTypeSchema,
  subject: z.string().optional(),
  class_id: z.string().optional(),
  class_name: z.string().optional(),
  teacher_id: z.string().optional(),
  due_date: z.string(), // ISO date string
  max_score: z.number().optional(),
  instructions: z.string().optional(),
  status: AssignmentStatusSchema,
  is_graded: z.boolean().optional(),
  tenant_id: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  // Additional fields for dashboard display
  submissions_count: z.number().optional(),
  submission_count: z.number().optional(), // Alternative field name
  total_students: z.number().optional(),
  graded_count: z.number().optional(),
});

// Assignment Statistics Schema
export const AssignmentStatsSchema = z.object({
  totalAssignments: z.number(),
  activeAssignments: z.number(),
  completedAssignments: z.number(),
  pendingGrades: z.number(),
  averageScore: z.number().optional(),
  averageGrade: z.number().optional(), // Alternative field name
  completionRate: z.number(),
  gradedSubmissions: z.number().optional(),
  totalSubmissions: z.number().optional(),
  // Support for statistics API response
  recentAssignments: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subject: z.string(),
    due_date: z.string(),
    status: z.string(),
    submission_count: z.number()
  })).optional(),
});

// API Response Schemas
export const AssignmentListResponseSchema = z.object({
  data: z.array(AssignmentSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }).optional(),
});

export const AssignmentStatsResponseSchema = AssignmentStatsSchema;

// Dashboard Data Schemas for enhanced recent activities
export const RecentAssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: AssignmentTypeSchema,
  class: z.string(),
  dueDate: z.string(),
  submissions: z.number(),
  totalStudents: z.number(),
  graded: z.number(),
  status: AssignmentStatusSchema,
});

export const UpcomingDeadlineSchema = z.object({
  id: z.string(),
  title: z.string(),
  class: z.string(),
  dueDate: z.string(),
  daysLeft: z.number(),
});

export const AssignmentDashboardDataSchema = z.object({
  stats: z.object({
    totalAssignments: z.number(),
    activeAssignments: z.number(),
    pendingGrades: z.number(),
    completedAssignments: z.number(),
    averageScore: z.number(),
    completionRate: z.number(),
  }),
  recentAssignments: z.array(RecentAssignmentSchema),
  upcomingDeadlines: z.array(UpcomingDeadlineSchema),
});

// Export types
export type Assignment = z.infer<typeof AssignmentSchema>;
export type AssignmentStats = z.infer<typeof AssignmentStatsSchema>;
export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;
export type AssignmentStatsResponse = z.infer<typeof AssignmentStatsResponseSchema>;
export type RecentAssignment = z.infer<typeof RecentAssignmentSchema>;
export type UpcomingDeadline = z.infer<typeof UpcomingDeadlineSchema>;
export type AssignmentDashboardData = z.infer<typeof AssignmentDashboardDataSchema>;

// Validation helper functions
export const validateAssignmentListResponse = (data: unknown): AssignmentListResponse => {
  return AssignmentListResponseSchema.parse(data);
};

export const validateAssignmentStatsResponse = (data: unknown): AssignmentStatsResponse => {
  return AssignmentStatsResponseSchema.parse(data);
};

export const validateAssignmentDashboardData = (data: unknown): AssignmentDashboardData => {
  return AssignmentDashboardDataSchema.parse(data);
};

// Safe validation with error handling
export const safeValidateAssignmentStats = (data: unknown): {
  success: boolean;
  data?: AssignmentStats;
  error?: string;
} => {
  try {
    const validatedData = AssignmentStatsSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

export const safeValidateAssignmentList = (data: unknown): {
  success: boolean;
  data?: AssignmentListResponse;
  error?: string;
} => {
  try {
    const validatedData = AssignmentListResponseSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors.map(e => e.message).join(', ') };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};