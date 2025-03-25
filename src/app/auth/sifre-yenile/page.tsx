'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Şifre Yenileme Sayfası
 * 
 * Kullanıcıların şifrelerini yenilemek için kullandığı sayfa.
 * Referans: docs/supabase-setup.md - "Supabase Kimlik Doğrulama Ayarları"
 */
export default function SifreYenilePage() {
  return (
    <Suspense fallback={<SifreYenileLoading />}>
      <SifreYenileForm />
    </Suspense>
  );
}

// Şifre yenileme sayfasının içeriğini içeren bileşen
function SifreYenileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    // URL parametrelerinden error ve tenant ID'sini al
    const tenant = searchParams.get('tenant');
    const errorParam = searchParams.get('error');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    const code = searchParams.get('code');
    
    // URL'de hata varsa göster
    if (errorParam) {
      console.error('URL hata parametreleri:', { errorParam, errorCode, errorDescription });
      setError(errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) : 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı');
      return;
    }

    if (tenant) {
      setTenantId(tenant);
    }

    // URL hash kısmını kontrol et - Supabase token'ı burada bekliyor olabilir
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashErrorParam = hashParams.get('error');
    const hashErrorCode = hashParams.get('error_code');
    const hashErrorDescription = hashParams.get('error_description');
    
    // Hash'te hata varsa göster
    if (hashErrorParam) {
      console.error('Hash hata parametreleri:', { hashErrorParam, hashErrorCode, hashErrorDescription });
      setError(hashErrorDescription ? decodeURIComponent(hashErrorDescription.replace(/\+/g, ' ')) : 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı');
      return;
    }

    // Doğrudan code parametresi varsa veya yoksa oturum kontrolü yap
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Önce oturum kontrolü yap - Supabase otomatik olarak URL hash'indeki token'ı işler
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Oturum kontrolü hatası:', sessionError);
          setError('Oturum doğrulanamadı: ' + sessionError.message);
          setIsLoading(false);
          return;
        }
        
        if (sessionData.session) {
          console.log('Aktif oturum bulundu');
          setIsSessionValid(true);
          setIsLoading(false);
          return;
        }
        
        // Eğer aktif oturum yoksa ve code parametresi varsa, OTP doğrulama deneyelim
        if (code) {
          console.log('Code parametresi bulundu:', code);
          try {
            // Doğrudan code parametresini kullanarak OTP doğrulama yapıyoruz
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: code,
              type: 'recovery'
            });
            
            if (error) {
              console.error('Şifre sıfırlama doğrulama hatası:', error);
              setError('Doğrulama hatası: ' + error.message);
            } else {
              console.log('Şifre sıfırlama doğrulaması başarılı:', data);
              setIsSessionValid(true);
            }
          } catch (err) {
            console.error('OTP doğrulama hatası:', err);
            setError('Şifre sıfırlama kodu doğrulanırken bir hata oluştu');
          }
        } else {
          // Ne oturum var ne de code parametresi
          console.error('Ne aktif oturum ne de code parametresi bulundu');
          setError('Geçersiz şifre sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama talebi oluşturun.');
        }
      } catch (err) {
        console.error('Şifre sıfırlama işlemi hatası:', err);
        setError('Şifre sıfırlama işlemi sırasında bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [searchParams, supabase]);
  
  // Şifre güçlülük kontrolü
  const isStrongPassword = (pwd: string): boolean => {
    // En az 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter
    const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    return strongRegex.test(pwd);
  };
  
  // Şifre yenileme işlemi
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!password || !passwordConfirm) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (!isStrongPassword(password)) {
      setError('Şifre en az 8 karakter uzunluğunda olmalı ve en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir');
      return;
    }
    
    if (!isSessionValid) {
      setError('Geçerli bir oturum bulunamadı. Lütfen şifre sıfırlama bağlantısını tekrar kullanın veya yeni bir şifre sıfırlama talebi oluşturun.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error('Şifre güncelleme hatası:', updateError);
        setError('Şifre güncellenirken bir hata oluştu: ' + updateError.message);
        setIsLoading(false);
        return;
      }
      
      // Başarılı
      setIsSuccess(true);
      
      // Tenant ID varsa ve kullanıcı metadatasına henüz eklenmemişse ekle
      if (tenantId) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && (!user.user_metadata.tenant_id || user.user_metadata.tenant_id !== tenantId)) {
          await supabase.auth.updateUser({
            data: { 
              tenant_id: tenantId,
              last_password_reset: new Date().toISOString()
            }
          });
        }
      }
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push('/auth/giris');
      }, 3000);
      
    } catch (err: any) {
      console.error('Şifre yenileme hatası:', err);
      setError(err.message || 'Şifre yenileme sırasında bir hata oluştu');
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
            Yeni Şifre Oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız için yeni ve güçlü bir şifre belirleyin
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
                  Şifreniz başarıyla değiştirildi. Giriş sayfasına yönlendiriliyorsunuz...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">Yeni Şifre</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Yeni Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password-confirm" className="sr-only">Şifre Onayı</label>
                <input
                  id="password-confirm"
                  name="password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Şifre Onayı"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-600">
              <p>Şifreniz:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>En az 8 karakter uzunluğunda olmalıdır</li>
                <li>En az bir büyük harf içermelidir</li>
                <li>En az bir küçük harf içermelidir</li>
                <li>En az bir rakam içermelidir</li>
                <li>En az bir özel karakter içermelidir (ör. !@#$%^&*)</li>
              </ul>
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
                Şifreyi Değiştir
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

// Yükleme durumu için fallback bileşeni
function SifreYenileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-pulse">
          <div className="mx-auto h-32 w-32 bg-gray-200 rounded-full"></div>
          <div className="mt-6 h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="mt-2 h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="mt-8 h-10 bg-gray-200 rounded"></div>
        </div>
        <p className="text-sm text-gray-500">Yükleniyor...</p>
      </div>
    </div>
  );
} 