import { NextResponse } from "next/server";

// GET /api/debug/env
//
// Diagnostic endpoint. Returns whether each expected env var is set on the
// running deployment WITHOUT leaking values. Hit it in your browser on the
// exact URL you're testing — both production and preview have separate env
// var bindings in Vercel, and this endpoint reports what THIS deployment
// actually sees.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEYS = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "DATABASE_URL",
  "AUTH_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "REPLICATE_API_TOKEN",
];

export async function GET() {
  const env: Record<string, { set: boolean; length: number; preview?: string }> = {};
  for (const k of KEYS) {
    const v = process.env[k];
    env[k] = {
      set: typeof v === "string" && v.length > 0,
      length: typeof v === "string" ? v.length : 0,
      // First 4 + last 2 chars only — never the value. Helps spot pasted-wrong-thing.
      preview: typeof v === "string" && v.length > 8 ? `${v.slice(0, 4)}…${v.slice(-2)}` : undefined,
    };
  }

  return NextResponse.json({
    deployedAt: new Date().toISOString(),
    vercelEnv: process.env.VERCEL_ENV || "(local)",
    vercelUrl: process.env.VERCEL_URL || null,
    nodeEnv: process.env.NODE_ENV,
    env,
    hint: "If a key shows set:false, it's missing from THIS environment. In Vercel: Settings → Environment Variables → your key → tick Production AND Preview AND Development.",
  });
}
