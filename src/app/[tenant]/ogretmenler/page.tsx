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
import { Plus, Search, Edit, Trash2, User, BookOpen, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface Teacher {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  hireDate: string;
  department: string;
  position: string;
  subjects: string[];
  qualifications: string[];
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  tenantId: string;
}

const teacherColumns = [
  {
    accessorKey: 'employeeNumber',
    header: 'Sicil No',
  },
  {
    accessorKey: 'fullName',
    header: 'Ad Soyad',
  },
  {
    accessorKey: 'department',
    header: 'Bölüm',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const department = row.getValue('department');
      return <Badge variant="secondary">{department}</Badge>;
    },
  },
  {
    accessorKey: 'subjects',
    header: 'Dersler',
    cell: ({ row }: { row: { getValue: (key: string) => string[] } }) => {
      const subjects = row.getValue('subjects');
      return (
        <div className="flex flex-wrap gap-1">
          {subjects.slice(0, 2).map((subject: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {subject}
            </Badge>
          ))}
          {subjects.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{subjects.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'position',
    header: 'Pozisyon',
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        active: { label: 'Aktif', variant: 'default' as const },
        inactive: { label: 'Pasif', variant: 'secondary' as const },
        on_leave: { label: 'İzinli', variant: 'outline' as const },
        terminated: { label: 'Ayrıldı', variant: 'destructive' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
];

export default function TeachersPage() {
  const { currentTenantId } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  const mockTeachers: Teacher[] = [
    {
      id: '1',
      employeeNumber: 'T2024001',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      fullName: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@school.com',
      phone: '0532 111 2233',
      dateOfBirth: '1985-05-12',
      hireDate: '2020-09-01',
      department: 'Matematik',
      position: 'Matematik Öğretmeni',
      subjects: ['Matematik', 'Geometri'],
      qualifications: ['Matematik Lisans', 'Eğitim Yüksek Lisans'],
      address: 'Kadıköy, İstanbul',
      emergencyContact: {
        name: 'Fatma Yılmaz',
        phone: '0532 444 5566',
        relationship: 'Eş'
      },
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '2',
      employeeNumber: 'T2024002',
      firstName: 'Ayşe',
      lastName: 'Demir',
      fullName: 'Ayşe Demir',
      email: 'ayse.demir@school.com',
      phone: '0533 222 3344',
      dateOfBirth: '1988-08-20',
      hireDate: '2021-02-15',
      department: 'Fen Bilimleri',
      position: 'Fizik Öğretmeni',
      subjects: ['Fizik', 'Fen Bilgisi'],
      qualifications: ['Fizik Lisans', 'Doktora'],
      address: 'Beşiktaş, İstanbul',
      emergencyContact: {
        name: 'Mehmet Demir',
        phone: '0533 555 6677',
        relationship: 'Eş'
      },
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
    {
      id: '3',
      employeeNumber: 'T2024003',
      firstName: 'Mehmet',
      lastName: 'Kaya',
      fullName: 'Mehmet Kaya',
      email: 'mehmet.kaya@school.com',
      phone: '0534 333 4455',
      dateOfBirth: '1982-12-03',
      hireDate: '2019-09-01',
      department: 'Edebiyat',
      position: 'Türkçe Öğretmeni',
      subjects: ['Türkçe', 'Edebiyat'],
      qualifications: ['Türk Dili ve Edebiyatı Lisans', 'Pedagojik Formasyon'],
      address: 'Üsküdar, İstanbul',
      emergencyContact: {
        name: 'Zeynep Kaya',
        phone: '0534 666 7788',
        relationship: 'Eş'
      },
      status: 'active',
      tenantId: currentTenantId || 'demo-school',
    },
  ];

  useEffect(() => {
    const loadTeachers = async () => {
      setLoading(true);
      try {
        // Gerçek uygulamada API çağrısı yapılacak
        setTimeout(() => {
          setTeachers(mockTeachers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Öğretmenler yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadTeachers();
    }
  }, [currentTenantId, mockTeachers]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === 'all' || teacher.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleCreateTeacher = () => {
    setSelectedTeacher(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (confirm('Bu öğretmeni silmek istediğinizden emin misiniz?')) {
      try {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
      } catch (error) {
        console.error('Öğretmen silinirken hata:', error);
      }
    }
  };

  const TeacherForm = () => (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ad</label>
          <Input 
            placeholder="Öğretmen adı"
            defaultValue={selectedTeacher?.firstName}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Soyad</label>
          <Input 
            placeholder="Öğretmen soyadı"
            defaultValue={selectedTeacher?.lastName}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Sicil Numarası</label>
          <Input 
            placeholder="T2024001"
            defaultValue={selectedTeacher?.employeeNumber}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <Input 
            type="email"
            placeholder="ogretmen@school.com"
            defaultValue={selectedTeacher?.email}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Telefon</label>
          <Input 
            placeholder="0532 123 4567"
            defaultValue={selectedTeacher?.phone}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Doğum Tarihi</label>
          <Input 
            type="date"
            defaultValue={selectedTeacher?.dateOfBirth}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">İşe Başlama Tarihi</label>
          <Input 
            type="date"
            defaultValue={selectedTeacher?.hireDate}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bölüm</label>
          <Select defaultValue={selectedTeacher?.department}>
            <SelectTrigger>
              <SelectValue placeholder="Bölüm seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Matematik">Matematik</SelectItem>
              <SelectItem value="Fen Bilimleri">Fen Bilimleri</SelectItem>
              <SelectItem value="Edebiyat">Edebiyat</SelectItem>
              <SelectItem value="Sosyal Bilimler">Sosyal Bilimler</SelectItem>
              <SelectItem value="Yabancı Dil">Yabancı Dil</SelectItem>
              <SelectItem value="Sanat">Sanat</SelectItem>
              <SelectItem value="Beden Eğitimi">Beden Eğitimi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pozisyon</label>
        <Input 
          placeholder="Matematik Öğretmeni"
          defaultValue={selectedTeacher?.position}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Dersler</label>
        <Input 
          placeholder="Matematik, Geometri (virgülle ayırın)"
          defaultValue={selectedTeacher?.subjects.join(', ')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nitelikler/Eğitim</label>
        <Textarea 
          placeholder="Eğitim durumu ve sertifikalar"
          defaultValue={selectedTeacher?.qualifications.join(', ')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Adres</label>
        <Textarea 
          placeholder="Tam adres"
          defaultValue={selectedTeacher?.address}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Acil Durum İletişim</h3>
        <div className="grid grid-cols-3 gap-2">
          <Input 
            placeholder="Ad Soyad"
            defaultValue={selectedTeacher?.emergencyContact.name}
          />
          <Input 
            placeholder="Telefon"
            defaultValue={selectedTeacher?.emergencyContact.phone}
          />
          <Input 
            placeholder="Yakınlık"
            defaultValue={selectedTeacher?.emergencyContact.relationship}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Durum</label>
        <Select defaultValue={selectedTeacher?.status || 'active'}>
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
            <SelectItem value="on_leave">İzinli</SelectItem>
            <SelectItem value="terminated">Ayrıldı</SelectItem>
          </SelectContent>
        </Select>
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
          {selectedTeacher ? 'Güncelle' : 'Kaydet'}
        </Button>
      </div>
    </form>
  );

  const teacherTableColumns = [
    ...teacherColumns,
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Teacher } }) => {
        const teacher = row.original;
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditTeacher(teacher)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDeleteTeacher(teacher.id)}
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
          <h1 className="text-2xl font-bold">Öğretmen Yönetimi</h1>
          <p className="text-gray-600">Öğretmen kadrosunu yönetin ve takip edin</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateTeacher}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Öğretmen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTeacher ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle'}
              </DialogTitle>
            </DialogHeader>
            <TeacherForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Öğretmen</p>
                <p className="text-xl font-semibold">{teachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Aktif Öğretmen</p>
                <p className="text-xl font-semibold">
                  {teachers.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <BookOpen className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bölümler</p>
                <p className="text-xl font-semibold">
                  {new Set(teachers.map(t => t.department)).size}
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
                <p className="text-sm text-gray-600">Ortalama Deneyim</p>
                <p className="text-xl font-semibold">5.2 yıl</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Öğretmen Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Öğretmen ara (ad, sicil no, ders)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Bölüm filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Bölümler</SelectItem>
                <SelectItem value="Matematik">Matematik</SelectItem>
                <SelectItem value="Fen Bilimleri">Fen Bilimleri</SelectItem>
                <SelectItem value="Edebiyat">Edebiyat</SelectItem>
                <SelectItem value="Sosyal Bilimler">Sosyal Bilimler</SelectItem>
                <SelectItem value="Yabancı Dil">Yabancı Dil</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="on_leave">İzinli</SelectItem>
                <SelectItem value="terminated">Ayrıldı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={teacherTableColumns}
            data={filteredTeachers}
          />
        </CardContent>
      </Card>
    </div>
  );
}