"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NICHES, ART_STYLES, VOICES } from "@/lib/data";

const STEPS = ["Niche", "Style", "Voice", "Music", "Schedule", "Accounts", "Review"];

export function CreateSeriesWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    niche: "mythology",
    customNiche: "",
    style: "cinematic",
    voice: "atlas",
    music: "library:epic-orchestral",
    musicLink: "",
    cadence: "daily",
    timeUtc: "18:00",
    review: "auto",
    accounts: { tiktok: true, instagram: true, youtube: true },
    name: "Mythology Stories",
  });

  const update = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const finish = () => router.push("/dashboard/series/mythology");

  return (
    <main className="p-6 max-w-3xl mx-auto w-full">
      <Steps step={step} />

      <div className="card p-6 md:p-8 mt-6">
        {step === 0 && <StepNiche data={data} update={update} />}
        {step === 1 && <StepStyle data={data} update={update} />}
        {step === 2 && <StepVoice data={data} update={update} />}
        {step === 3 && <StepMusic data={data} update={update} />}
        {step === 4 && <StepSchedule data={data} update={update} />}
        {step === 5 && <StepAccounts data={data} update={update} />}
        {step === 6 && <StepReview data={data} />}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="btn-ghost text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} className="btn-brand text-sm">
            Continue →
          </button>
        ) : (
          <button onClick={finish} className="btn-brand text-sm">
            Launch series ▶
          </button>
        )}
      </div>
    </main>
  );
}

