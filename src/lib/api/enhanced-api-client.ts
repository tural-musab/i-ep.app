/**
 * Enhanced API Client with Professional Validation
 * Phase 6.1 - Data Validation Implementation
 * İ-EP.APP - Production-grade API client with comprehensive validation
 */

import { getSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  APIResponseValidator, 
  APIErrorHandler, 
  APIRetryHandler,
  ValidationError,
  ValidatedAPIResponse,
  APIErrorType,
  AssignmentListResponse,
  AssignmentStatistics,
  Assignment,
  Student,
  Teacher,
  Class,
  HealthCheckResponse
} from './validation';

export interface EnhancedAPIOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData;
  timeout?: number;
  retries?: number;
  validateResponse?: boolean;
}

export interface EnhancedAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: ValidationError;
  status: number;
  responseTime?: number;
  retryCount?: number;
}

/**
 * Professional Enhanced API Client
 */
export class EnhancedAPIClient {
  private static defaultTimeout = 10000; // 10 seconds
  private static defaultRetries = 2;

  /**
   * Core authenticated API request with comprehensive validation
   */
  static async request<T>(
    endpoint: string,
    options: EnhancedAPIOptions = {}
  ): Promise<EnhancedAPIResponse<T>> {
    const startTime = Date.now();
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      validateResponse = true
    } = options;

    console.log(`🚀 [ENHANCED API] Starting request: ${method} ${endpoint}`);

    try {
      // Authentication setup
      const authResult = await this.setupAuthentication();
      if (!authResult.success) {
        return {
          success: false,
          error: authResult.error,
          status: 401,
          responseTime: Date.now() - startTime
        };
      }

      // Prepare request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const requestHeaders = {
        'Content-Type': 'application/json',
        ...authResult.headers,
        ...headers
      };

      console.log(`🔧 [ENHANCED API] Headers prepared for: ${endpoint}`);

      // Execute request with retry logic
      const response = await APIRetryHandler.retry(async () => {
        const response = await fetch(endpoint, {
          method,
          headers: requestHeaders,
          body,
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return response;
      }, retries);

      const responseTime = Date.now() - startTime;
      console.log(`⚡ [ENHANCED API] Response received in ${responseTime}ms: ${response.status}`);

      // Handle HTTP errors
      if (!response.ok) {
        const errorType = APIErrorHandler.categorizeError(response.status);
        let errorMessage: string;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        const error: ValidationError = {
          type: errorType,
          message: errorMessage,
          code: response.status.toString()
        };

        APIErrorHandler.logError(error, endpoint);

        return {
          success: false,
          error,
          status: response.status,
          responseTime
        };
      }

      // Parse response data
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (parseError) {
        const error: ValidationError = {
          type: APIErrorType.VALIDATION_ERROR,
          message: 'Invalid JSON response from server',
          details: { parseError }
        };

        return {
          success: false,
          error,
          status: response.status,
          responseTime
        };
      }

      console.log(`✅ [ENHANCED API] Data parsed successfully for: ${endpoint}`);

      // Return raw response if validation is disabled
      if (!validateResponse) {
        return {
          success: true,
          data: responseData as T,
          status: response.status,
          responseTime
        };
      }

      // Validate response (implementation specific to endpoint)
      const validationResult = this.validateResponse(responseData, endpoint);

      return {
        success: validationResult.success,
        data: validationResult.success ? validationResult.data as T : undefined,
        error: validationResult.error,
        status: response.status,
        responseTime
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`💥 [ENHANCED API] Request failed for: ${endpoint}`, error);

      let apiError: ValidationError;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          apiError = {
            type: APIErrorType.TIMEOUT_ERROR,
            message: `Request timeout after ${timeout}ms`,
            details: { timeout, endpoint }
          };
        } else if (error.message.includes('fetch')) {
          apiError = {
            type: APIErrorType.NETWORK_ERROR,
            message: 'Network connection failed',
            details: { originalError: error.message }
          };
        } else {
          apiError = {
            type: APIErrorType.UNKNOWN_ERROR,
            message: error.message,
            details: { error }
          };
        }
      } else {
        apiError = {
          type: APIErrorType.UNKNOWN_ERROR,
          message: 'Unknown error occurred',
          details: { error }
        };
      }

      APIErrorHandler.logError(apiError, endpoint);

