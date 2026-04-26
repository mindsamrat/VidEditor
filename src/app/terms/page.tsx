import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { BRAND } from "@/lib/brand";

export const metadata = { title: "Terms of Service — ReelForge" };

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-16 prose prose-invert">
        <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
        <p className="text-ink-dim text-sm">Last updated: April 2026</p>

        <Section title="1. Acceptance of terms">
          By accessing or using {BRAND.name} you agree to these Terms. If you do not agree, do not use the service.
        </Section>
        <Section title="2. The service">
          {BRAND.name} generates short-form video content using AI and, when authorised, publishes that content to your connected TikTok, Instagram and YouTube accounts on a schedule you define.
        </Section>
        <Section title="3. Your account">
          You are responsible for safeguarding your account credentials and for any activity under your account. You must be at least 16 years old to use the service.
        </Section>
        <Section title="4. Subscriptions and billing">
          Plans renew monthly or annually until cancelled. You can cancel at any time from the billing tab; access continues until the end of the paid period. Refunds: a 7-day money-back is available on Starter and Creator plans for first-time subscribers.
        </Section>
        <Section title="5. Acceptable use">
          You may not use {BRAND.name} to generate or publish content that is illegal, defamatory, infringing, sexually explicit involving minors, or that violates the terms of any connected platform (TikTok, Instagram, YouTube).
        </Section>
        <Section title="6. Content and IP">
          You retain ownership of content generated for your account. You grant {BRAND.name} a limited licence to store, render and publish that content on your behalf. You are responsible for ensuring music or assets you upload are properly licensed.
        </Section>
        <Section title="7. Connected accounts">
          By connecting a social account, you authorise {BRAND.name} to publish on your behalf using each platform&rsquo;s official posting API. You may revoke this access at any time.
        </Section>
        <Section title="8. Disclaimers">
          The service is provided &ldquo;as is&rdquo;. We do not guarantee specific view counts, follower growth, monetisation or platform approval.
        </Section>
        <Section title="9. Changes">
          We may update these Terms from time to time. Material changes will be notified by email.
        </Section>
        <Section title="10. Contact">
          {BRAND.contact}
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-ink-dim leading-relaxed">{children}</p>
    </section>
  );
}
