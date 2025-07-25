'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { StudentGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  FileText,
  Upload,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { ProgressiveDemoTour } from '@/components/demo/progressive-demo-tour';

// Types for assignments
interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  teacher: string;
  dueDate: string;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
  points: number;
  submissionStatus?: 'on_time' | 'late' | 'not_submitted';
  grade?: number;
  feedback?: string;
  attachments?: string[];
}

// Demo assignments data
const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: '1',
    title: 'Fonksiyonlar ve Grafikler',
    description: 'İkinci dereceden fonksiyonların grafik çizimi ve analizi',
    subject: 'Matematik',
    teacher: 'Ahmet Yılmaz',
    dueDate: '2025-01-30T23:59:59Z',
    status: 'not_started',
    points: 100,
    submissionStatus: 'not_submitted'
  },
  {
    id: '2',
    title: 'Elektrik Devreleri Analizi',
    description: 'Seri ve paralel devreler konusunda analiz raporu hazırlanması',
    subject: 'Fizik',
    teacher: 'Ayşe Demir',
    dueDate: '2025-01-28T23:59:59Z',
    status: 'in_progress',
    points: 80,
    submissionStatus: 'not_submitted'
  },
  {
    id: '3',
    title: 'Çevre Kirliliği Kompozisyonu',
    description: 'Çevre kirliliği konusunda 500 kelimelik kompozisyon yazımı',
    subject: 'Türkçe',
    teacher: 'Mehmet Kaya',
    dueDate: '2025-02-05T23:59:59Z',
    status: 'submitted',
    points: 90,
    submissionStatus: 'on_time',
    grade: 85,
    feedback: 'İyi bir çalışma, ancak sonuç bölümü daha detaylandırılabilir.'
  },
  {
    id: '4',
    title: 'İngilizce Sunum',
    description: 'Favorite hobby konusunda 5 dakikalık İngilizce sunum hazırlığı',
    subject: 'İngilizce',
    teacher: 'Zeynep Şahin',
    dueDate: '2025-01-22T23:59:59Z',
    status: 'overdue',
    points: 70,
    submissionStatus: 'not_submitted'
  },
  {
    id: '5',
    title: 'Kimya Deney Raporu',
    description: 'Asit-baz titrasyonu deney raporu',
    subject: 'Kimya',
    teacher: 'Ali Öztürk',
    dueDate: '2025-02-10T23:59:59Z',
    status: 'not_started',
    points: 100,
    submissionStatus: 'not_submitted'
  }
];

function StudentAssignmentContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const tourMode = searchParams.get('tour') === 'start';
  const tourRole = searchParams.get('role') || 'student';

  // Load assignments
  useEffect(() => {
    async function fetchAssignments() {
      if (!user) return;
      
      setIsLoadingAssignments(true);
      setError(null);

      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/assignments/student');
        // const result = await response.json();
        
        // For now, use demo data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
        setAssignments(DEMO_ASSIGNMENTS);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Ödevler yüklenirken hata oluştu');
        setAssignments(DEMO_ASSIGNMENTS);
      } finally {
        setIsLoadingAssignments(false);
      }
    }

    fetchAssignments();
  }, [user]);

  // Get status badge for assignment
  const getStatusBadge = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'not_started':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Başlanmadı</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Devam Ediyor</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Teslim Edildi</Badge>;
      case 'graded':
        return <Badge variant="outline" className="border-green-500 text-green-600">Değerlendirildi</Badge>;
      case 'overdue':
        return <Badge variant="outline" className="border-red-500 text-red-600">Süresi Geçti</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Get time remaining or status
  const getTimeInfo = (dueDate: string, status: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (status === 'submitted' || status === 'graded') {
      return { text: 'Teslim edildi', color: 'text-green-600', icon: CheckCircle };
    }

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} gün gecikmeli`, color: 'text-red-600', icon: AlertCircle };
    } else if (diffDays === 0) {
      return { text: 'Bugün son gün', color: 'text-red-600', icon: AlertCircle };
    } else if (diffDays === 1) {
      return { text: 'Yarın son gün', color: 'text-orange-600', icon: Clock };
    } else {
      return { text: `${diffDays} gün kaldı`, color: 'text-blue-600', icon: Clock };
    }
  };

  // Filter assignments by status
  const activeAssignments = assignments.filter(a => ['not_started', 'in_progress'].includes(a.status));
  const submittedAssignments = assignments.filter(a => ['submitted', 'graded'].includes(a.status));
  const overdueAssignments = assignments.filter(a => a.status === 'overdue');

  if (isLoading || isLoadingAssignments) {
    return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Giriş yapılmadı</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {tourMode && <ProgressiveDemoTour role={tourRole} />}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ödevlerim</h1>
            <p className="mt-2 text-gray-600">
              Aktif ödevlerinizi takip edin ve teslim edin
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödev</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Bu dönem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Ödevler</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Teslim bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teslim Edilenler</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{submittedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Değerlendirmede</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geciken Ödevler</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Acil eylem gerekli</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Aktif Ödevler ({activeAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Teslim Edilenler ({submittedAssignments.length})</TabsTrigger>
          <TabsTrigger value="all">Tüm Ödevler ({assignments.length})</TabsTrigger>
        </TabsList>

        {/* Active Assignments Tab */}
        <TabsContent value="active" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {activeAssignments.map((assignment) => {
              const timeInfo = getTimeInfo(assignment.dueDate, assignment.status);
              const TimeIcon = timeInfo.icon;
              
              return (
                <Card key={assignment.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {assignment.subject} • {assignment.teacher} • {assignment.points} puan
                        </CardDescription>
                        <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
                      </div>
                      <div className="ml-4 text-right">
                        {getStatusBadge(assignment)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(assignment.dueDate).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className={`flex items-center text-sm ${timeInfo.color}`}>
                          <TimeIcon className="mr-1 h-4 w-4" />
                          {timeInfo.text}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/ogrenci/odevler/${assignment.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Görüntüle
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/ogrenci/odevler/teslim/${assignment.id}`}>
                            <Upload className="mr-1 h-4 w-4" />
                            Teslim Et
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {activeAssignments.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Harika! Aktif ödeviniz yok</h3>
                <p className="text-gray-500">Tüm ödevlerinizi teslim etmişsiniz.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Submitted Assignments Tab */}
        <TabsContent value="submitted" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {assignment.subject} • {assignment.teacher} • {assignment.points} puan
                      </CardDescription>
                      {assignment.grade && (
                        <div className="mt-2 flex items-center space-x-2">
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            {assignment.grade}/{assignment.points} puan
                          </Badge>
                          {assignment.submissionStatus === 'on_time' && (
                            <Badge variant="outline" className="border-blue-500 text-blue-600">
                              Zamanında teslim
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      {getStatusBadge(assignment)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {assignment.feedback && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-3">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Öğretmen Geri Bildirimi:</h4>
                      <p className="text-sm text-blue-800">{assignment.feedback}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Teslim edildi
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/ogrenci/odevler/${assignment.id}`}>
                        <FileText className="mr-1 h-4 w-4" />
                        Detayları Görüntüle
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {submittedAssignments.length === 0 && (
              <div className="text-center py-12">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz teslim edilmiş ödev yok</h3>
                <p className="text-gray-500">Ödevlerinizi teslim etmeye başlayın.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* All Assignments Tab */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {assignments.map((assignment) => {
              const timeInfo = getTimeInfo(assignment.dueDate, assignment.status);
              const TimeIcon = timeInfo.icon;
              
              return (
                <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {assignment.subject} • {assignment.teacher} • {assignment.points} puan
                        </CardDescription>
                        <p className="mt-2 text-sm text-gray-600">{assignment.description}</p>
                      </div>
                      <div className="ml-4 text-right">
                        {getStatusBadge(assignment)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-4 w-4" />
                          {new Date(assignment.dueDate).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className={`flex items-center text-sm ${timeInfo.color}`}>
                          <TimeIcon className="mr-1 h-4 w-4" />
                          {timeInfo.text}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/ogrenci/odevler/${assignment.id}`}>
                            <Eye className="mr-1 h-4 w-4" />
                            Görüntüle
                          </Link>
                        </Button>
                        {['not_started', 'in_progress'].includes(assignment.status) && (
                          <Button size="sm" asChild>
                            <Link href={`/ogrenci/odevler/teslim/${assignment.id}`}>
                              <Upload className="mr-1 h-4 w-4" />
                              Teslim Et
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function StudentAssignmentsPage() {
  return (
    <StudentGuard
      fallback={
        <AccessDenied
          title="Öğrenci Girişi Gerekli"
          message="Bu sayfayı görüntülemek için öğrenci hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <StudentAssignmentContent />
      </Suspense>
    </StudentGuard>
  );
}