'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { AdminGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit,
  Trash2,
  UserCheck,
  UserX,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCreateModal } from '@/components/admin/user-create-modal';

// User data types
interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  status: 'active' | 'inactive' | 'pending';
  class?: string;
  subject?: string;
  joinDate: string;
  lastLogin?: string;
  studentCount?: number; // For teachers and parents
}

// Mock data for Turkish education system
const DEMO_USERS: User[] = [
  // Admin users
  {
    id: '1',
    email: 'admin@iep.app',
    fullName: 'Mehmet Yılmaz',
    role: 'admin',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2025-01-25 09:30'
  },
  // Teachers
  {
    id: '2',
    email: 'ahmet.yilmaz@iep.app',
    fullName: 'Ahmet Yılmaz',
    role: 'teacher',
    status: 'active',
    subject: 'Matematik',
    joinDate: '2024-02-01',
    lastLogin: '2025-01-25 08:45',
    studentCount: 48
  },
  {
    id: '3',
    email: 'ayse.demir@iep.app',
    fullName: 'Ayşe Demir',
    role: 'teacher',
    status: 'active',
    subject: 'Fizik',
    joinDate: '2024-02-01',
    lastLogin: '2025-01-24 16:20',
    studentCount: 35
  },
  {
    id: '4',
    email: 'fatma.ozkan@iep.app',
    fullName: 'Fatma Özkan',
    role: 'teacher',
    status: 'pending',
    subject: 'Matematik',
    joinDate: '2025-01-25',
    studentCount: 0
  },
  // Students
  {
    id: '5',
    email: 'ali.kaya@ogrenci.iep.app',
    fullName: 'Ali Kaya',
    role: 'student',
    status: 'active',
    class: '10-A',
    joinDate: '2024-09-01',
    lastLogin: '2025-01-25 10:15'
  },
  {
    id: '6',
    email: 'zeynep.sahin@ogrenci.iep.app',
    fullName: 'Zeynep Şahin',
    role: 'student',
    status: 'active',
    class: '11-B',
    joinDate: '2024-09-01',
    lastLogin: '2025-01-25 09:50'
  },
  {
    id: '7',
    email: 'emre.celik@ogrenci.iep.app',
    fullName: 'Emre Çelik',
    role: 'student',
    status: 'inactive',
    class: '9-C',
    joinDate: '2024-09-01',
    lastLogin: '2025-01-20 14:30'
  },
  // Parents
  {
    id: '8',
    email: 'mehmet.kaya@veli.iep.app',
    fullName: 'Mehmet Kaya',
    role: 'parent',
    status: 'active',
    joinDate: '2024-09-05',
    lastLogin: '2025-01-24 20:15',
    studentCount: 1
  },
  {
    id: '9',
    email: 'sultan.sahin@veli.iep.app',
    fullName: 'Sultan Şahin',
    role: 'parent',
    status: 'active',
    joinDate: '2024-09-05',
    lastLogin: '2025-01-25 07:30',
    studentCount: 2
  },
];

function UserManagementContent() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load users data
  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/users');
        // const result = await response.json();
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        setUsers(DEMO_USERS);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers(DEMO_USERS);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get role badge styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="outline" className="border-red-500 text-red-600">Yönetici</Badge>;
      case 'teacher':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Öğretmen</Badge>;
      case 'student':
        return <Badge variant="outline" className="border-green-500 text-green-600">Öğrenci</Badge>;
      case 'parent':
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Veli</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-500 text-green-600">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">Pasif</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Beklemede</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // User action handlers
  const handleUserActivate = async (userId: string) => {
    // TODO: Implement API call
    console.log('Activating user:', userId);
    // Update local state
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'active' as const } : u
    ));
  };

  const handleUserDeactivate = async (userId: string) => {
    // TODO: Implement API call
    console.log('Deactivating user:', userId);
    // Update local state
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: 'inactive' as const } : u
    ));
  };

  const handleUserDelete = async (userId: string) => {
    // TODO: Implement API call with confirmation
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      console.log('Deleting user:', userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleUserCreate = async (userData: any) => {
    // TODO: Implement API call
    console.log('Creating user:', userData);
    
    // Generate new user ID
    const newUser: User = {
      id: (users.length + 1).toString(),
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      status: 'pending' as const,
      class: userData.class,
      subject: userData.subject,
      joinDate: new Date().toISOString().split('T')[0],
      studentCount: userData.role === 'teacher' ? 0 : undefined
    };

    // Add to local state
    setUsers(prev => [...prev, newUser]);
  };

  // Get user statistics
  const userStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
    parent: users.filter(u => u.role === 'parent').length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Kullanıcı verileri yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin Paneli'ne Dön
            </Link>
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Sistem kullanıcılarını yönetin, rol atayın ve hesap durumlarını kontrol edin
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yönetici</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{userStats.admin}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öğretmen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.teacher}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öğrenci</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.student}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{userStats.parent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beklemede</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userStats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcı Listesi</CardTitle>
              <CardDescription>
                {filteredUsers.length} kullanıcı gösteriliyor
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Dışa Aktar
              </Button>
              <UserCreateModal onUserCreate={handleUserCreate} isLoading={isLoading} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="mb-4 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="İsim veya email ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Roller</SelectItem>
                  <SelectItem value="admin">Yönetici</SelectItem>
                  <SelectItem value="teacher">Öğretmen</SelectItem>
                  <SelectItem value="student">Öğrenci</SelectItem>
                  <SelectItem value="parent">Veli</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-4 text-left font-medium">Kullanıcı</th>
                    <th className="p-4 text-left font-medium">Rol</th>
                    <th className="p-4 text-left font-medium">Durum</th>
                    <th className="p-4 text-left font-medium">Ek Bilgi</th>
                    <th className="p-4 text-left font-medium">Son Giriş</th>
                    <th className="p-4 text-left font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {user.class && <div>Sınıf: {user.class}</div>}
                          {user.subject && <div>Ders: {user.subject}</div>}
                          {user.studentCount !== undefined && (
                            <div>
                              {user.role === 'teacher' ? 'Öğrenci: ' : 'Çocuk: '}
                              {user.studentCount}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-500">
                          {user.lastLogin ? (
                            <>
                              {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                              <br />
                              {new Date(user.lastLogin).toLocaleTimeString('tr-TR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </>
                          ) : (
                            'Hiç giriş yapmamış'
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Düzenle
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem onClick={() => handleUserDeactivate(user.id)}>
                                <UserX className="mr-2 h-4 w-4" />
                                Pasifleştir
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserActivate(user.id)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Aktifleştir
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleUserDelete(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Arama kriterlerinize uygun kullanıcı bulunamadı.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserManagementPage() {
  return (
    <AdminGuard
      fallback={
        <AccessDenied
          title="Yönetici Girişi Gerekli"
          message="Bu sayfayı görüntülemek için yönetici hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <UserManagementContent />
      </Suspense>
    </AdminGuard>
  );
}