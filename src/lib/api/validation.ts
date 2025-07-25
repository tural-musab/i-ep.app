/**
 * Professional API Response Validation Layer
 * Phase 6.1 - Data Validation Implementation
 * İ-EP.APP - Comprehensive validation and error handling
 */

import { z } from 'zod';

// Common validation schemas
export const BaseAPIResponseSchema = z.object({
  success: z.boolean().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    total: z.number(),
    page: z.number().optional(), 
    limit: z.number().optional(),
    totalPages: z.number().optional(),
    hasNextPage: z.boolean().optional(),
    hasPreviousPage: z.boolean().optional(),
  }).optional(),
});

// Assignment-specific validation schemas
export const AssignmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: z.enum(['homework', 'exam', 'project', 'quiz', 'presentation']),
  subject: z.string(),
  class_id: z.string(),
  teacher_id: z.string(),
  due_date: z.string(),
  max_score: z.number(),
  status: z.enum(['draft', 'published', 'completed', 'archived']),
  is_graded: z.boolean(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const AssignmentListResponseSchema = PaginatedResponseSchema.extend({
  data: z.array(AssignmentSchema),
});

export const AssignmentStatisticsSchema = z.object({
  totalAssignments: z.number(),
  activeAssignments: z.number(),
  completedAssignments: z.number(),
  pendingGrades: z.number(),
  completionRate: z.number(),
  averageGrade: z.number(),
  recentAssignments: z.array(z.object({
    id: z.string(),
    title: z.string(),
    subject: z.string(),
    due_date: z.string(),
    status: z.string(),
    submission_count: z.number(),
  })).optional(),
});

// System entities validation schemas
export const StudentSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  student_id: z.string().optional(),
  class_id: z.string().optional(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TeacherSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  subject: z.string().optional(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ClassSchema = z.object({
  id: z.string(),
  name: z.string(),
  grade: z.string(),
  section: z.string().optional(),
  capacity: z.number().optional(),
  current_enrollment: z.number().optional(),
  tenant_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// System response schemas
export const StudentListResponseSchema = z.object({
  data: z.array(StudentSchema),
});

export const TeacherListResponseSchema = z.object({
  data: z.array(TeacherSchema),
});

export const ClassListResponseSchema = z.object({
  data: z.array(ClassSchema),
});

export const HealthCheckResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  version: z.string().optional(),
  checks: z.record(z.string()).optional(),
});

// Error types for better error handling
export enum APIErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ValidationError {
  type: APIErrorType;
  message: string;
  field?: string;
  code?: string;
  details?: any;
}

export interface ValidatedAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: ValidationError;
  status: number;
  raw?: any;
}

/**
 * Professional API response validator
 */
export class APIResponseValidator {
  /**
   * Validate response against schema with detailed error handling
   */
  static validate<T>(
    response: any,
    schema: z.ZodSchema<T>,
    endpoint: string
  ): ValidatedAPIResponse<T> {
    try {
      console.log(`🔍 [VALIDATOR] Validating response for: ${endpoint}`);
      
      // Check if response exists
      if (!response) {
        return {
          success: false,
          error: {
            type: APIErrorType.VALIDATION_ERROR,
            message: 'No response data received',
            details: { endpoint }
          },
          status: 500
        };
      }

      // Store raw response for debugging
      const rawResponse = response;

      // Validate response structure
      const validationResult = schema.safeParse(response);

      if (validationResult.success) {
        console.log(`✅ [VALIDATOR] Response validation successful for: ${endpoint}`);
        return {
          success: true,
          data: validationResult.data,
          status: 200,
          raw: rawResponse
        };
      } else {
        console.error(`❌ [VALIDATOR] Response validation failed for: ${endpoint}`);
        console.error('Validation errors:', validationResult.error.errors);
        
        return {
          success: false,
          error: {
            type: APIErrorType.VALIDATION_ERROR,
            message: 'Response data structure validation failed',
            details: {
              endpoint,
              validationErrors: validationResult.error.errors,
              receivedData: rawResponse
            }
          },
          status: 422
        };
      }

    } catch (error) {
      console.error(`💥 [VALIDATOR] Validation process failed for: ${endpoint}`, error);
      
      return {
        success: false,
        error: {
          type: APIErrorType.UNKNOWN_ERROR,
          message: error instanceof Error ? error.message : 'Unknown validation error',
          details: { endpoint, error }
        },
        status: 500
      };
    }
  }

  /**
   * Validate assignment list response
   */
  static validateAssignmentList(response: any, endpoint: string) {
    return this.validate(response, AssignmentListResponseSchema, endpoint);
  }

  /**
   * Validate assignment statistics response
   */
  static validateAssignmentStatistics(response: any, endpoint: string) {
    return this.validate(response, AssignmentStatisticsSchema, endpoint);
  }

  /**
   * Validate single assignment response
   */
  static validateAssignment(response: any, endpoint: string) {
    return this.validate(response, AssignmentSchema, endpoint);
  }

  /**
   * Validate student list response
   */
  static validateStudentList(response: any, endpoint: string) {
    return this.validate(response, StudentListResponseSchema, endpoint);
  }

  /**
   * Validate teacher list response
   */
  static validateTeacherList(response: any, endpoint: string) {
    return this.validate(response, TeacherListResponseSchema, endpoint);
  }

  /**
   * Validate class list response 
   */
  static validateClassList(response: any, endpoint: string) {
    return this.validate(response, ClassListResponseSchema, endpoint);
  }

  /**
   * Validate health check response
   */
  static validateHealthCheck(response: any, endpoint: string) {
    return this.validate(response, HealthCheckResponseSchema, endpoint);
  }
}

/**
 * Enhanced error handler for API responses
 */
export class APIErrorHandler {
  /**
   * Categorize HTTP status codes
   */
  static categorizeError(status: number, response?: any): APIErrorType {
    if (status === 401 || status === 403) {
      return APIErrorType.AUTHENTICATION_ERROR;
    }
    
    if (status >= 400 && status < 500) {
      return APIErrorType.VALIDATION_ERROR;
    }
    
    if (status >= 500) {
      return APIErrorType.SERVER_ERROR;
    }
    
    return APIErrorType.UNKNOWN_ERROR;
  }

  /**
   * Create user-friendly error messages
   */
  static createUserFriendlyMessage(error: ValidationError): string {
    switch (error.type) {
      case APIErrorType.AUTHENTICATION_ERROR:
        return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      
      case APIErrorType.VALIDATION_ERROR:
        return 'Gönderilen veri formatı hatalı. Lütfen tekrar deneyin.';
      
      case APIErrorType.NETWORK_ERROR:
        return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
      
      case APIErrorType.SERVER_ERROR:
        return 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
      
      case APIErrorType.TIMEOUT_ERROR:
        return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
      
      default:
        return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  /**
   * Log errors for debugging
   */
  static logError(error: ValidationError, endpoint: string): void {
    console.group(`🚨 [API ERROR] ${endpoint}`);
    console.error('Error Type:', error.type);
    console.error('Message:', error.message);
    if (error.field) console.error('Field:', error.field);
    if (error.code) console.error('Code:', error.code);
    if (error.details) console.error('Details:', error.details);
    console.groupEnd();
  }
}

/**
 * Retry utility for failed API requests
 */
export class APIRetryHandler {
  /**
   * Retry failed requests with exponential backoff
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [RETRY] Attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown retry error');
        
        if (attempt === maxRetries) {
          console.error(`❌ [RETRY] All ${maxRetries} attempts failed`);
          throw lastError;
        }

        const backoffDelay = delay * Math.pow(2, attempt - 1);
        console.warn(`⏳ [RETRY] Attempt ${attempt} failed, retrying in ${backoffDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw lastError!;
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error: ValidationError): boolean {
    return [
      APIErrorType.NETWORK_ERROR,
      APIErrorType.TIMEOUT_ERROR,
      APIErrorType.SERVER_ERROR
    ].includes(error.type);
  }
}

// Export validation schemas for external use
export type Assignment = z.infer<typeof AssignmentSchema>;
export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;
export type AssignmentStatistics = z.infer<typeof AssignmentStatisticsSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Teacher = z.infer<typeof TeacherSchema>;
export type Class = z.infer<typeof ClassSchema>;
export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;