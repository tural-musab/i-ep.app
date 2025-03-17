# Teknoloji Yığını

## Genel Bakış

Maarif Okul Portalı SaaS platformu, modern, ölçeklenebilir ve sürdürülebilir bir eğitim yönetim sistemi sunmak için dikkatle seçilmiş bir teknoloji yığını üzerine inşa edilmiştir. Bu doküman, platformumuzda kullanılan teknolojileri, seçim kriterlerini ve mimari entegrasyonlarını detaylandırır.

## Teknoloji Seçim Kriterleri

Teknoloji seçimlerimizi yaparken aşağıdaki kriterleri göz önünde bulundurduk:

1. **Ölçeklenebilirlik**: Artan kullanıcı sayısı ve veri hacmine uyum sağlayabilme
2. **Sürdürülebilirlik**: Uzun vadeli bakım ve geliştirme kolaylığı
3. **Topluluk Desteği**: Aktif bir geliştirici topluluğu ve kaynakların mevcudiyeti
4. **Performans**: Düşük gecikme süresi ve yüksek verimlilik
5. **Güvenlik**: Güçlü güvenlik özellikleri ve kanıtlanmış güvenlik geçmişi
6. **Maliyet Etkinliği**: Hem geliştirme hem de işletme maliyetlerinde optimizasyon
7. **Türkiye'deki Kullanılabilirlik**: Türkiye'de sorunsuz çalışabilme ve yerel gereksinimlere uygunluk

## Frontend Teknolojileri

### Next.js 14

**Seçim Nedeni**: Next.js 14, React tabanlı uygulamalar için güçlü bir çerçeve sunarak hem server-side rendering (SSR) hem de statik site generation (SSG) kapasitesi sağlar.

**Avantajlar**:
- React Server Components desteği
- Server ve Client Components arasında esnek geçiş
- Gelişmiş routing sistemi
- Otomatik kod bölümleme (code splitting)
- API route'ları ile backend entegrasyonu
- Artımlı statik yeniden oluşturma (ISR)

**Alternatifler Değerlendirmesi**:
- **Remix**: Güçlü özelliklere sahip olmasına rağmen, Next.js'in daha geniş topluluk desteği ve dokümantasyonu vardır
- **Nuxt.js (Vue.js)**: Vue ekosistemi ilgi çekici olmasına rağmen, Türkiye'de React geliştirici bulmanın daha kolay olması
- **SvelteKit**: Performans odaklı olmasına rağmen, henüz Next.js kadar olgun bir ekosisteme sahip değil

**Uygulama Örneği**:

```typescript
// app/[tenant]/dashboard/page.tsx
import { getCurrentTenant } from '@/lib/tenant-server';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { TenantHeader } from '@/components/tenant/TenantHeader';

export default async function DashboardPage({ params }) {
  // Server Component - Tenant bilgilerini al
  const tenant = await getCurrentTenant(params.tenant);
  
  // Tenant bulunamazsa 404
  if (!tenant) {
    notFound();
  }
  
  // Tenant metrikleri
  const metrics = await getDashboardMetrics(tenant.id);
  
  return (
    <div className="dashboard-container">
      <TenantHeader tenant={tenant} />
      <h1>Okul Yönetim Paneli</h1>
      
      {/* Client Component'e prop olarak veri aktar */}
      <DashboardMetrics metrics={metrics} />
    </div>
  );
}
```

### TypeScript

**Seçim Nedeni**: TypeScript, statik tip kontrolü sağlayarak geliştirme sürecinde hataları erkenden yakalama ve kod kalitesini artırma imkanı sunar.

**Avantajlar**:
- Statik tip kontrolü
- Gelişmiş IDE desteği ve otomatik tamamlama
- Kod okunabilirliği ve bakım kolaylığı
- Dokümantasyon değeri
- Refactoring güvenliği

**Uygulama Örneği**:

```typescript
// types/tenant.ts
export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  planType: 'free' | 'standard' | 'premium';
  createdAt: Date;
  settings: TenantSettings;
  isActive: boolean;
}

export interface TenantSettings {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  allowParentRegistration: boolean;
  allowTeacherRegistration: boolean;
  languagePreference: 'tr' | 'en';
  timeZone: string;
}

// İşlevlerde kullanımı
async function updateTenantSettings(
  tenantId: string, 
  settings: Partial<TenantSettings>
): Promise<TenantSettings> {
  // Type-safe güncellemeler
}
```

### Tailwind CSS

**Seçim Nedeni**: Tailwind CSS, utility-first bir CSS çerçevesi olarak hızlı ve tutarlı UI geliştirmeyi sağlar.

