'use client';

import { useState, useEffect } from 'react';
import { DashboardData, getDashboardData } from '@/lib/api/dashboard-service';

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the new dashboard service for comprehensive data fetching
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');

      // Set fallback data on error
      setData({
        stats: {
          totalStudents: 0,
          totalTeachers: 0,
          totalClasses: 0,
          pendingAssignments: 0,
        },
        recentActivities: [],
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
