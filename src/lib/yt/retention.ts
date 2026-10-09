// Port of .claude/skills/yt-retention/retention.py - read a YouTube Studio
// audience-retention export and name the three different problems:
// HOOK LEAK (first 30s), CLIFFS (single steep drops), SLIDE (bleed across the middle).
import type { Cue } from "./transcript";

const NUM = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

function csvRows(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  const text = raw.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

export function parseRetentionCsv(raw: string): [number, number][] {
  const out: [number, number][] = [];
  for (const r of csvRows(raw)) {
    const vals = r.map((c) => c.trim().replace(/%/g, "").replace(/,/g, "")).filter((c) => NUM.test(c)).map(Number);
    if (vals.length >= 2) out.push([vals[0], vals[1]]);
  }
  return out;
}

export type Cliff = { from: number; to: number; lost: number; at_seconds: number | null; said?: string };
export type RetentionReport = {
  points: number; start: number; end: number; hook_leak: number; verdict: "healthy" | "leaking" | "severe";
  cliffs: Cliff[]; slide_per_unit: number; pct_axis: boolean; series: [number, number][];
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function analyzeRetention(rows: [number, number][], duration?: number, cues?: Cue[]): RetentionReport | { error: string } {
  if (rows.length < 8) return { error: "could not read at least 8 data points from that csv" };
  const xs = rows.map((r) => r[0]), ys = rows.map((r) => r[1]);
  const pctAxis = Math.max(...xs) <= 100.5;
  const dur = duration && duration > 0 ? duration : undefined;
  const at = (x: number) => (pctAxis && dur ? (x / 100) * dur : x);
  const start = ys[0] || 100;
  const cutoff = !pctAxis ? 30 : dur ? (30 / dur) * 100 : 10;
  const early = rows.filter(([x]) => x <= cutoff).map(([, y]) => y);
  const hookLeak = start - (early.length ? Math.min(...early) : start);
  const drops: [number, number, number, number][] = [];
  for (let i = 1; i < rows.length; i++) {
    const d = ys[i - 1] - ys[i];
    const span = xs[i] - xs[i - 1] || 1;
    drops.push([d / span, xs[i - 1], xs[i], d]);
  }
  drops.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2] || b[3] - a[3]);
  const cliffs: Cliff[] = drops.slice(0, 5).filter((d) => d[3] > 0.8).map(([, a1, b1, d]) => ({
    from: r2(a1), to: r2(b1), lost: r2(d),
    at_seconds: !pctAxis || dur ? Math.round(at(a1) * 10) / 10 : null,
  }));
  const mid = drops.filter((d) => d[1] > cutoff).map((d) => d[0]);
  const slide = mid.length ? mid.reduce((a, b) => a + b, 0) / mid.length : 0;
  if (cues?.length) {
    for (const c of cliffs) {
      if (c.at_seconds == null) continue;
      const t = c.at_seconds;
      c.said = cues.filter((q) => q.start <= t + 4 && q.end >= t - 4).map((q) => q.text).join(" ").slice(0, 140);
    }
  }
  return {
    points: rows.length, start, end: ys[ys.length - 1], hook_leak: r2(hookLeak),
    verdict: hookLeak < 25 ? "healthy" : hookLeak < 40 ? "leaking" : "severe",
    cliffs, slide_per_unit: Math.round(slide * 1000) / 1000, pct_axis: pctAxis, series: rows,
  };
}
