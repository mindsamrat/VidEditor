"use client";
// Two single-series charts, hand-rolled in SVG: views per upload against the channel
// median, and a retention curve with its cliffs marked. Both carry hover tooltips;
// grid and axes stay recessive; text uses ink tokens, never the series colour.
import { useEffect, useRef, useState } from "react";

const SERIES = "#FF5A4E";
const INK_MUTE = "#6B7681";
const GRID = "rgba(255,255,255,0.06)";
const REF = "#A6B0BA";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.floor(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((x) => x >= v) ?? 10 * p;
}

function Tip({ x, y, w, children }: { x: number; y: number; w: number; children: React.ReactNode }) {
  const left = Math.min(Math.max(x, 90), w - 90);
  return (
    <div className="pointer-events-none absolute z-10 w-max max-w-[220px] -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-bg-elev2 px-2.5 py-1.5 text-xs shadow-card"
      style={{ left, top: y - 8 }}>{children}</div>
  );
}

export type Bar = { key: string; label: string; value: number; sub?: string; href?: string };

export function BarChart({ bars, reference, refLabel = "median", fmt, height = 220 }: {
  bars: Bar[]; reference?: number; refLabel?: string; fmt: (n: number) => string; height?: number;
}) {
  const [wrap, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 44, r: 8, t: 12, b: 8 };
  const max = niceMax(Math.max(...bars.map((b) => b.value), reference || 0));
  const ih = height - pad.t - pad.b, iw = w - pad.l - pad.r;
  const slot = iw / Math.max(1, bars.length);
  const bw = Math.max(2, Math.min(28, slot - 2)); // 2px surface gap between adjacent bars
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const ticks = [0, 0.5, 1].map((f) => f * max);
  const h = hover != null ? bars[hover] : null;
  return (
    <div ref={wrap} className="relative w-full min-w-0">
      <svg width={w} height={height} role="img" aria-label="Views per upload, oldest to newest">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} />
            <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill={INK_MUTE}>{fmt(t)}</text>
          </g>
        ))}
        {bars.map((b, i) => {
          const x = pad.l + i * slot + (slot - bw) / 2;
          const top = y(b.value), bh = Math.max(1, pad.t + ih - top);
          const r = Math.min(4, bw / 2, bh);
          // rounded data-end, square at the baseline
          const d = `M${x},${pad.t + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${pad.t + ih} Z`;
          return <path key={b.key} d={d} fill={SERIES} opacity={hover == null || hover === i ? 1 : 0.45} />;
        })}
        {reference != null && reference > 0 && (
          <g>
            <line x1={pad.l} x2={w - pad.r} y1={y(reference)} y2={y(reference)} stroke={REF} strokeDasharray="4 4" strokeWidth={1.5} />
          </g>
        )}
        {bars.map((b, i) => (
          <rect key={b.key} x={pad.l + i * slot} y={pad.t} width={slot} height={ih} fill="transparent"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onClick={() => b.href && window.open(b.href, "_blank", "noopener")} style={{ cursor: b.href ? "pointer" : "default" }} />
        ))}
      </svg>
      {reference != null && reference > 0 && (
        <div className="mt-1 flex items-center gap-2 text-xs text-ink-dim">
          <svg width="18" height="2" aria-hidden><line x1="0" x2="18" y1="1" y2="1" stroke={REF} strokeDasharray="4 3" strokeWidth={1.5} /></svg>
          {refLabel} {fmt(reference)}
        </div>
      )}
      {h && hover != null && (
        <Tip x={pad.l + hover * slot + slot / 2} y={y(h.value)} w={w}>
          <div className="font-medium text-ink">{fmt(h.value)} views</div>
          <div className="truncate text-ink-dim">{h.label}</div>
          {h.sub && <div className="text-ink-mute">{h.sub}</div>}
        </Tip>
      )}
    </div>
  );
}

export function RetentionChart({ series, cliffs, xLabel, height = 240 }: {
  series: [number, number][]; cliffs: { from: number; lost: number }[]; xLabel: (x: number) => string; height?: number;
}) {
  const [wrap, w] = useWidth<HTMLDivElement>();
  const [hx, setHx] = useState<number | null>(null);
  const pad = { l: 40, r: 12, t: 12, b: 24 };
  const xs = series.map((p) => p[0]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const ymax = niceMax(Math.max(100, ...series.map((p) => p[1])));
  const iw = w - pad.l - pad.r, ih = height - pad.t - pad.b;
  const X = (x: number) => pad.l + ((x - x0) / (x1 - x0 || 1)) * iw;
  const Y = (v: number) => pad.t + ih - (v / ymax) * ih;
  const d = series.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ");
  const near = hx == null ? null : series.reduce((b, p) => (Math.abs(p[0] - hx) < Math.abs(b[0] - hx) ? p : b), series[0]);
  return (
    <div ref={wrap} className="relative w-full min-w-0">
      <svg width={w} height={height} role="img" aria-label="Audience retention curve"
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = e.clientX - r.left;
          setHx(px < pad.l || px > w - pad.r ? null : x0 + ((px - pad.l) / iw) * (x1 - x0));
        }} onMouseLeave={() => setHx(null)}>
        {[0, 25, 50, 75, 100].filter((t) => t <= ymax).map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} stroke={GRID} />
            <text x={pad.l - 8} y={Y(t)} dy="0.32em" textAnchor="end" fontSize={10} fill={INK_MUTE}>{t}%</text>
          </g>
        ))}
        {[x0, (x0 + x1) / 2, x1].map((t, i) => (
          <text key={i} x={X(t)} y={height - 6} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} fontSize={10} fill={INK_MUTE}>{xLabel(t)}</text>
        ))}
        <path d={`${d} L${X(x1)},${Y(0)} L${X(x0)},${Y(0)} Z`} fill={SERIES} opacity={0.08} />
        <path d={d} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" />
        {(() => {
          // Ring every cliff; label only those with room, biggest first, so clustered drops don't collide.
          const placed: number[] = [];
          const labelled = new Set(
            [...cliffs].sort((a, b) => b.lost - a.lost).filter((c) => {
              const x = X(c.from);
              if (placed.some((p) => Math.abs(p - x) < 36)) return false;
              placed.push(x);
              return true;
            }),
          );
          return cliffs.map((c, i) => {
            const p = series.find((s) => s[0] === c.from);
            if (!p) return null;
            return (
              <g key={i}>
                <circle cx={X(p[0])} cy={Y(p[1])} r={5} fill="#07090C" stroke={REF} strokeWidth={2} />
                {labelled.has(c) && <text x={X(p[0])} y={Y(p[1]) - 10} textAnchor="middle" fontSize={10} fill={REF}>−{c.lost}%</text>}
              </g>
            );
          });
        })()}
        {near && (
          <g>
            <line x1={X(near[0])} x2={X(near[0])} y1={pad.t} y2={pad.t + ih} stroke={REF} strokeOpacity={0.4} />
            <circle cx={X(near[0])} cy={Y(near[1])} r={4} fill={SERIES} stroke="#0E1218" strokeWidth={2} />
          </g>
        )}
      </svg>
      {near && (
        <Tip x={X(near[0])} y={Y(near[1])} w={w}>
          <span className="font-medium text-ink">{near[1].toFixed(1)}%</span> <span className="text-ink-dim">still watching at {xLabel(near[0])}</span>
        </Tip>
      )}
    </div>
  );
}
