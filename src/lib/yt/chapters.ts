// Port of .claude/skills/yt-chapters/chapters.py - chapter boundaries from the pauses
// actually taken, scored by gap length and vocabulary shift, validated against
// YouTube's rules (starts at 0:00, 3+ entries, each 10s+).
import type { Cue } from "./transcript";
import { fmtTime } from "./transcript";

const STOP = new Set(("the a an of for to in on and or is are was were be been with this that it as at by from " +
  "you your i my we our they them he she but so if then than there here what which who how " +
  "when where why not no yes do does did just really very like about into over out up down " +
  "can could will would should have has had get got make made go going went one two").split(" "));

const keywords = (text: string) => new Set((text.toLowerCase().match(/[a-z']{4,}/g) || []).filter((w) => !STOP.has(w)));
const occurrences = (hay: string, needle: string) => hay.split(needle).length - 1;

export const MIN_CHAPTER = 10;
export type Chapter = { start: number; label: string; draft_title: string; seconds: number };

export function chapters(cues: Cue[], target = 7): { valid: boolean; chapters: Chapter[]; error?: string } {
  if (cues.length < 6) return { valid: false, chapters: [], error: "too few cues to chapter" };
  const dur = cues[cues.length - 1].end;
  const cand: [number, number, number][] = [];
  for (let i = 1; i < cues.length; i++) {
    const gap = cues[i].start - cues[i - 1].end;
    const kb = keywords(cues.slice(Math.max(0, i - 12), i).map((c) => c.text).join(" "));
    const ka = keywords(cues.slice(i, i + 12).map((c) => c.text).join(" "));
    const union = new Set([...kb, ...ka]);
    const inter = [...kb].filter((w) => ka.has(w)).length;
    const shift = union.size ? 1 - inter / union.size : 0;
    cand.push([gap * 1.6 + shift * 3.2, cues[i].start, i]);
  }
  cand.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  const picked = [0];
  for (const [, t] of cand) {
    if (picked.length >= target) break;
    if (picked.every((p) => Math.abs(t - p) >= MIN_CHAPTER) && dur - t >= MIN_CHAPTER) picked.push(t);
  }
  picked.sort((a, b) => a - b);
  const out = picked.map((t, n) => {
    const end = n + 1 < picked.length ? picked[n + 1] : dur;
    const text = cues.filter((c) => c.start >= t && c.end <= end).map((c) => c.text).join(" ");
    const lower = text.toLowerCase();
    const kw = [...keywords(text)].sort((a, b) => occurrences(lower, b) - occurrences(lower, a));
    const title = kw.slice(0, 3).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") || "Section";
    return { start: Math.round(t * 100) / 100, label: fmtTime(t), draft_title: title, seconds: Math.round((end - t) * 100) / 100 };
  });
  return { valid: validChapters(out), chapters: out };
}

export function validChapters(list: { start: number; seconds: number }[]) {
  return list.length >= 3 && list[0].start === 0 && list.every((c) => c.seconds >= MIN_CHAPTER);
}
