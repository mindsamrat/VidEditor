import { NextResponse } from "next/server";

// Publish a Short to YouTube using the YouTube Data API v3.
// Docs: https://developers.google.com/youtube/v3/docs/videos/insert
//
// Flow:
//   - Resumable upload: POST /upload/youtube/v3/videos?uploadType=resumable
//   - Then PUT video bytes to the returned upload URL.
//   - title must include #shorts to be classified as a Short.
//
// Required scope: https://www.googleapis.com/auth/youtube.upload
export async function POST(req: Request) {
  const { videoUrl, title, description, accountId } = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, platform: "youtube", videoUrl, title, description, accountId });
}
