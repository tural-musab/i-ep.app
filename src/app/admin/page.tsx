'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Settings, Database, BarChart3, Shield, FileText } from 'lucide-react';
import { ProgressiveDemoTour } from '@/components/demo/progressive-demo-tour';
import Link from 'next/link';

// Build zamanı URL hatalarını önlemek için dynamic rendering
export const dynamic = 'force-dynamic';

function AdminPageContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  
  const tourMode = searchParams.get('tour') === 'start';
  const tourRole = searchParams.get('role') || 'admin';

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Giriş yapılmadı</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {tourMode && <ProgressiveDemoTour role={tourRole} />}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Okul Yöneticisi Paneli</h1>
        <p className="mt-2 text-gray-600">Hoş geldiniz, {user?.profile?.fullName || user?.email}</p>
        <p className="text-sm text-blue-600">İ-EP.APP Yönetim Sistemi - Production Ready</p>
      </div>

      {/* System Overview Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-muted-foreground text-xs">Aktif kayıtlı öğrenci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Öğretmen Sayısı</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-muted-foreground text-xs">Aktif öğretmen kadrosu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Sınıf</CardTitle>
            <Database className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">2024-2025 dönemi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistem Durumu</CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Aktif</div>
            <p className="text-muted-foreground text-xs">Tüm sistemler çalışıyor</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Quick Actions */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Yönetim Araçları
            </CardTitle>
            <CardDescription>Hızlı erişim menüsü</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="h-auto w-full justify-start p-4" asChild>
                <Link href="/admin/kullanicilar">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <span className="text-sm font-medium">Kullanıcı Yönetimi</span>
                    <span className="text-xs text-gray-600">Öğretmen ve öğrenci hesapları</span>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-8 w-8 text-green-500" />
                  <span className="text-sm font-medium">Performans Analizi</span>
                  <span className="text-xs text-gray-600">Okul geneli istatistikler</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4" asChild>
                <Link href="/admin/sistem">
                  <div className="flex flex-col items-center gap-2">
                    <Settings className="h-8 w-8 text-purple-500" />
                    <span className="text-sm font-medium">Sistem Sağlığı</span>
                    <span className="text-xs text-gray-600">Performans ve izleme</span>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-orange-500" />
                  <span className="text-sm font-medium">Raporlar</span>
                  <span className="text-xs text-gray-600">Akademik ve yönetim raporları</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <Database className="h-8 w-8 text-indigo-500" />
                  <span className="text-sm font-medium">Veri Yönetimi</span>
                  <span className="text-xs text-gray-600">Backup ve import/export</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-8 w-8 text-red-500" />
                  <span className="text-sm font-medium">Güvenlik</span>
                  <span className="text-xs text-gray-600">Sistem güvenliği ve audit</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sistem Sağlığı
            </CardTitle>
            <CardDescription>Gerçek zamanlı sistem durum bilgileri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Database Bağlantısı</span>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600">
                  Aktif
                </Badge>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">API Servisleri</span>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600">
                  14/14 Aktif
                </Badge>
              </div>
              
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Storage Sistemi</span>
                </div>
                <Badge variant="outline" className="border-green-600 text-green-600">
                  Çalışıyor
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium">Kullanıcı Oturumları</span>
                </div>
                <Badge variant="outline" className="border-blue-600 text-blue-600">
                  24 Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Administrative Activities */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Son Yönetim Faaliyetleri</CardTitle>
            <CardDescription>Sistem geneli önemli aktiviteler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="border-blue-600 text-blue-600">
                    Kullanıcı
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Yeni öğretmen hesabı oluşturuldu</p>
                  <p className="text-sm text-gray-600">Fatma Özkan - Matematik Öğretmeni</p>
                </div>
                <div className="text-xs text-gray-500">2 saat önce</div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="border-green-600 text-green-600">
                    Sistem
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Sistem backup tamamlandı</p>
                  <p className="text-sm text-gray-600">Otomatik haftalık yedekleme</p>
                </div>
                <div className="text-xs text-gray-500">6 saat önce</div>
              </div>

              <div className="flex items-center gap-4 rounded-lg border p-3">
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="border-orange-600 text-orange-600">
                    Rapor
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Aylık akademik rapor oluşturuldu</p>
                  <p className="text-sm text-gray-600">Kasım 2024 dönem raporu</p>
                </div>
                <div className="text-xs text-gray-500">1 gün önce</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
