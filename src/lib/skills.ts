// The AI desk's modes. Each one runs the matching vendored SKILL.md as its system prompt.
export const DESK_MODES = [
  { id: "yt-script", label: "Script", blurb: "One idea into a script: five hooks, the turn, beats with on-screen notes." },
  { id: "yt-package", label: "Package", blurb: "Ten titles, the best three, and the thumbnail brief for the winner." },
  { id: "yt-seo", label: "SEO", blurb: "Description, the tags worth having, and the three queries it should win." },
  { id: "yt-shorts", label: "Shorts", blurb: "Paste a transcript - get the self-contained Shorts hiding in it." },
  { id: "yt-comment", label: "Comments", blurb: "Paste comments - triage into four piles, replies in our voice, what to pin." },
  { id: "yt-plan", label: "Plan", blurb: "A week that fits the hours we actually have." },
  { id: "yt-audit", label: "Audit", blurb: "The whole channel, ending in ONE fix." },
  { id: "yt-retention", label: "Retention", blurb: "Talk through a retention report and decide the one change." },
] as const;

export type DeskMode = (typeof DESK_MODES)[number]["id"];
export const isDeskMode = (s: string): s is DeskMode => DESK_MODES.some((m) => m.id === s);
