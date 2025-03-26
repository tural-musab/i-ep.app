'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User, UserRole, Session } from '@/types/auth';
import { ResourceType, ActionType, hasPermission } from './permissions';
import { extractTenantFromSubdomain } from '../tenant/tenant-utils';
import { Tenant } from '@/types/tenant';

// Auth Context tip tanımı
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentTenantId: string | null;
  currentTenant: Tenant | null;
  
  // Auth işlemleri
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signOut: (options?: { redirect?: boolean }) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  
  // Tenant işlemleri
  switchTenant: (tenantId: string) => Promise<boolean>;
  
  // Yetki kontrolleri
  hasPermission: (resource: ResourceType, action: ActionType) => boolean;
  isTenantUser: (tenantId: string) => boolean;
  isAdmin: () => boolean;
  isTeacher: () => boolean;
  isStudent: () => boolean;
  isParent: () => boolean;
}

// Default Context değerleri
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  currentTenantId: null,
  currentTenant: null,
  
  signIn: async () => ({ success: false, error: 'Auth context has not been initialized' }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false, error: 'Auth context has not been initialized' }),
  updateUser: async () => {},
  switchTenant: async () => false,
  
  hasPermission: () => false,
  isTenantUser: () => false,
  isAdmin: () => false,
  isTeacher: () => false,
  isStudent: () => false,
  isParent: () => false
};

// Auth Context oluştur
const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Context kullanım hook'u
export const useAuth = () => useContext(AuthContext);

