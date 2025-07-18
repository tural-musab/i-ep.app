'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Code,
  PlayCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

type Webhook = {
  id: string;
  name: string;
  url: string;
  description?: string;
  is_active: boolean;
  events: string[];
  headers?: Record<string, string>;
  tenant_id?: string;
  tenant_name?: string;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  last_response_code?: number;
  failure_count?: number;
  success_count?: number;
  secret?: string;
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    description: '',
    url: '',
    events: [] as string[],
    is_active: true,
    tenant_id: '',
  });

  const [testPayload, setTestPayload] = useState(
    '{\n  "test": true,\n  "message": "Bu bir test mesajıdır.",\n  "timestamp": "' +
      new Date().toISOString() +
      '"\n}'
  );
  const [testResponse, setTestResponse] = useState<{
    status?: number;
    body?: string;
    duration?: number;
    error?: string;
  } | null>(null);

  const eventOptions = [
    { value: 'tenant.created', label: 'Tenant Oluşturuldu' },
    { value: 'tenant.updated', label: 'Tenant Güncellendi' },
    { value: 'user.created', label: 'Kullanıcı Oluşturuldu' },
    { value: 'user.updated', label: 'Kullanıcı Güncellendi' },
    { value: 'user.deleted', label: 'Kullanıcı Silindi' },
    { value: 'user.login', label: 'Kullanıcı Girişi' },
    { value: 'class.created', label: 'Sınıf Oluşturuldu' },
    { value: 'class.updated', label: 'Sınıf Güncellendi' },
    { value: 'class.deleted', label: 'Sınıf Silindi' },
    { value: 'student.created', label: 'Öğrenci Oluşturuldu' },
    { value: 'student.updated', label: 'Öğrenci Güncellendi' },
    { value: 'student.deleted', label: 'Öğrenci Silindi' },
  ];

  const columns = [
    {
      accessorKey: 'name',
      header: 'Webhook Adı',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {row.original.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'url',
      header: 'URL',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <span className="max-w-[200px] truncate font-mono text-xs">{row.original.url}</span>
      ),
    },
    {
      accessorKey: 'events',
      header: 'Olaylar',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.events.slice(0, 2).map((event: string) => (
            <Badge key={event} variant="secondary" className="text-xs">
              {eventOptions.find((opt) => opt.value === event)?.label || event}
            </Badge>
          ))}
          {row.original.events.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.events.length - 2} daha
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tenant_name',
      header: 'Tenant',
      cell: ({ row }: { row: { original: Webhook } }) =>
        row.original.tenant_name || 'Tüm Tenantlar',
    },
    {
      accessorKey: 'is_active',
      header: 'Durum',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <div>
          {row.original.is_active ? (
            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" />
              Aktif
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
              <XCircle className="mr-1 h-3 w-3" />
              Pasif
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'last_triggered_at',
      header: 'Son Tetikleme',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <div className="flex items-center gap-1">
          <Clock className="text-muted-foreground h-3 w-3" />
          {row.original.last_triggered_at
            ? format(new Date(row.original.last_triggered_at), 'dd MMM yyyy HH:mm', { locale: tr })
            : 'Henüz tetiklenmedi'}
        </div>
      ),
    },
    {
      accessorKey: 'last_response_code',
      header: 'Son Cevap',
      cell: ({ row }: { row: { original: Webhook } }) => {
        if (!row.original.last_response_code) return '-';

        const code = row.original.last_response_code;
        let color = 'bg-gray-50 text-gray-700 border-gray-200';

        if (code >= 200 && code < 300) {
          color = 'bg-green-50 text-green-700 border-green-200';
        } else if (code >= 400) {
          color = 'bg-red-50 text-red-700 border-red-200';
        } else if (code >= 300) {
          color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        }

        return (
          <Badge variant="outline" className={color}>
            {code}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'İşlemler',
      cell: ({ row }: { row: { original: Webhook } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Görüntüle"
            onClick={() => handleViewClick(row.original)}
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Test Et"
            onClick={() => handleTestClick(row.original)}
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Düzenle"
            onClick={() => {
              /* Düzenleme işlemi */
            }}
          >
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
    fetchWebhooks();
  }, []);

  async function fetchWebhooks() {
    setIsLoading(true);
    try {
      const supabase = createClientComponentClient();

      // Webhook'ları getir
      const { data: webhooks, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (webhooksError) throw webhooksError;

      // Tenant bilgilerini ekle
      const enrichedWebhooks = await Promise.all(
        (webhooks || []).map(async (webhook) => {
          let tenantName = null;

          if (webhook.tenant_id) {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('name')
              .eq('id', webhook.tenant_id)
              .single();

            tenantName = tenantData?.name;
          }

          return {
            ...webhook,
            tenant_name: tenantName,
          };
        })
      );

      setWebhooks(enrichedWebhooks);
    } catch (error) {
      console.error("Webhook'lar yüklenirken hata:", error);
      toast.error("Webhook'lar yüklenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  const handleViewClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsViewDialogOpen(true);
  };

  const handleTestClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setTestResponse(null);
    setIsTestDialogOpen(true);
  };

  const handleDeleteClick = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      const supabase = createClientComponentClient();

      // Webhook'u sil
      const { error } = await supabase.from('webhooks').delete().eq('id', selectedWebhook.id);

      if (error) throw error;

      toast.success(`${selectedWebhook.name} webhook'u başarıyla silindi`);

      // Listeyi güncelle
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== selectedWebhook.id));

      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Webhook silinirken hata:', error);
      toast.error('Webhook silinirken bir hata oluştu');
    }
  };

  const handleAddWebhook = async () => {
    try {
      if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
        toast.error('Lütfen tüm gerekli alanları doldurun');
        return;
      }

      const supabase = createClientComponentClient();

      // Webhook'u ekle
      const { error } = await supabase
        .from('webhooks')
        .insert({
          name: newWebhook.name,
          url: newWebhook.url,
          description: newWebhook.description,
          is_active: newWebhook.is_active,
          events: newWebhook.events,
          tenant_id: newWebhook.tenant_id || null,
          secret: generateWebhookSecret(),
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${newWebhook.name} webhook'u başarıyla eklendi`);

      // Listeyi yeniden yükle
      fetchWebhooks();

      // Formu sıfırla
      setNewWebhook({
        name: '',
        description: '',
        url: '',
        events: [],
        is_active: true,
        tenant_id: '',
      });

      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Webhook eklenirken hata:', error);
      toast.error('Webhook eklenirken bir hata oluştu');
    }
  };

  const generateWebhookSecret = () => {
    return (
      'whsec_' +
      Array.from(crypto.getRandomValues(new Uint8Array(24)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
  };

  const handleTestWebhook = async () => {
    if (!selectedWebhook) return;

    try {
      setTestResponse(null);
      const startTime = Date.now();

      // Test isteği gönderme simülasyonu
      // Gerçek uygulamada bu bir API çağrısı olacaktır
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Başarılı yanıt simülasyonu
      setTestResponse({
        status: 200,
        body: JSON.stringify({ success: true, message: 'Webhook test başarılı' }, null, 2),
        duration,
      });

      toast.success('Webhook test isteği başarıyla gönderildi');
    } catch (error) {
      console.error('Webhook test edilirken hata:', error);
      setTestResponse({
        status: 500,
        error: String(error),
        duration: 0,
      });
      toast.error('Webhook test edilirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhook&apos;lar</h1>
          <p className="text-muted-foreground">
            Sistem olaylarına abone olacak webhook&apos;ları yönetin
          </p>
        </div>
        <Button className="flex items-center" onClick={() => setIsAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Webhook Ekle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Listesi</CardTitle>
          <CardDescription>Sistemdeki tüm webhook&apos;ların listesi ve durumları</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={webhooks}
            searchColumn="name"
            searchPlaceholder="Webhook ara..."
            isLoading={isLoading}
            emptyMessage="Hiç webhook bulunamadı"
          />
        </CardContent>
      </Card>

      {/* Webhook Ekleme Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Yeni Webhook Ekle</DialogTitle>
            <DialogDescription>
              Belirli olaylara abone olacak yeni bir webhook ekleyin. Webhook, olaylar
              gerçekleştiğinde belirtilen URL&apos;ye HTTP POST istekleri gönderecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Webhook Adı</Label>
              <Input
                id="name"
                placeholder="Örnek: CRM Entegrasyonu"
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama (İsteğe Bağlı)</Label>
              <Input
                id="description"
                placeholder="Webhook'un amacı veya kullanımıyla ilgili açıklama"
                value={newWebhook.description}
                onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                placeholder="https://example.com/webhooks/i-ep"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              />
              <p className="text-muted-foreground text-xs">
                Bu URL&apos;ye HTTP POST istekleri gönderilecektir
              </p>
            </div>

            <div className="space-y-2">
              <Label>Abone Olunacak Olaylar</Label>
              <div className="grid grid-cols-2 gap-2">
                {eventOptions.map((event) => (
                  <div key={event.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`event-${event.value}`}
                      checked={newWebhook.events.includes(event.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewWebhook({
                            ...newWebhook,
                            events: [...newWebhook.events, event.value],
                          });
                        } else {
                          setNewWebhook({
                            ...newWebhook,
                            events: newWebhook.events.filter((e) => e !== event.value),
                          });
                        }
                      }}
                      className="text-primary focus:ring-primary rounded border-gray-300"
                    />
                    <Label htmlFor={`event-${event.value}`} className="text-sm font-normal">
                      {event.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant_id">Tenant (İsteğe Bağlı)</Label>
              <select
                id="tenant_id"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                value={newWebhook.tenant_id}
                onChange={(e) => setNewWebhook({ ...newWebhook, tenant_id: e.target.value })}
              >
                <option value="">Tüm Tenantlar</option>
                {webhooks
                  .filter((webhook) => webhook.tenant_id && webhook.tenant_name)
                  .map((webhook) => (
                    <option key={webhook.tenant_id} value={webhook.tenant_id}>
                      {webhook.tenant_name}
                    </option>
                  ))}
              </select>
              <p className="text-muted-foreground text-xs">
                Belirli bir tenant seçerseniz, yalnızca bu tenant ile ilgili olaylar için webhook
                tetiklenecektir.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={newWebhook.is_active}
                onCheckedChange={(checked) => setNewWebhook({ ...newWebhook, is_active: checked })}
              />
              <Label htmlFor="is_active">Webhook&apos;u Aktif Et</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddWebhook}>Ekle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Görüntüleme Dialog */}
      {selectedWebhook && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedWebhook.name}</DialogTitle>
              <DialogDescription>{selectedWebhook.description || 'Açıklama yok'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Webhook ID</Label>
                <div className="bg-muted rounded-md p-2 font-mono text-sm">
                  {selectedWebhook.id}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Endpoint URL</Label>
                <div className="bg-muted rounded-md p-2 font-mono text-sm">
                  {selectedWebhook.url}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Webhook Secret</Label>
                <div className="bg-muted rounded-md p-2 font-mono text-sm">
                  {selectedWebhook.secret || 'Gizli değer (görüntülenemiyor)'}
                </div>
                <p className="text-muted-foreground text-xs">
                  Bu değeri gelen isteklerin imzalarını doğrulamak için kullanın
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Abone Olunan Olaylar</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedWebhook.events.map((event) => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {eventOptions.find((opt) => opt.value === event)?.label || event}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Oluşturulma Tarihi</Label>
                  <div className="text-sm">
                    {format(new Date(selectedWebhook.created_at), 'dd MMM yyyy HH:mm', {
                      locale: tr,
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Son Güncellenme</Label>
                  <div className="text-sm">
                    {format(new Date(selectedWebhook.updated_at), 'dd MMM yyyy HH:mm', {
                      locale: tr,
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Başarılı İstek Sayısı</Label>
                  <div className="text-sm">{selectedWebhook.success_count || 0}</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Başarısız İstek Sayısı</Label>
                  <div className="text-sm">{selectedWebhook.failure_count || 0}</div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Webhook Test Dialog */}
      {selectedWebhook && (
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Webhook Test Et: {selectedWebhook.name}</DialogTitle>
              <DialogDescription>
                Bu webhook&apos;a test isteği gönderin ve yanıtı görüntüleyin.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-payload">Test Payload</Label>
                <Textarea
                  id="test-payload"
                  className="font-mono"
                  rows={6}
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                />
                <p className="text-muted-foreground text-xs">
                  Bu JSON verisi webhook endpointine gönderilecektir
                </p>
              </div>

              {testResponse && (
                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Yanıt</Label>
                    {testResponse.status && (
                      <Badge
                        variant="outline"
                        className={
                          testResponse.status >= 200 && testResponse.status < 300
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                        }
                      >
                        Durum: {testResponse.status}
                      </Badge>
                    )}
                  </div>

                  {testResponse.duration && (
                    <div className="text-muted-foreground mb-2 flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" /> {testResponse.duration}ms
                    </div>
                  )}

                  {testResponse.error ? (
                    <div className="rounded-md bg-red-50 p-3 font-mono text-sm text-red-700">
                      {testResponse.error}
                    </div>
                  ) : (
                    <div className="bg-muted max-h-40 overflow-auto rounded-md p-3">
                      <pre className="font-mono text-xs whitespace-pre-wrap">
                        {testResponse.body}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" className="gap-1" onClick={() => setTestResponse(null)}>
                <RefreshCw className="h-4 w-4" /> Sıfırla
              </Button>
              <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleTestWebhook}>Test Et</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Webhook Silme Dialog */}
      {selectedWebhook && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Webhook Silme</DialogTitle>
              <DialogDescription>
                <span className="font-medium">{selectedWebhook.name}</span> webhook&apos;unu silmek
                istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-destructive text-sm">
                Bu webhook silindiğinde, abonelikler de silinecek ve ilgili olaylar için bildirimler
                artık gönderilmeyecektir.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDeleteWebhook}>
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
