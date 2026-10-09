"use client";
// Per-browser persistence for settings and drafts. Wrapped in try/catch because
// storage can be blocked (private windows, strict site-data settings).
import { useCallback, useEffect, useState } from "react";

const PREFIX = "cc:";

export function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch { return fallback; }
}

export function writeLocal<T>(key: string, value: T) {
  try { window.localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent("cc:store", { detail: key }));
}

/** useState that persists to localStorage and stays in sync across components. */
export function useLocal<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setValue(readLocal(key, fallback));
    setReady(true);
    const onChange = (e: Event) => { if ((e as CustomEvent).detail === key) setValue(readLocal(key, fallback)); };
    window.addEventListener("cc:store", onChange);
    return () => window.removeEventListener("cc:store", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeLocal(key, v);
      return v;
    });
  }, [key]);
  return [value, set, ready] as const;
}

export type Settings = { channel: string; youtubeKey: string };
export const DEFAULT_SETTINGS: Settings = { channel: process.env.NEXT_PUBLIC_DEFAULT_CHANNEL || "", youtubeKey: "" };
export const useSettings = () => useLocal<Settings>("settings", DEFAULT_SETTINGS);
export const useVoice = () => useLocal<string>("voice", "");
