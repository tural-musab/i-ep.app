# Maarif Okul Portalı Kod Stil Rehberi

Bu rehber, Maarif Okul Portalı SaaS projesi için kod yazım standartlarını tanımlar. Tutarlı bir kod stili sürdürmek, kod okunabilirliğini artırır ve bakımı kolaylaştırır.

## Genel Prensipler

- **Temizlik ve Okunabilirlik**: Kod, açık, anlaşılır ve iyi yapılandırılmış olmalıdır.
- **Tutarlılık**: Belirlenen stil kuralları projenin tamamında tutarlı bir şekilde uygulanmalıdır.
- **Bakım Kolaylığı**: Kod, gelecekteki geliştiriciler tarafından kolayca anlaşılabilir ve değiştirilebilir olmalıdır.
- **Performans**: Gereksiz render'ları ve hesaplamaları önlemek için optimizasyon teknikleri kullanılmalıdır.

## TypeScript

### Tipler ve Interfaces

- Tüm fonksiyon parametreleri ve dönüş değerleri için tipleri belirtin.
- Interface isimleri için PascalCase kullanın.
- İlgili interface'leri ve tipleri kendi dosyalarında (`types` klasöründe) tanımlayın.

```typescript
// Yanlış
const getUser = (id) => {
  // ...
}

// Doğru
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = (id: string): Promise<User | null> => {
  // ...
};
```

### const ve let Kullanımı

- Değişmez değerler için `const` kullanın.
- Sadece değeri değişecek değişkenler için `let` kullanın.
- `var` kullanmaktan kaçının.

```typescript
// Yanlış
var user = 'admin';
let constant = 5;

// Doğru
const user = 'admin';
let counter = 5;
```

## React ve JSX

### Bileşenler

- Bileşen adları için PascalCase kullanın.
- Fonksiyonel bileşenler ve ok işaretli fonksiyonları tercih edin.
- Prop'ları tip güvenli hale getirmek için TypeScript interface'lerini kullanın.

```tsx
// Yanlış
function userCard(props) {
  return <div>{props.name}</div>;
}

// Doğru
interface UserCardProps {
  name: string;
  role?: string;
}

const UserCard: React.FC<UserCardProps> = ({ name, role }) => {
  return (
    <div>
      <h2>{name}</h2>
      {role && <p>Rol: {role}</p>}
    </div>
  );
};
```

### JSX Formatting

- Birden fazla satırlık JSX için parantezler kullanın.
- Tek satırlık JSX ifadeleri aynı satırda tutabilirsiniz.
- Çok sayıda props için her bir prop'u ayrı bir satıra yerleştirin.

```tsx
// Tek satır
return <Button onClick={handleClick}>Tıkla</Button>;

// Çoklu satır
return (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

// Çoklu props
return (
  <Button
    variant="primary"
    size="large"
    onClick={handleClick}
    disabled={isLoading}
  >
    Kaydet
  </Button>
);
```

## Dosya Yapısı ve İsimlendirme

### Dosya Organizasyonu

- Bileşenler ve ilgili dosyaları `/components` klasöründe tutun.
- Yardımcı fonksiyonları `/lib` veya `/utils` içerisinde gruplayın.
- Tipler için `/types` klasörünü kullanın.
- API routes için `/app/api` dizinini kullanın.

### Dosya İsimlendirme

- Bileşen dosyaları için PascalCase kullanın (örn. `Button.tsx`).
- Yardımcı fonksiyon dosyaları için kebab-case kullanın (örn. `date-utils.ts`).
- Sayfa dosyaları için `page.tsx` adlandırmasını kullanın.
- Test dosyaları için `.test.ts` veya `.test.tsx` son ekini kullanın.

## Stil ve CSS

- Tailwind CSS sınıflarını tercih edin.
- Özel renkler ve değişkenler için Tailwind config kullanın.
- Mantıksal grup sınıflarını tutarlı bir şekilde sıralayın (örn. önce layout, sonra görünüm).

```tsx
// Tailwind sınıf sıralaması örneği
<div className="
  // Layout
  flex flex-col items-center justify-between
  // Boyut ve boşluk
  w-full max-w-md p-4 my-6
  // Görünüm (renkler, kenarlar vb.)
  bg-white rounded-lg shadow-md
  // Durum (hover, focus vb.)
  hover:shadow-lg focus:outline-none
">
  {/* İçerik */}
</div>
```

## Yorum Yazma

- Karmaşık işlevler ve algoritmalar için yorumlar ekleyin.
- JSDoc stili yorumları fonksiyonlar için kullanın.
- TODO yorumlarını, bir etiket veya konu numarasıyla bağlantılı olarak kullanın.

```typescript
/**
 * Belirli bir tenant için kullanıcıları getirir
 * @param tenantId - Tenant (okul) kimliği
 * @param options - Sayfalama ve filtreleme seçenekleri
 * @returns Kullanıcı listesi ve meta verileri
 */
const getUsersByTenant = async (
  tenantId: string,
  options: UserQueryOptions
): Promise<UserListResponse> => {
  // TODO: #123 Gelişmiş rol filtresi ekle
  ...
};
```

## Hata İşleme

- Hataları yakalamak için try/catch blokları kullanın.
- Async/await kullanırken hata işleme yapmayı unutmayın.
- API yanıtlarında uygun hata kodları ve mesajları döndürün.

```typescript
// Doğru hata işleme
try {
  const response = await api.updateUser(userId, userData);
  return response.data;
} catch (error) {
  if (error.status === 404) {
    toast.error('Kullanıcı bulunamadı');
  } else {
    toast.error('Kullanıcı güncellenirken bir hata oluştu');
    console.error('Kullanıcı güncelleme hatası:', error);
  }
  throw error;
}
```

## Linting ve Formatting

Projede aşağıdaki linting ve formatlama araçları kullanılmaktadır:

- **ESLint**: Kod kalitesi ve stil kontrolü için
- **Prettier**: Otomatik kod formatlaması için

VS Code kullanıcıları, projenin kök dizinindeki `.vscode` klasöründeki önerilen uzantıları ve ayarları kullanmalıdır.

## Git Commit Mesajları

Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) standardını izleyin:

```
<type>(scope): <description>

[optional body]

[optional footer]
```

Tip örnekleri:
- feat: Yeni bir özellik
- fix: Hata düzeltmesi
- docs: Dokümantasyon değişiklikleri
- style: Kod stili değişiklikleri
- refactor: Kod yeniden düzenlemesi
- test: Test ekleme veya düzeltme
- chore: Derleme süreci veya yardımcı araç değişiklikleri

Örnek:
```
feat(auth): kullanıcı kaydı için e-posta doğrulama ekle

E-posta doğrulama akışı, Supabase Auth ile entegre edildi.
Kullanıcı kaydı sonrası otomatik doğrulama e-postası gönderiliyor.

Resolves: #123
``` 