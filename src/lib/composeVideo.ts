"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// 9:16 portrait reels — same aspect as gpt-image-1 1024x1536 output.
const W = 1024;
const H = 1536;

const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

let ffmpeg: FFmpeg | null = null;

export type Scene = {
  imageDataUrl: string; // data:image/png;base64,...
  audioDataUrl: string; // data:audio/mpeg;base64,...
};

export type ComposeProgress = {
  stage: "loading-ffmpeg" | "rendering-scene" | "concatenating" | "finalising" | "done";
  sceneIndex?: number;
  totalScenes?: number;
  message: string;
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

/**
 * Compose a 9:16 MP4 from N scenes. Each scene becomes a still-frame clip whose
 * length equals the scene's voiceover audio length. Scenes are then concatenated.
 */
export async function composeVideo(
  scenes: Scene[],
  onProgress: (p: ComposeProgress) => void
): Promise<Blob> {
  if (scenes.length === 0) throw new Error("No scenes to compose");
  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (!s.imageDataUrl) throw new Error(`Scene ${i + 1} is missing an image`);
    if (!s.audioDataUrl) throw new Error(`Scene ${i + 1} is missing audio`);
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

    // Encode this scene: image looped for duration of audio, scaled+padded to 9:16.
    await ff.exec([
      "-loop", "1",
      "-i", img,
      "-i", aud,
      "-c:v", "libx264",
      "-tune", "stillimage",
      "-c:a", "aac",
      "-b:a", "128k",
      "-pix_fmt", "yuv420p",
      "-vf", `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`,
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

  await ff.exec([
    "-f", "concat",
    "-safe", "0",
    "-i", "list.txt",
    "-c", "copy",
    "final.mp4",
  ]);

  onProgress({ stage: "finalising", message: "Packaging MP4…" });
  const data = await ff.readFile("final.mp4");

  for (const f of sceneFiles) await ff.deleteFile(f).catch(() => {});
  await ff.deleteFile("list.txt").catch(() => {});
  await ff.deleteFile("final.mp4").catch(() => {});

  onProgress({ stage: "done", message: "Done." });
  const ab = (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
  return new Blob([ab], { type: "video/mp4" });
}
