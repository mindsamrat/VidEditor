import { NextResponse } from "next/server";

// Stub for the Series CRUD endpoint.
// In production:
//   - Auth: read user from session (NextAuth / Clerk).
//   - DB:   read/write rows in the `series` table (Postgres / Supabase / Neon).
//   - Side-effect on create: enqueue first 3 episode-generation jobs (Inngest / Trigger.dev).
//
// Body shape (POST):
// {
//   name, niche, customNiche?, style, voice, music, musicLink?,
//   cadence, timeUtc, reviewMode, accounts: { tiktok, instagram, youtube },
// }
export async function GET() {
  return NextResponse.json({ series: [] });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: persist series to DB
  // TODO: enqueue first N episode jobs
  return NextResponse.json({
    id: "demo_" + Math.random().toString(36).slice(2, 9),
    ...body,
    createdAt: new Date().toISOString(),
  });
}
