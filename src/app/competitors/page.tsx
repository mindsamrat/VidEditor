"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocal, useSettings } from "@/lib/store";
import { loadChannel } from "@/lib/useChannel";
import { swipe, type SwipeVideo } from "@/lib/yt/swipe";
import { compact, shortDate } from "@/lib/format";
import { Badge, Card, ErrorNote, PageHeader } from "@/components/ui";

type Pulled = { ref: string; title: string; videos: (SwipeVideo & { short: boolean })[] };

export default function Competitors() {
  const [settings] = useSettings();
  const [refs, setRefs] = useLocal<string[]>("competitors:refs", []);
  const [pulled, setPulled] = useLocal<Pulled[]>("competitors:data", []);
  const [input, setInput] = useState("");
  const [min, setMin] = useState(2);
  const [fmt, setFmt] = useState<"long" | "short">("long");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const add = () => {
    const r = input.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    setRefs((cur) => Array.from(new Set([...cur, ...r])));
    setInput("");
  };

  const pull = async () => {
    setBusy(true); setErrors([]);
    const errs: string[] = [];
    const out: Pulled[] = [];
    for (const ref of refs) {
      try {
        const c = await loadChannel(ref, settings.youtubeKey, 30);
        out.push({ ref, title: c.title, videos: c.videos.map((v) => ({
          channel: c.title, title: v.title, views: v.views, url: v.url, duration: v.duration, published: v.published, thumb: v.thumb, short: v.short,
        })) });
      } catch (e) { errs.push(`${ref}: ${e instanceof Error ? e.message : e}`); }
    }
    setPulled(out); setErrors(errs); setBusy(false);
  };

  const result = useMemo(() => {
    // Shorts and long-form get separate medians - a Short's views say nothing about a 20-minute video.
    const vids = pulled.flatMap((p) => p.videos.filter((v) => (fmt === "short" ? v.short : !v.short)));
    return swipe(vids, min);
  }, [pulled, fmt, min]);

  return (
    <>
      <PageHeader title="Competitors"
        sub="What's working in our niche, ranked by how far each video beat its own channel's median - not by raw views, which only rank channel size. Public data only." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card title="Channels to watch">
            <div className="flex gap-2">
              <input className="input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="@handle, URL or UC… id" />
              <button className="btn-ghost" onClick={add} disabled={!input.trim()}>Add</button>
            </div>
            <ul className="mt-3 space-y-1">
              {refs.map((r) => (
                <li key={r} className="flex items-center justify-between rounded-lg bg-bg px-3 py-1.5 text-sm">
                  <span className="truncate">{pulled.find((p) => p.ref === r)?.title || r}</span>
                  <button className="text-xs text-ink-mute hover:text-rose-300" onClick={() => setRefs(refs.filter((x) => x !== r))} aria-label={`Remove ${r}`}>remove</button>
                </li>
              ))}
            </ul>
            <button className="btn-primary mt-4 w-full" onClick={pull} disabled={busy || !refs.length}>{busy ? "Pulling uploads…" : `Pull last 30 uploads each`}</button>
            {!refs.length && <p className="mt-2 text-xs text-ink-mute">Add three to eight channels our viewers also watch.</p>}
          </Card>
          <Card title="Filter">
            <div className="flex rounded-lg border border-line p-0.5 text-xs">
              {(["long", "short"] as const).map((f) => (
                <button key={f} onClick={() => setFmt(f)} className={`flex-1 rounded-md px-2.5 py-1 ${fmt === f ? "bg-bg-elev2 text-ink" : "text-ink-mute"}`}>{f === "long" ? "Long-form" : "Shorts"}</button>
              ))}
            </div>
            <label className="label mt-4" htmlFor="min">At least {min.toFixed(1)}× own median</label>
            <input id="min" type="range" min={1} max={6} step={0.5} value={min} onChange={(e) => setMin(+e.target.value)} className="w-full accent-[#FF5A4E]" />
          </Card>
          {result.formulas.length > 0 && (
            <Card title="Formulas among the outliers">
              <ul className="space-y-1.5 text-sm">
                {result.formulas.map(([f, n]) => (
                  <li key={f} className="flex justify-between"><span className="text-ink-dim">{f}</span><span className="tabular-nums">{n}</span></li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-mute">A judgement about the words in the title - not a claim about why the video worked.</p>
            </Card>
          )}
        </div>
        <div className="space-y-4 lg:col-span-2">
          {errors.map((e) => <ErrorNote key={e}>{e}</ErrorNote>)}
          {result.thin.length > 0 && (
            <p className="text-xs text-amber-300/90">Skipped {result.thin.map((t) => `${t.channel} (${t.count})`).join(", ")} - under four {fmt === "long" ? "long-form videos" : "Shorts"}, and a median off one or two videos is not a median.</p>
          )}
          {pulled.length === 0 && <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">Add channels and pull their uploads to see the outliers.</p>}
          {pulled.length > 0 && !result.outliers.length && <p className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-ink-mute">Nothing cleared {min}× - lower the threshold or add channels.</p>}
          {result.outliers.slice(0, 30).map((o, i) => (
            <a key={o.url || i} href={o.url} target="_blank" rel="noreferrer" className="flex gap-4 rounded-xl border border-line bg-bg-elev p-3 transition hover:border-ink-mute/40">
              {o.thumb && <Image src={o.thumb} alt="" width={160} height={90} className="aspect-video w-32 shrink-0 rounded-lg object-cover sm:w-40" />}
              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 font-medium leading-snug">{o.title}</div>
                <div className="mt-1 text-xs text-ink-mute">{o.channel}{o.published ? ` · ${shortDate(o.published)}` : ""}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="brand">{o.multiple.toFixed(1)}×</Badge>
                  <Badge>{compact(o.views)} vs {compact(o.median)} median</Badge>
                  <Badge>{o.formula}</Badge>
                </div>
              </div>
            </a>
          ))}
          {result.outliers.length > 0 && (
            <Card title="Now the harder question">
              <p className="text-sm text-ink-dim">What do the top five share structurally - and which of them could we actually make this week, in our voice, with what we have? Take that to the AI Desk in Plan or Script mode.</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
