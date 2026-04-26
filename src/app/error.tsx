"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[reelforge] page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="max-w-lg w-full">
        <p className="text-xs uppercase tracking-widest text-red-400">Something went wrong</p>
        <h1 className="font-display text-3xl font-bold mt-2">A page-level error occurred.</h1>
        <p className="mt-3 text-sm text-ink-dim">
          Open the browser console to see the full stack trace. The most common
          causes: a required env var is missing on this deployment, or you
          deployed before adding env vars and the build cache is stale.
        </p>
        <pre className="mt-5 card p-4 text-xs text-red-400 whitespace-pre-wrap break-all">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => reset()} className="btn-brand text-sm">
            Try again
          </button>
          <a href="/api/debug/env" className="btn-ghost text-sm" target="_blank" rel="noreferrer">
            Check env vars
          </a>
          <a href="/" className="btn-ghost text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}
