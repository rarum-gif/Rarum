"use client";
import * as React from "react";
import { BACKDROPS, HAIR_COLORS, SKINS, type Character } from "@/lib/game/character";
import { catalogItem } from "@/lib/game/catalog";
import { shade } from "./world/iso";
import { cn } from "@/lib/utils";

/**
 * Porträt der Spielfigur (Brustbild) als Vektorgrafik.
 * Stil: kräftige Konturen, flache Schatten, Sonnenuntergangs-Licht von rechts.
 */

const INK = "#1a0f22";
const line = { stroke: INK, strokeWidth: 2.4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Top({ style, color, color2 = "#ffffff", skin }: { style: string; color: string; color2?: string; skin: string }) {
  const body = "M28 240 C 30 196 52 170 84 160 L 116 160 C 148 170 170 196 172 240 Z";
  const dark = shade(color, -0.28);
  switch (style) {
    case "tank":
      return (
        <g>
          <path d={body} fill={skin} {...line} />
          <path d="M60 240 C 60 200 66 178 78 166 L 84 172 C 92 182 108 182 116 172 L 122 166 C 134 178 140 200 140 240 Z" fill={color} {...line} />
          <path d="M120 175 C 132 190 136 212 136 240 L 140 240 C 140 205 134 182 122 166 Z" fill={dark} />
        </g>
      );
    case "hawaii":
      return (
        <g>
          <path d={body} fill={color} {...line} />
          {[[60, 200], [92, 222], [130, 196], [150, 226], [48, 230], [112, 200]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}><circle r={7} fill={color2} opacity={0.9} /><circle r={2.6} fill="#fff6c2" /></g>
          ))}
          <path d="M84 160 L100 196 L116 160 L108 160 L100 178 L92 160 Z" fill={skin} {...line} />
          <path d="M84 160 L72 180 L96 190 Z M116 160 L128 180 L104 190 Z" fill={shade(color, 0.12)} {...line} />
          <path d="M150 190 C 162 205 168 222 170 240 L 172 240 C 170 210 160 186 140 172 Z" fill={dark} opacity={0.6} />
        </g>
      );
    case "hoodie":
      return (
        <g>
          <path d="M66 172 C 64 150 80 140 100 140 C 120 140 136 150 134 172 Z" fill={dark} {...line} />
          <path d={body} fill={color} {...line} />
          <path d="M80 164 C 88 186 112 186 120 164" fill="none" {...line} />
          <path d="M92 182 L 90 206 M108 182 L 110 206" {...line} />
          <path d="M70 214 L 130 214 L 126 236 L 74 236 Z" fill={shade(color, -0.1)} {...line} />
          <path d="M150 190 C 162 205 168 222 170 240 L 172 240 C 170 210 160 186 140 172 Z" fill={dark} opacity={0.7} />
        </g>
      );
    case "track":
      return (
        <g>
          <path d={body} fill={color} {...line} />
          <path d="M48 186 L 40 240 M152 186 L 160 240" stroke={color2} strokeWidth={6} />
          <path d="M84 160 C 90 168 110 168 116 160 L 116 154 L 84 154 Z" fill={shade(color, 0.15)} {...line} />
          <path d="M100 166 L 100 240" stroke={shade(color, -0.4)} strokeWidth={2.4} />
          <path d="M150 190 C 162 205 168 222 170 240 L 172 240 C 170 210 160 186 140 172 Z" fill={dark} opacity={0.6} />
        </g>
      );
    case "jacket":
    case "bomber":
      return (
        <g>
          <path d={body} fill={color} {...line} />
          <path d="M84 160 L 100 240 L 116 160 Z" fill="#f5f5f5" {...line} />
          {style === "jacket" ? (
            <path d="M84 160 L 70 182 L 92 214 L 100 240 M116 160 L 130 182 L 108 214 L 100 240" fill="none" {...line} />
          ) : (
            <path d="M80 160 C 88 170 112 170 120 160 L 122 152 C 112 160 88 160 78 152 Z" fill={color2} {...line} />
          )}
          <path d="M150 190 C 162 205 168 222 170 240 L 172 240 C 170 210 160 186 140 172 Z" fill={shade(color, style === "jacket" && color === "#1d1d24" ? 0.18 : -0.3)} opacity={0.7} />
          {style === "jacket" && <path d="M58 192 L 76 200 M140 196 L 152 190" stroke={shade(color, 0.35)} strokeWidth={2} />}
        </g>
      );
    case "suit":
    case "tux":
      return (
        <g>
          <path d={body} fill={color} {...line} />
          <path d="M84 160 L 100 216 L 116 160 Z" fill="#ffffff" {...line} />
          {style === "suit" ? (
            <path d="M96 168 L 104 168 L 106 206 L 100 214 L 94 206 Z" fill={color2} {...line} />
          ) : (
            <path d="M88 166 L 100 172 L 112 166 L 112 178 L 100 172 L 88 178 Z" fill={INK} />
          )}
          <path d="M84 160 L 72 186 L 90 200 L 100 222 M116 160 L 128 186 L 110 200 L 100 222" fill="none" {...line} />
          <path d="M150 190 C 162 205 168 222 170 240 L 172 240 C 170 210 160 186 140 172 Z" fill={shade(color, color === "#121218" ? 0.15 : -0.25)} opacity={0.7} />
        </g>
      );
    default: // tee
      return (
        <g>
          <path d={body} fill={color} {...line} />
          <path d="M84 160 C 88 172 112 172 116 160" fill={skin} {...line} />
          <path d="M150 190 C 162 205 168 222 170 240 L 172 240 C 170 210 160 186 140 172 Z" fill={shade(color, -0.2)} opacity={0.7} />
          <path d="M52 200 C 56 214 58 226 58 240 M148 200 C 144 214 142 226 142 240" fill="none" stroke={shade(color, -0.25)} strokeWidth={2} />
        </g>
      );
  }
}

