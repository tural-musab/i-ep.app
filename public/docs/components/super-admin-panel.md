# Super Admin Panel Dokümantasyonu

Bu doküman, İ-EP.APP'nin Super Admin Paneli komponentlerini, yapısını ve kullanımını detaylı olarak açıklar. Super Admin Paneli, platformun yönetim ve kontrol merkezidir.

## Genel Bakış

Super Admin Paneli, İ-EP.APP platformunun tüm tenant'ları yönetmek, sistem yapılandırmasını değiştirmek ve genel analitikleri görüntülemek için kullanılan merkezi kontrol panelidir.

![Super Admin Panel Yapısı](../assets/images/super-admin-panel-overview.md)

## Erişim

Super Admin Paneline yalnızca süper yönetici rolüne sahip kullanıcılar erişebilir:

```
https://admin.i-ep.app
```

## Panel Yapısı

Super Admin Paneli aşağıdaki ana bölümlerden oluşmaktadır:

1. **Dashboard**: Genel sistem metrikleri ve analitikler
2. **Tenants Yönetimi**: Tüm tenant'ların listesi ve yönetimi
3. **Users Yönetimi**: Platform kullanıcılarının yönetimi
4. **Subscriptions**: Abonelik planları ve faturalandırma
5. **Domain Management**: Domain ve SSL sertifikası yönetimi
6. **Settings**: Sistem yapılandırma ayarları
7. **Logs & Monitoring**: Sistem logları ve izleme

## Komponentler ve Kullanımı

### Dashboard

Dashboard komponenti, platform hakkında genel bir bakış sağlar.

```tsx
// DashboardPage.tsx
import { DashboardMetrics } from "@/components/super-admin/DashboardMetrics";
import { RecentActivity } from "@/components/super-admin/RecentActivity";
import { SystemHealth } from "@/components/super-admin/SystemHealth";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardMetrics />
      <SystemHealth />
      <RecentActivity />
    </div>
  );
}
```

#### DashboardMetrics

`DashboardMetrics` komponenti, tüm sistemin temel metriklerini gösterir:

- Toplam tenant sayısı
- Aktif kullanıcı sayısı
- Toplam öğrenci sayısı
- Toplam gelir

```tsx
// DashboardMetrics.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/super-admin/useDashboardMetrics";

export function DashboardMetrics() {
  const { data, isLoading, error } = useDashboardMetrics();
  
  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error.message}</div>;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Tenant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.tenantCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Aktif Kullanıcılar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeUserCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Öğrenci
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.studentCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Toplam Gelir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₺{data.totalRevenue}</div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Tenant Yönetimi

#### TenantList

`TenantList` komponenti, tüm tenant'ları bir tablo olarak görüntüler ve arama, filtreleme ve sıralama işlevleri sağlar.

```tsx
// TenantList.tsx
import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useTenants } from "@/hooks/super-admin/useTenants";

export function TenantList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data, isLoading, error } = useTenants({ search, status: statusFilter });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Tenant ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Durum: {statusFilter === "all" ? "Tümü" : statusFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Tümü
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("active")}>
              Aktif
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
              Pasif
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("trial")}>
              Deneme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İsim</TableHead>
            <TableHead>Subdomain</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Oluşturulma Tarihi</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-red-500">
                Hata: {error.message}
              </TableCell>
            </TableRow>
          ) : data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Tenant bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            data?.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.subdomain}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.status === "active" ? "bg-green-100 text-green-800" :
                    tenant.status === "inactive" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {tenant.status}
                  </span>
                </TableCell>
                <TableCell>{tenant.plan}</TableCell>
                <TableCell>{new Date(tenant.createdAt).toLocaleDateString("tr-TR")}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Devre Dışı Bırak
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

#### TenantDetail

`TenantDetail` komponenti, bir tenant'ın detaylı bilgilerini gösterir ve düzenleme işlevleri sağlar.

