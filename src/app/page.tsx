"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import ScriptInput from "@/components/ScriptInput";
import SceneList from "@/components/SceneList";
import AudioSection from "@/components/AudioSection";
import VideoSettings from "@/components/VideoSettings";
import TimelinePreview from "@/components/TimelinePreview";
import ExportSection from "@/components/ExportSection";
import MobileWarning from "@/components/MobileWarning";
import { useProjectStore } from "@/store/useProjectStore";
import { saveProject, loadProject } from "@/lib/localStorage";

export default function Home() {
  const setScript = useProjectStore((s) => s.setScript);
  const setContentType = useProjectStore((s) => s.setContentType);
  const setSuggestedStyle = useProjectStore((s) => s.setSuggestedStyle);
  const setScenes = useProjectStore((s) => s.setScenes);
  const updateSettings = useProjectStore((s) => s.updateSettings);

  // Load saved project on mount
  useEffect(() => {
    const saved = loadProject();
    if (saved) {
      setScript(saved.script);
      setContentType(saved.contentType);
      setSuggestedStyle(saved.suggestedStyle || "");
      if (saved.scenes?.length > 0) {
        setScenes(
          saved.scenes.map((s) => ({
            ...s,
            imageBlob: null,
            status: s.status as "pending" | "generating" | "generated" | "approved",
          }))
        );
      }
      if (saved.settings) {
        updateSettings(saved.settings as Parameters<typeof updateSettings>[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on changes
  useEffect(() => {
    const unsubscribe = useProjectStore.subscribe((s) => {
      saveProject({
        script: s.script,
        contentType: s.contentType,
        scenes: s.scenes.map((sc) => ({
          id: sc.id,
          label: sc.label,
          scriptText: sc.scriptText,
          imagePrompt: sc.imagePrompt,
          imageUrl: sc.imageUrl,
          status: sc.status,
          order: sc.order,
          durationOverride: sc.durationOverride,
        })),
        settings: s.settings,
        suggestedStyle: s.suggestedStyle,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <MobileWarning />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-8 space-y-12">
          <ScriptInput />
          <SceneList />
          <AudioSection />
          <VideoSettings />
          <TimelinePreview />
          <ExportSection />

          <footer className="text-center text-xs text-muted pb-8">
            Script-to-Video Studio — AI-powered video generation
          </footer>
        </main>
      </div>
    </>
  );
}
