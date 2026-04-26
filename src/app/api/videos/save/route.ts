import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// POST /api/videos/save
// body: {
//   title: string, hook?: string, videoUrl: string,
//   durationSec?: number, scenes: Scene[]
// }
//
// Persists a finished video. Requires both auth + DB. Returns 200 with a
// degraded-mode payload when either is missing so the client can still show
// "your video is ready, but accounts/DB aren't configured — download below".
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { title, hook, videoUrl, durationSec, scenes, seriesId } = body || {};

  if (!videoUrl) {
    return NextResponse.json({ error: "videoUrl is required" }, { status: 400 });
  }

  if (!prisma) {
    return NextResponse.json({
      saved: false,
      reason: "DATABASE_URL is not configured — video will not appear in the library.",
      videoUrl,
    });
  }

  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({
      saved: false,
      reason: "Not signed in — sign in to save videos to your library.",
      videoUrl,
    });
  }

  const video = await prisma.video.create({
    data: {
      userId: session.user.id,
      title: typeof title === "string" && title.length ? title : "Untitled reel",
      hook: typeof hook === "string" ? hook : null,
      videoUrl,
      durationSec: typeof durationSec === "number" ? durationSec : null,
      scenes: scenes || [],
      seriesId: typeof seriesId === "string" ? seriesId : null,
      status: "ready",
    },
  });

  return NextResponse.json({ saved: true, video });
}
