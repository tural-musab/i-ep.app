'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/api-client';

export interface AttendanceTodayStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export interface AttendanceWeeklyStats {
  averageAttendance: number;
  totalAbsences: number;
  totalLates: number;
  chronicAbsentees: number;
  perfectAttendance: number;
}

export interface RecentAbsence {
  id: string;
  student: string;
  class: string;
  date: string;
  reason: string;
  parentNotified: boolean;
  consecutive: number;
}

export interface ClassAttendance {
  class: string;
  present: number;
  absent: number;
  rate: number;
}

export interface UpcomingAlert {
  id: string;
  type: 'chronic' | 'parent' | 'late' | 'pattern';
  student: string;
  class: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AttendanceData {
  todayStats: AttendanceTodayStats;
  weeklyStats: AttendanceWeeklyStats;
  recentAbsences: RecentAbsence[];
  classAttendance: ClassAttendance[];
  upcomingAlerts: UpcomingAlert[];
}

export function useAttendanceData() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch attendance data with authentication
      const [attendanceResponse, statisticsResponse, reportsResponse, notificationsResponse] =
        await Promise.all([
          apiGet('/api/attendance?limit=10&sort=created_at'),
          apiGet('/api/attendance/statistics'),
          apiGet('/api/attendance/reports?type=daily'),
          apiGet('/api/attendance/notifications'),
        ]);

      // Default values
      let todayStats: AttendanceTodayStats = {
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0,
        attendanceRate: 0,
        weeklyTrend: 'stable',
        trendValue: 0,
      };

      let weeklyStats: AttendanceWeeklyStats = {
        averageAttendance: 0,
        totalAbsences: 0,
        totalLates: 0,
        chronicAbsentees: 0,
        perfectAttendance: 0,
      };

      let recentAbsences: RecentAbsence[] = [];
      let classAttendance: ClassAttendance[] = [];
      let upcomingAlerts: UpcomingAlert[] = [];

      // Process statistics response
      if (statisticsResponse.status === 200 && statisticsResponse.data) {
        const statsData = statisticsResponse.data;

        todayStats = {
          totalStudents: statsData.totalStudents || 0,
          presentToday: statsData.presentToday || 0,
          absentToday: statsData.absentToday || 0,
          lateToday: statsData.lateToday || 0,
          attendanceRate: statsData.attendanceRate || 0,
          weeklyTrend: statsData.weeklyTrend || 'stable',
          trendValue: statsData.trendValue || 0,
        };

        weeklyStats = {
          averageAttendance: statsData.averageAttendance || 0,
          totalAbsences: statsData.totalAbsences || 0,
          totalLates: statsData.totalLates || 0,
          chronicAbsentees: statsData.chronicAbsentees || 0,
          perfectAttendance: statsData.perfectAttendance || 0,
        };
      }

      // Process attendance records
      if (attendanceResponse.status === 200 && attendanceResponse.data) {
        const attendanceData = attendanceResponse.data;
        const records = attendanceData.data || [];

        recentAbsences = records
          .filter((record: any) => record.status === 'absent' || record.status === 'late')
          .map((record: any) => ({
            id: record.id,
            student: record.student_name || 'Unknown',
            class: record.class_name || 'N/A',
            date: record.date || record.created_at,
            reason: record.reason || 'Belirtilmemiş',
            parentNotified: record.parent_notified || false,
            consecutive: record.consecutive_absences || 0,
          }))
          .slice(0, 5);
      }

      // Process reports for class attendance
      if (reportsResponse.status === 200 && reportsResponse.data) {
        const reportsData = reportsResponse.data;
        const classReports = reportsData.data || [];

        classAttendance = classReports.map((report: any) => ({
          class: report.class_name || 'N/A',
          present: report.present_count || 0,
          absent: report.absent_count || 0,
          rate: report.attendance_rate || 0,
        }));
      }

