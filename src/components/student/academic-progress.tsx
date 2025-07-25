'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for academic progress
interface AcademicGoal {
  id: string;
  title: string;
  targetGrade: number;
  currentGrade: number;
  subject: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'achieved' | 'missed';
  progress: number;
}

interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  currentGrade: number;
  previousGrade?: number;
  trend: 'up' | 'down' | 'stable';
  attendanceRate: number;
  assignmentCompletion: number;
  rank: number;
  totalStudents: number;
}

interface PerformanceTrend {
  month: string;
  gpa: number;
  attendance: number;
  assignmentCompletion: number;
}

interface AcademicProgressData {
  currentGPA: number;
  targetGPA: number;
  semesterProgress: number;
  attendanceRate: number;
  assignmentCompletion: number;
  goals: AcademicGoal[];
  subjectPerformance: SubjectPerformance[];
  trends: PerformanceTrend[];
  achievements: string[];
  improvementAreas: string[];
}

// Demo data for Turkish educational system
const DEMO_ACADEMIC_DATA: AcademicProgressData = {
  currentGPA: 3.2,
  targetGPA: 3.5,
  semesterProgress: 65,
  attendanceRate: 92,
  assignmentCompletion: 87,
  goals: [
    {
      id: '1',
      title: 'Matematik Notunu Yükselt',
      targetGrade: 90,
      currentGrade: 85.8,
      subject: 'Matematik',
      deadline: '2025-06-15',
      status: 'on_track',
      progress: 75
    },
    {
      id: '2',
      title: 'İngilizce Speaking Geliştir',
      targetGrade: 85,
      currentGrade: 77.7,
      subject: 'İngilizce',
      deadline: '2025-05-30',
      status: 'at_risk',
      progress: 60
    },
    {
      id: '3',
      title: 'Genel Ortalama 3.5',
      targetGrade: 88,
      currentGrade: 85.2,
      subject: 'Genel',
      deadline: '2025-06-30',
      status: 'on_track',
      progress: 70
    }
  ],
  subjectPerformance: [
    {
      subjectId: '1',
      subjectName: 'Matematik',
      currentGrade: 85.8,
      previousGrade: 82.5,
      trend: 'up',
      attendanceRate: 95,
      assignmentCompletion: 90,
      rank: 8,
      totalStudents: 32
    },
    {
      subjectId: '2',
      subjectName: 'Fizik',
      currentGrade: 82.3,
      previousGrade: 79.8,
      trend: 'up',
      attendanceRate: 88,
      assignmentCompletion: 85,
      rank: 12,
      totalStudents: 32
    },
    {
      subjectId: '3',
      subjectName: 'Türkçe',
      currentGrade: 91.7,
      previousGrade: 91.0,
      trend: 'stable',
      attendanceRate: 96,
      assignmentCompletion: 95,
      rank: 3,
      totalStudents: 32
    },
    {
      subjectId: '4',
      subjectName: 'İngilizce',
      currentGrade: 77.7,
      previousGrade: 80.2,
      trend: 'down',
      attendanceRate: 89,
      assignmentCompletion: 75,
      rank: 18,
      totalStudents: 32
    }
  ],
  trends: [
    { month: 'Eylül', gpa: 3.0, attendance: 88, assignmentCompletion: 82 },
    { month: 'Ekim', gpa: 3.1, attendance: 90, assignmentCompletion: 85 },
    { month: 'Kasım', gpa: 3.2, attendance: 92, assignmentCompletion: 87 },
    { month: 'Aralık', gpa: 3.2, attendance: 91, assignmentCompletion: 88 }
  ],
  achievements: [
    'Türkçe dersi sınıf 3.\'sü',
    'Matematik\'te istikrarlı yükseliş',
    'Son 3 ayda %92 devam oranı',
    'Ödev teslim oranı %87'
  ],
  improvementAreas: [
    'İngilizce speaking becerilerini geliştir',
    'Fizik laboratuvar raporlarında daha detaylı ol',
    'Ödev teslim zamanlarında daha punctual ol'
  ]
};

interface AcademicProgressProps {
  className?: string;
}

