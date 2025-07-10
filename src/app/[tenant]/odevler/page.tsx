'use client';

import React, { useState, useEffect } from 'react';
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  type: 'homework' | 'project' | 'essay' | 'presentation' | 'lab_report';
  assignedDate: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  attachments?: string[];
  status: 'draft' | 'active' | 'completed' | 'overdue';
  tenantId: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  submissionDate: string;
  content: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  status: 'not_submitted' | 'submitted' | 'late' | 'graded';
  submittedAt?: string;
  tenantId: string;
}

const assignmentColumns = [
  {
    accessorKey: 'title',
    header: 'Ödev Başlığı',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const title = row.getValue('title');
      return <span className="font-medium">{title}</span>;
    },
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
    accessorKey: 'type',
    header: 'Tür',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const type = row.getValue('type');
      const typeConfig = {
        homework: { label: 'Ödev', variant: 'default' as const },
        project: { label: 'Proje', variant: 'destructive' as const },
        essay: { label: 'Kompozisyon', variant: 'secondary' as const },
        presentation: { label: 'Sunum', variant: 'outline' as const },
        lab_report: { label: 'Lab Raporu', variant: 'default' as const },
      };
      const config = typeConfig[type as keyof typeof typeConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'dueDate',
    header: 'Son Tarih',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = new Date(row.getValue('dueDate'));
      const today = new Date();
      const isOverdue = date < today;
      
      return (
        <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
          {date.toLocaleDateString('tr-TR')}
        </span>
      );
    },
  },
  {
    accessorKey: 'maxPoints',
    header: 'Puan',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const points = row.getValue('maxPoints');
      return <span className="font-semibold">{points}</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        draft: { label: 'Taslak', variant: 'secondary' as const },
        active: { label: 'Aktif', variant: 'default' as const },
        completed: { label: 'Tamamlandı', variant: 'outline' as const },
        overdue: { label: 'Süresi Geçmiş', variant: 'destructive' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
];

const submissionColumns = [
  {
    accessorKey: 'assignmentTitle',
    header: 'Ödev',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const title = row.getValue('assignmentTitle');
      return <span className="font-medium">{title}</span>;
    },
  },
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
    accessorKey: 'submissionDate',
    header: 'Teslim Tarihi',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const date = row.getValue('submissionDate');
      return date ? new Date(date).toLocaleDateString('tr-TR') : '-';
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        not_submitted: { label: 'Teslim Edilmedi', variant: 'destructive' as const },
        submitted: { label: 'Teslim Edildi', variant: 'default' as const },
        late: { label: 'Geç Teslim', variant: 'secondary' as const },
        graded: { label: 'Notlandırıldı', variant: 'outline' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: 'grade',
    header: 'Not',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const grade = row.getValue('grade');
      return grade ? (
        <span className="font-semibold text-blue-600">{grade}</span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
];

export default function AssignmentsPage() {
  const { currentTenantId } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Mock data
  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Fonksiyonlar Konusu Ödev 1',
      description: 'Fonksiyonların tanımı ve özellikleri üzerine problemler',
      classId: 'class1',
      className: '9-A',
      subjectId: 'math',
      subjectName: 'Matematik',
      teacherId: 'teacher1',
      teacherName: 'Mehmet Öztürk',
      type: 'homework',
      assignedDate: '2024-12-01',
      dueDate: '2024-12-15',
      maxPoints: 100,
      instructions: 'Kitabın 45-50 sayfalarındaki problemleri çözünüz. Çözümleri düzenli ve okunaklı şekilde yazınız.',
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      title: 'Elektrik Devre Projesi',
      description: 'Basit elektrik devresi tasarımı ve uygulaması',
      classId: 'class1',
      className: '9-A',
      subjectId: 'physics',
      subjectName: 'Fizik',
      teacherId: 'teacher2',
      teacherName: 'Ayşe Demir',
      type: 'project',
      assignedDate: '2024-11-20',
      dueDate: '2024-12-20',
      maxPoints: 150,
      instructions: 'Seri ve paralel bağlı LED devreleri tasarlayın. Malzeme listesi ve çizimler dahil edilmelidir.',
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '3',
      title: 'Çevre Kirliliği Kompozisyonu',
      description: 'Çevre kirliliği ve çözüm önerileri hakkında kompozisyon',
      classId: 'class1',
      className: '9-A',
      subjectId: 'turkish',
      subjectName: 'Türkçe',
      teacherId: 'teacher3',
      teacherName: 'Mehmet Kaya',
      type: 'essay',
      assignedDate: '2024-12-05',
      dueDate: '2024-12-10',
      maxPoints: 75,
      instructions: 'En az 500 kelime, giriş-gelişme-sonuç bölümleri olacak şekilde yazınız.',
      status: 'overdue',
      tenantId: currentTenantId || 'demo-school',
    },
  ];

  const mockSubmissions: Submission[] = [
    {
      id: '1',
      assignmentId: '1',
      assignmentTitle: 'Fonksiyonlar Konusu Ödev 1',
      studentId: 'student1',
      studentName: 'Ahmet Yılmaz',
      studentNumber: '2024001',
      className: '9-A',
      submissionDate: '2024-12-14',
      content: 'Tüm problemleri çözdüm.',
      status: 'submitted',
      submittedAt: '2024-12-14T14:30:00',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      assignmentId: '1',
      assignmentTitle: 'Fonksiyonlar Konusu Ödev 1',
      studentId: 'student2',
      studentName: 'Ayşe Demir',
      studentNumber: '2024002',
      className: '9-A',
      submissionDate: '2024-12-13',
      content: 'Ödevimi tamamladım.',
      grade: 85,
      feedback: 'İyi çalışma, bazı hesaplama hataları var.',
      status: 'graded',
      submittedAt: '2024-12-13T16:45:00',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '3',
      assignmentId: '2',
      assignmentTitle: 'Elektrik Devre Projesi',
      studentId: 'student1',
      studentName: 'Ahmet Yılmaz',
      studentNumber: '2024001',
      className: '9-A',
      submissionDate: '',
      content: '',
      status: 'not_submitted',
      tenantId: currentTenantId || 'demo-school',
    },
  ];

  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setAssignments(mockAssignments);
          setSubmissions(mockSubmissions);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Ödevler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadAssignments();
    }
  }, [currentTenantId, mockAssignments, mockSubmissions]);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = classFilter === 'all' || assignment.className === classFilter;
    const matchesSubject = subjectFilter === 'all' || assignment.subjectName === subjectFilter;
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesType = typeFilter === 'all' || assignment.type === typeFilter;
    
    return matchesSearch && matchesClass && matchesSubject && matchesStatus && matchesType;
  });

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.studentNumber.includes(searchTerm);
    
    const matchesClass = classFilter === 'all' || submission.className === classFilter;
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleCreateAssignment = () => {
    setSelectedAssignment(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm('Bu ödevi silmek istediğinizden emin misiniz?')) {
      try {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      } catch (error) {
        console.error('Ödev silinirken hata:', error);
      }
    }
  };

  const AssignmentForm = () => (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Ödev Başlığı</label>
        <Input 
          placeholder="Ödev başlığını girin"
          defaultValue={selectedAssignment?.title}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Açıklama</label>
        <Textarea 
          placeholder="Ödev açıklaması"
          defaultValue={selectedAssignment?.description}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sınıf</label>
          <Select defaultValue={selectedAssignment?.classId}>
            <SelectTrigger>
              <SelectValue placeholder="Sınıf seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="class1">9-A</SelectItem>
              <SelectItem value="class2">10-B</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ders</label>
          <Select defaultValue={selectedAssignment?.subjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Ders seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Matematik</SelectItem>
              <SelectItem value="physics">Fizik</SelectItem>
              <SelectItem value="turkish">Türkçe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tür</label>
          <Select defaultValue={selectedAssignment?.type}>
            <SelectTrigger>
              <SelectValue placeholder="Tür seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="homework">Ödev</SelectItem>
              <SelectItem value="project">Proje</SelectItem>
              <SelectItem value="essay">Kompozisyon</SelectItem>
              <SelectItem value="presentation">Sunum</SelectItem>
              <SelectItem value="lab_report">Lab Raporu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Verilme Tarihi</label>
          <Input 
            type="date"
            defaultValue={selectedAssignment?.assignedDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Son Tarih</label>
          <Input 
            type="date"
            defaultValue={selectedAssignment?.dueDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Maksimum Puan</label>
          <Input 
            type="number"
            placeholder="100"
            defaultValue={selectedAssignment?.maxPoints}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Yönergeler</label>
        <Textarea 
          placeholder="Ödev yönergeleri ve açıklamaları"
          defaultValue={selectedAssignment?.instructions}
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setIsCreateDialogOpen(false)}
        >
          İptal
        </Button>
        <Button type="submit">
          {selectedAssignment ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );

  const assignmentTableColumns = [
    ...assignmentColumns,
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Assignment } }) => {
        const assignment = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditAssignment(assignment)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDeleteAssignment(assignment.id)}
            >
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
          <h1 className="text-2xl font-bold">Ödev Yönetimi</h1>
          <p className="text-gray-600">Ödevleri oluşturun ve takip edin</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor Al
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Ödev
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedAssignment ? 'Ödev Düzenle' : 'Yeni Ödev Oluştur'}
                </DialogTitle>
              </DialogHeader>
              <AssignmentForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Ödev</p>
                <p className="text-xl font-semibold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Ödev</p>
                <p className="text-xl font-semibold">
                  {assignments.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Süresi Geçen</p>
                <p className="text-xl font-semibold">
                  {assignments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Teslim Edildi</p>
                <p className="text-xl font-semibold">
                  {submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Ödevler</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Teslimler</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödev Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Ödev ara"
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
                    <SelectItem value="Türkçe">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tür filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Türler</SelectItem>
                    <SelectItem value="homework">Ödev</SelectItem>
                    <SelectItem value="project">Proje</SelectItem>
                    <SelectItem value="essay">Kompozisyon</SelectItem>
                    <SelectItem value="presentation">Sunum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={assignmentTableColumns}
                data={filteredAssignments}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödev Teslimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Öğrenci veya ödev ara"
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
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="not_submitted">Teslim Edilmedi</SelectItem>
                    <SelectItem value="submitted">Teslim Edildi</SelectItem>
                    <SelectItem value="late">Geç Teslim</SelectItem>
                    <SelectItem value="graded">Notlandırıldı</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={submissionColumns}
                data={filteredSubmissions}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}