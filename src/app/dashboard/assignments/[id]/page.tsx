/**
 * Assignment Detail Page
 * Sprint 3: Assignment System Development
 * İ-EP.APP - Ödev Detay Sayfası
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Send,
  FileText,
  BarChart3,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface AssignmentDetailProps {
  params: {
    id: string;
  };
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/giris');
  }

  // Mock data - gerçek uygulamada repository'den gelecek
  const assignment = {
    id: params.id,
    title: 'Matematik Problemleri',
    description: 'Temel matematik problemlerini çözen bir ödev',
    type: 'homework',
    subject: 'Matematik',
    class: {
      id: '5-a',
      name: '5-A',
      studentCount: 30
    },
    teacher: {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@okul.com'
    },
    dueDate: '2025-01-20',
    maxScore: 100,
    status: 'published',
    createdAt: '2025-01-15',
    instructions: 'Lütfen tüm problemleri adım adım çözün ve gösterin.',
    isGraded: true,
    allowLateSubmission: false,
    showResultsToStudents: true,
    submissions: [
      {
        id: '1',
        student: {
          id: '1',
          name: 'Ali Veli',
          number: '2025001'
        },
        submissionDate: '2025-01-18',
        score: 85,
        status: 'graded',
        feedback: 'Güzel bir çalışma, sadece 3. soruda küçük bir hata var.'
      },
      {
        id: '2',
        student: {
          id: '2',
          name: 'Ayşe Yılmaz',
          number: '2025002'
        },
        submissionDate: '2025-01-19',
        score: null,
        status: 'submitted',
        feedback: null
      }
    ],
    rubric: [
      {
        criteria: 'Problem Çözme',
        points: 40,
        description: 'Problemleri doğru şekilde çözme'
      },
      {
        criteria: 'Gösterim',
        points: 30,
        description: 'Çözüm adımlarını net gösterme'
      },
      {
        criteria: 'Sunum',
        points: 30,
        description: 'Düzenli ve temiz sunum'
      }
    ]
  };

  const stats = {
    totalStudents: assignment.class.studentCount,
    totalSubmissions: assignment.submissions.length,
    gradedSubmissions: assignment.submissions.filter(s => s.status === 'graded').length,
    pendingSubmissions: assignment.submissions.filter(s => s.status === 'submitted').length,
    averageScore: assignment.submissions.filter(s => s.score !== null).reduce((acc, s) => acc + (s.score || 0), 0) / assignment.submissions.filter(s => s.score !== null).length || 0,
    completionRate: (assignment.submissions.length / assignment.class.studentCount) * 100
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

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge variant="secondary">Notlandırıldı</Badge>;
      case 'submitted':
        return <Badge variant="outline">Teslim Edildi</Badge>;
      case 'late':
        return <Badge variant="destructive">Geç Teslim</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/assignments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
              {getTypeBadge(assignment.type)}
              {getStatusBadge(assignment.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{assignment.subject}</span>
              <span>•</span>
              <span>{assignment.class.name}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Son teslim: {new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <Link href={`/dashboard/assignments/${assignment.id}/grade`}>
            <Button size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Notlandır
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teslim Oranı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}/{stats.totalStudents}</div>
            <div className="mt-2">
              <Progress value={stats.completionRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              %{Math.round(stats.completionRate)} tamamlandı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notlandırma</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gradedSubmissions}/{stats.totalSubmissions}</div>
            <div className="mt-2">
              <Progress value={(stats.gradedSubmissions / stats.totalSubmissions) * 100} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingSubmissions} bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Puan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageScore)}</div>
            <div className="mt-2">
              <Progress value={stats.averageScore} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {assignment.maxScore} puan üzerinden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Notlandırılacak teslim
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="submissions">Teslimler</TabsTrigger>
          <TabsTrigger value="rubric">Rubrik</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödev Detayları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Açıklama</h3>
                <p className="text-gray-600">{assignment.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Talimatlar</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{assignment.instructions}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Ödev Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Maksimum Puan:</span>
                      <span>{assignment.maxScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notlandırılacak:</span>
                      <span>{assignment.isGraded ? 'Evet' : 'Hayır'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geç Teslim:</span>
                      <span>{assignment.allowLateSubmission ? 'İzin Veriliyor' : 'İzin Verilmiyor'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sonuçlar Görüntülenebilir:</span>
                      <span>{assignment.showResultsToStudents ? 'Evet' : 'Hayır'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Öğretmen Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Öğretmen:</span>
                      <span>{assignment.teacher.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>E-posta:</span>
                      <span>{assignment.teacher.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oluşturulma:</span>
                      <span>{new Date(assignment.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Öğrenci Teslimler</CardTitle>
              <CardDescription>
                {stats.totalSubmissions} teslim, {stats.gradedSubmissions} notlandırıldı, {stats.pendingSubmissions} bekliyor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignment.submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{submission.student.name}</h3>
                        <p className="text-sm text-gray-600">#{submission.student.number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSubmissionStatusBadge(submission.status)}
                        <span className="text-sm text-gray-600">
                          {new Date(submission.submissionDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {submission.score !== null && (
                        <div className="text-right">
                          <span className="text-lg font-bold">{submission.score}</span>
                          <span className="text-sm text-gray-600">/{assignment.maxScore}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          İndir
                        </Button>
                        {submission.status === 'submitted' && (
                          <Button size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Notlandır
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rubric Tab */}
        <TabsContent value="rubric" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Değerlendirme Rubriği</CardTitle>
              <CardDescription>
                Ödevin değerlendirilme kriterleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignment.rubric.map((criterion, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{criterion.criteria}</h3>
                      <Badge variant="outline">{criterion.points} puan</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{criterion.description}</p>
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
              <CardTitle>Performans Analizi</CardTitle>
              <CardDescription>
                Ödev performansı ve istatistikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">Puan Dağılımı</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>90-100</span>
                      <span>2 öğrenci</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>80-89</span>
                      <span>3 öğrenci</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>70-79</span>
                      <span>1 öğrenci</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Teslim Zamanları</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Zamanında</span>
                      <span>{assignment.submissions.length} teslim</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Geç</span>
                      <span>0 teslim</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}