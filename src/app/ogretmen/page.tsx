'use client';

import React, { Suspense } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssignmentDashboard } from '@/components/assignments/assignment-dashboard';
import { AttendanceDashboard } from '@/components/attendance/attendance-dashboard';
import { GradeDashboard } from '@/components/grades/grade-dashboard';
import { BookOpen, Users, FileText, Calendar, BarChart3, Clock } from 'lucide-react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { ProgressiveDemoTour } from '@/components/demo/progressive-demo-tour';

function OgretmenDashboardContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  
  const tourMode = searchParams.get('tour') === 'start';
  const tourRole = searchParams.get('role') || 'teacher';

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
        <h1 className="text-3xl font-bold text-gray-900">Öğretmen Paneli</h1>
        <p className="mt-2 text-gray-600">Hoş geldiniz, {user?.profile?.fullName || user?.email}</p>
      </div>

      {/* Teacher-specific Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sınıflarım</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-muted-foreground text-xs">+1 yeni sınıf bu dönem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-muted-foreground text-xs">Tüm sınıflarınızda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödevler</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-muted-foreground text-xs">Değerlendirme bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-muted-foreground text-xs">Toplam ders saati</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Teachers */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Hızlı İşlemler
            </CardTitle>
            <CardDescription>Günlük eğitim faaliyetleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6 text-blue-500" />
                  <span className="text-sm font-medium">Yeni Ödev</span>
                  <span className="text-xs text-gray-600">Ödev oluştur</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6 text-green-500" />
                  <span className="text-sm font-medium">Yoklama</span>
                  <span className="text-xs text-gray-600">Devam takibi</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                  <span className="text-sm font-medium">Not Gir</span>
                  <span className="text-xs text-gray-600">Değerlendirme</span>
                </div>
              </Button>

              <Button variant="outline" className="h-auto w-full justify-start p-4">
                <div className="flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6 text-orange-500" />
                  <span className="text-sm font-medium">Ders Programı</span>
                  <span className="text-xs text-gray-600">Program görüntüle</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Dashboard for Teachers */}
      <div className="mt-8">
        <AssignmentDashboard />
      </div>

      {/* Attendance Dashboard for Teachers */}
      <div className="mt-8">
        <AttendanceDashboard />
      </div>

      {/* Grade Dashboard for Teachers */}
      <div className="mt-8">
        <GradeDashboard />
      </div>

      {/* My Classes Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sınıflarım
            </CardTitle>
            <CardDescription>Bu dönem sorumlu olduğunuz sınıflar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">5-A Sınıfı</CardTitle>
                  <CardDescription>29 öğrenci • Matematik</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ Bugün: Devam 28/29</span>
                    <span className="text-blue-600">3 yeni ödev</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">6-B Sınıfı</CardTitle>
                  <CardDescription>31 öğrenci • Matematik</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ Bugün: Devam 30/31</span>
                    <span className="text-blue-600">5 yeni ödev</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">7-C Sınıfı</CardTitle>
                  <CardDescription>27 öğrenci • Matematik</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ Bugün: Devam 25/27</span>
                    <span className="text-blue-600">4 yeni ödev</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OgretmenDashboard() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
      <OgretmenDashboardContent />
    </Suspense>
  );
}