export function AcademicProgress({ className }: AcademicProgressProps) {
  const [progressData, setProgressData] = useState<AcademicProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'semester' | 'year'>('semester');

  // Load academic progress data
  useEffect(() => {
    async function fetchProgressData() {
      setIsLoading(true);
      
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/analytics/student/progress');
        // const result = await response.json();
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgressData(DEMO_ACADEMIC_DATA);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        setProgressData(DEMO_ACADEMIC_DATA);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgressData();
  }, []);

  // Get goal status badge
  const getGoalStatusBadge = (status: string) => {
    switch (status) {
      case 'on_track':
        return <Badge variant="outline" className="border-green-500 text-green-600">Hedefte</Badge>;
      case 'at_risk':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Risk Altında</Badge>;
      case 'achieved':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Ulaşıldı</Badge>;
      case 'missed':
        return <Badge variant="outline" className="border-red-500 text-red-600">Kaçırıldı</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  // Calculate GPA progress percentage
  const getGPAProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className={cn("text-center py-8", className)}>
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Akademik ilerleme verileri yüklenemedi</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Akademik İlerleme</h2>
        <div className="flex space-x-2">
          <Button
            variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe('month')}
          >
            Bu Ay
          </Button>
          <Button
            variant={selectedTimeframe === 'semester' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe('semester')}
          >
            Bu Dönem
          </Button>
          <Button
            variant={selectedTimeframe === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe('year')}
          >
            Bu Yıl
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mevcut GPA</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{progressData.currentGPA.toFixed(2)}</div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${getGPAProgress(progressData.currentGPA, progressData.targetGPA)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Hedef: {progressData.targetGPA}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devam Oranı</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">%{progressData.attendanceRate}</div>
            <p className="text-xs text-muted-foreground">Dönemlik ortalama</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ödev Tamamlama</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">%{progressData.assignmentCompletion}</div>
            <p className="text-xs text-muted-foreground">Teslim edilen ödevler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönem İlerlemesi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">%{progressData.semesterProgress}</div>
            <p className="text-xs text-muted-foreground">Dönemin tamamlanma oranı</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjects">Ders Performansı</TabsTrigger>
          <TabsTrigger value="goals">Akademik Hedefler</TabsTrigger>
          <TabsTrigger value="trends">İlerleme Trendi</TabsTrigger>
          <TabsTrigger value="insights">Analiz & Öneriler</TabsTrigger>
        </TabsList>

        {/* Subject Performance Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {progressData.subjectPerformance.map((subject) => (
              <Card key={subject.subjectId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{subject.subjectName}</CardTitle>
                      <CardDescription>
                        Sınıf Sırası: {subject.rank}/{subject.totalStudents}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(subject.trend)}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {subject.currentGrade.toFixed(1)}
                        </div>
                        {subject.previousGrade && (
                          <div className="text-xs text-gray-500">
                            Önceki: {subject.previousGrade.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Devam Oranı</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${subject.attendanceRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">%{subject.attendanceRate}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ödev Tamamlama</p>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${subject.assignmentCompletion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">%{subject.assignmentCompletion}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {progressData.goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.subject} • Hedef: {goal.targetGrade}</CardDescription>
                    </div>
                    {getGoalStatusBadge(goal.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">İlerleme</span>
                      <span className="text-sm font-medium">%{goal.progress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={cn(
                          "h-3 rounded-full transition-all",
                          goal.status === 'on_track' ? 'bg-green-500' :
                          goal.status === 'at_risk' ? 'bg-orange-500' :
                          goal.status === 'achieved' ? 'bg-blue-500' : 'bg-red-500'
                        )}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Mevcut: {goal.currentGrade}</span>
                      <span>Son Tarih: {new Date(goal.deadline).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5" />
                Dönemlik İlerleme Trendi
              </CardTitle>
              <CardDescription>Son 4 aylık performans değişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.trends.map((trend, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm font-medium">{trend.month}</div>
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">GPA</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(trend.gpa / 4) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">{trend.gpa.toFixed(1)}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Devam</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${trend.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">%{trend.attendance}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Ödevler</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${trend.assignmentCompletion}%` }}
                            ></div>
                          </div>
                          <span className="text-sm">%{trend.assignmentCompletion}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Award className="mr-2 h-5 w-5" />
                  Başarılar & Güçlü Yönler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {progressData.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <Target className="mr-2 h-5 w-5" />
                  Gelişim Alanları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {progressData.improvementAreas.map((area, index) => (
                    <li key={index} className="flex items-start">
                      <AlertTriangle className="mr-2 h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}