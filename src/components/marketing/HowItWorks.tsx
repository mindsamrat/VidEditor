import { STEPS } from "@/lib/data";

export function HowItWorks() {
  return (
    <section id="how" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">How it works</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          From idea to posted reel in under 5 minutes.
        </h2>
        <p className="mt-4 text-ink-dim">
          One setup. Then your channels grow on a schedule, without you opening the app.
        </p>
      </div>

      <div className="mt-14 grid md:grid-cols-4 gap-4">
        {STEPS.map((s, i) => (
          <div key={s.n} className="card p-6 relative">
            <div className="text-xs font-mono text-brand">{s.n}</div>
            <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-dim">{s.body}</p>
            {i < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-line" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-14 card p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h3 className="font-display text-2xl font-bold">The Series engine</h3>
          <p className="mt-3 text-ink-dim">
            Most tools make you re-prompt for every video. ReelForge runs a{" "}
            <span className="text-ink">Series</span>: one theme, one style, one voice — and a
            queue that keeps generating new episodes forever. Your channel grows a
            consistent brand, the algorithm rewards it.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-ink-dim">
            <li className="flex gap-2"><span className="text-brand">→</span> One theme, infinite consistent episodes.</li>
            <li className="flex gap-2"><span className="text-brand">→</span> Per-series voice, art style, music and posting cadence.</li>
            <li className="flex gap-2"><span className="text-brand">→</span> Run multiple series in parallel for multiple channels.</li>
          </ul>
        </div>
        <div className="relative">
          <div className="rounded-2xl border border-line bg-bg-elev2 p-5 font-mono text-xs leading-relaxed">
            <div className="text-ink-mute">{"// new Series"}</div>
            <div><span className="text-accent">name</span>: <span className="text-brand">{"“Mythology Stories”"}</span></div>
            <div><span className="text-accent">style</span>: <span className="text-brand">{"“Cinematic Realism”"}</span></div>
            <div><span className="text-accent">voice</span>: <span className="text-brand">{"“Atlas”"}</span></div>
            <div><span className="text-accent">music</span>: <span className="text-brand">{"“epic-orchestral.mp3”"}</span></div>
            <div><span className="text-accent">cadence</span>: <span className="text-brand">{"“daily 18:00 UTC”"}</span></div>
            <div><span className="text-accent">posts_to</span>: <span className="text-brand">{"[“tiktok”, “ig”, “yt”]"}</span></div>
            <div className="mt-3 text-ink-mute">{"// status"}</div>
            <div className="text-brand">▶ generating episode 27 / ∞</div>
          </div>
        </div>
      </div>
    </section>
  );
}
