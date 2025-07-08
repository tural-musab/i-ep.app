import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    </div>
  )
}