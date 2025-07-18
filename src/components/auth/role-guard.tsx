'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/types/auth';
import { ResourceType, ActionType } from '@/lib/auth/permissions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: {
    resource: ResourceType;
    action: ActionType;
  };
  fallback?: ReactNode;
  redirectTo?: string;
  tenantRequired?: boolean;
}

/**
 * Rol ve izin tabanlı erişim kontrolü için koruyucu bileşen
 *
 * @example
 * // Sadece Admin ve Manager rollerinin erişebileceği sayfa
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]} redirectTo="/auth/giris">
 *   <AdminPanel />
 * </RoleGuard>
 *
 * @example
 * // Tenant oluşturma iznine sahip kullanıcıların erişebileceği sayfa
 * <RoleGuard
 *   requiredPermission={{ resource: ResourceType.TENANT, action: ActionType.CREATE }}
 *   fallback={<AccessDenied />}
 * >
 *   <CreateTenantForm />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallback,
  redirectTo,
  tenantRequired = false,
}: RoleGuardProps) {
  const { user, isLoading, currentTenantId, hasPermission } = useAuth();
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

  // Tenant kontrolü
  if (tenantRequired && !currentTenantId) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    return fallback ? <>{fallback}</> : null;
  }

  // Rol kontrolü
  const hasAllowedRole = !allowedRoles || allowedRoles.includes(user.role);

  // İzin kontrolü
  const hasRequiredPermission =
    !requiredPermission || hasPermission(requiredPermission.resource, requiredPermission.action);

  // Erişim kontrolü
  if (!hasAllowedRole || !hasRequiredPermission) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }

    return fallback ? <>{fallback}</> : null;
  }

  // Erişim izni var, çocuk bileşenleri göster
  return <>{children}</>;
}

/**
 * Admin rolüne sahip kullanıcılar için koruyucu bileşen
 */
export function AdminGuard({
  children,
  fallback,
  redirectTo,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]} fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

/**
 * Öğretmen rolüne sahip kullanıcılar için koruyucu bileşen
 */
export function TeacherGuard({
  children,
  fallback,
  redirectTo,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.TEACHER]}
      fallback={fallback}
      redirectTo={redirectTo}
      tenantRequired={true}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Öğrenci rolüne sahip kullanıcılar için koruyucu bileşen
 */
export function StudentGuard({
  children,
  fallback,
  redirectTo,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.STUDENT]}
      fallback={fallback}
      redirectTo={redirectTo}
      tenantRequired={true}
    >
      {children}
    </RoleGuard>
  );
}

/**
 * Veli rolüne sahip kullanıcılar için koruyucu bileşen
 */
export function ParentGuard({
  children,
  fallback,
  redirectTo,
}: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.PARENT]}
      fallback={fallback}
      redirectTo={redirectTo}
      tenantRequired={true}
    >
      {children}
    </RoleGuard>
  );
}
