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
import { Plus, Search, Download, Upload, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  address: string;
  classId?: string;
  className?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  tenantId: string;
}

const studentColumns = [
  {
    accessorKey: 'studentNumber',
    header: 'Öğrenci No',
  },
  {
    accessorKey: 'fullName',
    header: 'Ad Soyad',
  },
  {
    accessorKey: 'className',
    header: 'Sınıf',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const className = row.getValue('className');
      return className ? (
        <Badge variant="secondary">{className}</Badge>
      ) : (
        <Badge variant="outline">Atanmamış</Badge>
      );
    },
  },
  {
    accessorKey: 'parentName',
    header: 'Veli',
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        active: { label: 'Aktif', variant: 'default' as const },
        inactive: { label: 'Pasif', variant: 'secondary' as const },
        graduated: { label: 'Mezun', variant: 'outline' as const },
        transferred: { label: 'Nakil', variant: 'destructive' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
];

export default function StudentsPage() {
  const { currentTenantId } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockStudents: Student[] = [
    {
      id: '1',
      studentNumber: '2024001',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      phone: '0532 123 4567',
      dateOfBirth: '2010-03-15',
      gender: 'male',
      address: 'Kadıköy, İstanbul',
      classId: 'class1',
      className: '9-A',
      parentName: 'Mehmet Yılmaz',
      parentPhone: '0532 987 6543',
      parentEmail: 'mehmet.yilmaz@example.com',
      enrollmentDate: '2024-09-01',
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      studentNumber: '2024002',
      firstName: 'Ayşe',
      lastName: 'Demir',
      fullName: 'Ayşe Demir',
      email: 'ayse.demir@example.com',
      phone: '0533 234 5678',
      dateOfBirth: '2010-07-22',
      gender: 'female',
      address: 'Beşiktaş, İstanbul',
      classId: 'class1',
      className: '9-A',
      parentName: 'Fatma Demir',
      parentPhone: '0533 876 5432',
      parentEmail: 'fatma.demir@example.com',
      enrollmentDate: '2024-09-01',
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '3',
      studentNumber: '2024003',
      firstName: 'Mustafa',
      lastName: 'Kaya',
      fullName: 'Mustafa Kaya',
      email: 'mustafa.kaya@example.com',
      phone: '0534 345 6789',
      dateOfBirth: '2009-11-08',
      gender: 'male',
      address: 'Üsküdar, İstanbul',
      classId: 'class2',
      className: '10-B',
      parentName: 'Ali Kaya',
      parentPhone: '0534 765 4321',
      parentEmail: 'ali.kaya@example.com',
      enrollmentDate: '2023-09-01',
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
  ];

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        // Gerçek uygulamada StudentRepository kullanılacak
        // const studentRepo = new StudentRepository();
        // const studentsData = await studentRepo.getStudentsByTenant(currentTenantId);
        
        // Şimdilik mock data kullanıyoruz
        const mockStudentsList: Student[] = [
          {
            id: '1',
            studentNumber: '2024001',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            fullName: 'Ahmet Yılmaz',
            email: 'ahmet.yilmaz@example.com',
            phone: '0532 123 4567',
            dateOfBirth: '2010-03-15',
            gender: 'male',
            address: 'Kadıköy, İstanbul',
            classId: 'class1',
            className: '9-A',
            parentName: 'Mehmet Yılmaz',
            parentPhone: '0532 987 6543',
            parentEmail: 'mehmet.yilmaz@example.com',
            enrollmentDate: '2024-09-01',
            status: 'active',
            tenantId: currentTenantId || 'demo-school',
          },
          {
            id: '2',
            studentNumber: '2024002',
            firstName: 'Ayşe',
            lastName: 'Demir',
            fullName: 'Ayşe Demir',
            email: 'ayse.demir@example.com',
            phone: '0533 234 5678',
            dateOfBirth: '2010-07-22',
            gender: 'female',
            address: 'Beşiktaş, İstanbul',
            classId: 'class1',
            className: '9-A',
            parentName: 'Fatma Demir',
            parentPhone: '0533 876 5432',
            parentEmail: 'fatma.demir@example.com',
            enrollmentDate: '2024-09-01',
            status: 'active',
            tenantId: currentTenantId || 'demo-school',
          },
          {
            id: '3',
            studentNumber: '2024003',
            firstName: 'Mustafa',
            lastName: 'Kaya',
            fullName: 'Mustafa Kaya',
            email: 'mustafa.kaya@example.com',
            phone: '0534 345 6789',
            dateOfBirth: '2009-11-08',
            gender: 'male',
            address: 'Üsküdar, İstanbul',
            classId: 'class2',
            className: '10-B',
            parentName: 'Ali Kaya',
            parentPhone: '0534 765 4321',
            parentEmail: 'ali.kaya@example.com',
            enrollmentDate: '2023-09-01',
            status: 'active',
            tenantId: currentTenantId || 'demo-school',
          },
        ];
        
        setTimeout(() => {
          setStudents(mockStudentsList);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Öğrenciler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadStudents();
    }
  }, [currentTenantId]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesClass = classFilter === 'all' || student.className === classFilter;
    
    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      try {
        // Gerçek uygulamada API çağrısı yapılacak
        setStudents(prev => prev.filter(s => s.id !== studentId));
      } catch (error) {
        console.error('Öğrenci silinirken hata:', error);
      }
    }
  };

  const StudentForm = () => (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ad</label>
          <Input 
            placeholder="Öğrenci adı"
            defaultValue={selectedStudent?.firstName}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Soyad</label>
          <Input 
            placeholder="Öğrenci soyadı"
            defaultValue={selectedStudent?.lastName}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Öğrenci Numarası</label>
          <Input 
            placeholder="2024001"
            defaultValue={selectedStudent?.studentNumber}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cinsiyet</label>
          <Select defaultValue={selectedStudent?.gender}>
            <SelectTrigger>
              <SelectValue placeholder="Cinsiyet seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Erkek</SelectItem>
              <SelectItem value="female">Kız</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-posta</label>
        <Input 
          type="email"
          placeholder="ogrenci@example.com"
          defaultValue={selectedStudent?.email}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Telefon</label>
          <Input 
            placeholder="0532 123 4567"
            defaultValue={selectedStudent?.phone}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Doğum Tarihi</label>
          <Input 
            type="date"
            defaultValue={selectedStudent?.dateOfBirth}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adres</label>
        <Input 
          placeholder="Tam adres"
          defaultValue={selectedStudent?.address}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Veli Adı</label>
          <Input 
            placeholder="Veli ad soyad"
            defaultValue={selectedStudent?.parentName}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Veli Telefonu</label>
          <Input 
            placeholder="0532 987 6543"
            defaultValue={selectedStudent?.parentPhone}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Veli E-posta</label>
        <Input 
          type="email"
          placeholder="veli@example.com"
          defaultValue={selectedStudent?.parentEmail}
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
          {selectedStudent ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );

  const studentTableColumns = [
    ...studentColumns,
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Student } }) => {
        const student = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditStudent(student)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDeleteStudent(student.id)}
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
          <h1 className="text-2xl font-bold">Öğrenci Yönetimi</h1>
          <p className="text-gray-600">Okul öğrencilerini yönetin ve takip edin</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            İçe Aktar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Dışa Aktar
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateStudent}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Öğrenci
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedStudent ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle'}
                </DialogTitle>
              </DialogHeader>
              <StudentForm />
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
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Öğrenci</p>
                <p className="text-xl font-semibold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Eye className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Öğrenci</p>
                <p className="text-xl font-semibold">
                  {students.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Eye className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sınıflar</p>
                <p className="text-xl font-semibold">
                  {new Set(students.map(s => s.className).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu Yıl Kayıt</p>
                <p className="text-xl font-semibold">
                  {students.filter(s => s.enrollmentDate.startsWith('2024')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Öğrenci Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Öğrenci ara (ad, numara, veli)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="graduated">Mezun</SelectItem>
                <SelectItem value="transferred">Nakil</SelectItem>
              </SelectContent>
            </Select>
            
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
          </div>

          <DataTable
            columns={studentTableColumns}
            data={filteredStudents}
          />
        </CardContent>
      </Card>
    </div>
  );
}