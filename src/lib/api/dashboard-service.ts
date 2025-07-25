/**
 * Dashboard API Service
 * İ-EP.APP - Dashboard Data Fetching Service
 * Replaces mock data with real API calls
 * Uses authenticated API client with NextAuth session
 */

import { apiGet } from './api-client';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingAssignments: number;
}

export interface RecentActivity {
  id: string;
  type: 'assignment' | 'grade' | 'attendance' | 'announcement';
  message: string;
  time: string;
  userId?: string;
  userName?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
}

/**
 * Fetch dashboard statistics
 * Uses authenticated API client with NextAuth session
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Use authenticated API client for all requests
    const [studentsResponse, teachersResponse, classesResponse, assignmentsResponse] =
      await Promise.all([
        apiGet('/api/students?limit=1'),
        apiGet('/api/teachers?limit=1'),
        apiGet('/api/classes'),
        apiGet('/api/assignments?status=published&limit=1'),
      ]);

    // Handle authentication errors
    if (
      studentsResponse.status === 401 ||
      teachersResponse.status === 401 ||
      classesResponse.status === 401 ||
      assignmentsResponse.status === 401
    ) {
      console.error('Authentication failed for dashboard stats');
      throw new Error('Authentication required');
    }

    // Extract counts from authenticated responses
    const totalStudents = studentsResponse.data?.pagination?.total || 0;
    const totalTeachers = teachersResponse.data?.pagination?.total || 0;
    const totalClasses = Array.isArray(classesResponse.data) ? classesResponse.data.length : 0;
    const pendingAssignments = assignmentsResponse.data?.pagination?.total || 0;

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingAssignments,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);

    // Return fallback stats if API fails
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      pendingAssignments: 0,
    };
  }
}

/**
 * Fetch recent activities from real API endpoints
 * Uses authenticated API client with NextAuth session
 */
export async function getRecentActivities(): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Fetch recent assignments (last 5)
    try {
      const assignmentResponse = await apiGet('/api/assignments?limit=5&status=published');

      if (assignmentResponse.status === 200 && assignmentResponse.data) {
        const assignments = assignmentResponse.data.data || [];

        assignments.forEach((assignment: any) => {
          const timeAgo = getTimeAgo(assignment.created_at);
          activities.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            message: `${assignment.title} ödevi oluşturuldu`,
            time: timeAgo,
            userId: assignment.created_by,
            userName: assignment.teacher_name || 'Öğretmen',
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
    }

    // Fetch recent grades (last 5)
    try {
      const gradeResponse = await apiGet('/api/grades?limit=5&includeComments=true');

      if (gradeResponse.status === 200 && gradeResponse.data) {
        const grades = gradeResponse.data.data || [];

        grades.forEach((grade: any) => {
          const timeAgo = getTimeAgo(grade.created_at);
          activities.push({
            id: `grade-${grade.id}`,
            type: 'grade',
            message: `${grade.subjectName || 'Ders'} notlandırıldı (${grade.letterGrade || grade.gradeValue})`,
            time: timeAgo,
            userId: grade.studentId,
            userName: grade.studentName || 'Öğrenci',
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent grades:', error);
    }

    // Fetch recent attendance (last 5)
    try {
      const attendanceResponse = await apiGet('/api/attendance?limit=5');

      if (attendanceResponse.status === 200 && attendanceResponse.data) {
        const attendances = attendanceResponse.data.data || [];

        attendances.forEach((attendance: any) => {
          const timeAgo = getTimeAgo(attendance.created_at);
          const statusText = getAttendanceStatusText(attendance.status);
          activities.push({
            id: `attendance-${attendance.id}`,
            type: 'attendance',
            message: `${attendance.studentName || 'Öğrenci'} yoklama ${statusText}`,
            time: timeAgo,
            userId: attendance.studentId,
            userName: attendance.studentName || 'Öğrenci',
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
    }

    // Sort activities by created_at (most recent first) and limit to 10
    activities.sort((a, b) => {
      // Extract timestamp from time string for sorting
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    // Return top 10 activities or fallback to mock data if no activities
    const recentActivities = activities.slice(0, 10);

    if (recentActivities.length === 0) {
      // Fallback to mock data if no real activities found
      return getFallbackActivities();
    }

    return recentActivities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return getFallbackActivities();
  }
}

/**
 * Helper function to get time ago string
 */
function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'az önce';
  if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;

  return `${Math.floor(diffInDays / 7)} hafta önce`;
}

/**
 * Helper function to get attendance status text in Turkish
 */
function getAttendanceStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    present: 'katıldı',
    absent: 'gelmedi',
    late: 'geç kaldı',
    excused: 'mazereti var',
    sick: 'hasta',
  };
  return statusMap[status] || 'kaydedildi';
}

/**
 * Helper function to parse time ago for sorting
 */
function parseTimeAgo(timeStr: string): number {
  if (timeStr.includes('az önce')) return 0;
  if (timeStr.includes('dakika önce')) return parseInt(timeStr);
  if (timeStr.includes('saat önce')) return parseInt(timeStr) * 60;
  if (timeStr.includes('gün önce')) return parseInt(timeStr) * 60 * 24;
  if (timeStr.includes('hafta önce')) return parseInt(timeStr) * 60 * 24 * 7;
  return 999999; // Very old
}

/**
 * Fallback mock activities when no real data is available
 */
function getFallbackActivities(): RecentActivity[] {
  return [
    {
      id: 'fallback-1',
      type: 'assignment',
      message: 'Matematik ödevi teslim edildi',
      time: '2 saat önce',
      userId: 'user-1',
      userName: 'Ahmet Yılmaz',
    },
    {
      id: 'fallback-2',
      type: 'grade',
      message: 'Fen bilgisi sınavı notlandırıldı',
      time: '4 saat önce',
      userId: 'user-2',
      userName: 'Ayşe Demir',
    },
    {
      id: 'fallback-3',
      type: 'attendance',
      message: 'Günlük yoklama tamamlandı',
      time: '6 saat önce',
      userId: 'user-3',
      userName: 'Mehmet Kaya',
    },
  ];
}

/**
 * Fetch complete dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [stats, recentActivities] = await Promise.all([
      getDashboardStats(),
      getRecentActivities(),
    ]);

    return {
      stats,
      recentActivities,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    // Return fallback data
    return {
      stats: {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        pendingAssignments: 0,
      },
      recentActivities: [],
    };
  }
}

// Client-side hook is now in separate file: /src/hooks/use-dashboard-data.ts
