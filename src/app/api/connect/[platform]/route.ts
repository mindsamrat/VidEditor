import { NextResponse } from "next/server";

// OAuth callback handler for connecting a social account.
// platform = "tiktok" | "instagram" | "youtube"
//
// Flow:
//   - /api/connect/{platform}        -> redirect user to platform OAuth consent URL
//   - /api/connect/{platform}/callback (handled by NextAuth or here) -> exchange code -> store encrypted token
export async function GET(_req: Request, { params }: { params: { platform: string } }) {
  return NextResponse.json({ stub: true, platform: params.platform });
}
