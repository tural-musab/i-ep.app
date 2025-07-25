/**
 * Assignment API Client
 * İ-EP.APP - Assignment Management System
 */

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  subject: string;
  subjectId: string;
  teacher: string;
  teacherId: string;
  dueDate: string;
  createdDate: string; 
  status: 'draft' | 'published' | 'closed';
  studentStatus?: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
  points: number;
  submissionStatus?: 'on_time' | 'late' | 'not_submitted';
  grade?: number;
  feedback?: string;
  attachments?: AssignmentAttachment[];
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
}

export interface AssignmentAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  attachments: string[];
  status: 'submitted' | 'graded' | 'returned' | 'late';
  submissionDate: string;
  score?: number;
  feedback?: string;
  metadata?: Record<string, any>;
}

export interface StudentAssignmentQueryParams {
  status?: 'active' | 'submitted' | 'graded' | 'overdue';
  subjectId?: string;
  limit?: number;
  offset?: number;
}

export interface AssignmentSubmissionData {
  student_id: string;
  content?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}

/**
 * Get assignments for current student
 */
export async function getStudentAssignments(
  params: StudentAssignmentQueryParams = {}
): Promise<{ success: boolean; data?: Assignment[]; error?: string }> {
  try {
    const searchParams = new URLSearchParams();
    
    // Add query parameters
    if (params.status) {
      searchParams.append('status', params.status);
    }
    if (params.subjectId) {
      searchParams.append('subjectId', params.subjectId);
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.offset) {
      searchParams.append('offset', params.offset.toString());
    }

    const url = `/api/assignments/student?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch assignments');
    }

    return {
      success: true,
      data: result.data,
    };

  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get specific assignment details
 */
export async function getAssignment(
  assignmentId: string
): Promise<{ success: boolean; data?: Assignment; error?: string }> {
  try {
    const response = await fetch(`/api/assignments/${assignmentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch assignment');
    }

    return {
      success: true,
      data: result.data,
    };

  } catch (error) {
    console.error('Error fetching assignment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Submit assignment
 */
export async function submitAssignment(
  assignmentId: string,
  submissionData: AssignmentSubmissionData
): Promise<{ success: boolean; data?: AssignmentSubmission; error?: string }> {
  try {
    const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit assignment');
    }

    return {
      success: true,
      data: result.data || result,
    };

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get assignment submissions for a specific assignment (for students - their own submission)
 */
export async function getAssignmentSubmissions(
  assignmentId: string
): Promise<{ success: boolean; data?: AssignmentSubmission[]; error?: string }> {
  try {
    const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch submissions');
    }

    return {
      success: true,
      data: result.data || result.submissions || [],
    };

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload file for assignment submission
 */
export async function uploadAssignmentFile(
  file: File,
  assignmentId: string
): Promise<{ success: boolean; data?: { url: string; filename: string }; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentId', assignmentId);

    const response = await fetch('/api/assignments/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload file');
    }

    return {
      success: true,
      data: result.data,
    };

  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}