"use client";
import * as React from "react";
import { Building2, Camera, Disc3, Footprints, Frame, Gamepad2, Gem, Plane, Star, Watch } from "lucide-react";
import type { CatalogItem, EnvId } from "@/lib/game/catalog";
import { DEFAULT_CHARACTER, type Character } from "@/lib/game/character";
import { CharacterArt } from "../character";
import { Art, BoatArt, TH, TW } from "./iso";
import { cn } from "@/lib/utils";

const COLLECT_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  disc: Disc3, footprints: Footprints, camera: Camera, gamepad: Gamepad2, watch: Watch, frame: Frame, bar: Gem, building: Building2, plane: Plane, star: Star,
};

export const ENV_STYLE: Record<EnvId, { ground: string; ground2: string; sky: string; water: string; label: string; night?: boolean }> = {
  strand: { ground: "#e9cf98", ground2: "#dcbd80", sky: "linear-gradient(180deg,#ff9a62 0%,#ff5e8a 45%,#5b2a86 100%)", water: "#2fb7d6", label: "Strand" },
  downtown: { ground: "#5b5966", ground2: "#4c4a57", sky: "linear-gradient(180deg,#ffb38a 0%,#c45d8e 50%,#2a1b4a 100%)", water: "#3a6f9e", label: "Downtown" },
  insel: { ground: "#7fc46a", ground2: "#6db35a", sky: "linear-gradient(180deg,#7fd8ff 0%,#4fb0e6 50%,#2f7fd6 100%)", water: "#21c6c9", label: "Privatinsel" },
  neon: { ground: "#2a1b4a", ground2: "#22153d", sky: "linear-gradient(180deg,#0b0620 0%,#2a0f4a 60%,#4a0f5a 100%)", water: "#1a3a7a", label: "Neon-Nacht", night: true },
  dach: { ground: "#c9c2b6", ground2: "#bab2a4", sky: "linear-gradient(180deg,#ffd0a0 0%,#ff7a8a 40%,#3b2b6e 100%)", water: "#35c4e0", label: "Dachterrasse" },
};

const BOAT_VIEW: Record<string, string> = { jetski: "-10 -26 60 46", sail: "-8 -78 88 100", speed: "-8 -30 96 52", yacht: "-10 -62 170 96" };

/** Vorschau eines Gegenstands für Shop, Inventar und Profil */
export function ItemArt({ item, character, className, size = 140 }: { item: CatalogItem; character?: Character | null; className?: string; size?: number }) {
  if (item.kind === "place" && item.place) {
    const { w, d } = item.place;
    const width = ((w + d) * TW) / 2 + 24;
    const art = item.place.art;
    const tall = ["tower", "lighthouse", "hotel", "palm", "umbrella", "lamp", "hoop", "motel", "club", "glass", "villa", "gas", "cart", "statue", "portara"].includes(art);
    const flat = ["lawn", "path", "court", "pool", "helipad", "bike", "scooter", "moto", "flamingo", "flowers", "lounger", "guitar", "boombox"].includes(art);
    const top = art === "tower" ? 250 : tall ? 110 : flat ? 26 : 46;
    const height = ((w + d) * TH) / 2 + top + 16;
    return (
      <svg viewBox={`${(-d * TW) / 2 - 12} ${-top} ${width} ${height}`} className={cn("h-full w-full", className)} style={{ maxHeight: size }} aria-hidden>
        <defs><pattern id="lawn-tex" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="0.9" fill="#ffffff" opacity="0.18" /></pattern></defs>
        <Art art={item.place.art} w={w} d={d} color={item.place.color} color2={item.place.color2} />
      </svg>
    );
  }
  if (item.kind === "dock" && item.dock) {
    return (
      <svg viewBox={BOAT_VIEW[item.dock.art] ?? "-20 -90 200 130"} className={cn("h-full w-full", className)} style={{ maxHeight: size }} aria-hidden>
        <rect x={-40} y={8} width={300} height={60} fill="#2fb7d6" opacity={0.55} />
        <g className="bob"><BoatArt art={item.dock.art} color={item.dock.color} /></g>
      </svg>
    );
  }
  if (item.kind === "wear" && item.wear) {
    const base = character ?? DEFAULT_CHARACTER;
    const c: Character = { ...base, [item.wear.slot]: item.id };
    return (
      <span className={cn("flex h-full w-full items-center justify-center", className)}>
        <span className="overflow-hidden rounded-2xl">
          <CharacterArt c={c} size={size * 0.72} frame crop={item.wear.slot !== "top" && item.wear.slot !== "neck"} />
        </span>
      </span>
    );
  }
  if (item.kind === "collect" && item.collect) {
    const Icon = COLLECT_ICONS[item.collect.icon] ?? Star;
    return (
      <span className={cn("flex h-full w-full items-center justify-center", className)}>
        <span className="grid place-items-center rounded-3xl border border-white/15 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.8)]" style={{ width: size * 0.6, height: size * 0.6, background: `radial-gradient(circle at 30% 25%, ${item.collect.color}, rgba(20,10,30,0.9) 75%)` }}>
          <Icon className="text-white" style={{ width: size * 0.3, height: size * 0.3, filter: `drop-shadow(0 0 10px ${item.collect.color})` }} />
        </span>
      </span>
    );
  }
  if (item.kind === "plot" && item.plot) {
    const n = item.plot.size;
    return (
      <svg viewBox="-110 -10 220 120" className={cn("h-full w-full", className)} style={{ maxHeight: size }} aria-hidden>
        {Array.from({ length: n * n }, (_, i) => {
          const x = i % n, y = Math.floor(i / n);
          const s = 100 / n;
          const cx = (x - y) * s, cy = ((x + y) * s) / 2;
          const inner = x < 8 && y < 8;
          return <polygon key={i} points={`${cx},${cy} ${cx + s},${cy + s / 2} ${cx},${cy + s} ${cx - s},${cy + s / 2}`} fill={inner ? "#7fc46a" : "#f2c14e"} stroke="rgba(0,0,0,0.15)" strokeWidth={0.5} />;
        })}
      </svg>
    );
  }
  if (item.kind === "theme" && item.theme) {
    const e = ENV_STYLE[item.theme.env];
    return (
      <span className={cn("relative block h-full w-full overflow-hidden rounded-2xl", className)} style={{ background: e.sky, maxHeight: size }}>
        <span className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: e.water, opacity: 0.8 }} />
        <svg viewBox="-80 -20 160 70" className="absolute inset-x-0 bottom-2 mx-auto h-2/3" aria-hidden>
          <polygon points="0,0 70,35 0,70 -70,35" transform="scale(0.8)" fill={e.ground} />
        </svg>
      </span>
    );
  }
  return null;
}
