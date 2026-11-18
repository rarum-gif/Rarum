"use client";
import * as React from "react";
import { catalogItem, type CatalogItem, type EnvId } from "@/lib/game/catalog";
import { footprint, isGround, type Estate } from "@/lib/game/estate";
import { Art, BoatArt, iso, TH, TW } from "./iso";
import { ENV_STYLE } from "./item-art";
import { cn } from "@/lib/utils";

interface Props {
  estate: Estate;
  size: number;
  boats?: CatalogItem[];
  env?: EnvId;
  className?: string;
  /** Bearbeiten */
  editing?: boolean;
  selected?: string | null;
  ghost?: { id: string; x: number; y: number; ok: boolean } | null;
  onTile?: (x: number, y: number) => void;
  onHover?: (x: number, y: number) => void;
  onItem?: (uid: string) => void;
  compact?: boolean;
}

const pts = (list: [number, number][]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const diamond = (x: number, y: number, w = 1, d = 1, z = 0) => pts([iso(x, y, z), iso(x + w, y, z), iso(x + w, y + d, z), iso(x, y + d, z)]);

export function EstateView({ estate, size, boats = [], env, className, editing, selected, ghost, onTile, onHover, onItem, compact }: Props) {
  const e = ENV_STYLE[env ?? estate.env];
  const night = !!e.night;
  const margin = 1.5;
  const [minX] = iso(-margin, size + margin);
  const [maxX] = iso(size + margin, -margin);
  const tallest = estate.items.some((p) => catalogItem(p.id)?.place?.art === "tower") ? 7.6 : estate.items.some((p) => ["lighthouse", "hotel", "motel", "gas"].includes(catalogItem(p.id)?.place?.art ?? "")) ? 3.2 : 2.4;
  const top = iso(-margin, -margin)[1] - tallest * 34 - 10;
  const bottom = iso(size + margin, size + margin + 2)[1] + 30;
  const sorted = React.useMemo(() => {
    const list = estate.items.map((p) => ({ p, it: catalogItem(p.id), fp: footprint(p.id) })).filter((x) => x.it && x.fp);
    return list.sort((a, b) => {
      const ga = isGround(a.p.id) ? 0 : 1, gb = isGround(b.p.id) ? 0 : 1;
      if (ga !== gb) return ga - gb;
      return a.p.x + a.fp!.w + a.p.y + a.fp!.d - (b.p.x + b.fp!.w + b.p.y + b.fp!.d) || a.p.x - b.p.x;
    });
  }, [estate.items]);
  const envId = env ?? estate.env;

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ background: e.sky }}>
      {/* Himmel: Sonne und langsam ziehende Wolken */}
      {!night ? (
        <>
          <div className="absolute right-[12%] top-[8%] size-24 rounded-full bg-[#fff1b8] opacity-80 blur-[2px] shadow-[0_0_80px_30px_rgba(255,214,140,0.55)]" />
          <div className="cloud absolute left-[-20%] top-[12%] h-6 w-40 rounded-full bg-white/40 blur-md" />
          <div className="cloud cloud-2 absolute left-[-30%] top-[22%] h-5 w-56 rounded-full bg-white/30 blur-md" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.8)_0.5px,transparent_1px),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.7)_0.5px,transparent_1px),radial-gradient(circle_at_45%_30%,rgba(255,255,255,0.6)_0.5px,transparent_1px)] bg-[length:180px_120px] opacity-70" />
      )}
      <svg viewBox={`${minX - 20} ${top} ${maxX - minX + 40} ${bottom - top}`} className="relative block h-full w-full" preserveAspectRatio="xMidYMid meet" onPointerLeave={() => onHover?.(-1, -1)}>
        <defs>
          <pattern id="lawn-tex" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="#ffffff" opacity="0.18" /></pattern>
          <linearGradient id="water-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={e.water} stopOpacity="0.95" /><stop offset="1" stopColor={e.water} stopOpacity="0.6" /></linearGradient>
        </defs>

        {/* Skyline hinter dem Grundstück (Downtown, Dach) */}
        {(envId === "downtown" || envId === "dach" || envId === "neon") && (
          <g opacity={0.55}>
            {Array.from({ length: 14 }, (_, i) => {
              const bx = minX + ((maxX - minX) / 14) * i;
              const h = 60 + ((i * 53) % 110);
              const by = iso(-margin, -margin)[1] - 30;
              return <rect key={i} x={bx} y={by - h} width={(maxX - minX) / 14 - 6} height={h} fill={night ? "#1a0f33" : "#4a3a6e"} />;
            })}
            {night && Array.from({ length: 40 }, (_, i) => <rect key={`w${i}`} x={minX + ((i * 97) % (maxX - minX))} y={iso(-margin, -margin)[1] - 40 - ((i * 37) % 120)} width={3} height={4} fill="#ffd56b" opacity={0.7} />)}
          </g>
        )}

        {/* Umgebung */}
        {envId === "insel" ? (
          <>
            <polygon points={diamond(-margin - 1.5, -margin - 1.5, size + 2 * margin + 3, size + 2 * margin + 3)} fill="url(#water-g)" />
            <polygon points={diamond(-margin, -margin, size + 2 * margin, size + 2 * margin)} fill="#efd9a6" />
          </>
        ) : envId === "dach" ? (
          <Box3d x={-margin} y={-margin} w={size + 2 * margin} d={size + 2 * margin} color="#9a9285" />
        ) : (
          <>
            <polygon points={diamond(-margin, -margin, size + 2 * margin, size + margin)} fill={envId === "strand" ? "#efd9a6" : envId === "downtown" ? "#3c3a46" : "#150d2a"} />
            {/* Wasser vorne mit Wellen */}
            <polygon points={pts([iso(-margin, size + 0.6), iso(size + margin, size + 0.6), iso(size + margin, size + margin + 2), iso(-margin, size + margin + 2)])} fill="url(#water-g)" />
            <g className="waves" opacity={0.5}>
              {[0.9, 1.5, 2.1].map((o) => <polyline key={o} points={pts(Array.from({ length: 12 }, (_, i) => iso(-margin + i * ((size + 2 * margin) / 11), size + o + (i % 2) * 0.15)))} fill="none" stroke="#ffffff" strokeWidth={1.2} />)}
            </g>
            {envId === "downtown" && (
              <polyline points={pts([iso(-margin + 0.6, -margin), iso(-margin + 0.6, size + 0.4)])} stroke="#f2c14e" strokeWidth={2} strokeDasharray="10 10" />
            )}
          </>
        )}

        {/* Grundstück */}
        <polygon points={diamond(0, 0, size, size, 0)} fill={e.ground} stroke={night ? "#ff2e88" : "rgba(60,30,20,0.25)"} strokeWidth={night ? 2 : 1.4} style={night ? { filter: "drop-shadow(0 0 6px #ff2e88)" } : undefined} />
        {Array.from({ length: size * size }, (_, i) => {
          const x = i % size, y = Math.floor(i / size);
          return (
            <polygon
              key={i}
              points={diamond(x, y)}
              fill={(x + y) % 2 ? e.ground2 : e.ground}
              stroke={editing ? (night ? "rgba(255,46,136,0.35)" : "rgba(60,30,20,0.12)") : "none"}
              strokeWidth={0.6}
              onClick={editing ? () => onTile?.(x, y) : undefined}
              onPointerEnter={editing ? () => onHover?.(x, y) : undefined}
              className={editing ? "cursor-pointer" : undefined}
            />
          );
        })}

        {/* Steg und Boote */}
        {boats.length > 0 && envId !== "dach" && (
          <g>
            <polygon points={pts([iso(size - 2.2, size + 0.2, 0.05), iso(size - 1.6, size + 0.2, 0.05), iso(size - 1.6, size + 3, 0.05), iso(size - 2.2, size + 3, 0.05)])} fill="#a0784f" stroke="#6b4a2a" strokeWidth={1} />
            {boats.map((b, i) => {
              const [bx, by] = iso(size - 1.2 - i * 2.4, size + 1.4 + (i % 2) * 0.9);
              return <g key={b.id} transform={`translate(${bx - 40} ${by})`}><g className="bob" style={{ animationDelay: `${i * 0.7}s` }}><BoatArt art={b.dock!.art} color={b.dock!.color} /></g></g>;
            })}
          </g>
        )}

        {/* Gegenstände */}
        {sorted.map(({ p, it, fp }) => {
          const [tx, ty] = iso(p.x, p.y);
          const isSel = selected === p.uid;
          return (
            <g key={p.uid} transform={`translate(${tx} ${ty})`} onClick={editing ? (ev) => { ev.stopPropagation(); onItem?.(p.uid); } : undefined} className={cn(editing && "cursor-pointer", "estate-item")} style={{ pointerEvents: editing ? (isGround(p.id) ? "none" : "auto") : "none" }}>
              {isSel && <polygon points={diamond(0, 0, fp!.w, fp!.d, 0.01)} fill="rgba(53,224,255,0.25)" stroke="#35e0ff" strokeWidth={2} />}
              <Art art={it!.place!.art} w={fp!.w} d={fp!.d} color={it!.place!.color} color2={it!.place!.color2} night={night} />
            </g>
          );
        })}

        {/* Platzierungsvorschau */}
        {ghost && ghost.x >= 0 && (() => {
          const it = catalogItem(ghost.id);
          const fp = footprint(ghost.id);
          if (!it?.place || !fp) return null;
          const [tx, ty] = iso(ghost.x, ghost.y);
          return (
            <g transform={`translate(${tx} ${ty})`} style={{ pointerEvents: "none" }}>
              <polygon points={diamond(0, 0, fp.w, fp.d, 0.01)} fill={ghost.ok ? "rgba(80,255,160,0.3)" : "rgba(255,60,90,0.35)"} stroke={ghost.ok ? "#50ffa0" : "#ff3c5a"} strokeWidth={2} />
              <g opacity={0.65}><Art art={it.place.art} w={fp.w} d={fp.d} color={it.place.color} color2={it.place.color2} night={night} /></g>
            </g>
          );
        })()}
      </svg>
      {compact ? null : null}
    </div>
  );
}

function Box3d({ x, y, w, d, color }: { x: number; y: number; w: number; d: number; color: string }) {
  const h = 0.6;
  return (
    <g>
      <polygon points={pts([iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, -h * 4), iso(x, y + d, -h * 4)])} fill="#6f685d" />
      <polygon points={pts([iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, -h * 4), iso(x + w, y, -h * 4)])} fill="#5a544b" />
      <polygon points={pts([iso(x, y), iso(x + w, y), iso(x + w, y + d), iso(x, y + d)])} fill={color} />
      <polyline points={pts([iso(x, y + d, 0.35), iso(x + w, y + d, 0.35), iso(x + w, y, 0.35)])} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} />
    </g>
  );
}

export { TW, TH };
