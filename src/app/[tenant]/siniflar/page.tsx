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
import { Plus, Search, Edit, Trash2, Users, BookOpen, Clock, User } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface Class {
  id: string;
  name: string;
  grade: number;
  section: string;
  capacity: number;
  currentEnrollment: number;
  academicYear: string;
  mainTeacherId?: string;
  mainTeacherName?: string;
  classroom?: string;
  subjects: string[];
  schedule: {
    [key: string]: {
      periods: {
        time: string;
        subject: string;
        teacher: string;
      }[];
    };
  };
  status: 'active' | 'inactive' | 'completed';
  tenantId: string;
}

const classColumns = [
  {
    accessorKey: 'name',
    header: 'Sınıf Adı',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const className = row.getValue('name');
      return <span className="font-medium">{className}</span>;
    },
  },
  {
    accessorKey: 'grade',
    header: 'Seviye',
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      const grade = row.getValue('grade');
      return <Badge variant="outline">{grade}. Sınıf</Badge>;
    },
  },
  {
    accessorKey: 'currentEnrollment',
    header: 'Öğrenci Sayısı',
    cell: ({ row }: { row: { getValue: (key: string) => number; original: Class } }) => {
      const current = row.getValue('currentEnrollment');
      const capacity = row.original.capacity;
      return (
        <div className="flex items-center space-x-2">
          <span>
            {current}/{capacity}
          </span>
          <div className="h-2 w-12 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${(current / capacity) * 100}%` }}
            ></div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'mainTeacherName',
    header: 'Sınıf Öğretmeni',
    cell: ({ row }: { row: { getValue: (key: string) => string | undefined } }) => {
      const teacher = row.getValue('mainTeacherName');
      return teacher ? <span>{teacher}</span> : <Badge variant="outline">Atanmamış</Badge>;
    },
  },
  {
    accessorKey: 'classroom',
    header: 'Derslik',
    cell: ({ row }: { row: { getValue: (key: string) => string | undefined } }) => {
      const classroom = row.getValue('classroom');
      return classroom ? (
        <Badge variant="secondary">{classroom}</Badge>
      ) : (
        <Badge variant="outline">Belirlenmemiş</Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue('status');
      const statusConfig = {
        active: { label: 'Aktif', variant: 'default' as const },
        inactive: { label: 'Pasif', variant: 'secondary' as const },
        completed: { label: 'Tamamlandı', variant: 'outline' as const },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
];

export default function ClassesPage() {
  const { currentTenantId } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Mock data - gerçek uygulamada API'den gelecek
  const mockClasses: Class[] = useMemo(
    () => [
      {
        id: '1',
        name: '9-A',
        grade: 9,
        section: 'A',
        capacity: 30,
        currentEnrollment: 28,
        academicYear: '2024-2025',
        mainTeacherId: 'teacher1',
        mainTeacherName: 'Ahmet Yılmaz',
        classroom: 'A101',
        subjects: [
          'Matematik',
          'Fizik',
          'Kimya',
          'Biyoloji',
          'Türkçe',
          'İngilizce',
          'Tarih',
          'Coğrafya',
        ],
        schedule: {
          Pazartesi: {
            periods: [
              { time: '09:00-09:45', subject: 'Matematik', teacher: 'Ahmet Yılmaz' },
              { time: '09:55-10:40', subject: 'Fizik', teacher: 'Ayşe Demir' },
              { time: '11:00-11:45', subject: 'Türkçe', teacher: 'Mehmet Kaya' },
              { time: '11:55-12:40', subject: 'İngilizce', teacher: 'Zeynep Şahin' },
            ],
          },
        },
        status: 'active',
        tenantId: currentTenantId || 'demo-school',
      },
      {
        id: '2',
        name: '10-B',
        grade: 10,
        section: 'B',
        capacity: 25,
        currentEnrollment: 23,
        academicYear: '2024-2025',
        mainTeacherId: 'teacher2',
        mainTeacherName: 'Ayşe Demir',
        classroom: 'B201',
        subjects: [
          'Matematik',
          'Fizik',
          'Kimya',
          'Biyoloji',
          'Türkçe',
          'İngilizce',
          'Tarih',
          'Coğrafya',
        ],
        schedule: {
          Pazartesi: {
            periods: [
              { time: '09:00-09:45', subject: 'Fizik', teacher: 'Ayşe Demir' },
              { time: '09:55-10:40', subject: 'Matematik', teacher: 'Ahmet Yılmaz' },
              { time: '11:00-11:45', subject: 'Kimya', teacher: 'Ali Veli' },
              { time: '11:55-12:40', subject: 'Türkçe', teacher: 'Mehmet Kaya' },
            ],
          },
        },
        status: 'active',
        tenantId: currentTenantId || 'demo-school',
      },
      {
        id: '3',
        name: '11-C',
        grade: 11,
        section: 'C',
        capacity: 28,
        currentEnrollment: 25,
        academicYear: '2024-2025',
        mainTeacherId: 'teacher3',
        mainTeacherName: 'Mehmet Kaya',
        classroom: 'C301',
        subjects: [
          'Matematik',
          'Fizik',
          'Kimya',
          'Biyoloji',
          'Türkçe',
          'İngilizce',
          'Tarih',
          'Coğrafya',
        ],
        schedule: {
          Pazartesi: {
            periods: [
              { time: '09:00-09:45', subject: 'Türkçe', teacher: 'Mehmet Kaya' },
              { time: '09:55-10:40', subject: 'Matematik', teacher: 'Ahmet Yılmaz' },
              { time: '11:00-11:45', subject: 'Fizik', teacher: 'Ayşe Demir' },
              { time: '11:55-12:40', subject: 'İngilizce', teacher: 'Zeynep Şahin' },
            ],
          },
        },
        status: 'active',
        tenantId: currentTenantId || 'demo-school',
      },
    ],
    [currentTenantId]
  );

  useEffect(() => {
    const loadClasses = async () => {
      setLoading(true);
      try {
        // Gerçek uygulamada API çağrısı yapılacak
        setTimeout(() => {
          setClasses(mockClasses);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Sınıflar yüklenirken hata:', error);
        setLoading(false);
      }
    };

    if (currentTenantId) {
      loadClasses();
    }
  }, [currentTenantId]);

  useEffect(() => {
    setClasses(mockClasses);
  }, [mockClasses]);

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.mainTeacherName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade = gradeFilter === 'all' || classItem.grade.toString() === gradeFilter;
    const matchesStatus = statusFilter === 'all' || classItem.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleCreateClass = () => {
    setSelectedClass(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Bu sınıfı silmek istediğinizden emin misiniz?')) {
      try {
        setClasses((prev) => prev.filter((c) => c.id !== classId));
      } catch (error) {
        console.error('Sınıf silinirken hata:', error);
      }
    }
  };

  const ClassForm = () => (
    <form className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Seviye</label>
          <Select defaultValue={selectedClass?.grade.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Seviye seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">9. Sınıf</SelectItem>
              <SelectItem value="10">10. Sınıf</SelectItem>
              <SelectItem value="11">11. Sınıf</SelectItem>
              <SelectItem value="12">12. Sınıf</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Şube</label>
          <Select defaultValue={selectedClass?.section}>
            <SelectTrigger>
              <SelectValue placeholder="Şube seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
              <SelectItem value="D">D</SelectItem>
              <SelectItem value="E">E</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sınıf Adı</label>
          <Input placeholder="9-A" defaultValue={selectedClass?.name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Kapasite</label>
          <Input type="number" placeholder="30" defaultValue={selectedClass?.capacity} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Akademik Yıl</label>
          <Input placeholder="2024-2025" defaultValue={selectedClass?.academicYear} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Sınıf Öğretmeni</label>
          <Select defaultValue={selectedClass?.mainTeacherId}>
            <SelectTrigger>
              <SelectValue placeholder="Öğretmen seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teacher1">Ahmet Yılmaz</SelectItem>
              <SelectItem value="teacher2">Ayşe Demir</SelectItem>
              <SelectItem value="teacher3">Mehmet Kaya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Derslik</label>
          <Input placeholder="A101" defaultValue={selectedClass?.classroom} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Durum</label>
        <Select defaultValue={selectedClass?.status || 'active'}>
          <SelectTrigger>
            <SelectValue placeholder="Durum seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
          İptal
        </Button>
        <Button type="submit">{selectedClass ? 'Güncelle' : 'Kaydet'}</Button>
      </div>
    </form>
  );

  const classTableColumns = [
    ...classColumns,
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Class } }) => {
        const classItem = row.original;
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleEditClass(classItem)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteClass(classItem.id)}>
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
          <h1 className="text-2xl font-bold">Sınıf Yönetimi</h1>
          <p className="text-gray-600">Okul sınıflarını yönetin ve organize edin</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClass}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Sınıf
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedClass ? 'Sınıf Düzenle' : 'Yeni Sınıf Oluştur'}</DialogTitle>
            </DialogHeader>
            <ClassForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-100 p-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Sınıf</p>
                <p className="text-xl font-semibold">{classes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-green-100 p-2">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Öğrenci</p>
                <p className="text-xl font-semibold">
                  {classes.reduce((sum, c) => sum + c.currentEnrollment, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-yellow-100 p-2">
                <User className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ortalama Öğrenci</p>
                <p className="text-xl font-semibold">
                  {Math.round(
                    classes.reduce((sum, c) => sum + c.currentEnrollment, 0) / classes.length
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-purple-100 p-2">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doluluk Oranı</p>
                <p className="text-xl font-semibold">
                  {Math.round(
                    (classes.reduce((sum, c) => sum + c.currentEnrollment, 0) /
                      classes.reduce((sum, c) => sum + c.capacity, 0)) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sınıf Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Sınıf ara (ad, öğretmen)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seviye filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Seviyeler</SelectItem>
                <SelectItem value="9">9. Sınıf</SelectItem>
                <SelectItem value="10">10. Sınıf</SelectItem>
                <SelectItem value="11">11. Sınıf</SelectItem>
                <SelectItem value="12">12. Sınıf</SelectItem>
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
                <SelectItem value="completed">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={classTableColumns} data={filteredClasses} />
        </CardContent>
      </Card>
    </div>
  );
}
