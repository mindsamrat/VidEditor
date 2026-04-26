import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";

const SERIES = [
  { name: "Mythology Stories", style: "Cinematic", voice: "Atlas", queued: 24, posted: 87, views: "1.4M", status: "active" },
  { name: "Dark Psychology", style: "Noir", voice: "Sable", queued: 18, posted: 41, views: "612K", status: "active" },
  { name: "Space Facts", style: "3D Animated", voice: "Iris", queued: 9, posted: 33, views: "2.1M", status: "active" },
  { name: "Stoic Motivation", style: "Old Camera", voice: "Atlas", queued: 31, posted: 102, views: "880K", status: "paused" },
];

const RECENT = [
  { title: "How Thor lost his hammer", series: "Mythology Stories", platform: "TikTok", views: "412K", when: "2h ago" },
  { title: "The 7-second rule", series: "Dark Psychology", platform: "Reels", views: "108K", when: "5h ago" },
  { title: "What's inside Jupiter", series: "Space Facts", platform: "Shorts", views: "892K", when: "8h ago" },
  { title: "Marcus Aurelius on pain", series: "Stoic Motivation", platform: "TikTok", views: "61K", when: "yesterday" },
  { title: "How Cleopatra really died", series: "Mythology Stories", platform: "Reels", views: "190K", when: "yesterday" },
];

export default function DashboardOverview() {
  return (
    <>
      <TopBar title="Overview" subtitle="Your faceless empire at a glance" />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Videos this month" value="74" hint="of 120" />
          <Stat label="Total views (30d)" value="4.6M" hint="+12% vs last 30d" trend="up" />
          <Stat label="Active series" value="3" hint="of 5 included" />
          <Stat label="Connected accounts" value="5" hint="TT · IG · YT × 2" />
        </div>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">Your series</h2>
            <Link href="/dashboard/series" className="text-sm text-brand hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-ink-mute text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 pr-4">Series</th>
                  <th className="py-2 pr-4">Style</th>
                  <th className="py-2 pr-4">Voice</th>
                  <th className="py-2 pr-4">Queued</th>
                  <th className="py-2 pr-4">Posted</th>
                  <th className="py-2 pr-4">Views</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {SERIES.map((s) => (
                  <tr key={s.name} className="border-t border-line/60 hover:bg-bg-elev/40">
                    <td className="py-3 pr-4 font-medium">
                      <Link href="/dashboard/series/mythology" className="hover:text-brand">{s.name}</Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-dim">{s.style}</td>
                    <td className="py-3 pr-4 text-ink-dim">{s.voice}</td>
                    <td className="py-3 pr-4">{s.queued}</td>
                    <td className="py-3 pr-4">{s.posted}</td>
                    <td className="py-3 pr-4 text-brand">{s.views}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === "active" ? "bg-brand/10 text-brand" : "bg-ink-mute/10 text-ink-mute"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-4">
          <section className="card p-5 lg:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-4">Recently posted</h2>
            <ul className="divide-y divide-line/60">
              {RECENT.map((r, i) => (
                <li key={i} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-ink truncate">{r.title}</p>
                    <p className="text-xs text-ink-mute">{r.series} · {r.platform}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-brand text-sm">{r.views}</p>
                    <p className="text-xs text-ink-mute">{r.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold mb-4">Today&rsquo;s queue</h2>
            <ul className="space-y-3 text-sm">
              {[
                { t: "12:00", n: "Mythology · ep 88" },
                { t: "15:30", n: "Dark Psych · ep 42" },
                { t: "18:00", n: "Space Facts · ep 34" },
                { t: "21:00", n: "Mythology · ep 89" },
              ].map((q) => (
                <li key={q.t} className="flex items-center gap-3">
                  <span className="font-mono text-xs text-brand w-12">{q.t}</span>
                  <span className="text-ink-dim">{q.n}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/calendar" className="mt-4 inline-block text-sm text-brand hover:underline">
              Open calendar →
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value, hint, trend }: { label: string; value: string; hint?: string; trend?: "up" | "down" }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-ink-mute uppercase tracking-wider">{label}</p>
      <p className="mt-2 text-3xl font-display font-bold">{value}</p>
      {hint && (
        <p className={`mt-1 text-xs ${trend === "up" ? "text-brand" : "text-ink-mute"}`}>{hint}</p>
      )}
    </div>
  );
}
