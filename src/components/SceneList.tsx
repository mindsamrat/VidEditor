"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/store/useProjectStore";
import { imageQueue } from "@/lib/imageQueue";
import SceneCard from "./SceneCard";

export default function SceneList() {
  const scenes = useProjectStore((s) => s.scenes);
  const reorderScenes = useProjectStore((s) => s.reorderScenes);
  const updateScene = useProjectStore((s) => s.updateScene);
  const aspectRatio = useProjectStore((s) => s.settings.aspectRatio);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (scenes.length === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = scenes.findIndex((s) => s.id === active.id);
    const newIndex = scenes.findIndex((s) => s.id === over.id);
    const newScenes = arrayMove(scenes, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order: i,
    }));
    reorderScenes(newScenes);
  };

  const generateAllImages = async () => {
    setShowConfirmModal(false);
    setGeneratingAll(true);

    const pendingScenes = scenes.filter(
      (s) => s.status === "pending" || s.status === "generated"
    );

    const promises = pendingScenes.map((scene) =>
      imageQueue.add(async () => {
        updateScene(scene.id, { status: "generating" });
        try {
          const res = await fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: scene.imagePrompt,
              aspectRatio,
            }),
          });
          if (!res.ok) throw new Error("Failed");
          const data = await res.json();

          let blob: Blob | null = null;
          try {
            const resp = await fetch(data.imageUrl);
            blob = await resp.blob();
          } catch {
            // continue without blob
          }

          updateScene(scene.id, {
            imageUrl: data.imageUrl,
            imageBlob: blob,
            status: "generated",
          });
        } catch {
          updateScene(scene.id, { status: "pending" });
        }
      })
    );

    await Promise.allSettled(promises);
    setGeneratingAll(false);
  };

  const pendingCount = scenes.filter(
    (s) => s.status === "pending" || s.status === "generated"
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white text-sm font-bold">
          2
        </span>
        <h2 className="text-xl font-semibold text-white">
          Scenes & Image Generation
        </h2>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowConfirmModal(true)}
          disabled={generatingAll || pendingCount === 0}
          className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
        >
          {generatingAll ? (
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
              Generating...
            </span>
          ) : (
            "Generate All Images"
          )}
        </motion.button>
        <span className="text-sm text-muted">
          {scenes.length} scenes total
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={scenes.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {scenes.map((scene, index) => (
              <SceneCard key={scene.id} scene={scene} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-xl p-6 max-w-md w-full mx-4 space-y-4"
            >
              <h3 className="text-lg font-semibold text-white">
                Generate All Images
              </h3>
              <p className="text-sm text-muted">
                This will generate {pendingCount} images using {pendingCount}{" "}
                API credits. Continue?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAllImages}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-sm text-white font-medium transition-colors"
                >
                  Generate {pendingCount} Images
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
