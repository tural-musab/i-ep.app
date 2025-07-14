/**
 * Assignment Dashboard Component
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Dashboard Widget
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Users,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export function AssignmentDashboard() {
  // Mock data - gerçek uygulamada API'den gelecek
  const stats = {
    totalAssignments: 15,
    activeAssignments: 8,
    pendingGrades: 23,
    completedAssignments: 7,
    averageScore: 78,
    completionRate: 85
  };

  const recentAssignments = [
    {
      id: '1',
      title: 'Matematik Problemleri',
      type: 'homework',
      class: '5-A',
      dueDate: '2025-01-20',
      submissions: 25,
      totalStudents: 30,
      graded: 20,
      status: 'active'
    },
    {
      id: '2',
      title: 'Fen Bilgisi Projesi',
      type: 'project',
      class: '5-B',
      dueDate: '2025-01-25',
      submissions: 18,
      totalStudents: 28,
      graded: 10,
      status: 'active'
    },
    {
      id: '3',
      title: 'Türkçe Kompozisyon',
      type: 'homework',
      class: '5-A',
      dueDate: '2025-01-18',
      submissions: 30,
      totalStudents: 30,
      graded: 30,
      status: 'completed'
    }
  ];

  const upcomingDeadlines = [
    {
      id: '4',
      title: 'İngilizce Kelime Testi',
      class: '6-A',
      dueDate: '2025-01-22',
      daysLeft: 2
    },
    {
      id: '5',
      title: 'Sosyal Bilgiler Araştırması',
      class: '6-B',
      dueDate: '2025-01-24',
      daysLeft: 4
    }
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'homework':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">Ödev</Badge>;
      case 'project':
        return <Badge variant="outline" className="bg-green-50 text-green-600">Proje</Badge>;
      case 'exam':
        return <Badge variant="outline" className="bg-red-50 text-red-600">Sınav</Badge>;
      case 'quiz':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600">Quiz</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktif</Badge>;
      case 'completed':
        return <Badge variant="secondary">Tamamlandı</Badge>;
      case 'draft':
        return <Badge variant="outline">Taslak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ödev Yönetimi</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/assignments">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Tüm Ödevler
            </Button>
          </Link>
          <Link href="/dashboard/assignments/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Ödev
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödev</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Tüm ödevler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Ödevler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            <p className="text-xs text-muted-foreground">Devam eden</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Notlar</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">Notlandırılacak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-muted-foreground">100 puan üzerinden</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Son Ödevler
            </CardTitle>
            <CardDescription>
              En son oluşturulan ödevlerin durumu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{assignment.title}</h3>
                      {getTypeBadge(assignment.type)}
                      {getStatusBadge(assignment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{assignment.class}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.submissions}/{assignment.totalStudents} teslim
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {assignment.graded} notlandı
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Progress 
                      value={(assignment.submissions / assignment.totalStudents) * 100} 
                      className="w-20 h-2"
                    />
                    <Link href={`/dashboard/assignments/${assignment.id}`}>
                      <Button variant="outline" size="sm">
                        Detay
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Yaklaşan Son Tarihler
            </CardTitle>
            <CardDescription>
              Teslim tarihi yaklaşan ödevler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{deadline.title}</h3>
                    <p className="text-sm text-gray-600">{deadline.class}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(deadline.dueDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={deadline.daysLeft <= 2 ? "destructive" : "outline"}>
                      {deadline.daysLeft} gün kaldı
                    </Badge>
                  </div>
                </div>
              ))}
              
              {upcomingDeadlines.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Yaklaşan son tarih bulunmuyor</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
          <CardDescription>
            Sık kullanılan ödev işlemleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/assignments/create">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ödev Oluştur
              </Button>
            </Link>
            
            <Link href="/dashboard/assignments?tab=grading">
              <Button variant="outline" className="w-full justify-start">
                <CheckCircle className="h-4 w-4 mr-2" />
                Notlandır ({stats.pendingGrades})
              </Button>
            </Link>
            
            <Link href="/dashboard/assignments?tab=active">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Aktif Ödevler ({stats.activeAssignments})
              </Button>
            </Link>
            
            <Link href="/dashboard/assignments?tab=analytics">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analitik & Raporlar
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}