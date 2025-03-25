import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { User, UserRole } from '@/types/auth';
import { logAuditEvent } from '@/lib/audit';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantId) {
          return null;
        }
        
        try {
          const supabase = createServerSupabaseClient();
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          });
          
          if (error || !data.user) {
            console.error('Giriş hatası:', error);
            // Başarısız giriş denemesini logla
            await logAuditEvent(
              credentials.tenantId,
              data?.user?.id || 'unknown',
              'login_failed',
              'auth',
              data?.user?.id || 'unknown',
              {},
              {},
              { 
                email: credentials.email,
                error: error?.message || 'Unknown error',
                ip: 'server-side' // Gerçek IP için middleware veya context kullanılabilir
              }
            ).catch(e => console.error('Audit log hatası:', e));
            return null;
          }
          
          // Kullanıcı bilgilerini veritabanından alma
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', data.user.id)
            .eq('tenant_id', credentials.tenantId)
            .single();
          
          if (userError || !userData) {
            console.error('Kullanıcı bilgileri alınamadı:', userError);
            await logAuditEvent(
              credentials.tenantId,
              data.user.id,
              'login_failed',
              'auth',
              data.user.id,
              {},
              {},
              { 
                email: credentials.email,
                error: 'Tenant bilgisi bulunamadı veya eşleşmiyor',
                ip: 'server-side'
              }
            ).catch(e => console.error('Audit log hatası:', e));
            return null;
          }
          
          // Kullanıcı aktif değilse giriş engellenir
          if (!userData.is_active) {
            console.log('Hesap pasif durumda');
            await logAuditEvent(
              credentials.tenantId,
              userData.id,
              'login_failed',
              'auth',
              userData.id,
              {},
              {},
              { 
                email: credentials.email,
                error: 'Hesap pasif durumda',
                ip: 'server-side'
              }
            ).catch(e => console.error('Audit log hatası:', e));
            return null;
          }
          
          // Kullanıcı profil bilgisi
          const profile = {
            userId: userData.id,
            fullName: `${userData.first_name} ${userData.last_name}`,
            avatar: userData.avatar_url || undefined, // null değerini undefined ile değiştiriyoruz
            bio: '',
            phoneNumber: '',
            department: undefined,
            position: undefined,
          };
          
          // Next Auth için kullanıcı nesnesi oluştur
          const user: User = {
            id: userData.id,
            email: userData.email,
            role: userData.role as UserRole,
            tenantId: userData.tenant_id,
            isActive: userData.is_active,
            allowedTenants: [], // Eksik alanı ekledik
            emailVerified: data.user.email_confirmed_at 
              ? new Date(data.user.email_confirmed_at) 
              : undefined,
            profile: profile,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
            lastLogin: userData.last_login_at
              ? new Date(userData.last_login_at)
              : undefined
          };
          
          // Son giriş zamanını güncelle
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', userData.id);
          
          // Başarılı girişi logla
          await logAuditEvent(
            userData.tenant_id,
            userData.id,
            'login_success',
            'auth',
            userData.id,
            {},
            {},
            { 
              email: credentials.email,
              role: userData.role,
              ip: 'server-side'
            }
          ).catch(e => console.error('Audit log hatası:', e));
            
          return user;
        } catch (error) {
          console.error('Auth hatası:', error);
          await logAuditEvent(
            credentials.tenantId || 'unknown',
            'unknown',
            'login_error',
            'auth',
            'unknown',
            {},
            {},
            { 
              email: credentials.email,
              error: error instanceof Error ? error.message : 'Unknown error',
              ip: 'server-side'
            }
          ).catch(e => console.error('Audit log hatası:', e));
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: `${profile.given_name} ${profile.family_name}`,
          image: profile.picture,
          // Diğer Google profil alanları
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // İlk giriş yapıldığında user bilgisini token'a ekle
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      // Token'daki user bilgisini session'a ekle
      session.user = token.user as User;
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: '/auth/giris',
    signOut: '/auth/cikis',
    error: '/auth/hata',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 