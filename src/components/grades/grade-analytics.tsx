/**
 * Grade Analytics Component
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Analitikleri
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  // TrendingDown,
  BarChart3,
  // PieChart,
  Calculator,
  Users,
  BookOpen,
  Target,
  // Calendar,
  Download,
} from 'lucide-react';

export function GradeAnalytics() {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  // const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [selectedSemester, setSelectedSemester] = useState('1');

  // Mock data - gerçek uygulamada API'den gelecek
  const mockAnalytics = {
    classAverage: 75.5,
    passingRate: 85,
    trend: 'up',
    totalStudents: 120,
    subjectAverages: [
      { subject: 'Matematik', average: 72.5, students: 30 },
      { subject: 'Türkçe', average: 78.2, students: 30 },
      { subject: 'Fen Bilgisi', average: 74.8, students: 30 },
      { subject: 'Sosyal Bilgiler', average: 76.3, students: 30 },
    ],
    gradeDistribution: [
      { grade: 'A', count: 15, percentage: 12.5 },
      { grade: 'B', count: 35, percentage: 29.2 },
      { grade: 'C', count: 45, percentage: 37.5 },
      { grade: 'D', count: 20, percentage: 16.7 },
      { grade: 'F', count: 5, percentage: 4.2 },
    ],
    topPerformers: [
      { name: 'Ali Yılmaz', class: '5-A', gpa: 3.8, subjects: 4 },
      { name: 'Ayşe Demir', class: '5-B', gpa: 3.7, subjects: 4 },
      { name: 'Mehmet Kaya', class: '5-C', gpa: 3.6, subjects: 4 },
    ],
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
          <CardDescription>Detaylı performans analizi ve trendler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sınıf</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sınıflar</SelectItem>
                  <SelectItem value="5-A">5-A</SelectItem>
                  <SelectItem value="5-B">5-B</SelectItem>
                  <SelectItem value="5-C">5-C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ders</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Dersler</SelectItem>
                  <SelectItem value="math">Matematik</SelectItem>
                  <SelectItem value="turkish">Türkçe</SelectItem>
                  <SelectItem value="science">Fen Bilgisi</SelectItem>
                  <SelectItem value="social">Sosyal Bilgiler</SelectItem>
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
            <Button className="mb-1">
              <Download className="mr-2 h-4 w-4" />
              Rapor İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sınıf Ortalaması</CardTitle>
            <Calculator className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.classAverage}</div>
            <div className="text-muted-foreground flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +2.5 önceki döneme göre
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geçme Oranı</CardTitle>
            <Target className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.passingRate}%</div>
            <Progress value={mockAnalytics.passingRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.totalStudents}</div>
            <div className="text-muted-foreground text-xs">Aktif öğrenci sayısı</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En İyi Performans</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.topPerformers[0].gpa}</div>
            <div className="text-muted-foreground text-xs">
              {mockAnalytics.topPerformers[0].name}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Not Dağılımı</TabsTrigger>
          <TabsTrigger value="subjects">Ders Analizi</TabsTrigger>
          <TabsTrigger value="top-performers">En İyi Performans</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Not Dağılımı</CardTitle>
              <CardDescription>Öğrencilerin not dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.gradeDistribution.map((item) => (
                  <div key={item.grade} className="flex items-center space-x-4">
                    <div className="w-8 font-mono text-sm font-medium">{item.grade}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm">{item.count} öğrenci</span>
                        <span className="text-muted-foreground text-sm">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ders Bazlı Analiz</CardTitle>
              <CardDescription>Derslere göre ortalama performans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.subjectAverages.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-muted-foreground text-sm">
                        {subject.students} öğrenci
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={subject.average} className="flex-1" />
                      <span className="font-mono text-sm">{subject.average}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-performers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>En İyi Performans Gösterenler</CardTitle>
              <CardDescription>Yüksek GPA&apos;ya sahip öğrenciler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAnalytics.topPerformers.map((student, index) => (
                  <div
                    key={student.name}
                    className="flex items-center space-x-4 rounded-lg border p-3"
                  >
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-muted-foreground text-sm">{student.class}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-sm font-medium ${getGPAColor(student.gpa)}`}>
                        {student.gpa}
                      </div>
                      <div className="text-muted-foreground text-xs">{student.subjects} ders</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
