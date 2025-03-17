import NextAuth from 'next-auth';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { User, UserRole } from '@/types/auth';

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
            return null;
          }
          
          // Kullanıcı bilgilerini veritabanından alma
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*, profile:profiles(*)')
            .eq('auth_id', data.user.id)
            .eq('tenant_id', credentials.tenantId)
            .single();
          
          if (userError || !userData) {
            console.error('Kullanıcı bilgileri alınamadı:', userError);
            return null;
          }
          
          // Kullanıcı aktif değilse giriş engellenir
          if (!userData.is_active) {
            console.log('Hesap pasif durumda');
            return null;
          }
          
          // Next Auth için kullanıcı nesnesi oluştur
          const user: User = {
            id: userData.id,
            email: data.user.email!,
            role: userData.role as UserRole,
            tenantId: userData.tenant_id,
            isActive: userData.is_active,
            emailVerified: data.user.email_confirmed_at 
              ? new Date(data.user.email_confirmed_at) 
              : undefined,
            profile: userData.profile 
              ? {
                  userId: userData.id,
                  fullName: userData.profile.full_name,
                  avatar: userData.profile.avatar_url,
                  bio: userData.profile.bio,
                  phoneNumber: userData.profile.phone,
                  department: userData.profile.department,
                  position: userData.profile.position,
                  // ... diğer profil alanları
                }
              : undefined,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
            lastLogin: data.user.last_sign_in_at 
              ? new Date(data.user.last_sign_in_at) 
              : undefined
          };
          
          // Son giriş zamanını güncelle
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);
            
          return user;
        } catch (error) {
          console.error('Auth hatası:', error);
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