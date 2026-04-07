import { create } from "zustand";

export interface Scene {
  id: string;
  label: string;
  scriptText: string;
  imagePrompt: string;
  imageUrl: string | null;
  imageBlob: Blob | null;
  status: "pending" | "generating" | "generated" | "approved";
  order: number;
  durationOverride: number | null;
}

export interface AudioTrack {
  file: File;
  url: string;
  trimStart: number;
  trimEnd: number;
  type: "background" | "voiceover";
  volume: number;
  duration: number;
}

export interface VideoSettings {
  backgroundColor: string;
  sceneDuration: "auto" | number;
  transition: "none" | "fade" | "crossdissolve";
  aspectRatio: "9:16" | "16:9" | "1:1";
  quality: "720p" | "1080p";
}

export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "generating"
  | "ready"
  | "exporting";

interface ProjectState {
  script: string;
  contentType: string;
  scenes: Scene[];
  audio: AudioTrack | null;
  settings: VideoSettings;
  status: ProjectStatus;
  suggestedStyle: string;
  exportProgress: number;

  setScript: (script: string) => void;
  setContentType: (type: string) => void;
  setStatus: (status: ProjectStatus) => void;
  setScenes: (scenes: Scene[]) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  reorderScenes: (scenes: Scene[]) => void;
  setAudio: (audio: AudioTrack | null) => void;
  updateAudio: (updates: Partial<AudioTrack>) => void;
  updateSettings: (updates: Partial<VideoSettings>) => void;
  setSuggestedStyle: (style: string) => void;
  setExportProgress: (progress: number) => void;
  resetProject: () => void;
}

const defaultSettings: VideoSettings = {
  backgroundColor: "#000000",
  sceneDuration: "auto",
  transition: "fade",
  aspectRatio: "16:9",
  quality: "1080p",
};

const initialState = {
  script: "",
  contentType: "custom",
  scenes: [] as Scene[],
  audio: null as AudioTrack | null,
  settings: defaultSettings,
  status: "draft" as ProjectStatus,
  suggestedStyle: "",
  exportProgress: 0,
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

  setScript: (script) => set({ script }),
  setContentType: (contentType) => set({ contentType }),
  setStatus: (status) => set({ status }),
  setSuggestedStyle: (style) => set({ suggestedStyle: style }),
  setExportProgress: (progress) => set({ exportProgress: progress }),

  setScenes: (scenes) => set({ scenes }),

  updateScene: (id, updates) =>
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  removeScene: (id) =>
    set((state) => ({
      scenes: state.scenes
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i })),
    })),

  reorderScenes: (scenes) => set({ scenes }),

  setAudio: (audio) => set({ audio }),

  updateAudio: (updates) =>
    set((state) => ({
      audio: state.audio ? { ...state.audio, ...updates } : null,
    })),

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  resetProject: () => set(initialState),
}));
