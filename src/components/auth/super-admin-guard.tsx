'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface SuperAdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * Süper Admin rolüne sahip kullanıcılar için koruyucu bileşen
 *
 * @example
 * <SuperAdminGuard
 *   fallback={<AccessDenied />}
 *   redirectTo="/auth/giris"
 * >
 *   <SuperAdminDashboard />
 * </SuperAdminGuard>
 */
export function SuperAdminGuard({ children, fallback, redirectTo }: SuperAdminGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Yükleme durumunda bekletme ekranı
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Oturum kontrolü
  if (!user) {
    if (redirectTo) {
      // Oturum yoksa yönlendir
      router.push(redirectTo);
      return null;
    }

    // Fallback varsa göster, yoksa null döndür
    return fallback ? <>{fallback}</> : null;
  }

  // Süper Admin rolü kontrolü
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

  // Erişim kontrolü
  if (!isSuperAdmin) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    return fallback ? <>{fallback}</> : null;
  }

  // Erişim izni var, çocuk bileşenleri göster
  return <>{children}</>;
}
