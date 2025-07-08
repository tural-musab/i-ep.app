# Rol Tabanlı Erişim Kontrolü (RBAC) Sistemi

Bu dokümantasyon, Iqra Eğitim Portalı için geliştirilen Role-Based Access Control (RBAC) sisteminin yapısını, kullanımını ve uygulanmasını detaylandırmaktadır.

## Genel Bakış

RBAC sistemi, uygulamaya erişen kullanıcıların rollerine (admin, öğretmen, öğrenci, veli, misafir) göre belirli sayfalara ve işlevlere erişimini kontrol etmek için uygulanmıştır. Bu sistem, Supabase Auth ile entegre çalışarak çok kiracılı (multi-tenant) bir yapıyı destekler.

## Bileşenler

RBAC sisteminin ana bileşenleri şunlardır:

### 1. Kullanıcı Rolleri (UserRole)

`src/types/auth.ts` dosyasında tanımlanan kullanıcı rolleri:

```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  GUEST = 'guest'
}
```

### 2. İzinler ve Kaynaklar

`src/lib/auth/permissions.ts` dosyasında tanımlanan kaynak tipleri ve aksiyon tipleri:

```typescript
export enum ResourceType {
  TENANT = 'tenant',
  USER = 'user',
  STUDENT = 'student',
  TEACHER = 'teacher',
  COURSE = 'course',
  LESSON = 'lesson',
  ATTENDANCE = 'attendance',
  GRADE = 'grade',
  PAYMENT = 'payment',
  REPORT = 'report'
}

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import',
  ASSIGN = 'assign'
}
```

İzinler, kullanıcı rolü, kaynak tipi ve aksiyon tipini içeren bir dizi sabit olarak tanımlanır:

```typescript
export const PERMISSIONS: Permission[] = [
  // Admin izinleri
  { role: UserRole.ADMIN, resource: ResourceType.TENANT, action: ActionType.MANAGE },
  { role: UserRole.ADMIN, resource: ResourceType.USER, action: ActionType.MANAGE },
  // ... diğer izinler
]
```

### 3. Kimlik Doğrulama Bağlamı (AuthContext)

`src/lib/auth/auth-context.tsx` dosyasında tanımlanan AuthContext, kullanıcı kimlik doğrulama durumunu ve ilgili işlevleri tüm uygulama için erişilebilir kılar:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentTenantId: string | null;
  
  // Auth işlemleri
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  
  // Yetki kontrolleri
  hasPermission: (resource: ResourceType, action: ActionType) => boolean;
  isTenantUser: (tenantId: string) => boolean;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isParent: () => boolean;
}
```

### 4. Rol ve İzin Koruyucuları

`src/components/auth/role-guard.tsx` dosyasında tanımlanan koruyucu bileşenler, sayfalara ve bileşenlere erişimi kontrol eder:

```typescript
// Genel RoleGuard bileşeni
export function RoleGuard({ children, allowedRoles, requiredPermission, fallback, redirectTo, tenantRequired = false }: RoleGuardProps) {
  // ...
}

// Özel rol koruyucuları
export function AdminGuard({ children, fallback, redirectTo }: Omit<RoleGuardProps, 'allowedRoles'>) {
  // ...
}

export function TeacherGuard({ children, fallback, redirectTo }: Omit<RoleGuardProps, 'allowedRoles'>) {
  // ...
}

export function StudentGuard({ children, fallback, redirectTo }: Omit<RoleGuardProps, 'allowedRoles'>) {
  // ...
}

export function ParentGuard({ children, fallback, redirectTo }: Omit<RoleGuardProps, 'allowedRoles'>) {
  // ...
}
```

## Kullanım Örnekleri

### Sayfa Erişimini Koruma

```tsx
// Admin erişimine kısıtlanmış sayfa
export default function AdminPage() {
  return (
    <AdminGuard 
      fallback={<AccessDenied />} 
      redirectTo="/auth/giris"
    >
      <AdminPageContent />
    </AdminGuard>
  );
}

// Öğrenci erişimine kısıtlanmış sayfa
export default function StudentPage() {
  return (
    <StudentGuard 
      fallback={<AccessDenied title="Öğrenci Girişi Gerekli" message="..." />} 
      redirectTo="/auth/giris"
    >
      <StudentPageContent />
    </StudentGuard>
  );
}
```

### Bileşenlerde İzin Kontrolü

```tsx
// İzin tabanlı UI görünürlüğü
function DashboardActions() {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission(ResourceType.TENANT, ActionType.CREATE) && (
        <button>Yeni Tenant Oluştur</button>
      )}
      
      {hasPermission(ResourceType.REPORT, ActionType.EXPORT) && (
        <button>Rapor İndir</button>
      )}
    </div>
  );
}
```

### Rol Tabanlı UI Görünürlüğü

```tsx
function UserMenu() {
  const { isAdmin, isTeacher, isStudent, isParent } = useAuth();
  
  return (
    <nav>
      {isAdmin() && <Link href="/admin">Yönetici Paneli</Link>}
      {isTeacher() && <Link href="/dersler">Derslerim</Link>}
      {isStudent() && <Link href="/odevler">Ödevlerim</Link>}
      {isParent() && <Link href="/cocuklarim">Çocuklarım</Link>}
    </nav>
  );
}
```

## İzinlerin Genişletilmesi

Yeni kaynak veya aksiyon türleri eklerken aşağıdaki adımlar izlenmelidir:

1. `ResourceType` veya `ActionType` enum'larını genişletin
2. Yeni izinleri `PERMISSIONS` dizisine ekleyin
3. İhtiyaç duyulursa özel izin kontrol fonksiyonları ekleyin

## Güvenlik Hususları

- Rol kontrolünün hem client-side hem de server-side yapılması gerekir.
- API erişimi için middleware veya API route handler'larında izin kontrolü ekleyin.
- Hiçbir zaman yalnızca UI kısıtlamalarına güvenmeyin; bu bir güvenlik katmanı değil, bir UX katmanıdır.

## Performans İyileştirmeleri

- İzin kontrolleri için önbelleğe alma stratejileri kullanın
- Çok sık tekrar eden izin kontrollerini optimize edin

## Gelecek İyileştirmeler

Rol tabanlı erişim kontrol sistemi için planlanan iyileştirmeler:

1. Daha detaylı, hiyerarşik izin yapısı
2. Rol atamaları için admin arayüzü
3. Özel izin grupları ve dinamik izin yönetimi
4. İzin temelli API rate limiting
5. Geçici süreyle yetki yükseltme mekanizması 