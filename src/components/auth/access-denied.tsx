'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  homeHref?: string;
}

export function AccessDenied({
  title = 'Erişim Reddedildi',
  message = 'Bu sayfayı görüntülemek için gerekli izinlere sahip değilsiniz.',
  showHomeButton = true,
  showBackButton = true,
  homeHref = '/'
}: AccessDeniedProps) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {title}
      </h1>
      
      <p className="text-gray-600 max-w-md mb-8">
        {message}
      </p>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {showBackButton && (
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            asChild
            className="flex items-center gap-2"
          >
            <Link href={homeHref}>
              <Home className="w-4 h-4" />
              Ana Sayfa
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
} 