# Integration Tests Quarantine

Bu klasör, module path sorunları olan integration testlerini geçici olarak barındırır.

## Quarantine Edilen Testler

Bu testler aşağıdaki nedenlerle quarantine edildi:

1. **Missing Module Paths**: `@/lib/supabase/client`, `@/lib/supabase/admin`, `@/env` gibi modüller bulunamıyor
2. **Deprecated API Usage**: Eski API pattern'ları kullanıyor
3. **Broken Dependencies**: Mevcut olmayan service'leri import ediyor

## Nasıl Tamir Edilir

### 1. Module Path Sorunları
```typescript
// ❌ Broken
import { supabase } from '@/lib/supabase/client';

// ✅ Fixed
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### 2. Environment Variables
```typescript
// ❌ Broken
import { env } from '@/env';

// ✅ Fixed
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
};
```

### 3. API Imports
```typescript
// ❌ Broken
import { fetchUsers } from '@/lib/api/users';

// ✅ Fixed - Test API directly
const response = await fetch('/api/users');
const users = await response.json();
```

## Geri Aktarma Süreci

1. Test dosyasını quarantine'den ana klasöre taşı
2. Module import'larını düzelt
3. Real database connection pattern'ını kullan
4. `npm run test:integration` ile doğrula

## Aktif Integration Tests

Şu anda çalışan integration testler:
- `database-connection.integration.test.ts` - Supabase connection
- `redis-connection.integration.test.ts` - Redis connection

Yeni testler bu pattern'ları takip etmeli.