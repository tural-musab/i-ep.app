'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Download,
  FileText,
  PieChart,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface StudentReport {
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  subjects: {
    name: string;
    grades: number[];
    average: number;
    letterGrade: string;
    status: 'passed' | 'failed' | 'pending';
  }[];
  overallAverage: number;
  attendanceRate: number;
  totalAbsences: number;
  assignmentCompletion: number;
  behaviorScore: number;
  rank: number;
}

interface ClassReport {
  classId: string;
  className: string;
  totalStudents: number;
  averageGrade: number;
  attendanceRate: number;
  passRate: number;
  topPerformers: string[];
  needsAttention: string[];
  subjectPerformance: {
    subject: string;
    average: number;
    passRate: number;
  }[];
}

interface TeacherReport {
  teacherId: string;
  teacherName: string;
  subjects: string[];
  classes: string[];
  totalStudents: number;
  averageClassPerformance: number;
  gradingCompletion: number;
  assignmentsGiven: number;
  parentCommunication: number;
}

interface AttendanceReport {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export default function ReportsPage() {
  const { currentTenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current_term');
  const [reportType, setReportType] = useState<string>('overview');

  // Mock data
  const mockStudentReports: StudentReport[] = [
    {
      studentId: 'student1',
      studentName: 'Ahmet Yılmaz',
      studentNumber: '2024001',
      className: '9-A',
      subjects: [
        { name: 'Matematik', grades: [85, 78, 92], average: 85, letterGrade: 'BA', status: 'passed' },
        { name: 'Fizik', grades: [78, 82, 75], average: 78.3, letterGrade: 'BB', status: 'passed' },
        { name: 'Türkçe', grades: [90, 88, 95], average: 91, letterGrade: 'AA', status: 'passed' },
      ],
      overallAverage: 84.8,
      attendanceRate: 95,
      totalAbsences: 3,
      assignmentCompletion: 92,
      behaviorScore: 85,
      rank: 3,
    },
    {
      studentId: 'student2',
      studentName: 'Ayşe Demir',
      studentNumber: '2024002',
      className: '9-A',
      subjects: [
        { name: 'Matematik', grades: [92, 88, 95], average: 91.7, letterGrade: 'AA', status: 'passed' },
        { name: 'Fizik', grades: [85, 90, 88], average: 87.7, letterGrade: 'BA', status: 'passed' },
        { name: 'Türkçe', grades: [95, 92, 98], average: 95, letterGrade: 'AA', status: 'passed' },
      ],
      overallAverage: 91.5,
      attendanceRate: 98,
      totalAbsences: 1,
      assignmentCompletion: 98,
      behaviorScore: 95,
      rank: 1,
    },
  ];

  const mockClassReports: ClassReport[] = [
    {
      classId: 'class1',
      className: '9-A',
      totalStudents: 28,
      averageGrade: 82.5,
      attendanceRate: 94,
      passRate: 92,
      topPerformers: ['Ayşe Demir', 'Mehmet Kaya', 'Ahmet Yılmaz'],
      needsAttention: ['Ali Veli'],
      subjectPerformance: [
        { subject: 'Matematik', average: 81, passRate: 89 },
        { subject: 'Fizik', average: 79, passRate: 85 },
        { subject: 'Türkçe', average: 87, passRate: 96 },
      ],
    },
  ];

  const mockTeacherReports: TeacherReport[] = [
    {
      teacherId: 'teacher1',
      teacherName: 'Mehmet Öztürk',
      subjects: ['Matematik'],
      classes: ['9-A', '10-B'],
      totalStudents: 56,
      averageClassPerformance: 81.5,
      gradingCompletion: 95,
      assignmentsGiven: 12,
      parentCommunication: 45,
    },
  ];

  const mockAttendanceReports: AttendanceReport[] = [
    { date: '2024-12-09', totalStudents: 28, present: 26, absent: 2, late: 1, excused: 1, attendanceRate: 92.9 },
    { date: '2024-12-10', totalStudents: 28, present: 27, absent: 1, late: 0, excused: 0, attendanceRate: 96.4 },
    { date: '2024-12-11', totalStudents: 28, present: 25, absent: 3, late: 2, excused: 1, attendanceRate: 89.3 },
    { date: '2024-12-12', totalStudents: 28, present: 28, absent: 0, late: 0, excused: 0, attendanceRate: 100 },
    { date: '2024-12-13', totalStudents: 28, present: 26, absent: 2, late: 1, excused: 1, attendanceRate: 92.9 },
  ];

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Raporlar yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadReports();
    }
  }, [currentTenantId]);

  const generateReport = () => {
    alert(`${reportType} raporu ${selectedPeriod} dönemi için oluşturuluyor...`);
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    alert(`Rapor ${format.toUpperCase()} formatında dışa aktarılıyor...`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Raporlar ve Analizler</h1>
          <p className="text-gray-600">Akademik ve operasyonel raporları görüntüleyin</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={generateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Rapor Oluştur
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Rapor Filtreleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rapor Türü</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Rapor türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Genel Bakış</SelectItem>
                  <SelectItem value="academic">Akademik Rapor</SelectItem>
                  <SelectItem value="attendance">Devam Raporu</SelectItem>
                  <SelectItem value="teacher">Öğretmen Raporu</SelectItem>
                  <SelectItem value="parent">Veli Raporu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sınıf</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Sınıf seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sınıflar</SelectItem>
                  <SelectItem value="9-A">9-A</SelectItem>
                  <SelectItem value="10-B">10-B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ders</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Ders seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Dersler</SelectItem>
                  <SelectItem value="math">Matematik</SelectItem>
                  <SelectItem value="physics">Fizik</SelectItem>
                  <SelectItem value="turkish">Türkçe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dönem</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Dönem seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_term">Bu Dönem</SelectItem>
                  <SelectItem value="previous_term">Geçen Dönem</SelectItem>
                  <SelectItem value="academic_year">Akademik Yıl</SelectItem>
                  <SelectItem value="custom">Özel Tarih</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Öğrenci</p>
                <p className="text-xl font-semibold">156</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5 bu ay
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <BarChart3 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ortalama Not</p>
                <p className="text-xl font-semibold">82.5</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1 bu dönem
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Devam Oranı</p>
                <p className="text-xl font-semibold">94.2%</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -1.5% bu ay
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Başarı Oranı</p>
                <p className="text-xl font-semibold">91.8%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.2% bu dönem
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Öğrenciler</span>
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Sınıflar</span>
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Öğretmenler</span>
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Devam</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Öğrenci Performans Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudentReports.map((student) => (
                  <div key={student.studentId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{student.studentName}</h3>
                        <p className="text-sm text-gray-600">{student.studentNumber} - {student.className}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="default">Sıralama: {student.rank}</Badge>
                          <Badge variant="outline">Genel Ort: {student.overallAverage.toFixed(1)}</Badge>
                          <Badge variant="secondary">Devam: {student.attendanceRate}%</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {student.subjects.map((subject, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <h4 className="font-medium">{subject.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-lg font-semibold">{subject.average.toFixed(1)}</span>
                            <Badge 
                              variant={subject.status === 'passed' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {subject.letterGrade}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Notlar: {subject.grades.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Devam Oranı</p>
                        <p className="font-semibold">{student.attendanceRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Devamsızlık</p>
                        <p className="font-semibold">{student.totalAbsences} gün</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Ödev Tamamlama</p>
                        <p className="font-semibold">{student.assignmentCompletion}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Davranış</p>
                        <p className="font-semibold">{student.behaviorScore}/100</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sınıf Performans Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockClassReports.map((classReport) => (
                  <div key={classReport.classId} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-semibold text-xl">{classReport.className}</h3>
                        <p className="text-gray-600">{classReport.totalStudents} öğrenci</p>
                      </div>
                      <div className="flex space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Ortalama</p>
                          <p className="text-lg font-semibold">{classReport.averageGrade}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Devam</p>
                          <p className="text-lg font-semibold">{classReport.attendanceRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Başarı</p>
                          <p className="text-lg font-semibold">{classReport.passRate}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          En Başarılılar
                        </h4>
                        <div className="space-y-2">
                          {classReport.topPerformers.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <span className="text-sm">{student}</span>
                              <Badge variant="outline">#{index + 1}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                          Dikkat Gereken
                        </h4>
                        <div className="space-y-2">
                          {classReport.needsAttention.map((student, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                              <span className="text-sm">{student}</span>
                              <Badge variant="secondary">Destek</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3 flex items-center">
                          <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                          Ders Performansı
                        </h4>
                        <div className="space-y-2">
                          {classReport.subjectPerformance.map((subject, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <span className="text-sm">{subject.subject}</span>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{subject.average}</div>
                                <div className="text-xs text-gray-600">{subject.passRate}% başarı</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Öğretmen Performans Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTeacherReports.map((teacher) => (
                  <div key={teacher.teacherId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{teacher.teacherName}</h3>
                        <p className="text-sm text-gray-600">
                          {teacher.subjects.join(', ')} • {teacher.classes.join(', ')}
                        </p>
                        <p className="text-sm text-gray-600">{teacher.totalStudents} öğrenci</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Sınıf Ortalaması</p>
                        <p className="text-lg font-semibold">{teacher.averageClassPerformance}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Not Girişi</p>
                        <p className="text-lg font-semibold">{teacher.gradingCompletion}%</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Verilen Ödev</p>
                        <p className="text-lg font-semibold">{teacher.assignmentsGiven}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Veli İletişimi</p>
                        <p className="text-lg font-semibold">{teacher.parentCommunication}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Devam Raporu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAttendanceReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{new Date(report.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                      <p className="text-sm text-gray-600">{report.totalStudents} öğrenci</p>
                    </div>
                    
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Mevcut</p>
                        <p className="text-lg font-semibold text-green-600">{report.present}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Yok</p>
                        <p className="text-lg font-semibold text-red-600">{report.absent}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Geç</p>
                        <p className="text-lg font-semibold text-yellow-600">{report.late}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Mazeret</p>
                        <p className="text-lg font-semibold text-blue-600">{report.excused}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Devam Oranı</p>
                        <p className={`text-lg font-semibold ${report.attendanceRate >= 95 ? 'text-green-600' : report.attendanceRate >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {report.attendanceRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Haftalık Özet</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-700">Ortalama Devam</p>
                      <p className="text-lg font-semibold text-blue-900">94.3%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700">Toplam Devamsızlık</p>
                      <p className="text-lg font-semibold text-blue-900">8 gün</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700">En Yüksek Devam</p>
                      <p className="text-lg font-semibold text-blue-900">100%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700">Geç Gelme</p>
                      <p className="text-lg font-semibold text-blue-900">4 kez</p>
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