/**
 * Assignment API Service
 * İ-EP.APP - Assignment Management API Integration
 * Phase 6.1 - Component-level API Integration
 */

import { apiClient, apiGet, apiPost, apiPut, apiDelete } from './api-client';

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: 'homework' | 'exam' | 'project' | 'quiz' | 'presentation';
  subject: string;
  class_id: string;
  teacher_id: string;
  due_date: string;
  max_score: number;
  instructions?: string;
  status: 'draft' | 'published' | 'completed' | 'archived';
  is_graded: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentStatistics {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  pendingGrades: number;
  completionRate: number;
  averageGrade: number;
  recentAssignments: Array<{
    id: string;
    title: string;
    subject: string;
    due_date: string;
    status: string;
    submission_count: number;
  }>;
}

export interface AssignmentListResponse {
  data: Assignment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface AssignmentFilters {
  page?: number;
  limit?: number;
  class_id?: string;
  teacher_id?: string;
  type?: Assignment['type'];
  status?: Assignment['status'];
  subject?: string;
  due_date_from?: string;
  due_date_to?: string;
  search?: string;
}

class AssignmentApiService {
  private apiBaseUrl = '/api';

  /**
   * Get all assignments with optional filtering
   */
  async getAssignments(filters: AssignmentFilters = {}): Promise<AssignmentListResponse> {
    try {
      console.log('🔧 Assignment API - Fetching assignments with filters:', filters);
      
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const apiResponse = await apiGet<AssignmentListResponse>(
        `${this.apiBaseUrl}/assignments${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }

      const response = apiResponse.data as AssignmentListResponse;

      console.log('✅ Assignment API - Successfully fetched assignments:', response);
      return response;
    } catch (error) {
      console.error('❌ Assignment API - Error fetching assignments:', error);
      throw error;
    }
  }

  /**
   * Get assignment statistics for dashboard
   */
  async getStatistics(): Promise<AssignmentStatistics> {
    try {
      console.log('🔧 Assignment API - Fetching statistics');
      
      const apiResponse = await apiGet<AssignmentStatistics>(`${this.apiBaseUrl}/assignments/statistics`);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }

      const response = apiResponse.data as AssignmentStatistics;
      
      console.log('✅ Assignment API - Successfully fetched statistics:', response);
      return response;
    } catch (error) {
      console.error('❌ Assignment API - Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Get single assignment by ID
   */
  async getAssignment(id: string): Promise<Assignment> {
    try {
      console.log('🔧 Assignment API - Fetching assignment:', id);
      
      const apiResponse = await apiGet<Assignment>(`${this.apiBaseUrl}/assignments/${id}`);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }

      const response = apiResponse.data as Assignment;
      
      console.log('✅ Assignment API - Successfully fetched assignment:', response);
      return response;
    } catch (error) {
      console.error('❌ Assignment API - Error fetching assignment:', error);
      throw error;
    }
  }

  /**
   * Create new assignment
   */
  async createAssignment(data: Omit<Assignment, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>): Promise<Assignment> {
    try {
      console.log('🔧 Assignment API - Creating assignment:', data);
      
      const apiResponse = await apiPost<Assignment>(`${this.apiBaseUrl}/assignments`, data);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }

      const response = apiResponse.data as Assignment;
      
      console.log('✅ Assignment API - Successfully created assignment:', response);
      return response;
    } catch (error) {
      console.error('❌ Assignment API - Error creating assignment:', error);
      throw error;
    }
  }

  /**
   * Update existing assignment
   */
  async updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    try {
      console.log('🔧 Assignment API - Updating assignment:', id, data);
      
      const apiResponse = await apiPut<Assignment>(`${this.apiBaseUrl}/assignments/${id}`, data);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }

      const response = apiResponse.data as Assignment;
      
      console.log('✅ Assignment API - Successfully updated assignment:', response);
      return response;
    } catch (error) {
      console.error('❌ Assignment API - Error updating assignment:', error);
      throw error;
    }
  }

  /**
   * Delete assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    try {
      console.log('🔧 Assignment API - Deleting assignment:', id);
      
      const apiResponse = await apiDelete(`${this.apiBaseUrl}/assignments/${id}`);
      
      if (apiResponse.error) {
        throw new Error(apiResponse.error);
      }
      
      console.log('✅ Assignment API - Successfully deleted assignment:', id);
    } catch (error) {
      console.error('❌ Assignment API - Error deleting assignment:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const assignmentApi = new AssignmentApiService();
export default assignmentApi;