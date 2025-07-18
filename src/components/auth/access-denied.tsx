'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { Shield, AlertTriangle } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
  showBackButton?: boolean;
}

/**
 * Erişim reddedildiğinde gösterilecek bileşen
 */
export function AccessDenied({
  title = 'Erişim Reddedildi',
  message = 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
  showLoginButton = true,
  showBackButton = true,
}: AccessDeniedProps) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 p-3">
          <Shield className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mb-6 text-gray-600">{message}</p>

        {!user && showLoginButton && (
          <Button asChild className="mb-3 w-full">
            <Link href="/auth/giris">Giriş Yap</Link>
          </Button>
        )}

        {showBackButton && (
          <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
            Geri Dön
          </Button>
        )}

        {user && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center rounded bg-amber-50 p-3 text-sm text-amber-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <p>
                <span className="font-medium">Not:</span> Bu sayfaya erişim için gerekli yetkiye
                sahip değilsiniz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
