/**
 * Kullanıcı rolleri enum
 */
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
  GUEST = 'guest'
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
  metadata?: Record<string, any>;
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
  allowedTenants?: string[];
}

/**
 * Oturum bilgisi
 */
export interface Session {
  user: User;
  expires: Date;
  accessToken: string;
}

/**
 * Doğrulama sonucu
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
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
}

/**
 * Sağlayıcı ile giriş için seçenekler
 */
export interface ProviderOptions {
  redirectTo?: string;
  scopes?: string[];
}

/**
 * Yetkilendirme sağlayıcı tipi
 */
export type Provider = 'email' | 'google' | 'facebook' | 'microsoft' | 'apple'; 