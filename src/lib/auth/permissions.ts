import { User } from '@/types/auth';

// Yetki seviyeleri
export enum PermissionLevel {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  GUEST = 'guest'
}

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
  level: PermissionLevel;
}

// Tüm yetkilerin listesi
export const PERMISSIONS: Permission[] = [
  // Tenant yetkileri
  { resource: ResourceType.TENANT, action: ActionType.MANAGE, level: PermissionLevel.ADMIN },
  { resource: ResourceType.TENANT, action: ActionType.READ, level: PermissionLevel.MANAGER },
  
  // Öğrenci yetkileri
  { resource: ResourceType.STUDENT, action: ActionType.CREATE, level: PermissionLevel.ADMIN },
  { resource: ResourceType.STUDENT, action: ActionType.READ, level: PermissionLevel.TEACHER },
  { resource: ResourceType.STUDENT, action: ActionType.UPDATE, level: PermissionLevel.MANAGER },
  { resource: ResourceType.STUDENT, action: ActionType.DELETE, level: PermissionLevel.ADMIN },
  
  // Öğretmen yetkileri
  { resource: ResourceType.TEACHER, action: ActionType.CREATE, level: PermissionLevel.ADMIN },
  { resource: ResourceType.TEACHER, action: ActionType.READ, level: PermissionLevel.MANAGER },
  { resource: ResourceType.TEACHER, action: ActionType.UPDATE, level: PermissionLevel.ADMIN },
  { resource: ResourceType.TEACHER, action: ActionType.DELETE, level: PermissionLevel.ADMIN },
  
  // Kullanıcı yetkileri
  { resource: ResourceType.USER, action: ActionType.CREATE, level: PermissionLevel.ADMIN },
  { resource: ResourceType.USER, action: ActionType.READ, level: PermissionLevel.MANAGER },
  { resource: ResourceType.USER, action: ActionType.UPDATE, level: PermissionLevel.ADMIN },
  { resource: ResourceType.USER, action: ActionType.DELETE, level: PermissionLevel.ADMIN },
  
  // Sınıf yetkileri
  { resource: ResourceType.CLASS, action: ActionType.CREATE, level: PermissionLevel.MANAGER },
  { resource: ResourceType.CLASS, action: ActionType.READ, level: PermissionLevel.TEACHER },
  { resource: ResourceType.CLASS, action: ActionType.UPDATE, level: PermissionLevel.MANAGER },
  { resource: ResourceType.CLASS, action: ActionType.DELETE, level: PermissionLevel.ADMIN },
  
  // Dışa aktarma yetkileri
  { resource: ResourceType.STUDENT, action: ActionType.EXPORT, level: PermissionLevel.MANAGER },
  { resource: ResourceType.TEACHER, action: ActionType.EXPORT, level: PermissionLevel.MANAGER },
  { resource: ResourceType.GRADE, action: ActionType.EXPORT, level: PermissionLevel.MANAGER },
  { resource: ResourceType.TENANT, action: ActionType.EXPORT, level: PermissionLevel.ADMIN }
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
  if (user.role === PermissionLevel.ADMIN) return true;
  
  // İzin verilen en düşük yetki seviyesini bul
  const permission = PERMISSIONS.find(p => 
    p.resource === resource && p.action === action
  );
  
  if (!permission) return false;
  
  // Yetki seviyelerinin hiyerarşisi
  const levels = [
    PermissionLevel.GUEST,
    PermissionLevel.STUDENT,
    PermissionLevel.PARENT,
    PermissionLevel.TEACHER,
    PermissionLevel.MANAGER,
    PermissionLevel.ADMIN
  ];
  
  const userLevelIndex = levels.indexOf(user.role as PermissionLevel);
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