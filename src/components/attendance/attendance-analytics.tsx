/**
 * Attendance Analytics Component
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Devamsızlık Analitikleri
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  // Clock,
  AlertCircle,
  // CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  // UserCheck,
  UserX,
  Timer,
} from 'lucide-react';

export function AttendanceAnalytics() {
  // Mock data - gerçek uygulamada API'den gelecek
  const overallStats = {
    totalStudents: 150,
    averageAttendanceRate: 94.2,
    totalSchoolDays: 100,
    totalAbsences: 890,
    chronicAbsentees: 8,
    perfectAttendance: 12,
    trendDirection: 'up',
    trendValue: 2.1,
  };

  const monthlyTrends = [
    { month: 'Eylül', attendanceRate: 96.2, absences: 68, lates: 15 },
    { month: 'Ekim', attendanceRate: 94.8, absences: 89, lates: 22 },
    { month: 'Kasım', attendanceRate: 93.1, absences: 125, lates: 28 },
    { month: 'Aralık', attendanceRate: 91.7, absences: 156, lates: 35 },
    { month: 'Ocak', attendanceRate: 94.2, absences: 98, lates: 18 },
  ];

  const classAnalytics = [
    {
      class: '5-A',
      students: 30,
      attendanceRate: 95.1,
      absences: 67,
      lates: 12,
      chronicAbsentees: 2,
      perfectAttendance: 4,
      trend: 'up',
      trendValue: 1.8,
    },
    {
      class: '5-B',
      students: 28,
      attendanceRate: 93.8,
      absences: 89,
      lates: 18,
      chronicAbsentees: 3,
      perfectAttendance: 2,
      trend: 'down',
      trendValue: -0.5,
    },
    {
      class: '6-A',
      students: 32,
      attendanceRate: 94.7,
      absences: 78,
      lates: 15,
      chronicAbsentees: 2,
      perfectAttendance: 3,
      trend: 'up',
      trendValue: 2.3,
    },
    {
      class: '6-B',
      students: 30,
      attendanceRate: 93.2,
      absences: 92,
      lates: 21,
      chronicAbsentees: 1,
      perfectAttendance: 3,
      trend: 'stable',
      trendValue: 0.1,
    },
  ];

  const weeklyPatterns = [
    { day: 'Pazartesi', attendanceRate: 91.2, absences: 13, lates: 8 },
    { day: 'Salı', attendanceRate: 95.1, absences: 7, lates: 4 },
    { day: 'Çarşamba', attendanceRate: 96.3, absences: 6, lates: 3 },
    { day: 'Perşembe', attendanceRate: 94.8, absences: 8, lates: 5 },
    { day: 'Cuma', attendanceRate: 93.5, absences: 10, lates: 6 },
    { day: 'Cumartesi', attendanceRate: 97.2, absences: 4, lates: 2 },
  ];

  const absenceReasons = [
    { reason: 'Hastalık', count: 245, percentage: 45.2 },
    { reason: 'Kişisel', count: 132, percentage: 24.3 },
    { reason: 'Aile', count: 89, percentage: 16.4 },
    { reason: 'Ulaşım', count: 45, percentage: 8.3 },
    { reason: 'Diğer', count: 31, percentage: 5.8 },
  ];

  const interventionResults = [
    {
      student: 'Fatma Demir',
      class: '5-A',
      beforeRate: 65.0,
      afterRate: 85.2,
      improvement: 20.2,
      interventionType: 'Veli Görüşmesi',
      startDate: '2024-12-01',
    },
    {
      student: 'Ahmet Çelik',
      class: '6-B',
      beforeRate: 72.5,
      afterRate: 88.7,
      improvement: 16.2,
      interventionType: 'Destek Planı',
      startDate: '2024-11-15',
    },
    {
      student: 'Ayşe Kaya',
      class: '5-B',
      beforeRate: 78.3,
      afterRate: 92.1,
      improvement: 13.8,
      interventionType: 'Rehberlik',
      startDate: '2024-12-10',
    },
  ];

  const seasonalAnalysis = [
    {
      season: 'Sonbahar',
      attendanceRate: 94.7,
      commonReasons: ['Hastalık', 'Hava koşulları'],
      recommendation: 'Sağlık önlemleri artırılmalı',
    },
    {
      season: 'Kış',
      attendanceRate: 91.2,
      commonReasons: ['Grip', 'Kar', 'Tatil'],
      recommendation: 'Ulaşım alternatifleri sağlanmalı',
    },
    {
      season: 'İlkbahar',
      attendanceRate: 95.8,
      commonReasons: ['Alerjiler', 'Kişisel'],
      recommendation: 'Allerji önlemleri alınmalı',
    },
    {
      season: 'Yaz',
      attendanceRate: 93.5,
      commonReasons: ['Tatil', 'Sıcak hava'],
      recommendation: 'Esnek program düşünülebilir',
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceRateBackground = (rate: number) => {
    if (rate >= 95) return 'bg-green-100';
    if (rate >= 90) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genel Devamsızlık Oranı</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{overallStats.averageAttendanceRate}</div>
            <div
              className={`flex items-center text-xs ${getTrendColor(overallStats.trendDirection)}`}
            >
              {getTrendIcon(overallStats.trendDirection)}
              <span className="ml-1">
                {overallStats.trendDirection === 'up' ? '+' : ''}
                {overallStats.trendValue}% bu ay
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kronik Devamsızlık</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.chronicAbsentees}</div>
            <p className="text-muted-foreground text-xs">
              %{((overallStats.chronicAbsentees / overallStats.totalStudents) * 100).toFixed(1)}{' '}
              öğrenci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mükemmel Devam</CardTitle>
            <Award className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.perfectAttendance}</div>
            <p className="text-muted-foreground text-xs">
              %{((overallStats.perfectAttendance / overallStats.totalStudents) * 100).toFixed(1)}{' '}
              öğrenci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Devamsızlık</CardTitle>
            <XCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalAbsences}</div>
            <p className="text-muted-foreground text-xs">
              {overallStats.totalSchoolDays} okul günü
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="trends">Trendler</TabsTrigger>
          <TabsTrigger value="classes">Sınıflar</TabsTrigger>
          <TabsTrigger value="patterns">Desenler</TabsTrigger>
          <TabsTrigger value="reasons">Nedenler</TabsTrigger>
          <TabsTrigger value="interventions">Müdahaleler</TabsTrigger>
          <TabsTrigger value="seasonal">Mevsimsel</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Aylık Devamsızlık Trendi
              </CardTitle>
              <CardDescription>Son 5 ayın devamsızlık oranları ve değişimleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTrends.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">{month.month}</div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`font-medium ${getAttendanceRateColor(month.attendanceRate)}`}
                          >
                            %{month.attendanceRate}
                          </span>
                          <div className="w-32">
                            <Progress value={month.attendanceRate} className="h-2" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {month.absences} devamsızlık • {month.lates} geç kalma
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{month.attendanceRate}%</div>
                      <div className="text-xs text-gray-600">devamsızlık oranı</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sınıf Bazlı Analiz
              </CardTitle>
              <CardDescription>
                Her sınıfın devamsızlık performansı ve karşılaştırması
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classAnalytics.map((classData, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{classData.class}</CardTitle>
                          <CardDescription>{classData.students} öğrenci</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getAttendanceRateBackground(classData.attendanceRate)}
                          >
                            %{classData.attendanceRate}
                          </Badge>
                          {getTrendIcon(classData.trend)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {classData.absences}
                          </div>
                          <div className="text-sm text-gray-600">Devamsızlık</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {classData.lates}
                          </div>
                          <div className="text-sm text-gray-600">Geç Kalma</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {classData.chronicAbsentees}
                          </div>
                          <div className="text-sm text-gray-600">Kronik</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {classData.perfectAttendance}
                          </div>
                          <div className="text-sm text-gray-600">Mükemmel</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getTrendColor(classData.trend)}`}>
                            {classData.trend === 'up' ? '+' : classData.trend === 'down' ? '-' : ''}
                            {Math.abs(classData.trendValue)}%
                          </div>
                          <div className="text-sm text-gray-600">Trend</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Haftalık Devamsızlık Desenleri
              </CardTitle>
              <CardDescription>Haftanın günlerine göre devamsızlık dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyPatterns.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`font-medium ${getAttendanceRateColor(day.attendanceRate)}`}
                          >
                            %{day.attendanceRate}
                          </span>
                          <div className="w-32">
                            <Progress value={day.attendanceRate} className="h-2" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {day.absences} devamsızlık • {day.lates} geç kalma
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{day.absences}</span>
                      <Timer className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{day.lates}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reasons Tab */}
        <TabsContent value="reasons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Devamsızlık Nedenleri
              </CardTitle>
              <CardDescription>En yaygın devamsızlık nedenlerinin analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {absenceReasons.map((reason, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{reason.reason}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{reason.count} kez</span>
                        <span className="text-sm font-medium">%{reason.percentage}</span>
                      </div>
                    </div>
                    <Progress value={reason.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Müdahale Sonuçları
              </CardTitle>
              <CardDescription>Devamsızlık müdahalelerinin etkililiği</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interventionResults.map((result, index) => (
                  <div key={index} className="rounded-lg border bg-green-50 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{result.student}</h3>
                        <p className="text-sm text-gray-600">{result.class}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        +{result.improvement}% iyileşme
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">%{result.beforeRate}</div>
                        <div className="text-sm text-gray-600">Önceki Oran</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">%{result.afterRate}</div>
                        <div className="text-sm text-gray-600">Sonraki Oran</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {result.interventionType}
                        </div>
                        <div className="text-sm text-gray-600">Müdahale Türü</div>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      Başlangıç: {new Date(result.startDate).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal Tab */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Mevsimsel Analiz
              </CardTitle>
              <CardDescription>Mevsimlere göre devamsızlık trendleri ve öneriler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {seasonalAnalysis.map((season, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{season.season}</CardTitle>
                      <CardDescription>
                        Ortalama devamsızlık oranı: %{season.attendanceRate}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="mb-2 text-sm font-medium">Yaygın Nedenler</h4>
                          <div className="flex flex-wrap gap-1">
                            {season.commonReasons.map((reason, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-medium">Öneri</h4>
                          <p className="text-sm text-gray-600">{season.recommendation}</p>
                        </div>

                        <div>
                          <Progress value={season.attendanceRate} className="h-2" />
                          <div className="mt-1 text-right text-sm text-gray-600">
                            %{season.attendanceRate}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
