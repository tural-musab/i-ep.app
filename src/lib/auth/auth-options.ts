import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextAuthOptions, Session, User } from 'next-auth';
import { cookies } from 'next/headers';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import { getTenantSupabaseClient } from '../supabase/server';
import { getTenantById, getTenantByDomain } from '../tenant/tenant-utils';
import { Database } from '@/types/database.types';

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
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        try {
          // Tenant bilgisi için host adresini kullan
          const tenantDomain = req.headers?.host || '';
          const tenant = await getTenantByDomain(tenantDomain);

          if (!tenant) {
            console.error(`Tenant bulunamadı: ${tenantDomain}`);
            return null;
          }

          // Tenant'a özel Supabase client oluştur
          const supabase = getTenantSupabaseClient(tenant.id);

          // Kullanıcı girişi
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            console.error(`Giriş hatası: ${error?.message}`);
            return null;
          }

          // Kullanıcı profil bilgilerini al
          // @ts-ignore - Dinamik tablo adları için bir geçici çözüm
          const { data: userProfile, error: profileError } = await supabase
            .from(`users`) // tenant şemasındaki users tablosu
            .select('*')
            .eq('auth_id', data.user.id)
            .single();

          if (profileError || !userProfile) {
            console.error(`Kullanıcı profili bulunamadı: ${profileError?.message}`);
            return null;
          }

          // Aktif olmayan kullanıcılar giremez
          if (userProfile.is_active !== true) {
            console.error(`Kullanıcı aktif değil: ${userProfile.email}`);
            return null;
          }

          // Kullanıcı bilgilerini ve tenant referansını döndür
          return {
            id: data.user.id,
            email: data.user.email,
            name: `${userProfile.first_name} ${userProfile.last_name}`,
            image: userProfile.avatar_url,
            role: userProfile.role,
            tenantId: tenant.id, // Tenant ID'yi ekle
          };
        } catch (error) {
          console.error('Yetkilendirme hatası:', error);
          return null;
        }
      },
    }),

    // Google ile giriş
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'user', // Varsayılan rol
          tenantId: undefined, // Google ile girişte tenant bilgisi sonradan belirlenecek
        };
      },
    }),

    // Şifresiz e-posta bağlantısı ile giriş (development'ta disabled)
    ...(process.env.NODE_ENV === 'production'
      ? [
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
        ]
      : []),
  ],

  // Oturum ayarları
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 1 gün
  },

  // Sayfa yönlendirmeleri
  pages: {
    signIn: '/auth/giris',
    signOut: '/auth/cikis',
    error: '/auth/hata',
  },

  // JWT ve oturum işlemleri
  callbacks: {
    async jwt({ token, user, account, profile, trigger, session }) {
      // Kullanıcı ilk giriş yaptığında user objesi dolu gelir
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role || 'user';
        token.tenantId = user.tenantId;
      }

      // Oturum güncellendiğinde
      if (session?.tenantId) {
        token.tenantId = session.tenantId;
      }

      // Oturum süresi kontrolleri ve yenileme burada yapılabilir

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string; // Tenant ID'yi oturum nesnesine ekle
      }

      return session;
    },
  },
};

// Tenant-aware kimlik doğrulama için oturum kontrolü
export async function getSessionWithTenant() {
  const supabase = createServerComponentClient({ cookies });

  // Mevcut oturumu al
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { session: null, tenant: null };
  }

  // Oturumdaki tenant_id'yi al
  let tenantId = null;

  if (session.user.user_metadata.tenant_id) {
    tenantId = session.user.user_metadata.tenant_id;
  }

  // Tenant bilgisini al
  let tenant = null;
  if (tenantId) {
    tenant = await getTenantById(tenantId);
  }

  return {
    session,
    tenant,
  };
}

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

// Yardımcı fonksiyon - session'da tanımlı tenant ile erişilen tenant eşleşiyor mu?
export function isTenantAuthorized(session: Session | null, tenantId: string): boolean {
  if (!session || !session.user?.tenantId) {
    return false;
  }

  // Super admin her tenant'a erişebilir
  if (session.user.role === 'super_admin') {
    return true;
  }

  return session.user.tenantId === tenantId;
}
