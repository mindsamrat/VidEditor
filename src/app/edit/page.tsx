"use client";
import { useMemo, useState } from "react";
import { useLocal } from "@/lib/store";
import { deadAir, fmtTime, parseTranscript } from "@/lib/yt/transcript";
import { Badge, Card, CopyButton, Gate, PageHeader, Stat, TextDrop, type Tone } from "@/components/ui";

const KIND: Record<string, { tone: Tone; note: string }> = {
  DEAD: { tone: "neutral", note: "gap trimmed from the middle so both sides keep a breath" },
  FILLER: { tone: "warn", note: "a cue that is nothing but filler" },
  REPEAT: { tone: "bad", note: "the first take of a restarted sentence" },
};

export default function EditList() {
  const [raw, setRaw] = useLocal("edit:transcript", "");
  const [floor, setFloor] = useState(0.45);
  const cues = useMemo(() => parseTranscript(raw), [raw]);
  const edl = useMemo(() => deadAir(cues, floor), [cues, floor]);
  const [show, setShow] = useState<Record<string, boolean>>({ DEAD: true, FILLER: true, REPEAT: true });
  const cuts = edl.cuts.filter((c) => show[c.kind]);
  const text = edl.cuts.map((c, i) => `${String(i + 1).padStart(3, "0")}  ${c.kind.padEnd(6)}  ${fmtTime(c.start, true)} -> ${fmtTime(c.end, true)}  ${(c.end - c.start).toFixed(2)}s  ${c.why}`).join("\n");
  const csv = "kind,start,end,seconds,why\n" + edl.cuts.map((c) => `${c.kind},${c.start},${c.end},${(c.end - c.start).toFixed(3)},"${c.why.replace(/"/g, '""')}"`).join("\n");

  return (
    <>
      <PageHeader title="Edit List" sub="Drop in the raw recording's transcript (SRT, VTT or Whisper JSON). You get an edit decision list - dead air, filler, retakes - with timecodes. It never touches the footage; apply the cuts in your editor." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Transcript">
            <TextDrop value={raw} onChange={setRaw} rows={12} accept=".srt,.vtt,.json,.txt"
              placeholder={"1\n00:00:00,000 --> 00:00:03,200\nSo today we are testing…"} />
            <div className="mt-4">
              <label className="label" htmlFor="floor">Dead-air floor: {floor.toFixed(2)}s</label>
              <input id="floor" type="range" min={0.2} max={1.5} step={0.05} value={floor} onChange={(e) => setFloor(+e.target.value)} className="w-full accent-[#FF5A4E]" />
              <p className="mt-1 text-xs text-ink-mute">Gaps longer than this get cut. Lower is tighter; 0.35-0.45 suits talking-head.</p>
            </div>
          </Card>
          <p className="text-xs text-ink-mute">No transcript yet? Whisper, faster-whisper, or the auto-captions YouTube makes on an unlisted upload all work. Don&apos;t guess at timings.</p>
        </div>
        <div className="space-y-4 lg:col-span-3">
          {cues.length ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Runtime in" value={fmtTime(edl.duration)} hint={`${edl.cues} cues`} />
                <Stat label="Cut" value={`${edl.removed.toFixed(1)}s`} hint={`${edl.cuts.length} cuts · ${edl.duration ? ((edl.removed / edl.duration) * 100).toFixed(1) : 0}%`} />
                <Stat label="Runtime out" value={fmtTime(edl.out)} hint="speech only" />
              </div>
              <Card title="Cuts" aside={<div className="flex gap-2"><CopyButton text={text} label="Copy EDL" /><CopyButton text={csv} label="Copy CSV" /></div>}>
                <div className="mb-3 flex flex-wrap gap-2">
                  {Object.keys(KIND).map((k) => (
                    <label key={k} className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-dim">
                      <input type="checkbox" checked={show[k]} onChange={(e) => setShow({ ...show, [k]: e.target.checked })} className="accent-[#FF5A4E]" />
                      {k} ({edl.cuts.filter((c) => c.kind === k).length})
                    </label>
                  ))}
                </div>
                <div className="-mx-5 max-h-[520px] overflow-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      {cuts.map((c, i) => (
                        <tr key={i} className="border-t border-line/60">
                          <td className="py-2 pl-5"><Badge tone={KIND[c.kind].tone}>{c.kind}</Badge></td>
                          <td className="whitespace-nowrap py-2 pl-3 font-mono text-xs tabular-nums">{fmtTime(c.start, true)} → {fmtTime(c.end, true)}</td>
                          <td className="py-2 pl-3 text-right font-mono text-xs tabular-nums text-ink-dim">{(c.end - c.start).toFixed(2)}s</td>
                          <td className="py-2 pl-4 pr-5 text-xs text-ink-dim" title={KIND[c.kind].note}>{c.why}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!cuts.length && <p className="px-5 py-6 text-sm text-ink-mute">Nothing to cut at this floor.</p>}
                </div>
              </Card>
              <p className="text-xs text-ink-mute">The cut percentage is a cut of <b>speech</b>. If the video has a long silent demo, that number is wrong - check it against the footage before trusting the runtime.</p>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">{raw.trim() ? "No cues found - is this an SRT, VTT or Whisper JSON?" : "The edit list appears here."}</p>
          )}
        </div>
      </div>
      <Gate />
    </>
  );
}
