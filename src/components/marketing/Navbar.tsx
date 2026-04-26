"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#niches", label: "Niches" },
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-bg/70 border-b border-line">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-dim">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-ink transition">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="text-sm text-ink-dim hover:text-ink px-3 py-2">
            Log in
          </Link>
          <Link href="/signup" className="btn-brand text-sm py-2.5 px-4">
            Start for $19
          </Link>
        </div>
        <button
          className="md:hidden p-2 -mr-2 text-ink"
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-line bg-bg-elev">
          <div className="px-5 py-4 flex flex-col gap-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-ink-dim hover:text-ink">
                {n.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="btn-ghost flex-1 text-sm py-2.5">Log in</Link>
              <Link href="/signup" className="btn-brand flex-1 text-sm py-2.5">Start free</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