**Avantajlar**:
- Utility-first yaklaşım ile hızlı geliştirme
- Minimum CSS dosya boyutu (kullanılmayan CSS'leri kaldırma)
- Tutarlı tasarım sistemi
- Responsive tasarım kolaylığı
- Özelleştirilebilirlik

**Alternatifler Değerlendirmesi**:
- **Bootstrap**: Daha büyük dosya boyutu ve daha az özelleştirilebilirlik
- **MUI (Material UI)**: Hazır komponentler sunmasına rağmen, özelleştirilmiş tasarım için Tailwind daha esnektir
- **Styled Components**: Component bazlı stilin avantajları olsa da, Tailwind'in geliştirme hızı daha yüksektir

**Uygulama Örneği**:

```tsx
// components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = ({ className, variant, size, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};

export { Button, buttonVariants };
```

### UI Komponent Kütüphaneleri

**Seçilen Çözüm**: Shadcn/UI (headless komponentler) + özel tema

**Seçim Nedeni**: Shadcn/UI, yüksek kaliteli, erişilebilir ve esnek UI komponentleri sunar, ancak bir kütüphane yerine bir koleksiyon olarak çalışır.

**Avantajlar**:
- Özelleştirilebilir ve bakımı kolay
- Erişilebilirlik odaklı
- Minimal bağımlılıklar
- Tailwind CSS ile mükemmel entegrasyon
- Doğrudan projeye dahil edilmiş kaynak kodlar

**Uygulama Örneği**:

```tsx
// components/StudentForm.tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  studentNumber: z.string().min(5).max(20),
  email: z.string().email(),
  parentEmail: z.string().email().optional(),
});

export function StudentForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      studentNumber: "",
      email: "",
      parentEmail: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Form verilerini API'ye gönder
    toast({
      title: "Öğrenci kaydedildi",
      description: `${values.name} başarıyla kaydedildi.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input placeholder="Ad Soyad" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Diğer form alanları */}
        <Button type="submit">Kaydet</Button>
      </form>
    </Form>
  );
}
```

## Backend Teknolojileri

### Supabase

**Seçim Nedeni**: Supabase, PostgreSQL üzerine kurulu açık kaynak bir Backend-as-a-Service (BaaS) çözümüdür ve kullanımı kolay API'ler sunar.

**Avantajlar**:
- PostgreSQL temelli güçlü veritabanı
- Gerçek zamanlı veritabanı dinleme
- Yerleşik kimlik doğrulama
- Row Level Security (RLS) ile güvenlik
- Storage çözümü
- Edge Functions
- Açık kaynak ve self-hosting seçeneği

**Alternatifler Değerlendirmesi**:
- **Firebase**: Daha olgun bir çözüm olmasına rağmen, PostgreSQL'in güçlü ilişkisel modeli ve esnekliği Supabase'i öne çıkarır
- **Appwrite**: Benzer özellikler sunmasına rağmen, Supabase'in PostgreSQL kullanımı ve daha olgun RLS çözümleri avantaj sağlar
- **Özel Backend**: Daha fazla kontrol sunmasına rağmen, geliştirme süresi ve maliyet açısından Supabase daha avantajlıdır

**Uygulama Örneği**:

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// Client tarafı
export const createClientSideSupabaseClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server tarafı (güçlü yetkilere sahip)
export const createServerSupabaseClient = () => {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      }
    }
  );
};

// Tenant-aware Supabase client
export const createTenantAwareClient = (tenantId: string) => {
  const client = createClientSideSupabaseClient();
  
  // Set tenant ID in Supabase connection
  client.rpc('set_tenant_id', { tenant_id: tenantId });
  
  return client;
};
```

```typescript
// hooks/use-tenant-data.ts
import { useEffect, useState } from 'react';
import { createTenantAwareClient } from '@/lib/supabase';
import { useTenant } from '@/hooks/use-tenant';

export function useStudents(classId?: string) {
  const { tenant } = useTenant();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenant || !tenant.id) return;
    
    const loadStudents = async () => {
      setLoading(true);
      
      try {
        const supabase = createTenantAwareClient(tenant.id);
        
        let query = supabase
          .from('students')
          .select('*');
          
        if (classId) {
          query = query.eq('class_id', classId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setStudents(data || []);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    
    loadStudents();
  }, [tenant, classId]);
  
  return { students, loading, error };
}
```

## Veritabanı ve Cache

### PostgreSQL
**Seçim Nedeni**: PostgreSQL, güvenilirliği, esnekliği ve güçlü özellikleri ile enterprise uygulamalar için ideal bir ilişkisel veritabanı sistemidir.

## Harici Servisler ve API'ler

### Domain ve DNS Yönetimi
- **Cloudflare API**: DNS kayıtları ve özel domain yönetimi
  - Subdomain otomatik oluşturma
  - Özel domain doğrulama
  - SSL sertifikası yönetimi

### Email Servisi

## Paketler ve Kütüphaneler

### API ve Entegrasyon
- **cloudflare**: Cloudflare API ile iletişim kurmak için resmi Cloudflare istemcisi
- **axios**: HTTP istekleri için kullanılan istemci
- **zod**: Veri doğrulama kütüphanesi
