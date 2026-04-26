import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LibraryActions } from "@/components/dashboard/LibraryActions";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const session = await auth().catch(() => null);
  const videos =
    prisma && session?.user?.id
      ? await prisma.video.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      : [];

  const showSetupHint = !prisma || !session?.user?.id;

  return (
    <>
      <TopBar
        title="Library"
        subtitle="Every reel you've composed. Click to download."
      />
      <main className="p-6">
        {showSetupHint && (
          <div className="card p-5 mb-6 border-amber-300/30">
            <p className="text-sm text-ink">
              {!prisma
                ? "Set DATABASE_URL in Vercel envs to start saving videos to your library."
                : "Sign in to start saving videos to your library."}
            </p>
            <p className="text-xs text-ink-mute mt-1">
              Until then, finished MP4s are still downloadable from the studio.
            </p>
            <div className="mt-3 flex gap-2">
              <Link href="/studio" className="btn-ghost text-xs py-2 px-3">Open studio →</Link>
              {!session?.user?.id && (
                <Link href="/login" className="btn-brand text-xs py-2 px-3">Sign in</Link>
              )}
            </div>
          </div>
        )}

        {videos.length === 0 ? (
          <EmptyLibrary />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {videos.map((v) => (
              <article key={v.id} className="card p-2 hover:border-brand/30 transition group">
                <div className="aspect-[9/16] rounded-lg bg-bg-elev2 relative overflow-hidden">
                  <video
                    src={v.videoUrl ?? undefined}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                  />
                  <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded font-mono bg-brand/15 text-brand">
                    {v.status}
                  </span>
                </div>
                <div className="px-1 pt-2 pb-1">
                  <p className="text-sm text-ink line-clamp-2">{v.title}</p>
                  <p className="text-[11px] text-ink-mute mt-0.5">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                  <LibraryActions id={v.id} videoUrl={v.videoUrl} title={v.title} />
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function EmptyLibrary() {
  return (
    <div className="card p-10 text-center">
      <p className="font-display text-xl">No videos yet.</p>
      <p className="mt-2 text-sm text-ink-dim">Compose your first reel in the Studio.</p>
      <Link href="/studio" className="mt-5 btn-brand inline-flex text-sm">Open Studio →</Link>
    </div>
  );
}
