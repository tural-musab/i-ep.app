/**
 * Assignment Management Dashboard
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Yönetimi
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PlusCircle,
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/giris');
  }

  // Mock data - gerçek uygulamada repository'den gelecek
  const assignments = [
    {
      id: '1',
      title: 'Matematik Problemleri',
      type: 'homework',
      subject: 'Matematik',
      class: '5-A',
      dueDate: '2025-01-20',
      totalSubmissions: 25,
      gradedSubmissions: 20,
      status: 'published',
      createdAt: '2025-01-15',
    },
    {
      id: '2',
      title: 'Fen Bilgisi Projesi',
      type: 'project',
      subject: 'Fen Bilgisi',
      class: '5-B',
      dueDate: '2025-01-25',
      totalSubmissions: 18,
      gradedSubmissions: 10,
      status: 'published',
      createdAt: '2025-01-16',
    },
    {
      id: '3',
      title: 'Türkçe Kompozisyon',
      type: 'homework',
      subject: 'Türkçe',
      class: '5-A',
      dueDate: '2025-01-18',
      totalSubmissions: 30,
      gradedSubmissions: 30,
      status: 'completed',
      createdAt: '2025-01-10',
    },
  ];

  const stats = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter((a) => a.status === 'published').length,
    pendingGrades: assignments.reduce(
      (acc, a) => acc + (a.totalSubmissions - a.gradedSubmissions),
      0
    ),
    completedAssignments: assignments.filter((a) => a.status === 'completed').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Aktif</Badge>;
      case 'completed':
        return <Badge variant="secondary">Tamamlandı</Badge>;
      case 'draft':
        return <Badge variant="outline">Taslak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'homework':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600">
            Ödev
          </Badge>
        );
      case 'project':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600">
            Proje
          </Badge>
        );
      case 'exam':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600">
            Sınav
          </Badge>
        );
      case 'quiz':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600">
            Quiz
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödev Yönetimi</h1>
          <p className="mt-2 text-gray-600">Ödevleri oluşturun, takip edin ve değerlendirin</p>
        </div>
        <Link href="/dashboard/assignments/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Ödev Oluştur
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödev</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-muted-foreground text-xs">Tüm ödevler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Ödevler</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAssignments}</div>
            <p className="text-muted-foreground text-xs">Devam eden ödevler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Notlar</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrades}</div>
            <p className="text-muted-foreground text-xs">Notlandırılmayı bekleyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments}</div>
            <p className="text-muted-foreground text-xs">Tamamlanan ödevler</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Tüm Ödevler</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="grading">Notlandırılacak</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* All Assignments Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtreler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="min-w-[200px] flex-1">
                  <div className="relative">
                    <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                    <Input placeholder="Ödev ara..." className="pl-8" />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sınıf seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sınıflar</SelectItem>
                    <SelectItem value="5-a">5-A</SelectItem>
                    <SelectItem value="5-b">5-B</SelectItem>
                    <SelectItem value="6-a">6-A</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ders seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Dersler</SelectItem>
                    <SelectItem value="matematik">Matematik</SelectItem>
                    <SelectItem value="fen">Fen Bilgisi</SelectItem>
                    <SelectItem value="turkce">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Durum seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="published">Aktif</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="draft">Taslak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        {getTypeBadge(assignment.type)}
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{assignment.subject}</span>
                        <span>•</span>
                        <span>{assignment.class}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Son teslim: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/assignments/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          Detay
                        </Button>
                      </Link>
                      <Link href={`/dashboard/assignments/${assignment.id}/grade`}>
                        <Button variant="outline" size="sm">
                          Notlandır
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{assignment.totalSubmissions} teslim</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{assignment.gradedSubmissions} notlandırıldı</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">
                        {assignment.totalSubmissions - assignment.gradedSubmissions} bekliyor
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Assignments Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktif Ödevler</CardTitle>
              <CardDescription>Şu anda devam eden ödevler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments
                  .filter((a) => a.status === 'published')
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">
                          {assignment.subject} • {assignment.class}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Son teslim: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assignment.totalSubmissions - assignment.gradedSubmissions}{' '}
                          notlandırılacak
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Tab */}
        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notlandırılacak Ödevler</CardTitle>
              <CardDescription>Bekleyen teslimler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments
                  .filter((a) => a.totalSubmissions > a.gradedSubmissions)
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">
                          {assignment.subject} • {assignment.class}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-600">
                            {assignment.totalSubmissions - assignment.gradedSubmissions} bekliyor
                          </p>
                          <p className="text-sm text-gray-600">
                            {assignment.gradedSubmissions}/{assignment.totalSubmissions} tamamlandı
                          </p>
                        </div>
                        <Link href={`/dashboard/assignments/${assignment.id}/grade`}>
                          <Button size="sm">Notlandır</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödev Analitikleri</CardTitle>
              <CardDescription>Genel performans ve istatistikler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Teslim Oranları</h3>
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{assignment.title}</span>
                        <span>{Math.round((assignment.totalSubmissions / 30) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${(assignment.totalSubmissions / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Notlandırma Durumu</h3>
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{assignment.title}</span>
                        <span>
                          {assignment.gradedSubmissions}/{assignment.totalSubmissions}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600"
                          style={{
                            width: `${(assignment.gradedSubmissions / assignment.totalSubmissions) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
