'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * Çıkış Sayfası
 * 
 * Kullanıcının oturumunu sonlandıran ve ana sayfaya yönlendiren sayfa.
 */
export default function CikisPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Otomatik çıkış işlemi
    const performSignOut = async () => {
      try {
        await signOut({ redirect: false });
        setTimeout(() => {
          router.push('/');
        }, 2000); // 2 saniye sonra ana sayfaya yönlendir
      } catch (error) {
        console.error('Çıkış hatası:', error);
      }
    };
    
    performSignOut();
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Image
            src="/logo.webp"
            alt="Iqra Eğitim Portalı"
            width={100}
            height={100}
            className="mx-auto h-24 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Çıkış Yapılıyor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Oturumunuz güvenli bir şekilde sonlandırılıyor...
          </p>
        </div>
        
        <div className="flex justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        
        <p className="text-gray-500 mt-4">
          Ana sayfaya yönlendiriliyorsunuz...
        </p>
        
        <button
          onClick={() => router.push('/')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );
} 