"use client";

import { useProjectStore } from "@/store/useProjectStore";

export default function VideoSettings() {
  const scenes = useProjectStore((s) => s.scenes);
  const settings = useProjectStore((s) => s.settings);
  const updateSettings = useProjectStore((s) => s.updateSettings);

  if (scenes.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
          4
        </span>
        <h2 className="text-xl font-semibold text-white">Video Settings</h2>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {/* Background Color */}
          <div className="space-y-2">
            <label className="text-xs text-muted uppercase tracking-wider block">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) =>
                  updateSettings({ backgroundColor: e.target.value })
                }
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <span className="text-sm font-mono text-muted">
                {settings.backgroundColor}
              </span>
            </div>
          </div>

          {/* Scene Duration */}
          <div className="space-y-2">
            <label className="text-xs text-muted uppercase tracking-wider block">
              Scene Duration
            </label>
            <div className="flex items-center gap-2">
              <select
                value={
                  settings.sceneDuration === "auto"
                    ? "auto"
                    : "manual"
                }
                onChange={(e) =>
                  updateSettings({
                    sceneDuration:
                      e.target.value === "auto" ? "auto" : 3,
                  })
                }
                className="bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
              >
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
              {settings.sceneDuration !== "auto" && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={settings.sceneDuration}
                    onChange={(e) =>
                      updateSettings({
                        sceneDuration: parseFloat(e.target.value) || 3,
                      })
                    }
                    className="w-16 bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
                    min={1}
                    max={30}
                    step={0.5}
                  />
                  <span className="text-xs text-muted">sec</span>
                </div>
              )}
            </div>
          </div>

          {/* Transition */}
          <div className="space-y-2">
            <label className="text-xs text-muted uppercase tracking-wider block">
              Transition
            </label>
            <select
              value={settings.transition}
              onChange={(e) =>
                updateSettings({
                  transition: e.target.value as
                    | "none"
                    | "fade"
                    | "crossdissolve",
                })
              }
              className="bg-background border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              <option value="none">None</option>
              <option value="fade">Fade</option>
              <option value="crossdissolve">Cross-dissolve</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs text-muted uppercase tracking-wider block">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {(["16:9", "9:16", "1:1"] as const).map((ar) => (
                <button
                  key={ar}
                  onClick={() => updateSettings({ aspectRatio: ar })}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    settings.aspectRatio === ar
                      ? "bg-accent text-white"
                      : "bg-background border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <label className="text-xs text-muted uppercase tracking-wider block">
              Output Quality
            </label>
            <div className="flex gap-2">
              {(["720p", "1080p"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => updateSettings({ quality: q })}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    settings.quality === q
                      ? "bg-accent text-white"
                      : "bg-background border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
