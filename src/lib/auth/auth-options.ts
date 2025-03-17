import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextAuthOptions, Session } from 'next-auth';
import { cookies } from 'next/headers';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { getTenantSupabaseClient } from '../supabase/server';
import { getTenantById } from '../tenant/tenant-utils';

/**
 * Next-Auth yapılandırma ayarları
 * 
 * Bu dosya, Next-Auth kütüphanesi için yapılandırma seçeneklerini içerir
 * ve Supabase ile entegrasyonu sağlar. Tenant-aware kimlik doğrulama
 * mekanizmasını da içerir.
 */
export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  
  // Desteklenen oturum açma metodları
  providers: [
    // E-posta / Şifre ile giriş
    CredentialsProvider({
      name: 'E-posta & Şifre',
      credentials: {
        email: { label: 'E-posta', type: 'email' },
        password: { label: 'Şifre', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        
        try {
          // Tenant bilgisi için host adresini kullan
          const tenantDomain = req.headers?.host || '';
          const tenant = await getTenantById(tenantDomain);
          
          if (!tenant || tenant.status !== 'active') {
            console.error(`Tenant bulunamadı veya aktif değil: ${tenantDomain}`);
            return null;
          }
          
          // Tenant-specific Supabase client
          const supabase = await getTenantSupabaseClient(tenant.id);
          
          // Supabase auth kullanarak kimlik doğrulama
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          
          if (error || !data.user) {
            console.error(`Giriş hatası: ${error?.message}`);
            return null;
          }
          
          // Kullanıcı profil bilgilerini getir
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', data.user.id)
            .single();
            
          if (profileError || !userProfile) {
            console.error(`Kullanıcı profili bulunamadı: ${profileError?.message}`);
            return null;
          }
          
          // Kullanıcı aktif mi kontrol et
          if (userProfile.status !== 'active') {
            console.error(`Kullanıcı aktif değil: ${userProfile.email}`);
            return null;
          }
          
          // Kullanıcı nesnesini döndür
          return {
            id: data.user.id,
            email: data.user.email,
            name: userProfile.name,
            image: userProfile.avatar_url,
            role: userProfile.role,
            tenant_id: tenant.id,
            tenant_name: tenant.name,
          };
        } catch (err) {
          console.error('Giriş işleminde hata:', err);
          return null;
        }
      }
    }),
    
    // Google ile giriş
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Aynı e-posta ile farklı sağlayıcılara izin ver
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user', // Varsayılan rol (admin tarafından değiştirilebilir)
        };
      },
    }),
    
    // Şifresiz e-posta bağlantısı ile giriş
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // Bağlantının geçerlilik süresi (24 saat)
    }),
  ],
  
  // JWT ile oturum yönetimi
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  
  // JWT seçenekleri
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  
  // Özel sayfalar
  pages: {
    signIn: '/auth/giris',
    signOut: '/auth/cikis',
    error: '/auth/hata',
    verifyRequest: '/auth/dogrulama',
    newUser: '/auth/kayit',
  },
  
  // Oturum bilgisini zenginleştir
  callbacks: {
    // JWT oluşturulurken çalışır
    async jwt({ token, user, account, profile, trigger, session }) {
      // Kullanıcı ilk defa giriş yaptığında bu veri gelir
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenant_id = user.tenant_id;
        token.tenant_name = user.tenant_name;
      }
      
      // Oturum güncellendiğinde
      if (trigger === 'update' && session) {
        if (session.user) {
          token.name = session.user.name;
          token.picture = session.user.image;
          token.role = session.user.role;
        }
      }
      
      return token;
    },
    
    // Her oturum oluşturulduğunda çalışır
    async session({ session, token, user }) {
      // JWT'den alınan bilgileri oturum nesnesine ekle
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenant_id = token.tenant_id as string;
        session.user.tenant_name = token.tenant_name as string;
      }
      
      return session;
    },
  },
  
  // Güvenlik ayarları
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Kullanıcının roller bazında erişim yetkisini kontrol eder
 * 
 * @param session Kullanıcı oturumu
 * @param allowedRoles İzin verilen roller
 * @returns Kullanıcının yetkili olup olmadığı
 */
export function isAuthorized(session: Session | null, allowedRoles: string[]): boolean {
  if (!session || !session.user?.role) {
    return false;
  }
  
  return allowedRoles.includes(session.user.role);
}

/**
 * Kullanıcının tenant'a erişim yetkisini kontrol eder
 * 
 * @param session Kullanıcı oturumu
 * @param tenantId Kontrol edilecek tenant ID
 * @returns Kullanıcının yetkili olup olmadığı
 */
export function isTenantAuthorized(session: Session | null, tenantId: string): boolean {
  if (!session || !session.user?.tenant_id) {
    return false;
  }
  
  // Admin rolü her tenant'a erişebilir
  if (session.user.role === 'superadmin') {
    return true;
  }
  
  return session.user.tenant_id === tenantId;
} 