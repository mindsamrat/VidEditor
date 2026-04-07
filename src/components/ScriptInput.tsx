"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useProjectStore, Scene } from "@/store/useProjectStore";

const CONTENT_TYPES = [
  { value: "youtube_short", label: "YouTube Short" },
  { value: "reel", label: "Instagram Reel" },
  { value: "ad", label: "Advertisement" },
  { value: "explainer", label: "Explainer" },
  { value: "custom", label: "Custom" },
];

export default function ScriptInput() {
  const script = useProjectStore((s) => s.script);
  const contentType = useProjectStore((s) => s.contentType);
  const status = useProjectStore((s) => s.status);
  const setScript = useProjectStore((s) => s.setScript);
  const setContentType = useProjectStore((s) => s.setContentType);
  const setStatus = useProjectStore((s) => s.setStatus);
  const setScenes = useProjectStore((s) => s.setScenes);
  const setSuggestedStyle = useProjectStore((s) => s.setSuggestedStyle);

  const [error, setError] = useState<string | null>(null);

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const charCount = script.length;

  const analyzeScript = async () => {
    if (!script.trim()) return;
    setError(null);
    setStatus("analyzing");

    try {
      const res = await fetch("/api/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, contentType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to analyze script");
      }

      const data = await res.json();
      const scenes: Scene[] = data.scenes.map(
        (
          s: { id: string; label: string; scriptText: string; imagePrompt: string },
          i: number
        ) => ({
          id: s.id,
          label: s.label,
          scriptText: s.scriptText,
          imagePrompt: s.imagePrompt,
          imageUrl: null,
          imageBlob: null,
          status: "pending" as const,
          order: i,
          durationOverride: null,
        })
      );

      setScenes(scenes);
      setSuggestedStyle(data.suggestedStyle || "");
      setStatus("ready");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setStatus("draft");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
          1
        </span>
        <h2 className="text-xl font-semibold text-white">Script Input</h2>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted">Content Type</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {CONTENT_TYPES.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Paste your script here... (voiceover, narration, ad copy, etc.)"
          className="w-full h-48 bg-background border border-border rounded-lg p-4 font-mono text-sm text-foreground placeholder:text-muted/50 resize-y focus:outline-none focus:border-accent transition-colors"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs text-muted">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={analyzeScript}
            disabled={!script.trim() || status === "analyzing"}
            className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
          >
            {status === "analyzing" ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze Script"
            )}
          </motion.button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
