'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAssignmentData } from '@/hooks/use-assignment-data';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export function RecentActivities() {
  const { data, loading, error } = useDashboardData();
  const { data: assignmentData, loading: assignmentLoading } = useAssignmentData();

  // Combine loading states
  const isLoading = loading || assignmentLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son hareketler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-3">
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son hareketler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">Aktiviteler yüklenemedi: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son hareketler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-gray-700">Aktivite verisi yüklenemedi</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Aktiviteler</CardTitle>
        <CardDescription>Sistemdeki son hareketler</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Enhanced real activities with assignment data */}
          {assignmentData?.recentAssignments?.slice(0, 3).map((assignment) => (
            <div
              key={`assignment-${assignment.id}`}
              className="flex items-center justify-between rounded bg-blue-50 p-3"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">
                    Yeni ödev: {assignment.title}
                  </div>
                  <div className="text-sm text-blue-600">
                    {assignment.class} • {assignment.submissions}/{assignment.totalStudents} teslim
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
              </Badge>
            </div>
          ))}

          {/* Enhanced real activities with upcoming deadlines */}
          {assignmentData?.upcomingDeadlines?.slice(0, 2).map((deadline) => (
            <div
              key={`deadline-${deadline.id}`}
              className="flex items-center justify-between rounded bg-orange-50 p-3"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">
                    Son tarih yaklaşıyor: {deadline.title}
                  </div>
                  <div className="text-sm text-orange-600">
                    {deadline.class}
                  </div>
                </div>
              </div>
              <Badge variant={deadline.daysLeft <= 2 ? 'destructive' : 'secondary'} className="text-xs">
                {deadline.daysLeft} gün kaldı
              </Badge>
            </div>
          ))}

          {/* Fallback to original activities if no assignment data */}
          {data?.recentActivities && (!assignmentData || 
            (assignmentData.recentAssignments.length === 0 && assignmentData.upcomingDeadlines.length === 0)
          ) && data.recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded bg-gray-50 p-3"
            >
              <span>{activity.message}</span>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}

          {/* Empty state */}
          {(!data?.recentActivities || data.recentActivities.length === 0) && 
           (!assignmentData || (assignmentData.recentAssignments.length === 0 && assignmentData.upcomingDeadlines.length === 0)) && (
            <div className="py-8 text-center text-gray-500">
              <Clock className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>Henüz aktivite bulunmuyor</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
