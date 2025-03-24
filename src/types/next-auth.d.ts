import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * NextAuth oturum nesnesini genişlet
   * Bu, session.user'a özel alanlar ekler
   */
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string;
    } & DefaultSession["user"];
  }

  /**
   * Oturum açan kullanıcı nesnesini genişlet
   */
  interface User {
    id: string;
    role?: string;
    tenantId?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * JWT içine eklenen alanlar
   */
  interface JWT {
    id: string;
    role?: string;
    tenantId?: string;
  }
} 