'use client';

import React, { useState, useEffect } from 'react';
import { TenantDomain } from '@/lib/domain/types';

// Bu sayfada kullanılacak form state tipi
interface DomainFormState {
  domain: string;
  loading: boolean;
  error: string | null;
}

// Domain doğrulama detayları tipi
interface VerificationDetails {
  ssl?: {
    method: string;
    type: string;
  };
  verification_errors?: string[];
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
    error: null,
  });

  // Modal durumu
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [verificationDetails, setVerificationDetails] = useState<VerificationDetails | null>(null);

  // const router = useRouter(); // TODO: router kullanılacak

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
      error: null,
    });
  };

  // Yeni domain ekle
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form doğrulama
    if (!formState.domain) {
      setFormState({
        ...formState,
        error: 'Domain adı gereklidir',
      });
      return;
    }

    // Domain formatını doğrula
    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;
    if (!domainRegex.test(formState.domain)) {
      setFormState({
        ...formState,
        error: 'Geçersiz domain formatı. Örnek: okul.com',
      });
      return;
    }

    setFormState({
      ...formState,
      loading: true,
      error: null,
    });

    try {
      const response = await fetch('/api/tenant/domains/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: formState.domain,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Başarılı olursa domain listesini güncelle
        await fetchDomains();

        // Formu temizle
        setFormState({
          domain: '',
          loading: false,
          error: null,
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
          error: data.message || 'Domain eklenemedi',
        });
      }
    } catch (err) {
      console.error('Domain ekleme hatası:', err);
      setFormState({
        ...formState,
        loading: false,
        error: 'Domain eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      });
    }
  };

  // Domain doğrulama durumunu kontrol et
  const checkVerification = async (domainId: string) => {
    try {
      const response = await fetch('/api/tenant/domains/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domainId,
        }),
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
        method: 'DELETE',
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
      <h1 className="mb-6 text-2xl font-bold">Domain Yönetimi</h1>

      {/* Domain Ekleme Formu */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold">Özel Domain Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="domain" className="mb-1 block text-sm font-medium text-gray-700">
              Domain Adı
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              placeholder="ornek.com"
              value={formState.domain}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
              disabled={formState.loading}
            />
            {formState.error && <p className="mt-1 text-sm text-red-600">{formState.error}</p>}
          </div>
          <div>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
              disabled={formState.loading}
            >
              {formState.loading ? 'Ekleniyor...' : 'Domain Ekle'}
            </button>
          </div>
        </form>
      </div>

      {/* Domain Listesi */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold">Domain Listesi</h2>

        {isLoading ? (
          <p className="py-4 text-center">Yükleniyor...</p>
        ) : error ? (
          <p className="py-4 text-center text-red-500">{error}</p>
        ) : domains.length === 0 ? (
          <p className="py-4 text-center">Henüz eklenmiş domain bulunmuyor.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Tür
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Oluşturulma Tarihi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
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
                      <span
                        className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                          domain.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : domain.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {domain.status === 'active'
                          ? 'Aktif'
                          : domain.status === 'pending'
                            ? 'Beklemede'
                            : 'Hata'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(domain.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      {domain.status === 'pending' && (
                        <button
                          onClick={() => checkVerification(domain.id)}
                          className="mr-3 text-indigo-600 hover:text-indigo-900"
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">Domain Doğrulama Talimatları</h2>
            <p className="mb-4">
              Domain doğrulaması için lütfen aşağıdaki DNS ayarlarını domain sağlayıcınızda yapın:
            </p>

            <div className="mb-4 rounded-md bg-gray-50 p-4">
              <h3 className="mb-2 font-medium">SSL Doğrulama</h3>
              <p>Yöntem: {verificationDetails.ssl?.method}</p>
              <p>Tür: {verificationDetails.ssl?.type}</p>

              {verificationDetails.verification_errors?.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-medium text-red-600">Doğrulama Hataları:</h4>
                  <ul className="list-disc pl-5">
                    {verificationDetails.verification_errors.map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <p className="mb-4">
              DNS ayarlarınızı yaptıktan sonra, doğrulama tamamlanana kadar birkaç dakika bekleyin.
              Daha sonra &quot;Doğrula&quot; butonunu kullanarak durumu kontrol edebilirsiniz.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
