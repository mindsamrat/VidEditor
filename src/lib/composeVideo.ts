"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// 9:16 portrait — same aspect as gpt-image-1 1024x1536 output.
const W = 1024;
const H = 1536;

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

let ffmpeg: FFmpeg | null = null;

export type ComposeProgress = {
  stage: "loading-ffmpeg" | "rendering-scene" | "concatenating" | "muxing-audio" | "finalising" | "done";
  sceneIndex?: number;
  totalScenes?: number;
  message: string;
};

export type PerSceneInput = {
  imageDataUrl: string;
  audioDataUrl: string;
};

export type TimelineInput = {
  // Single master audio (the user's uploaded file, or a pre-merged TTS track).
  audioDataUrl: string;
  // Image per scene, with start/end seconds inside the master audio.
  scenes: { imageDataUrl: string; startSec: number; endSec: number }[];
};

export async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  ffmpeg = new FFmpeg();
  if (onLog) ffmpeg.on("log", ({ message }) => onLog(message));
  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return ffmpeg;
}

const VF_PORTRAIT = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`;

// ─────────────────────────────────────────────────────────────────────────
// Mode A: per-scene clips with embedded TTS audio (existing path).
// Used by the AI / paste-script flows where each scene has its own MP3.
// ─────────────────────────────────────────────────────────────────────────
export async function composeVideo(
  scenes: PerSceneInput[],
  onProgress: (p: ComposeProgress) => void
): Promise<Blob> {
  if (scenes.length === 0) throw new Error("No scenes to compose");
  for (let i = 0; i < scenes.length; i++) {
    if (!scenes[i].imageDataUrl) throw new Error(`Scene ${i + 1} is missing an image`);
    if (!scenes[i].audioDataUrl) throw new Error(`Scene ${i + 1} is missing audio`);
  }

  onProgress({ stage: "loading-ffmpeg", message: "Loading video engine…" });
  const ff = await getFFmpeg();

  const sceneFiles: string[] = [];
  for (let i = 0; i < scenes.length; i++) {
    onProgress({
      stage: "rendering-scene",
      sceneIndex: i,
      totalScenes: scenes.length,
      message: `Rendering scene ${i + 1} of ${scenes.length}…`,
    });

    const img = `img${i}.png`;
    const aud = `aud${i}.mp3`;
    const out = `scene${i}.mp4`;

    await ff.writeFile(img, await fetchFile(scenes[i].imageDataUrl));
    await ff.writeFile(aud, await fetchFile(scenes[i].audioDataUrl));

    await ff.exec([
      "-loop", "1",
      "-i", img,
      "-i", aud,
      "-c:v", "libx264",
      "-tune", "stillimage",
      "-c:a", "aac",
      "-b:a", "128k",
      "-pix_fmt", "yuv420p",
      "-vf", VF_PORTRAIT,
      "-r", "30",
      "-shortest",
      out,
    ]);

    await ff.deleteFile(img).catch(() => {});
    await ff.deleteFile(aud).catch(() => {});
    sceneFiles.push(out);
  }

  onProgress({ stage: "concatenating", message: "Stitching scenes together…" });
  const list = sceneFiles.map((f) => `file '${f}'`).join("\n");
  await ff.writeFile("list.txt", new TextEncoder().encode(list));
  await ff.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "final.mp4"]);

  onProgress({ stage: "finalising", message: "Packaging MP4…" });
  const data = await ff.readFile("final.mp4");

  for (const f of sceneFiles) await ff.deleteFile(f).catch(() => {});
  await ff.deleteFile("list.txt").catch(() => {});
  await ff.deleteFile("final.mp4").catch(() => {});

  onProgress({ stage: "done", message: "Done." });
  return new Blob([sliceBuffer(data)], { type: "video/mp4" });
}

// ─────────────────────────────────────────────────────────────────────────
// Mode B: timeline — single master audio + scenes with start/end times.
// Used by the BYO-audio flow where the user uploaded one MP3 and Whisper
// found the natural beats.
// ─────────────────────────────────────────────────────────────────────────
export async function composeVideoTimeline(
  input: TimelineInput,
  onProgress: (p: ComposeProgress) => void
): Promise<Blob> {
  const { audioDataUrl, scenes } = input;
  if (!audioDataUrl) throw new Error("Master audio is missing");
  if (scenes.length === 0) throw new Error("No scenes to compose");
  for (let i = 0; i < scenes.length; i++) {
    if (!scenes[i].imageDataUrl) throw new Error(`Scene ${i + 1} is missing an image`);
    if (scenes[i].endSec <= scenes[i].startSec) {
      throw new Error(`Scene ${i + 1} has zero or negative duration`);
    }
  }

  onProgress({ stage: "loading-ffmpeg", message: "Loading video engine…" });
  const ff = await getFFmpeg();

  // 1. Render each scene as a silent still-image clip of the right duration.
  const clipFiles: string[] = [];
  for (let i = 0; i < scenes.length; i++) {
    onProgress({
      stage: "rendering-scene",
      sceneIndex: i,
      totalScenes: scenes.length,
      message: `Rendering scene ${i + 1} of ${scenes.length}…`,
    });

    const img = `img${i}.png`;
    const out = `clip${i}.mp4`;
    const dur = (scenes[i].endSec - scenes[i].startSec).toFixed(3);

    await ff.writeFile(img, await fetchFile(scenes[i].imageDataUrl));
    await ff.exec([
      "-loop", "1",
      "-i", img,
      "-t", dur,
      "-c:v", "libx264",
      "-tune", "stillimage",
      "-pix_fmt", "yuv420p",
      "-vf", VF_PORTRAIT,
      "-r", "30",
      "-an",
      out,
    ]);
    await ff.deleteFile(img).catch(() => {});
    clipFiles.push(out);
  }

  // 2. Concat the silent clips into one video-only track.
  onProgress({ stage: "concatenating", message: "Stitching scenes together…" });
  const list = clipFiles.map((f) => `file '${f}'`).join("\n");
  await ff.writeFile("list.txt", new TextEncoder().encode(list));
  await ff.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "video_only.mp4"]);

  // 3. Mux with the master audio. -shortest stops at whichever is shorter.
  onProgress({ stage: "muxing-audio", message: "Adding your audio track…" });
  const audioExt = guessExt(audioDataUrl);
  const audioFile = `master.${audioExt}`;
  await ff.writeFile(audioFile, await fetchFile(audioDataUrl));
  await ff.exec([
    "-i", "video_only.mp4",
    "-i", audioFile,
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    "final.mp4",
  ]);

  onProgress({ stage: "finalising", message: "Packaging MP4…" });
  const data = await ff.readFile("final.mp4");

  for (const f of clipFiles) await ff.deleteFile(f).catch(() => {});
  await ff.deleteFile(audioFile).catch(() => {});
  await ff.deleteFile("list.txt").catch(() => {});
  await ff.deleteFile("video_only.mp4").catch(() => {});
  await ff.deleteFile("final.mp4").catch(() => {});

  onProgress({ stage: "done", message: "Done." });
  return new Blob([sliceBuffer(data)], { type: "video/mp4" });
}

function sliceBuffer(data: Uint8Array | string): ArrayBuffer {
  if (typeof data === "string") return new TextEncoder().encode(data).buffer as ArrayBuffer;
  return (data.buffer as ArrayBuffer).slice(data.byteOffset, data.byteOffset + data.byteLength);
}

function guessExt(dataUrl: string): string {
  const m = /^data:audio\/([a-z0-9+\-]+);/i.exec(dataUrl);
  if (!m) return "mp3";
  const mime = m[1].toLowerCase();
  if (mime.includes("mpeg") || mime.includes("mp3")) return "mp3";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("m4a") || mime.includes("mp4")) return "m4a";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("ogg")) return "ogg";
  return "mp3";
}
