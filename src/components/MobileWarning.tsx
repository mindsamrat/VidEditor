"use client";

import { useState } from "react";

export default function MobileWarning() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] bg-surface border-b border-border p-4">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <p className="text-sm text-muted">
          Best experienced on desktop (1024px+).
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-accent hover:text-accent-hover ml-4 shrink-0"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
