'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getTenantId } from '@/lib/tenant/tenant-utils';

/**
 * Şifremi Unuttum Sayfası
 * 
 * Kullanıcıların şifrelerini sıfırlamak için kullandığı sayfa.
 * Referans: docs/supabase-setup.md - "Supabase Kimlik Doğrulama Ayarları"
 */
export default function SifremiUnuttumPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Şifre sıfırlama isteği gönder
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!email) {
      setError('E-posta adresinizi giriniz');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Tenant'ı kontrol et
      const tenantId = await getTenantId();
      if (!tenantId) {
        setError('Geçersiz tenant');
        setIsLoading(false);
        return;
      }
      
      // Şifre sıfırlama e-postası gönder
      // Supabase'in beklediği şekilde redirectTo URL'sini ayarlıyoruz
      // URL'de hash ve tenant sorgusu ekliyoruz (# işareti ile)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/sifre-yenile?tenant=${tenantId}`,
      });
      
      if (resetError) {
        console.error('Şifre sıfırlama hatası:', resetError);
        setError('Şifre sıfırlama e-postası gönderilirken bir hata oluştu: ' + resetError.message);
        setIsLoading(false);
        return;
      }
      
      // Başarılı
      setIsSuccess(true);
      
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err);
      setError(err.message || 'Şifre sıfırlama sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/logo.webp"
            alt="Iqra Eğitim Portalı"
            width={160}
            height={160}
            priority={true}
            className="mx-auto h-32 w-auto"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Şifrenizi Sıfırlayın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Şifrenizi sıfırlamak için e-posta adresinizi girin
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {isSuccess ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
                </p>
                <p className="mt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/giris')}
                    className="text-sm font-medium text-green-600 hover:text-green-500"
                  >
                    Giriş sayfasına dön
                  </button>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordReset}>
            <div>
              <label htmlFor="email-address" className="sr-only">E-posta adresi</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-posta adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Şifre Sıfırlama Bağlantısı Gönder
              </button>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link href="/auth/giris" className="font-medium text-blue-600 hover:text-blue-500">
                  Giriş sayfasına dön
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 