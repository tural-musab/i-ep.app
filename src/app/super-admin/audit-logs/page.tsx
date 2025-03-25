'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AlertTriangle, Clock, Database, ShieldAlert, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type AuditLog = {
  id: string;
  tenant_id: string | null;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  old_data: any;
  new_data: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  tenant_name?: string;
  user_email?: string;
};

type AccessDeniedLog = {
  id: string;
  timestamp: string;
  user_id: string | null;
  ip_address: string;
  tenant_id: string | null;
  schema_name: string;
  table_name: string;
  command: string;
  error_message: string;
  attempted_query: string;
  tenant_name?: string;
  user_email?: string;
};

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState('activity');
  const [activityLogs, setActivityLogs] = useState<AuditLog[]>([]);
  const [accessDeniedLogs, setAccessDeniedLogs] = useState<AccessDeniedLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingAccessDenied, setIsLoadingAccessDenied] = useState(true);

  // Denetim günlükleri için sütunlar
  const activityColumns = [
    {
      accessorKey: 'created_at',
      header: 'Tarih',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.created_at), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: 'İşlem',
      cell: ({ row }: any) => {
        const action = row.original.action;
        let color = 'bg-blue-50 text-blue-700 border-blue-200';
        
        if (action === 'delete' || action === 'remove') {
          color = 'bg-red-50 text-red-700 border-red-200';
        } else if (action === 'create' || action === 'add') {
          color = 'bg-green-50 text-green-700 border-green-200';
        } else if (action === 'update' || action === 'edit') {
          color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }
        
        return (
          <Badge variant="outline" className={color}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'entity_type',
      header: 'Varlık Tipi',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          {row.original.entity_type}
        </div>
      ),
    },
    {
      accessorKey: 'entity_id',
      header: 'Varlık ID',
      cell: ({ row }: any) => (
        <span className="font-mono text-xs">{row.original.entity_id}</span>
      ),
    },
    {
      accessorKey: 'tenant_name',
      header: 'Tenant',
      cell: ({ row }: any) => row.original.tenant_name || '-',
    },
    {
      accessorKey: 'user_email',
      header: 'Kullanıcı',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {row.original.user_email || 'Bilinmeyen kullanıcı'}
        </div>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Adresi',
      cell: ({ row }: any) => row.original.ip_address || '-',
    },
  ];

  // Erişim reddedildi günlükleri için sütunlar
  const accessDeniedColumns = [
    {
      accessorKey: 'timestamp',
      header: 'Tarih',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
        </div>
      ),
    },
    {
      accessorKey: 'command',
      header: 'Komut',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          {row.original.command}
        </Badge>
      ),
    },
    {
      accessorKey: 'table_name',
      header: 'Tablo',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          {row.original.schema_name}.{row.original.table_name}
        </div>
      ),
    },
    {
      accessorKey: 'tenant_name',
      header: 'Tenant',
      cell: ({ row }: any) => row.original.tenant_name || '-',
    },
    {
      accessorKey: 'user_email',
      header: 'Kullanıcı',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {row.original.user_email || 'Bilinmeyen kullanıcı'}
        </div>
      ),
    },
    {
      accessorKey: 'error_message',
      header: 'Hata Mesajı',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="truncate max-w-[250px]" title={row.original.error_message}>
            {row.original.error_message}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Adresi',
      cell: ({ row }: any) => row.original.ip_address || '-',
    },
  ];

  useEffect(() => {
    async function fetchLogs() {
      if (activeTab === 'activity') {
        setIsLoadingActivity(true);
        try {
          const supabase = createClientComponentClient();
          
          // Denetim günlüklerini getir
          const { data, error } = await supabase
            .from('audit.audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (error) throw error;
          
          // Tenant ve kullanıcı bilgilerini zenginleştir
          const enrichedData = await Promise.all((data || []).map(async (log) => {
            let tenantName = null;
            let userEmail = null;
            
            // Tenant bilgisi varsa getir
            if (log.tenant_id) {
              const { data: tenantData } = await supabase
                .from('tenants')
                .select('name')
                .eq('id', log.tenant_id)
                .single();
              
              tenantName = tenantData?.name;
            }
            
            // Kullanıcı bilgisi varsa getir
            if (log.user_id) {
              const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', log.user_id)
                .single();
              
              userEmail = userData?.email;
            }
            
            return {
              ...log,
              tenant_name: tenantName,
              user_email: userEmail
            };
          }));
          
          setActivityLogs(enrichedData);
        } catch (error) {
          console.error('Denetim günlükleri yüklenirken hata:', error);
        } finally {
          setIsLoadingActivity(false);
        }
      } else if (activeTab === 'access-denied') {
        setIsLoadingAccessDenied(true);
        try {
          const supabase = createClientComponentClient();
          
          // Erişim reddedildi günlüklerini getir
          const { data, error } = await supabase
            .from('audit.access_denied_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);
          
          if (error) throw error;
          
          // Tenant ve kullanıcı bilgilerini zenginleştir
          const enrichedData = await Promise.all((data || []).map(async (log) => {
            let tenantName = null;
            let userEmail = null;
            
            // Tenant bilgisi varsa getir
            if (log.tenant_id) {
              const { data: tenantData } = await supabase
                .from('tenants')
                .select('name')
                .eq('id', log.tenant_id)
                .single();
              
              tenantName = tenantData?.name;
            }
            
            // Kullanıcı bilgisi varsa getir
            if (log.user_id) {
              const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', log.user_id)
                .single();
              
              userEmail = userData?.email;
            }
            
            return {
              ...log,
              tenant_name: tenantName,
              user_email: userEmail
            };
          }));
          
          setAccessDeniedLogs(enrichedData);
        } catch (error) {
          console.error('Erişim reddedildi günlükleri yüklenirken hata:', error);
        } finally {
          setIsLoadingAccessDenied(false);
        }
      }
    }

    fetchLogs();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Denetim Günlükleri</h1>
        <p className="text-muted-foreground">
          Sistemdeki tüm aktiviteler ve güvenlik olayları
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistem Günlükleri</CardTitle>
          <CardDescription>
            Sistem üzerinde gerçekleşen işlemler ve güvenlik olayları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="activity" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="activity" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                <span>Aktivite Günlükleri</span>
              </TabsTrigger>
              <TabsTrigger value="access-denied" className="flex items-center gap-1">
                <ShieldAlert className="h-4 w-4" />
                <span>Erişim Reddedildi</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="space-y-4">
              <DataTable
                columns={activityColumns}
                data={activityLogs}
                searchColumn="entity_type"
                searchPlaceholder="Varlık tipine göre ara..."
                isLoading={isLoadingActivity}
                emptyMessage="Hiç denetim günlüğü bulunamadı"
                pageSize={10}
              />
            </TabsContent>
            
            <TabsContent value="access-denied" className="space-y-4">
              <DataTable
                columns={accessDeniedColumns}
                data={accessDeniedLogs}
                searchColumn="table_name"
                searchPlaceholder="Tablo adına göre ara..."
                isLoading={isLoadingAccessDenied}
                emptyMessage="Hiç erişim reddedildi günlüğü bulunamadı"
                pageSize={10}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 