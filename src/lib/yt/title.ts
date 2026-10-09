// Port of .claude/skills/yt-package/title.py - lint a title + thumbnail pairing.
// The pairing is the unit: a thumbnail that repeats the title wastes half the click surface.
export const DESKTOP = 60, MOBILE = 40, HARD = 100;
const VAGUE = new Set(["amazing", "incredible", "insane", "crazy", "huge", "massive", "ultimate", "best", "powerful",
  "secret", "revolutionary", "mindblowing", "epic", "perfect", "complete", "everything"]);
const STOP = new Set(["the", "a", "an", "of", "for", "to", "in", "on", "and", "or", "is", "are", "with", "your", "you", "my", "i",
  "this", "that", "it", "how", "what", "why"]);

const words = (t: string) => t.toLowerCase().match(/[a-z0-9']+/g) || [];
const isUpperWord = (w: string) => /[A-Za-z]/.test(w) && w === w.toUpperCase();

export type TitleIssue = { kind: string; message: string };
export type TitleCheck = { title: string; thumb?: string; chars: number; score: number; issues: TitleIssue[]; good: string[] };

export function checkTitle(title: string, thumb?: string): TitleCheck {
  const t = title.trim();
  const n = t.length;
  const issues: TitleIssue[] = [];
  const good: string[] = [];
  const bad = (kind: string, message: string) => issues.push({ kind, message });

  if (n > HARD) bad("length", `${n} characters - YouTube's hard limit is ${HARD}`);
  else if (n > DESKTOP) bad("length", `${n} characters - desktop search cuts near ${DESKTOP}`);
  else good.push(`${n} characters, inside the ${DESKTOP}-character desktop cut`);
  if (n > MOBILE) {
    const cut = t.slice(0, MOBILE);
    const sp = cut.lastIndexOf(" ");
    const head = sp === -1 ? cut : cut.slice(0, sp);
    bad("mobile", `a mobile feed shows about "${head}..." - check the subject survives`);
  }
  const caps = t.split(/\s+/).filter((w) => w.length > 2 && isUpperWord(w));
  if (caps.length > 2) bad("shouting", `${caps.length} all-caps words - two is the ceiling before it reads as spam`);
  else if (caps.length) good.push(`${caps.length} all-caps word${caps.length > 1 ? "s" : ""} for emphasis`);
  const v = words(t).filter((w) => VAGUE.has(w));
  if (v.length) bad("vague", `${Array.from(new Set(v)).sort().join(", ")} - swap for a number, a name or a date`);
  const nums = t.match(/\d[\d,.]*%?/g) || [];
  if (nums.length) good.push(`carries a concrete figure (${nums.slice(0, 3).join(", ")})`);
  else bad("no-number", "no number, date or name - the most reliable single fix");
  if (t.endsWith("?")) good.push("open question in the title");
  if (!words(t).slice(0, 3).some((w) => !STOP.has(w))) bad("front-load", "the first three words are all filler - move the subject forward");
  if (thumb && thumb.trim()) {
    const tw = new Set(words(t).filter((w) => !STOP.has(w)));
    const shared = Array.from(new Set(words(thumb).filter((w) => !STOP.has(w) && tw.has(w)))).sort();
    if (shared.length) bad("duplicate", `thumbnail repeats the title on ${shared.join(", ")} - the thumbnail should say what the title does not`);
    else good.push("thumbnail and title carry different words");
    const tn = words(thumb).length;
    if (tn > 4) bad("thumb-length", `${tn} words on the thumbnail - three is the ceiling at feed size`);
  }
  const score = Math.max(0, Math.min(100, 100 - 14 * issues.length + 4 * good.length));
  return { title: t, thumb: thumb?.trim() || undefined, chars: n, score, issues, good };
}
