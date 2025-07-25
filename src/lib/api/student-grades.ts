/**
 * Student Grades API Client
 * İ-EP.APP - Student Grade Access System
 */

export interface StudentGradeData {
  student: {
    id: string;
    name: string;
    studentNumber: string;
    class: string;
    classId?: string;
    gradeLevel?: number;
  };
  currentSemester: string;
  subjects: SubjectGrade[];
  semesterStats: SemesterStats;
  analytics?: GradeAnalytics;
  history?: GradeHistory;
}

export interface SubjectGrade {
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  credits: number;
  grades: GradeEntry[];
  average: number;
  letterGrade: string;
  semester: string | number;
}

export interface GradeEntry {
  id: string;
  type: string;
  examName: string;
  score: number;
  rawScore: number;
  maxScore: number;
  date: string;
  grade: string;
  weight: number;
  description?: string;
}

export interface SemesterStats {
  totalSubjects: number;
  totalCredits: number;
  passedCredits: number;
  gpa: number;
  averageGrade: number;
  highestGrade: number;
  lowestGrade: number;
}

export interface GradeAnalytics {
  performanceTrend: 'up' | 'down' | 'stable';
  strongSubjects: Array<{ name: string; average: number }>;
  improvementAreas: Array<{ name: string; average: number }>;
  failingSubjects: Array<{ name: string; average: number }>;
  gradeDistribution: {
    AA: number;
    BA: number;
    BB: number;
    CB: number;
    CC: number;
    DC: number;
    DD: number;
    FF: number;
  };
}

export interface GradeHistory {
  previousSemesters: any[];
  overallGPA: number;
  totalCreditsEarned: number;
  academicStanding: string;
}

export interface StudentGradeQueryParams {
  semester?: number;
  academicYear?: string;
  subjectId?: string;
  gradeType?: 'exam' | 'homework' | 'project' | 'participation' | 'quiz' | 'midterm' | 'final';
  includeAnalytics?: boolean;
  includeHistory?: boolean;
}

/**
 * Fetch grades for a specific student
 */
export async function getStudentGrades(
  studentId: string,
  params: StudentGradeQueryParams = {}
): Promise<{ success: boolean; data?: StudentGradeData; error?: string }> {
  try {
    const searchParams = new URLSearchParams();
    
    // Add query parameters
    if (params.semester !== undefined) {
      searchParams.append('semester', params.semester.toString());
    }
    if (params.academicYear) {
      searchParams.append('academicYear', params.academicYear);
    }
    if (params.subjectId) {
      searchParams.append('subjectId', params.subjectId);
    }
    if (params.gradeType) {
      searchParams.append('gradeType', params.gradeType);
    }
    if (params.includeAnalytics !== undefined) {
      searchParams.append('includeAnalytics', params.includeAnalytics.toString());
    }
    if (params.includeHistory !== undefined) {
      searchParams.append('includeHistory', params.includeHistory.toString());
    }

    const url = `/api/grades/student/${studentId}?${searchParams.toString()}`;
    
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
      throw new Error(result.error || 'Failed to fetch student grades');
    }

    return {
      success: true,
      data: result.data,
    };

  } catch (error) {
    console.error('Error fetching student grades:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get current user's grades (for students)
 */
export async function getCurrentUserGrades(
  params: StudentGradeQueryParams = {}
): Promise<{ success: boolean; data?: StudentGradeData; error?: string }> {
  try {
    // First, get current user info to determine student ID
    const userResponse = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include',
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user information');
    }

    const userData = await userResponse.json();
    
    if (!userData.success || userData.data.role !== 'student') {
      throw new Error('User is not a student or not authenticated');
    }

    // Use the user ID as student ID for demo purposes
    // In production, you'd need to map user ID to student ID
    const studentId = userData.data.id;
    
    return await getStudentGrades(studentId, params);

  } catch (error) {
    console.error('Error fetching current user grades:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Calculate Turkish letter grade from percentage
 */
export function getTurkishGrade(percentage: number): {
  letter: string;
  point: number;
  description: string;
  color: string;
  bgColor: string;
} {
  const gradeMap = {
    'AA': { point: 4.0, description: 'Mükemmel', color: 'text-green-600', bgColor: 'bg-green-100' },
    'BA': { point: 3.5, description: 'Çok İyi', color: 'text-green-500', bgColor: 'bg-green-50' },
    'BB': { point: 3.0, description: 'İyi', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    'CB': { point: 2.5, description: 'Orta', color: 'text-blue-500', bgColor: 'bg-blue-50' },
    'CC': { point: 2.0, description: 'Geçer', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    'DC': { point: 1.5, description: 'Zayıf', color: 'text-orange-500', bgColor: 'bg-orange-50' },
    'DD': { point: 1.0, description: 'Çok Zayıf', color: 'text-red-500', bgColor: 'bg-red-50' },
    'FF': { point: 0.0, description: 'Başarısız', color: 'text-red-600', bgColor: 'bg-red-100' }
  };

  let letter: string;
  if (percentage >= 90) letter = 'AA';
  else if (percentage >= 85) letter = 'BA';
  else if (percentage >= 75) letter = 'BB';
  else if (percentage >= 70) letter = 'CB';
  else if (percentage >= 60) letter = 'CC';
  else if (percentage >= 55) letter = 'DC';
  else if (percentage >= 50) letter = 'DD';
  else letter = 'FF';

  return {
    letter,
    ...gradeMap[letter as keyof typeof gradeMap]
  };
}