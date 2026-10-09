import { NextResponse } from "next/server";
import { fetchChannel, YouTubeError } from "@/lib/youtube";

export const runtime = "nodejs";

// GET /api/youtube/channel?ref=@handle&max=50
// The key comes from YOUTUBE_API_KEY, or from the x-youtube-key header when a
// viewer pasted their own key into Settings.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("ref")?.trim();
  const max = Math.min(200, Math.max(4, Number(searchParams.get("max")) || 50));
  const key = req.headers.get("x-youtube-key")?.trim() || process.env.YOUTUBE_API_KEY;
  if (!ref) return NextResponse.json({ error: "Pass ?ref=@handle or a channel id." }, { status: 400 });
  if (!key) return NextResponse.json({ error: "No YouTube API key. Set YOUTUBE_API_KEY or add one in Settings." }, { status: 400 });
  try {
    return NextResponse.json(await fetchChannel(ref, key, max));
  } catch (e) {
    const status = e instanceof YouTubeError ? e.status : 500;
    return NextResponse.json({ error: e instanceof Error ? e.message : "YouTube request failed" }, { status });
  }
}
