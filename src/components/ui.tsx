"use client";
import Link from "next/link";
import { useState } from "react";

export function PageHeader({ title, sub, children }: { title: string; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-ink-dim">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Card({ title, aside, children, className = "" }: { title?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-xl border border-line bg-bg-elev p-5 shadow-card ${className}`}>
      {(title || aside) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-bg-elev p-4">
      <div className="text-xs text-ink-mute">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-dim">{hint}</div>}
    </div>
  );
}

const TONES = {
  good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  bad: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  neutral: "border-line bg-bg-elev2 text-ink-dim",
  brand: "border-brand/30 bg-brand/10 text-brand-hi",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${TONES[tone]}`}>{children}</span>;
}

/** Status always carries a text label, never colour alone. */
export const bandTone = (band: string): Tone => (band === "STRONG" || band === "healthy" ? "good" : band === "WORKABLE" || band === "leaking" ? "warn" : "bad");
export const scoreTone = (n: number): Tone => (n >= 80 ? "good" : n >= 60 ? "warn" : "bad");

export function Meter({ value, label }: { value: number; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wider text-ink-mute">{label}</span>}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-elev2" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <span className="w-8 text-right text-xs tabular-nums text-ink-dim">{value}</span>
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className="btn-ghost px-2.5 py-1 text-xs" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1400); } catch { /* clipboard blocked */ }
    }}>{done ? "Copied" : label}</button>
  );
}

/** A textarea that also accepts a dropped or picked text file. */
export function TextDrop({ value, onChange, placeholder, rows = 8, accept }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; accept?: string;
}) {
  const [over, setOver] = useState(false);
  const read = (f?: File | null) => { if (f) f.text().then(onChange); };
  return (
    <div className={`rounded-lg border ${over ? "border-brand/60" : "border-transparent"}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); read(e.dataTransfer.files?.[0]); }}>
      <textarea className="input font-mono text-xs leading-relaxed" rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} spellCheck={false} />
      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-ink-mute hover:text-ink-dim">
        <input type="file" className="hidden" accept={accept} onChange={(e) => read(e.target.files?.[0])} />
        <span className="underline decoration-dotted underline-offset-4">or choose a file</span>
        <span>· drag &amp; drop works too</span>
      </label>
    </div>
  );
}

export function Empty({ title, children, href, cta }: { title: string; children?: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-6 py-12 text-center">
      <div className="font-medium">{title}</div>
      {children && <div className="mx-auto mt-1.5 max-w-md text-sm text-ink-dim">{children}</div>}
      {href && cta && <Link href={href} className="btn-primary mt-5">{cta}</Link>}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{children}</div>;
}

export function Gate() {
  return (
    <p className="mt-6 border-t border-line pt-4 text-sm text-ink-dim">
      Nothing here publishes. This writes; you upload. <span className="font-medium text-ink">Ship it, or change it?</span>
    </p>
  );
}
