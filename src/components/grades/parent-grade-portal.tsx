/**
 * Parent Grade Portal Component
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Veli Not Portalı
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MessageCircle,
  Award,
  AlertCircle,
  Target,
  Clock,
  BarChart3,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Download,
  Bell,
  Eye
} from 'lucide-react';

interface StudentGrade {
  subject: string;
  teacher: string;
  currentGrade: number;
  letterGrade: string;
  gpa: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  recentGrades: {
    type: string;
    grade: number;
    maxGrade: number;
    date: string;
    comment?: string;
  }[];
  teacherComments: {
    date: string;
    comment: string;
    category: 'positive' | 'neutral' | 'concern';
  }[];
}

interface StudentProgress {
  month: string;
  average: number;
  attendance: number;
  behaviorRating: number;
}

export function ParentGradePortal() {
  const [selectedStudent, setSelectedStudent] = useState('1');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Mock data - gerçek uygulamada API'den gelecek
  const [students] = useState([
    {
      id: '1',
      name: 'Ali Veli',
      class: '5-A',
      studentNumber: '2025001',
      photo: '/api/placeholder/40/40'
    },
    {
      id: '2',
      name: 'Ayşe Veli',
      class: '3-B',
      studentNumber: '2025002',
      photo: '/api/placeholder/40/40'
    }
  ]);

  const [studentData] = useState<{
    overview: {
      overallGPA: number;
      semesterGPA: number;
      attendanceRate: number;
      behaviorRating: number;
      rank: number;
      totalStudents: number;
      trend: 'up' | 'down' | 'stable';
      trendValue: number;
      achievements: string[];
      concerns: string[];
    };
    grades: StudentGrade[];
    progress: StudentProgress[];
    upcomingEvents: {
      date: string;
      type: 'exam' | 'assignment' | 'project' | 'meeting';
      subject: string;
      title: string;
      description: string;
    }[];
    notifications: {
      id: string;
      type: 'grade' | 'attendance' | 'behavior' | 'announcement';
      title: string;
      message: string;
      date: string;
      read: boolean;
      priority: 'low' | 'medium' | 'high';
    }[];
  }>({
    overview: {
      overallGPA: 3.4,
      semesterGPA: 3.6,
      attendanceRate: 94.5,
      behaviorRating: 4.2,
      rank: 8,
      totalStudents: 30,
      trend: 'up',
      trendValue: 0.2,
      achievements: ['Matematik yarışması 2. liği', 'Mükemmel devam ödülü', 'Sınıf başkanı seçildi'],
      concerns: ['Fen bilgisi performansında düşüş', 'Son haftalarda geç kalma']
    },
    grades: [
      {
        subject: 'Matematik',
        teacher: 'Ahmet Öğretmen',
        currentGrade: 87.5,
        letterGrade: 'B+',
        gpa: 3.5,
        trend: 'up',
        trendValue: 5.2,
        recentGrades: [
          { type: 'Sınav', grade: 92, maxGrade: 100, date: '2025-01-15', comment: 'Çok başarılı' },
          { type: 'Ödev', grade: 88, maxGrade: 100, date: '2025-01-12' },
          { type: 'Kısa Sınav', grade: 85, maxGrade: 100, date: '2025-01-10' }
        ],
        teacherComments: [
          { date: '2025-01-15', comment: 'Ali matematik dersinde çok başarılı. Problem çözme becerileri gelişiyor.', category: 'positive' },
          { date: '2025-01-08', comment: 'Sınıf katılımı artırılmalı.', category: 'neutral' }
        ]
      },
      {
        subject: 'Türkçe',
        teacher: 'Fatma Öğretmen',
        currentGrade: 91.2,
        letterGrade: 'A-',
        gpa: 3.7,
        trend: 'stable',
        trendValue: 0.8,
        recentGrades: [
          { type: 'Kompozisyon', grade: 95, maxGrade: 100, date: '2025-01-14', comment: 'Yaratıcı yazım' },
          { type: 'Sınav', grade: 89, maxGrade: 100, date: '2025-01-11' },
          { type: 'Sunum', grade: 90, maxGrade: 100, date: '2025-01-09' }
        ],
        teacherComments: [
          { date: '2025-01-14', comment: 'Yazma becerilerinde büyük gelişim var. Okuma alışkanlığı da artmış.', category: 'positive' },
          { date: '2025-01-07', comment: 'Sözlü sunum becerilerinı geliştirmeli.', category: 'neutral' }
        ]
      },
      {
        subject: 'Fen Bilgisi',
        teacher: 'Mustafa Öğretmen',
        currentGrade: 76.8,
        letterGrade: 'C+',
        gpa: 2.3,
        trend: 'down',
        trendValue: -8.5,
        recentGrades: [
          { type: 'Sınav', grade: 72, maxGrade: 100, date: '2025-01-13', comment: 'Çalışma gerekli' },
          { type: 'Deney', grade: 78, maxGrade: 100, date: '2025-01-10' },
          { type: 'Ödev', grade: 80, maxGrade: 100, date: '2025-01-08' }
        ],
        teacherComments: [
          { date: '2025-01-13', comment: 'Fen bilgisi dersinde daha fazla çalışma gerekli. Temel kavramlar pekiştirilmeli.', category: 'concern' },
          { date: '2025-01-06', comment: 'Deney çalışmalarında aktif ve başarılı.', category: 'positive' }
        ]
      },
      {
        subject: 'Sosyal Bilgiler',
        teacher: 'Zeynep Öğretmen',
        currentGrade: 89.3,
        letterGrade: 'B+',
        gpa: 3.3,
        trend: 'up',
        trendValue: 3.7,
        recentGrades: [
          { type: 'Proje', grade: 92, maxGrade: 100, date: '2025-01-15', comment: 'Harika araştırma' },
          { type: 'Sınav', grade: 87, maxGrade: 100, date: '2025-01-12' },
          { type: 'Sunum', grade: 89, maxGrade: 100, date: '2025-01-09' }
        ],
        teacherComments: [
          { date: '2025-01-15', comment: 'Araştırma projesi çok başarılı. Tarih konularında özel ilgi gösteriyor.', category: 'positive' }
        ]
      }
    ],
    progress: [
      { month: 'Eylül', average: 82.5, attendance: 96.0, behaviorRating: 4.0 },
      { month: 'Ekim', average: 84.2, attendance: 94.5, behaviorRating: 4.1 },
      { month: 'Kasım', average: 85.8, attendance: 93.2, behaviorRating: 4.0 },
      { month: 'Aralık', average: 86.1, attendance: 95.8, behaviorRating: 4.3 },
      { month: 'Ocak', average: 87.2, attendance: 94.5, behaviorRating: 4.2 }
    ],
    upcomingEvents: [
      {
        date: '2025-01-18',
        type: 'exam',
        subject: 'Matematik',
        title: 'Dönemlik Sınav',
        description: 'Geometri ve Cebir konularını kapsayan dönemlik sınav'
      },
      {
        date: '2025-01-20',
        type: 'assignment',
        subject: 'Türkçe',
        title: 'Öykü Yazma Ödevi',
        description: 'Özgün öykü yazma ödevi teslim tarihi'
      },
      {
        date: '2025-01-22',
        type: 'project',
        subject: 'Fen Bilgisi',
        title: 'Bilim Fuarı Projesi',
        description: 'Bilim fuarı için hazırlanan proje sunumu'
      },
      {
        date: '2025-01-25',
        type: 'meeting',
        subject: 'Genel',
        title: 'Veli Toplantısı',
        description: 'Dönem sonu değerlendirme toplantısı'
      }
    ],
    notifications: [
      {
        id: '1',
        type: 'grade',
        title: 'Matematik Sınav Notu',
        message: 'Ali Veli matematik sınavından 92 puan aldı.',
        date: '2025-01-15',
        read: false,
        priority: 'medium'
      },
      {
        id: '2',
        type: 'attendance',
        title: 'Devamsızlık Bildirimi',
        message: 'Ali Veli bugün 2. dersten sonra okuldan ayrıldı.',
        date: '2025-01-14',
        read: false,
        priority: 'high'
      },
      {
        id: '3',
        type: 'behavior',
        title: 'Davranış Değerlendirmesi',
        message: 'Ali Veli sınıf başkanı seçildi. Tebrikler!',
        date: '2025-01-13',
        read: true,
        priority: 'low'
      },
      {
        id: '4',
        type: 'announcement',
        title: 'Bilim Fuarı Duyurusu',
        message: 'Okul bilim fuarı 25 Ocak tarihinde düzenlenecek.',
        date: '2025-01-12',
        read: true,
        priority: 'medium'
      }
    ]
  });

  const currentStudent = students.find(s => s.id === selectedStudent);
  const data = studentData;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-800';
    if (grade >= 80) return 'bg-blue-100 text-blue-800';
    if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
    if (grade >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    if (gpa >= 2.0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <FileText className="h-4 w-4 text-red-500" />;
      case 'assignment': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'project': return <Target className="h-4 w-4 text-purple-500" />;
      case 'meeting': return <MessageCircle className="h-4 w-4 text-green-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'grade': return <Award className="h-4 w-4 text-blue-500" />;
      case 'attendance': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'behavior': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'announcement': return <Bell className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCommentColor = (category: string) => {
    switch (category) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'concern': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const filteredGrades = selectedSubject === 'all' 
    ? data.grades 
    : data.grades.filter(grade => grade.subject.toLowerCase().includes(selectedSubject.toLowerCase()));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Veli Portalı</h1>
          <p className="text-gray-600 mt-2">Çocuğunuzun akademik durumunu takip edin</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Çocuk Seçin</label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} - {student.class}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Student Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentStudent?.photo} alt={currentStudent?.name} />
              <AvatarFallback>
                {currentStudent?.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{currentStudent?.name}</h2>
                  <p className="text-gray-600">
                    {currentStudent?.class} • #{currentStudent?.studentNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getGradeBadge(data.overview.semesterGPA * 25)}>
                    GPA: {data.overview.semesterGPA}
                  </Badge>
                  <Badge variant="outline">
                    Sıralama: {data.overview.rank}/{data.overview.totalStudents}
                  </Badge>
                  {getTrendIcon(data.overview.trend)}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className={`text-2xl font-bold ${getGPAColor(data.overview.semesterGPA)}`}>
                {data.overview.semesterGPA}
              </div>
              <div className="text-sm text-blue-800">Dönem GPA</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                %{data.overview.attendanceRate}
              </div>
              <div className="text-sm text-green-800">Devam Oranı</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {data.overview.behaviorRating}/5
              </div>
              <div className="text-sm text-yellow-800">Davranış Puanı</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {data.overview.rank}
              </div>
              <div className="text-sm text-purple-800">Sınıf Sıralaması</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements & Concerns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Award className="h-5 w-5" />
              Başarılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.overview.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Dikkat Edilmesi Gerekenler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.overview.concerns.map((concern, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{concern}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="grades">Notlar</TabsTrigger>
          <TabsTrigger value="progress">İlerleme</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="communication">İletişim</TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Ders Notları</CardTitle>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Dersler</SelectItem>
                    <SelectItem value="matematik">Matematik</SelectItem>
                    <SelectItem value="turkce">Türkçe</SelectItem>
                    <SelectItem value="fen">Fen Bilgisi</SelectItem>
                    <SelectItem value="sosyal">Sosyal Bilgiler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredGrades.map((grade, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{grade.subject}</CardTitle>
                          <CardDescription>Öğretmen: {grade.teacher}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getGradeBadge(grade.currentGrade)}>
                            {grade.letterGrade}
                          </Badge>
                          <Badge variant="outline" className={getGPAColor(grade.gpa * 25)}>
                            GPA: {grade.gpa}
                          </Badge>
                          {getTrendIcon(grade.trend)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Güncel Ortalama</span>
                          <span className={`text-2xl font-bold ${getGradeColor(grade.currentGrade)}`}>
                            {grade.currentGrade}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Son Notlar</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {grade.recentGrades.map((recentGrade, idx) => (
                              <div key={idx} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-sm">{recentGrade.type}</div>
                                    <div className="text-xs text-gray-600">
                                      {new Date(recentGrade.date).toLocaleDateString('tr-TR')}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`font-bold ${getGradeColor(recentGrade.grade)}`}>
                                      {recentGrade.grade}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      /{recentGrade.maxGrade}
                                    </div>
                                  </div>
                                </div>
                                {recentGrade.comment && (
                                  <div className="text-xs text-gray-600 mt-2">
                                    {recentGrade.comment}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Öğretmen Yorumları</h4>
                          <div className="space-y-2">
                            {grade.teacherComments.map((comment, idx) => (
                              <div key={idx} className={`p-3 border rounded-lg ${getCommentColor(comment.category)}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-gray-600">
                                    {new Date(comment.date).toLocaleDateString('tr-TR')}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {comment.category === 'positive' ? 'Olumlu' : 
                                     comment.category === 'concern' ? 'Dikkat' : 'Nötr'}
                                  </Badge>
                                </div>
                                <p className="text-sm">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Akademik İlerleme</CardTitle>
              <CardDescription>
                Aylık performans değişimi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.progress.map((progress, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{progress.month}</h3>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getGradeColor(progress.average)}`}>
                          {progress.average}
                        </div>
                        <div className="text-sm text-gray-600">Ortalama</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Akademik Ortalama</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progress.average} className="h-2" />
                          <span className="text-sm font-medium">{progress.average}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Devam Oranı</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progress.attendance} className="h-2" />
                          <span className="text-sm font-medium">{progress.attendance}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Davranış</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={progress.behaviorRating * 20} className="h-2" />
                          <span className="text-sm font-medium">{progress.behaviorRating}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Etkinlikler</CardTitle>
              <CardDescription>
                Sınavlar, ödevler ve toplantılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">{event.subject}</div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {new Date(event.date).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {event.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bildirimler</CardTitle>
              <CardDescription>
                Okul ve öğretmenlerden gelen bildirimler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority === 'high' ? 'Yüksek' : 
                           notification.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{notification.title}</h3>
                          <div className="text-sm text-gray-600">
                            {new Date(notification.date).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Öğretmen İletişimi</CardTitle>
              <CardDescription>
                Öğretmenler ile doğrudan iletişim kurun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.grades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">{grade.subject}</div>
                        <div className="text-sm text-gray-600">{grade.teacher}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Mesaj Gönder
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Randevu Al
                      </Button>
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