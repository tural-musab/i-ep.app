'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getTenantId } from '@/lib/tenant/tenant-utils';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  GraduationCap,
  FileText,
  Bell,
  Activity,
} from 'lucide-react';

/**
 * Dashboard Sayfası
 * 
 * Giriş yapan kullanıcıların ana panel sayfası
 */
export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [user, setUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          router.push('/auth/giris');
          return;
        }
        
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          setError('Kullanıcı bilgileri alınamadı');
          setIsLoading(false);
          return;
        }
        
        setUser(userData.user);
        
        // Demo mode için varsayılan kullanıcı detayları
        const demoUserDetails = {
          id: userData.user.id,
          email: userData.user.email,
          name: 'Demo Kullanıcı',
          role: 'admin',
          auth_id: userData.user.id,
          is_active: true,
        };
        
        setUserDetails(demoUserDetails);
        
      } catch (err: any) {
        console.error('Dashboard yükleme hatası:', err);
        setError('Sayfa yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router, supabase]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/giris');
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="space-y-4">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-700">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push('/auth/giris')}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Giriş Sayfasına Dön
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Demo veriler
  const stats = {
    admin: [
      { title: 'Toplam Öğrenci', value: '1,234', icon: GraduationCap, trend: { value: 12, isPositive: true } },
      { title: 'Toplam Öğretmen', value: '56', icon: Users, trend: { value: 5, isPositive: true } },
      { title: 'Aktif Dersler', value: '89', icon: BookOpen, trend: { value: 8, isPositive: true } },
      { title: 'Bu Ayki Etkinlik', value: '24', icon: Calendar, trend: { value: 3, isPositive: false } },
    ],
    teacher: [
      { title: 'Öğrencilerim', value: '145', icon: GraduationCap },
      { title: 'Derslerim', value: '12', icon: BookOpen },
      { title: 'Bekleyen Ödevler', value: '8', icon: FileText },
      { title: 'Bu Haftaki Dersler', value: '18', icon: Calendar },
    ],
    student: [
      { title: 'Derslerim', value: '8', icon: BookOpen },
      { title: 'Ödevlerim', value: '5', icon: FileText },
      { title: 'Ortalamam', value: '85.4', icon: TrendingUp },
      { title: 'Devamsızlık', value: '2 gün', icon: Calendar },
    ],
  };
  
  const userRole = userDetails?.role || 'student';
  const currentStats = stats[userRole as keyof typeof stats] || stats.student;
  
  return (
    <DashboardLayout
      user={{
        name: userDetails?.name,
        email: user?.email || '',
        role: userDetails?.role || 'student',
      }}
    >
      <div className="space-y-6">
        {/* Karşılama Mesajı */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Hoş geldiniz, {userDetails?.name || 'Kullanıcı'}!
          </h2>
          <p className="text-muted-foreground">
            İşte bugünkü özet bilgileriniz
          </p>
        </div>
        
        {/* İstatistik Kartları */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {currentStats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={'trend' in stat ? stat.trend : undefined}
            />
          ))}
        </div>
        
        {/* Ana İçerik Alanı */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Aktivite Grafiği */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Haftalık Aktivite</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Grafik alanı (Chart.js veya Recharts eklenecek)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Son Aktiviteler */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Son Aktiviteler</CardTitle>
              <CardDescription>
                Sistemdeki son hareketler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Örnek aktivite {i}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {i} saat önce
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      <Bell className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Hızlı Erişim Kartları */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Etkinlikler</CardTitle>
              <CardDescription>Bu haftaki programınız</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Matematik Sınavı</span>
                  <span className="text-sm text-muted-foreground">Yarın</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Veli Toplantısı</span>
                  <span className="text-sm text-muted-foreground">Cuma</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Duyurular</CardTitle>
              <CardDescription>Son duyurular</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">Yeni dönem kayıtları başladı</p>
                  <p className="text-xs text-muted-foreground">2 gün önce</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hızlı İşlemler</CardTitle>
              <CardDescription>Sık kullanılan işlemler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-sm border rounded hover:bg-gray-50">
                  Yeni Ödev
                </button>
                <button className="p-2 text-sm border rounded hover:bg-gray-50">
                  Not Girişi
                </button>
                <button className="p-2 text-sm border rounded hover:bg-gray-50">
                  Mesaj Gönder
                </button>
                <button className="p-2 text-sm border rounded hover:bg-gray-50">
                  Rapor Al
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 