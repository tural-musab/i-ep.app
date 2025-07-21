'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export function DashboardStats() {
  const { data, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Yükleniyor...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-700">Hata: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-gray-700">Veri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Toplam Öğrenci</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.stats.totalStudents}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toplam Öğretmen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.stats.totalTeachers}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toplam Sınıf</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.stats.totalClasses}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bekleyen Ödevler</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{data.stats.pendingAssignments}</p>
        </CardContent>
      </Card>
    </div>
  );
}
