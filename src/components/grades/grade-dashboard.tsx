/**
 * Grade Dashboard Component
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Dashboard Widget
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Calculator,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  BarChart3,
  Target,
  Clock,
  Edit,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useGradeData } from '@/hooks/use-grade-data';

export function GradeDashboard() {
  // Real API data using custom hook
  const { data: gradeData, loading, error, refetch } = useGradeData();

  // Loading state
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Not verileri yükleniyor...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-medium">Veri yükleme hatası</p>
        <p className="text-sm text-gray-600">{error}</p>
        <Button onClick={refetch} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  // Use real data or fallback
  const stats = gradeData?.stats || {
    totalStudents: 150,
    gradedAssignments: 245,
    pendingGrades: 18,
    averageGrade: 78.5,
    classAverage: 76.8,
    weeklyProgress: 12,
    improvementRate: 8.3,
    gradeDistribution: {
      AA: 18, BA: 32, BB: 45, CB: 38, CC: 28, DC: 15, DD: 8, FF: 3
    }
  };

  const recentGrades = gradeData?.recentGrades || [
    {
      id: '1',
      studentName: 'Ali Veli',
      className: '5-A',
      assignmentTitle: 'Matematik Sınavı',
      grade: 'BB',
      score: 85,
      date: '2025-07-18',
      type: 'exam',
      semester: 'Güz 2024',
    },
    {
      id: '2',
      studentName: 'Ayşe Yılmaz',
      className: '5-A',
      assignmentTitle: 'Türkçe Ödevi',
      grade: 'AA',
      score: 92,
      date: '2025-07-18',
      type: 'assignment',
      semester: 'Güz 2024',
    },
    {
      id: '3',
      studentName: 'Mehmet Kaya',
      className: '5-A',
      assignmentTitle: 'Fen Bilgisi Projesi',
      grade: 'CB',
      score: 78,
      date: '2025-07-17',
      type: 'project',
      semester: 'Güz 2024',
    },
  ];

  const classPerformance = gradeData?.classPerformance || [
    {
      className: '5-A',
      studentCount: 30,
      averageScore: 78.5,
      averageGrade: 'BB',
      highestScore: 95,
      lowestScore: 45,
      passRate: 86.7,
      trend: 'up',
    },
    {
      className: '5-B',
      studentCount: 28,
      averageScore: 76.2,
      averageGrade: 'BB',
      highestScore: 92,
      lowestScore: 38,
      passRate: 82.1,
      trend: 'stable',
    },
    {
      className: '6-A',
      studentCount: 32,
      averageScore: 81.3,
      averageGrade: 'BA',
      highestScore: 98,
      lowestScore: 52,
      passRate: 90.6,
      trend: 'up',
    },
  ];

  const alerts = gradeData?.alerts || [
    {
      id: '1',
      type: 'failing',
      studentName: 'Ali Vural',
      className: '5-A',
      subject: 'Matematik',
      message: 'Matematik dersinde başarısızlık riski',
      priority: 'high',
      actionRequired: true,
    },
    {
      id: '2',
      type: 'improvement',
      studentName: 'Fatma Şahin',
      className: '6-B',
      subject: 'Fen Bilgisi',
      message: 'Son haftalarda kayda değer gelişim',
      priority: 'medium',
      actionRequired: false,
    },
    {
      id: '3',
      type: 'excellent',
      studentName: 'Mustafa Özkan',
      className: '5-B',
      subject: 'Türkçe',
      message: 'Mükemmel performans gösteriyor',
      priority: 'low',
      actionRequired: false,
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

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    if (gpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failing':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'excellent':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Not Yönetimi</h2>
          {/* Data source indicator */}
          <Badge variant={gradeData ? "default" : "secondary"}>
            {gradeData ? "🔗 Canlı Veri" : "📊 Mock Veri"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/grades">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Detaylı Görünüm
            </Button>
          </Link>
          <Link href="/dashboard/grades?tab=entry">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Not Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Not</CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGradeColor(stats.averageGrade)}`}>
              {stats.averageGrade}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />+{stats.improvementRate}% bu hafta
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-muted-foreground text-xs">Aktif öğrenci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notlanan Ödev</CardTitle>
            <Award className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gradedAssignments}</div>
            <p className="text-muted-foreground text-xs">Bu dönem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Notlar</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingGrades}</div>
            <p className="text-muted-foreground text-xs">Not girilmesi gereken</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Son Girilen Notlar
            </CardTitle>
            <CardDescription>En son girilen notların listesi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{grade.studentName}</h3>
                      <p className="text-sm text-gray-600">
                        {grade.className} • {grade.assignmentTitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{grade.type}</div>
                      <div className="text-sm text-gray-600">{grade.semester}</div>
                    </div>
                    <Badge variant="outline" className={getGradeBadge(grade.score)}>
                      {grade.grade}
                    </Badge>
                    <div className="text-right">
                      <div className={`font-bold ${getGradeColor(grade.score)}`}>{grade.score}</div>
                      <div className="text-sm text-gray-600">/100</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Class Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sınıf Performansları
            </CardTitle>
            <CardDescription>Sınıf bazlı akademik performans özeti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classPerformance.map((classData, index) => (
                <div key={index} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{classData.className}</h3>
                      <p className="text-sm text-gray-600">{classData.studentCount} öğrenci</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`font-bold ${getGradeColor(classData.averageScore)}`}>
                          {classData.averageGrade}
                        </div>
                        <div className="text-sm text-gray-600">Ortalama</div>
                      </div>
                      {getTrendIcon(classData.trend)}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Başarı Oranı</span>
                      <span className="text-sm font-medium">{classData.passRate}%</span>
                    </div>
                    <Progress value={classData.passRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">En Yüksek:</span>
                      <span className="ml-1 font-medium text-green-600">
                        {classData.highestScore}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">En Düşük:</span>
                      <span className="ml-1 font-medium text-red-600">
                        {classData.lowestScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Not Dağılımı
          </CardTitle>
          <CardDescription>Türk eğitim sistemine göre not dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
            {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600">{grade}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Uyarılar ve Bildirimler
            </CardTitle>
            <CardDescription>Dikkat edilmesi gereken durumlar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                        {alert.priority === 'high'
                          ? 'Yüksek'
                          : alert.priority === 'medium'
                            ? 'Orta'
                            : 'Düşük'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {alert.studentName} • {alert.className} • {alert.subject}
                    </p>
                  </div>
                  {alert.actionRequired && (
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      İncele
                    </Button>
                  )}
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
          <CardDescription>Sık kullanılan not yönetimi işlemleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/grades?tab=entry">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Not Ekle
              </Button>
            </Link>

            <Link href="/dashboard/grades?tab=gradebook">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                Not Defteri
              </Button>
            </Link>

            <Link href="/dashboard/grades?tab=analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analitik
              </Button>
            </Link>

            <Link href="/dashboard/grades?tab=reports">
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
