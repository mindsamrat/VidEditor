import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Auth is optional. The app is fully usable for anonymous testing.
// Enable accounts by setting in Vercel:
//   AUTH_SECRET            (random 32+ bytes)
//   GOOGLE_CLIENT_ID
//   GOOGLE_CLIENT_SECRET
//   DATABASE_URL           (Postgres — Vercel Postgres or Neon)
export const authEnabled = Boolean(
  process.env.AUTH_SECRET &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
);

const config: NextAuthConfig = {
  trustHost: true,
  providers: authEnabled
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
  ...(prisma ? { adapter: PrismaAdapter(prisma) } : {}),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        // Surface user id on the session for our API routes.
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
