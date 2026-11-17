"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Illustrierte Titelbilder der Themen-Packs.
 * Jede Szene besteht aus einem Himmelsverlauf, organisch berechneten
 * Landschaftsschichten (seeded – immer gleich) und einem thematischen Motiv.
 * Eine feine Körnung sorgt für einen gedruckten, natürlichen Look.
 */

interface Palette {
  sky: [string, string];
  sun: string;
  layers: [string, string, string, string];
  motif: string;
  glow?: string;
}

const PALETTES: Record<string, Palette> = {
  allgemeinwissen: { sky: ["#e9dfc4", "#f6efdc"], sun: "#f3d9a0", layers: ["#c7c59b", "#9fa66f", "#6f7d45", "#45532b"], motif: "#3b4426" },
  sport: { sky: ["#c9d9cf", "#eef1e4"], sun: "#f5e6b8", layers: ["#a8c0a6", "#7c9d7f", "#4f7558", "#2d4a36"], motif: "#f4efe0" },
  musik: { sky: ["#3a2a24", "#8a5a45"], sun: "#e9b98a", layers: ["#6e4636", "#563427", "#3f241b", "#2a1712"], motif: "#f0d3b2", glow: "#e9b98a" },
  geografie: { sky: ["#b9d2d4", "#eef1ea"], sun: "#fbf3dc", layers: ["#a9bfc2", "#7f9ea3", "#55797f", "#2f525a"], motif: "#ffffff" },
  geschichte: { sky: ["#e8d4ac", "#f5ead3"], sun: "#f0c987", layers: ["#d4bb8c", "#b39668", "#8a6e46", "#5e4a2c"], motif: "#4a3a22" },
  wissenschaft: { sky: ["#0f1a2c", "#2c4060"], sun: "#c9d6ea", layers: ["#2a3b58", "#223149", "#1a263a", "#121b2b"], motif: "#e6ecf7", glow: "#9fb4d6" },
  "tiere-pflanzen": { sky: ["#d6e2c6", "#f1f1e2"], sun: "#f5e7bb", layers: ["#a7bd8a", "#7f9c62", "#557440", "#2f4a24"], motif: "#2a3d20" },
  "filme-serien": { sky: ["#2b1a1e", "#6e3f45"], sun: "#f1d6b8", layers: ["#5a3238", "#46262b", "#341b1f", "#221114"], motif: "#f3e2cf", glow: "#f1d6b8" },
  gaming: { sky: ["#232741", "#4a4f6e"], sun: "#d9dcf0", layers: ["#3c4163", "#323655", "#282b46", "#1d1f34"], motif: "#c9cdf0", glow: "#a6acdf" },
  "essen-trinken": { sky: ["#f0dcc2", "#f8efe2"], sun: "#f3c98f", layers: ["#e3c39b", "#c99a6a", "#9a5b2e", "#6a3b1c"], motif: "#fff7ea" },
  literatur: { sky: ["#2d241d", "#5c4a3a"], sun: "#efe1c4", layers: ["#4c3d30", "#3e3127", "#30261e", "#221b15"], motif: "#e9dcc4", glow: "#efe1c4" },
  technik: { sky: ["#cfd6d9", "#eef0ee"], sun: "#f6f2e4", layers: ["#aeb8bc", "#8a979d", "#5f6c72", "#3a454a"], motif: "#2a3236" },
  "kunst-kultur": { sky: ["#ead6dd", "#f6eef0"], sun: "#f2d8b8", layers: ["#d2b5c0", "#b3909f", "#8a6676", "#5e4250"], motif: "#fbf2f4" },
  "marken-wirtschaft": { sky: ["#dfe2d2", "#f3f3ea"], sun: "#f2e6c2", layers: ["#bcc3a6", "#98a17c", "#6c7651", "#424a2e"], motif: "#2f3520" },
  reisen: { sky: ["#f0dfc0", "#f9f1e2"], sun: "#f6cf8e", layers: ["#dcc7a0", "#c0a274", "#957650", "#62492d"], motif: "#a6573a" },
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Organische Hügelkette als SVG-Pfad */
function ridge(rand: () => number, baseY: number, amp: number, steps: number, sharp = false): string {
  const pts: [number, number][] = [];
  let y = baseY;
  for (let i = 0; i <= steps; i++) {
    const x = -20 + (440 / steps) * i;
    y = baseY + (rand() - 0.5) * amp * 2 * (sharp ? 1.4 : 1) + (y - baseY) * 0.35;
    pts.push([x, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (sharp) d += ` L ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    else {
      const mx = (x0 + x1) / 2;
      d += ` Q ${x0.toFixed(1)} ${y0.toFixed(1)} ${mx.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`;
    }
  }
  d += ` L 440 260 L -20 260 Z`;
  return d;
}

function Motif({ id, p }: { id: string; p: Palette }) {
  const c = p.motif;
  switch (id) {
    case "allgemeinwissen":
      return (
        <g opacity="0.55" stroke={c} fill="none" strokeWidth="1">
          <circle cx="300" cy="78" r="44" />
          <circle cx="300" cy="78" r="30" strokeDasharray="2 4" />
          <path d="M300 26 L308 78 L300 130 L292 78 Z" fill={c} fillOpacity="0.35" />
          <path d="M248 78 L300 70 L352 78 L300 86 Z" fill={c} fillOpacity="0.2" />
        </g>
      );
    case "sport":
      return (
        <g>
          <ellipse cx="200" cy="232" rx="210" ry="44" fill="none" stroke={c} strokeOpacity="0.7" strokeWidth="1.5" />
          <ellipse cx="200" cy="232" rx="170" ry="30" fill="none" stroke={c} strokeOpacity="0.5" strokeWidth="1" />
          {[70, 330].map((x) => (
            <g key={x} opacity="0.85">
              <rect x={x - 1.5} y="96" width="3" height="110" fill="#2d4a36" />
              <rect x={x - 14} y="88" width="28" height="12" rx="2" fill="#2d4a36" />
              <path d={`M${x - 12} 100 L${x - 60} 230 L${x + 60} 230 L${x + 12} 100 Z`} fill="#fff8df" opacity="0.18" />
            </g>
          ))}
        </g>
      );
    case "musik":
      return (
        <g>
          {[18, 30, 42, 54, 66].map((r, i) => (
            <circle key={r} cx="290" cy="92" r={r} fill="none" stroke={c} strokeOpacity={0.5 - i * 0.07} strokeWidth="1" />
          ))}
          <circle cx="290" cy="92" r="8" fill={c} opacity="0.8" />
          <path d="M20 150 C 80 120, 120 180, 180 150 S 280 120, 340 150 S 400 170, 420 150" stroke={c} strokeOpacity="0.45" fill="none" strokeWidth="1.2" />
          <path d="M20 162 C 80 136, 120 190, 180 162 S 280 136, 340 162" stroke={c} strokeOpacity="0.25" fill="none" strokeWidth="1" />
        </g>
      );
    case "geografie":
      return (
        <g>
          <g opacity="0.35" stroke="#2f525a" fill="none" strokeWidth="0.8">
            <path d="M0 60 Q200 40 400 60" />
            <path d="M0 95 Q200 80 400 95" />
            <path d="M120 0 Q110 120 125 240" />
            <path d="M280 0 Q290 120 275 240" />
          </g>
          <path d="M150 150 L195 92 L240 150 Z" fill="#55797f" />
          <path d="M180 112 L195 92 L210 112 L202 108 L195 116 L188 108 Z" fill={c} />
          <path d="M210 160 L262 100 L320 160 Z" fill="#45686e" />
          <path d="M248 116 L262 100 L278 118 L268 114 L262 122 L255 113 Z" fill={c} />
          <path d="M-10 250 C 90 220, 160 238, 230 214 S 360 196, 420 206" stroke="#d6e6e6" strokeWidth="5" fill="none" opacity="0.7" />
        </g>
      );
    case "geschichte":
      return (
        <g fill={c} opacity="0.82">
          <path d="M228 96 L310 72 L392 96 Z" />
          <rect x="232" y="96" width="156" height="8" />
          {[240, 262, 284, 306, 328, 350, 372].map((x) => (
            <rect key={x} x={x} y="106" width="8" height="66" rx="1" />
          ))}
          <rect x="226" y="172" width="168" height="8" />
          <rect x="220" y="180" width="180" height="6" />
        </g>
      );
    case "wissenschaft":
      return (
        <g>
          {Array.from({ length: 46 }, (_, i) => {
            const r = mulberry32(i * 97 + 3);
            return <circle key={i} cx={r() * 400} cy={r() * 150} r={r() * 1.3 + 0.3} fill={c} opacity={0.35 + r() * 0.6} />;
          })}
          <circle cx="285" cy="78" r="26" fill="#c9d6ea" />
          <circle cx="278" cy="72" r="26" fill="#9fb4d6" opacity="0.35" />
          <ellipse cx="285" cy="80" rx="52" ry="12" fill="none" stroke={c} strokeWidth="1.6" transform="rotate(-14 285 80)" opacity="0.85" />
          <ellipse cx="120" cy="110" rx="150" ry="44" fill="none" stroke={c} strokeOpacity="0.18" strokeDasharray="2 5" />
        </g>
      );
    case "tiere-pflanzen":
      return (
        <g>
          {[30, 62, 98, 330, 362, 392].map((x, i) => {
            const h = 70 + ((i * 37) % 30);
            return <path key={x} d={`M${x} ${210 - h} L${x + 16} 214 L${x - 16} 214 Z M${x} ${210 - h * 0.7} L${x + 20} 222 L${x - 20} 222 Z`} fill="#2f4a24" opacity="0.9" />;
          })}
          {[[230, 60], [252, 72], [212, 78]].map(([x, y], i) => (
            <path key={i} d={`M${x - 8} ${y} q 4 -5 8 0 q 4 -5 8 0`} stroke={c} strokeWidth="1.6" fill="none" opacity="0.7" />
          ))}
        </g>
      );
    case "filme-serien":
      return (
        <g>
          <path d="M60 0 L150 240 L250 240 L120 0 Z" fill={p.glow} opacity="0.1" />
          <path d="M340 0 L250 240 L330 240 L380 0 Z" fill={p.glow} opacity="0.08" />
          <g opacity="0.85">
            <rect x="-10" y="40" width="420" height="34" fill="#1a0d10" opacity="0.65" />
            {Array.from({ length: 22 }, (_, i) => (
              <g key={i}>
                <rect x={i * 20} y="44" width="9" height="6" rx="1.5" fill={c} opacity="0.7" />
                <rect x={i * 20} y="64" width="9" height="6" rx="1.5" fill={c} opacity="0.7" />
              </g>
            ))}
          </g>
        </g>
      );
    case "gaming":
      return (
        <g>
          {[[90, 70, 18], [300, 56, 24], [210, 110, 12], [350, 128, 9], [140, 130, 8]].map(([x, y, s], i) => (
            <g key={i} opacity={0.5 + (i % 3) * 0.15}>
              <path d={`M${x} ${y - s} L${x + s * 0.8} ${y} L${x} ${y + s} L${x - s * 0.8} ${y} Z`} fill="none" stroke={c} strokeWidth="1.3" />
              <path d={`M${x} ${y - s} L${x} ${y + s} M${x - s * 0.8} ${y} L${x + s * 0.8} ${y}`} stroke={c} strokeWidth="0.6" opacity="0.6" />
            </g>
          ))}
        </g>
      );
    case "essen-trinken":
      return (
        <g>
          <rect x="-10" y="196" width="420" height="60" fill="#6a3b1c" opacity="0.35" />
          <path d="M140 170 Q200 236 260 170 Z" fill={c} />
          <ellipse cx="200" cy="170" rx="60" ry="9" fill="#f3e3cc" />
          <ellipse cx="200" cy="170" rx="50" ry="6" fill="#c99a6a" />
          {[180, 200, 220].map((x, i) => (
            <path key={x} d={`M${x} 150 c -8 -12, 8 -18, 0 -30 c -8 -12, 8 -18, 0 -30`} stroke={c} strokeWidth="1.6" fill="none" opacity={0.75 - i * 0.12} />
          ))}
        </g>
      );
    case "literatur":
      return (
        <g>
          <path d="M310 40 a 24 24 0 1 0 22 34 a 18 18 0 1 1 -22 -34 Z" fill={c} opacity="0.85" />
          {[
            [130, 190, 140, 16, "#8a6e46"],
            [140, 174, 120, 16, "#6e3f45"],
            [126, 158, 132, 16, "#3a5e46"],
            [150, 142, 100, 16, "#b39668"],
          ].map(([x, y, w, h, col], i) => (
            <g key={i}>
              <rect x={x as number} y={y as number} width={w as number} height={h as number} rx="2" fill={col as string} />
              <rect x={(x as number) + 8} y={(y as number) + 5} width={(w as number) - 30} height="2" fill={c} opacity="0.5" />
            </g>
          ))}
        </g>
      );
    case "technik":
      return (
        <g>
          <g fill="#3a454a" opacity="0.92">
            {[[40, 120, 26], [72, 96, 22], [100, 136, 30], [138, 84, 20], [164, 112, 34], [206, 70, 18], [230, 104, 28], [264, 126, 24], [292, 90, 22], [320, 118, 30], [356, 100, 24]].map(([x, h, w], i) => (
              <rect key={i} x={x} y={220 - h} width={w} height={h} />
            ))}
          </g>
          <g stroke={c} strokeWidth="1" fill="none" opacity="0.35">
            <path d="M0 40 H120 V70 H220 V40 H400" />
            <path d="M0 60 H80 V90 H300 V60 H400" />
          </g>
          {[[120, 70], [220, 40], [80, 90], [300, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3" fill={c} opacity="0.5" />)}
        </g>
      );
    case "kunst-kultur":
      return (
        <g>
          {[70, 150, 230, 310].map((x) => (
            <path key={x} d={`M${x} 214 V130 a 30 30 0 0 1 60 0 V214`} fill="none" stroke={c} strokeWidth="6" opacity="0.85" />
          ))}
          <rect x="60" y="210" width="290" height="8" fill={c} opacity="0.85" />
          <rect x="182" y="38" width="44" height="54" fill="none" stroke="#8a6676" strokeWidth="2" opacity="0.6" />
          <circle cx="204" cy="65" r="12" fill="#b3909f" opacity="0.6" />
        </g>
      );
    case "marken-wirtschaft":
      return (
        <g>
          <g fill="#424a2e" opacity="0.9">
            <rect x="150" y="70" width="34" height="150" />
            <path d="M150 70 L167 44 L184 70 Z" />
            <rect x="196" y="100" width="40" height="120" />
            <rect x="248" y="56" width="28" height="164" />
            <rect x="110" y="120" width="30" height="100" />
            <rect x="286" y="130" width="36" height="90" />
          </g>
          <g fill="#f2e6c2" opacity="0.6">
            {Array.from({ length: 24 }, (_, i) => (
              <rect key={i} x={154 + (i % 3) * 10} y={80 + Math.floor(i / 3) * 16} width="4" height="7" />
            ))}
          </g>
        </g>
      );
    case "reisen":
      return (
        <g>
          {[[110, 70, 22, "#a6573a"], [270, 52, 28, "#3f6b4f"], [340, 108, 14, "#b8892e"]].map(([x, y, r, col], i) => (
            <g key={i}>
              <path d={`M${x} ${(y as number) - (r as number)} a ${r} ${r} 0 1 1 -0.1 0 Z`} fill={col as string} />
              <path d={`M${(x as number) - (r as number) * 0.6} ${(y as number) + (r as number) * 0.8} L${(x as number) - (r as number) * 0.25} ${(y as number) + (r as number) * 1.5} M${(x as number) + (r as number) * 0.6} ${(y as number) + (r as number) * 0.8} L${(x as number) + (r as number) * 0.25} ${(y as number) + (r as number) * 1.5}`} stroke="#5e4a2c" strokeWidth="1" />
              <rect x={(x as number) - (r as number) * 0.28} y={(y as number) + (r as number) * 1.5} width={(r as number) * 0.56} height={(r as number) * 0.42} rx="1.5" fill="#5e4a2c" />
              <path d={`M${x} ${(y as number) - (r as number)} V ${(y as number) + (r as number) * 0.95}`} stroke="#fff" strokeOpacity="0.35" />
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
}

export function PackArt({ packId, className, image, alt }: { packId: string; className?: string; image?: string | null; alt?: string }) {
  const uid = React.useId().replace(/:/g, "");
  const p = PALETTES[packId] ?? PALETTES.allgemeinwissen;
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={alt ?? ""} className={cn("h-full w-full object-cover", className)} />;
  }
  const rand = mulberry32(hashStr(packId));
  const sharp = packId === "geografie" || packId === "gaming";
  const layers = [
    ridge(rand, 150, 18, 7, sharp),
    ridge(rand, 172, 14, 8),
    ridge(rand, 196, 12, 9),
    ridge(rand, 222, 8, 10),
  ];
  const motifFront = ["sport", "geschichte", "tiere-pflanzen", "essen-trinken", "literatur", "technik", "kunst-kultur", "marken-wirtschaft"].includes(packId);
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} role="img" aria-label={alt ?? ""}>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`sun-${uid}`}>
          <stop offset="0" stopColor={p.sun} stopOpacity="1" />
          <stop offset="0.45" stopColor={p.sun} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`haze-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[1]} stopOpacity="0" />
          <stop offset="1" stopColor={p.sky[1]} stopOpacity="0.55" />
        </linearGradient>
        <filter id={`grain-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
        </filter>
      </defs>
      <rect width="400" height="240" fill={`url(#sky-${uid})`} />
      <circle cx="110" cy="70" r="90" fill={`url(#sun-${uid})`} />
      <circle cx="110" cy="70" r="20" fill={p.sun} opacity="0.9" />
      {!motifFront && <Motif id={packId} p={p} />}
      {layers.map((d, i) => (
        <g key={i}>
          <path d={d} fill={p.layers[i]} />
          {i < 3 && <path d={d} fill={`url(#haze-${uid})`} opacity={0.6 - i * 0.18} />}
        </g>
      ))}
      {motifFront && <Motif id={packId} p={p} />}
      <rect width="400" height="240" filter={`url(#grain-${uid})`} opacity="0.5" style={{ mixBlendMode: "multiply" }} />
    </svg>
  );
}
