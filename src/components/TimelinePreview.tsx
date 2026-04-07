"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProjectStore } from "@/store/useProjectStore";

export default function TimelinePreview() {
  const scenes = useProjectStore((s) => s.scenes);
  const audio = useProjectStore((s) => s.audio);
  const settings = useProjectStore((s) => s.settings);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (scenes.length === 0) return null;

  const getSceneDuration = () => {
    if (settings.sceneDuration !== "auto") return settings.sceneDuration;
    if (audio) {
      const audioDuration = audio.trimEnd - audio.trimStart;
      return audioDuration / scenes.length;
    }
    return 3; // default 3 seconds per scene
  };

  const totalDuration = getSceneDuration() * scenes.length;

  /* eslint-disable react-hooks/rules-of-hooks */
  const stopPreview = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const startPreview = useCallback(() => {
    setIsPlaying(true);
    setCurrentSceneIndex(0);
    setProgress(0);

    if (audioRef.current && audio) {
      audioRef.current.currentTime = audio.trimStart;
      audioRef.current.volume = audio.volume;
      audioRef.current.play();
    }

    const sceneDuration = getSceneDuration();
    const intervalMs = 50;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += intervalMs / 1000;
      const newIndex = Math.min(
        Math.floor(elapsed / sceneDuration),
        scenes.length - 1
      );
      setCurrentSceneIndex(newIndex);
      setProgress(elapsed / totalDuration);

      if (elapsed >= totalDuration) {
        stopPreview();
      }
    }, intervalMs);
  }, [audio, scenes.length, totalDuration, stopPreview]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  /* eslint-enable react-hooks/rules-of-hooks */

  const sceneDuration = getSceneDuration();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
          5
        </span>
        <h2 className="text-xl font-semibold text-white">Timeline Preview</h2>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        {/* Preview Window */}
        <div className="relative w-full max-w-2xl mx-auto aspect-video bg-black rounded-lg overflow-hidden">
          {scenes[currentSceneIndex]?.imageUrl ? (
            <img
              src={scenes[currentSceneIndex].imageUrl!}
              alt={scenes[currentSceneIndex].label}
              className="w-full h-full object-contain transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted">
              <span className="text-sm">
                Scene {currentSceneIndex + 1}: {scenes[currentSceneIndex]?.label}
              </span>
            </div>
          )}

          {/* Play/Pause overlay */}
          <button
            onClick={isPlaying ? stopPreview : startPreview}
            className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Timeline strip */}
        <div className="space-y-2">
          <div className="flex gap-1 h-16 rounded overflow-hidden">
            {scenes.map((scene, i) => (
              <div
                key={scene.id}
                className={`flex-1 relative cursor-pointer rounded transition-all ${
                  i === currentSceneIndex
                    ? "ring-2 ring-accent"
                    : "opacity-60 hover:opacity-80"
                }`}
                onClick={() => setCurrentSceneIndex(i)}
              >
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.label}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full bg-background rounded flex items-center justify-center">
                    <span className="text-xs text-muted">{i + 1}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white px-1 py-0.5 truncate">
                  {sceneDuration.toFixed(1)}s
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-75"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              Scene {currentSceneIndex + 1} of {scenes.length}
            </span>
            <span>Total: {totalDuration.toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {audio && <audio ref={audioRef} src={audio.url} />}
    </section>
  );
}
