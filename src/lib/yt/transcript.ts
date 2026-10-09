// Port of .claude/skills/yt-edit/deadair.py - transcript parsing and the edit decision list.
// It prints cuts. It never touches media.
export type Cue = { start: number; end: number; text: string };

export const FILLER_ONLY = /^[\s,.-]*((um+|uh+|er+|ah+|so|okay|ok|right|yeah|like|anyway|basically|actually|you know|i mean|let me see|hold on)[\s,.-]*)+$/i;

export function parseTs(s: string) {
  const p = s.trim().replace(",", ".").split(":");
  return p.length === 3 ? parseInt(p[0]) * 3600 + parseInt(p[1]) * 60 + parseFloat(p[2]) : parseInt(p[0]) * 60 + parseFloat(p[1]);
}

/** SRT, VTT or Whisper JSON ({segments:[{start,end,text}]} or a bare array). */
export function parseTranscript(raw: string): Cue[] {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const d = JSON.parse(trimmed);
      const segs = Array.isArray(d) ? d : d.segments || [];
      return segs.map((s: { start: number; end: number; text?: string }) => ({
        start: Number(s.start), end: Number(s.end), text: (s.text || "").trim(),
      }));
    } catch { /* fall through to srt/vtt */ }
  }
  const cues: { start: number; end: number; lines: string[] }[] = [];
  let cur: (typeof cues)[number] | null = null;
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*(\d[\d:.,]+)\s*-->\s*(\d[\d:.,]+)/);
    if (m) {
      cur = { start: parseTs(m[1]), end: parseTs(m[2]), lines: [] };
      cues.push(cur);
    } else if (cur && line.trim() && !/^\d+$/.test(line.trim())) {
      cur.lines.push(line.trim());
    }
  }
  return cues.filter((c) => c.lines.length).map((c) => ({ start: c.start, end: c.end, text: c.lines.join(" ") }));
}

export type Cut = { kind: "DEAD" | "FILLER" | "REPEAT"; start: number; end: number; why: string };
export type Edl = { duration: number; cues: number; cuts: Cut[]; removed: number; out: number };

const norm = (t: string) => t.toLowerCase().replace(/[^a-z ]/g, "").split(/\s+/).filter(Boolean);
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function deadAir(cues: Cue[], floor = 0.45): Edl {
  if (!cues.length) return { duration: 0, cues: 0, cuts: [], removed: 0, out: 0 };
  const dur = cues[cues.length - 1].end;
  let cuts: Cut[] = [];
  cues.forEach((c, i) => {
    const t = c.text;
    if (FILLER_ONLY.test(t)) cuts.push({ kind: "FILLER", start: c.start, end: c.end, why: t.trim().slice(0, 48) });
    if (i) {
      const gap = c.start - cues[i - 1].end;
      if (gap > floor) {
        const keep = floor / 2;
        cuts.push({ kind: "DEAD", start: r3(cues[i - 1].end + keep), end: r3(c.start - keep), why: `${gap.toFixed(2)}s gap` });
      }
    }
    // A restart is compared against the last cue that was actually SPEECH, not the literal
    // previous cue - most retakes have an "um" between the two attempts.
    if (t.trim() && !FILLER_ONLY.test(t)) {
      let j = i - 1;
      while (j >= 0 && (FILLER_ONLY.test(cues[j].text) || !cues[j].text.trim())) j--;
      if (j >= 0) {
        const a1 = norm(cues[j].text).slice(0, 5), b1 = norm(t).slice(0, 5);
        if (a1.length >= 3 && a1.join(" ") === b1.join(" "))
          cuts.push({ kind: "REPEAT", start: cues[j].start, end: cues[j].end, why: `restart of "${a1.join(" ")}"` });
      }
    }
  });
  cuts = cuts.filter((c) => c.end > c.start).sort((a, b) => a.start - b.start);
  const removed = cuts.reduce((s, c) => s + (c.end - c.start), 0);
  return { duration: dur, cues: cues.length, cuts, removed: r3(removed), out: r3(dur - removed) };
}

export function fmtTime(sec: number, withMs = false) {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const ss = withMs ? r.toFixed(2).padStart(5, "0") : String(Math.floor(r)).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
