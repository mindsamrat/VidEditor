"use client";

import { useState } from "react";
import { FAQS } from "@/lib/data";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-5 py-24">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-brand">FAQ</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight text-balance">
          Questions? We&rsquo;ve got you.
        </h2>
      </div>
      <div className="mt-10 divide-y divide-line border border-line rounded-2xl overflow-hidden bg-bg-elev">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 hover:bg-bg-elev2 transition"
              >
                <span className="font-medium text-ink">{f.q}</span>
                <span className={`text-brand transition ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-sm text-ink-dim leading-relaxed">{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
