'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/api-client';
import { 
  safeValidateAssignmentStats, 
  safeValidateAssignmentList,
  type AssignmentStats,
  type AssignmentDashboardData
} from '@/lib/validations/assignment-schemas';

// Use validated types from schema
export interface AssignmentStatsInterface extends AssignmentStats {}

export interface Assignment {
  id: string;
  title: string;
  type: 'homework' | 'project' | 'exam' | 'quiz';
  class: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  graded: number;
  status: 'active' | 'completed' | 'draft';
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  class: string;
  dueDate: string;
  daysLeft: number;
}

// Use validated type from schema
export interface AssignmentData extends AssignmentDashboardData {}

export function useAssignmentData() {
  const [data, setData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch assignment statistics with authentication
      const [assignmentsResponse, statisticsResponse] = await Promise.all([
        apiGet('/api/assignments?limit=3&sort=created_at'),
        apiGet('/api/assignments/statistics'),
      ]);

      let stats: AssignmentStats = {
        totalAssignments: 0,
        activeAssignments: 0,
        pendingGrades: 0,
        completedAssignments: 0,
        averageScore: 0,
        completionRate: 0,
      };

      // Get statistics if API works (authentication handled by apiGet)
      if (statisticsResponse.status === 200 && statisticsResponse.data) {
        const statsValidation = safeValidateAssignmentStats(statisticsResponse.data);
        if (statsValidation.success && statsValidation.data) {
          const statsData = statsValidation.data;
          stats = {
            totalAssignments: statsData.totalAssignments,
            activeAssignments: statsData.activeAssignments,
            pendingGrades: statsData.pendingGrades,
            completedAssignments: statsData.completedAssignments,
            averageScore: statsData.averageScore ?? statsData.averageGrade ?? 0,
            completionRate: statsData.completionRate,
          };
        } else {
          console.warn('Statistics validation failed:', statsValidation.error);
        }
      }

      let recentAssignments: Assignment[] = [];
      let upcomingDeadlines: UpcomingDeadline[] = [];

      // Get recent assignments if API works (authentication handled by apiGet)
      if (assignmentsResponse.status === 200 && assignmentsResponse.data) {
        const assignmentsValidation = safeValidateAssignmentList(assignmentsResponse.data);
        if (assignmentsValidation.success && assignmentsValidation.data) {
          const assignments = assignmentsValidation.data.data || [];

        recentAssignments = assignments.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          type: assignment.type || 'homework',
          class: assignment.class_name || assignment.subject || 'N/A', // Support multiple field names
          dueDate: assignment.due_date,
          submissions: assignment.submissions_count || assignment.submission_count || 0,
          totalStudents: assignment.total_students || 30, // Default class size
          graded: assignment.graded_count || 0,
          status: assignment.status || 'active',
        }));

        // Calculate upcoming deadlines from recent assignments
        const today = new Date();
        upcomingDeadlines = assignments
          .filter((assignment: any) => {
            const dueDate = new Date(assignment.due_date);
            return dueDate > today && assignment.status === 'active';
          })
          .map((assignment: any) => {
            const dueDate = new Date(assignment.due_date);
            const daysLeft = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
              id: assignment.id,
              title: assignment.title,
              class: assignment.class_name || assignment.subject || 'N/A',
              dueDate: assignment.due_date,
              daysLeft,
            };
          })
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
          .slice(0, 3);
        } else {
          console.warn('Assignments validation failed:', assignmentsValidation.error);
        }
      }

      // Fallback to mock data if no real data
      if (recentAssignments.length === 0) {
        recentAssignments = [
          {
            id: 'mock-1',
            title: 'Matematik Problemleri',
            type: 'homework',
            class: '5-A',
            dueDate: '2025-01-20',
            submissions: 25,
            totalStudents: 30,
            graded: 20,
            status: 'active',
          },
          {
            id: 'mock-2',
            title: 'Fen Bilgisi Projesi',
            type: 'project',
            class: '5-B',
            dueDate: '2025-01-25',
            submissions: 18,
            totalStudents: 28,
            graded: 10,
            status: 'active',
          },
        ];
      }

      if (upcomingDeadlines.length === 0) {
        upcomingDeadlines = [
          {
            id: 'mock-deadline-1',
            title: 'İngilizce Kelime Testi',
            class: '6-A',
            dueDate: '2025-01-22',
            daysLeft: 2,
          },
          {
            id: 'mock-deadline-2',
            title: 'Sosyal Bilgiler Araştırması',
            class: '6-B',
            dueDate: '2025-01-24',
            daysLeft: 4,
          },
        ];
      }

      setData({
        stats,
        recentAssignments,
        upcomingDeadlines,
      });
    } catch (err) {
      console.error('Assignment data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch assignment data');

      // Set fallback data on error
      setData({
        stats: {
          totalAssignments: 15,
          activeAssignments: 8,
          pendingGrades: 23,
          completedAssignments: 7,
          averageScore: 78,
          completionRate: 85,
        },
        recentAssignments: [
          {
            id: 'fallback-1',
            title: 'Matematik Problemleri',
            type: 'homework',
            class: '5-A',
            dueDate: '2025-01-20',
            submissions: 25,
            totalStudents: 30,
            graded: 20,
            status: 'active',
          },
        ],
        upcomingDeadlines: [
          {
            id: 'fallback-deadline-1',
            title: 'İngilizce Kelime Testi',
            class: '6-A',
            dueDate: '2025-01-22',
            daysLeft: 2,
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
