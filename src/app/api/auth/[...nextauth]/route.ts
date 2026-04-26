// NextAuth.js handler stub.
// In production, configure providers (Google, TikTok, Meta) and add
// adapter for your database. See https://authjs.dev for setup.
//
// Example:
//   import NextAuth from "next-auth";
//   import Google from "next-auth/providers/google";
//   const handler = NextAuth({
//     providers: [Google({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })],
//   });
//   export { handler as GET, handler as POST };

import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ stub: true }); }
export async function POST() { return NextResponse.json({ stub: true }); }
