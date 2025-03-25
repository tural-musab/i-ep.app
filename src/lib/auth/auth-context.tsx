'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User, UserRole, Session } from '@/types/auth';
import { ResourceType, ActionType, hasPermission } from './permissions';

// Auth Context tip tanımı
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

// Default Context değerleri
const defaultContextValue: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  currentTenantId: null,
  
  signIn: async () => ({ success: false, error: 'Auth context has not been initialized' }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false, error: 'Auth context has not been initialized' }),
  updateUser: async () => {},
  
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
  
  const supabase = createClientComponentClient();
  const router = useRouter();
  
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
        
        // Tenant ID'yi al (önce user_metadata'dan, sonra localStorage'dan)
        let tenantId = authUser.user_metadata?.tenant_id as string || '';
        
        if (!tenantId) {
          tenantId = localStorage.getItem('tenant-id') || '';
        }
        
        setCurrentTenantId(tenantId);
        
        // Kullanıcı profil bilgilerini al
        if (tenantId && authUser.id) {
          const { data: userData, error: userError } = await supabase
            .from(`tenant_${tenantId}.users`)
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
      if (!currentTenantId) {
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
      localStorage.setItem('tenant-id', currentTenantId);
      
      // Kullanıcı metadata'sını güncelle
      await supabase.auth.updateUser({
        data: { 
          tenant_id: currentTenantId,
          last_login: new Date().toISOString()
        }
      });
      
      return { success: true };
    } catch (err: any) {
      console.error('Giriş işlemi hatası:', err);
      return { success: false, error: err.message || 'Giriş sırasında bir hata oluştu' };
    }
  };
  
  // Çıkış işlemi
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      localStorage.removeItem('tenant-id');
      router.push('/');
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
      // Profil bilgilerini güncelle
      if (userData.profile) {
        const { error: profileError } = await supabase
          .from(`tenant_${currentTenantId}.users`)
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
    
    signIn,
    signOut,
    resetPassword,
    updateUser,
    
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