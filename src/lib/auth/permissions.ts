import { User, UserRole } from '@/types/auth';

// Yetki seviyeleri - UserRole'ü yeniden kullanıyoruz
export { UserRole as PermissionLevel };

// Kaynak türleri
export enum ResourceType {
  TENANT = 'tenant',
  STUDENT = 'student',
  TEACHER = 'teacher',
  CLASS = 'class',
  COURSE = 'course',
  GRADE = 'grade',
  ATTENDANCE = 'attendance',
  REPORT = 'report',
  SETTINGS = 'settings',
  USER = 'user'
}

// Eylem türleri
export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import'
}

// Yetki kontrolü yapısı
export interface Permission {
  resource: ResourceType;
  action: ActionType;
  level: UserRole;
}

// Tüm yetkilerin listesi
export const PERMISSIONS: Permission[] = [
  // Tenant yetkileri
  { resource: ResourceType.TENANT, action: ActionType.MANAGE, level: UserRole.ADMIN },
  { resource: ResourceType.TENANT, action: ActionType.READ, level: UserRole.MANAGER },
  
  // Öğrenci yetkileri
  { resource: ResourceType.STUDENT, action: ActionType.CREATE, level: UserRole.ADMIN },
  { resource: ResourceType.STUDENT, action: ActionType.READ, level: UserRole.TEACHER },
  { resource: ResourceType.STUDENT, action: ActionType.UPDATE, level: UserRole.MANAGER },
  { resource: ResourceType.STUDENT, action: ActionType.DELETE, level: UserRole.ADMIN },
  
  // Öğretmen yetkileri
  { resource: ResourceType.TEACHER, action: ActionType.CREATE, level: UserRole.ADMIN },
  { resource: ResourceType.TEACHER, action: ActionType.READ, level: UserRole.MANAGER },
  { resource: ResourceType.TEACHER, action: ActionType.UPDATE, level: UserRole.ADMIN },
  { resource: ResourceType.TEACHER, action: ActionType.DELETE, level: UserRole.ADMIN },
  
  // Kullanıcı yetkileri
  { resource: ResourceType.USER, action: ActionType.CREATE, level: UserRole.ADMIN },
  { resource: ResourceType.USER, action: ActionType.READ, level: UserRole.MANAGER },
  { resource: ResourceType.USER, action: ActionType.UPDATE, level: UserRole.ADMIN },
  { resource: ResourceType.USER, action: ActionType.DELETE, level: UserRole.ADMIN },
  
  // Sınıf yetkileri
  { resource: ResourceType.CLASS, action: ActionType.CREATE, level: UserRole.MANAGER },
  { resource: ResourceType.CLASS, action: ActionType.READ, level: UserRole.TEACHER },
  { resource: ResourceType.CLASS, action: ActionType.UPDATE, level: UserRole.MANAGER },
  { resource: ResourceType.CLASS, action: ActionType.DELETE, level: UserRole.ADMIN },
  
  // Dışa aktarma yetkileri
  { resource: ResourceType.STUDENT, action: ActionType.EXPORT, level: UserRole.MANAGER },
  { resource: ResourceType.TEACHER, action: ActionType.EXPORT, level: UserRole.MANAGER },
  { resource: ResourceType.GRADE, action: ActionType.EXPORT, level: UserRole.MANAGER },
  { resource: ResourceType.TENANT, action: ActionType.EXPORT, level: UserRole.ADMIN }
];

/**
 * Kullanıcının belirli bir işlem için yetkisini kontrol eder
 * @param user Kontrol edilecek kullanıcı
 * @param resource Erişilmek istenen kaynak türü
 * @param action Yapılmak istenen eylem
 * @returns Yetkili ise true, değilse false
 */
export function hasPermission(
  user: User | null, 
  resource: ResourceType, 
  action: ActionType
): boolean {
  if (!user) return false;
  
  // Süper admin her zaman tüm yetkilere sahiptir
  if (user.role === UserRole.ADMIN) return true;
  
  // İzin verilen en düşük yetki seviyesini bul
  const permission = PERMISSIONS.find(p => 
    p.resource === resource && p.action === action
  );
  
  if (!permission) return false;
  
  // Yetki seviyelerinin hiyerarşisi
  const levels = [
    UserRole.GUEST,
    UserRole.STUDENT,
    UserRole.PARENT,
    UserRole.TEACHER,
    UserRole.MANAGER,
    UserRole.ADMIN
  ];
  
  const userLevelIndex = levels.indexOf(user.role);
  const requiredLevelIndex = levels.indexOf(permission.level);
  
  // Kullanıcının yetki seviyesi, gereken seviyeden yüksek veya eşitse izin ver
  return userLevelIndex >= requiredLevelIndex;
}

/**
 * Kullanıcının tenant ile ilgili yönetimsel yetkilerini kontrol eder
 */
export function canManageTenant(user: User | null): boolean {
  return hasPermission(user, ResourceType.TENANT, ActionType.MANAGE);
}

/**
 * Kullanıcının tenant verilerini dışa aktarma yetkisini kontrol eder
 */
export function canExportTenantData(user: User | null): boolean {
  return hasPermission(user, ResourceType.TENANT, ActionType.EXPORT);
}

/**
 * Kullanıcının öğrenci kaydı oluşturma yetkisini kontrol eder
 */
export function canCreateStudent(user: User | null): boolean {
  return hasPermission(user, ResourceType.STUDENT, ActionType.CREATE);
}

/**
 * Kullanıcının tenant'a erişim hakkını doğrular
 * @param userOrParams Kontrol edilecek kullanıcı veya parametre objesi
 * @param tenantIdParam Erişilmek istenen tenant ID'si (eğer ilk parametre obje değilse)
 * @returns Erişim varsa true, yoksa false
 */
export async function validateTenantAccess(
  userOrParams: any,
  tenantIdParam?: string
): Promise<boolean> {
  // Parametre formatını belirle
  let user: any = null;
  let tenantId: string = '';
  
  if (typeof userOrParams === 'object' && userOrParams !== null) {
    if ('userId' in userOrParams && 'tenantId' in userOrParams) {
      // Yeni format: { userId, tenantId }
      tenantId = userOrParams.tenantId;
      
      // userId'den user nesnesini getir
      // Bu örnekte sadece kullanıcı ID'si kontrol ediliyor
      // Gerçek uygulamada veritabanından kullanıcı bilgisi çekilebilir
      user = { id: userOrParams.userId, role: UserRole.ADMIN }; // Basitleştirilmiş örnek
    } else {
      // Supabase user nesnesi
      user = userOrParams;
      tenantId = tenantIdParam || '';
    }
  }
  
  // Kullanıcı yoksa erişim reddet
  if (!user) return false;
  
  // Admin her tenant'a erişebilir
  if (user.role === UserRole.ADMIN) return true;
  
  // Kullanıcı bu tenant'a atanmış mı kontrol et
  if (user.tenantId === tenantId) return true;
  
  // Yönetici rolü veya üstü olan kişilere çoklu tenant erişimi izni verilebilir
  if (user.role === UserRole.MANAGER && user.allowedTenants?.includes(tenantId)) {
    return true;
  }
  
  // Erişim reddedildi
  return false;
} 