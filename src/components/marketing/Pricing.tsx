"use client";

import Link from "next/link";
import { useState } from "react";
import { PLANS } from "@/lib/data";

export function Pricing({ compact = false }: { compact?: boolean }) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="max-w-6xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">Pricing</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Less than the cost of a video editor for an afternoon.
        </h2>
        <p className="mt-4 text-ink-dim">
          Month-to-month. Cancel anytime. 7-day money-back on Starter and Creator.
        </p>

        <div className="mt-6 inline-flex items-center gap-1 p-1 rounded-full border border-line bg-bg-elev">
          <button
            onClick={() => setYearly(false)}
            className={`px-4 py-1.5 text-sm rounded-full transition ${!yearly ? "bg-brand text-bg" : "text-ink-dim"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`px-4 py-1.5 text-sm rounded-full transition ${yearly ? "bg-brand text-bg" : "text-ink-dim"}`}
          >
            Yearly <span className="text-[10px] opacity-80">−20%</span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid md:grid-cols-3 gap-4">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`card p-7 relative ${p.highlight ? "border-brand/60 shadow-glow" : ""}`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest bg-brand text-bg px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <h3 className="font-display text-xl font-bold">{p.name}</h3>
            <p className="text-sm text-ink-dim mt-1">{p.blurb}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold">${yearly ? p.yearlyPrice : p.price}</span>
              <span className="text-ink-mute text-sm">/mo</span>
            </div>
            {yearly && (
              <p className="text-[11px] text-brand mt-1">billed annually · save ${(p.price - p.yearlyPrice) * 12}/yr</p>
            )}

            <Link
              href="/signup"
              className={`mt-6 w-full ${p.highlight ? "btn-brand" : "btn-ghost"} justify-center`}
            >
              {p.cta}
            </Link>

            <div className="mt-7 space-y-3 text-sm">
              <Row k={p.videos} />
              <Row k={p.series} />
              {p.highlights.map((h) => (
                <Row key={h} k={h} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <p className="mt-10 text-center text-xs text-ink-mute">
          All plans include: AI scripts · 10 art styles · 6 voices · Animated captions · Auto-posting · Calendar · Dashboard · Email support
        </p>
      )}
    </section>
  );
}

function Row({ k }: { k: string }) {
  return (
    <div className="flex items-start gap-2 text-ink-dim">
      <svg className="text-brand mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>{k}</span>
    </div>
  );
}
