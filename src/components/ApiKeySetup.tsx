"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface KeyStatus {
  hasAnthropicKey: boolean;
  hasReplicateToken: boolean;
}

export default function ApiKeySetup() {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [anthropicKey, setAnthropicKey] = useState("");
  const [replicateToken, setReplicateToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const saveKeys = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, string> = {};
      if (anthropicKey.trim()) body.anthropicKey = anthropicKey.trim();
      if (replicateToken.trim()) body.replicateToken = replicateToken.trim();

      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setStatus({
          hasAnthropicKey: status?.hasAnthropicKey || !!anthropicKey.trim(),
          hasReplicateToken: status?.hasReplicateToken || !!replicateToken.trim(),
        });
        setAnthropicKey("");
        setReplicateToken("");
      } else {
        setMessage(data.error || "Failed to save");
      }
    } catch {
      setMessage("Failed to save API keys");
    } finally {
      setSaving(false);
    }
  };

  const bothConfigured = status?.hasAnthropicKey && status?.hasReplicateToken;

  return (
    <>
      {/* Inline banner if keys are missing */}
      {status && !bothConfigured && (
        <div className="bg-surface border border-amber-800/50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <span className="text-sm text-amber-300">
                Running in demo mode.
              </span>
              <span className="text-sm text-muted ml-2">
                {!status.hasAnthropicKey && "Script analysis uses local fallback. "}
                {!status.hasReplicateToken && "Images use placeholders. "}
                Add API keys for full AI features.
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-1.5 bg-accent hover:bg-accent-hover rounded-md text-white text-xs font-medium transition-colors shrink-0"
          >
            Configure API Keys
          </button>
        </div>
      )}

      {/* Settings button in header area (always available) */}
      {status && bothConfigured && (
        <button
          onClick={() => setShowModal(true)}
          className="text-xs text-muted hover:text-foreground transition-colors"
          title="API Key Settings"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-xl p-6 max-w-lg w-full mx-4 space-y-5"
            >
              <h3 className="text-lg font-semibold text-white">
                API Key Configuration
              </h3>
              <p className="text-sm text-muted">
                Add your API keys to enable AI-powered features. Without keys,
                the app runs in demo mode with local fallbacks.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-foreground flex items-center gap-2">
                    Anthropic API Key
                    {status?.hasAnthropicKey && (
                      <span className="text-xs text-green-400">
                        Configured
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    placeholder={
                      status?.hasAnthropicKey
                        ? "Leave blank to keep current key"
                        : "sk-ant-..."
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                  <p className="text-xs text-muted">
                    Used for script analysis (scene splitting & prompt generation)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-foreground flex items-center gap-2">
                    Replicate API Token
                    {status?.hasReplicateToken && (
                      <span className="text-xs text-green-400">
                        Configured
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={replicateToken}
                    onChange={(e) => setReplicateToken(e.target.value)}
                    placeholder={
                      status?.hasReplicateToken
                        ? "Leave blank to keep current token"
                        : "r8_..."
                    }
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent"
                  />
                  <p className="text-xs text-muted">
                    Used for AI image generation (Flux Schnell model)
                  </p>
                </div>
              </div>

              {message && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    message.includes("saved")
                      ? "bg-green-900/20 border border-green-800 text-green-400"
                      : "bg-red-900/20 border border-red-800 text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveKeys}
                  disabled={
                    saving ||
                    (!anthropicKey.trim() && !replicateToken.trim())
                  }
                  className="px-4 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 rounded-lg text-sm text-white font-medium transition-colors"
                >
                  {saving ? "Saving..." : "Save Keys"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
