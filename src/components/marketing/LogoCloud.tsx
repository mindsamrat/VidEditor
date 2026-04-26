import { LOGOS } from "@/lib/data";

export function LogoCloud() {
  return (
    <section className="border-y border-line bg-bg-elev/40">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-ink-mute">
          Posting natively to · powered by
        </p>
        <div className="mt-5 overflow-hidden">
          <div className="flex gap-12 marquee-track whitespace-nowrap">
            {[...LOGOS, ...LOGOS].map((l, i) => (
              <span key={i} className="text-ink-dim/70 font-display font-semibold tracking-widest text-sm">
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
