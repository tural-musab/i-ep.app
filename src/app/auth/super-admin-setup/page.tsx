'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';

export default function SuperAdminSetupPage() {
  const [email, setEmail] = useState('admin@i-ep.app');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClientComponentClient();
  
  const setSuperAdminRole = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Süper admin rolünü RPC ile ata
      const { data, error } = await supabase.rpc('set_super_admin_role', {
        p_email: email
      });
      
      if (error) {
        setError(error.message);
      } else {
        setMessage(`Başarıyla ${email} adresine süper admin rolü atandı!`);
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  const checkUserRole = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      // Kullanıcının rol bilgilerini kontrol et
      const { data, error } = await supabase.auth.admin.getUserById(email);
      
      if (error) {
        setError(error.message);
      } else if (data?.user) {
        setMessage(`Kullanıcı bilgileri: ${JSON.stringify(data.user, null, 2)}`);
      } else {
        setMessage('Kullanıcı bulunamadı');
      }
    } catch (err) {
      setError('İşlem sırasında bir hata oluştu: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Süper Admin Kurulum</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Süper Admin Rolü Ata</h2>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="ornek@i-ep.app"
          />
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={setSuperAdminRole}
            disabled={loading}
            className="bg-primary text-white"
          >
            {loading ? 'İşleniyor...' : 'Süper Admin Rolü Ata'}
          </Button>
          
          <Button
            onClick={checkUserRole}
            disabled={loading}
            variant="outline"
          >
            Kullanıcı Bilgilerini Kontrol Et
          </Button>
        </div>
        
        {message && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
            {message}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sorun Giderme</h2>
        
        <div className="prose">
          <p>
            Eğer süper admin rolünü ayarladıktan sonra giriş yapamıyorsanız, aşağıdaki adımları deneyin:
          </p>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Kullanıcının oturumunu kapatın ve tekrar giriş yapın.</li>
            <li>Tarayıcı önbelleğini temizleyin.</li>
            <li>Kullanıcının veritabanında <code>raw_app_meta_data</code> değerinin doğru olduğundan emin olun.</li>
            <li>Middleware.ts dosyasında rol kontrolünün doğru yapıldığından emin olun.</li>
          </ol>
          
          <p className="mt-4">
            <strong>Not:</strong> Bu sayfa yalnızca geliştirme ve kurulum aşamasında kullanılmalıdır.
            Güvenlik nedeniyle üretim ortamında kapatılmalıdır.
          </p>
        </div>
      </div>
    </div>
  );
} 