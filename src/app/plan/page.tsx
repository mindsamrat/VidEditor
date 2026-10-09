"use client";
import { useMemo, useState } from "react";
import { useLocal } from "@/lib/store";
import { Badge, Card, CopyButton, PageHeader, type Tone } from "@/components/ui";

const FORMATS = { anchor: "Anchor", cheap: "Cheap one", short: "Short", none: "-" } as const;
type Format = keyof typeof FORMATS;
const STATUS = ["idea", "scripted", "filmed", "edited", "scheduled", "live"] as const;
type Status = (typeof STATUS)[number];
const STATUS_TONE: Record<Status, Tone> = { idea: "neutral", scripted: "neutral", filmed: "warn", edited: "warn", scheduled: "brand", live: "good" };
const HOURS: Record<Format, number> = { anchor: 10, cheap: 3, short: 1, none: 0 };

type Slot = { format: Format; title: string; promise: string; exists: string; status: Status };
type Week = { hours: number; slots: Slot[] };

const blank = (): Slot => ({ format: "none", title: "", promise: "", exists: "", status: "idea" });
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monday(offset: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return d;
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Plan() {
  const [offset, setOffset] = useState(0);
  const start = monday(offset);
  const [weeks, setWeeks] = useLocal<Record<string, Week>>("plan:weeks", {});
  const key = iso(start);
  const week: Week = weeks[key] || { hours: 15, slots: DAYS.map(blank) };
  const save = (w: Week) => setWeeks({ ...weeks, [key]: w });
  const setSlot = (i: number, patch: Partial<Slot>) => save({ ...week, slots: week.slots.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  const cost = week.slots.reduce((a, s) => a + HOURS[s.format], 0);
  const count = (f: Format) => week.slots.filter((s) => s.format === f).length;
  const uploads = week.slots.filter((s) => s.format !== "none").length;
  const warnings = useMemo(() => {
    const w: string[] = [];
    if (count("anchor") === 0) w.push("No anchor. Every week is for one video.");
    if (count("anchor") > 1) w.push("Two anchors. One of them is going to be rushed.");
    if (uploads > 5) w.push(`${uploads} uploads. A plan that posts daily is not a plan anyone keeps - the empty days are what let the filled ones survive a bad week.`);
    if (cost > week.hours) w.push(`This costs about ${cost}h and there are ${week.hours}h. Drop the cheap one first, then a Short.`);
    if (count("short") > 0 && count("anchor") === 0) w.push("Shorts should be cut from the anchor, not written separately.");
    return w;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week]);

  const text = week.slots.map((s, i) => s.format === "none" ? null :
    `${DAYS[i]}  ${FORMATS[s.format]}: ${s.title || "(untitled)"}${s.promise ? ` - ${s.promise}` : ""} [${s.status}]`).filter(Boolean).join("\n");

  return (
    <>
      <PageHeader title="Week Plan" sub="One anchor, one cheap one, Shorts cut from the anchor. Sized to the hours we actually have, not the hours we wish we had.">
        <button className="btn-ghost" onClick={() => setOffset(offset - 1)}>← Prev</button>
        <button className="btn-ghost" onClick={() => setOffset(0)} disabled={offset === 0}>This week</button>
        <button className="btn-ghost" onClick={() => setOffset(offset + 1)}>Next →</button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-3" title={`Week of ${start.toLocaleDateString("en", { month: "long", day: "numeric" })}`} aside={<CopyButton text={text} label="Copy plan" />}>
          <div className="space-y-3">
            {week.slots.map((s, i) => {
              const day = new Date(start); day.setDate(start.getDate() + i);
              return (
                <div key={i} className={`grid gap-2 rounded-lg border p-3 sm:grid-cols-12 ${s.format === "none" ? "border-line/60" : "border-line bg-bg"}`}>
                  <div className="text-sm sm:col-span-1"><div className="font-medium">{DAYS[i]}</div><div className="text-xs text-ink-mute">{day.getDate()}</div></div>
                  <select className="input sm:col-span-2" value={s.format} onChange={(e) => setSlot(i, { format: e.target.value as Format })} aria-label={`${DAYS[i]} format`}>
                    {Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {s.format !== "none" && (
                    <>
                      <input className="input sm:col-span-4" value={s.title} onChange={(e) => setSlot(i, { title: e.target.value })} placeholder="Working title" aria-label="Working title" />
                      <input className="input sm:col-span-3" value={s.promise} onChange={(e) => setSlot(i, { promise: e.target.value })} placeholder="The one-sentence promise" aria-label="Promise" />
                      <select className="input sm:col-span-2" value={s.status} onChange={(e) => setSlot(i, { status: e.target.value as Status })} aria-label="Status">
                        {STATUS.map((st) => <option key={st}>{st}</option>)}
                      </select>
                      <input className="input text-xs sm:col-span-11 sm:col-start-2" value={s.exists} onChange={(e) => setSlot(i, { exists: e.target.value })} placeholder="What already exists for it - footage, a clip, last week's top comment…" aria-label="What exists" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="Capacity">
            <label className="label" htmlFor="hours">Hours we actually have</label>
            <input id="hours" type="number" min={0} className="input" value={week.hours} onChange={(e) => save({ ...week, hours: Math.max(0, +e.target.value) })} />
            <div className="mt-4 text-sm">
              <div className="flex justify-between"><span className="text-ink-dim">Estimated cost</span><span className={`tabular-nums ${cost > week.hours ? "text-rose-300" : ""}`}>{cost}h</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-elev2"><div className={`h-full rounded-full ${cost > week.hours ? "bg-rose-400" : "bg-brand"}`} style={{ width: `${Math.min(100, (cost / Math.max(1, week.hours)) * 100)}%` }} /></div>
              <p className="mt-2 text-xs text-ink-mute">Rough: anchor {HOURS.anchor}h, cheap one {HOURS.cheap}h, Short {HOURS.short}h.</p>
            </div>
          </Card>
          <Card title="Check">
            {warnings.length ? <ul className="space-y-2 text-sm text-amber-200/90">{warnings.map((w) => <li key={w}>• {w}</li>)}</ul>
              : <p className="text-sm text-emerald-300">The week fits.</p>}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {week.slots.filter((s) => s.format !== "none").map((s, i) => <Badge key={i} tone={STATUS_TONE[s.status]}>{FORMATS[s.format]} · {s.status}</Badge>)}
            </div>
          </Card>
          <p className="text-xs text-ink-mute">Post the anchor on the day our own analytics say is best (Studio → Audience → When your viewers are on YouTube) - don&apos;t assume Tuesday.</p>
        </div>
      </div>
    </>
  );
}
