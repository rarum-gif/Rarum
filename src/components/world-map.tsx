"use client";
import * as React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { MAP_H, MAP_W, worldProjection } from "@/lib/game/geo";
import { cn } from "@/lib/utils";

interface MapData { land: string; borders: string }
let cache: Promise<MapData> | null = null;
function loadMap() {
  if (!cache) cache = fetch("/maps/world.json").then((r) => r.json());
  return cache;
}

export interface LatLon { lat: number; lon: number }

/**
 * Interaktive Weltkarte (Natural-Earth-Daten, gemeinfrei).
 * Klick/Tippen setzt den Pin, Mausrad oder Buttons zoomen, Ziehen verschiebt.
 */
export function WorldMap({ guess, truth, onGuess, className, disabled }: { guess: LatLon | null; truth?: LatLon | null; onGuess?: (p: LatLon) => void; className?: string; disabled?: boolean }) {
  const [data, setData] = React.useState<MapData | null>(null);
  const projection = React.useMemo(() => worldProjection(), []);
  const [view, setView] = React.useState({ x: 0, y: 0, w: MAP_W, h: MAP_H });
  const svgRef = React.useRef<SVGSVGElement>(null);
  const drag = React.useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean; id: number } | null>(null);
  const pinch = React.useRef<Map<number, { x: number; y: number }>>(new Map());

  React.useEffect(() => {
    let alive = true;
    loadMap().then((d) => alive && setData(d)).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Ergebnis: auf beide Punkte zoomen
  React.useEffect(() => {
    if (!truth) return;
    const pts = [truth, guess].filter(Boolean).map((p) => projection([p!.lon, p!.lat])!);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const pad = 70;
    let w = Math.max(220, Math.max(...xs) - Math.min(...xs) + pad * 2);
    let h = w * (MAP_H / MAP_W);
    const hh = Math.max(...ys) - Math.min(...ys) + pad * 2;
    if (hh > h) { h = hh; w = h * (MAP_W / MAP_H); }
    w = Math.min(w, MAP_W); h = Math.min(h, MAP_H);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    setView(clamp({ x: cx - w / 2, y: cy - h / 2, w, h }));
  }, [truth, guess, projection]);

  const toMap = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    // preserveAspectRatio meet: Seitenverhältnis berücksichtigen
    const scale = Math.min(r.width / view.w, r.height / view.h);
    const ox = (r.width - view.w * scale) / 2, oy = (r.height - view.h * scale) / 2;
    return [view.x + (clientX - r.left - ox) / scale, view.y + (clientY - r.top - oy) / scale] as [number, number];
  };

  const zoom = (f: number, around?: [number, number]) => {
    setView((v) => {
      const w = Math.max(80, Math.min(MAP_W, v.w * f));
      const h = w * (MAP_H / MAP_W);
      const [ax, ay] = around ?? [v.x + v.w / 2, v.y + v.h / 2];
      return clamp({ x: ax - ((ax - v.x) / v.w) * w, y: ay - ((ay - v.y) / v.h) * h, w, h });
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoom(e.deltaY > 0 ? 1.18 : 1 / 1.18, toMap(e.clientX, e.clientY));
  };
  React.useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const stop = (e: WheelEvent) => e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false, id: e.pointerId };
  };
  const onMove = (e: React.PointerEvent) => {
    const prev = pinch.current.get(e.pointerId);
    if (prev && pinch.current.size === 2) {
      const others = [...pinch.current.entries()].find(([id]) => id !== e.pointerId)![1];
      const d0 = Math.hypot(prev.x - others.x, prev.y - others.y);
      const d1 = Math.hypot(e.clientX - others.x, e.clientY - others.y);
      pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (d0 > 0) zoom(d0 / d1, toMap((e.clientX + others.x) / 2, (e.clientY + others.y) / 2));
      if (drag.current) drag.current.moved = true;
      return;
    }
    if (prev) pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true;
    if (!d.moved) return;
    const r = svgRef.current!.getBoundingClientRect();
    const scale = Math.min(r.width / view.w, r.height / view.h);
    setView((v) => clamp({ ...v, x: d.vx - dx / scale, y: d.vy - dy / scale }));
  };
  const onUp = (e: React.PointerEvent) => {
    pinch.current.delete(e.pointerId);
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || disabled || !onGuess) return;
    const [mx, my] = toMap(e.clientX, e.clientY);
    const inv = projection.invert?.([mx, my]);
    if (!inv || !Number.isFinite(inv[0]) || Math.abs(inv[1]) > 90 || Math.abs(inv[0]) > 180) return;
    onGuess({ lat: Math.round(inv[1] * 100) / 100, lon: Math.round(inv[0] * 100) / 100 });
  };

  const k = view.w / MAP_W; // Marker-Grösse unabhängig vom Zoom
  const gp = guess ? projection([guess.lon, guess.lat]) : null;
  const tp = truth ? projection([truth.lon, truth.lat]) : null;

  return (
    <div className={cn("relative overflow-hidden rounded-[22px] border border-white/15 bg-[#0e2a44]", className)}>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className={cn("block h-full w-full touch-none select-none", !disabled && "cursor-crosshair")}
        onWheel={onWheel}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => { drag.current = null; pinch.current.clear(); }}
        role="application"
        aria-label="Weltkarte – tippe auf den gesuchten Ort"
      >
        <defs>
          <radialGradient id="ocean-g" cx="50%" cy="45%" r="70%"><stop offset="0" stopColor="#1d4e7a" /><stop offset="1" stopColor="#0b2038" /></radialGradient>
        </defs>
        <rect x={-50} y={-50} width={MAP_W + 100} height={MAP_H + 100} fill="url(#ocean-g)" />
        {data ? (
          <>
            <path d={data.land} fill="#e9d6a8" stroke="#b89c66" strokeWidth={0.5 * k} />
            <path d={data.borders} fill="none" stroke="#a88a55" strokeWidth={0.45 * k} strokeOpacity={0.7} />
          </>
        ) : (
          <text x={MAP_W / 2} y={MAP_H / 2} textAnchor="middle" fill="#ffffff" opacity={0.6} fontSize={16}>Karte lädt …</text>
        )}
        {gp && tp && <line x1={gp[0]} y1={gp[1]} x2={tp[0]} y2={tp[1]} stroke="#ffffff" strokeWidth={2 * k} strokeDasharray={`${6 * k} ${5 * k}`} className="draw-line" />}
        {tp && (
          <g transform={`translate(${tp[0]} ${tp[1]}) scale(${k})`}>
            <circle r={14} fill="#50ffa0" opacity={0.25} className="ping" />
            <circle r={6} fill="#50ffa0" stroke="#0b2038" strokeWidth={2} />
          </g>
        )}
        {gp && (
          <g transform={`translate(${gp[0]} ${gp[1]}) scale(${k})`}>
            <path d="M0 0 C -9 -12 -9 -22 0 -24 C 9 -22 9 -12 0 0 Z" fill="#ff2e88" stroke="#ffffff" strokeWidth={2} />
            <circle cy={-16} r={3.5} fill="#ffffff" />
          </g>
        )}
      </svg>
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button type="button" onClick={() => zoom(1 / 1.5)} className="icon-btn bg-black/50" aria-label="Hineinzoomen"><Plus className="size-4" /></button>
        <button type="button" onClick={() => zoom(1.5)} className="icon-btn bg-black/50" aria-label="Herauszoomen"><Minus className="size-4" /></button>
        <button type="button" onClick={() => setView({ x: 0, y: 0, w: MAP_W, h: MAP_H })} className="icon-btn bg-black/50" aria-label="Ganze Welt"><RotateCcw className="size-4" /></button>
      </div>
    </div>
  );
}

function clamp(v: { x: number; y: number; w: number; h: number }) {
  return { ...v, x: Math.max(-40, Math.min(MAP_W - v.w + 40, v.x)), y: Math.max(-40, Math.min(MAP_H - v.h + 40, v.y)) };
}
