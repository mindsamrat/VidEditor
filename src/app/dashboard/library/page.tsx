import { TopBar } from "@/components/dashboard/TopBar";

const VIDEOS = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  title: [
    "How Thor lost his hammer",
    "The 7-second rule",
    "What's inside Jupiter",
    "Marcus Aurelius on pain",
    "How Cleopatra really died",
    "Why Achilles had a weak heel",
    "The myth of Pandora",
    "Loki's last trick",
    "Anubis and the soul scale",
  ][i % 9],
  series: ["Mythology", "Dark Psych", "Space", "Stoic"][i % 4],
  views: ["412K", "108K", "892K", "61K", "190K", "82K", "1.2M", "45K", "230K"][i % 9],
  status: ["posted", "queued", "scripting", "rendering"][i % 4],
}));

export default function LibraryPage() {
  return (
    <>
      <TopBar title="Library" subtitle="Every video this account has produced." />
      <main className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {["All", "Posted", "Queued", "Drafts", "Mythology", "Dark Psych", "Space", "Stoic"].map((c, i) => (
            <button
              key={c}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                i === 0 ? "border-brand text-brand bg-brand/5" : "border-line text-ink-dim hover:text-ink"
              }`}
            >
              {c}
            </button>
          ))}
          <input
            placeholder="Search title…"
            className="ml-auto bg-bg-elev2 border border-line rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand w-48"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {VIDEOS.map((v) => (
            <div key={v.id} className="card p-2 hover:border-brand/30 transition group">
              <div className="aspect-[9/16] rounded-lg bg-bg-elev2 relative overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(${135 + v.id * 9}deg, rgba(52,211,153,0.22), rgba(251,191,36,0.16) 60%, transparent)` }}
                />
                <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-bg/80 text-ink-dim font-mono">
                  {v.series}
                </span>
                <span className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  v.status === "posted" ? "bg-brand/15 text-brand" :
                  v.status === "rendering" ? "bg-accent/15 text-accent" :
                  "bg-bg/80 text-ink-dim"
                }`}>{v.status}</span>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[11px] text-ink line-clamp-2">{v.title}</p>
                  {v.status === "posted" && (
                    <p className="text-[10px] text-brand font-mono mt-0.5">{v.views} views</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
