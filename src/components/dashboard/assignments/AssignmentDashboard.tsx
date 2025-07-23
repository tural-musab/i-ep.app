/**
 * Assignment Dashboard Client Component
 * Phase 6.1 - Component-level API Integration
 * İ-EP.APP - Real API Integration for Assignment Management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { assignmentApi, Assignment, AssignmentStatistics } from '@/lib/api/assignment-api';

export default function AssignmentDashboard() {
  // State management
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [statistics, setStatistics] = useState<AssignmentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  /**
   * Fetch assignments from API
   */
  const fetchAssignments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      console.log('🔧 Assignment Dashboard - Fetching assignments...');
      
      const response = await assignmentApi.getAssignments({
        search: searchTerm || undefined,
        // Add filters when needed
      });

      console.log('✅ Assignment Dashboard - Successfully fetched assignments:', response);
      
      setAssignments(response.data);
    } catch (error) {
      console.error('❌ Assignment Dashboard - Error fetching assignments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch assignments';
      setError(errorMessage);
      toast.error('Ödevler yüklenirken hata oluştu: ' + errorMessage);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  /**
   * Fetch statistics from API
   */
  const fetchStatistics = async (showLoading = true) => {
    try {
      if (showLoading) setStatisticsLoading(true);

      console.log('🔧 Assignment Dashboard - Fetching statistics...');
      
      const stats = await assignmentApi.getStatistics();

      console.log('✅ Assignment Dashboard - Successfully fetched statistics:', stats);
      
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Assignment Dashboard - Error fetching statistics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch statistics';
      toast.error('İstatistikler yüklenirken hata oluştu: ' + errorMessage);
    } finally {
      if (showLoading) setStatisticsLoading(false);
    }
  };

  /**
   * Refresh all data
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchAssignments(false),
      fetchStatistics(false)
    ]);
    setRefreshing(false);
    toast.success('Veriler güncellendi');
  };

  // Initial data fetch
  useEffect(() => {
    fetchAssignments();
    fetchStatistics();
  }, []);

  // Filter assignments based on current filters
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = searchTerm === '' || 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || assignment.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    
    return matchesSearch && matchesSubject && matchesStatus;
  });

  // Helper functions for UI
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

  // Statistics calculation from real data
  const calculatedStats = {
    totalAssignments: assignments.length,
    activeAssignments: assignments.filter((a) => a.status === 'published').length,
    completedAssignments: assignments.filter((a) => a.status === 'completed').length,
    pendingGrades: statistics?.pendingGrades || 0, // From API
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ödev Yönetimi</h1>
          <p className="mt-2 text-gray-600">Ödevleri oluşturun, takip edin ve değerlendirin</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Link href="/dashboard/assignments/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Yeni Ödev Oluştur
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödev</CardTitle>
            <BookOpen className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{calculatedStats.totalAssignments}</div>
            )}
            <p className="text-muted-foreground text-xs">Tüm ödevler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Ödevler</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{calculatedStats.activeAssignments}</div>
            )}
            <p className="text-muted-foreground text-xs">Devam eden ödevler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Notlar</CardTitle>
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{calculatedStats.pendingGrades}</div>
            )}
            <p className="text-muted-foreground text-xs">Notlandırılmayı bekleyen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statisticsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{calculatedStats.completedAssignments}</div>
            )}
            <p className="text-muted-foreground text-xs">Tamamlanan ödevler</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>Hata: {error}</span>
              <Button onClick={() => fetchAssignments()} variant="outline" size="sm">
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <Input 
                      placeholder="Ödev ara..." 
                      className="pl-8" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ders seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Dersler</SelectItem>
                    <SelectItem value="Matematik">Matematik</SelectItem>
                    <SelectItem value="Türkçe">Türkçe</SelectItem>
                    <SelectItem value="Fen Bilgisi">Fen Bilgisi</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredAssignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium">Henüz ödev yok</h3>
                    <p className="mt-2">
                      {assignments.length === 0 
                        ? 'İlk ödevinizi oluşturun' 
                        : 'Filtrelere uygun ödev bulunamadı'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Real assignments list
              filteredAssignments.map((assignment) => (
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
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Son teslim: {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
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
                        <span className="text-sm">Maksimum puan: {assignment.max_score}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {assignment.is_graded ? 'Notlandırıldı' : 'Notlandırılmadı'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">
                          {new Date(assignment.created_at).toLocaleDateString('tr-TR')} tarihinde oluşturuldu
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Other tabs with filtered data */}
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
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Son teslim: {new Date(assignment.due_date).toLocaleDateString('tr-TR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Max puan: {assignment.max_score}
                        </p>
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
              {statistics && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-medium">Genel İstatistikler</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tamamlanma Oranı:</span>
                        <span className="font-medium">{statistics.completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ortalama Not:</span>
                        <span className="font-medium">{statistics.averageGrade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bekleyen Notlar:</span>
                        <span className="font-medium">{statistics.pendingGrades}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Son Ödevler</h3>
                    <div className="space-y-2">
                      {statistics.recentAssignments?.map((assignment) => (
                        <div key={assignment.id} className="flex justify-between text-sm">
                          <span className="truncate">{assignment.title}</span>
                          <span className="text-gray-500">{assignment.submission_count} teslim</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Tab - Show assignments that need grading */}
        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notlandırılacak Ödevler</CardTitle>
              <CardDescription>Notlandırma bekleyen ödevler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments
                  .filter((a) => !a.is_graded && a.status === 'published')
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.subject}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-amber-600">
                            Notlandırma gerekli
                          </p>
                          <p className="text-sm text-gray-600">
                            Max puan: {assignment.max_score}
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
      </Tabs>
    </div>
  );
}