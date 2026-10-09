"use client";
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/store";
import { loadChannel } from "@/lib/useChannel";
import { Badge, Card, ErrorNote, PageHeader } from "@/components/ui";

export default function Settings() {
  const [settings, setSettings, ready] = useSettings();
  const [form, setForm] = useState(settings);
  const [status, setStatus] = useState<{ youtube: boolean; anthropic: boolean } | null>(null);
  const [test, setTest] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready) setForm(settings); }, [ready, settings]);
  useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null)); }, []);

  const save = async () => {
    setSettings(form);
    if (!form.channel) return;
    setBusy(true); setTest(null);
    try {
      const c = await loadChannel(form.channel, form.youtubeKey, 4);
      setTest({ ok: true, msg: `Connected to ${c.title}.` });
    } catch (e) { setTest({ ok: false, msg: e instanceof Error ? e.message : String(e) }); }
    setBusy(false);
  };

  return (
    <>
      <PageHeader title="Settings" sub="Which channel this console reads, and the keys it reads with. All access is read-only." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Our channel">
          <label className="label" htmlFor="ch">Channel</label>
          <input id="ch" className="input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} placeholder="@ourhandle, the channel URL, or UC… id" />
          <label className="label mt-5" htmlFor="key">YouTube Data API key {status?.youtube && <span className="normal-case tracking-normal text-ink-dim">(optional - the server has one)</span>}</label>
          <input id="key" type="password" autoComplete="off" className="input font-mono" value={form.youtubeKey} onChange={(e) => setForm({ ...form, youtubeKey: e.target.value })} placeholder={status?.youtube ? "Using the server key" : "AIza…"} />
          <p className="mt-1.5 text-xs text-ink-mute">Kept in this browser only and sent with each channel request. Create one in Google Cloud → APIs &amp; Services → Credentials, and enable “YouTube Data API v3”. Restrict it to that API.</p>
          <div className="mt-5 flex items-center gap-3">
            <button className="btn-primary" onClick={save} disabled={busy}>{busy ? "Checking…" : "Save & test"}</button>
            {test && !test.ok && <span className="text-sm text-rose-300">Couldn&apos;t connect</span>}
            {test?.ok && <span className="text-sm text-emerald-300">{test.msg}</span>}
          </div>
          {test && !test.ok && <div className="mt-3"><ErrorNote>{test.msg}</ErrorNote></div>}
        </Card>
        <Card title="Server">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between"><span className="text-ink-dim">YOUTUBE_API_KEY</span>{status ? <Badge tone={status.youtube ? "good" : "neutral"}>{status.youtube ? "set" : "not set"}</Badge> : <Badge>…</Badge>}</li>
            <li className="flex items-center justify-between"><span className="text-ink-dim">ANTHROPIC_API_KEY</span>{status ? <Badge tone={status.anthropic ? "good" : "warn"}>{status.anthropic ? "set" : "not set"}</Badge> : <Badge>…</Badge>}</li>
          </ul>
          <p className="mt-4 text-xs text-ink-mute">Set these as environment variables where the console is deployed. The Anthropic key powers the AI Desk only; every other page works without it.</p>
        </Card>
      </div>
    </>
  );
}
