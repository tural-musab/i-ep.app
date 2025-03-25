'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Shield, AlertTriangle } from "lucide-react";

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
  title = "Erişim Reddedildi",
  message = "Bu sayfaya erişim yetkiniz bulunmamaktadır.",
  showLoginButton = true,
  showBackButton = true
}: AccessDeniedProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {!user && showLoginButton && (
          <Button asChild className="w-full mb-3">
            <Link href="/auth/giris">Giriş Yap</Link>
          </Button>
        )}
        
        {showBackButton && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.history.back()}
          >
            Geri Dön
          </Button>
        )}
        
        {user && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-3 rounded">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>
                <span className="font-medium">Not:</span> Bu sayfaya erişim için gerekli yetkiye sahip değilsiniz.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 