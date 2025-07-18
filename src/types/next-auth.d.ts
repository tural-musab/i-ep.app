import NextAuth from 'next-auth';
import { User } from './auth';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User extends User {}
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: User;
  }
}
