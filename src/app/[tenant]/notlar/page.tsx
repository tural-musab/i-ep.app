'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GraduationCap,
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Calculator,
  Download,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  examType: 'midterm' | 'final' | 'quiz' | 'homework' | 'project';
  examName: string;
  grade: number;
  maxGrade: number;
  weight: number; // Ağırlık yüzdesi
  examDate: string;
  entryDate: string;
  notes?: string;
  tenantId: string;
}

interface GradeSummary {
  studentId: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  className: string;
  midtermAverage: number;
  finalAverage: number;
  overallAverage: number;
  letterGrade: string;
  status: 'passed' | 'failed' | 'pending';
}

const gradeColumns = [
  {
    accessorKey: 'studentName',
    header: 'Öğrenci',
  },
  {
    accessorKey: 'studentNumber',
    header: 'Numara',
  },
  {
    accessorKey: 'className',
    header: 'Sınıf',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const className = row.getValue('className');
      return <Badge variant="outline">{className}</Badge>;
    },
  },
  {
    accessorKey: 'subjectName',
    header: 'Ders',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const subject = row.getValue('subjectName');
      return <Badge variant="secondary">{subject}</Badge>;
    },
  },
  {
    accessorKey: 'examType',
    header: 'Sınav Türü',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const type = row.getValue('examType');
      const typeConfig = {
        midterm: { label: 'Ara Sınav', variant: 'default' as const },
        final: { label: 'Final', variant: 'destructive' as const },
        quiz: { label: 'Quiz', variant: 'secondary' as const },
        homework: { label: 'Ödev', variant: 'outline' as const },
        project: { label: 'Proje', variant: 'default' as const },
      };
      const config = typeConfig[type as keyof typeof typeConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'grade',
    header: 'Not',
    cell: ({ row }: { row: { getValue: (key: string) => number; original: Grade } }) => {
      const grade = row.getValue('grade');
      const maxGrade = row.original.maxGrade;
      const percentage = (grade / maxGrade) * 100;

      let colorClass = 'text-red-600';
      if (percentage >= 85) colorClass = 'text-green-600';
      else if (percentage >= 70) colorClass = 'text-blue-600';
      else if (percentage >= 60) colorClass = 'text-yellow-600';

      return (
        <span className={`font-semibold ${colorClass}`}>
          {grade}/{maxGrade} ({percentage.toFixed(0)}%)
        </span>
      );
    },
  },
  {
    accessorKey: 'examDate',
    header: 'Sınav Tarihi',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('examDate'));
      return date.toLocaleDateString('tr-TR');
    },
  },
];

