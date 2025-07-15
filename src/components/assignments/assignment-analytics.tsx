/**
 * Assignment Analytics Component
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Analitik & Raporları
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Target,
  Calendar,
  BookOpen,
  Award
} from 'lucide-react';

export function AssignmentAnalytics() {
  // Mock data - gerçek uygulamada API'den gelecek
  const overallStats = {
    totalAssignments: 45,
    averageScore: 78.5,
    completionRate: 85.2,
    onTimeSubmissionRate: 92.3,
    averageTimeToComplete: 3.5, // days
    improvementRate: 12.3 // percentage
  };

  const subjectPerformance = [
    {
      subject: 'Matematik',
      assignments: 12,
      averageScore: 82.1,
      completionRate: 88.5,
      trend: 'up',
      trendValue: 5.2
    },
    {
      subject: 'Fen Bilgisi',
      assignments: 10,
      averageScore: 79.3,
      completionRate: 91.2,
      trend: 'up',
      trendValue: 3.8
    },
    {
      subject: 'Türkçe',
      assignments: 8,
      averageScore: 74.7,
      completionRate: 82.1,
      trend: 'down',
      trendValue: -2.1
    },
    {
      subject: 'Sosyal Bilgiler',
      assignments: 7,
      averageScore: 81.4,
      completionRate: 85.7,
      trend: 'up',
      trendValue: 7.3
    },
    {
      subject: 'İngilizce',
      assignments: 8,
      averageScore: 76.9,
      completionRate: 79.4,
      trend: 'down',
      trendValue: -1.5
    }
  ];

  const classPerformance = [
    {
      class: '5-A',
      studentCount: 30,
      averageScore: 81.2,
      completionRate: 89.5,
      assignmentsCompleted: 156,
      topStudent: 'Ali Veli',
      topScore: 95.2
    },
    {
      class: '5-B',
      studentCount: 28,
      averageScore: 78.8,
      completionRate: 85.1,
      assignmentsCompleted: 142,
      topStudent: 'Ayşe Kaya',
      topScore: 93.7
    },
    {
      class: '6-A',
      studentCount: 32,
      averageScore: 76.3,
      completionRate: 83.2,
      assignmentsCompleted: 168,
      topStudent: 'Mehmet Yılmaz',
      topScore: 91.8
    }
  ];

  const timeAnalysis = [
    {
      period: 'Bu Hafta',
      assignments: 8,
      submissions: 187,
      averageScore: 79.3,
      completionRate: 87.2
    },
    {
      period: 'Geçen Hafta',
      assignments: 6,
      submissions: 145,
      averageScore: 77.1,
      completionRate: 84.5
    },
    {
      period: 'Bu Ay',
      assignments: 23,
      submissions: 612,
      averageScore: 78.7,
      completionRate: 85.8
    },
    {
      period: 'Geçen Ay',
      assignments: 22,
      submissions: 588,
      averageScore: 76.2,
      completionRate: 82.3
    }
  ];

  const difficultyAnalysis = [
    {
      level: 'Kolay',
      assignments: 15,
      averageScore: 87.3,
      completionRate: 94.2,
      timeToComplete: 2.1
    },
    {
      level: 'Orta',
      assignments: 25,
      averageScore: 76.8,
      completionRate: 84.6,
      timeToComplete: 3.8
    },
    {
      level: 'Zor',
      assignments: 5,
      averageScore: 68.2,
      completionRate: 71.4,
      timeToComplete: 5.2
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genel Ortalama</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averageScore}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-3 w-3" />
              +{overallStats.improvementRate}% bu ay
            </div>
            <Progress value={overallStats.averageScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanma Oranı</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{overallStats.completionRate}</div>
            <div className="text-sm text-gray-600">
              Zamanında teslim: %{overallStats.onTimeSubmissionRate}
            </div>
            <Progress value={overallStats.completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Tamamlama</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.averageTimeToComplete} gün</div>
            <div className="text-sm text-gray-600">
              Toplam {overallStats.totalAssignments} ödev
            </div>
            <Progress value={75} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="subjects" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subjects">Dersler</TabsTrigger>
          <TabsTrigger value="classes">Sınıflar</TabsTrigger>
          <TabsTrigger value="time">Zaman Analizi</TabsTrigger>
          <TabsTrigger value="difficulty">Zorluk Analizi</TabsTrigger>
        </TabsList>

        {/* Subject Performance */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ders Bazlı Performans
              </CardTitle>
              <CardDescription>
                Her dersin ödev performansı ve trendleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{subject.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{subject.assignments} ödev</span>
                        <span>Ortalama: {subject.averageScore}</span>
                        <span>Tamamlanma: %{subject.completionRate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {getTrendIcon(subject.trend)}
                          <span className={`text-sm font-medium ${getTrendColor(subject.trend)}`}>
                            {subject.trend === 'up' ? '+' : ''}{subject.trendValue}%
                          </span>
                        </div>
                      </div>
                      <div className="w-24">
                        <Progress value={subject.averageScore} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Class Performance */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sınıf Bazlı Performans
              </CardTitle>
              <CardDescription>
                Her sınıfın ödev performansı ve en başarılı öğrenciler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classPerformance.map((classData) => (
                  <Card key={classData.class}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{classData.class}</CardTitle>
                          <CardDescription>
                            {classData.studentCount} öğrenci • {classData.assignmentsCompleted} tamamlanan ödev
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{classData.averageScore}</div>
                          <div className="text-sm text-gray-600">ortalama</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Tamamlanma Oranı</span>
                            <span>%{classData.completionRate}</span>
                          </div>
                          <Progress value={classData.completionRate} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>En Başarılı: {classData.topStudent}</span>
                            <span>{classData.topScore}</span>
                          </div>
                          <Progress value={classData.topScore} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Analysis */}
        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Zaman Bazlı Analiz
              </CardTitle>
              <CardDescription>
                Farklı zaman periyotlarında ödev performansı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {timeAnalysis.map((period) => (
                  <Card key={period.period}>
                    <CardHeader>
                      <CardTitle className="text-lg">{period.period}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Ödev Sayısı</span>
                          <Badge variant="outline">{period.assignments}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Toplam Teslim</span>
                          <Badge variant="outline">{period.submissions}</Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Ortalama Puan</span>
                            <span>{period.averageScore}</span>
                          </div>
                          <Progress value={period.averageScore} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Tamamlanma Oranı</span>
                            <span>%{period.completionRate}</span>
                          </div>
                          <Progress value={period.completionRate} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Difficulty Analysis */}
        <TabsContent value="difficulty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Zorluk Seviyesi Analizi
              </CardTitle>
              <CardDescription>
                Farklı zorluk seviyelerindeki ödev performansları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {difficultyAnalysis.map((level) => (
                  <div key={level.level} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{level.level}</h3>
                        <p className="text-sm text-gray-600">{level.assignments} ödev</p>
                      </div>
                      <Badge variant={
                        level.level === 'Kolay' ? 'default' : 
                        level.level === 'Orta' ? 'secondary' : 
                        'outline'
                      }>
                        {level.level}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Ortalama Puan</span>
                          <span>{level.averageScore}</span>
                        </div>
                        <Progress value={level.averageScore} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Tamamlanma Oranı</span>
                          <span>%{level.completionRate}</span>
                        </div>
                        <Progress value={level.completionRate} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Tamamlama Süresi</span>
                          <span>{level.timeToComplete} gün</span>
                        </div>
                        <Progress value={(level.timeToComplete / 7) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Öneriler ve İçgörüler
          </CardTitle>
          <CardDescription>
            Veriler doğrultusunda öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Güçlü Alanlar</h4>
                  <p className="text-sm text-green-700">
                    Matematik ve Sosyal Bilgiler derslerinde performans artışı gözlemleniyor.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Olumlu Trend</h4>
                  <p className="text-sm text-blue-700">
                    Zamanında teslim oranı %92&apos;ye çıktı. Öğrenciler süreleri daha iyi yönetiyor.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Dikkat Edilmesi Gerekenler</h4>
                  <p className="text-sm text-amber-700">
                    Türkçe ve İngilizce derslerinde performans düşüşü var. Ek destek sağlanabilir.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Öneriler</h4>
                  <p className="text-sm text-purple-700">
                    Zor ödevlerde daha fazla rehberlik ve ara teslimler düşünülebilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}