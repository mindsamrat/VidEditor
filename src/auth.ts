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
  // NextAuth v5 expects at least an empty providers array. Keep config as
  // tolerant as possible so a missing env var never breaks page rendering.
  providers: authEnabled
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
  ...(prisma && authEnabled ? { adapter: PrismaAdapter(prisma) } : {}),
  session: { strategy: "jwt" },
  // Generate a placeholder secret in dev/anon mode so NextAuth never throws
  // at construction. This is NOT used to sign anything you'd trust.
  secret: process.env.AUTH_SECRET || "anon-mode-placeholder-do-not-use-in-production",
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};

// Defensive init: if NextAuth itself throws at construction (rare, but the
// beta has had quirks), expose safe stubs so the rest of the app keeps
// rendering.
type AuthExports = ReturnType<typeof NextAuth>;
let exported: AuthExports;
try {
  exported = NextAuth(config);
} catch (e) {
  console.error("[reelforge] NextAuth init failed:", e);
  exported = {
    handlers: {
      GET: async () => new Response("Auth disabled", { status: 503 }),
      POST: async () => new Response("Auth disabled", { status: 503 }),
    },
    auth: (async () => null) as unknown as AuthExports["auth"],
    signIn: (async () => {}) as unknown as AuthExports["signIn"],
    signOut: (async () => {}) as unknown as AuthExports["signOut"],
    unstable_update: (async () => null) as unknown as AuthExports["unstable_update"],
  } as AuthExports;
}

export const { handlers, auth, signIn, signOut } = exported;
