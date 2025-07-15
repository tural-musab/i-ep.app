/**
 * Attendance Reports Component
 * Sprint 4: Attendance System Development
 * İ-EP.APP - Devamsızlık Raporları
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, 
  Download, 
  FileText, 
  // Eye, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  // Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  // Filter,
  // Search
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AttendanceReports() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportType, setReportType] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  const summaryReport = {
    totalStudents: 150,
    totalSchoolDays: 20,
    averageAttendanceRate: 94.2,
    totalAbsences: 186,
    totalLates: 45,
    classBreakdown: [
      { class: '5-A', students: 30, attendanceRate: 95.1, absences: 28, lates: 8 },
      { class: '5-B', students: 28, attendanceRate: 93.8, absences: 32, lates: 12 },
      { class: '6-A', students: 32, attendanceRate: 94.7, absences: 38, lates: 15 },
      { class: '6-B', students: 30, attendanceRate: 93.2, absences: 45, lates: 10 }
    ]
  };

  const studentReport = [
    {
      id: '1',
      name: 'Ali Veli',
      number: '2025001',
      class: '5-A',
      totalDays: 20,
      presentDays: 18,
      absentDays: 2,
      lateDays: 1,
      attendanceRate: 90.0,
      consecutiveAbsences: 0,
      lastAbsence: '2025-01-10',
      trend: 'improving'
    },
    {
      id: '2',
      name: 'Ayşe Yılmaz',
      number: '2025002',
      class: '5-A',
      totalDays: 20,
      presentDays: 17,
      absentDays: 3,
      lateDays: 0,
      attendanceRate: 85.0,
      consecutiveAbsences: 2,
      lastAbsence: '2025-01-14',
      trend: 'declining'
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      number: '2025003',
      class: '5-A',
      totalDays: 20,
      presentDays: 19,
      absentDays: 1,
      lateDays: 2,
      attendanceRate: 95.0,
      consecutiveAbsences: 0,
      lastAbsence: '2025-01-05',
      trend: 'stable'
    }
  ];

  const dailyReport = [
    {
      date: '2025-01-15',
      totalStudents: 150,
      present: 142,
      absent: 8,
      late: 3,
      attendanceRate: 94.7,
      weather: 'Güneşli'
    },
    {
      date: '2025-01-14',
      totalStudents: 150,
      present: 138,
      absent: 12,
      late: 5,
      attendanceRate: 92.0,
      weather: 'Yağmurlu'
    },
    {
      date: '2025-01-13',
      totalStudents: 150,
      present: 145,
      absent: 5,
      late: 2,
      attendanceRate: 96.7,
      weather: 'Güneşli'
    }
  ];

  const chronicAbsentees = [
    {
      id: '1',
      name: 'Fatma Demir',
      number: '2025010',
      class: '5-A',
      absenceRate: 35.0,
      totalAbsences: 7,
      consecutiveAbsences: 4,
      parentContacted: true,
      interventionPlan: true
    },
    {
      id: '2',
      name: 'Ahmet Çelik',
      number: '2025015',
      class: '6-B',
      absenceRate: 25.0,
      totalAbsences: 5,
      consecutiveAbsences: 3,
      parentContacted: true,
      interventionPlan: false
    }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // API call will be implemented here
      console.log('Generating report:', {
        type: reportType,
        startDate,
        endDate,
        class: selectedClass,
        student: selectedStudent
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Rapor oluşturuldu!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Rapor oluşturulurken hata oluştu!');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report as ${format}`);
    // Export logic will be implemented here
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 95) return 'bg-green-100 text-green-800';
    if (rate >= 90) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Report Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Ayarları</CardTitle>
          <CardDescription>
            Oluşturmak istediğiniz rapor türünü ve parametrelerini seçin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Rapor Türü</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Rapor türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Genel Özet</SelectItem>
                  <SelectItem value="student">Öğrenci Bazlı</SelectItem>
                  <SelectItem value="daily">Günlük Rapor</SelectItem>
                  <SelectItem value="chronic">Kronik Devamsızlık</SelectItem>
                  <SelectItem value="class">Sınıf Bazlı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sınıf</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçin (isteğe bağlı)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sınıflar</SelectItem>
                  <SelectItem value="5-a">5-A</SelectItem>
                  <SelectItem value="5-b">5-B</SelectItem>
                  <SelectItem value="6-a">6-A</SelectItem>
                  <SelectItem value="6-b">6-B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Öğrenci</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Öğrenci seçin (isteğe bağlı)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öğrenciler</SelectItem>
                  <SelectItem value="1">Ali Veli</SelectItem>
                  <SelectItem value="2">Ayşe Yılmaz</SelectItem>
                  <SelectItem value="3">Mehmet Kaya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Başlangıç Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Bitiş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Rapor Oluştur
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Genel Özet</TabsTrigger>
          <TabsTrigger value="student">Öğrenci Bazlı</TabsTrigger>
          <TabsTrigger value="daily">Günlük Rapor</TabsTrigger>
          <TabsTrigger value="chronic">Kronik Devamsızlık</TabsTrigger>
        </TabsList>

        {/* Summary Report */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Genel Özet Raporu</CardTitle>
                  <CardDescription>
                    15 Ocak 2025 tarihindeki genel devamsızlık özeti
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{summaryReport.totalStudents}</div>
                  <div className="text-sm text-blue-800">Toplam Öğrenci</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">%{summaryReport.averageAttendanceRate}</div>
                  <div className="text-sm text-green-800">Ortalama Devamsızlık</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{summaryReport.totalAbsences}</div>
                  <div className="text-sm text-red-800">Toplam Devamsızlık</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{summaryReport.totalLates}</div>
                  <div className="text-sm text-yellow-800">Toplam Geç Kalma</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sınıf Bazlı Dağılım</h3>
                {summaryReport.classBreakdown.map((classData, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{classData.class}</h4>
                      <p className="text-sm text-gray-600">{classData.students} öğrenci</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getAttendanceRateColor(classData.attendanceRate)}`}>
                          %{classData.attendanceRate}
                        </div>
                        <div className="text-sm text-gray-600">devamsızlık oranı</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{classData.absences}</div>
                        <div className="text-sm text-gray-600">devamsızlık</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-600">{classData.lates}</div>
                        <div className="text-sm text-gray-600">geç kalma</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Report */}
        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Öğrenci Bazlı Rapor</CardTitle>
                  <CardDescription>
                    Her öğrencinin detaylı devamsızlık durumu
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentReport.map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">#{student.number} • {student.class}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getAttendanceRateBadge(student.attendanceRate)}>
                          %{student.attendanceRate}
                        </Badge>
                        {getTrendIcon(student.trend)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{student.presentDays}</div>
                        <div className="text-sm text-gray-600">Mevcut Gün</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{student.absentDays}</div>
                        <div className="text-sm text-gray-600">Devamsız Gün</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{student.lateDays}</div>
                        <div className="text-sm text-gray-600">Geç Kalma</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{student.consecutiveAbsences}</div>
                        <div className="text-sm text-gray-600">Ardışık Devamsızlık</div>
                      </div>
                    </div>
                    
                    {student.consecutiveAbsences > 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Son devamsızlık: {new Date(student.lastAbsence).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daily Report */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Günlük Devamsızlık Raporu</CardTitle>
                  <CardDescription>
                    Son günlerin devamsızlık durumu
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyReport.map((day, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">
                          {new Date(day.date).toLocaleDateString('tr-TR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <p className="text-sm text-gray-600">Hava: {day.weather}</p>
                      </div>
                      <Badge variant="outline" className={getAttendanceRateBadge(day.attendanceRate)}>
                        %{day.attendanceRate}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{day.totalStudents}</div>
                        <div className="text-sm text-gray-600">Toplam Öğrenci</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{day.present}</div>
                        <div className="text-sm text-gray-600">Mevcut</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{day.absent}</div>
                        <div className="text-sm text-gray-600">Devamsız</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{day.late}</div>
                        <div className="text-sm text-gray-600">Geç</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chronic Absentees */}
        <TabsContent value="chronic" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Kronik Devamsızlık Raporu</CardTitle>
                  <CardDescription>
                    Yüksek devamsızlık oranına sahip öğrenciler (&gt;%20)
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chronicAbsentees.map((student) => (
                  <div key={student.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-red-900">{student.name}</h3>
                        <p className="text-sm text-red-700">#{student.number} • {student.class}</p>
                      </div>
                      <Badge variant="destructive">
                        %{student.absenceRate} devamsızlık
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{student.totalAbsences}</div>
                        <div className="text-sm text-red-700">Toplam Devamsızlık</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{student.consecutiveAbsences}</div>
                        <div className="text-sm text-red-700">Ardışık Devamsızlık</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {student.parentContacted ? 'Evet' : 'Hayır'}
                        </div>
                        <div className="text-sm text-red-700">Veli İletişimi</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {student.parentContacted ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Veli İletişimi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.interventionPlan ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">Müdahale Planı</span>
                      </div>
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