      return {
        success: false,
        error: apiError,
        status: 500,
        responseTime
      };
    }
  }

  /**
   * Setup authentication headers
   */
  private static async setupAuthentication(): Promise<{
    success: boolean;
    headers?: Record<string, string>;
    error?: ValidationError;
  }> {
    try {
      // Try NextAuth session first
      let session = await getSession();
      let authSource = 'NextAuth';

      // Fallback to Supabase session
      if (!session) {
        const supabase = createClientComponentClient();
        const { data: { session: supaSession } } = await supabase.auth.getSession();
        
        if (supaSession) {
          authSource = 'Supabase';
          session = {
            user: {
              id: supaSession.user.id,
              email: supaSession.user.email,
              name: supaSession.user.user_metadata?.name || supaSession.user.email,
              tenantId: supaSession.user.user_metadata?.tenant_id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          };
        }
      }

      if (!session) {
        return {
          success: false,
          error: {
            type: APIErrorType.AUTHENTICATION_ERROR,
            message: 'No active session found - please login'
          }
        };
      }

      const headers: Record<string, string> = {};

      // Add authentication headers
      if ((session as any).accessToken) {
        headers.Authorization = `Bearer ${(session as any).accessToken}`;
      }

      if (session.user?.email) {
        headers['X-User-Email'] = session.user.email;
      }

      if (session.user?.id) {
        headers['X-User-ID'] = session.user.id;
      }

      // Add tenant header
      const tenantId = (session.user as any)?.tenantId || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      headers['x-tenant-id'] = tenantId;

      console.log(`🔐 [AUTH] Authentication successful (${authSource}): ${session.user?.email}`);

      return {
        success: true,
        headers
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: APIErrorType.AUTHENTICATION_ERROR,
          message: 'Authentication setup failed',
          details: { error }
        }
      };
    }
  }

  /**
   * Validate API response based on endpoint
   */
  private static validateResponse(data: any, endpoint: string): ValidatedAPIResponse<any> {
    // Determine validation schema based on endpoint
    if (endpoint.includes('/assignments/statistics')) {
      return APIResponseValidator.validateAssignmentStatistics(data, endpoint);
    }
    
    if (endpoint.includes('/assignments') && !endpoint.includes('/')) {
      return APIResponseValidator.validateAssignmentList(data, endpoint);
    }
    
    if (endpoint.includes('/students')) {
      return APIResponseValidator.validateStudentList(data, endpoint);
    }
    
    if (endpoint.includes('/teachers')) {
      return APIResponseValidator.validateTeacherList(data, endpoint);
    }
    
    if (endpoint.includes('/classes')) {
      return APIResponseValidator.validateClassList(data, endpoint);
    }
    
    if (endpoint.includes('/health')) {
      return APIResponseValidator.validateHealthCheck(data, endpoint);
    }

    // Default: return data without validation
    console.warn(`⚠️ [VALIDATOR] No specific validation schema for: ${endpoint}`);
    return {
      success: true,
      data,
      status: 200
    };
  }

  /**
   * GET request with validation
   */
  static async get<T>(
    endpoint: string,
    options: Omit<EnhancedAPIOptions, 'method'> = {}
  ): Promise<EnhancedAPIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request with validation
   */
  static async post<T>(
    endpoint: string,
    data?: any,
    options: Omit<EnhancedAPIOptions, 'method' | 'body'> = {}
  ): Promise<EnhancedAPIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * PUT request with validation
   */
  static async put<T>(
    endpoint: string,
    data?: any,
    options: Omit<EnhancedAPIOptions, 'method' | 'body'> = {}
  ): Promise<EnhancedAPIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  /**
   * DELETE request with validation
   */
  static async delete<T>(
    endpoint: string,
    options: Omit<EnhancedAPIOptions, 'method'> = {}
  ): Promise<EnhancedAPIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Convenience methods for specific API endpoints
export class AssignmentAPIClient {
  static async getAssignments(params?: Record<string, any>): Promise<EnhancedAPIResponse<AssignmentListResponse>> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return EnhancedAPIClient.get<AssignmentListResponse>(`/api/assignments${queryString}`);
  }

  static async getAssignmentStatistics(): Promise<EnhancedAPIResponse<AssignmentStatistics>> {
    return EnhancedAPIClient.get<AssignmentStatistics>('/api/assignments/statistics');
  }

  static async getAssignment(id: string): Promise<EnhancedAPIResponse<Assignment>> {
    return EnhancedAPIClient.get<Assignment>(`/api/assignments/${id}`);
  }

  static async createAssignment(data: Partial<Assignment>): Promise<EnhancedAPIResponse<Assignment>> {
    return EnhancedAPIClient.post<Assignment>('/api/assignments', data);
  }
}

export class SystemAPIClient {
  static async getStudents(): Promise<EnhancedAPIResponse<{ data: Student[] }>> {
    return EnhancedAPIClient.get<{ data: Student[] }>('/api/students');
  }

  static async getTeachers(): Promise<EnhancedAPIResponse<{ data: Teacher[] }>> {
    return EnhancedAPIClient.get<{ data: Teacher[] }>('/api/teachers');
  }

  static async getClasses(): Promise<EnhancedAPIResponse<{ data: Class[] }>> {
    return EnhancedAPIClient.get<{ data: Class[] }>('/api/classes');
  }

  static async getHealthCheck(): Promise<EnhancedAPIResponse<HealthCheckResponse>> {
    return EnhancedAPIClient.get<HealthCheckResponse>('/api/health');
  }
}

// User-friendly error helper
export function getErrorMessage(error: ValidationError): string {
  return APIErrorHandler.createUserFriendlyMessage(error);
}