'use client';

import React, { Suspense } from 'react';
import { StudentGuard } from '@/components/auth/role-guard';
import { AccessDenied } from '@/components/auth/access-denied';
import { useAuth } from '@/lib/auth/auth-context';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AcademicProgress } from '@/components/student/academic-progress';
import { ProgressiveDemoTour } from '@/components/demo/progressive-demo-tour';

function StudentProgressContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  
  const tourMode = searchParams.get('tour') === 'start';
  const tourRole = searchParams.get('role') || 'student';

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Giriş yapılmadı</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {tourMode && <ProgressiveDemoTour role={tourRole} />}

      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/ogrenci">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Öğrenci Paneli'ne Dön
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Akademik İlerleme Analizi</h1>
        <p className="mt-2 text-gray-600">
          {user?.profile?.fullName || 'Öğrenci'} - Detaylı performans takibi ve hedef yönetimi
        </p>
      </div>

      {/* Academic Progress Component */}
      <AcademicProgress />
    </div>
  );
}

export default function StudentProgressPage() {
  return (
    <StudentGuard
      fallback={
        <AccessDenied
          title="Öğrenci Girişi Gerekli"
          message="Bu sayfayı görüntülemek için öğrenci hesabı ile giriş yapmalısınız."
        />
      }
      redirectTo="/auth/giris"
    >
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Yükleniyor...</div>}>
        <StudentProgressContent />
      </Suspense>
    </StudentGuard>
  );
}