// Prop tipleri
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  // Tenant belirleme fonksiyonu
  const determineTenantId = (): string | null => {
    let tenantId: string | null = null;
    
    // 1. URL'den tenant belirleme
    if (typeof window !== 'undefined') {
      const subdomain = extractTenantFromSubdomain(window.location.hostname);
      if (subdomain) {
        tenantId = `tenant_${subdomain}`;
      }
    }
    
    // 2. Local storage kontrolü
    if (!tenantId && typeof window !== 'undefined') {
      tenantId = localStorage.getItem('tenant-id');
    }
    
    return tenantId;
  };
  
  // Tenant bilgilerini al
  const fetchTenantDetails = async (tenantId: string) => {
    try {
      // Tenant ID'den gerçek tenant ID'yi çıkar (tenant_ prefix'ini kaldır)
      const rawTenantId = tenantId.startsWith('tenant_') 
        ? tenantId.substring(7) 
        : tenantId;
      
      // Tenant bilgilerini getir
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', rawTenantId)
        .single();
      
      if (error || !data) {
        console.error('Tenant bilgileri alınamadı:', error);
        return null;
      }
      
      return data as Tenant;
    } catch (err) {
      console.error('Tenant bilgisi çekme hatası:', err);
      return null;
    }
  };

  // Kullanıcı oturum durumunu izleme
  useEffect(() => {
    const checkUser = async () => {
      setIsLoading(true);
      
      try {
        // Mevcut oturumu kontrol et
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Oturum kontrol hatası:', error);
          setUser(null);
          setSession(null);
          setIsLoading(false);
          return;
        }
        
        if (!sessionData.session) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
          return;
        }
        
        const { user: authUser } = sessionData.session;
        
        // Tenant ID'yi al (önce user_metadata'dan, sonra dinamik belirleme)
        let tenantId = authUser.user_metadata?.tenant_id as string || '';
        
        if (!tenantId) {
          tenantId = determineTenantId() || '';
        }
        
        if (!tenantId) {
          console.error('Tenant ID bulunamadı, oturum devam edemez');
          setUser(null);
          setSession(null);
          setIsLoading(false);
          return;
        }
        
        setCurrentTenantId(tenantId);
        
        // Tenant bilgilerini al
        const tenantDetails = await fetchTenantDetails(tenantId);
        setCurrentTenant(tenantDetails);
        
        // Kullanıcı profil bilgilerini al
        if (tenantId && authUser.id) {
          // Tenant prefix'ini kaldır
          const schemaName = tenantId.startsWith('tenant_') ? tenantId : `tenant_${tenantId}`;
          
          const { data: userData, error: userError } = await supabase
            .from(`${schemaName}.users`)
            .select('*')
            .eq('auth_id', authUser.id)
            .single();
          
          if (userError) {
            console.error('Kullanıcı bilgileri alınamadı:', userError);
          } else if (userData) {
            // User nesnesini oluştur
            const appUser: User = {
              id: authUser.id,
              email: authUser.email || '',
              role: (userData.role || authUser.user_metadata?.role || 'guest') as UserRole,
              tenantId: tenantId,
              isActive: userData.status === 'active',
              profile: {
                userId: authUser.id,
                fullName: userData.name || authUser.user_metadata?.name || '',
                avatar: userData.avatar_url,
              },
              emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : undefined,
              createdAt: new Date(userData.created_at || authUser.created_at),
              updatedAt: new Date(userData.updated_at || authUser.updated_at),
              lastLogin: authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at) : undefined,
              // İzin verilen tenant'lar listesi
              allowedTenants: authUser.user_metadata?.allowed_tenants as string[] || [],
            };
            
            setUser(appUser);
            
            // Session nesnesini oluştur
            const appSession: Session = {
              user: appUser,
              expires: sessionData.session.expires_at ? new Date(sessionData.session.expires_at * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 saat varsayılan süre
              accessToken: sessionData.session.access_token,
            };
            
            setSession(appSession);
          }
        }
      } catch (err) {
        console.error('Oturum kontrolü sırasında hata:', err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    // İlk yükleme sırasında kullanıcıyı kontrol et
    checkUser();
    
    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state değişti:', event);
      checkUser();
    });
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);
  
  // Giriş işlemi
  const signIn = async (email: string, password: string) => {
    try {
      // Tenant ID kontrolü
      const tenantId = determineTenantId();
      if (!tenantId) {
        return { success: false, error: 'Tenant bilgisi eksik' };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Giriş hatası:', error);
        return { success: false, error: error.message };
      }
      
      if (!data.user) {
        return { success: false, error: 'Kullanıcı bilgileri alınamadı' };
      }
      
      // Tenant ID'yi localStorage'a kaydet
      localStorage.setItem('tenant-id', tenantId);
      
      // Kullanıcı metadata'sını güncelle
      await supabase.auth.updateUser({
        data: { 
          tenant_id: tenantId,
          last_login: new Date().toISOString()
        }
      });
      
      // Kullanıcı rolünü belirle - önce app_metadata'dan kontrol et
      let userRole = 'user'; // varsayılan rol
      
      if (data.user.app_metadata?.role) {
        // app_metadata'da rol varsa, onu kullan
        userRole = data.user.app_metadata.role;
        console.log('Kullanıcı rolü app_metadata\'dan alındı:', userRole);
      } else if (data.user.user_metadata?.role) {
        // user_metadata'da rol varsa, onu kullan
        userRole = data.user.user_metadata.role;
        console.log('Kullanıcı rolü user_metadata\'dan alındı:', userRole);
      }
      
      // User nesnesini oluştur
      const appUser: User = {
        id: data.user.id,
        email: data.user.email || '',
        role: userRole as UserRole,
        tenantId: tenantId,
        isActive: true,
        profile: {
          userId: data.user.id,
          fullName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
          avatar: data.user.user_metadata?.avatar_url,
        },
        emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : undefined,
        createdAt: new Date(data.user.created_at || Date.now()),
        updatedAt: new Date(data.user.updated_at || Date.now()),
        lastLogin: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined,
        allowedTenants: data.user.user_metadata?.allowed_tenants as string[] || [],
      };
      
      // State güncelle
      setUser(appUser);
      
      // Kullanıcı bilgilerini döndür
      return { success: true, user: appUser };
    } catch (err: any) {
      console.error('Giriş işlemi hatası:', err);
      return { success: false, error: err.message || 'Giriş sırasında bir hata oluştu' };
    }
  };
  
  // Çıkış işlemi
  const signOut = async (options: { redirect?: boolean } = { redirect: true }) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem('tenant-id');
      
      if (options.redirect) {
        router.push('/');
      }
    } catch (err) {
      console.error('Çıkış işlemi hatası:', err);
    }
  };
  
  // Şifre sıfırlama
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/sifre-yenile`,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('Şifre sıfırlama hatası:', err);
      return { success: false, error: err.message || 'Şifre sıfırlama sırasında bir hata oluştu' };
    }
  };
  
  // Kullanıcı güncelleme
  const updateUser = async (userData: Partial<User>) => {
    if (!user || !currentTenantId) return;
    
    try {
      // Tenant prefix'ini kaldır
      const schemaName = currentTenantId.startsWith('tenant_') ? currentTenantId : `tenant_${currentTenantId}`;
      
      // Profil bilgilerini güncelle
      if (userData.profile) {
        const { error: profileError } = await supabase
          .from(`${schemaName}.users`)
          .update({
            name: userData.profile.fullName,
            avatar_url: userData.profile.avatar,
            // Diğer profil alanları
          })
          .eq('auth_id', user.id);
        
        if (profileError) {
          console.error('Profil güncelleme hatası:', profileError);
        }
      }
      
      // Metadata'yı güncelle
      await supabase.auth.updateUser({
        data: {
          ...(userData.profile?.fullName && { name: userData.profile.fullName }),
          updated_at: new Date().toISOString()
        }
      });
      
      // Yerel kullanıcı durumunu güncelle
      setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
    } catch (err) {
      console.error('Kullanıcı güncelleme hatası:', err);
    }
  };
  
  // Tenant değiştirme
  const switchTenant = async (tenantId: string): Promise<boolean> => {
    try {
      if (!user) return false;
      
      // Kullanıcının bu tenant'a erişimi var mı kontrol et
      if (!isTenantUser(tenantId)) {
        console.error('Kullanıcının bu tenant\'a erişim yetkisi yok:', tenantId);
        return false;
      }
      
      // Şu anki kullanıcının metadata'sını güncelle
      await supabase.auth.updateUser({
        data: { 
          tenant_id: tenantId,
          current_tenant: tenantId
        }
      });
      
      // localStorage'da tenant bilgisini güncelle
      localStorage.setItem('tenant-id', tenantId);
      
      // Yeni tenant bilgilerini al
      const tenantDetails = await fetchTenantDetails(tenantId);
      if (tenantDetails) {
        setCurrentTenant(tenantDetails);
        setCurrentTenantId(tenantId);
        
        // Kullanıcı nesnesini güncelle
        setUser(prevUser => prevUser ? { ...prevUser, tenantId } : null);
        
        // Oturum nesnesini güncelle
        setSession(prevSession => {
          if (!prevSession) return null;
          return {
            ...prevSession,
            user: {
              ...prevSession.user,
              tenantId
            }
          };
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Tenant değiştirme hatası:', error);
      return false;
    }
  };
  
  // Yetki kontrolü
  const checkPermission = (resource: ResourceType, action: ActionType): boolean => {
    return hasPermission(user, resource, action);
  };
  
  // Tenant kullanıcısı kontrolü
  const isTenantUser = (tenantId: string): boolean => {
    if (!user) return false;
    
    // Kullanıcının tenant'ı doğru mu?
    return user.tenantId === tenantId || (user.allowedTenants?.includes(tenantId) || false);
  };
  
  // Rol kontrolleri
  const isAdmin = (): boolean => {
    return user?.role === UserRole.ADMIN;
  };
  
  const isTeacher = (): boolean => {
    return user?.role === UserRole.TEACHER;
  };
  
  const isStudent = (): boolean => {
    return user?.role === UserRole.STUDENT;
  };
  
  const isParent = (): boolean => {
    return user?.role === UserRole.PARENT;
  };
  
  // Context değerleri
  const contextValue: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    currentTenantId,
    currentTenant,
    
    signIn,
    signOut,
    resetPassword,
    updateUser,
    switchTenant,
    
    hasPermission: checkPermission,
    isTenantUser,
    isAdmin,
    isTeacher,
    isStudent,
    isParent
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 