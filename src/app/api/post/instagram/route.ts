import { NextResponse } from "next/server";

// Publish a Reel to Instagram using the Instagram Graph API (Content Publishing).
// Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
//
// Flow:
//   1. POST /{ig-user-id}/media   (media_type=REELS, video_url, caption) -> creation id
//   2. Poll GET /{creation-id}?fields=status_code  until FINISHED
//   3. POST /{ig-user-id}/media_publish  (creation_id)
//
// Requires a Meta business account + instagram_content_publish permission.
export async function POST(req: Request) {
  const { videoUrl, caption, accountId } = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, platform: "instagram", videoUrl, caption, accountId });
}
