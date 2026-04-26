import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";

const SERIES = [
  { slug: "mythology", name: "Mythology Stories", niche: "Mythology", style: "Cinematic", voice: "Atlas", cadence: "Daily 18:00 UTC", queued: 24, status: "active" },
  { slug: "dark-psych", name: "Dark Psychology", niche: "Psychology", style: "Noir", voice: "Sable", cadence: "Daily 21:00 UTC", queued: 18, status: "active" },
  { slug: "space-facts", name: "Space Facts", niche: "Space", style: "3D Animated", voice: "Iris", cadence: "3x/week", queued: 9, status: "active" },
  { slug: "stoic", name: "Stoic Motivation", niche: "Motivation", style: "Old Camera", voice: "Atlas", cadence: "Daily 06:00 UTC", queued: 31, status: "paused" },
];

export default function SeriesListPage() {
  return (
    <>
      <TopBar title="Series" subtitle="Each series is one channel theme. Multiple platforms, one engine." />
      <main className="p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/create"
            className="card p-6 border-dashed grid place-items-center text-center hover:border-brand/50 transition min-h-[200px]"
          >
            <div>
              <div className="text-4xl">＋</div>
              <p className="mt-2 font-medium">Create new series</p>
              <p className="text-xs text-ink-mute mt-1">Niche, style, voice, schedule. 90 seconds.</p>
            </div>
          </Link>
          {SERIES.map((s) => (
            <Link
              key={s.slug}
              href={`/dashboard/series/${s.slug}`}
              className="card p-6 hover:border-brand/30 transition group"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  s.status === "active" ? "bg-brand/10 text-brand" : "bg-ink-mute/10 text-ink-mute"
                }`}>{s.status}</span>
              </div>
              <p className="text-xs text-ink-mute mt-1">{s.niche}</p>
              <dl className="mt-5 space-y-1 text-sm">
                <Row k="Style" v={s.style} />
                <Row k="Voice" v={s.voice} />
                <Row k="Cadence" v={s.cadence} />
                <Row k="Queued" v={`${s.queued} videos`} />
              </dl>
              <p className="mt-5 text-sm text-brand opacity-0 group-hover:opacity-100 transition">Open →</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-mute">{k}</dt>
      <dd className="text-ink-dim">{v}</dd>
    </div>
  );
}
