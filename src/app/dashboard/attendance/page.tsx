/**
 * Attendance Management Dashboard
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Devamsızlık Yönetimi
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  UserCheck,
  UserX,
  TrendingUp,
  Search,
  Download,
  Send,
  Eye,
  Edit
} from 'lucide-react';
import Link from 'next/link';

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/giris');
  }

  // Mock data - gerçek uygulamada repository'den gelecek
  // const todayDate = new Date().toISOString().split('T')[0];
  
  const attendanceStats = {
    totalStudents: 150,
    presentToday: 142,
    absentToday: 8,
    lateToday: 3,
    attendanceRate: 94.7,
    weeklyAverage: 93.2,
    monthlyAverage: 94.1,
    trend: 'up' as const
  };

  const classAttendance = [
    {
      classId: '5-a',
      className: '5-A',
      totalStudents: 30,
      present: 28,
      absent: 2,
      late: 1,
      attendanceRate: 93.3,
      lastMarked: '2025-01-15T08:30:00',
      markedBy: 'Ahmet Öğretmen'
    },
    {
      classId: '5-b',
      className: '5-B',
      totalStudents: 28,
      present: 26,
      absent: 2,
      late: 0,
      attendanceRate: 92.9,
      lastMarked: '2025-01-15T08:45:00',
      markedBy: 'Ayşe Öğretmen'
    },
    {
      classId: '6-a',
      className: '6-A',
      totalStudents: 32,
      present: 30,
      absent: 2,
      late: 0,
      attendanceRate: 93.8,
      lastMarked: '2025-01-15T09:00:00',
      markedBy: 'Mehmet Öğretmen'
    }
  ];

  const absentStudents = [
    {
      id: '1',
      name: 'Ali Veli',
      number: '2025001',
      class: '5-A',
      status: 'absent',
      lastSeen: '2025-01-14',
      parentNotified: false,
      consecutiveAbsences: 2,
      reason: null
    },
    {
      id: '2',
      name: 'Ayşe Yılmaz',
      number: '2025002',
      class: '5-B',
      status: 'sick',
      lastSeen: '2025-01-13',
      parentNotified: true,
      consecutiveAbsences: 3,
      reason: 'Hastalık'
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      number: '2025003',
      class: '6-A',
      status: 'late',
      lastSeen: '2025-01-15',
      parentNotified: true,
      consecutiveAbsences: 0,
      reason: 'Geç kalma'
    }
  ];

  const chronicAbsentees = [
    {
      id: '1',
      name: 'Fatma Demir',
      number: '2025010',
      class: '5-A',
      absenceRate: 28.5,
      totalAbsences: 12,
      consecutiveAbsences: 5,
      lastAttendance: '2025-01-10'
    },
    {
      id: '2',
      name: 'Ahmet Çelik',
      number: '2025015',
      class: '6-B',
      absenceRate: 22.3,
      totalAbsences: 9,
      consecutiveAbsences: 3,
      lastAttendance: '2025-01-12'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-100 text-green-800">Mevcut</Badge>;
      case 'absent':
        return <Badge variant="destructive">Devamsız</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Geç</Badge>;
      case 'sick':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Hasta</Badge>;
      case 'excused':
        return <Badge variant="secondary">Mazeret</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devamsızlık Yönetimi</h1>
          <p className="text-gray-600 mt-2">Öğrenci devamsızlığını takip edin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/attendance/daily">
            <Button variant="outline">
              <Clock className="mr-2 h-4 w-4" />
              Günlük Yoklama
            </Button>
          </Link>
          <Link href="/dashboard/attendance/reports">
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Rapor Al
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Mevcut</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.totalStudents} öğrenciden
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün Devamsız</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.absentToday}</div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.lateToday} geç kalma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devamsızlık Oranı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{attendanceStats.attendanceRate}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.9% bu hafta
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Ortalama</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">%{attendanceStats.monthlyAverage}</div>
            <p className="text-xs text-muted-foreground">
              Haftalık: %{attendanceStats.weeklyAverage}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="classes">Sınıflar</TabsTrigger>
          <TabsTrigger value="absent">Devamsızlar</TabsTrigger>
          <TabsTrigger value="chronic">Kronik</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Bugünkü Özet</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Toplam Öğrenci</span>
                    <span className="text-2xl font-bold">{attendanceStats.totalStudents}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Mevcut</span>
                      <span>{attendanceStats.presentToday}</span>
                    </div>
                    <Progress value={(attendanceStats.presentToday / attendanceStats.totalStudents) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Devamsız</span>
                      <span>{attendanceStats.absentToday}</span>
                    </div>
                    <Progress value={(attendanceStats.absentToday / attendanceStats.totalStudents) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Geç Kalma</span>
                      <span>{attendanceStats.lateToday}</span>
                    </div>
                    <Progress value={(attendanceStats.lateToday / attendanceStats.totalStudents) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Haftalık Trend</CardTitle>
                <CardDescription>
                  Son 7 günün devamsızlık oranları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: 'Pazartesi', rate: 95.2 },
                    { day: 'Salı', rate: 93.8 },
                    { day: 'Çarşamba', rate: 94.1 },
                    { day: 'Perşembe', rate: 92.5 },
                    { day: 'Cuma', rate: 94.7 },
                    { day: 'Cumartesi', rate: 96.1 },
                    { day: 'Pazar', rate: 0 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Progress value={item.rate} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-12">
                          {item.rate > 0 ? `%${item.rate}` : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sınıf Bazlı Devamsızlık</CardTitle>
              <CardDescription>
                Her sınıfın bugünkü devamsızlık durumu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classAttendance.map((classData) => (
                  <Card key={classData.classId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{classData.className}</CardTitle>
                          <CardDescription>
                            Son yoklama: {new Date(classData.lastMarked).toLocaleTimeString('tr-TR')} - {classData.markedBy}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getAttendanceRateColor(classData.attendanceRate)}`}>
                            %{classData.attendanceRate}
                          </div>
                          <div className="text-sm text-gray-600">devamsızlık oranı</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{classData.present}</div>
                          <div className="text-sm text-gray-600">Mevcut</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{classData.absent}</div>
                          <div className="text-sm text-gray-600">Devamsız</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{classData.late}</div>
                          <div className="text-sm text-gray-600">Geç</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{classData.totalStudents}</div>
                          <div className="text-sm text-gray-600">Toplam</div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link href={`/dashboard/attendance/daily?class=${classData.classId}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Detay
                          </Button>
                        </Link>
                        <Link href={`/dashboard/attendance/mark?class=${classData.classId}`}>
                          <Button size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Yoklama Al
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Absent Students Tab */}
        <TabsContent value="absent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bugün Devamsız Öğrenciler</CardTitle>
              <CardDescription>
                Bugün devamsızlığı bulunan öğrenciler ve durumları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {absentStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">#{student.number} • {student.class}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(student.status)}
                        {student.consecutiveAbsences > 0 && (
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">
                            {student.consecutiveAbsences} gün ardışık
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Son görülme: {new Date(student.lastSeen).toLocaleDateString('tr-TR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Veli bildirim: {student.parentNotified ? 'Gönderildi' : 'Bekliyor'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!student.parentNotified && (
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Bildir
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Detay
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chronic Absentees Tab */}
        <TabsContent value="chronic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kronik Devamsızlık</CardTitle>
              <CardDescription>
                Yüksek devamsızlık oranına sahip öğrenciler (&gt;%20)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chronicAbsentees.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg border-red-200 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-red-900">{student.name}</h3>
                        <p className="text-sm text-red-700">#{student.number} • {student.class}</p>
                      </div>
                      <Badge variant="destructive">
                        %{student.absenceRate} devamsızlık
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{student.totalAbsences}</div>
                        <div className="text-sm text-red-700">Toplam devamsızlık</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{student.consecutiveAbsences}</div>
                        <div className="text-sm text-red-700">Ardışık devamsızlık</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {new Date(student.lastAttendance).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="text-sm text-red-700">Son devam</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Müdahale Planı
                      </Button>
                      <Button variant="outline" size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Veli Görüşmesi
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veli Bildirimleri</CardTitle>
              <CardDescription>
                Devamsızlık bildirimlerini yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Öğrenci ara..." className="pl-8" />
                    </div>
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Durum filtresi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Durumlar</SelectItem>
                      <SelectItem value="pending">Bekleyen</SelectItem>
                      <SelectItem value="sent">Gönderildi</SelectItem>
                      <SelectItem value="failed">Başarısız</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Toplu Bildir
                  </Button>
                </div>

                <div className="space-y-4">
                  {absentStudents.filter(s => !s.parentNotified).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-600">#{student.number} • {student.class}</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-100 text-amber-800">
                          Bildirim Bekliyor
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">SMS + E-posta</p>
                          <p className="text-sm text-gray-600">Devamsızlık bildirimi</p>
                        </div>
                        <Button size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Gönder
                        </Button>
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