"use client";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocal } from "@/lib/store";
import { checkTitle, DESKTOP, MOBILE } from "@/lib/yt/title";
import { titleFormula } from "@/lib/yt/swipe";
import { Badge, Card, CopyButton, Gate, PageHeader, scoreTone } from "@/components/ui";

function Packaging() {
  const params = useSearchParams();
  const [titles, setTitles] = useLocal("package:titles", "");
  const [thumb, setThumb] = useLocal("package:thumb", "");

  useEffect(() => {
    const t = params.get("title");
    if (t) setTitles((cur) => (cur.split("\n").includes(t) ? cur : [t, cur].filter(Boolean).join("\n")));
  }, [params, setTitles]);

  const rows = useMemo(() => titles.split("\n").filter((l) => l.trim()).map((l) => ({ ...checkTitle(l, thumb), formula: titleFormula(l) }))
    .sort((a, b) => b.score - a.score), [titles, thumb]);

  return (
    <>
      <PageHeader title="Packaging"
        sub="The title and the thumbnail are one unit. Write ten titles, one per line, add the thumbnail words, and keep the top two. The thumbnail should say what the title does not." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Draft">
            <label className="label" htmlFor="titles">Titles - one per line</label>
            <textarea id="titles" className="input leading-relaxed" rows={10} value={titles} onChange={(e) => setTitles(e.target.value)}
              placeholder={"I Let AI Run Our Channel for 30 Days\nWhy 97% of Channels Quit Before Video 30"} />
            <label className="label mt-4" htmlFor="thumb">Thumbnail text - three words max</label>
            <input id="thumb" className="input font-semibold uppercase tracking-wide" value={thumb} onChange={(e) => setThumb(e.target.value)} placeholder="IT BEAT ME" />
          </Card>
          <Card title="The rules it checks">
            <ul className="space-y-1.5 text-sm text-ink-dim">
              <li><b className="text-ink">{DESKTOP}</b> characters: where desktop search cuts. <b className="text-ink">{MOBILE}</b>: a mobile home feed.</li>
              <li>The thumbnail never repeats the title.</li>
              <li>Three words max on the thumbnail - a fourth is a grey smear at feed size.</li>
              <li>A number, a name or a date beats every adjective.</li>
              <li>Two all-caps words is the ceiling before it reads as spam.</li>
            </ul>
          </Card>
        </div>
        <div className="space-y-4 lg:col-span-3">
          {!rows.length && <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">Ranked titles show up here as you type.</p>}
          {rows.map((r, i) => (
            <Card key={i + r.title}>
              {/* feed preview: how the pairing reads at a glance */}
              <div className="mb-4 flex gap-3">
                <div className="relative grid aspect-video w-36 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-bg-elev2 to-line">
                  <span className="px-2 text-center text-sm font-black uppercase leading-tight tracking-tight text-white [text-shadow:0_2px_6px_rgba(0,0,0,.7)]">{thumb || "THUMB TEXT"}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-snug">{r.title.length > MOBILE ? <>{r.title.slice(0, MOBILE)}<span className="text-ink-mute">{r.title.slice(MOBILE)}</span></> : r.title}</div>
                  <div className="mt-1 text-xs text-ink-mute">greyed part = past the mobile cut</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {i === 0 && rows.length > 1 && <Badge tone="brand">★ top pick</Badge>}
                <Badge tone={scoreTone(r.score)}>{r.score}/100</Badge>
                <Badge>{r.chars} chars</Badge>
                <Badge>{r.formula}</Badge>
                <span className="ml-auto"><CopyButton text={r.title} /></span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {r.issues.map((x) => <li key={x.kind} className="text-rose-200/90"><span className="mr-2 font-mono text-xs text-ink-mute">{x.kind}</span>{x.message}</li>)}
                {r.good.map((g) => <li key={g} className="text-ink-dim">✓ {g}</li>)}
              </ul>
            </Card>
          ))}
        </div>
      </div>
      <Gate />
    </>
  );
}

export default function Page() {
  return <Suspense><Packaging /></Suspense>;
}
