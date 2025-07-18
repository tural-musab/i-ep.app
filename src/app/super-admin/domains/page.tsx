'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, ExternalLink, Edit2, Trash2, CheckCircle, XCircle, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Domain = {
  id: string;
  domain: string;
  tenant_id: string;
  tenant_name?: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
  verification_code?: string;
  last_verified_at?: string | null;
  dns_records?: {
    type: string;
    name: string;
    value: string;
    ttl: number;
  }[];
};

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [newDomain, setNewDomain] = useState({
    domain: '',
    tenant_id: '',
    is_primary: false,
  });

  const columns = [
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }: { row: { original: Domain } }) => (
        <div className="flex items-center gap-2">
          <Globe className="text-muted-foreground h-4 w-4" />
          <span className="font-medium">{row.original.domain}</span>
          {row.original.is_primary && (
            <Badge variant="secondary" className="ml-2">
              <CheckCircle className="mr-1 h-3 w-3" />
              Birincil
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tenant_name',
      header: 'Tenant',
      cell: ({ row }: { row: { original: Domain } }) => (
        <span>{row.original.tenant_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'is_verified',
      header: 'Doğrulama Durumu',
      cell: ({ row }: { row: { original: Domain } }) => (
        <div>
          {row.original.is_verified ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Doğrulanmış
            </Badge>
          ) : (
            <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
              <XCircle className="mr-1 h-3 w-3" />
              Doğrulanmamış
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'last_verified_at',
      header: 'Son Doğrulama',
      cell: ({ row }: { row: { original: Domain } }) =>
        row.original.last_verified_at
          ? format(new Date(row.original.last_verified_at), 'dd MMM yyyy HH:mm', { locale: tr })
          : '-',
    },
    {
      accessorKey: 'created_at',
      header: 'Eklenme Tarihi',
      cell: ({ row }: { row: { original: Domain } }) =>
        format(new Date(row.original.created_at), 'dd MMM yyyy', { locale: tr }),
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Domain } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Doğrula"
            onClick={() => handleVerifyClick(row.original)}
            disabled={row.original.is_verified}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Ziyaret Et"
            onClick={() => window.open(`https://${row.original.domain}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Düzenle">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Sil"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    setIsLoading(true);
    try {
      const supabase = createClientComponentClient();

      // Domainleri getir
      const { data: domains, error: domainsError } = await supabase
        .from('domains')
        .select('*')
        .order('created_at', { ascending: false });

      if (domainsError) throw domainsError;

      // Tenant bilgilerini ekle
      const enrichedDomains = await Promise.all(
        (domains || []).map(async (domain) => {
          let tenantName = null;

          if (domain.tenant_id) {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('name')
              .eq('id', domain.tenant_id)
              .single();

            tenantName = tenantData?.name;
          }

          // DNS kayıtlarını ekle - Örnek veri
          const dnsRecords = [
            {
              type: 'CNAME',
              name: domain.domain,
              value: 'app.i-ep.app.',
              ttl: 3600,
            },
            {
              type: 'TXT',
              name: `_i-ep-verification.${domain.domain}`,
              value: domain.verification_code || 'i-ep-verification=abcdef123456',
              ttl: 3600,
            },
          ];

          return {
            ...domain,
            tenant_name: tenantName,
            dns_records: dnsRecords,
          };
        })
      );

      setDomains(enrichedDomains);
    } catch (error) {
      console.error('Domainler yüklenirken hata:', error);
      toast.error('Domainler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  const handleVerifyClick = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsVerifyDialogOpen(true);
  };

  const handleDeleteClick = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsDeleteDialogOpen(true);
  };

  const handleVerifyDomain = async () => {
    try {
      // Domain doğrulama işlemi burada yapılacak
      toast.success(`${selectedDomain?.domain} domaini başarıyla doğrulandı`);

      // Listeyi güncelle
      setDomains((prev) =>
        prev.map((domain) =>
          domain.id === selectedDomain?.id
            ? { ...domain, is_verified: true, last_verified_at: new Date().toISOString() }
            : domain
        )
      );

      setIsVerifyDialogOpen(false);
    } catch (error) {
      console.error('Domain doğrulanırken hata:', error);
      toast.error('Domain doğrulanırken bir hata oluştu');
    }
  };

  const handleDeleteDomain = async () => {
    try {
      const supabase = createClientComponentClient();

      // Domaini sil
      const { error } = await supabase.from('domains').delete().eq('id', selectedDomain?.id);

      if (error) throw error;

      toast.success(`${selectedDomain?.domain} domaini başarıyla silindi`);

      // Listeyi güncelle
      setDomains((prev) => prev.filter((domain) => domain.id !== selectedDomain?.id));

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Domain silinirken hata:', error);
      toast.error('Domain silinirken bir hata oluştu');
    }
  };

  const handleAddDomain = async () => {
    try {
      const supabase = createClientComponentClient();

      // Domaini ekle
      const { error } = await supabase
        .from('domains')
        .insert({
          domain: newDomain.domain,
          tenant_id: newDomain.tenant_id,
          is_primary: newDomain.is_primary,
          is_verified: false,
          verification_code: `i-ep-verification=${Math.random().toString(36).substring(2, 15)}`,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${newDomain.domain} domaini başarıyla eklendi`);

      // Listeyi yeniden yükle
      fetchDomains();

      // Formu sıfırla
      setNewDomain({
        domain: '',
        tenant_id: '',
        is_primary: false,
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Domain eklenirken hata:', error);
      toast.error('Domain eklenirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domainler</h1>
          <p className="text-muted-foreground">Tenantlara ait özel domainleri yönetin</p>
        </div>
        <Button className="flex items-center" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Domain Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Domain Listesi</CardTitle>
          <CardDescription>
            Sistemdeki tüm özel domainlerin listesi ve doğrulama durumları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={domains}
            searchColumn="domain"
            searchPlaceholder="Domain ara..."
            isLoading={isLoading}
            emptyMessage="Hiç domain bulunamadı"
          />
        </CardContent>
      </Card>

      {/* Domain Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Domain Ekle</DialogTitle>
            <DialogDescription>
              Bir tenant için yeni bir domain ekleyin. Domain ekledikten sonra DNS ayarlarını
              yaparak doğrulamanız gerekecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Adı</Label>
              <Input
                id="domain"
                placeholder="ornek.com"
                value={newDomain.domain}
                onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
              />
              <p className="text-muted-foreground text-xs">
                Alt domain olmadan tam domain adını girin (örn: ornek.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant</Label>
              <select
                id="tenant_id"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={newDomain.tenant_id}
                onChange={(e) => setNewDomain({ ...newDomain, tenant_id: e.target.value })}
              >
                <option value="">Tenant Seçin</option>
                {domains.map((domain) =>
                  domain.tenant_id && domain.tenant_name ? (
                    <option key={domain.tenant_id} value={domain.tenant_id}>
                      {domain.tenant_name}
                    </option>
                  ) : null
                )}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_primary"
                checked={newDomain.is_primary}
                onCheckedChange={(checked) => setNewDomain({ ...newDomain, is_primary: checked })}
              />
              <Label htmlFor="is_primary">Birincil Domain</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddDomain}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Domain Doğrulama Dialog */}
      {selectedDomain && (
        <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Domain Doğrulama</DialogTitle>
              <DialogDescription>
                <span className="font-medium">{selectedDomain.domain}</span> domainini doğrulamak
                için aşağıdaki DNS kayıtlarını ekleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted rounded-md p-4">
                <h3 className="mb-2 text-sm font-medium">CNAME Kaydı</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium">Name</div>
                  <div className="font-medium">Value</div>
                  <div className="font-medium">TTL</div>

                  <div>{selectedDomain.domain}</div>
                  <div>app.i-ep.app.</div>
                  <div>3600</div>
                </div>
              </div>

              <div className="bg-muted rounded-md p-4">
                <h3 className="mb-2 text-sm font-medium">TXT Kaydı</h3>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="font-medium">Name</div>
                  <div className="font-medium">Value</div>
                  <div className="font-medium">TTL</div>

                  <div>_i-ep-verification</div>
                  <div className="break-all">
                    {selectedDomain.verification_code || 'i-ep-verification=abcdef123456'}
                  </div>
                  <div>3600</div>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                DNS kayıtları ekledikten sonra, değişikliklerin yayılması biraz zaman alabilir.
                Kayıtlar eklendikten sonra doğrulama işlemi yapabilirsiniz.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleVerifyDomain}>Doğrula</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Domain Silme Dialog */}
      {selectedDomain && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Domain Silme</DialogTitle>
              <DialogDescription>
                <span className="font-medium">{selectedDomain.domain}</span> domainini silmek
                istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-destructive text-sm">
                Bu domain silindiğinde, bu domaini kullanan kullanıcılar sistem ana domain üzerinden
                erişim sağlamak zorunda kalacaklar.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteDomain}>
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
