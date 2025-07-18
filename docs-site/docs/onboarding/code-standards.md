# Kod Standartları

Bu doküman, İ-EP.APP projesinde uyulması gereken kod standartlarını, yazım kurallarını ve Pull Request sürecini açıklamaktadır.

## Yazım Kuralları

İ-EP.APP projesinde tutarlı bir kod tabanı oluşturmak için aşağıdaki yazım kurallarına uyunuz:

### Genel Kurallar

- **Dil**: Kod içindeki değişken isimleri, yorum satırları vb. **İngilizce** olmalıdır
- **Tutarlılık**: Mevcut kod tabanındaki stilleri ve kalıpları takip edin
- **Anlamlı İsimlendirme**: Değişken, fonksiyon ve sınıf isimleri anlaşılır ve açıklayıcı olmalıdır
- **Yorum Yazma**: Karmaşık iş mantığı için açıklayıcı yorumlar ekleyin

### TypeScript Kuralları

- **Tip Kullanımı**: `any` tipinden kaçının, mümkün olduğunca spesifik tipler kullanın
- **Tip Tanımları**: Ortak tip tanımlarını `types/` dizininde tutun
- **Null Check**: Nullable değerler için `null` yerine `undefined` kullanın
- **Optional Chaining**: Null kontrolü için `?.` ve `??` operatörlerini kullanın
- **Type Guards**: Tip güvenliği için tip koruyucuları (type guards) kullanın

```typescript
// İyi örnek
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  schoolId?: string; // Opsiyonel alan
}

// Tip koruması örneği
function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

// Kötü örnek
interface BadExample {
  data: any; // any kullanımından kaçının
  ID: string; // tutarsız isimlendirme (id kullanılmalı)
  e_mail: string; // tutarsız isimlendirme (email kullanılmalı)
}
```

### React ve Next.js Kuralları

- **Fonksiyonel Komponentler**: Sınıf komponentleri yerine fonksiyonel komponentler kullanın
- **Hooks**: React Hooks kurallarına uyun (en üst seviyede çağrılmalı, koşullu çağrılmamalı)
- **App Router**: Next.js 14 App Router konvansiyonlarını takip edin
- **Server vs Client**: Server ve Client komponentlerini doğru şekilde ayırın
- **Prop Drilling**: Aşırı prop drilling'den kaçının, Context API veya state yönetimi kullanın

```tsx
// İyi örnek - Fonksiyonel komponent
import { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await onClick();
    setIsLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={isLoading} className="btn btn-primary">
      {isLoading ? 'Loading...' : label}
    </button>
  );
}
```

### CSS ve Styling Kuralları

- **Tailwind CSS**: Özel CSS yazmak yerine mümkün olduğunca Tailwind sınıflarını kullanın
- **Component Library**: UI komponentleri için `components/ui` dizinindeki Shadcn/UI bileşenlerini kullanın
- **Responsive Tasarım**: Tüm arayüzler responsive olmalıdır
- **Dark Mode**: Dark mode desteği için Tailwind'in dark: özelliğini kullanın
- **Tutarlı Aralıklar**: Tutarlı margin ve padding değerleri için Tailwind'in scale sistemini kullanın

```tsx
// İyi örnek - Tailwind CSS
function Card({ title, content }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-gray-700 dark:text-gray-300">{content}</p>
    </div>
  );
}

// Kötü örnek - Satır içi stil veya özel CSS
function BadCard({ title, content }) {
  return (
    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: '#333' }}>{content}</p>
    </div>
  );
}
```

### API ve Veri İşleme Kuralları

- **API Route'ları**: Next.js API route'larını `app/api` dizini altında tutun
- **Hata İşleme**: Tüm API çağrılarında uygun hata işleme mekanizması kullanın
- **Doğrulama**: Gelen verileri Zod şemaları ile doğrulayın
- **Tenant İzolasyonu**: Her API işleminde tenant ID kontrolü yapın
- **Asenkron İşlemler**: `async/await` kullanın, Promise chain'lerden kaçının

```typescript
// İyi örnek - API Route
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentTenant } from '@/lib/tenant-server';

// Doğrulama şeması
const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'student', 'parent']),
});

export async function POST(req: NextRequest) {
  try {
    // Tenant kontrolü
    const tenant = await getCurrentTenant();
    if (!tenant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // İstek gövdesini doğrula
    const body = await req.json();
    const result = userSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: result.error.format() },
        { status: 400 }
      );
    }

    // Veri işleme...
    const user = result.data;
    const createdUser = await createUser(user, tenant.id);

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

## Code Lint ve Format

Proje, kod kalitesini ve tutarlılığını sağlamak için ESLint ve Prettier kullanmaktadır.

### ESLint

ESLint, kodu statik olarak analiz ederek potansiyel hataları ve kod stili sorunlarını tespit eder.

```bash
# Lint kontrolü yapma
npm run lint

# Otomatik düzeltme
npm run lint:fix
```

### Prettier

Prettier, kodu belirli bir formata göre düzenleyen bir kod formatlayıcısıdır.

```bash
# Kod formatını kontrol etme
npm run format:check

