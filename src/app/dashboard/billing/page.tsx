import { TopBar } from "@/components/dashboard/TopBar";
import { PLANS } from "@/lib/data";

export default function BillingPage() {
  return (
    <>
      <TopBar title="Billing" subtitle="Manage your plan and invoices." />
      <main className="p-6 space-y-6">
        <section className="card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs text-ink-mute uppercase tracking-wider">Current plan</p>
              <p className="font-display text-3xl font-bold mt-1">Creator</p>
              <p className="text-sm text-ink-dim">$39 / month · renews May 24, 2026</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-ghost text-sm">Manage in Stripe</button>
              <button className="btn-brand text-sm">Upgrade</button>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <Meter label="Videos" used={74} total={120} />
            <Meter label="Active series" used={3} total={5} />
            <Meter label="Social accounts" used={5} total={5} />
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold mb-3">Switch plan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((p) => (
              <div key={p.id} className={`card p-6 ${p.id === "creator" ? "border-brand/60" : ""}`}>
                <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                <p className="text-sm text-ink-dim">{p.blurb}</p>
                <p className="mt-3 text-2xl font-bold">${p.price}<span className="text-sm font-normal text-ink-mute">/mo</span></p>
                <ul className="mt-4 space-y-2 text-sm text-ink-dim">
                  <li>{p.videos}</li>
                  <li>{p.series}</li>
                  {p.highlights.slice(0, 3).map((h) => <li key={h}>{h}</li>)}
                </ul>
                <button className={`mt-5 w-full ${p.id === "creator" ? "btn-ghost" : "btn-brand"}`}>
                  {p.id === "creator" ? "Current plan" : `Switch to ${p.name}`}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Invoices</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-ink-mute text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Apr 24, 2026", "$39.00", "paid"],
                ["Mar 24, 2026", "$39.00", "paid"],
                ["Feb 24, 2026", "$39.00", "paid"],
                ["Jan 24, 2026", "$19.00", "paid"],
              ].map(([d, a, s]) => (
                <tr key={d} className="border-t border-line/60">
                  <td className="py-3 text-ink-dim">{d}</td>
                  <td className="py-3">{a}</td>
                  <td className="py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">{s}</span></td>
                  <td className="py-3 text-right"><a className="text-xs text-ink-dim hover:text-ink" href="#">Download PDF</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}

function Meter({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="rounded-xl border border-line p-4 bg-bg-elev2">
      <p className="text-xs text-ink-mute">{label}</p>
      <p className="text-lg font-medium mt-1">{used} <span className="text-ink-mute text-sm">/ {total}</span></p>
      <div className="mt-2 h-1.5 rounded-full bg-bg overflow-hidden">
        <div className="h-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
