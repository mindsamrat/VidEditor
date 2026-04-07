"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Scene, useProjectStore } from "@/store/useProjectStore";
import { imageQueue } from "@/lib/imageQueue";

interface SceneCardProps {
  scene: Scene;
  index: number;
}

export default function SceneCard({ scene, index }: SceneCardProps) {
  const updateScene = useProjectStore((s) => s.updateScene);
  const removeScene = useProjectStore((s) => s.removeScene);
  const aspectRatio = useProjectStore((s) => s.settings.aspectRatio);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(scene.imagePrompt);
  const [regeneratingPrompt, setRegeneratingPrompt] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const generateImage = async (prompt?: string) => {
    const imagePrompt = prompt || scene.imagePrompt;
    updateScene(scene.id, { status: "generating" });

    try {
      const result = await imageQueue.add(async () => {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt, aspectRatio }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to generate image");
        }
        return res.json();
      });

      // Download image as blob for FFmpeg
      let blob: Blob | null = null;
      try {
        if (result.imageUrl.startsWith("data:")) {
          const resp = await fetch(result.imageUrl);
          blob = await resp.blob();
        } else {
          const resp = await fetch(result.imageUrl);
          blob = await resp.blob();
        }
      } catch {
        // blob storage failed, still show URL
      }

      updateScene(scene.id, {
        imageUrl: result.imageUrl,
        imageBlob: blob,
        status: "generated",
      });
    } catch {
      updateScene(scene.id, { status: "pending" });
    }
  };

  const regeneratePrompt = async () => {
    setRegeneratingPrompt(true);
    try {
      const res = await fetch("/api/analyze-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: scene.scriptText,
          contentType: "custom",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.scenes?.[0]?.imagePrompt) {
          const newPrompt = data.scenes[0].imagePrompt;
          updateScene(scene.id, { imagePrompt: newPrompt });
          setEditedPrompt(newPrompt);
        }
      }
    } finally {
      setRegeneratingPrompt(false);
    }
  };

  const savePromptEdit = () => {
    updateScene(scene.id, { imagePrompt: editedPrompt });
    setIsEditingPrompt(false);
  };

  const borderColor =
    scene.status === "approved"
      ? "border-green-500"
      : scene.status === "generating"
        ? "border-accent"
        : "border-border";

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-surface rounded-lg border-2 ${borderColor} overflow-hidden transition-colors`}
    >
      {/* Header with drag handle */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="4" cy="3" r="1.5" />
            <circle cx="12" cy="3" r="1.5" />
            <circle cx="4" cy="8" r="1.5" />
            <circle cx="12" cy="8" r="1.5" />
            <circle cx="4" cy="13" r="1.5" />
            <circle cx="12" cy="13" r="1.5" />
          </svg>
        </button>
        <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-bold rounded">
          Scene {index + 1}
        </span>
        <span className="text-sm font-medium text-white truncate flex-1">
          {scene.label}
        </span>
        {scene.status === "approved" && (
          <span className="text-green-400 text-sm">Approved</span>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Script text */}
        <div>
          <label className="text-xs text-muted uppercase tracking-wider mb-1 block">
            Script
          </label>
          <p className="font-mono text-sm text-foreground/80 leading-relaxed">
            {scene.scriptText}
          </p>
        </div>

        {/* Image prompt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted uppercase tracking-wider">
              Image Prompt
            </label>
            <div className="flex gap-2">
              <button
                onClick={regeneratePrompt}
                disabled={regeneratingPrompt}
                className="text-xs text-accent hover:text-accent-hover disabled:opacity-50"
              >
                {regeneratingPrompt ? "Regenerating..." : "Regenerate Prompt"}
              </button>
              {!isEditingPrompt && (
                <button
                  onClick={() => setIsEditingPrompt(true)}
                  className="text-xs text-accent hover:text-accent-hover"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          {isEditingPrompt ? (
            <div className="space-y-2">
              <textarea
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="w-full h-24 bg-background border border-border rounded p-2 text-sm font-mono text-foreground resize-y focus:outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <button
                  onClick={savePromptEdit}
                  className="px-3 py-1 bg-accent text-white text-xs rounded hover:bg-accent-hover"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedPrompt(scene.imagePrompt);
                    setIsEditingPrompt(false);
                  }}
                  className="px-3 py-1 bg-background text-muted text-xs rounded hover:text-foreground border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    savePromptEdit();
                    generateImage(editedPrompt);
                  }}
                  className="px-3 py-1 bg-accent text-white text-xs rounded hover:bg-accent-hover"
                >
                  Save & Generate
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground/60 italic">{scene.imagePrompt}</p>
          )}
        </div>

        {/* Image display / placeholder */}
        <div className="relative">
          {scene.status === "generating" ? (
            <div className="w-full aspect-video rounded-lg skeleton-shimmer flex items-center justify-center">
              <span className="text-muted text-sm">Generating image...</span>
            </div>
          ) : scene.imageUrl ? (
            <img
              src={scene.imageUrl}
              alt={scene.label}
              className="w-full rounded-lg object-cover"
            />
          ) : (
            <div className="w-full aspect-video rounded-lg bg-background border border-dashed border-border flex items-center justify-center">
              <span className="text-muted text-sm">
                No image generated yet
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {scene.status !== "generating" && (
            <button
              onClick={() => generateImage()}
              className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs rounded-md transition-colors"
            >
              {scene.imageUrl ? "Regenerate" : "Generate"}
            </button>
          )}
          {scene.imageUrl && scene.status !== "approved" && (
            <button
              onClick={() => updateScene(scene.id, { status: "approved" })}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors"
            >
              Approve
            </button>
          )}
          {scene.status === "approved" && (
            <button
              onClick={() => updateScene(scene.id, { status: "generated" })}
              className="px-3 py-1.5 bg-surface border border-border hover:border-muted text-muted text-xs rounded-md transition-colors"
            >
              Unapprove
            </button>
          )}
          <button
            onClick={() => removeScene(scene.id)}
            className="px-3 py-1.5 bg-surface border border-border hover:border-red-500 text-red-400 text-xs rounded-md transition-colors ml-auto"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}
