import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Which server-side keys are configured. Booleans only - never the values.
export function GET() {
  return NextResponse.json({ youtube: !!process.env.YOUTUBE_API_KEY, anthropic: !!process.env.ANTHROPIC_API_KEY });
}
