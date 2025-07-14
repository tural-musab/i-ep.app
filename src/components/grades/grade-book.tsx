/**
 * Grade Book Component
 * Sprint 5: Grade Management System Development
 * İ-EP.APP - Not Defteri
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Edit, 
  Save, 
  Download, 
  Upload,
  Calculator,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  AlertCircle,
  Eye,
  FileText,
  BarChart3
} from 'lucide-react';

interface GradeBookEntry {
  studentId: string;
  studentName: string;
  studentNumber: string;
  grades: {
    [gradeType: string]: {
      score: number;
      maxScore: number;
      date: string;
      notes?: string;
    }[];
  };
  averages: {
    exam: number;
    homework: number;
    project: number;
    participation: number;
    quiz: number;
    weighted: number;
  };
  letterGrade: string;
  gpa: number;
  trend: 'up' | 'down' | 'stable';
}

export function GradeBook() {
  const [selectedClass, setSelectedClass] = useState('5-a');
  const [selectedSubject, setSelectedSubject] = useState('matematik');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - gerçek uygulamada API'den gelecek
  const [gradeBookData] = useState<GradeBookEntry[]>([
    {
      studentId: '1',
      studentName: 'Ali Veli',
      studentNumber: '2025001',
      grades: {
        exam: [
          { score: 85, maxScore: 100, date: '2025-01-15', notes: 'İyi performans' },
          { score: 78, maxScore: 100, date: '2025-01-10' }
        ],
        homework: [
          { score: 92, maxScore: 100, date: '2025-01-12' },
          { score: 88, maxScore: 100, date: '2025-01-08' },
          { score: 95, maxScore: 100, date: '2025-01-05' }
        ],
        project: [
          { score: 87, maxScore: 100, date: '2025-01-01' }
        ],
        participation: [
          { score: 90, maxScore: 100, date: '2025-01-15' }
        ],
        quiz: [
          { score: 82, maxScore: 100, date: '2025-01-14' },
          { score: 89, maxScore: 100, date: '2025-01-11' }
        ]
      },
      averages: {
        exam: 81.5,
        homework: 91.7,
        project: 87.0,
        participation: 90.0,
        quiz: 85.5,
        weighted: 86.2
      },
      letterGrade: 'B',
      gpa: 3.0,
      trend: 'up'
    },
    {
      studentId: '2',
      studentName: 'Ayşe Yılmaz',
      studentNumber: '2025002',
      grades: {
        exam: [
          { score: 94, maxScore: 100, date: '2025-01-15' },
          { score: 89, maxScore: 100, date: '2025-01-10' }
        ],
        homework: [
          { score: 96, maxScore: 100, date: '2025-01-12' },
          { score: 93, maxScore: 100, date: '2025-01-08' },
          { score: 98, maxScore: 100, date: '2025-01-05' }
        ],
        project: [
          { score: 92, maxScore: 100, date: '2025-01-01' }
        ],
        participation: [
          { score: 95, maxScore: 100, date: '2025-01-15' }
        ],
        quiz: [
          { score: 91, maxScore: 100, date: '2025-01-14' },
          { score: 94, maxScore: 100, date: '2025-01-11' }
        ]
      },
      averages: {
        exam: 91.5,
        homework: 95.7,
        project: 92.0,
        participation: 95.0,
        quiz: 92.5,
        weighted: 93.1
      },
      letterGrade: 'A',
      gpa: 4.0,
      trend: 'stable'
    },
    {
      studentId: '3',
      studentName: 'Mehmet Kaya',
      studentNumber: '2025003',
      grades: {
        exam: [
          { score: 72, maxScore: 100, date: '2025-01-15' },
          { score: 68, maxScore: 100, date: '2025-01-10' }
        ],
        homework: [
          { score: 78, maxScore: 100, date: '2025-01-12' },
          { score: 82, maxScore: 100, date: '2025-01-08' },
          { score: 75, maxScore: 100, date: '2025-01-05' }
        ],
        project: [
          { score: 80, maxScore: 100, date: '2025-01-01' }
        ],
        participation: [
          { score: 85, maxScore: 100, date: '2025-01-15' }
        ],
        quiz: [
          { score: 76, maxScore: 100, date: '2025-01-14' },
          { score: 79, maxScore: 100, date: '2025-01-11' }
        ]
      },
      averages: {
        exam: 70.0,
        homework: 78.3,
        project: 80.0,
        participation: 85.0,
        quiz: 77.5,
        weighted: 75.8
      },
      letterGrade: 'C',
      gpa: 2.0,
      trend: 'down'
    }
  ]);

  const gradeTypes = [
    { key: 'exam', label: 'Sınavlar', weight: 40, color: 'bg-blue-100 text-blue-800' },
    { key: 'homework', label: 'Ödevler', weight: 20, color: 'bg-green-100 text-green-800' },
    { key: 'project', label: 'Projeler', weight: 20, color: 'bg-purple-100 text-purple-800' },
    { key: 'participation', label: 'Katılım', weight: 10, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'quiz', label: 'Kısa Sınavlar', weight: 10, color: 'bg-orange-100 text-orange-800' }
  ];

  const filteredStudents = gradeBookData.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentNumber.includes(searchTerm)
  );

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

  const calculateClassStatistics = () => {
    const averages = filteredStudents.map(student => student.averages.weighted);
    const sum = averages.reduce((acc, avg) => acc + avg, 0);
    const classAverage = sum / averages.length;
    const highest = Math.max(...averages);
    const lowest = Math.min(...averages);
    const passingStudents = averages.filter(avg => avg >= 60).length;
    const passingRate = (passingStudents / averages.length) * 100;

    return {
      classAverage: classAverage.toFixed(1),
      highest: highest.toFixed(1),
      lowest: lowest.toFixed(1),
      passingRate: passingRate.toFixed(1),
      totalStudents: averages.length
    };
  };

  const stats = calculateClassStatistics();

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Not Defteri
          </CardTitle>
          <CardDescription>
            Sınıf notlarını görüntüleyin ve düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Sınıf</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5-a">5-A</SelectItem>
                  <SelectItem value="5-b">5-B</SelectItem>
                  <SelectItem value="6-a">6-A</SelectItem>
                  <SelectItem value="6-b">6-B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ders</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="matematik">Matematik</SelectItem>
                  <SelectItem value="turkce">Türkçe</SelectItem>
                  <SelectItem value="fen">Fen Bilgisi</SelectItem>
                  <SelectItem value="sosyal">Sosyal Bilgiler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dönem</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1. Dönem</SelectItem>
                  <SelectItem value="2">2. Dönem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex-1">
              <Label>Öğrenci Ara</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Öğrenci adı veya numarası..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                onClick={() => setViewMode('table')}
              >
                Tablo
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                onClick={() => setViewMode('cards')}
              >
                Kartlar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Not Ağırlıkları
          </CardTitle>
          <CardDescription>
            Matematik dersi için geçerli not ağırlıkları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {gradeTypes.map((type) => (
              <div key={type.key} className="flex items-center gap-2">
                <Badge variant="outline" className={type.color}>
                  {type.label}
                </Badge>
                <span className="text-sm font-medium">%{type.weight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Class Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sınıf İstatistikleri
          </CardTitle>
          <CardDescription>
            {selectedClass.toUpperCase()} sınıfı genel performansı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.classAverage}</div>
              <div className="text-sm text-blue-800">Sınıf Ortalaması</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.highest}</div>
              <div className="text-sm text-green-800">En Yüksek Not</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.lowest}</div>
              <div className="text-sm text-red-800">En Düşük Not</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.passingRate}%</div>
              <div className="text-sm text-yellow-800">Başarı Oranı</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Book Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Öğrenci Notları</CardTitle>
              <CardDescription>
                {filteredStudents.length} öğrencinin detaylı not durumu
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Excel İndir
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                İçe Aktar
              </Button>
              <Button 
                variant={isEditing ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Düzenlemeyi Bitir' : 'Düzenle'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Öğrenci</th>
                    {gradeTypes.map((type) => (
                      <th key={type.key} className="text-center p-2 font-medium min-w-[100px]">
                        {type.label}
                      </th>
                    ))}
                    <th className="text-center p-2 font-medium">Ağırlıklı</th>
                    <th className="text-center p-2 font-medium">Harf</th>
                    <th className="text-center p-2 font-medium">GPA</th>
                    <th className="text-center p-2 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.studentId} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{student.studentName}</div>
                          <div className="text-sm text-gray-600">#{student.studentNumber}</div>
                        </div>
                      </td>
                      {gradeTypes.map((type) => (
                        <td key={type.key} className="text-center p-2">
                          <div className={`font-medium ${getGradeColor(student.averages[type.key as keyof typeof student.averages])}`}>
                            {student.averages[type.key as keyof typeof student.averages].toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.grades[type.key]?.length || 0} not
                          </div>
                        </td>
                      ))}
                      <td className="text-center p-2">
                        <div className={`font-bold ${getGradeColor(student.averages.weighted)}`}>
                          {student.averages.weighted.toFixed(1)}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        <Badge variant="outline" className={getGradeBadge(student.averages.weighted)}>
                          {student.letterGrade}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        <div className={`font-medium ${getGradeColor(student.gpa * 25)}`}>
                          {student.gpa.toFixed(1)}
                        </div>
                      </td>
                      <td className="text-center p-2">
                        {getTrendIcon(student.trend)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card key={student.studentId}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{student.studentName}</CardTitle>
                        <CardDescription>#{student.studentNumber}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getGradeBadge(student.averages.weighted)}>
                          {student.letterGrade}
                        </Badge>
                        {getTrendIcon(student.trend)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getGradeColor(student.averages.weighted)}`}>
                          {student.averages.weighted.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Ağırlıklı Ortalama</div>
                      </div>
                      
                      <div className="space-y-2">
                        {gradeTypes.map((type) => (
                          <div key={type.key} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${type.color} text-xs`}>
                                {type.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getGradeColor(student.averages[type.key as keyof typeof student.averages])}`}>
                                {student.averages[type.key as keyof typeof student.averages].toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({student.grades[type.key]?.length || 0})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-gray-600">GPA:</span>
                        <span className={`font-bold ${getGradeColor(student.gpa * 25)}`}>
                          {student.gpa.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}