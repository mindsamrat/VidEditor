"use client";

import { useProjectStore } from "@/store/useProjectStore";

export default function Header() {
  const status = useProjectStore((s) => s.status);
  const scenesCount = useProjectStore((s) => s.scenes.length);
  const approvedCount = useProjectStore(
    (s) => s.scenes.filter((sc) => sc.status === "approved").length
  );

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">
            Script-to-Video Studio
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted">
          {scenesCount > 0 && (
            <span>
              {approvedCount}/{scenesCount} scenes approved
            </span>
          )}
          <span className="px-2 py-1 rounded bg-surface text-xs font-mono uppercase tracking-wider">
            {status}
          </span>
        </div>
      </div>
    </header>
  );
}
