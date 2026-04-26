import { SHOWCASE } from "@/lib/data";

export function Showcase() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">Made with ReelForge</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Reels that actually got watched.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {SHOWCASE.map((r, i) => (
          <div key={i} className="card p-2 hover:border-brand/40 transition">
            <div className="aspect-[9/16] rounded-lg bg-bg-elev2 relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(${135 + i * 15}deg, rgba(52,211,153,0.25), rgba(251,191,36,0.18) 60%, transparent)`,
                }}
              />
              <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-bg/80 text-ink-dim font-mono">
                {r.style}
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-[11px] text-ink line-clamp-2">{r.title}</div>
                <div className="text-[10px] text-brand font-mono mt-0.5">{r.views} views</div>
              </div>
              <div className="absolute inset-0 grid place-items-center opacity-70">
                <span className="grid place-items-center w-10 h-10 rounded-full bg-bg/70 backdrop-blur">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v16l14-8z" /></svg>
                </span>
              </div>
            </div>
            <div className="mt-2 px-1 text-[11px] text-ink-mute">{r.niche}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
