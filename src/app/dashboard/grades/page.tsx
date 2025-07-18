/**
 * Grades Management Page
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Yönetim Sayfası
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Calculator,
  TrendingUp,
  Users,
  Award,
  FileText,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  BarChart3,
} from 'lucide-react';
import { GradeEntryForm } from '@/components/grades/grade-entry-form';
import { GradeBook } from '@/components/grades/grade-book';
import { GradeAnalytics } from '@/components/grades/grade-analytics';

export default function GradesPage() {
  // const [selectedClass, setSelectedClass] = useState('');
  // const [selectedSubject, setSelectedSubject] = useState('');
  // const [selectedSemester, setSelectedSemester] = useState('1');
  // const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - gerçek uygulamada API'den gelecek
  const gradeOverview = {
    totalStudents: 150,
    totalSubjects: 8,
    averageGPA: 3.2,
    gradedAssignments: 245,
    pendingGrades: 18,
    monthlyTrend: 'up',
    trendValue: 0.15,
  };

  const classPerformance = [
    {
      class: '5-A',
      students: 30,
      averageGPA: 3.4,
      subjectCount: 8,
      completionRate: 95,
      topSubject: 'Matematik',
      challengingSubject: 'Fen Bilgisi',
    },
    {
      class: '5-B',
      students: 28,
      averageGPA: 3.1,
      subjectCount: 8,
      completionRate: 88,
      topSubject: 'Türkçe',
      challengingSubject: 'Matematik',
    },
    {
      class: '6-A',
      students: 32,
      averageGPA: 3.3,
      subjectCount: 9,
      completionRate: 92,
      topSubject: 'Sosyal Bilgiler',
      challengingSubject: 'İngilizce',
    },
    {
      class: '6-B',
      students: 30,
      averageGPA: 3.0,
      subjectCount: 9,
      completionRate: 90,
      topSubject: 'Türkçe',
      challengingSubject: 'Fen Bilgisi',
    },
  ];

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
    },
  ];

  const subjectStatistics = [
    {
      subject: 'Matematik',
      totalStudents: 150,
      averageGrade: 82.5,
      passingRate: 88,
      highestGrade: 100,
      lowestGrade: 45,
      gradeDistribution: {
        A: 25,
        B: 45,
        C: 35,
        D: 20,
        F: 25,
      },
    },
    {
      subject: 'Türkçe',
      totalStudents: 150,
      averageGrade: 86.2,
      passingRate: 92,
      highestGrade: 98,
      lowestGrade: 52,
      gradeDistribution: {
        A: 35,
        B: 50,
        C: 30,
        D: 20,
        F: 15,
      },
    },
    {
      subject: 'Fen Bilgisi',
      totalStudents: 150,
      averageGrade: 79.8,
      passingRate: 85,
      highestGrade: 96,
      lowestGrade: 38,
      gradeDistribution: {
        A: 20,
        B: 40,
        C: 45,
        D: 25,
        F: 20,
      },
    },
  ];

  const pendingGrades = [
    {
      id: '1',
      class: '5-A',
      subject: 'Matematik',
      gradeType: 'Sınav',
      examName: 'Dönemlik Sınav',
      examDate: '2025-01-10',
      studentsCount: 30,
      gradedCount: 25,
      pendingCount: 5,
      teacher: 'Ahmet Öğretmen',
    },
    {
      id: '2',
      class: '5-B',
      subject: 'Türkçe',
      gradeType: 'Ödev',
      examName: 'Kompozisyon Ödevi',
      examDate: '2025-01-12',
      studentsCount: 28,
      gradedCount: 20,
      pendingCount: 8,
      teacher: 'Fatma Öğretmen',
    },
  ];

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getLetterGrade = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    if (gpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Not Yönetimi</h1>
          <p className="mt-2 text-gray-600">Öğrenci notlarını yönetin, analiz edin ve raporlayın</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Notları İçe Aktar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Not Ekle
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeOverview.totalStudents}</div>
            <p className="text-muted-foreground text-xs">{gradeOverview.totalSubjects} ders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama GPA</CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGPAColor(gradeOverview.averageGPA)}`}>
              {gradeOverview.averageGPA}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />+{gradeOverview.trendValue} bu ay
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notlanan Ödev</CardTitle>
            <Award className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeOverview.gradedAssignments}</div>
            <p className="text-muted-foreground text-xs">Bu dönem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Notlar</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{gradeOverview.pendingGrades}</div>
            <p className="text-muted-foreground text-xs">Not girilmesi gereken</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="gradebook">Not Defteri</TabsTrigger>
          <TabsTrigger value="entry">Not Girişi</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{classData.class}</h3>
                          <p className="text-sm text-gray-600">{classData.students} öğrenci</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getGPAColor(classData.averageGPA)}`}>
                            {classData.averageGPA}
                          </div>
                          <div className="text-sm text-gray-600">GPA</div>
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Tamamlanma Oranı</div>
                          <div className="flex items-center gap-2">
                            <Progress value={classData.completionRate} className="h-2" />
                            <span className="text-sm font-medium">{classData.completionRate}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Ders Sayısı</div>
                          <div className="text-lg font-bold">{classData.subjectCount}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">En Başarılı:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {classData.topSubject}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Zor Olan:</span>
                          <span className="ml-2 font-medium text-red-600">
                            {classData.challengingSubject}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subject Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Ders İstatistikleri
                </CardTitle>
                <CardDescription>Ders bazlı genel performans analizi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subjectStatistics.map((subject, index) => (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{subject.subject}</h3>
                          <p className="text-sm text-gray-600">{subject.totalStudents} öğrenci</p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${getGradeColor(subject.averageGrade, 100)}`}
                          >
                            {subject.averageGrade}
                          </div>
                          <div className="text-sm text-gray-600">Ortalama</div>
                        </div>
                      </div>

                      <div className="mb-3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Başarı Oranı</div>
                          <div className="flex items-center gap-2">
                            <Progress value={subject.passingRate} className="h-2" />
                            <span className="text-sm font-medium">{subject.passingRate}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Aralık</div>
                          <div className="text-sm font-medium">
                            {subject.lowestGrade} - {subject.highestGrade}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {Object.entries(subject.gradeDistribution).map(([letter, count]) => (
                          <Badge key={letter} variant="outline" className="text-xs">
                            {letter}: {count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{grade.student}</h3>
                        <p className="text-sm text-gray-600">
                          #{grade.studentNumber} • {grade.class}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{grade.subject}</div>
                        <div className="text-sm text-gray-600">{grade.gradeType}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Öğretmen</div>
                        <div className="text-sm font-medium">{grade.teacher}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={getGradeBadge(grade.grade, grade.maxGrade)}
                        >
                          {getLetterGrade(grade.grade, grade.maxGrade)}
                        </Badge>
                        <div className="mt-1 text-sm text-gray-600">
                          {grade.grade}/{grade.maxGrade}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Tarih</div>
                        <div className="text-sm font-medium">
                          {new Date(grade.date).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Bekleyen Notlar
              </CardTitle>
              <CardDescription>Not girişi bekleyen sınavlar ve ödevler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingGrades.map((pending) => (
                  <div key={pending.id} className="rounded-lg border bg-orange-50 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{pending.examName}</h3>
                        <p className="text-sm text-gray-600">
                          {pending.class} • {pending.subject} • {pending.gradeType}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        {pending.pendingCount} bekleyen
                      </Badge>
                    </div>

                    <div className="mb-3 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Toplam Öğrenci</div>
                        <div className="text-lg font-bold">{pending.studentsCount}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Notlanan</div>
                        <div className="text-lg font-bold text-green-600">
                          {pending.gradedCount}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Bekleyen</div>
                        <div className="text-lg font-bold text-orange-600">
                          {pending.pendingCount}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Sınav Tarihi: {new Date(pending.examDate).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Detay
                        </Button>
                        <Button size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Not Gir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade Book Tab */}
        <TabsContent value="gradebook" className="space-y-6">
          <GradeBook />
        </TabsContent>

        {/* Grade Entry Tab */}
        <TabsContent value="entry" className="space-y-6">
          <GradeEntryForm />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <GradeAnalytics />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Not Raporları</CardTitle>
              <CardDescription>Detaylı not raporlarını görüntüleyin ve indirin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium">Not Raporları</h3>
                <p className="mb-4 text-gray-600">Bu özellik yakında eklenecek</p>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Rapor Oluştur
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
