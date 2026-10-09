"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocal } from "@/lib/store";
import { parseTranscript } from "@/lib/yt/transcript";
import { chapters, MIN_CHAPTER, validChapters } from "@/lib/yt/chapters";
import { Badge, Card, CopyButton, Gate, PageHeader, TextDrop } from "@/components/ui";

export default function Chapters() {
  const [raw, setRaw] = useLocal("chapters:transcript", "");
  const [target, setTarget] = useState(7);
  const result = useMemo(() => chapters(parseTranscript(raw), target), [raw, target]);
  const [titles, setTitles] = useState<string[]>([]);
  useEffect(() => setTitles(result.chapters.map((c) => c.draft_title)), [result]);

  const block = result.chapters.map((c, i) => `${c.label} ${titles[i] ?? c.draft_title}`).join("\n");
  const valid = validChapters(result.chapters);
  const drafts = result.chapters.filter((c, i) => (titles[i] ?? c.draft_title) === c.draft_title).length;

  return (
    <>
      <PageHeader title="Chapters" sub="Chapter boundaries from the pauses actually taken, scored by how much the topic shifts across them, then checked against YouTube's rules so they render." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Transcript">
            <TextDrop value={raw} onChange={setRaw} rows={12} accept=".srt,.vtt,.json,.txt" placeholder="Paste an SRT, VTT or Whisper JSON" />
            <label className="label mt-4" htmlFor="target">Up to {target} chapters</label>
            <input id="target" type="range" min={3} max={15} value={target} onChange={(e) => setTarget(+e.target.value)} className="w-full accent-[#FF5A4E]" />
          </Card>
          <Card title="YouTube's rules">
            <ul className="space-y-1.5 text-sm text-ink-dim">
              <li>The first entry must be <b className="text-ink">0:00</b>.</li>
              <li>At least <b className="text-ink">three</b> chapters.</li>
              <li>Each at least <b className="text-ink">{MIN_CHAPTER} seconds</b>.</li>
            </ul>
            <p className="mt-3 text-xs text-ink-mute">Break any one and the block silently stays plain text in the description.</p>
          </Card>
        </div>
        <div className="space-y-4 lg:col-span-3">
          {result.chapters.length ? (
            <Card title="Retitle every line"
              aside={<div className="flex items-center gap-2"><Badge tone={valid ? "good" : "bad"}>{valid ? "valid" : "invalid"}</Badge><CopyButton text={block} label="Copy block" /></div>}>
              <p className="mb-4 text-sm text-ink-dim">The draft titles are topic words, not our words. Rewrite each as the promise of that section, three to five words. If a section can&apos;t be named in five words, it&apos;s two sections or it&apos;s filler.</p>
              <ul className="space-y-2">
                {result.chapters.map((c, i) => (
                  <li key={c.start} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 font-mono text-sm tabular-nums text-ink-dim">{c.label}</span>
                    <input className="input" value={titles[i] ?? ""} onChange={(e) => setTitles(titles.map((t, j) => (j === i ? e.target.value : t)))} aria-label={`Chapter at ${c.label}`} />
                    <span className="w-12 shrink-0 text-right text-xs tabular-nums text-ink-mute">{Math.round(c.seconds)}s</span>
                  </li>
                ))}
              </ul>
              {drafts > 0 && <p className="mt-4 text-xs text-amber-300/90">{drafts} line{drafts === 1 ? " is" : "s are"} still the draft topic words.</p>}
              <pre className="mt-4 overflow-x-auto rounded-lg bg-bg p-3 font-mono text-xs leading-relaxed text-ink-dim">{block}</pre>
            </Card>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">{raw.trim() ? result.error || "No cues found." : "Chapters appear here."}</p>
          )}
        </div>
      </div>
      <Gate />
    </>
  );
}
