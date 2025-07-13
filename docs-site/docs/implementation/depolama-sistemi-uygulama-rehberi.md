# Depolama Sistemi Uygulama Rehberi

## 🎯 Genel Bakış

Bu rehber, i-ep.app için Supabase Storage ile başlayıp gerektiğinde Cloudflare R2'ye sorunsuz geçiş yapabilen esnek bir depolama sistemi uygulamanıza yardımcı olur.

## 📁 Dosya Yapısı

```
src/lib/storage/
├── index.ts                 # Ana depolama servisi
├── providers/
│   ├── supabase.provider.ts # Supabase implementasyonu
│   └── cloudflare-r2.provider.ts # R2 implementasyonu (gelecek)
├── utils/
│   ├── index.ts            # Yardımcı fonksiyonlar
│   ├── path-generator.ts   # Yol oluşturma mantığı
│   ├── file-validator.ts   # Dosya doğrulama
│   └── format.ts           # Formatlama yardımcıları
└── repository/
    └── storage.repository.ts # Veritabanı işlemleri

src/types/
└── storage.ts              # TypeScript tip tanımları
```

## 🚀 Uygulama Adımları

### Adım 1: Migrasyon Çalıştırma

```bash
# Migrasyon dosyasını supabase/migrations klasörüne kopyala
cp 20250114000000_create_storage_system.sql supabase/migrations/

# Migrasyonu çalıştır
npx supabase db push
```

### Adım 2: Supabase Tiplerini Güncelle

```bash
# Veritabanından TypeScript tipleri oluştur
npx supabase gen types typescript --local > src/types/supabase.ts
```

### Adım 3: Depolama Dizinlerini Oluştur

```bash
# Depolama dizin yapısını oluştur
mkdir -p src/lib/storage/providers
mkdir -p src/lib/storage/utils
mkdir -p src/lib/storage/repository
```

### Adım 4: Depolama Servisini Uygula

Sağlanan dosyaları ilgili konumlara kopyala:
- `src/types/storage.ts` - Tip tanımları
- `src/lib/storage/index.ts` - Ana servis
- `src/lib/storage/providers/supabase.provider.ts` - Supabase sağlayıcı
- `src/lib/storage/utils/index.ts` - Yardımcı fonksiyonlar

### Adım 5: Supabase'de Depolama Bucket'ı Oluştur

1. Supabase dashboard'unuza git
2. Storage bölümüne gidin
3. `files` adında yeni bucket oluşturun
4. **Private** olarak ayarlayın (erişimi API üzerinden yöneteceğiz)

### Adım 6: Ortam Değişkenlerini Güncelle

```env
# .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=supabase
NEXT_PUBLIC_USE_R2=false
NEXT_PUBLIC_ROUTE_LARGE_FILES=false
```

## 📝 Kullanım Örnekleri

### Temel Dosya Yükleme

```typescript
import { storage } from '@/lib/storage';

// React komponeninde
const handleFileUpload = async (file: File) => {
  try {
    const result = await storage.upload(file, null, {
      folder: '/documents',
      access_level: 'tenant',
      metadata: {
        description: 'Kullanıcı tarafından yüklenen döküman',
      },
    });
    
    console.log('Dosya yüklendi:', result.file);
    console.log('Genel URL:', result.url);
  } catch (error) {
    console.error('Yükleme başarısız:', error);
  }
};
```

### Dosya İndirme

```typescript
const handleDownload = async (fileId: string) => {
  try {
    const blob = await storage.download(fileId);
    
    // İndirme linki oluştur
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dosya.pdf';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('İndirme başarısız:', error);
  }
};
```

### İmzalı URL Al

```typescript
const getTemporaryLink = async (fileId: string) => {
  try {
    // 1 saat geçerli URL
    const url = await storage.getSignedUrl(fileId, 3600);
    return url;
  } catch (error) {
    console.error('İmzalı URL alma başarısız:', error);
  }
};
```

## 🔄 Cloudflare R2'ye Geçiş

R2'ye geçiş yapmaya hazır olduğunuzda:

### 1. R2 Sağlayıcısı Oluştur

```typescript
// src/lib/storage/providers/cloudflare-r2.provider.ts
export class CloudflareR2Provider implements IStorageProvider {
  // Uygulama detayları
}
```

