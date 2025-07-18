/**
 * Attendance Dashboard Component
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Devamsızlık Dashboard Widget
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  // Clock,
  // CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  UserCheck,
  UserX,
  Timer,
  Bell,
  Eye,
  Plus,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { useAttendanceData } from '@/hooks/use-attendance-data';
import { Loader2 } from 'lucide-react';

export function AttendanceDashboard() {
  // Real API data using custom hook
  const { data: attendanceData, loading, error, refetch } = useAttendanceData();

  // Loading state
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Devamsızlık verileri yükleniyor...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-medium">Veri yükleme hatası</p>
        <p className="text-sm text-gray-600">{error}</p>
        <Button onClick={refetch} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  // Use real data or fallback
  const todayStats = attendanceData?.todayStats || {
    totalStudents: 150,
    presentToday: 142,
    absentToday: 8,
    lateToday: 3,
    attendanceRate: 94.7,
    weeklyTrend: 'up',
    trendValue: 1.2,
  };

  const weeklyStats = attendanceData?.weeklyStats || {
    averageAttendance: 93.8,
    totalAbsences: 48,
    totalLates: 15,
    chronicAbsentees: 3,
    perfectAttendance: 12,
  };

  const recentAbsences = attendanceData?.recentAbsences || [
    {
      id: '1',
      student: 'Ali Veli',
      class: '5-A',
      date: '2025-01-15',
      reason: 'Hastalık',
      parentNotified: true,
      consecutive: 2,
    },
    {
      id: '2',
      student: 'Ayşe Yılmaz',
      class: '5-B',
      date: '2025-01-15',
      reason: 'Kişisel',
      parentNotified: false,
      consecutive: 1,
    },
    {
      id: '3',
      student: 'Mehmet Kaya',
      class: '6-A',
      date: '2025-01-15',
      reason: 'Geç kalma',
      parentNotified: true,
      consecutive: 0,
    },
  ];

  const classAttendance = attendanceData?.classAttendance || [
    { class: '5-A', present: 28, absent: 2, rate: 93.3 },
    { class: '5-B', present: 26, absent: 2, rate: 92.9 },
    { class: '6-A', present: 30, absent: 2, rate: 93.8 },
    { class: '6-B', present: 28, absent: 2, rate: 93.3 },
  ];

  const upcomingAlerts = attendanceData?.upcomingAlerts || [
    {
      id: '1',
      type: 'chronic',
      student: 'Fatma Demir',
      class: '5-A',
      message: 'Kronik devamsızlık eşiğine yaklaşıyor',
      priority: 'high',
    },
    {
      id: '2',
      type: 'parent',
      student: 'Ahmet Çelik',
      class: '6-B',
      message: 'Veli bildirim gönderilemedi',
      priority: 'medium',
    },
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Devamsızlık Yönetimi</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/attendance">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Detaylı Görünüm
            </Button>
          </Link>
          <Link href="/dashboard/attendance/daily">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yoklama Al
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Mevcut</CardTitle>
            <UserCheck className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.presentToday}</div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{todayStats.totalStudents} öğrenciden</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Devamsız</CardTitle>
            <UserX className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.absentToday}</div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>{todayStats.lateToday} geç kalma</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Oranı</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{todayStats.attendanceRate}</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              {getTrendIcon(todayStats.weeklyTrend)}
              <span>+{todayStats.trendValue}% bu hafta</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Bildirim</CardTitle>
            <Bell className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentAbsences.filter((a) => !a.parentNotified).length}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>Veli bildirimi</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Class Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sınıf Devamsızlık Durumu
            </CardTitle>
            <CardDescription>Bugünkü sınıf bazlı devamsızlık oranları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classAttendance.map((classData, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">{classData.class}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${getAttendanceRateColor(classData.rate)}`}
                        >
                          %{classData.rate}
                        </span>
                        <div className="w-24">
                          <Progress value={classData.rate} className="h-2" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {classData.present} mevcut • {classData.absent} devamsız
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/attendance/daily?class=${classData.class.toLowerCase()}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Detay
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Absences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Son Devamsızlıklar
            </CardTitle>
            <CardDescription>Bugünkü devamsızlık ve geç kalma durumları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAbsences.map((absence) => (
                <div
                  key={absence.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {absence.reason === 'Geç kalma' ? (
                        <Timer className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{absence.student}</h4>
                        <p className="text-sm text-gray-600">{absence.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{absence.reason}</Badge>
                      {absence.consecutive > 0 && (
                        <Badge variant="destructive">{absence.consecutive} gün</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {absence.parentNotified ? 'Bildirildi' : 'Bekliyor'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(absence.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {!absence.parentNotified && (
                      <Button variant="outline" size="sm">
                        <Bell className="mr-2 h-4 w-4" />
                        Bildir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Haftalık Özet
          </CardTitle>
          <CardDescription>Bu haftanın devamsızlık istatistikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                %{weeklyStats.averageAttendance}
              </div>
              <div className="text-sm text-blue-800">Ortalama Devamsızlık</div>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{weeklyStats.totalAbsences}</div>
              <div className="text-sm text-red-800">Toplam Devamsızlık</div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{weeklyStats.totalLates}</div>
              <div className="text-sm text-yellow-800">Toplam Geç Kalma</div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {weeklyStats.chronicAbsentees}
              </div>
              <div className="text-sm text-orange-800">Kronik Devamsızlık</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {weeklyStats.perfectAttendance}
              </div>
              <div className="text-sm text-green-800">Mükemmel Devam</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {upcomingAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Uyarılar ve Bildirimler
            </CardTitle>
            <CardDescription>Acil müdahale gerektiren durumlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div>
                      <h4 className="font-medium">{alert.student}</h4>
                      <p className="text-sm text-gray-600">
                        {alert.class} • {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                      {alert.priority === 'high'
                        ? 'Yüksek'
                        : alert.priority === 'medium'
                          ? 'Orta'
                          : 'Düşük'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      İncele
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>Sık kullanılan devamsızlık işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/attendance/daily">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Yoklama Al
              </Button>
            </Link>

            <Link href="/dashboard/attendance?tab=absent">
              <Button variant="outline" className="w-full justify-start">
                <XCircle className="mr-2 h-4 w-4" />
                Devamsızları Görüntüle
              </Button>
            </Link>

            <Link href="/dashboard/attendance?tab=notifications">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Veli Bildirimler ({recentAbsences.filter((a) => !a.parentNotified).length})
              </Button>
            </Link>

            <Link href="/dashboard/attendance/reports">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Raporlar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