```tsx
// TenantDetail.tsx
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTenantDetails } from "@/hooks/super-admin/useTenantDetails";
import { TenantInfoForm } from "./TenantInfoForm";
import { TenantUsersTable } from "./TenantUsersTable";
import { TenantDomainsTable } from "./TenantDomainsTable";
import { TenantBillingHistory } from "./TenantBillingHistory";

export function TenantDetail() {
  const { tenantId } = useParams();
  const router = useRouter();
  const { data: tenant, isLoading, error } = useTenantDetails(tenantId);
  
  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error.message}</div>;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{tenant.name}</h2>
          <p className="text-gray-500">{tenant.subdomain}.i-ep.app</p>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => router.back()}>Geri</Button>
          <Button variant="destructive">
            {tenant.status === "active" ? "Devre Dışı Bırak" : "Aktifleştir"}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="info">
        <TabsList className="grid grid-cols-4 w-[400px]">
          <TabsTrigger value="info">Bilgiler</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="domains">Domainler</TabsTrigger>
          <TabsTrigger value="billing">Faturalar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-6">
          <TenantInfoForm tenant={tenant} />
        </TabsContent>
        
        <TabsContent value="users" className="mt-6">
          <TenantUsersTable tenantId={tenant.id} />
        </TabsContent>
        
        <TabsContent value="domains" className="mt-6">
          <TenantDomainsTable tenantId={tenant.id} />
        </TabsContent>
        
        <TabsContent value="billing" className="mt-6">
          <TenantBillingHistory tenantId={tenant.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### User Yönetimi

#### SuperAdminUserList

`SuperAdminUserList` komponenti, platform yöneticilerini ve süper admin kullanıcılarını yönetmek için kullanılır.

```tsx
// SuperAdminUserList.tsx
import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuperAdminUsers } from "@/hooks/super-admin/useSuperAdminUsers";
import { SuperAdminUserForm } from "./SuperAdminUserForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SuperAdminUserList() {
  const [search, setSearch] = useState("");
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const { data, isLoading, error } = useSuperAdminUsers({ search });
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Kullanıcı ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogTrigger asChild>
            <Button>Yeni Kullanıcı Ekle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Super Admin Kullanıcısı</DialogTitle>
            </DialogHeader>
            <SuperAdminUserForm onSuccess={() => setShowAddUserDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>İsim</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Son Giriş</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-red-500">
                Hata: {error.message}
              </TableCell>
            </TableRow>
          ) : data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Kullanıcı bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === "active" ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("tr-TR") : "-"}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500">
                    Devre Dışı Bırak
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Subscription Yönetimi

#### SubscriptionPlans

`SubscriptionPlans` komponenti, platform abonelik planlarını görüntülemek ve düzenlemek için kullanılır.

```tsx
// SubscriptionPlans.tsx
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscriptionPlans } from "@/hooks/super-admin/useSubscriptionPlans";
import { SubscriptionPlanForm } from "./SubscriptionPlanForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: plans, isLoading, error } = useSubscriptionPlans();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogTrigger asChild>
            <Button>Yeni Plan Ekle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedPlan ? "Planı Düzenle" : "Yeni Plan Ekle"}
              </DialogTitle>
            </DialogHeader>
            <SubscriptionPlanForm 
              plan={selectedPlan} 
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedPlan(null);
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div>Yükleniyor...</div>
      ) : error ? (
        <div className="text-red-500">Hata: {error.message}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  ₺{plan.price}{" "}
                  <span className="text-sm font-normal text-gray-500">/ ay</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowEditDialog(true);
                  }}
                  className="w-full"
                >
                  Düzenle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Domain Management

#### DomainVerificationList

`DomainVerificationList` komponenti, bekleyen domain doğrulama isteklerini yönetmek için kullanılır.

```tsx
// DomainVerificationList.tsx
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { usePendingDomainVerifications } from "@/hooks/super-admin/usePendingDomainVerifications";