### 2. Ortam Değişkenlerini Güncelle

```env
NEXT_PUBLIC_STORAGE_PROVIDER=r2
NEXT_PUBLIC_USE_R2=true
NEXT_PUBLIC_ROUTE_LARGE_FILES=true

# R2 Yapılandırması
R2_ACCOUNT_ID=hesap-id-niz
R2_ACCESS_KEY_ID=erişim-anahtarınız
R2_SECRET_ACCESS_KEY=gizli-anahtarınız
R2_BUCKET_NAME=i-ep-files
```

### 3. Hibrit Modu Etkinleştir

Sistem otomatik olarak:
- >10MB dosyaları R2'ye yönlendirir
- Küçük dosyaları Supabase'de tutar
- Her şeyi veritabanında takip eder

### 4. Geçiş İşini Çalıştır

```typescript
// Mevcut dosyaları geçirmek için arka plan işi
async function migrateFilesToR2() {
  const files = await db.files.findMany({
    where: {
      storage_provider: 'supabase',
      size_bytes: { gt: 10 * 1024 * 1024 }, // >10MB
    },
  });
  
  for (const file of files) {
    await storage.migrateToR2(file.id);
  }
}
```

## 📊 Depolama Kullanımını İzleme

### Dashboard Komponenti Örneği

```typescript
const StorageUsageCard = () => {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  
  useEffect(() => {
    fetchStorageQuota().then(setQuota);
  }, []);
  
  if (!quota) return <Loading />;
  
  const usagePercent = (quota.used_storage_mb / quota.total_quota_mb) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Depolama Kullanımı</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={usagePercent} />
        <p className="text-sm text-muted-foreground mt-2">
          {formatFileSize(quota.used_storage_mb * 1024 * 1024)} / 
          {formatFileSize(quota.total_quota_mb * 1024 * 1024)}
        </p>
      </CardContent>
    </Card>
  );
};
```

## 🛡️ Güvenlik Konuları

1. **Dosya Doğrulama**: Yüklemeden önce her zaman dosyaları doğrula
2. **Erişim Kontrolü**: Tenant izolasyonunu zorlamak için RLS politikaları kullan
3. **İmzalı URL'ler**: Hassas dosyalar için zamanlı imzalı URL'ler kullan
4. **Virüs Tarama**: Yüklenen dosyalar için virüs tarama eklemeyi düşün

## 🎯 En İyi Uygulamalar

1. **Her zaman soyutlama katmanını kullan** - Supabase Storage'a doğrudan erişim yapma
2. **Dosya metadatalarını takip et** - Tüm dosya bilgilerini veritabanında sakla
3. **Uygun erişim seviyelerini kullan** - Gerekmedikçe varsayılan olarak 'private' kullan
4. **Depolama kullanımını izle** - Kota limitleri için uyarılar kur
5. **Geçiş için plan yap** - Sağlayıcıya özel kodları izole tut

## 🚨 Yaygın Sorunlar

### Sorun: "Kota aşıldı" hatası ile dosya yükleme başarısız
**Çözüm**: Tenant'ın depolama kotasını kontrol et ve gerekirse artır

### Sorun: Yüklemeden sonra dosyalara erişilemiyor
**Çözüm**: RLS politikalarının doğru kurulduğundan emin ol

### Sorun: Büyük dosya yüklemeleri zaman aşımına uğruyor
**Çözüm**: Parçalı yükleme uygula veya doğrudan tarayıcı yüklemesi kullan

## 🔮 Gelecek İyileştirmeler

1. **Görsel optimizasyonu** - Otomatik küçük resim oluşturma
2. **Video işleme** - Web oynatma için video dönüştürme
3. **Tam metin arama** - Dökümanlar içinde arama
4. **Sürüm kontrolü** - Dosya geçmişini tut
5. **İş birliği** - Gerçek zamanlı işbirlikçi düzenleme

## 📚 İlgili Dokümantasyon

- [Supabase Storage Rehberi](https://supabase.com/docs/guides/storage)
- [Cloudflare R2 Dokümantasyonu](https://developers.cloudflare.com/r2/)
- [Next.js Dosya Yüklemeleri](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#file-uploads)