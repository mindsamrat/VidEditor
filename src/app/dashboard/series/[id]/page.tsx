import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";

const QUEUE = [
  { ep: 88, title: "How Thor lost his hammer", when: "Today 18:00", status: "rendering" },
  { ep: 89, title: "The myth of Pandora", when: "Today 21:00", status: "queued" },
  { ep: 90, title: "Why Hades wasn't evil", when: "Tomorrow 18:00", status: "queued" },
  { ep: 91, title: "How Anubis judged souls", when: "Tomorrow 21:00", status: "scripting" },
  { ep: 92, title: "Loki's last trick", when: "Wed 18:00", status: "queued" },
];

const POSTED = [
  { ep: 87, title: "How Cleopatra really died", views: "190K", platform: "TikTok + IG + YT", when: "yesterday" },
  { ep: 86, title: "The minotaur's labyrinth", views: "82K", platform: "TikTok + IG + YT", when: "2d ago" },
  { ep: 85, title: "Why Achilles had a weak heel", views: "412K", platform: "TikTok + IG + YT", when: "3d ago" },
  { ep: 84, title: "Medusa's curse, explained", views: "230K", platform: "TikTok + IG + YT", when: "4d ago" },
];

export default function SeriesDetailPage({ params }: { params: { id: string } }) {
  return (
    <>
      <TopBar title="Mythology Stories" subtitle={`/dashboard/series/${params.id}`} />
      <main className="p-6 space-y-6">
        <div className="grid lg:grid-cols-3 gap-4">
          <section className="card p-6 lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-mute uppercase tracking-wider">Niche</p>
                <p className="text-ink">Mythology &middot; Greek + Norse + Egyptian</p>
              </div>
              <button className="btn-ghost text-xs py-2 px-3">Edit</button>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Detail k="Art style" v="Cinematic Realism" />
              <Detail k="Voice" v="Atlas (deep narrator)" />
              <Detail k="Music" v="Epic orchestral (library)" />
              <Detail k="Captions" v="Word-by-word, viral" />
              <Detail k="Cadence" v="Daily, 18:00 UTC" />
              <Detail k="Posts to" v="TikTok · IG · YT" />
              <Detail k="Mode" v="Fully automated" />
              <Detail k="Started" v="Mar 14, 2026" />
            </div>
          </section>

          <section className="card p-6">
            <h3 className="font-display font-semibold">Performance (30d)</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <PerfRow k="Total views" v="1.42M" />
              <PerfRow k="Avg retention" v="78%" />
              <PerfRow k="Best episode" v="2.1M (ep 73)" />
              <PerfRow k="Followers gained" v="+18,420" />
              <PerfRow k="Engagement rate" v="9.4%" />
            </dl>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="card p-6">
            <h3 className="font-display font-semibold mb-4">Up next</h3>
            <ul className="divide-y divide-line/60 text-sm">
              {QUEUE.map((q) => (
                <li key={q.ep} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-ink">ep {q.ep} · {q.title}</p>
                    <p className="text-xs text-ink-mute">{q.when}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    q.status === "rendering" ? "bg-accent/15 text-accent" :
                    q.status === "scripting" ? "bg-brand/15 text-brand" :
                    "bg-ink-mute/10 text-ink-mute"
                  }`}>{q.status}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h3 className="font-display font-semibold mb-4">Recently posted</h3>
            <ul className="divide-y divide-line/60 text-sm">
              {POSTED.map((p) => (
                <li key={p.ep} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-ink">ep {p.ep} · {p.title}</p>
                    <p className="text-xs text-ink-mute">{p.platform} · {p.when}</p>
                  </div>
                  <span className="text-brand text-sm">{p.views}</span>
                </li>
              ))}
            </ul>
            <Link href="/dashboard/library" className="mt-4 inline-block text-sm text-brand hover:underline">
              See all posted →
            </Link>
          </section>
        </div>

        <section className="card p-6">
          <h3 className="font-display font-semibold mb-2">Danger zone</h3>
          <p className="text-sm text-ink-dim">Pause stops generation. Delete removes the series and its queue. Already-posted videos stay on your social accounts.</p>
          <div className="mt-4 flex gap-2">
            <button className="btn-ghost text-sm py-2 px-3">Pause series</button>
            <button className="btn-ghost text-sm py-2 px-3 border-red-500/30 text-red-400 hover:bg-red-500/5">Delete series</button>
          </div>
        </section>
      </main>
    </>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xs text-ink-mute">{k}</p>
      <p className="text-ink-dim mt-0.5">{v}</p>
    </div>
  );
}

function PerfRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-mute">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
