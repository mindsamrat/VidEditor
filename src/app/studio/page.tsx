"use client";

import { useState } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { Logo } from "@/components/marketing/Logo";
import { composeVideo, type ComposeProgress } from "@/lib/composeVideo";

type Scene = {
  scene: number;
  voiceover: string;
  image_prompt: string;
  on_screen_text: string;
  imageDataUrl?: string;
  imageError?: string;
  imageLoading?: boolean;
  audioDataUrl?: string;
  audioError?: string;
  audioLoading?: boolean;
};

type Script = {
  title: string;
  hook: string;
  scenes: Scene[];
};

type Mode = "ai" | "byo";

export default function StudioPage() {
  // ── Setup form state
  const [mode, setMode] = useState<Mode>("ai");
  const [topic, setTopic] = useState("How Thor lost his hammer, in 60 seconds");
  const [niche, setNiche] = useState("Mythology");
  const [voiceVibe, setVoiceVibe] = useState("deep documentary narrator");
  const [byoScript, setByoScript] = useState("");
  const [imageQuality, setImageQuality] = useState<"low" | "medium" | "high">("low");
  const [voiceName, setVoiceName] = useState("onyx");
  const [voiceProvider, setVoiceProvider] = useState<"openai" | "elevenlabs">("openai");
  const [sceneCount, setSceneCount] = useState(6);

  // ── Pipeline state
  const [script, setScript] = useState<Script | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);

  const [composeProgress, setComposeProgress] = useState<ComposeProgress | null>(null);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [savedToLibrary, setSavedToLibrary] = useState<{ saved: boolean; reason?: string; id?: string } | null>(null);
  const [savingToLibrary, setSavingToLibrary] = useState(false);

  // ── Step 1: write or split script
  async function generateScript() {
    setLoadingScript(true);
    setScript(null);
    setScriptError(null);
    setVideoUrl(null);
    try {
      const endpoint = mode === "ai" ? "/api/generate/script" : "/api/generate/scenes";
      const body = mode === "ai"
        ? { topic, niche, voice: voiceVibe, sceneCount }
        : { script: byoScript, sceneCount };
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  // ── Step 2: generate one image per scene
  async function generateImage(idx: number) {
    if (!script) return;
    const scene = script.scenes[idx];
    patchScene(idx, { imageLoading: true, imageError: undefined });
    try {
      const r = await fetch("/api/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: scene.image_prompt, quality: imageQuality }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      patchScene(idx, { imageDataUrl: data.dataUrl, imageLoading: false });
    } catch (e: unknown) {
      patchScene(idx, {
        imageError: e instanceof Error ? e.message : String(e),
        imageLoading: false,
      });
    }
  }

  async function generateAllImages() {
    if (!script) return;
    for (let i = 0; i < script.scenes.length; i++) {
      // sequential to avoid OpenAI per-minute image rate limits
      await generateImage(i);
    }
  }

  // ── Step 3: per-scene voiceover (one MP3 per scene so video timing matches)
  async function generateAudio(idx: number) {
    if (!script) return;
    const scene = script.scenes[idx];
    patchScene(idx, { audioLoading: true, audioError: undefined });
    try {
      const r = await fetch("/api/generate/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: scene.voiceover,
          voice: voiceName,
          provider: voiceProvider,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      patchScene(idx, { audioDataUrl: data.dataUrl, audioLoading: false });
    } catch (e: unknown) {
      patchScene(idx, {
        audioError: e instanceof Error ? e.message : String(e),
        audioLoading: false,
      });
    }
  }

  async function generateAllAudio() {
    if (!script) return;
    for (let i = 0; i < script.scenes.length; i++) {
      await generateAudio(i);
    }
  }

  // ── Step 4: compose final MP4 with ffmpeg.wasm in the browser
  async function makeVideo() {
    if (!script) return;
    setComposeError(null);
    setVideoUrl(null);
    setSavedToLibrary(null);
    try {
      if (script.scenes.some((s) => !s.imageDataUrl || !s.audioDataUrl)) {
        throw new Error("Every scene needs an image and an audio clip first.");
      }
      const blob = await composeVideo(
        script.scenes.map((s) => ({
          imageDataUrl: s.imageDataUrl!,
          audioDataUrl: s.audioDataUrl!,
        })),
        setComposeProgress
      );
      setVideoUrl(URL.createObjectURL(blob));
      // Fire-and-forget: upload to Vercel Blob + save DB row if accounts are
      // configured. Local download still works either way.
      saveComposedVideo(blob).catch(() => {});
    } catch (e: unknown) {
      setComposeError(e instanceof Error ? e.message : String(e));
    }
  }

  async function saveComposedVideo(blob: Blob) {
    if (!script) return;
    setSavingToLibrary(true);
    try {
      const filename = `reel-${Date.now()}.mp4`;
      const uploaded = await upload(filename, blob, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "video/mp4",
      });
      const r = await fetch("/api/videos/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: script.title,
          hook: script.hook,
          videoUrl: uploaded.url,
          scenes: script.scenes.map((s) => ({
            voiceover: s.voiceover,
            image_prompt: s.image_prompt,
            on_screen_text: s.on_screen_text,
          })),
        }),
      });
      const data = await r.json();
      setSavedToLibrary({ saved: !!data.saved, reason: data.reason, id: data.video?.id });
    } catch (e) {
      setSavedToLibrary({
        saved: false,
        reason: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setSavingToLibrary(false);
    }
  }

  function patchScene(idx: number, patch: Partial<Scene>) {
    setScript((prev) =>
      prev
        ? { ...prev, scenes: prev.scenes.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }
        : prev
    );
  }

  const allHaveImages = script?.scenes.every((s) => s.imageDataUrl) ?? false;
  const allHaveAudio = script?.scenes.every((s) => s.audioDataUrl) ?? false;
  const canCompose = allHaveImages && allHaveAudio;

  return (
    <div className="min-h-screen">
      <header className="h-16 border-b border-line px-5 flex items-center justify-between">
        <Logo />
        <Link href="/dashboard" className="text-sm text-ink-dim hover:text-ink">
          Open dashboard →
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand">Studio · live playground</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-2">
            Build a faceless reel end-to-end.
          </h1>
          <p className="mt-2 text-ink-dim text-sm">
            Script (Claude or your own) → 9:16 images (OpenAI) → voiceover (OpenAI TTS, cheapest) →
            final MP4 (composed in your browser, no server render needed). Bring your own keys
            in Vercel envs: <code className="font-mono text-xs">ANTHROPIC_API_KEY</code>,{" "}
            <code className="font-mono text-xs">OPENAI_API_KEY</code>.
          </p>
        </div>

        {/* ── Step 1: script source ───────────────────────────────────────── */}
        <section className="card p-6">
          <Step n={1} title="Script">
            <div className="inline-flex p-1 rounded-full border border-line bg-bg-elev2 text-sm">
              <button
                onClick={() => setMode("ai")}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === "ai" ? "bg-brand text-bg" : "text-ink-dim"
                }`}
              >
                Write it for me
              </button>
              <button
                onClick={() => setMode("byo")}
                className={`px-4 py-1.5 rounded-full transition ${
                  mode === "byo" ? "bg-brand text-bg" : "text-ink-dim"
                }`}
              >
                I&rsquo;ll paste my own
              </button>
            </div>
          </Step>

          {mode === "ai" ? (
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <Field label="Niche" value={niche} onChange={setNiche} />
              <Field label="Topic" value={topic} onChange={setTopic} className="sm:col-span-2" />
              <Field
                label="Narrator vibe"
                value={voiceVibe}
                onChange={setVoiceVibe}
                className="sm:col-span-2"
              />
              <NumField label="Scenes" value={sceneCount} onChange={setSceneCount} min={3} max={8} />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-ink-mute">Your script</span>
                <textarea
                  value={byoScript}
                  onChange={(e) => setByoScript(e.target.value)}
                  rows={8}
                  placeholder="Paste your script here. We won't rewrite it — Claude will only split it into scenes and add image prompts."
                  className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-3 py-2.5 text-sm font-mono leading-relaxed focus:outline-none focus:border-brand"
                />
              </label>
              <NumField label="Scenes" value={sceneCount} onChange={setSceneCount} min={3} max={10} />
            </div>
          )}

          <button
            onClick={generateScript}
            disabled={loadingScript || (mode === "byo" && byoScript.trim().length < 30)}
            className="btn-brand text-sm mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingScript
              ? "Working…"
              : mode === "ai"
                ? "Generate script"
                : "Split into scenes"}
          </button>
          {scriptError && <p className="mt-3 text-sm text-red-400">{scriptError}</p>}
        </section>

        {/* ── Step 2 + 3 + 4: scenes ──────────────────────────────────────── */}
        {script && (
          <>
            <section className="card p-6">
              <Step n={2} title="Visuals + voice">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-ink-mute uppercase tracking-wider">Image quality</span>
                    <select
                      value={imageQuality}
                      onChange={(e) =>
                        setImageQuality(e.target.value as "low" | "medium" | "high")
                      }
                      className="bg-bg-elev2 border border-line rounded-md px-2 py-1 text-sm"
                    >
                      <option value="low">low (~$0.011)</option>
                      <option value="medium">medium (~$0.042)</option>
                      <option value="high">high (~$0.167)</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <span className="text-ink-mute uppercase tracking-wider">Voice</span>
                    <select
                      value={voiceProvider}
                      onChange={(e) =>
                        setVoiceProvider(e.target.value as "openai" | "elevenlabs")
                      }
                      className="bg-bg-elev2 border border-line rounded-md px-2 py-1 text-sm"
                    >
                      <option value="openai">OpenAI (cheap)</option>
                      <option value="elevenlabs">ElevenLabs</option>
                    </select>
                    {voiceProvider === "openai" && (
                      <select
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        className="bg-bg-elev2 border border-line rounded-md px-2 py-1 text-sm"
                      >
                        {["alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash", "coral", "sage"].map(
                          (v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    )}
                  </label>
                </div>
              </Step>

              <p className="text-xs text-ink-mute uppercase tracking-wider mt-5">Title</p>
              <h2 className="font-display text-xl font-bold">{script.title}</h2>
              <p className="mt-1 text-brand text-sm font-medium">Hook · {script.hook}</p>

              <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {script.scenes.map((s, i) => (
                  <SceneCard
                    key={i}
                    s={s}
                    onImage={() => generateImage(i)}
                    onAudio={() => generateAudio(i)}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={generateAllImages} className="btn-ghost text-sm">
                  Generate all images
                </button>
                <button onClick={generateAllAudio} className="btn-ghost text-sm">
                  Voice all scenes
                </button>
              </div>
            </section>

            <section className="card p-6">
              <Step n={3} title="Compose final MP4 (in your browser)">
                <span className="text-xs text-ink-mute">
                  ffmpeg.wasm · 9:16 · stitched in-browser, no server render
                </span>
              </Step>

              <button
                onClick={makeVideo}
                disabled={!canCompose}
                className="btn-brand text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canCompose ? "Compose video" : "Generate all images + audio first"}
              </button>

              {composeProgress && composeProgress.stage !== "done" && (
                <p className="mt-3 text-sm text-ink-dim">{composeProgress.message}</p>
              )}
              {composeError && <p className="mt-3 text-sm text-red-400">{composeError}</p>}

              {videoUrl && (
                <div className="mt-5 grid md:grid-cols-2 gap-4">
                  <video src={videoUrl} controls className="w-full rounded-xl border border-line" />
                  <div className="flex flex-col justify-center gap-3">
                    <p className="text-sm text-ink-dim">
                      Your reel is ready. Download it below — or open the library if you saved it.
                    </p>
                    <a
                      href={videoUrl}
                      download={`reelforge-${Date.now()}.mp4`}
                      className="btn-brand text-sm w-fit"
                    >
                      ⬇ Download MP4
                    </a>
                    {savingToLibrary && (
                      <p className="text-xs text-ink-mute">Saving to your library…</p>
                    )}
                    {savedToLibrary?.saved && (
                      <p className="text-xs text-brand">
                        ✓ Saved to library.{" "}
                        <Link href="/dashboard/library" className="underline">Open library</Link>
                      </p>
                    )}
                    {savedToLibrary && !savedToLibrary.saved && savedToLibrary.reason && (
                      <p className="text-xs text-ink-mute">
                        Not saved: {savedToLibrary.reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// ── small helpers ──────────────────────────────────────────────────────────

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-between">
      <h3 className="font-display text-lg font-semibold flex items-center gap-3">
        <span className="grid place-items-center w-7 h-7 rounded-full bg-brand text-bg text-xs font-bold">
          {n}
        </span>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
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

function NumField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-ink-mute">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full bg-bg-elev2 border border-line rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand"
      />
    </label>
  );
}

function SceneCard({
  s,
  onImage,
  onAudio,
}: {
  s: Scene;
  onImage: () => void;
  onAudio: () => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-bg-elev2 p-3">
      <div className="aspect-[2/3] rounded-md bg-bg overflow-hidden grid place-items-center text-xs text-ink-mute relative">
        {s.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imageDataUrl} alt={s.on_screen_text} className="w-full h-full object-cover" />
        ) : s.imageLoading ? (
          <span className="skeleton w-full h-full block" />
        ) : s.imageError ? (
          <span className="text-red-400 p-2 text-center">{s.imageError}</span>
        ) : (
          <button onClick={onImage} className="text-brand hover:underline">
            Generate image
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-mute">Scene {s.scene}</p>
      <p className="text-sm text-ink mt-1">{s.voiceover}</p>
      <p className="text-[11px] text-ink-mute mt-2 italic">caption: &ldquo;{s.on_screen_text}&rdquo;</p>

      <div className="mt-3">
        {s.audioDataUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={s.audioDataUrl} controls className="w-full h-9" />
        ) : s.audioLoading ? (
          <div className="skeleton h-9 w-full rounded-md" />
        ) : s.audioError ? (
          <p className="text-xs text-red-400">{s.audioError}</p>
        ) : (
          <button onClick={onAudio} className="text-xs text-brand hover:underline">
            Voice this scene →
          </button>
        )}
      </div>
    </div>
  );
}
