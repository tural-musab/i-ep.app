'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, Edit2, AlertCircle, CheckCircle, Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Tenant = {
  id: string;
  name: string;
  schema_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subscription_tier: string;
  domain: string | null;
  company_details: Record<string, unknown>;
  admin_user_id: string;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Tenant Adı',
      cell: ({ row }: { row: { original: Tenant } }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{row.original.name}</span>
          {!row.original.is_active && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pasif
            </Badge>
          )}
          {row.original.is_active && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Aktif
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'schema_name',
      header: 'Şema Adı',
    },
    {
      accessorKey: 'subscription_tier',
      header: 'Abonelik',
      cell: ({ row }: { row: { original: Tenant } }) => (
        <Badge variant="secondary">
          {row.original.subscription_tier || 'Standart'}
        </Badge>
      ),
    },
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }: { row: { original: Tenant } }) => row.original.domain || '-',
    },
    {
      accessorKey: 'created_at',
      header: 'Oluşturulma Tarihi',
      cell: ({ row }: { row: { original: Tenant } }) => format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: tr }),
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Tenant } }) => (
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
            title={row.original.is_active ? "Arşivle" : "Aktifleştir"}
          >
            {row.original.is_active 
              ? <Archive className="h-4 w-4" /> 
              : <CheckCircle className="h-4 w-4" />
            }
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    async function fetchTenants() {
      setIsLoading(true);
      try {
        const supabase = createClientComponentClient();
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTenants(data || []);
      } catch (error) {
        console.error('Tenantlar yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenants();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenantlar</h1>
          <p className="text-muted-foreground">
            Sistem üzerindeki tüm kurumları yönetin
          </p>
        </div>
        <Button className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Tenant Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm tenantların listesi ve detayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tenants}
            searchColumn="name"
            searchPlaceholder="Tenant ara..."
            isLoading={isLoading}
            emptyMessage="Hiç tenant bulunamadı"
          />
        </CardContent>
      </Card>
    </div>
  );
} 