function HairBack({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "wavy": return <path d="M60 80 C 56 130 62 160 76 176 C 70 150 72 120 70 100 Z M140 80 C 144 130 138 160 124 176 C 130 150 128 120 130 100 Z M64 70 C 70 40 130 40 136 70 L 136 100 L 64 100 Z" fill={color} {...line} />;
    case "ponytail": return <path d="M126 64 C 160 70 164 120 150 150 C 146 124 140 100 128 86 Z" fill={color} {...line} />;
    case "bob": return <path d="M60 74 C 56 120 60 134 72 140 L 128 140 C 140 134 144 120 140 74 Z" fill={color} {...line} />;
    case "afro": return <circle cx={100} cy={72} r={56} fill={color} {...line} />;
    case "curls": return <g fill={color} {...line}>{[[66, 70], [80, 50], [100, 44], [120, 50], [134, 70], [140, 94], [60, 94]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={16} />)}</g>;
    case "braids": return <g fill={color} {...line}><path d="M64 70 C 70 40 130 40 136 70 L 136 100 L 64 100 Z" />{[62, 138].map((x) => <path key={x} d={`M${x} 90 C ${x - 4} 130 ${x + 4} 160 ${x} 200`} fill="none" stroke={color} strokeWidth={11} strokeLinecap="round" />)}</g>;
    case "bun": return <circle cx={100} cy={40} r={16} fill={color} {...line} />;
    default: return null;
  }
}

