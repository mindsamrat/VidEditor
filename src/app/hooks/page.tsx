"use client";
import { useMemo, useState } from "react";
import { useLocal } from "@/lib/store";
import { FORMULAS, HOOK_RULES } from "@/lib/yt/formulas";
import { FIX, PROPS, rankHooks } from "@/lib/yt/hookscore";
import { Badge, Card, Gate, Meter, PageHeader, bandTone } from "@/components/ui";

export default function HookLab() {
  const [draft, setDraft] = useLocal("hooks:draft", "");
  const [open, setOpen] = useState<string | null>(null);
  const ranked = useMemo(() => rankHooks(draft.split("\n")), [draft]);

  return (
    <>
      <PageHeader title="Hook Lab"
        sub="Write five hooks, one per line. Each is scored on five properties; the verdict leans on the weakest, because a hook leaks at its dead spot. Keep the top two." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Card title="Your hooks" aside={<span className="text-xs text-ink-mute">{ranked.length} scored · saved in this browser</span>}>
            <textarea className="input leading-relaxed" rows={7} value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder={"97% of channels quit before video 30. Here is what the other 3% do differently.\nYou are losing half your viewers in the first 15 seconds and the edit is not why."} />
          </Card>
          {ranked.map((h, i) => (
            <Card key={i + h.hook}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <p className="min-w-0 flex-1 font-medium leading-snug">{i === 0 && ranked.length > 1 && <span className="mr-2 text-brand">★</span>}{h.hook}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold tabular-nums">{h.verdict}</span>
                  <Badge tone={bandTone(h.band)}>{h.band}</Badge>
                </div>
              </div>
              <div className="space-y-2">{PROPS.map((p) => <Meter key={p} label={p} value={h.properties[p]} />)}</div>
              <div className="mt-4 grid gap-2 border-t border-line pt-3 text-sm sm:grid-cols-2">
                <div><span className="text-ink-mute">Formula </span>{h.formula}
                  <span className="text-ink-mute">{h.matched ? ` (${h.matched} pattern${h.matched === 1 ? "" : "s"})` : " - no formula matched; that is usually a summary, not a hook"}</span></div>
                <div><span className="text-ink-mute">Fix {h.weakest.toLowerCase()}: </span>{FIX[h.weakest]}</div>
              </div>
            </Card>
          ))}
          {ranked.length > 0 && <p className="text-xs text-ink-mute">A heuristic, not a predictor: it separates bad hooks from real ones well and a creator&apos;s own hits from misses barely at all. Low score = look again. High score = no promise.</p>}
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card title="Rules">
            <ol className="list-decimal space-y-2 pl-4 text-sm text-ink-dim">{HOOK_RULES.map((r) => <li key={r}>{r}</li>)}</ol>
          </Card>
          <Card title={`The ${FORMULAS.length} formulas`}>
            <ul className="-mx-2 divide-y divide-line">
              {FORMULAS.map((f) => (
                <li key={f.id}>
                  <button className="flex w-full items-center justify-between px-2 py-2.5 text-left text-sm hover:text-ink" onClick={() => setOpen(open === f.id ? null : f.id)} aria-expanded={open === f.id}>
                    <span className={open === f.id ? "text-ink" : "text-ink-dim"}>{f.name}</span>
                    <span className="text-ink-mute">{open === f.id ? "−" : "+"}</span>
                  </button>
                  {open === f.id && (
                    <div className="space-y-2 px-2 pb-4 text-sm">
                      <p className="text-ink-dim">{f.shape}</p>
                      <p className="rounded-lg bg-bg px-3 py-2 italic">“{f.example}”</p>
                      <p className="text-xs text-ink-mute">Fails when: {f.fails_when}</p>
                      <button className="btn-ghost px-2.5 py-1 text-xs" onClick={() => setDraft((d) => (d.trim() ? d.trimEnd() + "\n" : "") + f.example)}>Add example to my list</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <Gate />
    </>
  );
}
