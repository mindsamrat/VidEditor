export const compact = (n: number | null | undefined) =>
  n == null ? "hidden" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
export const full = (n: number) => new Intl.NumberFormat("en").format(n);
export const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
export const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" });
export function duration(sec: number) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}
