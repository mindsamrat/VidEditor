"use client";
import { useCallback, useEffect, useState } from "react";
import type { Channel } from "@/lib/youtube";
import { useSettings } from "@/lib/store";

export async function loadChannel(ref: string, youtubeKey: string, max = 50): Promise<Channel> {
  const res = await fetch(`/api/youtube/channel?ref=${encodeURIComponent(ref)}&max=${max}`, {
    headers: youtubeKey ? { "x-youtube-key": youtubeKey } : {},
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || "Could not load the channel");
  return body;
}

/** Our own channel, as configured in Settings. */
export function useChannel(max = 50) {
  const [settings, , ready] = useSettings();
  const [data, setData] = useState<Channel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async () => {
    if (!settings.channel) return;
    setLoading(true); setError(null);
    try { setData(await loadChannel(settings.channel, settings.youtubeKey, max)); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }, [settings.channel, settings.youtubeKey, max]);
  useEffect(() => { if (ready) refresh(); }, [ready, refresh]);
  return { data, error, loading, refresh, configured: ready && !!settings.channel, ready };
}