const summaryColumns = [
  {
    accessorKey: 'studentName',
    header: 'Öğrenci',
  },
  {
    accessorKey: 'className',
    header: 'Sınıf',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const className = row.getValue('className');
      return <Badge variant="outline">{className}</Badge>;
    },
  },
  {
    accessorKey: 'subjectName',
    header: 'Ders',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const subject = row.getValue('subjectName');
      return <Badge variant="secondary">{subject}</Badge>;
    },
  },
  {
    accessorKey: 'midtermAverage',
    header: 'Ara Sınav Ort.',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const avg = row.getValue('midtermAverage');
      return avg > 0 ? avg.toFixed(1) : '-';
    },
  },
  {
    accessorKey: 'finalAverage',
    header: 'Final Ort.',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const avg = row.getValue('finalAverage');
      return avg > 0 ? avg.toFixed(1) : '-';
    },
  },
  {
    accessorKey: 'overallAverage',
    header: 'Genel Ort.',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const avg = row.getValue('overallAverage');
      let colorClass = 'text-red-600';
      if (avg >= 85) colorClass = 'text-green-600';
      else if (avg >= 70) colorClass = 'text-blue-600';
      else if (avg >= 60) colorClass = 'text-yellow-600';

      return (
        <span className={`font-semibold ${colorClass}`}>{avg > 0 ? avg.toFixed(1) : '-'}</span>
      );
    },
  },
  {
    accessorKey: 'letterGrade',
    header: 'Harf Notu',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const grade = row.getValue('letterGrade');
      const gradeConfig = {
        AA: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
        BA: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
        BB: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
        CB: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
        CC: { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' },
        DC: { variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' },
        DD: { variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' },
        FF: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      };
      const config = gradeConfig[grade as keyof typeof gradeConfig] || {
        variant: 'outline' as const,
        color: '',
      };

      return grade ? (
        <Badge variant={config.variant} className={config.color}>
          {grade}
        </Badge>
      ) : (
        <span>-</span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        passed: { label: 'Geçti', variant: 'default' as const },
        failed: { label: 'Kaldı', variant: 'destructive' as const },
        pending: { label: 'Beklemede', variant: 'secondary' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
];

export default function GradesPage() {
  const { currentTenantId } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeSummaries, setGradeSummaries] = useState<GradeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [examTypeFilter, setExamTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  // Mock data
  const mockGrades: Grade[] = useMemo(
    () => [
      {
        id: '1',
        studentId: 'student1',
        studentName: 'Ahmet Yılmaz',
        studentNumber: '2024001',
        classId: 'class1',
        className: '9-A',
        subjectId: 'math',
        subjectName: 'Matematik',
        teacherId: 'teacher1',
        teacherName: 'Mehmet Öztürk',
        examType: 'midterm',
        examName: '1. Ara Sınav',
        grade: 85,
        maxGrade: 100,
        weight: 40,
        examDate: '2024-11-15',
        entryDate: '2024-11-16',
        notes: 'İyi performans',
        tenantId: currentTenantId || 'demo-school',
      },
      {
        id: '2',
        studentId: 'student1',
        studentName: 'Ahmet Yılmaz',
        studentNumber: '2024001',
        classId: 'class1',
        className: '9-A',
        subjectId: 'physics',
        subjectName: 'Fizik',
        teacherId: 'teacher2',
        teacherName: 'Ayşe Demir',
        examType: 'quiz',
        examName: 'Quiz 1',
        grade: 78,
        maxGrade: 100,
        weight: 10,
        examDate: '2024-11-10',
        entryDate: '2024-11-11',
        tenantId: currentTenantId || 'demo-school',
      },
      {
        id: '3',
        studentId: 'student2',
        studentName: 'Ayşe Demir',
        studentNumber: '2024002',
        classId: 'class1',
        className: '9-A',
        subjectId: 'math',
        subjectName: 'Matematik',
        teacherId: 'teacher1',
        teacherName: 'Mehmet Öztürk',
        examType: 'midterm',
        examName: '1. Ara Sınav',
        grade: 92,
        maxGrade: 100,
        weight: 40,
        examDate: '2024-11-15',
        entryDate: '2024-11-16',
        notes: 'Mükemmel performans',
        tenantId: currentTenantId || 'demo-school',
      },
    ],
    [currentTenantId]
  );

  const mockSummaries: GradeSummary[] = useMemo(
    () => [
      {
        studentId: 'student1',
        studentName: 'Ahmet Yılmaz',
        subjectId: 'math',
        subjectName: 'Matematik',
        className: '9-A',
        midtermAverage: 85,
        finalAverage: 0,
        overallAverage: 85,
        letterGrade: 'BA',
        status: 'pending',
      },
      {
        studentId: 'student2',
        studentName: 'Ayşe Demir',
        subjectId: 'math',
        subjectName: 'Matematik',
        className: '9-A',
        midtermAverage: 92,
        finalAverage: 0,
        overallAverage: 92,
        letterGrade: 'AA',
        status: 'pending',
      },
    ],
    []
  );

  useEffect(() => {
    const loadGrades = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setGrades(mockGrades);
          setGradeSummaries(mockSummaries);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Notlar yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadGrades();
    }
  }, [currentTenantId, mockGrades, mockSummaries]);

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.studentNumber.includes(searchTerm) ||
      grade.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'all' || grade.className === classFilter;
    const matchesSubject = subjectFilter === 'all' || grade.subjectName === subjectFilter;
    const matchesExamType = examTypeFilter === 'all' || grade.examType === examTypeFilter;

    return matchesSearch && matchesClass && matchesSubject && matchesExamType;
  });

  const filteredSummaries = gradeSummaries.filter((summary) => {
    const matchesSearch =
      summary.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'all' || summary.className === classFilter;
    const matchesSubject = subjectFilter === 'all' || summary.subjectName === subjectFilter;

    return matchesSearch && matchesClass && matchesSubject;
  });

  const handleCreateGrade = () => {
    setSelectedGrade(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditGrade = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      try {
        setGrades((prev) => prev.filter((g) => g.id !== gradeId));
      } catch (error) {
        console.error('Not silinirken hata:', error);
      }
    }
  };

  const GradeForm = () => (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Öğrenci</label>
          <Select defaultValue={selectedGrade?.studentId}>
            <SelectTrigger>
              <SelectValue placeholder="Öğrenci seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student1">Ahmet Yılmaz (2024001)</SelectItem>
              <SelectItem value="student2">Ayşe Demir (2024002)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ders</label>
          <Select defaultValue={selectedGrade?.subjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Ders seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Matematik</SelectItem>
              <SelectItem value="physics">Fizik</SelectItem>
              <SelectItem value="chemistry">Kimya</SelectItem>
              <SelectItem value="biology">Biyoloji</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Sınav Türü</label>
          <Select defaultValue={selectedGrade?.examType}>
            <SelectTrigger>
              <SelectValue placeholder="Sınav türü seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="midterm">Ara Sınav</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="homework">Ödev</SelectItem>
              <SelectItem value="project">Proje</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sınav Adı</label>
          <Input placeholder="1. Ara Sınav" defaultValue={selectedGrade?.examName} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Not</label>
          <Input
            type="number"
            placeholder="85"
            min="0"
            max="100"
            defaultValue={selectedGrade?.grade}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Maks. Not</label>
          <Input type="number" placeholder="100" min="1" defaultValue={selectedGrade?.maxGrade} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Ağırlık (%)</label>
          <Input
            type="number"
            placeholder="40"
            min="0"
            max="100"
            defaultValue={selectedGrade?.weight}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Sınav Tarihi</label>
        <Input type="date" defaultValue={selectedGrade?.examDate} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Notlar</label>
        <Input placeholder="Ek notlar (opsiyonel)" defaultValue={selectedGrade?.notes} />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
          İptal
        </Button>
        <Button type="submit">{selectedGrade ? 'Güncelle' : 'Kaydet'}</Button>
      </div>
    </form>
  );

  const gradeTableColumns = [
    ...gradeColumns,
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Grade } }) => {
        const grade = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleEditGrade(grade)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteGrade(grade.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-gray-200"></div>
          <div className="h-64 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Not Yönetimi</h1>
          <p className="text-gray-600">Öğrenci notlarını girin ve değerlendirin</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Rapor Al
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateGrade}>
                <Plus className="mr-2 h-4 w-4" />
                Not Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedGrade ? 'Not Düzenle' : 'Yeni Not Ekle'}</DialogTitle>
              </DialogHeader>
              <GradeForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 p-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Not</p>
                <p className="text-xl font-semibold">{grades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ortalama</p>
                <p className="text-xl font-semibold">
                  {grades.length > 0
                    ? (
                        grades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) /
                        grades.length
                      ).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-yellow-100 p-2">
                <Users className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Geçen Öğrenci</p>
                <p className="text-xl font-semibold">
                  {gradeSummaries.filter((s) => s.status === 'passed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-purple-100 p-2">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ders Sayısı</p>
                <p className="text-xl font-semibold">
                  {new Set(grades.map((g) => g.subjectName)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="grades" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grades" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Not Girişleri</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Not Özetleri</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Not Girişleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Öğrenci, ders ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sınıf filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sınıflar</SelectItem>
                    <SelectItem value="9-A">9-A</SelectItem>
                    <SelectItem value="10-B">10-B</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ders filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Dersler</SelectItem>
                    <SelectItem value="Matematik">Matematik</SelectItem>
                    <SelectItem value="Fizik">Fizik</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sınav türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value="midterm">Ara Sınav</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="homework">Ödev</SelectItem>
                    <SelectItem value="project">Proje</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable columns={gradeTableColumns} data={filteredGrades} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Not Özetleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Öğrenci, ders ara"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sınıf filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Sınıflar</SelectItem>
                    <SelectItem value="9-A">9-A</SelectItem>
                    <SelectItem value="10-B">10-B</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Ders filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Dersler</SelectItem>
                    <SelectItem value="Matematik">Matematik</SelectItem>
                    <SelectItem value="Fizik">Fizik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable columns={summaryColumns} data={filteredSummaries} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