function Steps({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {STEPS.map((label, i) => (
        <li
          key={label}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            i === step
              ? "border-brand text-brand bg-brand/5"
              : i < step
                ? "border-line text-ink-dim"
                : "border-line text-ink-mute"
          }`}
        >
          <span className="font-mono">{String(i + 1).padStart(2, "0")}</span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

type Data = {
  niche: string; customNiche: string;
  style: string; voice: string;
  music: string; musicLink: string;
  cadence: string; timeUtc: string;
  review: string;
  accounts: { tiktok: boolean; instagram: boolean; youtube: boolean };
  name: string;
};
type UpdateFn = (p: Partial<Data>) => void;

function StepNiche({ data, update }: { data: Data; update: UpdateFn }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Pick your niche</h2>
      <p className="mt-1 text-sm text-ink-dim">Each niche is a proven faceless format. Or describe your own theme below.</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {NICHES.map((n) => (
          <button
            key={n.slug}
            onClick={() => update({ niche: n.slug, name: n.title })}
            className={`text-left p-3 rounded-xl border transition ${
              data.niche === n.slug
                ? "border-brand bg-brand/5"
                : "border-line bg-bg-elev2 hover:border-ink/30"
            }`}
          >
            <div className="text-2xl">{n.emoji}</div>
            <div className="mt-1 text-sm font-medium">{n.title}</div>
            <div className="text-[11px] text-ink-mute">{n.blurb}</div>
          </button>
        ))}
      </div>
      <div className="mt-6">
        <label className="text-xs uppercase tracking-wider text-ink-mute">Or describe your own theme</label>
        <input
          value={data.customNiche}
          onChange={(e) => update({ customNiche: e.target.value })}
          placeholder="e.g. 60-second history of Formula 1"
          className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
        />
      </div>
      <div className="mt-6">
        <label className="text-xs uppercase tracking-wider text-ink-mute">Series name</label>
        <input
          value={data.name}
          onChange={(e) => update({ name: e.target.value })}
          className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}

function StepStyle({ data, update }: { data: Data; update: UpdateFn }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Choose an art style</h2>
      <p className="mt-1 text-sm text-ink-dim">All visuals in this series will share this look. Consistency is what makes a faceless channel grow.</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-2">
        {ART_STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => update({ style: s.id })}
            className={`text-left p-4 rounded-xl border transition ${
              data.style === s.id ? "border-brand bg-brand/5" : "border-line bg-bg-elev2 hover:border-ink/30"
            }`}
          >
            <div className="font-medium">{s.label}</div>
            <div className="text-xs text-ink-mute mt-1">{s.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepVoice({ data, update }: { data: Data; update: UpdateFn }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Pick a narrator voice</h2>
      <p className="mt-1 text-sm text-ink-dim">Tap to preview. Your series will use this AI voice for every episode.</p>
      <div className="mt-6 grid sm:grid-cols-2 gap-2">
        {VOICES.map((v) => (
          <button
            key={v.id}
            onClick={() => update({ voice: v.id })}
            className={`flex items-center gap-3 p-4 rounded-xl border transition text-left ${
              data.voice === v.id ? "border-brand bg-brand/5" : "border-line bg-bg-elev2 hover:border-ink/30"
            }`}
          >
            <span className="grid place-items-center w-10 h-10 rounded-full bg-bg text-brand">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4v16l14-8z" /></svg>
            </span>
            <div>
              <div className="font-medium">{v.name}</div>
              <div className="text-xs text-ink-mute">{v.gender} · {v.vibe}</div>
            </div>
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-mute">On the Scale plan you can clone your own voice from a 60-second sample.</p>
    </div>
  );
}

function StepMusic({ data, update }: { data: Data; update: UpdateFn }) {
  const tracks = [
    { id: "library:epic-orchestral", name: "Epic orchestral" },
    { id: "library:lofi-thinking", name: "Lo-fi thinking" },
    { id: "library:cinematic-tense", name: "Cinematic tense" },
    { id: "library:trap-energy", name: "Trap energy" },
    { id: "library:ambient-pad", name: "Ambient pad" },
    { id: "library:retro-vhs", name: "Retro VHS" },
  ];
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Music bed</h2>
      <p className="mt-1 text-sm text-ink-dim">Pick from our royalty-free library, upload your own, or paste a TikTok sound link.</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => update({ music: t.id, musicLink: "" })}
            className={`text-left p-3 rounded-xl border transition ${
              data.music === t.id ? "border-brand bg-brand/5" : "border-line bg-bg-elev2 hover:border-ink/30"
            }`}
          >
            <div className="text-sm font-medium">{t.name}</div>
            <div className="text-[11px] text-ink-mute">Library · royalty-free</div>
          </button>
        ))}
      </div>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <button
          type="button"
          className="card p-4 text-left hover:border-ink/30 transition"
          onClick={() => update({ music: "upload" })}
        >
          <div className="text-sm font-medium">Upload your own MP3</div>
          <div className="text-xs text-ink-mute mt-1">Drop a file. We&rsquo;ll loop / trim to fit each episode.</div>
        </button>
        <div className="card p-4">
          <div className="text-sm font-medium">Paste a TikTok sound link</div>
          <input
            value={data.musicLink}
            onChange={(e) => update({ musicLink: e.target.value, music: "tiktok-link" })}
            placeholder="https://www.tiktok.com/music/..."
            className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
        </div>
      </div>
    </div>
  );
}

function StepSchedule({ data, update }: { data: Data; update: UpdateFn }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Posting schedule</h2>
      <p className="mt-1 text-sm text-ink-dim">How often do you want this series to ship videos?</p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: "daily", label: "Daily" },
          { id: "twice-day", label: "2x / day" },
          { id: "3-week", label: "3x / week" },
          { id: "weekly", label: "Weekly" },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => update({ cadence: c.id })}
            className={`p-4 rounded-xl border transition ${
              data.cadence === c.id ? "border-brand bg-brand/5 text-brand" : "border-line bg-bg-elev2 hover:border-ink/30"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-ink-mute">Post time (UTC)</label>
          <input
            type="time"
            value={data.timeUtc}
            onChange={(e) => update({ timeUtc: e.target.value })}
            className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-ink-mute">Workflow</label>
          <select
            value={data.review}
            onChange={(e) => update({ review: e.target.value })}
            className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-brand"
          >
            <option value="auto">Fully automated — post without review</option>
            <option value="review">Review each video before it posts</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function StepAccounts({ data, update }: { data: Data; update: UpdateFn }) {
  const toggle = (k: keyof Data["accounts"]) =>
    update({ accounts: { ...data.accounts, [k]: !data.accounts[k] } });

  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Where should we post?</h2>
      <p className="mt-1 text-sm text-ink-dim">Connect once. We use each platform&rsquo;s official posting API.</p>
      <div className="mt-6 space-y-3">
        {[
          { k: "tiktok", name: "TikTok", desc: "Posts via the TikTok Content Posting API." },
          { k: "instagram", name: "Instagram Reels", desc: "Posts via the Instagram Graph API." },
          { k: "youtube", name: "YouTube Shorts", desc: "Posts via the YouTube Data API v3." },
        ].map((p) => {
          const on = data.accounts[p.k as keyof Data["accounts"]];
          return (
            <button
              key={p.k}
              onClick={() => toggle(p.k as keyof Data["accounts"])}
              className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border transition text-left ${
                on ? "border-brand bg-brand/5" : "border-line bg-bg-elev2 hover:border-ink/30"
              }`}
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-ink-mute">{p.desc}</div>
              </div>
              <span className={`w-10 h-6 rounded-full p-0.5 transition ${on ? "bg-brand" : "bg-line"}`}>
                <span className={`block w-5 h-5 rounded-full bg-bg transition ${on ? "translate-x-4" : ""}`} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepReview({ data }: { data: Data }) {
  const niche = NICHES.find((n) => n.slug === data.niche)?.title || data.customNiche;
  const style = ART_STYLES.find((s) => s.id === data.style)?.label;
  const voice = VOICES.find((v) => v.id === data.voice)?.name;
  const platforms = Object.entries(data.accounts).filter(([, v]) => v).map(([k]) => k).join(" · ");
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">Ready to launch.</h2>
      <p className="mt-1 text-sm text-ink-dim">Hit launch and ReelForge will start generating your first three episodes immediately.</p>
      <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Row k="Series name" v={data.name} />
        <Row k="Niche" v={niche || "—"} />
        <Row k="Art style" v={style || "—"} />
        <Row k="Voice" v={voice || "—"} />
        <Row k="Music" v={data.musicLink ? `TikTok sound · ${data.musicLink}` : data.music} />
        <Row k="Cadence" v={`${data.cadence} · ${data.timeUtc} UTC`} />
        <Row k="Workflow" v={data.review === "auto" ? "Fully automated" : "Review before post"} />
        <Row k="Platforms" v={platforms || "—"} />
      </dl>
      <p className="mt-6 text-xs text-ink-mute">First episode rendered in ~2 minutes. We email you when it&rsquo;s ready.</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line/60 py-2">
      <dt className="text-ink-mute">{k}</dt>
      <dd className="text-ink text-right">{v}</dd>
    </div>
  );
}