function HairFront({ style, color }: { style: string; color: string }) {
  const hl = shade(color, 0.3);
  switch (style) {
    case "buzz": return <path d="M68 78 C 70 54 130 54 132 78 C 120 66 80 66 68 78 Z" fill={color} opacity={0.85} />;
    case "short": return <g><path d="M64 84 C 60 50 88 40 104 42 C 124 42 142 56 136 86 C 128 70 118 64 100 66 C 86 66 74 72 64 84 Z" fill={color} {...line} /><path d="M90 50 C 104 46 118 50 126 58" stroke={hl} strokeWidth={3} fill="none" strokeLinecap="round" /></g>;
    case "slick": return <g><path d="M64 86 C 60 52 86 42 102 42 C 122 42 140 54 136 86 C 132 66 116 58 98 58 C 82 58 70 68 64 86 Z" fill={color} {...line} /><path d="M80 52 C 96 46 118 48 128 60 M84 58 C 98 54 114 56 124 64" stroke={hl} strokeWidth={2} fill="none" /></g>;
    case "wavy": return <path d="M62 92 C 58 50 90 38 104 40 C 128 42 144 60 138 94 C 132 76 122 64 108 62 C 112 72 104 76 96 70 C 86 76 72 80 62 92 Z" fill={color} {...line} />;
    case "ponytail": case "bun": return <path d="M64 86 C 62 52 90 42 104 42 C 124 44 140 58 136 86 C 124 68 112 62 100 62 C 84 62 72 70 64 86 Z" fill={color} {...line} />;
    case "bob": return <path d="M60 96 C 56 52 88 38 104 40 C 128 42 146 60 140 98 C 134 72 120 60 102 62 C 92 70 76 78 60 96 Z" fill={color} {...line} />;
    case "bangs": return <g><path d="M62 100 C 56 52 88 38 104 40 C 128 42 146 60 140 100 L 132 86 C 128 76 122 72 116 70 L 112 82 L 104 70 L 96 84 L 88 70 L 80 84 L 74 72 C 68 78 64 88 62 100 Z" fill={color} {...line} /><path d="M58 96 C 56 130 60 150 66 160 L 72 104 Z M142 96 C 144 130 140 150 134 160 L 128 104 Z" fill={color} {...line} /></g>;
    case "afro": return <path d="M64 86 C 64 70 80 60 100 60 C 120 60 136 70 136 86 C 126 76 74 76 64 86 Z" fill={shade(color, 0.08)} />;
    case "curls": return <g fill={color} {...line}>{[[74, 66], [92, 58], [110, 58], [128, 66]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} />)}</g>;
    case "braids": return <g><path d="M64 86 C 62 52 90 42 104 42 C 124 44 140 58 136 86 C 124 68 112 62 100 62 C 84 62 72 70 64 86 Z" fill={color} {...line} />{[78, 92, 108, 122].map((x) => <path key={x} d={`M${x} 50 L ${x - 2} 70`} stroke={hl} strokeWidth={2} />)}</g>;
    default: return null;
  }
}

function Facial({ kind, color }: { kind: string; color: string }) {
  switch (kind) {
    case "stubble": return <path d="M74 112 C 78 134 92 142 100 142 C 108 142 122 134 126 112 C 120 126 110 132 100 132 C 90 132 80 126 74 112 Z" fill={color} opacity={0.28} />;
    case "mustache": return <path d="M86 118 C 92 112 98 114 100 117 C 102 114 108 112 114 118 C 108 122 102 121 100 120 C 98 121 92 122 86 118 Z" fill={color} {...line} strokeWidth={1.6} />;
    case "beard": return <path d="M68 100 C 68 136 86 150 100 150 C 114 150 132 136 132 100 C 128 118 120 124 114 124 C 108 118 92 118 86 124 C 80 124 72 118 68 100 Z M90 126 C 96 122 104 122 110 126 C 104 130 96 130 90 126 Z" fill={color} fillRule="evenodd" {...line} strokeWidth={1.8} />;
    default: return null;
  }
}

