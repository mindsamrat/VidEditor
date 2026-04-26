import { NextResponse } from "next/server";

// List videos for the current user (with status: scripting / rendering / queued / posted).
// In production: paginate from DB; filter by series, status, platform.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const seriesId = url.searchParams.get("seriesId");
  const status = url.searchParams.get("status");
  return NextResponse.json({ videos: [], filters: { seriesId, status } });
}
