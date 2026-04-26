import Link from "next/link";

export function CTA() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-20">
      <div className="card relative overflow-hidden p-10 md:p-14 text-center">
        <div className="absolute inset-0 bg-radial-brand pointer-events-none" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
            Your faceless channel could be live tonight.
          </h2>
          <p className="mt-4 text-ink-dim max-w-xl mx-auto">
            Connect TikTok, Instagram and YouTube once. Pick a niche.
            Wake up tomorrow to your first auto-posted reel.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="btn-brand">
              Start for $19 →
            </Link>
            <Link href="/pricing" className="btn-ghost">
              See all plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
