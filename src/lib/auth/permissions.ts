import { User, UserRole } from '@/types/auth';
import { createServerSupabaseClient } from '../supabase/server';

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
  USER = 'user',
}

// Eylem türleri
export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXPORT = 'export',
  IMPORT = 'import',
}

// Yetki kontrolü yapısı
export interface Permission {
  resource: ResourceType;
  action: ActionType;
  level: UserRole;
}

// Safari-compatible constants for enums
const RESOURCE_TYPES = {
  TENANT: 'tenant',
  STUDENT: 'student',
  TEACHER: 'teacher',
  CLASS: 'class',
  COURSE: 'course',
  GRADE: 'grade',
  ATTENDANCE: 'attendance',
  REPORT: 'report',
  SETTINGS: 'settings',
  USER: 'user',
} as const;

const ACTION_TYPES = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  EXPORT: 'export',
  IMPORT: 'import',
} as const;

const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  GUEST: 'guest',
} as const;

// Tüm yetkilerin listesi - Safari compatible
export const PERMISSIONS: Permission[] = [
  // Tenant yetkileri
  { resource: RESOURCE_TYPES.TENANT, action: ACTION_TYPES.MANAGE, level: USER_ROLES.ADMIN },
  { resource: RESOURCE_TYPES.TENANT, action: ACTION_TYPES.READ, level: USER_ROLES.MANAGER },

  // Öğrenci yetkileri
  { resource: RESOURCE_TYPES.STUDENT, action: ACTION_TYPES.CREATE, level: USER_ROLES.ADMIN },
  { resource: RESOURCE_TYPES.STUDENT, action: ACTION_TYPES.READ, level: USER_ROLES.TEACHER },
  { resource: RESOURCE_TYPES.STUDENT, action: ACTION_TYPES.UPDATE, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.STUDENT, action: ACTION_TYPES.DELETE, level: USER_ROLES.ADMIN },

  // Öğretmen yetkileri
  { resource: RESOURCE_TYPES.TEACHER, action: ACTION_TYPES.CREATE, level: USER_ROLES.ADMIN },
  { resource: RESOURCE_TYPES.TEACHER, action: ACTION_TYPES.READ, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.TEACHER, action: ACTION_TYPES.UPDATE, level: USER_ROLES.ADMIN },
  { resource: RESOURCE_TYPES.TEACHER, action: ACTION_TYPES.DELETE, level: USER_ROLES.ADMIN },

  // Kullanıcı yetkileri
  { resource: RESOURCE_TYPES.USER, action: ACTION_TYPES.CREATE, level: USER_ROLES.ADMIN },
  { resource: RESOURCE_TYPES.USER, action: ACTION_TYPES.READ, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.USER, action: ACTION_TYPES.UPDATE, level: USER_ROLES.ADMIN },
  { resource: RESOURCE_TYPES.USER, action: ACTION_TYPES.DELETE, level: USER_ROLES.ADMIN },

  // Sınıf yetkileri
  { resource: RESOURCE_TYPES.CLASS, action: ACTION_TYPES.CREATE, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.CLASS, action: ACTION_TYPES.READ, level: USER_ROLES.TEACHER },
  { resource: RESOURCE_TYPES.CLASS, action: ACTION_TYPES.UPDATE, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.CLASS, action: ACTION_TYPES.DELETE, level: USER_ROLES.ADMIN },

  // Dışa aktarma yetkileri
  { resource: RESOURCE_TYPES.STUDENT, action: ACTION_TYPES.EXPORT, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.TEACHER, action: ACTION_TYPES.EXPORT, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.GRADE, action: ACTION_TYPES.EXPORT, level: USER_ROLES.MANAGER },
  { resource: RESOURCE_TYPES.TENANT, action: ACTION_TYPES.EXPORT, level: USER_ROLES.ADMIN },
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

  // Süper admin her zaman tüm yetkilere sahiptir - Safari compatible
  if (user.role === 'admin') return true;

  // İzin verilen en düşük yetki seviyesini bul
  const permission = PERMISSIONS.find((p) => p.resource === resource && p.action === action);

  if (!permission) return false;

  // Yetki seviyelerinin hiyerarşisi - Safari compatible
  const levels = [
    'guest',
    'student',
    'parent',
    'teacher',
    'manager',
    'admin',
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
  let userId: string = '';
  let tenantId: string = '';

  if (typeof userOrParams === 'object' && userOrParams !== null) {
    if ('userId' in userOrParams && 'tenantId' in userOrParams) {
      // Yeni format: { userId, tenantId }
      userId = userOrParams.userId;
      tenantId = userOrParams.tenantId;
    } else {
      // Supabase user nesnesi
      userId = userOrParams.id;
      tenantId = tenantIdParam || '';
    }
  }

  // Kullanıcı veya tenant ID yoksa erişim reddet
  if (!userId || !tenantId) return false;

  try {
    // Supabase istemcisini oluştur
    const supabase = createServerSupabaseClient();

    // RLS fonksiyonunu kullanarak tenant_admin kontrolü yap
    const { data: isTenantAdmin, error: tenantAdminError } = await supabase.rpc('is_tenant_admin', {
      tenant_id: tenantId,
    });

    if (tenantAdminError) {
      console.error('Tenant erişim kontrolü hatası:', tenantAdminError);
      return false;
    }

    // Super admin kontrolü
    const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc('is_super_admin');

    if (superAdminError) {
      console.error('Super admin kontrolü hatası:', superAdminError);
    } else if (isSuperAdmin) {
      // Kullanıcı süper admin ise her tenant'a erişebilir
      return true;
    }

    // Tenant admin kontrolünün sonucunu döndür
    return !!isTenantAdmin;
  } catch (error) {
    console.error('Tenant erişim doğrulama hatası:', error);
    return false;
  }
}
