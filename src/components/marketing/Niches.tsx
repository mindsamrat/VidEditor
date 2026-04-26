import { NICHES } from "@/lib/data";

export function Niches() {
  return (
    <section id="niches" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">Niches</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Pick from 50+ proven faceless niches.
        </h2>
        <p className="mt-4 text-ink-dim">
          Or describe your own theme — the AI will spin up a series for it.
        </p>
      </div>

      <div className="mt-12 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {NICHES.map((n) => (
          <div
            key={n.slug}
            className="card p-5 hover:border-brand/40 hover:shadow-glow transition cursor-pointer"
          >
            <div className="text-3xl">{n.emoji}</div>
            <h3 className="mt-3 font-semibold text-ink">{n.title}</h3>
            <p className="mt-1 text-sm text-ink-dim">{n.blurb}</p>
            <p className="mt-3 text-xs text-ink-mute font-mono">e.g. &ldquo;{n.sample}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