function Headwear({ style, color, color2 = "#1d1d24" }: { style: string; color: string; color2?: string }) {
  switch (style) {
    case "cap": return <g><path d="M64 78 C 62 46 138 46 136 78 Z" fill={color} {...line} /><path d="M118 74 C 140 70 160 74 166 82 C 150 84 132 82 118 80 Z" fill={shade(color, -0.25)} {...line} /><circle cx={100} cy={48} r={3} fill={shade(color, -0.3)} /></g>;
    case "band": return <path d="M64 74 C 80 66 120 66 136 74 L 136 84 C 120 76 80 76 64 84 Z" fill={color} {...line} />;
    case "beanie": return <g><path d="M62 80 C 58 36 142 36 138 80 Z" fill={color} {...line} /><path d="M60 72 L 140 72 L 140 86 L 60 86 Z" fill={shade(color, -0.2)} {...line} /></g>;
    case "bucket": return <g><path d="M70 72 C 70 44 130 44 130 72 Z" fill={color} {...line} /><path d="M54 80 C 70 66 130 66 146 80 C 130 86 70 86 54 80 Z" fill={shade(color, -0.12)} {...line} /></g>;
    case "cowboy": case "panama": return <g><path d="M40 78 C 60 70 140 70 160 78 C 150 88 50 88 40 78 Z" fill={shade(color, -0.12)} {...line} /><path d="M70 76 C 68 40 132 40 130 76 C 118 70 82 70 70 76 Z" fill={color} {...line} />{style === "panama" && <path d="M71 68 C 86 62 114 62 129 68 L 130 75 C 116 70 84 70 70 75 Z" fill={color2} />}{style === "cowboy" && <path d="M100 46 L 100 70" stroke={shade(color, -0.3)} strokeWidth={2} />}</g>;
    case "crown": return <path d="M66 62 L 72 34 L 86 52 L 100 28 L 114 52 L 128 34 L 134 62 Z" fill={color} {...line} style={{ filter: "drop-shadow(0 0 6px rgba(242,193,78,0.7))" }} />;
    default: return null;
  }
}

function Eyewear({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "shades": return <g><rect x={70} y={88} width={26} height={14} rx={6} fill={color} {...line} /><rect x={104} y={88} width={26} height={14} rx={6} fill={color} {...line} /><path d="M96 93 L 104 93" {...line} /><path d="M75 91 L 84 91 M109 91 L 118 91" stroke="#ffffff" strokeWidth={2} opacity={0.5} /></g>;
    case "aviator": return <g><path d="M70 88 L 96 88 C 96 100 92 106 84 106 C 74 106 70 98 70 88 Z M104 88 L 130 88 C 130 98 126 106 116 106 C 108 106 104 100 104 88 Z" fill="#3b2b2b" stroke={color} strokeWidth={2.2} /><path d="M96 89 L 104 89" stroke={color} strokeWidth={2} /></g>;
    case "visor": return <rect x={66} y={86} width={68} height={14} rx={7} fill={color} opacity={0.9} stroke={INK} strokeWidth={2} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />;
    default: return null;
  }
}

function Neckwear({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "bandana": return <path d="M82 152 L 118 152 L 100 176 Z" fill={color} {...line} />;
    case "headphones": return <g><path d="M74 156 C 80 170 120 170 126 156" fill="none" stroke={INK} strokeWidth={5} /><circle cx={72} cy={156} r={9} fill={color} {...line} /><circle cx={128} cy={156} r={9} fill={color} {...line} /></g>;
    case "chain": return <g><path d="M80 160 C 84 186 116 186 120 160" fill="none" stroke={color} strokeWidth={4} strokeDasharray="1 5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${color})` }} /><circle cx={100} cy={182} r={5} fill={color} {...line} strokeWidth={1.4} /></g>;
    default: return null;
  }
}

