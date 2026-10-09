// Port of .claude/skills/yt-viral/swipe.py - rank videos by how far each beat its
// OWN channel's median, then name the title formula. Needs 4+ videos per channel.
import { formulaHits } from "./formulas";

export type SwipeVideo = { channel: string; title: string; views: number; url?: string; duration?: number; published?: string; thumb?: string };
export type Outlier = SwipeVideo & { median: number; multiple: number; formula: string };

export function median(nums: number[]) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Title formula, tie-broken like swipe.py (highest hit count, then name descending). */
export function titleFormula(title: string) {
  const scored = formulaHits(title).filter((h) => h.n > 0)
    .sort((a, b) => b.n - a.n || (a.f.name < b.f.name ? 1 : a.f.name > b.f.name ? -1 : 0));
  return scored.length ? scored[0].f.name : "Unclassified";
}

export function swipe(rows: SwipeVideo[], min = 1.5) {
  const by = new Map<string, SwipeVideo[]>();
  for (const r of rows) {
    const ch = r.channel || "?";
    by.set(ch, [...(by.get(ch) || []), r]);
  }
  let out: Outlier[] = [];
  const thin: { channel: string; count: number }[] = [];
  by.forEach((vids, ch) => {
    const med = median(vids.map((v) => Number(v.views) || 0));
    if (vids.length < 4) { thin.push({ channel: ch, count: vids.length }); return; }
    for (const v of vids) {
      const views = Number(v.views) || 0;
      out.push({ ...v, channel: ch, views: Math.trunc(views), median: Math.trunc(med),
        multiple: med ? Math.round((views / med) * 100) / 100 : 0, formula: titleFormula(v.title || "") });
    }
  });
  out = out.filter((r) => r.multiple >= min).sort((a, b) => b.multiple - a.multiple);
  const formulas = new Map<string, number>();
  for (const r of out) formulas.set(r.formula, (formulas.get(r.formula) || 0) + 1);
  return { outliers: out, thin, formulas: [...formulas.entries()].sort((a, b) => b[1] - a[1]) };
}
