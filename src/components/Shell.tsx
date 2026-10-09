"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { group: "Channel", items: [
    { href: "/", label: "Overview", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
    { href: "/competitors", label: "Competitors", icon: "M4 19V9m6 10V5m6 14v-7m4 7H2" },
  ] },
  { group: "Write", items: [
    { href: "/hooks", label: "Hook Lab", icon: "M13 3L4 14h7l-1 7 9-11h-7z" },
    { href: "/package", label: "Packaging", icon: "M4 5h16v11H4zM8 20h8" },
    { href: "/desk", label: "AI Desk", icon: "M8 10h8M8 14h5M5 4h14a1 1 0 011 1v11a1 1 0 01-1 1h-6l-4 3v-3H5a1 1 0 01-1-1V5a1 1 0 011-1z" },
  ] },
  { group: "Edit", items: [
    { href: "/edit", label: "Edit List", icon: "M6 4l12 16M18 4L6 20" },
    { href: "/chapters", label: "Chapters", icon: "M5 6h14M5 12h14M5 18h9" },
    { href: "/retention", label: "Retention", icon: "M3 5c4 0 5 3 8 5s5 1 10 9" },
  ] },
  { group: "Run", items: [
    { href: "/plan", label: "Week Plan", icon: "M4 6h16v14H4zM4 10h16M9 3v4m6-4v4" },
    { href: "/voice", label: "Voice", icon: "M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM6 11a6 6 0 0012 0M12 17v4" },
    { href: "/settings", label: "Settings", icon: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L7 7.5 5 7 4 10l2 1v2l-2 1 1 3 2-.5L8.5 16 8 18l3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z" },
  ] },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#fff" aria-hidden><path d="M8 5v14l11-7z" /></svg>
      </span>
      Channel Console
    </Link>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const nav = (
    <nav className="space-y-6">
      {NAV.map((g) => (
        <div key={g.group}>
          <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">{g.group}</div>
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${active(it.href) ? "bg-bg-elev2 text-ink" : "text-ink-dim hover:bg-bg-elev hover:text-ink"}`}>
                  <span className={active(it.href) ? "text-brand" : ""}><Icon d={it.icon} /></span>
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-bg-elev/40 px-3 py-5 lg:flex">
        <div className="mb-8 px-3"><Brand /></div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <p className="px-3 pt-4 text-[11px] leading-relaxed text-ink-mute">Read-only. Nothing here publishes - we write, we upload.</p>
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button className="btn-ghost px-2.5 py-1.5" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">
          <Icon d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
        </button>
      </header>
      {open && <div className="border-b border-line bg-bg-elev px-3 py-4 lg:hidden">{nav}</div>}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
