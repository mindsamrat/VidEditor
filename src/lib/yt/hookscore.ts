// Port of .claude/skills/yt-script/hookscore.py - same weights, same verdict.
//
// Five properties, 0-100 each; the verdict is 60% the mean and 40% the weakest,
// because a hook leaks at its dead property and averaging hides that. It is a
// heuristic: a low score is a reason to look again, a high one is no promise.
import { formulaHits } from "./formulas";

const FILLER = new Set(["basically", "actually", "literally", "just", "really", "very", "so", "kind", "sort", "like",
  "guys", "hey", "welcome", "today", "video", "subscribe", "channel"]);
const VAGUE = new Set(["amazing", "incredible", "insane", "crazy", "huge", "massive", "game", "changer", "secret",
  "powerful", "ultimate", "best", "revolutionary", "mind", "blowing", "unbelievable"]);
const CONCRETE = /\b(\d[\d,.]*\s?(%|k|m|x|s|m|h)?|\$\d|\d+\s?(second|minute|hour|day|week|month|year)s?)\b/gi;
const YOU = /\b(you|your|you're|youre|yourself)\b/gi;
const STAKE = /\b(lose|lost|wasting|waste|quit|fail|broke|cost|risk|before|stop|never|die|dying|dead)\b/gi;
const CURIOSITY = /\b(why|how|what|which|until|before|but|nobody|almost|except|reason|actually)\b/gi;

const count = (re: RegExp, t: string) => (t.match(re) || []).length;
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const words = (t: string) => t.toLowerCase().match(/[a-z0-9'%$.]+/g) || [];
const isUpperInitial = (w: string) => {
  const c = w.slice(0, 1);
  return c !== c.toLowerCase() && c === c.toUpperCase();
};

function specificity(t: string) {
  const w = words(t);
  if (!w.length) return 0;
  let s = 34 + count(CONCRETE, t) * 22 - w.filter((x) => VAGUE.has(x)).length * 16 - w.filter((x) => FILLER.has(x)).length * 5;
  // proper nouns that are not sentence-initial read as named things
  s += Math.min(18, 6 * t.split(/\s+/).filter(Boolean).slice(1).filter(isUpperInitial).length);
  return clamp(s);
}

function address(t: string) {
  const first = new RegExp(YOU.source, "i").test(t.split(/\s+/).filter(Boolean).slice(0, 6).join(" ")) ? 30 : 0;
  return clamp(26 + count(YOU, t) * 20 + first);
}

function stakes(t: string) {
  return clamp(22 + count(STAKE, t) * 26 + (new RegExp(CONCRETE.source, "i").test(t) ? 14 : 0));
}

function curiosity(t: string) {
  const q = t.trim().endsWith("?") ? 18 : 0;
  // a hook that resolves itself has no gap left
  const closed = /\b(because|so that|which means)\b/i.test(t) ? -18 : 0;
  return clamp(24 + count(CURIOSITY, t) * 17 + q + closed);
}

function brevity(t: string) {
  const n = words(t).length;
  if (n === 0) return 0;
  // 9-24 words is the band a spoken hook lands in at ~150wpm inside 10 seconds
  if (n >= 9 && n <= 24) return 100;
  if (n < 9) return Math.max(30, 100 - (9 - n) * 11);
  return Math.max(10, 100 - (n - 24) * 7);
}

export const PROPS = ["SPECIFICITY", "ADDRESS", "STAKES", "CURIOSITY", "BREVITY"] as const;
export type Prop = (typeof PROPS)[number];
const FNS: Record<Prop, (t: string) => number> = {
  SPECIFICITY: specificity, ADDRESS: address, STAKES: stakes, CURIOSITY: curiosity, BREVITY: brevity,
};

export const FIX: Record<Prop, string> = {
  SPECIFICITY: "swap one adjective for a number, a name or a date",
  ADDRESS: "say 'you' in the first six words",
  STAKES: "name what it costs them to keep doing it the current way",
  CURIOSITY: "cut the half of the sentence that answers itself",
  BREVITY: "9 to 24 words. Read it out loud and stop where you run out of breath",
};

export type Band = "STRONG" | "WORKABLE" | "WEAK";
export const band = (v: number): Band => (v >= 72 ? "STRONG" : v >= 55 ? "WORKABLE" : "WEAK");

export function classify(t: string) {
  let best: string | null = null;
  let hits = 0;
  for (const { f, n } of formulaHits(t)) if (n > hits) { best = f.name; hits = n; }
  return { formula: best ?? "Unclassified", matched: hits };
}

export type HookScore = {
  hook: string;
  properties: Record<Prop, number>;
  verdict: number;
  band: Band;
  formula: string;
  matched: number;
  weakest: Prop;
};

export function scoreHook(raw: string): HookScore {
  const t = raw;
  const properties = Object.fromEntries(PROPS.map((p) => [p, FNS[p](t)])) as Record<Prop, number>;
  const vals = PROPS.map((p) => properties[p]);
  const verdict = Math.round(0.6 * (vals.reduce((a, b) => a + b, 0) / vals.length) + 0.4 * Math.min(...vals));
  let weakest: Prop = PROPS[0];
  for (const p of PROPS) if (properties[p] < properties[weakest]) weakest = p;
  return { hook: t.trim(), properties, verdict, band: band(verdict), ...classify(t), weakest };
}

export function rankHooks(lines: string[]) {
  return lines.filter((l) => l.trim()).map(scoreHook).sort((a, b) => b.verdict - a.verdict);
}