# Kodu formatlama
npm run format
```

> **Not**: IDE'nize Prettier ve ESLint eklentilerini kurmanız ve dosyayı kaydettiğinizde otomatik formatlama yapacak şekilde yapılandırmanız önerilir.

## Pull Request (PR) Süreci

### PR Oluşturma

1. Yeni bir özellik veya düzeltme için branch oluşturun:

   ```bash
   git checkout -b feature/add-user-management
   # veya
   git checkout -b fix/login-issue
   ```

2. Değişikliklerinizi yapın ve commit'leyin:

   ```bash
   git add .
   git commit -m "feat: Add user management interface"
   ```

3. Branch'inizi push edin:

   ```bash
   git push origin feature/add-user-management
   ```

4. GitHub'da bir Pull Request oluşturun
5. PR açıklamasında değişiklikleri detaylı bir şekilde açıklayın

### PR İnceleme Kriterleri

Tüm PR'lar merge edilmeden önce şu kriterleri karşılamalıdır:

1. **CI Kontrolleri**: Tüm otomatik kontroller (lint, test, build) başarılı olmalı
2. **Test Kapsamı**: Uygun unit ve integration testleri yazılmış olmalı
3. **Kod Kalitesi**: Yukarıdaki kod standartlarına uygun olmalı
4. **Kod İncelemesi**: En az bir ekip üyesinden onay almalı
5. **Çakışma Kontrolü**: main branch ile çakışma olmamalı
6. **Dokümantasyon**: Gerekli dokümantasyon eklenmiş olmalı

### Commit Mesajları

Projedeki commit mesajları Conventional Commits formatını takip etmelidir:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Örnek:

```
feat(auth): Add multi-factor authentication
fix(tenant): Fix subdomain resolution issue
docs(readme): Update setup instructions
refactor(api): Simplify error handling logic
```

Tip türleri:

- `feat`: Yeni özellik
- `fix`: Hata düzeltme
- `docs`: Sadece dokümantasyon değişiklikleri
- `style`: Kod davranışını etkilemeyen değişiklikler (formatlama vb.)
- `refactor`: Hata düzeltme veya özellik ekleme olmayan kod değişiklikleri
- `test`: Test eklemek veya düzeltmek
- `chore`: Yapılandırma, bağımlılık yönetimi vb.

## Test Yazma Gereksinimleri

### Test Yaklaşımı

İ-EP.APP projesi için test yazarken aşağıdaki yaklaşımları benimseyiniz:

1. **Birim Testleri**: İzole edilmiş fonksiyonlar ve utilities için
2. **Komponent Testleri**: UI komponentlerinin davranışlarını test etmek için
3. **Entegrasyon Testleri**: Komponentlerin ve servislerin birlikte çalışmasını test etmek için
4. **E2E Testleri**: Kritik kullanıcı senaryoları için uçtan uca testler

### Jest ve Testing Library

Testler için Jest ve React Testing Library kullanılmaktadır:

```tsx
// Button komponenti için test örneği
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('renders button with correct label', () => {
    render(<Button label="Submit" onClick={jest.fn()} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Submit" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Submit'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state when clicked', async () => {
    const handleClick = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => setTimeout(resolve, 100));
    });

    render(<Button label="Submit" onClick={handleClick} />);

    fireEvent.click(screen.getByText('Submit'));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Test Organizasyonu

- `__tests__/`: Unit ve integration testleri
- `__e2e__/`: End-to-end testleri
- `test-utils/`: Test yardımcı fonksiyonları
- `mocks/`: Mock veriler ve servisler

## Kod Gözden Geçirme Kriterleri

Kod gözden geçirme (code review) sırasında aşağıdaki kriterler değerlendirilir:

1. **İşlevsellik**: Kod, istenen işlevselliği doğru bir şekilde gerçekleştiriyor mu?
2. **Performans**: Kod, performans açısından optimize edilmiş mi?
3. **Güvenlik**: Kod, güvenlik açıklarına karşı önlem alıyor mu?
4. **Okunabilirlik**: Kod, açık ve anlaşılır mı?
5. **Bakım Yapılabilirlik**: Kod, gelecekte kolayca değiştirilebilir ve genişletilebilir mi?
6. **Test Edilebilirlik**: Kod, uygun şekilde test edilmiş mi?
7. **Dokümantasyon**: Kod, gerekli yerlerde açıklayıcı yorumlar içeriyor mu?
8. **Tenant İzolasyonu**: Kod, tenant izolasyon prensiplerine uyuyor mu?

## Kaynak Yönetimi

### Bağımlılık Yönetimi

- Yeni bağımlılık eklerken, ekibin onayını alın
- Mümkünse hafif ve az bağımlılık olan kütüphaneler tercih edin
- Tüm bağımlılıklar için sabit sürüm numarası kullanın
- Güvenlik açıkları için bağımlılıkları düzenli olarak kontrol edin

```bash
# Bağımlılık ekleme
npm install --save package-name@1.2.3

# Geliştirme bağımlılığı ekleme
npm install --save-dev package-name@1.2.3
```

### Dış Kaynak Kullanımı

- Üçüncü parti servislere erişim için servis katmanı kullanın
- API anahtarları ve secretları çevre değişkenlerinde saklayın
- Rate limiting ve retry mekanizmaları ekleyin
- Timeout ve hata yönetimi ekleyin

## İlgili Dokümanlar

- [ESLint Konfigürasyonu](../../.eslintrc.json)
- [Prettier Konfigürasyonu](../../.prettierrc)
- [Jest Konfigürasyonu](../../jest.config.js)
- [TypeScript Konfigürasyonu](../../tsconfig.json)

---

Bu standartlara uyarak, İ-EP.APP projesinin kod tabanının tutarlı, bakımı kolay ve kaliteli olmasına katkıda bulunabilirsiniz.
