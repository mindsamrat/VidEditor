import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-brand pointer-events-none" />
      <div className="absolute inset-0 bg-grid-faint [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg-elev px-3 py-1 text-xs text-ink-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            New: Voice cloning on the Scale plan
          </span>
          <h1 className="mt-6 font-display font-bold tracking-tight text-balance text-5xl md:text-7xl leading-[1.05]">
            AI faceless reels,<br />
            <span className="text-brand">on auto-pilot.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-ink-dim text-balance">
            Pick a niche. We write the scripts, generate the visuals, voice them,
            edit them, and post to TikTok, Instagram and YouTube — every day,
            while you sleep.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn-brand">
              Start posting in 5 minutes →
            </Link>
            <Link href="/#how" className="btn-ghost">
              See how it works
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-mute">
            Plans from $19/mo · Cancel anytime · 7-day money-back
          </p>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mt-16 mx-auto max-w-5xl">
      <div className="absolute -inset-4 rounded-3xl bg-brand/10 blur-3xl" />
      <div className="relative card p-2">
        <div className="rounded-2xl bg-bg overflow-hidden border border-line">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-line">
            <span className="w-3 h-3 rounded-full bg-line" />
            <span className="w-3 h-3 rounded-full bg-line" />
            <span className="w-3 h-3 rounded-full bg-line" />
            <span className="ml-3 text-xs text-ink-mute font-mono">reelforge.io / dashboard</span>
          </div>
          <div className="grid grid-cols-12 gap-4 p-5">
            <div className="col-span-3 space-y-2">
              {["Overview", "Series", "Library", "Calendar", "Accounts"].map((l, i) => (
                <div key={l} className={`text-sm px-3 py-2 rounded-lg ${i === 1 ? "bg-bg-elev2 text-ink" : "text-ink-dim"}`}>{l}</div>
              ))}
            </div>
            <div className="col-span-9 grid grid-cols-3 gap-3">
              {[
                { t: "Mythology Stories", s: "Posting daily · 24 queued", v: "1.4M views" },
                { t: "Dark Psychology", s: "Posting daily · 18 queued", v: "612K views" },
                { t: "Space Facts", s: "3x/week · 9 queued", v: "2.1M views" },
                { t: "Stoic Motivation", s: "Daily · 31 queued", v: "880K views" },
                { t: "True Crime 60s", s: "Daily · 27 queued", v: "1.0M views" },
                { t: "AI Daily Brief", s: "Daily · 12 queued", v: "210K views" },
              ].map((c) => (
                <div key={c.t} className="rounded-xl border border-line bg-bg-elev p-3 hover:border-ink/30 transition">
                  <div className="aspect-[9/16] rounded-lg bg-gradient-to-br from-bg-elev2 to-bg overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 via-transparent to-accent/10" />
                    <div className="absolute bottom-2 left-2 right-2 text-[10px] text-ink-dim font-mono truncate">{c.t}</div>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="text-ink truncate">{c.t}</div>
                    <div className="text-ink-mute mt-0.5">{c.s}</div>
                    <div className="text-brand mt-1">{c.v}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