export function DomainVerificationList() {
  const { data, isLoading, error, mutate } = usePendingDomainVerifications();
  
  const handleVerifyDomain = async (domainId) => {
    try {
      await fetch(`/api/super-admin/domains/${domainId}/verify`, {
        method: "POST",
      });
      mutate(); // Veriyi yenile
    } catch (error) {
      console.error("Domain doğrulama hatası:", error);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Bekleyen Domain Doğrulamaları</h2>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>Doğrulama Türü</TableHead>
            <TableHead>Oluşturulma Tarihi</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-red-500">
                Hata: {error.message}
              </TableCell>
            </TableRow>
          ) : data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Bekleyen domain doğrulaması yok
              </TableCell>
            </TableRow>
          ) : (
            data?.map((domain) => (
              <TableRow key={domain.id}>
                <TableCell>{domain.tenantName}</TableCell>
                <TableCell>{domain.domain}</TableCell>
                <TableCell>{domain.verificationType}</TableCell>
                <TableCell>
                  {new Date(domain.createdAt).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleVerifyDomain(domain.id)}>
                    Doğrula
                  </Button>
                  <Button variant="outline" size="sm" className="ml-2">
                    Detaylar
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

### System Settings

#### SystemSettings

`SystemSettings` komponenti, platform genelindeki yapılandırma ayarlarını yönetmek için kullanılır.

```tsx
// SystemSettings.tsx
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSystemSettings } from "@/hooks/super-admin/useSystemSettings";
import { toast } from "@/components/ui/use-toast";

const systemSettingsSchema = z.object({
  siteName: z.string().min(2, { message: "Site adı en az 2 karakter olmalıdır" }),
  siteDescription: z.string(),
  maintenanceMode: z.boolean(),
  userRegistrationEnabled: z.boolean(),
  maxTenantsPerUser: z.number().min(1),
  contactEmail: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  supportPhone: z.string(),
});

export function SystemSettings() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: settings, isLoading, error, mutate } = useSystemSettings();
  
  const form = useForm({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: settings || {
      siteName: "",
      siteDescription: "",
      maintenanceMode: false,
      userRegistrationEnabled: true,
      maxTenantsPerUser: 1,
      contactEmail: "",
      supportPhone: "",
    },
  });
  
  // Form değerlerini güncelle
  React.useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/super-admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      toast({
        title: "Ayarlar güncellendi",
        description: "Sistem ayarları başarıyla güncellendi.",
      });
      
      mutate(); // Veriyi yenile
    } catch (error) {
      toast({
        title: "Hata",
        description: "Ayarlar güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
      console.error("Ayarlar güncellenirken hata:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">Hata: {error.message}</div>;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="siteName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Adı</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Platformun görünen adı
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="siteDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Açıklaması</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Meta açıklaması olarak kullanılır
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="maintenanceMode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Bakım Modu</FormLabel>
                <FormDescription>
                  Etkinleştirildiğinde, yalnızca yöneticiler siteye erişebilir
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="userRegistrationEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Kullanıcı Kaydı</FormLabel>
                <FormDescription>
                  Yeni kullanıcı kayıtlarına izin ver
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="maxTenantsPerUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Başına Maksimum Tenant</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))} 
                />
              </FormControl>
              <FormDescription>
                Bir kullanıcının oluşturabileceği maksimum tenant sayısı
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İletişim E-postası</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Site üzerinde görüntülenen iletişim e-postası
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="supportPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destek Telefonu</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Destek için telefon numarası
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </form>
    </Form>
  );
}
```

### Monitoring

#### SystemLogs

`SystemLogs` komponenti, platform sistem loglarını görüntülemek için kullanılır.

```tsx
// SystemLogs.tsx
import { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSystemLogs } from "@/hooks/super-admin/useSystemLogs";

export function SystemLogs() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [limit, setLimit] = useState("50");
  const { data, isLoading, error } = useSystemLogs({ search, level, limit: parseInt(limit) });
  
  const levelColors = {
    error: "bg-red-100 text-red-800",
    warn: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    debug: "bg-green-100 text-green-800",
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Logları ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Log seviyesi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Seviyeler</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={limit} onValueChange={setLimit}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Limit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 kayıt</SelectItem>
            <SelectItem value="50">50 kayıt</SelectItem>
            <SelectItem value="100">100 kayıt</SelectItem>
            <SelectItem value="500">500 kayıt</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline">Yenile</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zaman</TableHead>
            <TableHead>Seviye</TableHead>
            <TableHead>Mesaj</TableHead>
            <TableHead>Servis</TableHead>
            <TableHead>Tenant ID</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Yükleniyor...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-red-500">
                Hata: {error.message}
              </TableCell>
            </TableRow>
          ) : data?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Log bulunamadı
              </TableCell>
            </TableRow>
          ) : (
            data?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleDateString("tr-TR")} {new Date(log.timestamp).toLocaleTimeString("tr-TR")}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[log.level]}`}>
                    {log.level}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {log.message}
                </TableCell>
                <TableCell>{log.service}</TableCell>
                <TableCell>{log.tenantId || "-"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Detay
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

## Hook'lar ve Servisler

Super Admin Panel'deki komponentler, veri alışverişi ve işlemler için özel hook'lar ve servisler kullanır.

### useTenants

```tsx
// hooks/super-admin/useTenants.ts
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useTenants({ search = "", status = "all" } = {}) {
  const url = `/api/super-admin/tenants?search=${encodeURIComponent(search)}&status=${status}`;
  
  return useSWR(url, fetcher);
}
```

### useTenantDetails

```tsx
// hooks/super-admin/useTenantDetails.ts
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useTenantDetails(tenantId) {
  return useSWR(tenantId ? `/api/super-admin/tenants/${tenantId}` : null, fetcher);
}
```

### useDashboardMetrics

```tsx
// hooks/super-admin/useDashboardMetrics.ts
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export function useDashboardMetrics() {
  return useSWR(`/api/super-admin/dashboard/metrics`, fetcher);
}
```

## Yetkilendirme

Super Admin paneline erişim, `SuperAdminGuard` komponenti ile kontrol edilir.

```tsx
// components/auth/SuperAdminGuard.tsx
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function SuperAdminGuard({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "super_admin")) {
      router.push("/auth/login?callbackUrl=/super-admin");
    }
  }, [user, isLoading, router]);
  
  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }
  
  if (!user || user.role !== "super_admin") {
    return null;
  }
  
  return <>{children}</>;
}
```

## Layout

Super Admin Panel için özel bir layout kullanılır.

```tsx
// app/super-admin/layout.tsx
import { SuperAdminGuard } from "@/components/auth/SuperAdminGuard";
import { SuperAdminSidebar } from "@/components/super-admin/SuperAdminSidebar";
import { SuperAdminHeader } from "@/components/super-admin/SuperAdminHeader";

export default function SuperAdminLayout({ children }) {
  return (
    <SuperAdminGuard>
      <div className="flex min-h-screen">
        <SuperAdminSidebar />
        <div className="flex-1">
          <SuperAdminHeader />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SuperAdminGuard>
  );
}
```

## Kullanım Senaryoları

### Yeni Tenant Oluşturma

1. Super Admin Panel'deki "Tenants" sayfasına gidin
2. "Yeni Tenant Ekle" düğmesine tıklayın
3. Gerekli bilgileri doldurun:
   - Tenant adı
   - Subdomain
   - Admin kullanıcı e-postası
   - Abonelik planı
4. "Oluştur" düğmesine tıklayın
5. Tenant başarıyla oluşturulduktan sonra tenant detay sayfasına yönlendirilirsiniz

### Tenant Devre Dışı Bırakma

1. Super Admin Panel'deki "Tenants" sayfasında ilgili tenant'ı bulun
2. "Devre Dışı Bırak" düğmesine tıklayın
3. Onay iletişim kutusunda "Evet" düğmesine tıklayın
4. Tenant devre dışı bırakılır ve statüsü "inactive" olarak güncellenir

### Sistem Ayarlarını Güncelleme

1. Super Admin Panel'deki "Settings" sayfasına gidin
2. Değiştirmek istediğiniz ayarları güncelleyin
3. "Kaydet" düğmesine tıklayın
4. Ayarlar güncellenir ve bir onay mesajı görüntülenir

## İpuçları ve En İyi Uygulamalar

1. **Dashboard'dan Başlayın**: Super Admin Panel'e giriş yaptığınızda, ilk olarak Dashboard'a yönlendirilirsiniz. Buradan genel platform durumunu hızlıca görebilirsiniz.

2. **Arama ve Filtreleme**: Tüm liste sayfalarında arama ve filtreleme özellikleri vardır. Büyük veri setlerinde istediğiniz bilgileri hızlıca bulabilirsiniz.

3. **Bulk İşlemler**: Çoklu tenant veya kullanıcı üzerinde toplu işlemler yapmak için, önce işlem yapmak istediğiniz öğeleri seçin, ardından "Toplu İşlemler" düğmesine tıklayın.

4. **Logları Düzenli Kontrol Edin**: Sistem loglarını düzenli olarak kontrol ederek potansiyel sorunları önceden tespit edebilirsiniz.

5. **Yetkilendirme Dikkatli Yapılmalı**: Super Admin rolü platform üzerinde tam yetkiye sahiptir. Bu rolü verirken dikkatli olun ve gerektiğinde daha sınırlı yetkilerle özel roller oluşturun.

## Sorun Giderme

**Sorun**: Super Admin Panel'e erişim sağlanamıyor.
**Çözüm**: Kullanıcının "super_admin" rolüne sahip olduğundan emin olun ve oturum açma bilgilerini kontrol edin.

**Sorun**: Tenant oluşturulurken hata alınıyor.
**Çözüm**: Subdomain'in benzersiz olduğundan ve geçerli bir format kullandığından emin olun. Ayrıca, domain DNS ayarlarını kontrol edin.

**Sorun**: Sistem ayarları kaydedilemiyor.
**Çözüm**: Form alanlarının doğru formatta doldurulduğundan emin olun ve konsoldaki hata mesajlarını kontrol edin. 