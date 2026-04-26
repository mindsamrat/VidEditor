import { TESTIMONIALS } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">Loved by faceless creators</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Real channels. Real growth. Zero face time.
        </h2>
      </div>
      <div className="mt-12 columns-1 md:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
        {TESTIMONIALS.map((t) => (
          <div key={t.handle} className="card p-6 break-inside-avoid">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-accent grid place-items-center text-bg font-bold">
                {t.name[0]}
              </div>
              <div>
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-ink-mute">{t.handle}</div>
              </div>
            </div>
            <p className="mt-4 text-ink-dim text-sm leading-relaxed">&ldquo;{t.body}&rdquo;</p>
            <div className="mt-4 inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-line text-brand bg-brand/5">
              {t.stat}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
