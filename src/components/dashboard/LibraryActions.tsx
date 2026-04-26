"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LibraryActions({
  id,
  videoUrl,
  title,
}: {
  id: string;
  videoUrl: string | null;
  title: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (!confirm("Delete this video? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await fetch(`/api/videos?id=${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      {videoUrl && (
        <a
          href={videoUrl}
          download={`${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.mp4`}
          className="text-[11px] text-brand hover:underline"
        >
          ⬇ Download
        </a>
      )}
      <button
        onClick={onDelete}
        disabled={deleting}
        className="text-[11px] text-ink-mute hover:text-red-400 disabled:opacity-50 ml-auto"
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
