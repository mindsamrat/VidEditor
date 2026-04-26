"use client";

import Link from "next/link";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-16 border-b border-line px-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="font-display text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-ink-mute">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="hidden sm:inline-flex btn-ghost text-xs py-2 px-3" aria-label="Search">
          ⌘K · Search
        </button>
        <Link href="/dashboard/create" className="btn-brand text-sm py-2 px-3">
          + New series
        </Link>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-accent grid place-items-center text-bg font-bold text-sm">
          M
        </div>
      </div>
    </header>
  );
}
