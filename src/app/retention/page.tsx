"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocal } from "@/lib/store";
import { analyzeRetention, parseRetentionCsv } from "@/lib/yt/retention";
import { fmtTime, parseTranscript } from "@/lib/yt/transcript";
import { Badge, Card, Gate, PageHeader, Stat, TextDrop, bandTone } from "@/components/ui";
import { RetentionChart } from "@/components/charts";

export default function Retention() {
  const [csv, setCsv] = useLocal("retention:csv", "");
  const [tr, setTr] = useLocal("retention:transcript", "");
  const [dur, setDur] = useLocal("retention:duration", "");
  const [showTr, setShowTr] = useState(false);
  const seconds = useMemo(() => {
    const s = dur.trim();
    if (!s) return undefined;
    if (s.includes(":")) return s.split(":").reduce((a, p) => a * 60 + (parseFloat(p) || 0), 0);
    return parseFloat(s) || undefined;
  }, [dur]);
  const report = useMemo(() => (csv.trim() ? analyzeRetention(parseRetentionCsv(csv), seconds, parseTranscript(tr)) : null), [csv, tr, seconds]);
  const ok = report && !("error" in report) ? report : null;
  const xLabel = (x: number) => (ok?.pct_axis ? (seconds ? fmtTime((x / 100) * seconds) : `${Math.round(x)}%`) : fmtTime(x));

  return (
    <>
      <PageHeader title="Retention"
        sub="The retention graph is the only honest feedback YouTube gives. Export it, drop it here, and get the three different problems named - with what was being said at each drop." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Retention export (CSV)">
            <TextDrop value={csv} onChange={setCsv} rows={6} accept=".csv,.txt" placeholder={"Video position (%),Absolute audience retention (%)\n0,100\n1,94.2\n…"} />
            <label className="label mt-4" htmlFor="dur">Video length (seconds or m:ss)</label>
            <input id="dur" className="input" value={dur} onChange={(e) => setDur(e.target.value)} placeholder="10:24" />
            <p className="mt-1 text-xs text-ink-mute">Needed when the export&apos;s position column is a percentage, so drops can be placed in seconds.</p>
            <button className="mt-4 text-xs text-ink-dim underline decoration-dotted underline-offset-4" onClick={() => setShowTr(!showTr)}>{showTr ? "Hide" : "Add"} transcript (names what was said at each cliff)</button>
            {showTr && <div className="mt-3"><TextDrop value={tr} onChange={setTr} rows={6} accept=".srt,.vtt,.json" placeholder="SRT, VTT or Whisper JSON" /></div>}
          </Card>
          <Card title="Getting the file">
            <p className="text-sm text-ink-dim">Studio → the video → Analytics → Engagement → audience-retention chart → download icon → <b className="text-ink">Audience retention</b>.</p>
          </Card>
        </div>
        <div className="space-y-4 lg:col-span-3">
          {report && "error" in report && <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">{report.error}</p>}
          {!report && <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">The read-out appears here.</p>}
          {ok && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Hook leak" value={`${ok.hook_leak.toFixed(1)}%`} hint={<Badge tone={bandTone(ok.verdict)}>{ok.verdict}</Badge>} />
                <Stat label="Cliffs" value={ok.cliffs.length} hint="drops steeper than 0.8%" />
                <Stat label="Slide" value={ok.slide_per_unit.toFixed(3)} hint={`% per ${ok.pct_axis ? "1% of video" : "second"}, mid-video`} />
              </div>
              <Card title="The curve">
                <RetentionChart series={ok.series} cliffs={ok.cliffs} xLabel={xLabel} />
                <p className="mt-2 text-xs text-ink-mute">{ok.start.toFixed(1)}% → {ok.end.toFixed(1)}% over {ok.points} points. Ringed points are the cliffs.</p>
              </Card>
              <Card title="Read-out">
                <div className="space-y-5 text-sm">
                  <div>
                    <div className="font-medium">Hook leak - {ok.hook_leak.toFixed(1)}% gone in the opening</div>
                    <p className="mt-1 text-ink-dim">Under 25% is healthy. This is always the first thing to fix, and it is always the first fifteen seconds of script, never the edit. <Link className="text-brand-hi underline" href="/hooks">Hook Lab →</Link></p>
                  </div>
                  <div>
                    <div className="font-medium">Cliffs - the moments people left</div>
                    {ok.cliffs.length ? (
                      <ul className="mt-2 space-y-2">
                        {ok.cliffs.map((c, i) => (
                          <li key={i} className="rounded-lg bg-bg px-3 py-2">
                            <span className="font-mono tabular-nums text-rose-200">−{c.lost.toFixed(1)}%</span>
                            <span className="text-ink-dim"> at {c.at_seconds != null ? fmtTime(c.at_seconds) : `${c.from}%`}</span>
                            {c.said && <div className="mt-1 italic text-ink-dim">“{c.said}”</div>}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="mt-1 text-ink-dim">None steeper than 0.8% - the loss is all slide, not moments.</p>}
                    <p className="mt-2 text-ink-mute">A cliff is a moment: a topic change with no signposting, a sponsor read, a long setup.</p>
                  </div>
                  <div>
                    <div className="font-medium">Slide - the steady bleed</div>
                    <p className="mt-1 text-ink-dim">A flat slide is pacing, not content. The fix is cutting the middle, not rewriting it.</p>
                  </div>
                  {ok.verdict === "healthy" && !ok.cliffs.length && (
                    <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-200">The hook holds and there are no cliffs. The video is fine - if it underperformed, the problem is packaging. <Link className="underline" href="/package">Packaging →</Link></p>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
      <Gate />
    </>
  );
}
