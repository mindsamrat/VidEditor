"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useChannel } from "@/lib/useChannel";
import { median, titleFormula } from "@/lib/yt/swipe";
import { checkTitle } from "@/lib/yt/title";
import { compact, daysAgo, duration, full, shortDate } from "@/lib/format";
import { Badge, Card, Empty, ErrorNote, PageHeader, Stat, scoreTone } from "@/components/ui";
import { BarChart } from "@/components/charts";

type Fmt = "long" | "short";

export default function Overview() {
  const { data, error, loading, refresh, configured, ready } = useChannel(100);
  const [fmt, setFmt] = useState<Fmt>("long");

  const view = useMemo(() => {
    if (!data) return null;
    const pick = data.videos.filter((v) => (fmt === "short" ? v.short : !v.short));
    const med = median(pick.map((v) => v.views));
    // Videos younger than a week are still climbing; keep them out of the median judgement.
    const rows = pick.map((v) => ({
      ...v, multiple: med ? v.views / med : 0, fresh: daysAgo(v.published) < 7,
      lint: checkTitle(v.title), formula: titleFormula(v.title),
    }));
    const dates = data.videos.map((v) => new Date(v.published).getTime()).sort((a, b) => b - a);
    const gaps = dates.slice(0, 11).slice(1).map((d, i) => (dates[i] - d) / 86400000);
    const settled = rows.filter((r) => !r.fresh);
    const best = [...settled].sort((a, b) => b.multiple - a.multiple)[0];
    const weakTitle = [...rows.slice(0, 10)].sort((a, b) => a.lint.score - b.lint.score)[0];
    return {
      rows, med, best, weakTitle,
      last30: data.videos.filter((v) => daysAgo(v.published) <= 30).length,
      avgGap: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null,
      maxGap: gaps.length ? Math.max(...gaps) : null,
      lastUpload: data.videos[0]?.published,
      longs: data.videos.filter((v) => !v.short).length,
      shorts: data.videos.filter((v) => v.short).length,
    };
  }, [data, fmt]);

  if (ready && !configured) {
    return (
      <>
        <PageHeader title="Overview" sub="Live numbers for our channel, read from the YouTube Data API." />
        <Empty title="Connect the channel" href="/settings" cta="Open Settings">
          Add our @handle and a YouTube Data API key. Everything is read-only - the console can never post or edit.
        </Empty>
      </>
    );
  }

  return (
    <>
      <PageHeader title={data?.title || "Overview"}
        sub={data ? <>{data.handle} · on YouTube since {new Date(data.created).getFullYear()} · last {data.videos.length} uploads analysed</> : "Loading the channel…"}>
        <button className="btn-ghost" onClick={refresh} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        {data && <a className="btn-ghost" href={`https://studio.youtube.com/channel/${data.id}`} target="_blank" rel="noreferrer">Open Studio ↗</a>}
      </PageHeader>

      {error && <div className="mb-6"><ErrorNote>{error} - check the handle and key in <Link className="underline" href="/settings">Settings</Link>.</ErrorNote></div>}

      {data && view && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Subscribers" value={compact(data.subscribers)} hint={data.subscribers != null ? full(data.subscribers) : "hidden on the channel"} />
            <Stat label="Total views" value={compact(data.views)} hint={`${full(data.videoCount)} videos public`} />
            <Stat label="Uploads, last 30 days" value={view.last30}
              hint={view.lastUpload ? `last one ${daysAgo(view.lastUpload)}d ago` : "no uploads yet"} />
            <Stat label="Upload rhythm" value={view.avgGap != null ? `${view.avgGap.toFixed(1)}d` : "-"}
              hint={view.maxGap != null ? `average gap · longest ${view.maxGap.toFixed(0)}d` : "needs 2+ uploads"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2" title="Views per upload"
              aside={
                <div className="flex rounded-lg border border-line p-0.5 text-xs" role="tablist">
                  {(["long", "short"] as Fmt[]).map((f) => (
                    <button key={f} role="tab" aria-selected={fmt === f} onClick={() => setFmt(f)}
                      className={`rounded-md px-2.5 py-1 ${fmt === f ? "bg-bg-elev2 text-ink" : "text-ink-mute hover:text-ink-dim"}`}>
                      {f === "long" ? `Long-form (${view.longs})` : `Shorts (${view.shorts})`}
                    </button>
                  ))}
                </div>
              }>
              {view.rows.length ? (
                <BarChart fmt={compact} reference={view.med}
                  bars={[...view.rows].slice(0, 40).reverse().map((v) => ({
                    key: v.id, label: v.title, value: v.views, href: v.url,
                    sub: `${shortDate(v.published)} · ${v.multiple.toFixed(2)}× median${v.fresh ? " · still climbing" : ""}`,
                  }))} />
              ) : <p className="py-10 text-center text-sm text-ink-mute">No {fmt === "long" ? "long-form videos" : "Shorts"} in the last {data.videos.length} uploads.</p>}
              <p className="mt-3 text-xs text-ink-mute">Oldest to newest, last 40. Click a bar to open the video. Shorts are anything 3 minutes or under.</p>
            </Card>

            <div className="min-w-0 space-y-6">
              <Card title="Study this one">
                {view.best ? (
                  <div>
                    <a href={view.best.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">{view.best.title}</a>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="brand">{view.best.multiple.toFixed(1)}× our median</Badge>
                      <Badge>{view.best.formula}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-ink-dim">Our biggest outlier against our own baseline. Whatever it did - topic, title shape, thumbnail - is the cheapest next video to make.</p>
                  </div>
                ) : <p className="text-sm text-ink-mute">Needs videos older than a week.</p>}
              </Card>
              <Card title="Weakest recent title">
                {view.weakTitle && view.weakTitle.lint.score >= 80 ? (
                  <p className="text-sm text-ink-dim">All of the last ten titles pass the lint (lowest {view.weakTitle.lint.score}/100). Packaging isn&apos;t the bottleneck on paper - check thumbnails at feed size.</p>
                ) : view.weakTitle ? (
                  <div>
                    <div className="font-medium">{view.weakTitle.title}</div>
                    <div className="mt-2"><Badge tone={scoreTone(view.weakTitle.lint.score)}>score {view.weakTitle.lint.score}/100</Badge></div>
                    <ul className="mt-3 space-y-1 text-sm text-ink-dim">
                      {view.weakTitle.lint.issues.slice(0, 3).map((i) => <li key={i.kind}>✕ {i.message}</li>)}
                    </ul>
                    <Link href={`/package?title=${encodeURIComponent(view.weakTitle.title)}`} className="btn-ghost mt-4 text-xs">Repackage it →</Link>
                  </div>
                ) : <p className="text-sm text-ink-mute">No uploads yet.</p>}
              </Card>
            </div>
          </div>

          <Card title={`${fmt === "long" ? "Long-form" : "Shorts"}, newest first`} aside={<span className="text-xs text-ink-mute">median {full(Math.round(view.med))} views</span>}>
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-ink-mute">
                    <th className="px-5 pb-2 font-medium">Video</th>
                    <th className="pb-2 text-right font-medium">Views</th>
                    <th className="pb-2 pl-4 text-right font-medium">vs median</th>
                    <th className="pb-2 pl-4 font-medium">Title</th>
                    <th className="pb-2 pl-4 pr-5 font-medium">Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {view.rows.slice(0, 50).map((v) => (
                    <tr key={v.id} className="border-b border-line/60 last:border-0">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          {v.thumb && <Image src={v.thumb} alt="" width={64} height={36} className="h-9 w-16 shrink-0 rounded object-cover" />}
                          <div className="min-w-0">
                            <a href={v.url} target="_blank" rel="noreferrer" className="line-clamp-1 hover:underline">{v.title}</a>
                            <div className="text-xs text-ink-mute">{shortDate(v.published)} · {duration(v.duration)} · {compact(v.likes)} likes · {compact(v.comments)} comments</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{compact(v.views)}</td>
                      <td className="py-2.5 pl-4 text-right">
                        {v.fresh ? <Badge>climbing</Badge> : <Badge tone={v.multiple >= 1.5 ? "good" : v.multiple >= 0.7 ? "neutral" : "bad"}>{v.multiple.toFixed(2)}×</Badge>}
                      </td>
                      <td className="py-2.5 pl-4">
                        <Link href={`/package?title=${encodeURIComponent(v.title)}`} title={v.lint.issues.map((i) => i.message).join("\n") || "No issues"}>
                          <Badge tone={scoreTone(v.lint.score)}>{v.lint.score}</Badge>
                        </Link>
                      </td>
                      <td className="py-2.5 pl-4 pr-5 text-xs text-ink-dim">{v.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {loading && !data && <div className="h-64 animate-pulse rounded-xl border border-line bg-bg-elev" />}
    </>
  );
}
