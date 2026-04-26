import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Privacy Policy — ReelForge" };

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="text-ink-dim text-sm">Last updated: April 2026</p>

        <Block title="Data we collect">
          <ul className="list-disc pl-5 space-y-1">
            <li>Account information (name, email, hashed password).</li>
            <li>OAuth tokens for the social accounts you connect (encrypted at rest).</li>
            <li>Series configuration (niche, art style, voice, schedule).</li>
            <li>Generated assets (scripts, images, audio, rendered videos).</li>
            <li>Billing metadata via Stripe (we never see your card number).</li>
            <li>Usage analytics (page views, feature usage) via PostHog.</li>
          </ul>
        </Block>
        <Block title="How we use it">
          To run the service, generate and publish your videos, send you account &amp; billing email, and improve the product. We do not sell your data.
        </Block>
        <Block title="Sub-processors">
          We use the following sub-processors: AWS / Cloudflare R2 (storage), Anthropic and OpenAI (LLMs), Replicate / fal.ai (image gen), ElevenLabs (TTS), Stripe (payments), Resend (email), PostHog (analytics), Inngest (background jobs).
        </Block>
        <Block title="Your rights">
          You can export, edit or delete your account data from the dashboard at any time. EU/UK/CA users have additional rights under GDPR / UK GDPR / PIPEDA.
        </Block>
        <Block title="Contact">
          {BRAND.contact}
        </Block>
      </main>
      <Footer />
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 text-ink-dim leading-relaxed">
      <h2 className="font-display text-xl font-semibold text-ink mb-2">{title}</h2>
      {children}
    </section>
  );
}
