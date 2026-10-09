"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { DESK_MODES, type DeskMode } from "@/lib/skills";
import { useLocal, useVoice } from "@/lib/store";
import { useChannel } from "@/lib/useChannel";
import { median } from "@/lib/yt/swipe";
import { compact, daysAgo } from "@/lib/format";
import { Card, CopyButton, ErrorNote, PageHeader } from "@/components/ui";

type Turn = { role: "user" | "assistant"; content: string };

export default function Desk() {
  const [mode, setMode] = useLocal<DeskMode>("desk:mode", "yt-script");
  const [threads, setThreads] = useLocal<Record<string, Turn[]>>("desk:threads", {});
  const [voice] = useVoice();
  const { data: channel } = useChannel(50);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const turns = threads[mode] || [];
  const info = DESK_MODES.find((m) => m.id === mode)!;

  const snapshot = useMemo(() => {
    if (!channel) return "";
    const longs = channel.videos.filter((v) => !v.short);
    const med = median(longs.map((v) => v.views));
    return [
      `${channel.title} (${channel.handle}) - ${compact(channel.subscribers)} subscribers, ${compact(channel.views)} total views, ${channel.videoCount} videos.`,
      `Long-form median views (last ${longs.length}): ${Math.round(med)}.`,
      "Recent uploads (newest first): title | views | multiple of format median | days ago | type",
      ...channel.videos.slice(0, 20).map((v) => {
        const pool = channel.videos.filter((x) => x.short === v.short).map((x) => x.views);
        const m = median(pool);
        return `- ${v.title} | ${v.views} | ${m ? (v.views / m).toFixed(2) : "-"}x | ${daysAgo(v.published)}d | ${v.short ? "Short" : "long-form"}`;
      }),
    ].join("\n");
  }, [channel]);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [threads, mode]);

  const setTurns = (t: Turn[]) => setThreads((cur) => ({ ...cur, [mode]: t }));

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const history: Turn[] = [...turns, { role: "user", content: text }];
    setTurns([...history, { role: "assistant", content: "" }]);
    setInput(""); setBusy(true); setError(null);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/assist", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: abort.current.signal,
        body: JSON.stringify({ mode, messages: history, voice, channel: snapshot }),
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let out = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        out += dec.decode(value, { stream: true });
        setTurns([...history, { role: "assistant", content: out }]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError(e instanceof Error ? e.message : String(e));
        setTurns(history);
        setInput(text);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="AI Desk" sub="Claude, running our yt-* skills, with our voice.md and live channel numbers in context. It writes; we decide and upload." />
      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1" role="tablist">
        {DESK_MODES.map((m) => (
          <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} disabled={busy}
            className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm transition ${mode === m.id ? "border-brand/50 bg-brand/10 text-ink" : "border-line text-ink-dim hover:text-ink"}`}>
            {m.label}{threads[m.id]?.length ? <span className="ml-1.5 text-xs text-ink-mute">{Math.ceil(threads[m.id].length / 2)}</span> : null}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <div className="min-h-[40vh] space-y-5">
              {!turns.length && (
                <div className="py-10 text-center">
                  <div className="font-medium">{info.label}</div>
                  <p className="mx-auto mt-1 max-w-md text-sm text-ink-dim">{info.blurb}</p>
                </div>
              )}
              {turns.map((t, i) => (
                <div key={i} className={t.role === "user" ? "flex justify-end" : ""}>
                  {t.role === "user" ? (
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-xl bg-bg-elev2 px-4 py-2.5 text-sm">{t.content}</div>
                  ) : (
                    <div className="group">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{t.content || (busy && i === turns.length - 1 ? <span className="animate-pulse text-ink-mute">Thinking…</span> : "")}</div>
                      {t.content && !(busy && i === turns.length - 1) && <div className="mt-2 opacity-60 group-hover:opacity-100"><CopyButton text={t.content} /></div>}
                    </div>
                  )}
                </div>
              ))}
              <div ref={end} />
            </div>
          </Card>
          {error && <ErrorNote>{error}</ErrorNote>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea className="input min-h-[88px] flex-1" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
              placeholder={mode === "yt-comment" ? "Paste the comments…" : mode === "yt-shorts" ? "Paste the transcript…" : "What are we making?"} />
            <div className="flex gap-2 sm:flex-col">
              {busy ? <button className="btn-ghost" onClick={() => abort.current?.abort()}>Stop</button>
                : <button className="btn-primary" onClick={send} disabled={!input.trim()}>Send</button>}
              <button className="btn-ghost" onClick={() => setTurns([])} disabled={busy || !turns.length}>New</button>
            </div>
          </div>
          <p className="text-xs text-ink-mute">⌘/Ctrl + Enter to send. Threads are kept per mode in this browser.</p>
        </div>
        <div className="space-y-4">
          <Card title="In context">
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-2"><span className="text-ink-dim">Skill</span><code className="text-xs">{mode}</code></li>
              <li className="flex justify-between gap-2"><span className="text-ink-dim">voice.md</span>{voice.trim() ? <span className="text-emerald-300">loaded</span> : <Link href="/voice" className="text-amber-300 underline">missing</Link>}</li>
              <li className="flex justify-between gap-2"><span className="text-ink-dim">Channel</span>{channel ? <span className="truncate text-emerald-300">{channel.title}</span> : <Link href="/settings" className="text-ink-mute underline">not connected</Link>}</li>
            </ul>
          </Card>
          <Card title="Then check it">
            <p className="text-sm text-ink-dim">Run whatever it writes through the tools: hooks into <Link className="underline" href="/hooks">Hook Lab</Link>, titles into <Link className="underline" href="/package">Packaging</Link>.</p>
          </Card>
        </div>
      </div>
    </>
  );
}
