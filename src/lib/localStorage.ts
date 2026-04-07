const STORAGE_KEY = "script-to-video-studio-project";

interface StorableProject {
  script: string;
  contentType: string;
  scenes: Array<{
    id: string;
    label: string;
    scriptText: string;
    imagePrompt: string;
    imageUrl: string | null;
    status: string;
    order: number;
    durationOverride: number | null;
  }>;
  settings: {
    backgroundColor: string;
    sceneDuration: "auto" | number;
    transition: string;
    aspectRatio: string;
    quality: string;
  };
  suggestedStyle: string;
}

export function saveProject(state: StorableProject) {
  try {
    // Don't store blobs or audio files in localStorage
    const serializable = {
      script: state.script,
      contentType: state.contentType,
      scenes: state.scenes.map((s) => ({
        id: s.id,
        label: s.label,
        scriptText: s.scriptText,
        imagePrompt: s.imagePrompt,
        imageUrl: s.imageUrl,
        status: s.status === "generating" ? "pending" : s.status,
        order: s.order,
        durationOverride: s.durationOverride,
      })),
      settings: state.settings,
      suggestedStyle: state.suggestedStyle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadProject(): StorableProject | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearProject() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
