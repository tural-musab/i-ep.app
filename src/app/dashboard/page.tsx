import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AssignmentDashboard } from '@/components/assignments/assignment-dashboard'
import { AttendanceDashboard } from '@/components/attendance/attendance-dashboard'
import { GradeDashboard } from '@/components/grades/grade-dashboard'
import { ParentCommunicationDashboard } from '@/components/parent-communication/parent-communication-dashboard'
import { ScheduleDashboard } from '@/components/schedule/schedule-dashboard'
import { FileText, User, Users, Calendar, BarChart3, Clock } from 'lucide-react'

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/giris')
  }

  // Mock data (gerçek uygulamada API'den gelecek)
  const stats: Record<string, unknown> = {
    totalStudents: 150,
    totalTeachers: 12,
    totalClasses: 8,
    pendingAssignments: 23
  }

  const recentActivities: Record<string, unknown>[] = [
    { id: 1, type: 'assignment', message: 'Matematik ödevi teslim edildi', time: '2 saat önce' },
    { id: 2, type: 'grade', message: 'Fen bilgisi sınavı notlandırıldı', time: '4 saat önce' },
    { id: 3, type: 'attendance', message: 'Günlük yoklama tamamlandı', time: '6 saat önce' }
  ]
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Hoş geldiniz, {session.user?.name || session.user?.email}</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Öğrenci</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalStudents as number}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Toplam Öğretmen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalTeachers as number}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Toplam Sınıf</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalClasses as number}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bekleyen Ödevler</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingAssignments as number}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
          <CardDescription>Sistemdeki son hareketler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id as string} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span>{activity.message as string}</span>
                <span className="text-sm text-gray-500">{activity.time as string}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Assignment Dashboard */}
      <div className="mt-8">
        <AssignmentDashboard />
      </div>
      
      {/* Attendance Dashboard */}
      <div className="mt-8">
        <AttendanceDashboard />
      </div>
      
      {/* Grade Dashboard */}
      <div className="mt-8">
        <GradeDashboard />
      </div>
      
      {/* Parent Communication Dashboard */}
      <div className="mt-8">
        <ParentCommunicationDashboard />
      </div>
      
      {/* Schedule Management Dashboard */}
      <div className="mt-8">
        <ScheduleDashboard />
      </div>
      
      {/* Report Generation Widget */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapor Sistemi
            </CardTitle>
            <CardDescription>
              Detaylı performans ve analiz raporları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex flex-col items-center gap-2">
                  <User className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">Öğrenci Performansı</span>
                  <span className="text-xs text-gray-600">Akademik ve davranışsal</span>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">Sınıf Analizi</span>
                  <span className="text-xs text-gray-600">Karşılaştırmalı analiz</span>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6 text-purple-500" />
                  <span className="text-sm font-medium">Devam Raporu</span>
                  <span className="text-xs text-gray-600">Devam takip analizi</span>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex flex-col items-center gap-2">
                  <Clock className="h-6 w-6 text-indigo-500" />
                  <span className="text-sm font-medium">Ders Programı</span>
                  <span className="text-xs text-gray-600">Program yönetimi</span>
                </div>
              </Button>
              
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-orange-500" />
                  <span className="text-sm font-medium">Tüm Raporlar</span>
                  <span className="text-xs text-gray-600">Kapsamlı sistem</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}