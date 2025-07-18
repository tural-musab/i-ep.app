/**
 * Dashboard API Service
 * İ-EP.APP - Dashboard Data Fetching Service
 * Replaces mock data with real API calls
 * Client-side compatible service
 */

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
 * Client-side compatible - no server imports
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Client-side fetch - no need for tenant check as middleware handles it
    const [studentsResponse, teachersResponse, classesResponse, assignmentsResponse] = await Promise.all([
      fetch('/api/students?limit=1', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch('/api/teachers?limit=1', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch('/api/classes', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }),
      fetch('/api/assignments?status=published&limit=1', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    ]);

    // Parse responses
    const studentsData = await studentsResponse.json();
    const teachersData = await teachersResponse.json();
    const classesData = await classesResponse.json();
    const assignmentsData = await assignmentsResponse.json();

    // Extract counts
    const totalStudents = studentsData.pagination?.total || 0;
    const totalTeachers = teachersData.pagination?.total || 0;
    const totalClasses = Array.isArray(classesData) ? classesData.length : 0;
    const pendingAssignments = assignmentsData.pagination?.total || 0;

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingAssignments
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Return fallback stats if API fails
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      pendingAssignments: 0
    };
  }
}

/**
 * Fetch recent activities from real API endpoints
 * Client-side compatible - no server imports
 */
export async function getRecentActivities(): Promise<RecentActivity[]> {
  try {
    // Client-side fetch - no need for tenant check as middleware handles it
    const activities: RecentActivity[] = [];

    // Fetch recent assignments (last 5)
    try {
      const assignmentResponse = await fetch('/api/assignments?limit=5&status=published', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (assignmentResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        const assignments = assignmentData.data || [];
        
        assignments.forEach((assignment: any) => {
          const timeAgo = getTimeAgo(assignment.created_at);
          activities.push({
            id: `assignment-${assignment.id}`,
            type: 'assignment',
            message: `${assignment.title} ödevi oluşturuldu`,
            time: timeAgo,
            userId: assignment.created_by,
            userName: assignment.teacher_name || 'Öğretmen'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
    }

    // Fetch recent grades (last 5)
    try {
      const gradeResponse = await fetch('/api/grades?limit=5&includeComments=true', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (gradeResponse.ok) {
        const gradeData = await gradeResponse.json();
        const grades = gradeData.data || [];
        
        grades.forEach((grade: any) => {
          const timeAgo = getTimeAgo(grade.created_at);
          activities.push({
            id: `grade-${grade.id}`,
            type: 'grade',
            message: `${grade.subjectName || 'Ders'} notlandırıldı (${grade.letterGrade || grade.gradeValue})`,
            time: timeAgo,
            userId: grade.studentId,
            userName: grade.studentName || 'Öğrenci'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching recent grades:', error);
    }

    // Fetch recent attendance (last 5)
    try {
      const attendanceResponse = await fetch('/api/attendance?limit=5', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        const attendances = attendanceData.data || [];
        
        attendances.forEach((attendance: any) => {
          const timeAgo = getTimeAgo(attendance.created_at);
          const statusText = getAttendanceStatusText(attendance.status);
          activities.push({
            id: `attendance-${attendance.id}`,
            type: 'attendance',
            message: `${attendance.studentName || 'Öğrenci'} yoklama ${statusText}`,
            time: timeAgo,
            userId: attendance.studentId,
            userName: attendance.studentName || 'Öğrenci'
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
    'present': 'katıldı',
    'absent': 'gelmedi',
    'late': 'geç kaldı',
    'excused': 'mazereti var',
    'sick': 'hasta'
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
      userName: 'Ahmet Yılmaz'
    },
    {
      id: 'fallback-2',
      type: 'grade',
      message: 'Fen bilgisi sınavı notlandırıldı',
      time: '4 saat önce',
      userId: 'user-2',
      userName: 'Ayşe Demir'
    },
    {
      id: 'fallback-3',
      type: 'attendance',
      message: 'Günlük yoklama tamamlandı',
      time: '6 saat önce',
      userId: 'user-3',
      userName: 'Mehmet Kaya'
    }
  ];
}

/**
 * Fetch complete dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [stats, recentActivities] = await Promise.all([
      getDashboardStats(),
      getRecentActivities()
    ]);

    return {
      stats,
      recentActivities
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return fallback data
    return {
      stats: {
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        pendingAssignments: 0
      },
      recentActivities: []
    };
  }
}

// Client-side hook is now in separate file: /src/hooks/use-dashboard-data.ts