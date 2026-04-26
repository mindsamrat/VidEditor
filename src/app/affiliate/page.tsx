import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";

export const metadata = { title: "Affiliate Program — ReelForge" };

export default function AffiliatePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="max-w-3xl mx-auto px-5 py-20 text-center">
          <p className="text-xs uppercase tracking-widest text-brand">Affiliate program</p>
          <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-balance">
            Earn 30% recurring on every signup.
          </h1>
          <p className="mt-4 text-ink-dim">
            For 12 months. Paid monthly. No cap. Faceless creators love telling other faceless creators about ReelForge.
          </p>
          <Link href="/signup" className="mt-8 inline-flex btn-brand">
            Become an affiliate
          </Link>
        </section>
        <section className="max-w-4xl mx-auto px-5 pb-20 grid sm:grid-cols-3 gap-4">
          {[
            { k: "30%", v: "Recurring commission" },
            { k: "12 mo", v: "Per referred customer" },
            { k: "60 days", v: "Cookie window" },
          ].map((s) => (
            <div key={s.k} className="card p-6 text-center">
              <div className="text-3xl font-display text-brand">{s.k}</div>
              <div className="mt-1 text-sm text-ink-dim">{s.v}</div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
