import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export const metadata = {
  title: "Pricing — ReelForge",
  description: "Simple plans from $19/mo. Month-to-month. Cancel anytime.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="pt-12">
          <Pricing />
        </div>
        <CompareTable />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function CompareTable() {
  const rows = [
    ["Videos / month", "30", "120", "400"],
    ["Active series", "1", "5", "Unlimited"],
    ["Connected social accounts", "1", "5", "Unlimited"],
    ["Art styles", "10", "10", "10 + custom"],
    ["AI voices", "6", "6", "6 + voice clone"],
    ["Music sources", "Library", "Library + upload + TikTok sound", "All + brand kits"],
    ["Captions", "Standard", "Standard + styles", "All + brand"],
    ["Auto-posting (TikTok / IG / YT)", "✓", "✓", "✓"],
    ["Schedule + queue", "Daily", "Custom cadence", "Custom + bulk"],
    ["Edit-before-post mode", "✓", "✓", "✓"],
    ["Export resolution", "720p", "1080p", "1080p + 4K"],
    ["Generation priority", "Standard", "Priority", "Highest"],
    ["Team seats", "—", "—", "3 included"],
    ["API access", "—", "—", "✓"],
  ];
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <h2 className="text-center font-display text-3xl font-bold">Compare plans</h2>
      <div className="mt-8 overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-mute border-b border-line">
              <th className="px-6 py-4 font-medium">Feature</th>
              <th className="px-6 py-4 font-medium">Starter · $19</th>
              <th className="px-6 py-4 font-medium text-brand">Creator · $39</th>
              <th className="px-6 py-4 font-medium">Scale · $69</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, a, b, c]) => (
              <tr key={k} className="border-b border-line/60 last:border-0">
                <td className="px-6 py-3 text-ink-dim">{k}</td>
                <td className="px-6 py-3">{a}</td>
                <td className="px-6 py-3 text-brand">{b}</td>
                <td className="px-6 py-3">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
