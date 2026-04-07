"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useProjectStore } from "@/store/useProjectStore";

export default function ExportSection() {
  const scenes = useProjectStore((s) => s.scenes);
  const audio = useProjectStore((s) => s.audio);
  const settings = useProjectStore((s) => s.settings);
  const status = useProjectStore((s) => s.status);
  const setStatus = useProjectStore((s) => s.setStatus);
  const exportProgress = useProjectStore((s) => s.exportProgress);
  const setExportProgress = useProjectStore((s) => s.setExportProgress);

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef = useRef<import("@ffmpeg/ffmpeg").FFmpeg | null>(null);

  if (scenes.length === 0) return null;

  const scenesWithImages = scenes.filter((s) => s.imageUrl);
  const canExport = scenesWithImages.length > 0;

  const getResolution = (): [number, number] => {
    const is1080 = settings.quality === "1080p";
    switch (settings.aspectRatio) {
      case "16:9":
        return is1080 ? [1920, 1080] : [1280, 720];
      case "9:16":
        return is1080 ? [1080, 1920] : [720, 1280];
      case "1:1":
        return is1080 ? [1080, 1080] : [720, 720];
    }
  };

  const getSceneDuration = () => {
    if (settings.sceneDuration !== "auto") return settings.sceneDuration;
    if (audio) {
      const audioDuration = audio.trimEnd - audio.trimStart;
      return audioDuration / scenesWithImages.length;
    }
    return 3;
  };

  const exportVideo = async () => {
    setError(null);
    setStatus("exporting");
    setExportProgress(0);
    setDownloadUrl(null);

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");

      if (!ffmpegRef.current) {
        const ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress }) => {
          setExportProgress(Math.min(Math.round(progress * 100), 100));
        });
        await ffmpeg.load();
        ffmpegRef.current = ffmpeg;
      }

      const ffmpeg = ffmpegRef.current;
      const [width, height] = getResolution();
      const sceneDuration = getSceneDuration();
      const fps = 30;

      // Write each scene image to FFmpeg filesystem
      const validScenes = scenes.filter((s) => s.imageUrl);
      for (let i = 0; i < validScenes.length; i++) {
        const scene = validScenes[i];
        let imageData: Uint8Array;

        if (scene.imageBlob) {
          imageData = new Uint8Array(await scene.imageBlob.arrayBuffer());
        } else if (scene.imageUrl) {
          imageData = await fetchFile(scene.imageUrl);
        } else {
          continue;
        }

        await ffmpeg.writeFile(`image_${i}.webp`, imageData);

        // Convert each image to a video segment
        const segArgs = [
          "-loop", "1",
          "-i", `image_${i}.webp`,
          "-t", sceneDuration.toString(),
          "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${settings.backgroundColor.replace("#", "0x")}`,
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-r", fps.toString(),
          "-y", `segment_${i}.mp4`,
        ];
        await ffmpeg.exec(segArgs);
        setExportProgress(Math.round(((i + 1) / validScenes.length) * 50));
      }

      // Create concat file
      const concatContent = validScenes
        .map((_, i) => `file 'segment_${i}.mp4'`)
        .join("\n");
      await ffmpeg.writeFile(
        "concat.txt",
        new TextEncoder().encode(concatContent)
      );

      // Concatenate all segments
      const concatArgs = [
        "-f", "concat",
        "-safe", "0",
        "-i", "concat.txt",
        "-c", "copy",
        "-y", "concatenated.mp4",
      ];
      await ffmpeg.exec(concatArgs);
      setExportProgress(60);

      // Apply transitions if needed
      let videoFile = "concatenated.mp4";

      if (settings.transition === "fade" && validScenes.length > 1) {
        // Add fade in/out to each scene
        const fadeFilter = `fade=t=in:st=0:d=0.3,fade=t=out:st=${sceneDuration - 0.3}:d=0.3`;
        await ffmpeg.exec([
          "-i", "concatenated.mp4",
          "-vf", fadeFilter,
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-y", "faded.mp4",
        ]);
        videoFile = "faded.mp4";
      } else if (settings.transition === "crossdissolve" && validScenes.length > 1) {
        // Simple crossfade approximation
        await ffmpeg.exec([
          "-i", "concatenated.mp4",
          "-vf", "fade=t=in:st=0:d=0.5",
          "-c:v", "libx264",
          "-pix_fmt", "yuv420p",
          "-y", "faded.mp4",
        ]);
        videoFile = "faded.mp4";
      }
      setExportProgress(75);

      // Mix audio if present
      let outputFile = videoFile;
      if (audio) {
        const audioData = new Uint8Array(await audio.file.arrayBuffer());
        await ffmpeg.writeFile("audio_input", audioData);

        await ffmpeg.exec([
          "-i", videoFile,
          "-i", "audio_input",
          "-ss", audio.trimStart.toString(),
          "-t", (audio.trimEnd - audio.trimStart).toString(),
          "-c:v", "copy",
          "-c:a", "aac",
          "-b:a", "192k",
          "-filter:a", `volume=${audio.volume}`,
          "-shortest",
          "-y", "final.mp4",
        ]);
        outputFile = "final.mp4";
      }
      setExportProgress(90);

      // Read output file
      const data = await ffmpeg.readFile(outputFile);
      const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setFileSize(blob.size);
      setExportProgress(100);
      setStatus("ready");
    } catch (err: unknown) {
      console.error("Export error:", err);
      setError(err instanceof Error ? err.message : "Export failed");
      setStatus("ready");
      setExportProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalDuration = getSceneDuration() * scenesWithImages.length;
  const [width, height] = getResolution();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
          6
        </span>
        <h2 className="text-xl font-semibold text-white">Export Video</h2>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-6 text-sm text-muted">
          <span>
            {scenesWithImages.length} scenes with images
          </span>
          <span>{totalDuration.toFixed(1)}s duration</span>
          <span>
            {width}x{height}
          </span>
          {audio && <span>With audio</span>}
        </div>

        {status === "exporting" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">Rendering video...</span>
              <span className="text-muted">{exportProgress}%</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${exportProgress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportVideo}
            disabled={!canExport}
            className="px-6 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            Export Video
          </motion.button>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {downloadUrl && (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-medium">Video exported successfully!</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span>{formatFileSize(fileSize)}</span>
              <span>{totalDuration.toFixed(1)}s</span>
              <span>
                {width}x{height}
              </span>
            </div>
            <a
              href={downloadUrl}
              download="script-to-video.mp4"
              className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Download .mp4
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
