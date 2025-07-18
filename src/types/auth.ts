/**
 * Kullanıcı rolleri enum
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  GUEST = 'guest',
}

/**
 * Kullanıcı profili
 */
export interface UserProfile {
  userId: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  metadata?: Record<string, unknown>;
  // Çoklu tenant desteği için ek alanlar
  primaryTenantId?: string;
  tenantRoles?: Record<string, UserRole>;
  lastAccessedTenants?: string[];
}

/**
 * Temel kullanıcı tipi
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  emailVerified?: Date;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  // Tenant-aware özellikler
  allowedTenants: string[];
  isSuperAdmin?: boolean;
  isTenantSwitchEnabled?: boolean;
}

/**
 * Oturum bilgisi
 */
export interface Session {
  user: User;
  expires: Date;
  accessToken: string;
  // Tenant-specific bilgiler
  tenantId?: string;
}

/**
 * Doğrulama sonucu
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  tenantId?: string;
}

/**
 * Kullanıcı yaratma girişi
 */
export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
  fullName: string;
  allowedTenants?: string[];
}

/**
 * Sağlayıcı ile giriş için seçenekler
 */
export interface ProviderOptions {
  redirectTo?: string;
  scopes?: string[];
  tenantId?: string;
}

/**
 * Yetkilendirme sağlayıcı tipi
 */
export type Provider = 'email' | 'google' | 'facebook' | 'microsoft' | 'apple';

/**
 * Tenant değiştirme isteği
 */
export interface TenantSwitchRequest {
  userId: string;
  currentTenantId: string;
  targetTenantId: string;
  reason?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    user?: User;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}
