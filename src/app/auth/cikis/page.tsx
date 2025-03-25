'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Loader2 } from 'lucide-react';

/**
 * Çıkış sayfası
 * 
 * Kullanıcıları sistemden çıkış yaptırır ve ana sayfaya yönlendirir
 */
export default function CikisPage() {
  const { signOut, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      if (!isLoading && (isAuthenticated || localStorage.getItem('tenant-id'))) {
        try {
          await signOut();
          console.log('Başarıyla çıkış yapıldı');
        } catch (error) {
          console.error('Çıkış yaparken hata oluştu:', error);
        }
      }
      
      // Oturum durumundan bağımsız olarak ana sayfaya yönlendir
      setTimeout(() => {
        router.push('/');
      }, 1500);
    };
    
    performLogout();
  }, [signOut, router, isAuthenticated, isLoading]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
      <h1 className="text-2xl font-bold mb-2">Çıkış Yapılıyor</h1>
      <p className="text-gray-600">Oturumunuz sonlandırılıyor, lütfen bekleyin...</p>
    </div>
  );
} 