export function CharacterArt({ c, size = 160, className, frame = true, title, crop = false }: { c: Character; size?: number; className?: string; frame?: boolean; title?: string; crop?: boolean }) {
  const skin = SKINS.find((s) => s.id === c.skin)?.color ?? SKINS[2].color;
  const hair = HAIR_COLORS.find((h) => h.id === c.hairColor)?.color ?? HAIR_COLORS[0].color;
  const bd = BACKDROPS.find((b) => b.id === c.backdrop) ?? BACKDROPS[0];
  const item = (id: string | null) => (id ? catalogItem(id)?.wear : undefined);
  const top: { style: string; color: string; color2?: string } = item(c.top) ?? { style: "tee", color: "#f5f5f5" };
  const head = item(c.head);
  const eyes = item(c.eyes);
  const neck = item(c.neck);
  const ears = item(c.ears);
  const uid = React.useId().replace(/:/g, "");
  const skinShade = shade(skin, -0.18);
  const hairHidden = head && ["beanie", "bucket", "cowboy", "panama"].includes(head.style);
  return (
    <svg viewBox={crop ? "36 30 128 128" : "0 0 200 240"} width={size} height={crop ? size : (size * 240) / 200} className={cn("block", className)} role="img" aria-label={title ?? "Spielfigur"}>
      <defs>
        <linearGradient id={`bg${uid}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={bd.from} /><stop offset="1" stopColor={bd.to} /></linearGradient>
        <clipPath id={`clip${uid}`}><rect x="0" y="0" width="200" height="240" rx={frame && !crop ? 28 : 0} /></clipPath>
      </defs>
      <g clipPath={`url(#clip${uid})`}>
        {frame && (
          <>
            <rect width="200" height="240" fill={`url(#bg${uid})`} />
            <circle cx="150" cy="70" r="42" fill="#fff3c2" opacity={0.35} />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={0} y={150 + i * 14} width={200} height={5} fill="#ffffff" opacity={0.06} />)}
          </>
        )}
        <g>
          {!hairHidden && <HairBack style={c.hair} color={hair} />}
          <Top style={top.style} color={top.color} color2={top.color2} skin={skin} />
          {/* Hals */}
          <path d="M86 124 L 86 160 C 92 168 108 168 114 160 L 114 124 Z" fill={skin} {...line} />
          <path d="M86 140 C 96 150 106 150 114 140 L 114 128 L 86 128 Z" fill={skinShade} />
          {neck && <Neckwear style={neck.style} color={neck.color} />}
          {/* Kopf */}
          <ellipse cx={66} cy={98} rx={7} ry={11} fill={skin} {...line} />
          <ellipse cx={134} cy={98} rx={7} ry={11} fill={skin} {...line} />
          <path d="M66 86 C 64 50 136 50 134 86 C 134 120 120 142 100 142 C 80 142 66 120 66 86 Z" fill={skin} {...line} />
          <path d="M122 70 C 134 90 132 122 112 138 C 128 128 136 108 134 86 C 134 80 130 74 122 70 Z" fill={skinShade} opacity={0.75} />
          {ears && (ears.style === "hoop" ? <circle cx={66} cy={112} r={5} fill="none" stroke={ears.color} strokeWidth={2.2} /> : <circle cx={66} cy={108} r={2.6} fill={ears.color} />)}
          {/* Gesicht */}
          <path d="M76 84 C 82 79 90 79 95 82 M105 82 C 110 79 118 79 124 84" {...line} stroke={shade(hair, -0.2)} strokeWidth={3.4} />
          {!eyes && (
            <g>
              <path d="M78 94 C 82 90 90 90 94 94 C 90 98 82 98 78 94 Z M106 94 C 110 90 118 90 122 94 C 118 98 110 98 106 94 Z" fill="#ffffff" {...line} strokeWidth={1.6} />
              <circle cx={86} cy={94} r={3} fill={INK} /><circle cx={114} cy={94} r={3} fill={INK} />
              <circle cx={87} cy={93} r={1} fill="#ffffff" /><circle cx={115} cy={93} r={1} fill="#ffffff" />
            </g>
          )}
          <path d="M100 98 C 98 108 96 112 100 114 C 102 115 104 114 104 113" fill="none" {...line} strokeWidth={1.8} />
          <path d="M90 124 C 96 128 104 128 110 124" fill="none" {...line} strokeWidth={2} />
          <Facial kind={c.facial} color={shade(hair, -0.05)} />
          {!hairHidden && <HairFront style={c.hair} color={hair} />}
          {eyes && <Eyewear style={eyes.style} color={eyes.color} />}
          {head && <Headwear style={head.style} color={head.color} color2={head.color2} />}
        </g>
      </g>
      {frame && !crop && <rect x="1" y="1" width="198" height="238" rx="27" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />}
    </svg>
  );
}

/** Runder Kopf-Ausschnitt für Header, Ranglisten usw. */
export function CharacterBadge({ c, size = 40, className }: { c: Character; size?: number; className?: string }) {
  return (
    <span className={cn("inline-block shrink-0 overflow-hidden rounded-full ring-2 ring-white/25", className)} style={{ width: size, height: size }}>
      <CharacterArt c={c} size={size} crop />
    </span>
  );
}