      // Process notifications for alerts
      if (notificationsResponse.status === 200 && notificationsResponse.data) {
        const notificationsData = notificationsResponse.data;
        const notifications = notificationsData.data || [];

        upcomingAlerts = notifications
          .map((notification: any) => ({
            id: notification.id,
            type: notification.type || 'pattern',
            student: notification.student_name || 'Unknown',
            class: notification.class_name || 'N/A',
            message: notification.message || 'Uyarı mesajı',
            priority: notification.priority || 'medium',
          }))
          .slice(0, 5);
      }

      // Fallback to mock data if no real data
      if (todayStats.totalStudents === 0) {
        todayStats = {
          totalStudents: 150,
          presentToday: 142,
          absentToday: 8,
          lateToday: 3,
          attendanceRate: 94.7,
          weeklyTrend: 'up',
          trendValue: 1.2,
        };
      }

      if (weeklyStats.averageAttendance === 0) {
        weeklyStats = {
          averageAttendance: 93.8,
          totalAbsences: 48,
          totalLates: 15,
          chronicAbsentees: 3,
          perfectAttendance: 12,
        };
      }

      if (recentAbsences.length === 0) {
        recentAbsences = [
          {
            id: 'mock-1',
            student: 'Ali Veli',
            class: '5-A',
            date: '2025-07-18',
            reason: 'Hastalık',
            parentNotified: true,
            consecutive: 2,
          },
          {
            id: 'mock-2',
            student: 'Ayşe Yılmaz',
            class: '5-B',
            date: '2025-07-18',
            reason: 'Kişisel',
            parentNotified: false,
            consecutive: 1,
          },
        ];
      }

      if (classAttendance.length === 0) {
        classAttendance = [
          { class: '5-A', present: 28, absent: 2, rate: 93.3 },
          { class: '5-B', present: 26, absent: 2, rate: 92.9 },
          { class: '6-A', present: 30, absent: 2, rate: 93.8 },
          { class: '6-B', present: 28, absent: 2, rate: 93.3 },
        ];
      }

      if (upcomingAlerts.length === 0) {
        upcomingAlerts = [
          {
            id: 'mock-alert-1',
            type: 'chronic',
            student: 'Fatma Demir',
            class: '5-A',
            message: 'Kronik devamsızlık eşiğine yaklaşıyor',
            priority: 'high',
          },
          {
            id: 'mock-alert-2',
            type: 'parent',
            student: 'Mehmet Kaya',
            class: '6-A',
            message: 'Veli bildirimi yapılması gerekiyor',
            priority: 'medium',
          },
        ];
      }

      setData({
        todayStats,
        weeklyStats,
        recentAbsences,
        classAttendance,
        upcomingAlerts,
      });
    } catch (err) {
      console.error('Attendance data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance data');

      // Set fallback data on error
      setData({
        todayStats: {
          totalStudents: 150,
          presentToday: 142,
          absentToday: 8,
          lateToday: 3,
          attendanceRate: 94.7,
          weeklyTrend: 'up',
          trendValue: 1.2,
        },
        weeklyStats: {
          averageAttendance: 93.8,
          totalAbsences: 48,
          totalLates: 15,
          chronicAbsentees: 3,
          perfectAttendance: 12,
        },
        recentAbsences: [
          {
            id: 'fallback-1',
            student: 'Ali Veli',
            class: '5-A',
            date: '2025-07-18',
            reason: 'Hastalık',
            parentNotified: true,
            consecutive: 2,
          },
        ],
        classAttendance: [
          { class: '5-A', present: 28, absent: 2, rate: 93.3 },
          { class: '5-B', present: 26, absent: 2, rate: 92.9 },
        ],
        upcomingAlerts: [
          {
            id: 'fallback-alert-1',
            type: 'chronic',
            student: 'Fatma Demir',
            class: '5-A',
            message: 'Kronik devamsızlık eşiğine yaklaşıyor',
            priority: 'high',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
