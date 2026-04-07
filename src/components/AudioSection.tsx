"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useProjectStore } from "@/store/useProjectStore";

export default function AudioSection() {
  const audio = useProjectStore((s) => s.audio);
  const setAudio = useProjectStore((s) => s.setAudio);
  const updateAudio = useProjectStore((s) => s.updateAudio);
  const scenes = useProjectStore((s) => s.scenes);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  if (scenes.length === 0) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    // Decode audio for waveform
    const arrayBuffer = await file.arrayBuffer();
    const audioContext = new AudioContext();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    setAudioBuffer(buffer);

    setAudio({
      file,
      url,
      trimStart: 0,
      trimEnd: buffer.duration,
      type: "background",
      volume: 0.8,
      duration: buffer.duration,
    });
  };

  const removeAudio = () => {
    if (audio?.url) URL.revokeObjectURL(audio.url);
    setAudio(null);
    setAudioBuffer(null);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = audio?.trimStart || 0;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  /* eslint-disable react-hooks/rules-of-hooks */

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !audioBuffer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);

    ctx.clearRect(0, 0, width, height);

    // Draw trim region
    if (audio) {
      const startX = (audio.trimStart / audioBuffer.duration) * width;
      const endX = (audio.trimEnd / audioBuffer.duration) * width;
      ctx.fillStyle = "rgba(124, 92, 252, 0.1)";
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = "#7C5CFC";
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
      const sliceStart = i * step;
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step && sliceStart + j < data.length; j++) {
        const val = data[sliceStart + j];
        if (val < min) min = val;
        if (val > max) max = val;
      }

      const yMin = ((1 + min) * height) / 2;
      const yMax = ((1 + max) * height) / 2;

      ctx.moveTo(i, yMin);
      ctx.lineTo(i, yMax);
    }
    ctx.stroke();

    // Draw playhead
    if (audio && audioBuffer.duration > 0) {
      const playheadX = (currentTime / audioBuffer.duration) * width;
      ctx.beginPath();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
    }

    // Draw trim handles
    if (audio) {
      const startX = (audio.trimStart / audioBuffer.duration) * width;
      const endX = (audio.trimEnd / audioBuffer.duration) * width;
      ctx.fillStyle = "#7C5CFC";
      ctx.fillRect(startX - 2, 0, 4, height);
      ctx.fillRect(endX - 2, 0, 4, height);
    }
  }, [audioBuffer, audio, currentTime]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const updateTime = () => {
      setCurrentTime(audioEl.currentTime);
      if (audio && audioEl.currentTime >= audio.trimEnd) {
        audioEl.pause();
        setIsPlaying(false);
      }
    };

    const onEnded = () => setIsPlaying(false);

    audioEl.addEventListener("timeupdate", updateTime);
    audioEl.addEventListener("ended", onEnded);
    return () => {
      audioEl.removeEventListener("timeupdate", updateTime);
      audioEl.removeEventListener("ended", onEnded);
    };
  }, [audio]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioBuffer || !audio) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    const time = ratio * audioBuffer.duration;

    // Check if clicking near trim handles
    const startX = (audio.trimStart / audioBuffer.duration) * rect.width;
    const endX = (audio.trimEnd / audioBuffer.duration) * rect.width;

    if (Math.abs(x - startX) < 10) {
      // Dragging trim start - handled via mousedown
    } else if (Math.abs(x - endX) < 10) {
      // Dragging trim end
    } else {
      // Seek
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };

  /* eslint-enable react-hooks/rules-of-hooks */

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
          3
        </span>
        <h2 className="text-xl font-semibold text-white">Audio</h2>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        {!audio ? (
          <div className="text-center space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-background border border-dashed border-border rounded-lg text-muted hover:text-foreground hover:border-accent transition-colors w-full"
            >
              <div className="flex flex-col items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-sm">
                  Upload Audio (.mp3, .wav, .m4a)
                </span>
              </div>
            </button>
            <p className="text-xs text-muted">
              TTS generation coming in a future update
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground font-medium truncate max-w-[200px]">
                  {audio.file.name}
                </span>
                <span className="text-xs text-muted">
                  {formatTime(audio.duration)}
                </span>
              </div>
              <button
                onClick={removeAudio}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove Audio
              </button>
            </div>

            {/* Waveform */}
            <canvas
              ref={canvasRef}
              className="w-full h-24 rounded-lg bg-background cursor-pointer"
              onClick={handleCanvasClick}
            />

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </button>

              <span className="text-sm font-mono text-muted">
                {formatTime(currentTime)} / {formatTime(audio.duration)}
              </span>

              <div className="flex-1" />

              {/* Trim controls */}
              <div className="flex items-center gap-2 text-xs">
                <label className="text-muted">Trim:</label>
                <input
                  type="number"
                  value={audio.trimStart.toFixed(1)}
                  onChange={(e) =>
                    updateAudio({ trimStart: parseFloat(e.target.value) || 0 })
                  }
                  className="w-16 bg-background border border-border rounded px-2 py-1 text-foreground text-xs"
                  min={0}
                  max={audio.trimEnd}
                  step={0.1}
                />
                <span className="text-muted">to</span>
                <input
                  type="number"
                  value={audio.trimEnd.toFixed(1)}
                  onChange={(e) =>
                    updateAudio({
                      trimEnd:
                        parseFloat(e.target.value) || audio.duration,
                    })
                  }
                  className="w-16 bg-background border border-border rounded px-2 py-1 text-foreground text-xs"
                  min={audio.trimStart}
                  max={audio.duration}
                  step={0.1}
                />
                <span className="text-muted">s</span>
              </div>
            </div>

            {/* Audio type and volume */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted">Type:</label>
                <select
                  value={audio.type}
                  onChange={(e) =>
                    updateAudio({
                      type: e.target.value as "background" | "voiceover",
                    })
                  }
                  className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="background">Background Music</option>
                  <option value="voiceover">Voiceover</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-muted">Volume:</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={audio.volume}
                  onChange={(e) =>
                    updateAudio({ volume: parseFloat(e.target.value) })
                  }
                  className="w-24 accent-accent"
                />
                <span className="text-xs text-muted">
                  {Math.round(audio.volume * 100)}%
                </span>
              </div>
            </div>

            <audio ref={audioRef} src={audio.url} />
          </div>
        )}
      </div>
    </section>
  );
}
