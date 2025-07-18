/**
 * Domain Detay Sayfası
 * Domain bilgilerini görüntüleme ve yönetme için sayfa
 * Referans: docs/domain-management.md
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { DomainVerification } from '@/components/admin/domain/DomainVerification';
import { SSLStatus } from '@/components/admin/domain/SSLStatus';

interface Domain {
  id: string;
  domain: string;
  type: 'subdomain' | 'custom';
  is_verified: boolean;
  is_primary: boolean;
  tenant_id: string;
  created_at: string;
  verified_at?: string;
}

interface DomainDetailPageProps {
  params: {
    domainId: string;
  };
}

export default function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { domainId } = params;
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Domain bilgilerini getir
  const fetchDomainDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/domains/${domainId}`);
      const result = await response.json();

      if (result.success) {
        setDomain(result.data);
      } else {
        setError(result.error || 'Domain bilgileri alınamadı');
        toast({
          title: 'Hata',
          description: result.error || 'Domain bilgileri alınamadı',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Domain bilgileri alınamadı:', error);
      setError('Domain bilgileri alınamadı');
      toast({
        title: 'Hata',
        description: 'Domain bilgileri alınamadı',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [domainId]);

  // Sayfa yüklendiğinde domain bilgilerini getir
  useEffect(() => {
    fetchDomainDetails();
  }, [fetchDomainDetails]);

  // Doğrulama tamamlandığında
  const handleVerificationCompleted = () => {
    toast({
      title: 'Doğrulama Tamamlandı',
      description: 'Domain başarıyla doğrulandı',
    });
    fetchDomainDetails(); // Domain bilgilerini güncelle
  };

  // Doğrulama hatası
  const handleVerificationError = (error: Error) => {
    toast({
      title: 'Doğrulama Hatası',
      description: error.message || 'Domain doğrulanırken bir hata oluştu',
      variant: 'destructive',
    });
  };

  // SSL yenileme
  const handleSSLRenewal = () => {
    toast({
      title: 'SSL Yenileme',
      description: 'SSL sertifikası yenileme işlemi başlatıldı',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto flex h-96 items-center justify-center py-8">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !domain) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center">
          <Link href="/admin/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Domainlere Dön
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Domain bulunamadı'}</p>
            <Button className="mt-4" onClick={fetchDomainDetails}>
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/domains">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Domainlere Dön
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{domain.domain}</h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`https://${domain.domain}`, '_blank')}
          disabled={!domain.is_verified}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Ziyaret Et
        </Button>
      </div>

      <Tabs defaultValue={domain.is_verified ? 'info' : 'verification'} className="mb-8">
        <TabsList>
          <TabsTrigger value="info">Domain Bilgileri</TabsTrigger>
          {domain.type === 'custom' && !domain.is_verified && (
            <TabsTrigger value="verification">Doğrulama</TabsTrigger>
          )}
          {domain.is_verified && <TabsTrigger value="ssl">SSL Durumu</TabsTrigger>}
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">Domain</h3>
                  <p className="text-lg font-medium">{domain.domain}</p>
                </div>

                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">Tür</h3>
                  <p className="text-lg font-medium">
                    {domain.type === 'subdomain' ? 'Subdomain' : 'Özel Domain'}
                  </p>
                </div>

                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">Doğrulama Durumu</h3>
                  <p className="text-lg font-medium">
                    {domain.is_verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                  </p>
                </div>

                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">Primary</h3>
                  <p className="text-lg font-medium">{domain.is_primary ? 'Evet' : 'Hayır'}</p>
                </div>

                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">Oluşturulma Tarihi</h3>
                  <p className="text-lg font-medium">
                    {new Date(domain.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>

                {domain.verified_at && (
                  <div>
                    <h3 className="text-muted-foreground text-sm font-medium">Doğrulama Tarihi</h3>
                    <p className="text-lg font-medium">
                      {new Date(domain.verified_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-muted-foreground text-sm font-medium">Tenant ID</h3>
                  <p className="text-lg font-medium">{domain.tenant_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {domain.type === 'custom' && !domain.is_verified && (
          <TabsContent value="verification" className="mt-6">
            <DomainVerification
              domainId={domainId}
              domain={domain.domain}
              tenantId={domain.tenant_id}
              onVerified={handleVerificationCompleted}
              onError={handleVerificationError}
            />
          </TabsContent>
        )}

        {domain.is_verified && (
          <TabsContent value="ssl" className="mt-6">
            <SSLStatus
              domainId={domainId}
              domain={domain.domain}
              tenantId={domain.tenant_id}
              onRenew={handleSSLRenewal}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
