import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="max-w-4xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">Pricing</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Free while we&rsquo;re in open beta.
        </h2>
        <p className="mt-4 text-ink-dim">
          Bring your own API keys (Claude, OpenAI, ElevenLabs). We host the app, the pipeline and
          the auto-poster. You only pay your AI providers for what you actually generate.
        </p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-4">
        <div className="card p-7 border-brand/60 shadow-glow">
          <span className="text-[10px] uppercase tracking-widest bg-brand text-bg px-3 py-1 rounded-full">
            Open beta · free
          </span>
          <h3 className="font-display text-2xl font-bold mt-4">Bring your own keys</h3>
          <p className="text-sm text-ink-dim mt-1">
            The whole product, free. You add your own AI provider keys in settings; we never see them.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink-dim">
            <Row k="Unlimited series" />
            <Row k="Unlimited videos (limited only by your AI provider quotas)" />
            <Row k="All art styles + voices" />
            <Row k="Auto-posting to TikTok, Instagram, YouTube" />
            <Row k="Schedule + calendar + queue" />
            <Row k="Edit-before-post mode" />
          </ul>
          <Link href="/signup" className="mt-7 w-full btn-brand justify-center">
            Start free →
          </Link>
        </div>

        <div className="card p-7">
          <span className="text-[10px] uppercase tracking-widest text-ink-mute border border-line px-3 py-1 rounded-full">
            Coming later · managed
          </span>
          <h3 className="font-display text-2xl font-bold mt-4">We supply the keys</h3>
          <p className="text-sm text-ink-dim mt-1">
            One bill, no key juggling. Pricing TBD when we exit beta &mdash; current users get grandfathered rates.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink-dim">
            <Row k="Everything in beta" />
            <Row k="Anthropic, OpenAI, ElevenLabs &amp; render bundled" />
            <Row k="One invoice, no quotas to track" />
            <Row k="Priority generation queue" />
            <Row k="Voice cloning" />
            <Row k="Team seats" />
          </ul>
          <button disabled className="mt-7 w-full btn-ghost justify-center opacity-60 cursor-not-allowed">
            Notify me when ready
          </button>
        </div>
      </div>
    </section>
  );
}

function Row({ k }: { k: string }) {
  return (
    <li className="flex items-start gap-2">
      <svg className="text-brand mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span dangerouslySetInnerHTML={{ __html: k }} />
    </li>
  );
}
