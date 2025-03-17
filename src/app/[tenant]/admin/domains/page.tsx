'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TenantDomain } from '@/lib/domain/types';

// Bu sayfada kullanılacak form state tipi
interface DomainFormState {
  domain: string;
  loading: boolean;
  error: string | null;
}

export default function DomainsAdminPage() {
  // Domain listesi
  const [domains, setDomains] = useState<TenantDomain[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form durumu
  const [formState, setFormState] = useState<DomainFormState>({
    domain: '',
    loading: false,
    error: null
  });
  
  // Modal durumu
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  
  const router = useRouter();
  
  // Domainleri getir
  const fetchDomains = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tenant/domains/list');
      
      if (!response.ok) {
        throw new Error('Domain listesi alınamadı');
      }
      
      const data = await response.json();
      if (data.success) {
        setDomains(data.domains);
      } else {
        setError(data.message || 'Domain listesi alınamadı');
      }
    } catch (err) {
      console.error('Domain listesi hatası:', err);
      setError('Domain listesi alınamadı. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sayfa yüklendiğinde domainleri getir
  useEffect(() => {
    fetchDomains();
  }, []);
  
  // Form değişikliklerini takip et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      domain: e.target.value,
      error: null
    });
  };
  
  // Yeni domain ekle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formState.domain) {
      setFormState({
        ...formState,
        error: 'Domain adı gereklidir'
      });
      return;
    }
    
    // Domain formatını doğrula
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(formState.domain)) {
      setFormState({
        ...formState,
        error: 'Geçersiz domain formatı. Örnek: okul.com'
      });
      return;
    }
    
    setFormState({
      ...formState,
      loading: true,
      error: null
    });
    
    try {
      const response = await fetch('/api/tenant/domains/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: formState.domain
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Başarılı olursa domain listesini güncelle
        await fetchDomains();
        
        // Formu temizle
        setFormState({
          domain: '',
          loading: false,
          error: null
        });
        
        // Doğrulama detaylarını göster
        if (data.verificationDetails) {
          setVerificationDetails(data.verificationDetails);
          setShowVerificationModal(true);
        }
      } else {
        // Hata mesajını göster
        setFormState({
          ...formState,
          loading: false,
          error: data.message || 'Domain eklenemedi'
        });
      }
    } catch (err) {
      console.error('Domain ekleme hatası:', err);
      setFormState({
        ...formState,
        loading: false,
        error: 'Domain eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      });
    }
  };
  
  // Domain doğrulama durumunu kontrol et
  const checkVerification = async (domainId: string) => {
    try {
      const response = await fetch('/api/tenant/domains/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domainId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Başarılı olursa domain listesini güncelle
        await fetchDomains();
        
        // Kullanıcıya bildirim göster
        alert(data.message);
      }
    } catch (err) {
      console.error('Domain doğrulama kontrolü hatası:', err);
      alert('Domain doğrulama kontrolü sırasında bir hata oluştu');
    }
  };
  
  // Domain sil
  const deleteDomain = async (domainId: string) => {
    if (!confirm('Bu domain kaydını silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tenant/domains/delete?id=${domainId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Başarılı olursa domain listesini güncelle
        await fetchDomains();
        
        // Kullanıcıya bildirim göster
        alert('Domain başarıyla silindi');
      } else {
        alert(data.message || 'Domain silinirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Domain silme hatası:', err);
      alert('Domain silinirken bir hata oluştu');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Domain Yönetimi</h1>
      
      {/* Domain Ekleme Formu */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Özel Domain Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain Adı
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              placeholder="ornek.com"
              value={formState.domain}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={formState.loading}
            />
            {formState.error && (
              <p className="mt-1 text-sm text-red-600">{formState.error}</p>
            )}
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={formState.loading}
            >
              {formState.loading ? 'Ekleniyor...' : 'Domain Ekle'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Domain Listesi */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Domain Listesi</h2>
        
        {isLoading ? (
          <p className="text-center py-4">Yükleniyor...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-4">{error}</p>
        ) : domains.length === 0 ? (
          <p className="text-center py-4">Henüz eklenmiş domain bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Oluşturulma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{domain.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {domain.type === 'subdomain' ? 'Alt Domain' : 'Özel Domain'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${domain.status === 'active' ? 'bg-green-100 text-green-800' : 
                          domain.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {domain.status === 'active' ? 'Aktif' : 
                         domain.status === 'pending' ? 'Beklemede' : 'Hata'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(domain.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {domain.status === 'pending' && (
                        <button
                          onClick={() => checkVerification(domain.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Doğrula
                        </button>
                      )}
                      <button
                        onClick={() => deleteDomain(domain.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Doğrulama Detayları Modal */}
      {showVerificationModal && verificationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Domain Doğrulama Talimatları</h2>
            <p className="mb-4">
              Domain doğrulaması için lütfen aşağıdaki DNS ayarlarını domain sağlayıcınızda yapın:
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">SSL Doğrulama</h3>
              <p>Yöntem: {verificationDetails.ssl?.method}</p>
              <p>Tür: {verificationDetails.ssl?.type}</p>
              
              {verificationDetails.verification_errors?.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-red-600">Doğrulama Hataları:</h4>
                  <ul className="list-disc pl-5">
                    {verificationDetails.verification_errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <p className="mb-4">
              DNS ayarlarınızı yaptıktan sonra, doğrulama tamamlanana kadar birkaç dakika bekleyin.
              Daha sonra "Doğrula" butonunu kullanarak durumu kontrol edebilirsiniz.
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 