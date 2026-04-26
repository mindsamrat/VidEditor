"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/marketing/Logo";

type Scene = {
  scene: number;
  voiceover: string;
  image_prompt: string;
  on_screen_text: string;
  imageUrl?: string;
  imageError?: string;
  loading?: boolean;
};

type Script = {
  title: string;
  hook: string;
  scenes: Scene[];
};

export default function StudioPage() {
  const [topic, setTopic] = useState("How Thor lost his hammer, in 60 seconds");
  const [niche, setNiche] = useState("Mythology");
  const [voiceVibe, setVoiceVibe] = useState("deep documentary narrator");
  const [imageQuality, setImageQuality] = useState<"low" | "medium" | "high">("low");
  const [script, setScript] = useState<Script | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  async function generateScript() {
    setLoadingScript(true);
    setScript(null);
    setScriptError(null);
    setAudioUrl(null);
    setAudioError(null);
    try {
      const r = await fetch("/api/generate/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, niche, voice: voiceVibe }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setScript(data);
    } catch (e: unknown) {
      setScriptError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingScript(false);
    }
  }

  async function generateImageFor(idx: number) {
    if (!script) return;
    const scene = script.scenes[idx];
    setScript({
      ...script,
      scenes: script.scenes.map((s, i) => i === idx ? { ...s, loading: true, imageError: undefined } : s),
    });
    try {
      const r = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: scene.image_prompt, quality: imageQuality }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setScript((prev) => prev ? {
        ...prev,
        scenes: prev.scenes.map((s, i) => i === idx ? { ...s, imageUrl: data.dataUrl, loading: false } : s),
      } : prev);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setScript((prev) => prev ? {
        ...prev,
        scenes: prev.scenes.map((s, i) => i === idx ? { ...s, imageError: msg, loading: false } : s),
      } : prev);
    }
  }

  async function generateVoiceover() {
    if (!script) return;
    setLoadingAudio(true);
    setAudioError(null);
    setAudioUrl(null);
    try {
      const text = [script.hook, ...script.scenes.map((s) => s.voiceover)].join(" ");
      const r = await fetch("/api/generate/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setAudioUrl(data.dataUrl);
    } catch (e: unknown) {
      setAudioError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingAudio(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="h-16 border-b border-line px-5 flex items-center justify-between">
        <Logo />
        <Link href="/dashboard" className="text-sm text-ink-dim hover:text-ink">Open dashboard →</Link>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-brand">Studio · live playground</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">Test the pipeline with your keys.</h1>
          <p className="mt-2 text-ink-dim text-sm">
            Generates a script with Claude → portrait images per scene with OpenAI gpt-image-1 → voiceover with ElevenLabs.
            Set <code className="text-ink-dim font-mono text-xs">ANTHROPIC_API_KEY</code>, <code className="text-ink-dim font-mono text-xs">OPENAI_API_KEY</code>, <code className="text-ink-dim font-mono text-xs">ELEVENLABS_API_KEY</code> in Vercel.
          </p>
        </div>

        <section className="card p-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Niche" value={niche} onChange={setNiche} />
            <Field label="Topic" value={topic} onChange={setTopic} className="sm:col-span-2" />
            <Field label="Narrator vibe" value={voiceVibe} onChange={setVoiceVibe} className="sm:col-span-2" />
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-ink-mute">Image quality</span>
              <select
                value={imageQuality}
                onChange={(e) => setImageQuality(e.target.value as "low" | "medium" | "high")}
                className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
              >
                <option value="low">low (~$0.011/img)</option>
                <option value="medium">medium (~$0.042/img)</option>
                <option value="high">high (~$0.167/img)</option>
              </select>
            </label>
          </div>
          <button
            onClick={generateScript}
            disabled={loadingScript}
            className="mt-5 btn-brand text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingScript ? "Writing script…" : "1. Write script with Claude"}
          </button>
          {scriptError && <p className="mt-3 text-sm text-red-400">{scriptError}</p>}
        </section>

        {script && (
          <section className="card p-6 mt-6">
            <p className="text-xs text-ink-mute uppercase tracking-wider">Title</p>
            <h2 className="font-display text-xl font-bold">{script.title}</h2>
            <p className="mt-2 text-brand text-sm font-medium">Hook · {script.hook}</p>

            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {script.scenes.map((s, i) => (
                <div key={i} className="rounded-xl border border-line bg-bg-elev2 p-3">
                  <div className="aspect-[2/3] rounded-md bg-bg overflow-hidden grid place-items-center text-xs text-ink-mute relative">
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt={s.on_screen_text} className="w-full h-full object-cover" />
                    ) : s.loading ? (
                      <span className="skeleton w-full h-full block" />
                    ) : s.imageError ? (
                      <span className="text-red-400 p-2 text-center">{s.imageError}</span>
                    ) : (
                      <button
                        onClick={() => generateImageFor(i)}
                        className="text-brand hover:underline"
                      >
                        Generate image
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-mute">Scene {s.scene}</p>
                  <p className="text-sm text-ink mt-1">{s.voiceover}</p>
                  <p className="text-[11px] text-ink-mute mt-2 italic">caption: &ldquo;{s.on_screen_text}&rdquo;</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => script.scenes.forEach((_, i) => generateImageFor(i))}
                className="btn-ghost text-sm"
              >
                2. Generate all images with OpenAI
              </button>
              <button
                onClick={generateVoiceover}
                disabled={loadingAudio}
                className="btn-brand text-sm disabled:opacity-50"
              >
                {loadingAudio ? "Synthesising voice…" : "3. Voice it with ElevenLabs"}
              </button>
            </div>

            {audioError && <p className="mt-3 text-sm text-red-400">{audioError}</p>}
            {audioUrl && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-ink-mute mb-2">Voiceover</p>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function Field({
  label, value, onChange, className = "",
}: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs uppercase tracking-wider text-ink-mute">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
      />
    </label>
  );
}
