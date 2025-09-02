// lib/auth.ts

import NextAuth from 'next-auth';
// CAMBIO: Importación corregida para usar el tipo AuthConfig explícitamente
import { type AuthConfig } from '@auth/core/types'; 
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from './db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// CAMBIO: Se añade la anotación de tipo ': AuthConfig' a la constante
export const authConfig: AuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const userResult = await db.select().from(users).where(eq(users.username, String(credentials.username))).limit(1);

        if (userResult.length === 0) {
          return null;
        }

        const user = userResult[0];
        const isValidPassword = await bcrypt.compare(String(credentials.password), user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);