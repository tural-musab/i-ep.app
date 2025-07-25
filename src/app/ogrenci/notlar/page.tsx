'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { StudentGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { getCurrentUserGrades, StudentGradeData, getTurkishGrade } from '@/lib/api/student-grades';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Award,
  BookOpen,
  Target,
  BarChart3
} from 'lucide-react';
import { ProgressiveDemoTour } from '@/components/demo/progressive-demo-tour';

// Turkish Grade System (AA-FF) mapping
const TURKISH_GRADES = {
  'AA': { point: 4.0, description: 'Mükemmel', color: 'text-green-600', bgColor: 'bg-green-100' },
  'BA': { point: 3.5, description: 'Çok İyi', color: 'text-green-500', bgColor: 'bg-green-50' },
  'BB': { point: 3.0, description: 'İyi', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  'CB': { point: 2.5, description: 'Orta', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'CC': { point: 2.0, description: 'Geçer', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  'DC': { point: 1.5, description: 'Zayıf', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  'DD': { point: 1.0, description: 'Çok Zayıf', color: 'text-red-500', bgColor: 'bg-red-50' },
  'FF': { point: 0.0, description: 'Başarısız', color: 'text-red-600', bgColor: 'bg-red-100' }
};

// Demo data for Turkish educational system
const DEMO_GRADE_DATA = {
  currentSemester: '2024-2025 Güz Dönemi',
  studentInfo: {
    name: 'Zeynep Yılmaz',
    studentNumber: '2024001',
    class: '10-A',
    gpa: 3.2
  },
  subjects: [
    {
      id: '1',
      name: 'Matematik',
      teacher: 'Ahmet Yılmaz',
      credits: 4,
      grades: [
        { type: 'Sınav 1', score: 85, date: '2024-10-15', grade: 'BA' },
        { type: 'Sınav 2', score: 92, date: '2024-11-20', grade: 'AA' },
        { type: 'Ödev 1', score: 78, date: '2024-10-05', grade: 'BB' },
        { type: 'Proje', score: 88, date: '2024-11-25', grade: 'BA' }
      ],
      average: 85.8,
      letterGrade: 'BA',
      semester: 'Güz 2024'
    },
    {
      id: '2',
      name: 'Fizik',
      teacher: 'Ayşe Demir',
      credits: 3,
      grades: [
        { type: 'Sınav 1', score: 75, date: '2024-10-18', grade: 'BB' },
        { type: 'Sınav 2', score: 82, date: '2024-11-22', grade: 'BA' },
        { type: 'Lab Raporu', score: 90, date: '2024-11-10', grade: 'AA' }
      ],
      average: 82.3,
      letterGrade: 'BA',
      semester: 'Güz 2024'
    },
    {
      id: '3',
      name: 'Türkçe',
      teacher: 'Mehmet Kaya',
      credits: 4,
      grades: [
        { type: 'Sınav 1', score: 88, date: '2024-10-12', grade: 'BA' },
        { type: 'Kompozisyon', score: 95, date: '2024-11-08', grade: 'AA' },
        { type: 'Sözlü Sunum', score: 92, date: '2024-11-15', grade: 'AA' }
      ],
      average: 91.7,
      letterGrade: 'AA',
      semester: 'Güz 2024'
    },
    {
      id: '4',
      name: 'İngilizce',
      teacher: 'Zeynep Şahin',
      credits: 3,
      grades: [
        { type: 'Sınav 1', score: 70, date: '2024-10-20', grade: 'CB' },
        { type: 'Sınav 2', score: 78, date: '2024-11-18', grade: 'BB' },
        { type: 'Speaking Test', score: 85, date: '2024-11-25', grade: 'BA' }
      ],
      average: 77.7,
      letterGrade: 'BB',
      semester: 'Güz 2024'
    }
  ],
  semesterStats: {
    totalCredits: 14,
    passedCredits: 14,
    gpa: 3.2,
    rank: 8,
    totalStudents: 32
  }
};

function StudentGradeContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [gradeData, setGradeData] = useState<StudentGradeData | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useDemoData, setUseDemoData] = useState(false);
  
  const tourMode = searchParams.get('tour') === 'start';
  const tourRole = searchParams.get('role') || 'student';

  // Load student grades
  useEffect(() => {
    async function fetchGrades() {
      if (!user) return;
      
      setIsLoadingGrades(true);
      setError(null);

      try {
        const result = await getCurrentUserGrades({
          academicYear: '2024-2025',
          includeAnalytics: true,
          includeHistory: true
        });

        if (result.success && result.data) {
          setGradeData(result.data);
          setUseDemoData(false);
        } else {
          // Fall back to demo data if API fails
          console.warn('API failed, using demo data:', result.error);
          setGradeData(DEMO_GRADE_DATA);
          setUseDemoData(true);
          setError('API bağlantısı başarısız, demo veriler gösteriliyor');
        }
      } catch (err) {
        console.error('Error fetching grades:', err);
        setGradeData(DEMO_GRADE_DATA);
        setUseDemoData(true);
        setError('Notlar yüklenirken hata oluştu, demo veriler gösteriliyor');
      } finally {
        setIsLoadingGrades(false);
      }
    }

    fetchGrades();
  }, [user]);

  // Calculate GPA based on Turkish system
  const calculateGPA = (subjects: any[]) => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    subjects.forEach(subject => {
      const gradePoint = TURKISH_GRADES[subject.letterGrade as keyof typeof TURKISH_GRADES]?.point || 0;
      totalPoints += gradePoint * subject.credits;
      totalCredits += subject.credits;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  // Get grade trend (improvement/decline)
  const getGradeTrend = (grades: any[]) => {
    if (grades.length < 2) return 'stable';
    const recent = grades[grades.length - 1].score;
    const previous = grades[grades.length - 2].score;
    if (recent > previous + 5) return 'up';
    if (recent < previous - 5) return 'down';
    return 'stable';
  };

  if (isLoading || isLoadingGrades) {
    return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Giriş yapılmadı</div>;
  }

  if (!gradeData) {
    return <div className="flex min-h-screen items-center justify-center">Not verileri yüklenemedi</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {tourMode && <ProgressiveDemoTour role={tourRole} />}
      
      {/* Error Alert */}
      {error && (
        <div className="mb-6 border-l-4 border-orange-500 bg-orange-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notlarım</h1>
            <p className="mt-2 text-gray-600">
              {gradeData.student?.name || gradeData.studentInfo?.name} • {gradeData.student?.studentNumber || gradeData.studentInfo?.studentNumber} • {gradeData.student?.class || gradeData.studentInfo?.class}
            </p>
            <p className="text-sm text-blue-600">{gradeData.currentSemester}</p>
            {useDemoData && (
              <p className="text-xs text-orange-600">📍 Demo veriler gösteriliyor</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{gradeData.semesterStats?.gpa || gradeData.semesterStats?.gpa}</div>
            <p className="text-sm text-gray-600">Genel Not Ortalaması</p>
            {gradeData.semesterStats?.rank && (
              <p className="text-xs text-gray-500">Sınıf Sıralaması: {gradeData.semesterStats.rank}/{gradeData.semesterStats.totalStudents}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ders</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeData.subjects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Aktif dersler</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kredi Toplamı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeData.semesterStats.totalCredits}</div>
            <p className="text-xs text-muted-foreground">Toplam kredi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Yüksek Not</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">AA</div>
            <p className="text-xs text-muted-foreground">Türkçe dersi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Başarı Durumu</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Geçti</div>
            <p className="text-xs text-muted-foreground">Tüm dersler</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Güncel Notlar</TabsTrigger>
          <TabsTrigger value="history">Not Geçmişi</TabsTrigger>
          <TabsTrigger value="analytics">Performans Analizi</TabsTrigger>
        </TabsList>

        {/* Current Grades Tab */}
        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {(gradeData.subjects || []).map((subject) => {
              const gradeInfo = TURKISH_GRADES[subject.letterGrade as keyof typeof TURKISH_GRADES] || 
                               getTurkishGrade(subject.average);
              const trend = getGradeTrend(subject.grades || []);
              
              return (
                <Card key={subject.subjectId || subject.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{subject.subjectName || subject.name}</CardTitle>
                        <CardDescription>{subject.teacherName || subject.teacher} • {subject.credits} Kredi</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`${gradeInfo?.color || gradeInfo.color} ${gradeInfo?.bgColor || gradeInfo.bgColor} border-current`}
                        >
                          {subject.letterGrade} ({subject.average?.toFixed(1) || subject.average})
                        </Badge>
                        <div className="flex items-center mt-1">
                          {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                          <span className="text-xs text-gray-500 ml-1">
                            {gradeInfo?.description || gradeInfo.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(subject.grades || []).map((grade, index) => (
                        <div key={grade.id || index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{grade.examName || grade.type}</p>
                            <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{grade.score?.toFixed(1) || grade.score}</p>
                            <Badge variant="outline" className="text-xs">
                              {grade.grade}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Grade History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Akademik Geçmiş
              </CardTitle>
              <CardDescription>Dönemlik not kartınız ve genel performans</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">2024-2025 Güz Dönemi</h3>
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      Aktif
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{gradeData.semesterStats.gpa}</p>
                      <p className="text-sm text-gray-600">GPA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{gradeData.semesterStats.passedCredits}</p>
                      <p className="text-sm text-gray-600">Geçilen Kredi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{gradeData.semesterStats.rank}</p>
                      <p className="text-sm text-gray-600">Sınıf Sırası</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">100%</p>
                      <p className="text-sm text-gray-600">Başarı Oranı</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">2023-2024 Bahar Dönemi</h3>
                    <Badge variant="outline" className="border-blue-600 text-blue-600">
                      Tamamlandı
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">3.0</p>
                      <p className="text-sm text-gray-600">GPA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">12</p>
                      <p className="text-sm text-gray-600">Geçilen Kredi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">12</p>
                      <p className="text-sm text-gray-600">Sınıf Sırası</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">95%</p>
                      <p className="text-sm text-gray-600">Başarı Oranı</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performans Trendi
                </CardTitle>
                <CardDescription>Son 6 ay içindeki gelişiminiz</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gradeData.subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(subject.average / 100) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{subject.average.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Güçlü & Gelişim Alanları
                </CardTitle>
                <CardDescription>Akademik performans analizi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">🏆 Güçlü Alanlar</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Türkçe: Mükemmel performans (AA - 91.7)</li>
                      <li>• Matematik: Istikrarlı başarı (BA - 85.8)</li>
                      <li>• Fizik: Yükseliş trendi (BA - 82.3)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">📈 Gelişim Alanları</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• İngilizce: Speaking skills geliştirilmeli</li>
                      <li>• Matematik: Problem çözme hızı</li>
                      <li>• Genel: Sınav öncesi hazırlık süresi</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function StudentGradesPage() {
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
        <StudentGradeContent />
      </Suspense>
    </StudentGuard>
  );
}