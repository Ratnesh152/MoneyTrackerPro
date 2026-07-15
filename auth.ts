import NextAuth from 'next-auth';
import 'next-auth/jwt';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { env } from '@/config/env';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

const PROTECTED_ROUTES = ['/dashboard', '/accounts', '/transactions'];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: env.ENTRA_CLIENT_ID,
      clientSecret: env.ENTRA_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/v2.0`,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        nextUrl.pathname.startsWith(route)
      );

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect to signIn
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (profile?.oid) {
        token.id = profile.oid as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
        session.user.id = (token.id || token.sub) as string;
      }
      return session;
    }
  },
});