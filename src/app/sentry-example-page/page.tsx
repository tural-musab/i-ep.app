"use client";

import { useState } from 'react';
import { reportUIError } from '@/utils/error-reporting';

export default function SentryExamplePage() {
  const [loading, setLoading] = useState(false);
  
  // Test hatasını tetikleyen fonksiyon
  const handleTestError = () => {
    try {
      // Bilerek bir hata fırlatıyoruz
      throw new Error('Sentry Test Hatası - Kullanıcı Arayüzünden');
    } catch (error) {
      // Hatayı Sentry'ye raporluyoruz
      reportUIError(error, {
        component: 'SentryExamplePage',
        action: 'Test Hata Butonu'
      });
      
      // Kullanıcıya hatanın raporlandığını bildiriyoruz
      alert('Test hatası başarıyla Sentry\'ye raporlandı!');
    }
  };
  
  // API hatasını tetikleyen fonksiyon
  const handleTestApiError = async () => {
    setLoading(true);
    try {
      // API endpoint'ini çağırıyoruz - bu endpoint bir hata fırlatacak
      const response = await fetch('/api/sentry-example-api');
      const data = await response.json();
      console.log(data);
    } catch (error) {
      // Hatanın zaten API route içinde raporlandığını varsayıyoruz
      alert('API hatası tetiklendi. Sentry panelinde bu hatayı görebilirsiniz.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sentry Entegrasyon Test Sayfası</h1>
      <p className="mb-4">
        Bu sayfa, Sentry hata izleme sisteminin düzgün çalışıp çalışmadığını test etmek için kullanılır.
        Aşağıdaki butonlara tıklayarak farklı türde hatalar tetikleyebilirsiniz.
      </p>
      
      <div className="flex flex-col gap-4 md:flex-row">
        <button
          onClick={handleTestError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          UI Hatası Tetikle
        </button>
        
        <button
          onClick={handleTestApiError}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Yükleniyor...' : 'API Hatası Tetikle'}
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="text-lg font-semibold mb-2">Nasıl Çalışır?</h2>
        <p>
          1. "UI Hatası Tetikle" butonuna tıkladığınızda, client tarafında bir JavaScript hatası oluşur ve Sentry'ye raporlanır.
        </p>
        <p>
          2. "API Hatası Tetikle" butonuna tıkladığınızda, bir API endpoint'i çağrılır ve bu endpoint sunucu tarafında bir hata fırlatır.
        </p>
        <p className="mt-4">
          Her iki durumda da hatalar Sentry dashboard'ınızda görünecektir. Bu test, hem client hem de server tarafı hata raporlamanın 
          düzgün çalıştığını doğrulamanıza yardımcı olur.
        </p>
      </div>
    </div>
  );
}
