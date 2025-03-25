'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MetricCard, MetricCardSkeleton } from '@/components/ui/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, History, ShieldAlert, Server, Layers } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalRegistrations: 0,
    securityEvents: 0,
    storageUsage: 0,
    databaseSize: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClientComponentClient();
        
        // Tenant sayıları
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('id, is_active');
          
        if (tenantsError) throw tenantsError;
        
        const totalTenants = tenants.length;
        const activeTenants = tenants.filter(t => t.is_active).length;
        
        // Kullanıcı sayıları
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, is_active');
          
        if (usersError) throw usersError;
        
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.is_active).length;
        
        // Son 30 gün kayıt sayısı
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: recentRegistrations, error: regError } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .gte('created_at', thirtyDaysAgo.toISOString());
          
        if (regError) throw regError;
        
        // Denetim olayları
        const { data: auditLogs, error: auditError } = await supabase
          .from('audit.access_denied_logs')
          .select('id')
          .gte('timestamp', thirtyDaysAgo.toISOString());
          
        if (auditError) throw auditError;
        
        // İstatistikleri ayarla
        setStats({
          totalTenants,
          activeTenants,
          totalUsers,
          activeUsers,
          totalRegistrations: recentRegistrations || 0,
          securityEvents: auditLogs?.length || 0,
          storageUsage: Math.floor(Math.random() * 1000), // Örnek veri
          databaseSize: Math.floor(Math.random() * 500) // Örnek veri
        });
      } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Süper Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Sistem geneli metrikler ve istatistikler
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <MetricCardSkeleton count={4} />
        ) : (
          <>
            <MetricCard
              title="Toplam Tenant"
              value={stats.totalTenants}
              icon={<Building2 className="h-4 w-4" />}
              description={`${stats.activeTenants} aktif tenant`}
            />
            
            <MetricCard
              title="Toplam Kullanıcı"
              value={stats.totalUsers}
              icon={<Users className="h-4 w-4" />}
              description={`${stats.activeUsers} aktif kullanıcı`}
            />
            
            <MetricCard
              title="Son 30 Gün Kayıt"
              value={stats.totalRegistrations}
              icon={<History className="h-4 w-4" />}
              trend={12}
            />
            
            <MetricCard
              title="Güvenlik Olayları"
              value={stats.securityEvents}
              icon={<ShieldAlert className="h-4 w-4" />}
              trend={5}
              trendLabel="Son 30 gün"
            />
          </>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Depolama Kullanımı</CardTitle>
            <CardDescription>
              Toplam depolama alanı kullanımı ve dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {isLoading ? (
              <div className="h-[200px] rounded-md bg-muted animate-pulse" />
            ) : (
              <div className="flex items-center gap-4">
                <Server className="h-14 w-14 text-primary" />
                <div>
                  <div className="text-3xl font-bold">{stats.storageUsage} MB</div>
                  <div className="text-sm text-muted-foreground">
                    10 TB limiti içinde
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Veritabanı Durumu</CardTitle>
            <CardDescription>
              Veritabanı boyutu ve performans metrikleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {isLoading ? (
              <div className="h-[200px] rounded-md bg-muted animate-pulse" />
            ) : (
              <div className="flex items-center gap-4">
                <Layers className="h-14 w-14 text-primary" />
                <div>
                  <div className="text-3xl font-bold">{stats.databaseSize} MB</div>
                  <div className="text-sm text-muted-foreground">
                    Tüm tenantlar ve tablolar dahil
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 