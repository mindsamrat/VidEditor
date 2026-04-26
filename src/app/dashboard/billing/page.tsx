import Link from "next/link";
import { TopBar } from "@/components/dashboard/TopBar";

export default function BillingPage() {
  return (
    <>
      <TopBar title="Plan &amp; API keys" subtitle="Free during open beta. You bring your own AI keys." />
      <main className="p-6 space-y-6 max-w-4xl">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest bg-brand text-bg px-3 py-1 rounded-full">
                Open beta
              </span>
              <p className="font-display text-3xl font-bold mt-3">Free</p>
              <p className="text-sm text-ink-dim">
                No subscription, no credit card. You only pay your AI providers for what you generate.
              </p>
            </div>
            <Link href="/dashboard/settings" className="btn-brand text-sm">
              Manage API keys
            </Link>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold">Your API keys</h2>
          <p className="text-sm text-ink-dim mt-1">
            Set these as environment variables in Vercel (Project &rarr; Settings &rarr; Environment Variables).
            Keys never hit our database; the server reads them at runtime.
          </p>
          <div className="mt-5 divide-y divide-line/60 text-sm">
            <Key
              env="ANTHROPIC_API_KEY"
              label="Anthropic Claude"
              use="Script writing"
              required
            />
            <Key
              env="OPENAI_API_KEY"
              label="OpenAI"
              use="Image generation (gpt-image-1) + caption alignment (Whisper)"
              required
            />
            <Key
              env="ELEVENLABS_API_KEY"
              label="ElevenLabs"
              use="AI voiceover"
              required
            />
            <Key
              env="ELEVENLABS_VOICE_ID"
              label="ElevenLabs voice ID (optional)"
              use="Defaults to a stock voice if unset"
            />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-1">What this costs you (per video)</h2>
          <p className="text-sm text-ink-dim mb-4">Rough order-of-magnitude for a ~60s reel with 6 scenes.</p>
          <table className="w-full text-sm">
            <thead className="text-left text-ink-mute text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2">Step</th>
                <th className="py-2">Provider</th>
                <th className="py-2">~Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              <tr><td className="py-3">Script (~600 tokens)</td><td className="py-3 text-ink-dim">Claude Sonnet 4.6</td><td className="py-3 text-brand">~$0.005</td></tr>
              <tr><td className="py-3">6 images @ 1024x1536</td><td className="py-3 text-ink-dim">OpenAI gpt-image-1 (low)</td><td className="py-3 text-brand">~$0.066</td></tr>
              <tr><td className="py-3">~60s voiceover</td><td className="py-3 text-ink-dim">ElevenLabs</td><td className="py-3 text-brand">~$0.18</td></tr>
              <tr><td className="py-3 font-medium">Total per video</td><td className="py-3"></td><td className="py-3 font-medium text-brand">~$0.25</td></tr>
            </tbody>
          </table>
          <p className="mt-4 text-xs text-ink-mute">
            Switch to <span className="text-ink">Flux Schnell</span> on Replicate (~$0.003 per image) and
            you can drive total per-video cost under $0.20.
          </p>
        </section>
      </main>
    </>
  );
}

function Key({ env, label, use, required }: { env: string; label: string; use: string; required?: boolean }) {
  return (
    <div className="py-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{label}</p>
          {required && <span className="text-[10px] uppercase tracking-wider text-brand bg-brand/10 px-1.5 py-0.5 rounded">required</span>}
        </div>
        <p className="text-xs text-ink-mute mt-0.5">{use}</p>
        <code className="mt-1 inline-block text-[11px] font-mono text-ink-dim bg-bg-elev2 border border-line rounded px-2 py-0.5">{env}</code>
      </div>
    </div>
  );
}
