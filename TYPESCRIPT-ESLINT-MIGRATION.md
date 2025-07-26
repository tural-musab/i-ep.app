# TypeScript ve ESLint Migration Guide

## 🚨 Build Artık Fail Olacak!

TypeScript ve ESLint bypass'ları kaldırıldığı için muhtemelen ilk build'de hatalar alacaksınız. İşte hızlı çözüm rehberi:

## 1. TypeScript Hataları

### `any` Tip Hataları
```typescript
// ❌ Eski
const handleData = (data: any) => { ... }

// ✅ Yeni
const handleData = (data: unknown) => { 
  // Type guard kullan
  if (typeof data === 'object' && data !== null) {
    // ...
  }
}

// Veya spesifik tip tanımla
interface DataType {
  id: string;
  name: string;
}
const handleData = (data: DataType) => { ... }
```

### Implicit Any Hataları
```typescript
// ❌ Eski
const fetchData = async (url) => { ... }

// ✅ Yeni
const fetchData = async (url: string): Promise<Response> => { ... }
```

### Null/Undefined Kontrolleri
```typescript
// ❌ Eski
if (user.email) { ... }

// ✅ Yeni
if (user?.email) { ... }
// veya
if (user && user.email) { ... }
```

## 2. ESLint Hataları

### Import Sıralama
```typescript
// ❌ Eski (karışık sıralama)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { supabase } from '@/lib/supabase/client';

// ✅ Yeni (düzenli sıralama)
import React from 'react';
import { useState } from 'react';

import { supabase } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
```

### Async/Await Hataları
```typescript
// ❌ Eski (floating promise)
fetchData();

// ✅ Yeni
await fetchData();
// veya
void fetchData();
// veya
fetchData().catch(console.error);
```

### Console.log Kullanımı
```typescript
// ❌ Eski
console.log('debug', data);

// ✅ Yeni (development only)
if (process.env.NODE_ENV === 'development') {
  console.log('debug', data);
}

// Veya daha iyisi, bir logger kullan
import { logger } from '@/lib/logger';
logger.debug('debug', data);
```

## 3. Hızlı Düzeltme Script'i

Proje kökünde çalıştırın:

```bash
# Tüm ESLint hatalarını otomatik düzelt
npm run lint:fix

# TypeScript hatalarını göster
npx tsc --noEmit

# Sadece belirli bir klasörü kontrol et
npx tsc --noEmit src/app/**/*.ts
```

## 4. Geçici Çözümler (Önerilmez!)

Eğer acil bir deployment gerekiyorsa:

### Belirli Dosyaları Hariç Tutma
```typescript
// @ts-nocheck  // Tüm dosyayı TypeScript kontrolünden çıkar
// eslint-disable // Tüm dosyayı ESLint kontrolünden çıkar
```

### Tek Satır İçin
```typescript
// @ts-ignore // Sadece sonraki satır için
// eslint-disable-next-line
```

## 5. Build Öncesi Kontrol

```bash
# Build'den önce kontrol et
npm run lint && npx tsc --noEmit

# Başarılıysa build et
npm run build
```

## 6. CI/CD Pipeline Güncellemesi

GitHub Actions veya diğer CI/CD araçlarınızda:

```yaml
- name: Type Check
  run: npx tsc --noEmit

- name: Lint Check
  run: npm run lint

- name: Test
  run: npm run test:ci

- name: Build
  run: npm run build
```

## 7. VS Code Ayarları

`.vscode/settings.json`:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

---

**Not:** Bu değişiklikler kod kalitesini artıracak ve production'da hata riskini azaltacaktır. İlk başta zor gelebilir ama uzun vadede büyük fayda sağlayacaktır.
