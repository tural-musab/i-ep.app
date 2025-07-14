/**
 * Grade Analytics Component
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Analitikleri
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart,
  Users,
  BookOpen,
  Calculator,
  Award,
  AlertCircle,
  Target,
  Calendar,
  Filter,
  Download
} from 'lucide-react';

export function GradeAnalytics() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [selectedSemester, setSelectedSemester] = useState('1');

  // Mock data - gerçek uygulamada API'den gelecek
  const overallStats = {
    totalStudents: 150,
    totalSubjects: 8,
    averageGPA: 3.2,
    totalGrades: 1250,
    passingRate: 88.5,
    topPerformers: 12,
    needsAttention: 8,
    trendDirection: 'up',
    trendValue: 0.15
  };

  const classPerformance = [
    {
      class: '5-A',
      students: 30,
      averageGPA: 3.4,
      passingRate: 92.3,
      topSubject: 'Matematik',
      challengingSubject: 'Fen Bilgisi',
      trend: 'up',
      trendValue: 0.2
    },
    {
      class: '5-B',
      students: 28,
      averageGPA: 3.1,
      passingRate: 87.5,
      topSubject: 'Türkçe',
      challengingSubject: 'Matematik',
      trend: 'down',
      trendValue: -0.1
    },
    {
      class: '6-A',
      students: 32,
      averageGPA: 3.3,
      passingRate: 90.6,
      topSubject: 'Sosyal Bilgiler',
      challengingSubject: 'İngilizce',
      trend: 'up',
      trendValue: 0.15
    },
    {
      class: '6-B',
      students: 30,
      averageGPA: 3.0,
      passingRate: 85.0,
      topSubject: 'Türkçe',
      challengingSubject: 'Fen Bilgisi',
      trend: 'stable',
      trendValue: 0.05
    }
  ];

  const subjectAnalysis = [
    {
      subject: 'Matematik',
      averageGrade: 82.5,
      passingRate: 88.0,
      totalStudents: 150,
      gradeDistribution: {
        'A': 25,
        'B': 45,
        'C': 50,
        'D': 20,
        'F': 10
      },
      difficulty: 'Orta',
      improvement: 2.3,
      topPerformers: ['5-A', '6-A']
    },
    {
      subject: 'Türkçe',
      averageGrade: 86.2,
      passingRate: 92.0,
      totalStudents: 150,
      gradeDistribution: {
        'A': 35,
        'B': 55,
        'C': 40,
        'D': 15,
        'F': 5
      },
      difficulty: 'Kolay',
      improvement: 1.8,
      topPerformers: ['5-B', '6-B']
    },
    {
      subject: 'Fen Bilgisi',
      averageGrade: 79.8,
      passingRate: 85.0,
      totalStudents: 150,
      gradeDistribution: {
        'A': 20,
        'B': 40,
        'C': 55,
        'D': 25,
        'F': 10
      },
      difficulty: 'Zor',
      improvement: -0.5,
      topPerformers: ['6-A']
    },
    {
      subject: 'Sosyal Bilgiler',
      averageGrade: 88.1,
      passingRate: 94.0,
      totalStudents: 150,
      gradeDistribution: {
        'A': 40,
        'B': 60,
        'C': 35,
        'D': 10,
        'F': 5
      },
      difficulty: 'Kolay',
      improvement: 3.1,
      topPerformers: ['6-A', '5-A']
    }
  ];

  const performanceTrends = [
    { month: 'Eylül', average: 78.5, passingRate: 82.0 },
    { month: 'Ekim', average: 80.2, passingRate: 84.5 },
    { month: 'Kasım', average: 81.8, passingRate: 86.2 },
    { month: 'Aralık', average: 83.1, passingRate: 87.8 },
    { month: 'Ocak', average: 84.3, passingRate: 89.1 }
  ];

  const gradeDistributionData = [
    { grade: 'A', count: 120, percentage: 32.0, color: 'bg-green-500' },
    { grade: 'B', count: 160, percentage: 42.7, color: 'bg-blue-500' },
    { grade: 'C', count: 80, percentage: 21.3, color: 'bg-yellow-500' },
    { grade: 'D', count: 10, percentage: 2.7, color: 'bg-orange-500' },
    { grade: 'F', count: 5, percentage: 1.3, color: 'bg-red-500' }
  ];

  const studentInsights = [
    {
      type: 'top_performers',
      title: 'En Başarılı Öğrenciler',
      students: [
        { name: 'Ayşe Yılmaz', class: '5-A', gpa: 3.9, improvement: 0.2 },
        { name: 'Mehmet Kaya', class: '6-A', gpa: 3.8, improvement: 0.3 },
        { name: 'Fatma Demir', class: '5-B', gpa: 3.7, improvement: 0.1 }
      ],
      color: 'bg-green-50 border-green-200'
    },
    {
      type: 'most_improved',
      title: 'En Çok Gelişen Öğrenciler',
      students: [
        { name: 'Ali Veli', class: '5-A', gpa: 3.2, improvement: 0.8 },
        { name: 'Zehra Kaya', class: '6-B', gpa: 3.0, improvement: 0.7 },
        { name: 'Ahmet Çelik', class: '5-B', gpa: 2.8, improvement: 0.6 }
      ],
      color: 'bg-blue-50 border-blue-200'
    },
    {
      type: 'needs_attention',
      title: 'Dikkat Gerektiren Öğrenciler',
      students: [
        { name: 'Emre Yılmaz', class: '6-B', gpa: 1.8, improvement: -0.3 },
        { name: 'Seda Kaya', class: '5-A', gpa: 2.0, improvement: -0.2 },
        { name: 'Burak Demir', class: '6-A', gpa: 2.1, improvement: -0.1 }
      ],
      color: 'bg-red-50 border-red-200'
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Kolay': return 'text-green-600';
      case 'Orta': return 'text-yellow-600';
      case 'Zor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    if (gpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Not Analitiği
          </CardTitle>
          <CardDescription>
            Detaylı performans analizi ve trendler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sınıf</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sınıflar</SelectItem>
                  <SelectItem value="5-a">5-A</SelectItem>
                  <SelectItem value="5-b">5-B</SelectItem>
                  <SelectItem value="6-a">6-A</SelectItem>
                  <SelectItem value="6-b">6-B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ders</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Dersler</SelectItem>
                  <SelectItem value="matematik">Matematik</SelectItem>
                  <SelectItem value="turkce">Türkçe</SelectItem>
                  <SelectItem value="fen">Fen Bilgisi</SelectItem>
                  <SelectItem value="sosyal">Sosyal Bilgiler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dönem</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1. Dönem</SelectItem>
                  <SelectItem value="2">2. Dönem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Rapor İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama GPA</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averageGPA}</div>
            <div className={`flex items-center text-xs ${getTrendColor(overallStats.trendDirection)}`}>
              {getTrendIcon(overallStats.trendDirection)}
              <span className="ml-1">+{overallStats.trendValue} bu dönem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Oranı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{overallStats.passingRate}</div>
            <div className="text-xs text-muted-foreground">
              {overallStats.totalStudents} öğrenci
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarılı Öğrenci</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.topPerformers}</div>
            <div className="text-xs text-muted-foreground">
              GPA > 3.5
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dikkat Gerektiren</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.needsAttention}</div>
            <div className="text-xs text-muted-foreground">
              GPA < 2.0
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classes">Sınıflar</TabsTrigger>
          <TabsTrigger value="subjects">Dersler</TabsTrigger>
          <TabsTrigger value="trends">Trendler</TabsTrigger>
          <TabsTrigger value="distribution">Dağılım</TabsTrigger>
          <TabsTrigger value="insights">İçgörüler</TabsTrigger>
        </TabsList>

        {/* Class Performance */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sınıf Performans Analizi
              </CardTitle>
              <CardDescription>
                Her sınıfın detaylı akademik performansı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classPerformance.map((classData, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{classData.class}</CardTitle>
                          <CardDescription>
                            {classData.students} öğrenci
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getGradeColor(classData.averageGPA * 25)}>
                            GPA: {classData.averageGPA}
                          </Badge>
                          {getTrendIcon(classData.trend)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Başarı Oranı</span>
                            <span className="text-sm font-medium">%{classData.passingRate}</span>
                          </div>
                          <Progress value={classData.passingRate} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">En Başarılı:</span>
                            <div className="font-medium text-green-600">{classData.topSubject}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Zor Olan:</span>
                            <div className="font-medium text-red-600">{classData.challengingSubject}</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-gray-600">Dönem Trendi</span>
                          <div className={`flex items-center gap-1 text-sm ${getTrendColor(classData.trend)}`}>
                            {getTrendIcon(classData.trend)}
                            <span>
                              {classData.trend === 'up' ? '+' : classData.trend === 'down' ? '-' : ''}
                              {Math.abs(classData.trendValue).toFixed(1)}
                            </span>
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

        {/* Subject Analysis */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ders Analizi
              </CardTitle>
              <CardDescription>
                Derslerin zorluk seviyesi ve performans dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectAnalysis.map((subject, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{subject.subject}</h3>
                        <p className="text-sm text-gray-600">{subject.totalStudents} öğrenci</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(subject.difficulty)}>
                          {subject.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getGradeColor(subject.averageGrade)}>
                          {subject.averageGrade}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Sınıf Ortalaması</div>
                        <div className={`text-2xl font-bold ${getGradeColor(subject.averageGrade)}`}>
                          {subject.averageGrade}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Başarı Oranı</div>
                        <div className="text-2xl font-bold text-blue-600">
                          %{subject.passingRate}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Gelişim</div>
                        <div className={`text-2xl font-bold ${subject.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {subject.improvement > 0 ? '+' : ''}{subject.improvement}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Not Dağılımı</div>
                        <div className="flex gap-2">
                          {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                            <div key={grade} className="text-center">
                              <div className="text-sm font-medium">{grade}</div>
                              <div className="text-xs text-gray-600">{count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium mb-2">En Başarılı Sınıflar</div>
                        <div className="flex gap-2">
                          {subject.topPerformers.map((className, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {className}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Performans Trendleri
              </CardTitle>
              <CardDescription>
                Aylık akademik performans gelişimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">{trend.month}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium ${getGradeColor(trend.average)}`}>
                            {trend.average}
                          </span>
                          <div className="w-32">
                            <Progress value={trend.average} className="h-2" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Başarı oranı: %{trend.passingRate}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{trend.average}</div>
                      <div className="text-xs text-gray-600">ortalama</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grade Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Not Dağılımı
              </CardTitle>
              <CardDescription>
                Harf notlarının genel dağılımı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gradeDistributionData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Not {item.grade}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{item.count} öğrenci</span>
                        <span className="text-sm font-medium">%{item.percentage}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentage} className="h-2" />
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Insights */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studentInsights.map((insight, index) => (
              <Card key={index} className={`border-2 ${insight.color}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insight.students.map((student, studentIndex) => (
                      <div key={studentIndex} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-600">{student.class}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getGPAColor(student.gpa)}`}>
                            {student.gpa}
                          </div>
                          <div className={`text-sm ${student.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {student.improvement > 0 ? '+' : ''}{student.improvement}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}