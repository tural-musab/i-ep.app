'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye, Edit2, AlertCircle, CheckCircle, Lock, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { UserRole } from '@/types/auth';

type User = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role: UserRole;
  tenant_id: string | null;
  tenant_name?: string;
  last_sign_in_at?: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Kullanıcı Adı',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.full_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }: { row: { original: User } }) => {
        const role = row.original.role;
        let color = 'bg-blue-50 text-blue-700 border-blue-200';
        
        if (role === 'super_admin') {
          color = 'bg-purple-50 text-purple-700 border-purple-200';
        } else if (role === 'tenant_admin') {
          color = 'bg-green-50 text-green-700 border-green-200';
        } else if (role === 'teacher') {
          color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
        
        return (
          <Badge variant="outline" className={color}>
            {role === 'super_admin'
              ? 'Süper Admin'
              : role === 'tenant_admin'
                ? 'Tenant Admin'
                : role === 'teacher'
                  ? 'Öğretmen'
                  : role === 'student'
                    ? 'Öğrenci'
                    : 'Kullanıcı'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'tenant_name',
      header: 'Tenant',
      cell: ({ row }: { row: { original: User } }) => row.original.tenant_name || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Durum',
      cell: ({ row }: { row: { original: User } }) => (
        <div>
          {row.original.is_active ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aktif
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pasif
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'last_sign_in_at',
      header: 'Son Giriş',
      cell: ({ row }: { row: { original: User } }) => (
        row.original.last_sign_in_at
          ? format(new Date(row.original.last_sign_in_at), 'dd MMM yyyy', { locale: tr })
          : 'Hiç giriş yapmadı'
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Kayıt Tarihi',
      cell: ({ row }: { row: { original: User } }) => format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: tr }),
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: User } }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" title="Görüntüle">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Düzenle">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Şifre Sıfırla"
          >
            <Lock className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title={row.original.is_active ? "Pasifleştir" : "Aktifleştir"}
          >
            {row.original.is_active 
              ? <AlertCircle className="h-4 w-4" /> 
              : <CheckCircle className="h-4 w-4" />
            }
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const supabase = createClientComponentClient();
        
        // Kullanıcıları getir
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (usersError) throw usersError;
        
        // Tenant bilgilerini ekle
        const enrichedUsers = await Promise.all((users || []).map(async (user) => {
          let tenantName = null;
          
          if (user.tenant_id) {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('name')
              .eq('id', user.tenant_id)
              .single();
            
            tenantName = tenantData?.name;
          }
          
          // Son giriş bilgisini getir
          const { data: authUser } = await supabase
            .from('auth.users')
            .select('last_sign_in_at')
            .eq('id', user.id)
            .single();
          
          return {
            ...user,
            tenant_name: tenantName,
            last_sign_in_at: authUser?.last_sign_in_at
          };
        }));
        
        setUsers(enrichedUsers);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcılar</h1>
          <p className="text-muted-foreground">
            Sistem üzerindeki tüm kullanıcıları yönetin
          </p>
        </div>
        <Button className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm kullanıcıların listesi ve temel bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchColumn="full_name"
            searchPlaceholder="Kullanıcı ara..."
            isLoading={isLoading}
            emptyMessage="Hiç kullanıcı bulunamadı"
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  );
} 