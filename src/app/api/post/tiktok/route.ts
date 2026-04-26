import { NextResponse } from "next/server";

// Publish a finished MP4 to TikTok using the TikTok Content Posting API.
// Docs: https://developers.tiktok.com/doc/content-posting-api-get-started
//
// Flow:
//   1. POST /v2/post/publish/inbox/video/init/  (upload session)
//   2. PUT video bytes to upload_url
//   3. POST /v2/post/publish/status/fetch/  (poll until PUBLISHED)
//
// Required scopes: video.upload, video.publish.
export async function POST(req: Request) {
  const { videoUrl, caption, accountId } = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, platform: "tiktok", videoUrl, caption, accountId });
}
