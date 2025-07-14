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
  Edit
} from 'lucide-react';
import Link from 'next/link';

export function GradeDashboard() {
  // Mock data - gerçek uygulamada API'den gelecek
  const todayStats = {
    totalStudents: 150,
    totalSubjects: 8,
    averageGPA: 3.2,
    gradedAssignments: 245,
    pendingGrades: 18,
    monthlyTrend: 'up',
    trendValue: 0.15,
    passingRate: 88.5
  };

  const recentGrades = [
    {
      id: '1',
      student: 'Ali Veli',
      studentNumber: '2025001',
      class: '5-A',
      subject: 'Matematik',
      gradeType: 'Sınav',
      grade: 85,
      maxGrade: 100,
      date: '2025-01-15',
      teacher: 'Ahmet Öğretmen',
      letterGrade: 'B'
    },
    {
      id: '2',
      student: 'Ayşe Yılmaz',
      studentNumber: '2025002',
      class: '5-A',
      subject: 'Türkçe',
      gradeType: 'Ödev',
      grade: 92,
      maxGrade: 100,
      date: '2025-01-15',
      teacher: 'Fatma Öğretmen',
      letterGrade: 'A'
    },
    {
      id: '3',
      student: 'Mehmet Kaya',
      studentNumber: '2025003',
      class: '5-A',
      subject: 'Fen Bilgisi',
      gradeType: 'Proje',
      grade: 78,
      maxGrade: 100,
      date: '2025-01-14',
      teacher: 'Mustafa Öğretmen',
      letterGrade: 'C'
    },
    {
      id: '4',
      student: 'Fatma Demir',
      studentNumber: '2025004',
      class: '5-B',
      subject: 'Sosyal Bilgiler',
      gradeType: 'Sunum',
      grade: 89,
      maxGrade: 100,
      date: '2025-01-14',
      teacher: 'Zeynep Öğretmen',
      letterGrade: 'B'
    }
  ];

  const classPerformance = [
    {
      class: '5-A',
      students: 30,
      averageGPA: 3.4,
      passingRate: 92,
      topSubject: 'Matematik',
      challengingSubject: 'Fen Bilgisi',
      trend: 'up'
    },
    {
      class: '5-B',
      students: 28,
      averageGPA: 3.1,
      passingRate: 87,
      topSubject: 'Türkçe',
      challengingSubject: 'Matematik',
      trend: 'down'
    },
    {
      class: '6-A',
      students: 32,
      averageGPA: 3.3,
      passingRate: 89,
      topSubject: 'Sosyal Bilgiler',
      challengingSubject: 'İngilizce',
      trend: 'up'
    },
    {
      class: '6-B',
      students: 30,
      averageGPA: 3.0,
      passingRate: 85,
      topSubject: 'Türkçe',
      challengingSubject: 'Fen Bilgisi',
      trend: 'stable'
    }
  ];

  const pendingGrades = [
    {
      id: '1',
      class: '5-A',
      subject: 'Matematik',
      examName: 'Dönemlik Sınav',
      studentsCount: 30,
      gradedCount: 25,
      pendingCount: 5,
      deadline: '2025-01-17',
      priority: 'high'
    },
    {
      id: '2',
      class: '5-B',
      subject: 'Türkçe',
      examName: 'Kompozisyon Ödevi',
      studentsCount: 28,
      gradedCount: 20,
      pendingCount: 8,
      deadline: '2025-01-18',
      priority: 'medium'
    },
    {
      id: '3',
      class: '6-A',
      subject: 'Fen Bilgisi',
      examName: 'Deney Raporu',
      studentsCount: 32,
      gradedCount: 30,
      pendingCount: 2,
      deadline: '2025-01-19',
      priority: 'low'
    }
  ];

  const subjectInsights = [
    {
      subject: 'Matematik',
      averageGrade: 82.5,
      trend: 'up',
      trendValue: 2.3,
      students: 150,
      difficulty: 'medium',
      passingRate: 88
    },
    {
      subject: 'Türkçe',
      averageGrade: 86.2,
      trend: 'up',
      trendValue: 1.8,
      students: 150,
      difficulty: 'easy',
      passingRate: 92
    },
    {
      subject: 'Fen Bilgisi',
      averageGrade: 79.8,
      trend: 'down',
      trendValue: -0.5,
      students: 150,
      difficulty: 'hard',
      passingRate: 85
    },
    {
      subject: 'Sosyal Bilgiler',
      averageGrade: 88.1,
      trend: 'up',
      trendValue: 3.1,
      students: 150,
      difficulty: 'easy',
      passingRate: 94
    }
  ];

  const alerts = [
    {
      id: '1',
      type: 'low_performance',
      message: 'Fen Bilgisi dersinde sınıf ortalaması düşük',
      priority: 'high',
      class: '5-B',
      subject: 'Fen Bilgisi',
      value: 68.5
    },
    {
      id: '2',
      type: 'pending_deadline',
      message: 'Matematik sınav notları yarın son gün',
      priority: 'medium',
      class: '5-A',
      subject: 'Matematik',
      deadline: '2025-01-17'
    },
    {
      id: '3',
      type: 'excellent_performance',
      message: 'Sosyal Bilgiler dersinde mükemmel performans',
      priority: 'low',
      class: '6-A',
      subject: 'Sosyal Bilgiler',
      value: 94.2
    }
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
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'hard': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_performance': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending_deadline': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excellent_performance': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Not Yönetimi</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/grades">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Detaylı Görünüm
            </Button>
          </Link>
          <Link href="/dashboard/grades?tab=entry">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Not Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama GPA</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGPAColor(todayStats.averageGPA)}`}>
              {todayStats.averageGPA}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{todayStats.trendValue} bu ay
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              %{todayStats.passingRate}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayStats.totalStudents} öğrenci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notlanan Ödev</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.gradedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Bu dönem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Notlar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">
              Not girilmesi gereken
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Son Girilen Notlar
            </CardTitle>
            <CardDescription>
              En son girilen notların listesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-medium">{grade.student}</h3>
                      <p className="text-sm text-gray-600">
                        {grade.class} • {grade.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{grade.gradeType}</div>
                      <div className="text-sm text-gray-600">{grade.teacher}</div>
                    </div>
                    <Badge variant="outline" className={getGradeBadge(grade.grade)}>
                      {grade.letterGrade}
                    </Badge>
                    <div className="text-right">
                      <div className={`font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </div>
                      <div className="text-sm text-gray-600">
                        /{grade.maxGrade}
                      </div>
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
            <CardDescription>
              Sınıf bazlı akademik performans özeti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classPerformance.map((classData, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{classData.class}</h3>
                      <p className="text-sm text-gray-600">{classData.students} öğrenci</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`font-bold ${getGPAColor(classData.averageGPA)}`}>
                          {classData.averageGPA}
                        </div>
                        <div className="text-sm text-gray-600">GPA</div>
                      </div>
                      {getTrendIcon(classData.trend)}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Başarı Oranı</span>
                      <span className="text-sm font-medium">{classData.passingRate}%</span>
                    </div>
                    <Progress value={classData.passingRate} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">En Başarılı:</span>
                      <span className="ml-1 font-medium text-green-600">{classData.topSubject}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Zor Olan:</span>
                      <span className="ml-1 font-medium text-red-600">{classData.challengingSubject}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Bekleyen Notlar
            </CardTitle>
            <CardDescription>
              Not girişi bekleyen sınavlar ve ödevler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingGrades.map((pending) => (
                <div key={pending.id} className="p-3 border rounded-lg bg-orange-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{pending.examName}</h3>
                      <p className="text-sm text-gray-600">
                        {pending.class} • {pending.subject}
                      </p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(pending.priority)}>
                      {pending.pendingCount} bekleyen
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-600">
                      İlerleme: {pending.gradedCount}/{pending.studentsCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Son: {new Date(pending.deadline).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  
                  <Progress 
                    value={(pending.gradedCount / pending.studentsCount) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ders İçgörüleri
            </CardTitle>
            <CardDescription>
              Ders bazlı performans analizi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectInsights.map((subject, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{subject.subject}</h3>
                      <p className="text-sm text-gray-600">{subject.students} öğrenci</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className={`font-bold ${getGradeColor(subject.averageGrade)}`}>
                          {subject.averageGrade}
                        </div>
                        <div className="text-sm text-gray-600">Ortalama</div>
                      </div>
                      {getTrendIcon(subject.trend)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Zorluk:</span>
                      <span className={`ml-1 font-medium ${getDifficultyColor(subject.difficulty)}`}>
                        {subject.difficulty === 'easy' ? 'Kolay' : 
                         subject.difficulty === 'medium' ? 'Orta' : 'Zor'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Başarı:</span>
                      <span className="ml-1 font-medium text-blue-600">{subject.passingRate}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Uyarılar ve Bildirimler
          </CardTitle>
          <CardDescription>
            Dikkat edilmesi gereken durumlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <Badge variant="outline" className={getPriorityColor(alert.priority)}>
                      {alert.priority === 'high' ? 'Yüksek' : 
                       alert.priority === 'medium' ? 'Orta' : 'Düşük'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    {alert.class} • {alert.subject}
                    {alert.value && ` • ${alert.value}`}
                    {alert.deadline && ` • ${new Date(alert.deadline).toLocaleDateString('tr-TR')}`}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  İncele
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>
            Sık kullanılan not yönetimi işlemleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/grades?tab=entry">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Not Ekle
              </Button>
            </Link>
            
            <Link href="/dashboard/grades?tab=gradebook">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Not Defteri
              </Button>
            </Link>
            
            <Link href="/dashboard/grades?tab=analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analitik
              </Button>
            </Link>
            
            <Link href="/dashboard/grades?tab=reports">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Raporlar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}