import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// GET /api/videos  — current user's videos, newest first.
// Returns { videos: [] } when DB or auth aren't configured.
export async function GET() {
  if (!prisma) return NextResponse.json({ videos: [] });

  const session = await auth().catch(() => null);
  if (!session?.user?.id) return NextResponse.json({ videos: [] });

  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ videos });
}

// DELETE /api/videos?id=…
export async function DELETE(req: Request) {
  if (!prisma) return NextResponse.json({ error: "no db" }, { status: 500 });
  const session = await auth().catch(() => null);
  if (!session?.user?.id) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.video.deleteMany({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ deleted: true });
}
