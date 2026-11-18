import * as React from "react";

/**
 * Isometrische Zeichnungen für die Spielwelt.
 * Alles wird im Raster gedacht (1 Feld = 1 Einheit) und mit einer klassischen
 * 2:1-Isometrie auf den Bildschirm gebracht. Jede Zeichnung beginnt bei (0,0)
 * ihrer Grundfläche w × d und wird vom Aufrufer verschoben.
 */

export const TW = 64;
export const TH = 32;
/** Höhe in Pixeln pro Einheit */
const ZU = 34;

export function iso(gx: number, gy: number, z = 0): [number, number] {
  return [((gx - gy) * TW) / 2, ((gx + gy) * TH) / 2 - z * ZU];
}
const pts = (list: [number, number][]) => list.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

function hexToRgb(h: string): [number, number, number] {
  const n = h.replace("#", "");
  const v = n.length === 3 ? n.split("").map((c) => c + c).join("") : n;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}
/** aufhellen (amt > 0) oder abdunkeln (amt < 0) */
export function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex);
  const f = (c: number) => Math.round(amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

interface BoxProps {
  x: number; y: number; w: number; d: number; h: number; z?: number;
  color: string; top?: string; stroke?: boolean; opacity?: number;
}
/** Quader mit drei sichtbaren Flächen */
export function Box({ x, y, w, d, h, z = 0, color, top, stroke = true, opacity }: BoxProps) {
  const T = z + h;
  const topF = pts([iso(x, y, T), iso(x + w, y, T), iso(x + w, y + d, T), iso(x, y + d, T)]);
  const right = pts([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, T), iso(x + w, y, T)]);
  const left = pts([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, T), iso(x, y + d, T)]);
  const sw = stroke ? { stroke: "rgba(20,10,30,0.35)", strokeWidth: 0.8, strokeLinejoin: "round" as const } : {};
  return (
    <g opacity={opacity}>
      <polygon points={left} fill={shade(color, -0.12)} {...sw} />
      <polygon points={right} fill={shade(color, -0.32)} {...sw} />
      <polygon points={topF} fill={top ?? shade(color, 0.12)} {...sw} />
    </g>
  );
}

/** Rechteck auf der linken (vorderen) Fläche y = yf, von x0..x1 und z0..z1 */
function LeftRect({ yf, x0, x1, z0, z1, fill, opacity }: { yf: number; x0: number; x1: number; z0: number; z1: number; fill: string; opacity?: number }) {
  return <polygon points={pts([iso(x0, yf, z0), iso(x1, yf, z0), iso(x1, yf, z1), iso(x0, yf, z1)])} fill={fill} opacity={opacity} />;
}
function RightRect({ xf, y0, y1, z0, z1, fill, opacity }: { xf: number; y0: number; y1: number; z0: number; z1: number; fill: string; opacity?: number }) {
  return <polygon points={pts([iso(xf, y0, z0), iso(xf, y1, z0), iso(xf, y1, z1), iso(xf, y0, z1)])} fill={fill} opacity={opacity} />;
}

/** Satteldach entlang der x-Achse */
function GableRoof({ x, y, w, d, z, h, color }: { x: number; y: number; w: number; d: number; z: number; h: number; color: string }) {
  const m = y + d / 2;
  const front = pts([iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, m, z + h), iso(x, m, z + h)]);
  const back = pts([iso(x, y, z), iso(x + w, y, z), iso(x + w, m, z + h), iso(x, m, z + h)]);
  const gable = pts([iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, m, z + h)]);
  return (
    <g stroke="rgba(20,10,30,0.35)" strokeWidth={0.8} strokeLinejoin="round">
      <polygon points={back} fill={shade(color, 0.1)} />
      <polygon points={gable} fill={shade(color, -0.35)} />
      <polygon points={front} fill={shade(color, -0.05)} />
    </g>
  );
}

function windowsLeft(yf: number, x0: number, x1: number, z0: number, z1: number, n: number, glass = "#9fe8ff", rows = 1) {
  const out: React.ReactNode[] = [];
  const gap = (x1 - x0) / n;
  const rh = (z1 - z0) / rows;
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < n; i++)
      out.push(<LeftRect key={`${r}-${i}`} yf={yf} x0={x0 + i * gap + gap * 0.18} x1={x0 + (i + 1) * gap - gap * 0.18} z0={z0 + r * rh + rh * 0.2} z1={z0 + (r + 1) * rh - rh * 0.15} fill={glass} opacity={0.85} />);
  return out;
}
function windowsRight(xf: number, y0: number, y1: number, z0: number, z1: number, n: number, glass = "#7cc7e6", rows = 1) {
  const out: React.ReactNode[] = [];
  const gap = (y1 - y0) / n;
  const rh = (z1 - z0) / rows;
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < n; i++)
      out.push(<RightRect key={`${r}-${i}`} xf={xf} y0={y0 + i * gap + gap * 0.18} y1={y0 + (i + 1) * gap - gap * 0.18} z0={z0 + r * rh + rh * 0.2} z1={z0 + (r + 1) * rh - rh * 0.15} fill={glass} opacity={0.75} />);
  return out;
}

function Shadow({ w, d, s = 0.9 }: { w: number; d: number; s?: number }) {
  const [cx, cy] = iso(w / 2, d / 2);
  return <ellipse cx={cx} cy={cy} rx={((w + d) * TW * s) / 4.2} ry={((w + d) * TH * s) / 4.2} fill="rgba(10,5,20,0.28)" />;
}

function Wheel({ gx, gy }: { gx: number; gy: number }) {
  const [cx, cy] = iso(gx, gy, 0.12);
  return <ellipse cx={cx} cy={cy} rx={4.6} ry={4.2} fill="#16141c" stroke="#55505e" strokeWidth={1.2} />;
}

/** Fahrzeug entlang der x-Achse */
function Vehicle({ w, color, cabin = 0.45, h = 0.32, roof = true, len = 0.85, tall = false, accent }: { w: number; color: string; cabin?: number; h?: number; roof?: boolean; len?: number; tall?: boolean; accent?: string }) {
  const x0 = (w * (1 - len)) / 2;
  const x1 = w - x0;
  const y0 = 0.22;
  const y1 = 0.78;
  const bodyH = tall ? h * 1.6 : h;
  const cx0 = x0 + (x1 - x0) * (0.5 - cabin / 2) - 0.05;
  const cx1 = cx0 + (x1 - x0) * cabin;
  return (
    <g>
      <Shadow w={w} d={1} s={0.75} />
      <Wheel gx={x0 + 0.3} gy={y1} />
      <Wheel gx={x1 - 0.3} gy={y1} />
      <Box x={x0} y={y0} w={x1 - x0} d={y1 - y0} h={bodyH} z={0.12} color={color} />
      {accent && <LeftRect yf={y1} x0={x0} x1={x1} z0={0.12 + bodyH * 0.45} z1={0.12 + bodyH * 0.6} fill={accent} />}
      {roof ? (
        <>
          <Box x={cx0} y={y0 + 0.05} w={cx1 - cx0} d={y1 - y0 - 0.1} h={0.26} z={0.12 + bodyH} color={shade(color, -0.05)} />
          <LeftRect yf={y1 - 0.05} x0={cx0 + 0.06} x1={cx1 - 0.06} z0={0.16 + bodyH} z1={0.34 + bodyH} fill="#2a3a52" />
          <RightRect xf={cx1} y0={y0 + 0.1} y1={y1 - 0.1} z0={0.16 + bodyH} z1={0.34 + bodyH} fill="#3d5878" />
        </>
      ) : (
        <>
          <Box x={cx0} y={y0 + 0.08} w={(cx1 - cx0) * 0.5} d={y1 - y0 - 0.16} h={0.12} z={0.12 + bodyH} color="#2a2a33" />
          <polygon points={pts([iso(cx1 - 0.05, y0 + 0.08, 0.12 + bodyH), iso(cx1 - 0.05, y1 - 0.08, 0.12 + bodyH), iso(cx1 - 0.15, y1 - 0.08, 0.36 + bodyH), iso(cx1 - 0.15, y0 + 0.08, 0.36 + bodyH)])} fill="#9fe8ff" opacity={0.6} />
        </>
      )}
      {/* Scheinwerfer */}
      <RightRect xf={x1} y0={y0 + 0.08} y1={y0 + 0.2} z0={0.2} z1={0.3} fill="#fff7c2" />
      <RightRect xf={x1} y0={y1 - 0.2} y1={y1 - 0.08} z0={0.2} z1={0.3} fill="#fff7c2" />
    </g>
  );
}

function Palm({ color = "#2f9e5b", neon = false }: { color?: string; neon?: boolean }) {
  const [bx, by] = iso(0.5, 0.5);
  const top = by - 58;
  const leaf = (rot: number, len: number) => (
    <path key={rot} d={`M0 0 Q ${len * 0.5} ${-12} ${len} 6 Q ${len * 0.5} ${-2} 0 0`} fill={neon ? "none" : color} stroke={neon ? color : shade(color, -0.3)} strokeWidth={neon ? 2.4 : 0.8} transform={`rotate(${rot})`} style={neon ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined} />
  );
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={14} ry={7} fill="rgba(10,5,20,0.25)" />
      <path d={`M${bx - 2} ${by} Q ${bx + 8} ${by - 30} ${bx + 4} ${top}`} stroke={neon ? color : "#8a6a45"} strokeWidth={neon ? 3 : 5} fill="none" strokeLinecap="round" style={neon ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined} />
      <g transform={`translate(${bx + 4} ${top})`}>
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-3;4;-3" dur="4.8s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
          {[-160, -120, -60, -20, 20, 200].map((r, i) => leaf(r, 24 + (i % 2) * 4))}
          {!neon && <circle cx={0} cy={2} r={3.4} fill="#6b4a2a" />}
        </g>
      </g>
    </g>
  );
}

function Flat({ w, d, fill, inset = 0, z = 0.02 }: { w: number; d: number; fill: string; inset?: number; z?: number }) {
  return <polygon points={pts([iso(inset, inset, z), iso(w - inset, inset, z), iso(w - inset, d - inset, z), iso(inset, d - inset, z)])} fill={fill} />;
}

function Pole({ gx, gy, h, color = "#3a3540", width = 2 }: { gx: number; gy: number; h: number; color?: string; width?: number }) {
  const [x1, y1] = iso(gx, gy, 0);
  const [, y2] = iso(gx, gy, h);
  return <line x1={x1} y1={y1} x2={x1} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

/** Zeichnet einen Gegenstand; w/d = Grundfläche */
export function Art({ art, w, d, color = "#ff7a45", color2 = "#35e0ff", night = false }: { art: string; w: number; d: number; color?: string; color2?: string; night?: boolean }) {
  const glass = night ? "#ffd56b" : "#9fe8ff";
  switch (art) {
    // ---------- Fahrzeuge ----------
    case "car": return <Vehicle w={w} color={color} cabin={0.5} />;
    case "cabrio": return <Vehicle w={w} color={color} roof={false} />;
    case "sport": return <Vehicle w={w} color={color} cabin={0.36} h={0.24} accent="#1d1d24" />;
    case "hyper": return <Vehicle w={w} color={color} cabin={0.32} h={0.2} len={0.92} accent={night ? color : "#ffffff"} />;
    case "muscle": return <Vehicle w={w} color={color} cabin={0.38} h={0.3} accent="#1d1d24" />;
    case "suv": return <Vehicle w={w} color={color} cabin={0.62} h={0.36} tall />;
    case "limo": return <Vehicle w={w} color={color} cabin={0.7} h={0.3} len={0.94} />;
    case "pickup": return (
      <g>
        <Vehicle w={w} color={color} cabin={0.3} h={0.34} />
        <Box x={0.25} y={0.27} w={0.7} d={0.46} h={0.08} z={0.46} color={shade(color, -0.2)} />
      </g>
    );
    case "truck": return (
      <g>
        <Shadow w={w} d={1} s={0.8} />
        <Wheel gx={0.45} gy={0.8} /><Wheel gx={1.6} gy={0.8} />
        <Box x={0.12} y={0.18} w={1.76} d={0.64} h={0.95} z={0.12} color={color} />
        <LeftRect yf={0.82} x0={0.35} x1={1.35} z0={0.55} z1={0.85} fill="#2a1a12" />
        <LeftRect yf={0.82} x0={0.35} x1={1.35} z0={0.85} z1={0.95} fill={color2} />
        <RightRect xf={1.88} y0={0.25} y1={0.75} z0={0.65} z1={0.95} fill="#3d5878" />
      </g>
    );
    case "cart": return (
      <g>
        <Shadow w={w} d={1} s={0.7} />
        <Wheel gx={0.5} gy={0.75} /><Wheel gx={1.5} gy={0.75} />
        <Box x={0.3} y={0.25} w={1.4} d={0.5} h={0.22} z={0.12} color={color} />
        {[0.38, 1.6].map((gx) => <Pole key={gx} gx={gx} gy={0.72} h={0.95} color="#9a9aa6" />)}
        <Box x={0.3} y={0.22} w={1.4} d={0.56} h={0.06} z={1.0} color="#2fa9d6" />
      </g>
    );
    case "bike": case "scooter": case "moto": {
      const [a, b] = iso(0.25, 0.5, 0.15);
      const [c, e] = iso(0.75, 0.5, 0.15);
      return (
        <g>
          <ellipse cx={(a + c) / 2} cy={(b + e) / 2 + 4} rx={14} ry={5} fill="rgba(10,5,20,0.25)" />
          <circle cx={a} cy={b} r={5} fill="none" stroke="#16141c" strokeWidth={2.4} />
          <circle cx={c} cy={e} r={5} fill="none" stroke="#16141c" strokeWidth={2.4} />
          {art === "bike" ? (
            <path d={`M${a} ${b} L${(a + c) / 2} ${b - 7} L${c} ${e} M${(a + c) / 2} ${b - 7} L${c - 2} ${e - 11}`} stroke={color} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          ) : (
            <path d={`M${a - 3} ${b - 2} Q ${(a + c) / 2} ${b - 14} ${c + 1} ${e - 3} L ${c - 1} ${e - 13}`} stroke={color} strokeWidth={art === "moto" ? 7 : 6} fill="none" strokeLinecap="round" />
          )}
        </g>
      );
    }
    // ---------- Gebäude ----------
    case "trailer": return (
      <g>
        <Shadow w={w} d={d} s={0.8} />
        <Box x={0.1} y={0.15} w={1.8} d={0.7} h={0.85} z={0.12} color={color} />
        <LeftRect yf={0.85} x0={0.1} x1={1.9} z0={0.45} z1={0.55} fill={color2} />
        {windowsLeft(0.85, 0.3, 1.2, 0.55, 0.85, 2, glass)}
        <LeftRect yf={0.85} x0={1.35} x1={1.65} z0={0.14} z1={0.8} fill={shade(color, -0.3)} />
        <Wheel gx={0.9} gy={0.85} />
      </g>
    );
    case "hut": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.12} y={0.12} w={0.76} d={0.76} h={0.9} color={color} />
        {[0.2, 0.36, 0.52, 0.68].map((x, i) => <LeftRect key={x} yf={0.88} x0={x} x1={x + 0.08} z0={0.02} z1={0.9} fill={i % 2 ? color2 : "#ffffff"} opacity={0.55} />)}
        <GableRoof x={0.05} y={0.05} w={0.9} d={0.9} z={0.9} h={0.45} color={color2} />
      </g>
    );
    case "motel": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.1} y={0.25} w={w - 0.2} d={d - 0.5} h={1.3} color={color} />
        {windowsLeft(d - 0.25, 0.25, w - 0.25, 0.1, 1.2, 5, glass, 2)}
        <Box x={0.05} y={0.2} w={w - 0.1} d={d - 0.4} h={0.12} z={1.3} color={color2} />
        <Pole gx={w - 0.2} gy={d - 0.05} h={2.4} color="#2a2a33" width={2.5} />
        <Box x={w - 0.55} y={d - 0.12} w={0.7} d={0.1} h={0.45} z={1.9} color={color2} top={shade(color2, 0.3)} />
      </g>
    );
    case "bungalow": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.15} y={0.15} w={w - 0.3} d={d - 0.3} h={0.9} color={color} />
        {windowsLeft(d - 0.15, 0.3, w - 0.6, 0.25, 0.75, 2, glass)}
        <LeftRect yf={d - 0.15} x0={w - 0.65} x1={w - 0.35} z0={0.02} z1={0.7} fill={color2} />
        {windowsRight(w - 0.15, 0.4, d - 0.4, 0.25, 0.75, 1, glass)}
        <GableRoof x={0.05} y={0.05} w={w - 0.1} d={d - 0.1} z={0.9} h={0.6} color="#c86b3c" />
      </g>
    );
    case "garage": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.1} y={0.1} w={w - 0.2} d={d - 0.2} h={1.0} color={color} />
        {[0, 1, 2, 3, 4].map((i) => <LeftRect key={i} yf={d - 0.1} x0={0.3} x1={w - 0.3} z0={0.05 + i * 0.15} z1={0.12 + i * 0.15} fill={shade(color, -0.25)} />)}
        <Box x={0.05} y={0.05} w={w - 0.1} d={d - 0.1} h={0.1} z={1.0} color={color2} />
      </g>
    );
    case "shop": case "diner": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.12} y={0.2} w={w - 0.24} d={d - 0.4} h={1.05} color={color} />
        <LeftRect yf={d - 0.2} x0={0.25} x1={w - 0.25} z0={0.1} z1={0.75} fill={glass} opacity={0.8} />
        <LeftRect yf={d - 0.2} x0={0.12} x1={w - 0.12} z0={0.78} z1={0.98} fill={color2} />
        {art === "diner" && <Box x={0.12} y={0.2} w={w - 0.24} d={d - 0.4} h={0.14} z={1.05} color={color2} />}
        {art === "shop" && <Box x={w / 2 - 0.1} y={d - 0.28} w={0.18} d={0.06} h={1.0} z={1.05} color="#ffb347" />}
      </g>
    );
    case "club": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.1} y={0.1} w={w - 0.2} d={d - 0.2} h={1.6} color={color} />
        <LeftRect yf={d - 0.1} x0={0.3} x1={w - 0.3} z0={1.2} z1={1.45} fill={color2} />
        <LeftRect yf={d - 0.1} x0={w / 2 - 0.3} x1={w / 2 + 0.3} z0={0.02} z1={0.75} fill="#120a1e" />
        {[0.5, 1.5, 2.3].map((y) => <RightRect key={y} xf={w - 0.1} y0={y} y1={y + 0.08} z0={0.2} z1={1.5} fill={color2} opacity={night ? 1 : 0.7} />)}
        {night && <ellipse cx={iso(w / 2, d)[0]} cy={iso(w / 2, d)[1]} rx={50} ry={20} fill={color2} opacity={0.18} />}
      </g>
    );
    case "gas": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.2} y={0.15} w={1.1} d={d - 0.3} h={1.0} color={color} />
        <LeftRect yf={d - 0.15} x0={0.3} x1={1.2} z0={0.1} z1={0.75} fill={glass} />
        {[1.7, 2.6].map((gx) => <Box key={gx} x={gx} y={0.8} w={0.18} d={0.3} h={0.6} color={color2} />)}
        {[1.5, 2.85].map((gx) => <Pole key={gx} gx={gx} gy={1.6} h={1.5} color="#cfcfd6" />)}
        <Box x={1.4} y={0.4} w={1.55} d={1.3} h={0.12} z={1.5} color="#f5f5f5" top={shade(color2, 0.1)} />
      </g>
    );
    case "villa": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.15} y={0.15} w={w - 0.3} d={d - 0.3} h={1.0} color={color} />
        {windowsLeft(d - 0.15, 0.3, w - 0.3, 0.15, 0.9, 4, glass)}
        {windowsRight(w - 0.15, 0.3, d - 0.3, 0.15, 0.9, 3, glass)}
        <Box x={0.15} y={0.15} w={1.8} d={d - 0.6} h={0.85} z={1.0} color={color} />
        {windowsLeft(d - 0.45, 0.3, 1.8, 1.15, 1.75, 2, glass)}
        <Box x={0.1} y={0.1} w={1.9} d={d - 0.5} h={0.08} z={1.85} color={color2} />
        <Box x={2.05} y={0.15} w={w - 2.2} d={d - 0.3} h={0.05} z={1.0} color="#d8cfc0" />
      </g>
    );
    case "glass": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.2} y={0.2} w={w - 0.4} d={d - 0.4} h={0.12} color="#e8e2d0" />
        <Box x={0.3} y={0.3} w={w - 0.6} d={d - 0.6} h={0.95} z={0.12} color="#bfe6ff" opacity={0.85} />
        <Box x={0.2} y={0.2} w={w - 0.4} d={d - 0.4} h={0.1} z={1.07} color={color2} />
        <Box x={1.2} y={0.4} w={w - 1.6} d={d - 1.2} h={0.85} z={1.17} color="#bfe6ff" opacity={0.85} />
        <Box x={1.1} y={0.3} w={w - 1.4} d={d - 1.0} h={0.08} z={2.02} color={color2} />
      </g>
    );
    case "hotel": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.1} y={0.2} w={w - 0.2} d={d - 0.4} h={2.2} color={color} />
        {windowsLeft(d - 0.2, 0.25, w - 0.25, 0.3, 2.0, 6, glass, 3)}
        <LeftRect yf={d - 0.2} x0={w / 2 - 0.08} x1={w / 2 + 0.08} z0={0} z1={2.2} fill={color2} />
        <Box x={w / 2 - 0.5} y={0.4} w={1} d={d - 0.8} h={0.5} z={2.2} color={color} />
        <Box x={w / 2 - 0.55} y={d - 0.45} w={1.1} d={0.06} h={0.3} z={2.3} color={color2} top={shade(color2, 0.3)} />
      </g>
    );
    case "lighthouse": return (
      <g>
        <Shadow w={1} d={1} />
        <Box x={0.2} y={0.2} w={0.6} d={0.6} h={0.5} color="#d8cfc0" />
        {[0, 1, 2, 3].map((i) => <Box key={i} x={0.28} y={0.28} w={0.44} d={0.44} h={0.5} z={0.5 + i * 0.5} color={i % 2 ? color2 : color} />)}
        <Box x={0.24} y={0.24} w={0.52} d={0.52} h={0.35} z={2.5} color="#ffe58a" opacity={0.9} />
        <Box x={0.2} y={0.2} w={0.6} d={0.6} h={0.1} z={2.85} color="#2a2a33" />
        {night && <ellipse cx={iso(0.5, 0.5, 2.67)[0]} cy={iso(0.5, 0.5, 2.67)[1]} rx={30} ry={14} fill="#ffe58a" opacity={0.3} />}
      </g>
    );
    case "helipad": return (
      <g>
        <Box x={0} y={0} w={w} d={d} h={0.15} color={color} />
        <Flat w={w} d={d} fill="none" />
        {(() => { const [cx, cy] = iso(w / 2, d / 2, 0.15); return (<g><ellipse cx={cx} cy={cy} rx={44} ry={22} fill="none" stroke="#f2c14e" strokeWidth={2.5} /><text x={cx} y={cy + 6} textAnchor="middle" fontWeight={900} fontSize={18} fill="#ffffff" transform={`matrix(1,0,0,0.6,0,${cy * 0.4})`}>H</text></g>); })()}
      </g>
    );
    case "tower": return (
      <g>
        <Shadow w={w} d={d} />
        <Box x={0.2} y={0.2} w={w - 0.4} d={d - 0.4} h={6} color={color} />
        {windowsLeft(d - 0.2, 0.3, w - 0.3, 0.2, 5.8, 3, night ? "#ffd56b" : "#e6f6ff", 10)}
        {windowsRight(w - 0.2, 0.3, d - 0.3, 0.2, 5.8, 3, night ? "#ffcf5a" : "#cdeeff", 10)}
        <Box x={0.6} y={0.6} w={w - 1.2} d={d - 1.2} h={0.6} z={6} color={shade(color, -0.1)} />
        <Pole gx={w / 2} gy={d / 2} h={7.4} color={color2} width={2} />
      </g>
    );
    // ---------- Boden ----------
    case "lawn": return <g><Flat w={1} d={1} fill={color} inset={0.02} /><Flat w={1} d={1} fill="url(#lawn-tex)" inset={0.02} z={0.021} /></g>;
    case "path": return <g><Flat w={1} d={1} fill={color} inset={0.03} />{[[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([a, b]) => { const [cx, cy] = iso(a, b, 0.03); return <ellipse key={`${a}${b}`} cx={cx} cy={cy} rx={12} ry={6} fill={shade(color, -0.08)} />; })}</g>;
    case "court": return (
      <g>
        <Flat w={w} d={d} fill={color} />
        <polygon points={pts([iso(0.3, 0.3, 0.03), iso(w - 0.3, 0.3, 0.03), iso(w - 0.3, d - 0.3, 0.03), iso(0.3, d - 0.3, 0.03)])} fill="none" stroke="#ffffff" strokeWidth={1.6} />
        <Box x={w / 2 - 0.03} y={0.25} w={0.06} d={d - 0.5} h={0.3} color="#f5f5f5" opacity={0.85} />
      </g>
    );
    case "pool": return (
      <g>
        <Box x={0} y={0} w={w} d={d} h={0.12} color="#e8e2d0" />
        <polygon className="water" points={pts([iso(0.2, 0.2, 0.12), iso(w - 0.2, 0.2, 0.12), iso(w - 0.2, d - 0.2, 0.12), iso(0.2, d - 0.2, 0.12)])} fill={color} />
        <polygon points={pts([iso(0.35, 0.35, 0.125), iso(w * 0.6, 0.35, 0.125), iso(w * 0.45, d * 0.5, 0.125)])} fill="#ffffff" opacity={0.25} className="shimmer-soft" />
      </g>
    );
    case "jacuzzi": { const [cx, cy] = iso(0.5, 0.5, 0.3); return (<g><Box x={0.08} y={0.08} w={0.84} d={0.84} h={0.3} color="#d8cfc0" /><ellipse cx={cx} cy={cy} rx={20} ry={10} fill={color} className="water" />{[0, 1, 2].map((i) => <circle key={i} className="bubble" style={{ animationDelay: `${i * 0.6}s` }} cx={cx - 8 + i * 8} cy={cy} r={1.6} fill="#ffffff" opacity={0.8} />)}</g>); }
    case "fountain": { const [cx, cy] = iso(w / 2, d / 2, 0.25); return (<g><Box x={0.15} y={0.15} w={w - 0.3} d={d - 0.3} h={0.25} color={color} /><ellipse cx={cx} cy={cy} rx={40} ry={20} fill="#35e0ff" className="water" /><Box x={w / 2 - 0.12} y={d / 2 - 0.12} w={0.24} d={0.24} h={0.8} z={0.25} color={color} /><path className="spray" d={`M${cx} ${cy - 30} q -10 -14 -20 6 M${cx} ${cy - 30} q 10 -14 20 6`} stroke="#bff3ff" strokeWidth={2} fill="none" /></g>); }
    // ---------- Pflanzen & Deko ----------
    case "palm": return <Palm color={color} neon={color === "#35e0ff"} />;
    case "hedge": return <Box x={0.08} y={0.08} w={0.84} d={0.84} h={0.45} color={color} />;
    case "fence": return <g>{[0.1, 0.5, 0.9].map((gx) => <Box key={gx} x={gx - 0.04} y={0.46} w={0.08} d={0.08} h={0.45} color={color} />)}<Box x={0.06} y={0.47} w={0.88} d={0.06} h={0.07} z={0.3} color={color} /><Box x={0.06} y={0.47} w={0.88} d={0.06} h={0.07} z={0.12} color={color} /></g>;
    case "lounger": return <g><Shadow w={1} d={1} s={0.6} /><Box x={0.15} y={0.35} w={0.7} d={0.3} h={0.12} color="#f5f0e6" /><polygon points={pts([iso(0.15, 0.35, 0.12), iso(0.15, 0.65, 0.12), iso(0.32, 0.65, 0.45), iso(0.32, 0.35, 0.45)])} fill={color} /><Box x={0.32} y={0.37} w={0.5} d={0.26} h={0.03} z={0.12} color={color} /></g>;
    case "umbrella": { const [cx, cy] = iso(0.5, 0.5, 1.2); return (<g><Shadow w={1} d={1} s={0.8} /><Pole gx={0.5} gy={0.5} h={1.2} color="#f5f0e6" /><path d={`M${cx - 26} ${cy + 6} Q ${cx} ${cy - 18} ${cx + 26} ${cy + 6} Z`} fill={color} /><path d={`M${cx - 26} ${cy + 6} Q ${cx - 9} ${cy - 10} ${cx} ${cy - 6} Q ${cx + 9} ${cy - 10} ${cx + 26} ${cy + 6}`} fill="#ffffff" opacity={0.35} /></g>); }
    case "grill": return <g><Shadow w={1} d={1} s={0.5} /><Pole gx={0.4} gy={0.6} h={0.4} /><Pole gx={0.6} gy={0.6} h={0.4} /><Box x={0.3} y={0.35} w={0.4} d={0.3} h={0.18} z={0.4} color={color} />{night && <circle cx={iso(0.5, 0.5, 0.6)[0]} cy={iso(0.5, 0.5, 0.6)[1]} r={6} fill="#ff7a45" opacity={0.5} />}</g>;
    case "fire": { const [cx, cy] = iso(0.5, 0.5, 0.1); return (<g><ellipse cx={cx} cy={cy} rx={20} ry={10} fill="#5a5560" /><g className="flicker"><path d={`M${cx - 8} ${cy} Q ${cx - 6} ${cy - 18} ${cx} ${cy - 26} Q ${cx + 6} ${cy - 16} ${cx + 8} ${cy} Z`} fill="#ff7a45" /><path d={`M${cx - 4} ${cy} Q ${cx - 2} ${cy - 10} ${cx} ${cy - 14} Q ${cx + 3} ${cy - 8} ${cx + 4} ${cy} Z`} fill="#ffe58a" /></g>{night && <circle cx={cx} cy={cy - 8} r={40} fill="#ff7a45" opacity={0.12} />}</g>); }
    case "hammock": { const [a, b] = iso(0.2, 0.5, 0.8); const [c, e] = iso(1.8, 0.5, 0.8); return (<g><Pole gx={0.2} gy={0.5} h={0.95} color="#8a6a45" width={3} /><Pole gx={1.8} gy={0.5} h={0.95} color="#8a6a45" width={3} /><path d={`M${a} ${b} Q ${(a + c) / 2} ${(b + e) / 2 + 20} ${c} ${e}`} stroke={color} strokeWidth={6} fill="none" className="sway-slow" /></g>); }
    case "hoop": { const [cx, cy] = iso(0.5, 0.5, 1.6); return (<g><Shadow w={1} d={1} s={0.4} /><Pole gx={0.5} gy={0.5} h={1.6} color="#3a3540" width={3} /><rect x={cx - 12} y={cy - 18} width={24} height={16} fill="#ffffff" stroke="#c4123f" strokeWidth={1.5} /><ellipse cx={cx} cy={cy + 2} rx={7} ry={3} fill="none" stroke={color} strokeWidth={2} /></g>); }
    case "flamingo": { const [cx, cy] = iso(0.5, 0.5); return (<g><line x1={cx} y1={cy} x2={cx} y2={cy - 14} stroke="#2a2a33" strokeWidth={1.2} /><ellipse cx={cx + 2} cy={cy - 18} rx={8} ry={5} fill={color} /><path d={`M${cx + 7} ${cy - 20} Q ${cx + 12} ${cy - 34} ${cx + 6} ${cy - 34}`} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" /><path d={`M${cx + 6} ${cy - 34} l -5 3`} stroke="#1d1d24" strokeWidth={2.4} strokeLinecap="round" /></g>); }
    case "cactus": { const [cx, cy] = iso(0.5, 0.5); return (<g><ellipse cx={cx} cy={cy} rx={9} ry={4} fill="#c86b3c" /><rect x={cx - 4} y={cy - 28} width={8} height={28} rx={4} fill={color} /><path d={`M${cx - 4} ${cy - 14} h -6 v -8`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" /><path d={`M${cx + 4} ${cy - 18} h 6 v -6`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" /></g>); }
    case "flowers": return <g><Box x={0.1} y={0.1} w={0.8} d={0.8} h={0.15} color="#8a6a45" />{[[0.3, 0.3], [0.6, 0.35], [0.4, 0.65], [0.7, 0.68], [0.5, 0.5]].map(([a, b], i) => { const [cx, cy] = iso(a, b, 0.25); return <circle key={i} cx={cx} cy={cy} r={3.6} fill={i % 2 ? color : "#ffe58a"} />; })}</g>;
    case "lamp": { const [cx, cy] = iso(0.5, 0.5, 1.5); return (<g><Pole gx={0.5} gy={0.5} h={1.5} color="#2a2a33" width={2.5} /><circle cx={cx} cy={cy} r={4.5} fill={night ? "#ffe58a" : "#f5f0e6"} />{night && <circle cx={cx} cy={cy} r={22} fill="#ffe58a" opacity={0.18} />}</g>); }
    case "guitar": { const [cx, cy] = iso(0.5, 0.5); return (<g><ellipse cx={cx} cy={cy} rx={12} ry={5} fill="rgba(10,5,20,0.25)" /><Box x={0.2} y={0.35} w={0.6} d={0.3} h={0.12} color="#1d1d24" /><ellipse cx={cx - 4} cy={cy - 8} rx={7} ry={5} fill={color} /><rect x={cx} y={cy - 10} width={14} height={3} fill="#4a3020" transform={`rotate(-20 ${cx} ${cy - 10})`} /></g>); }
    case "surf": return <g>{[0.25, 0.5, 0.75].map((gx, i) => { const [cx, cy] = iso(gx, 0.5); return <ellipse key={gx} cx={cx} cy={cy - 18} rx={4} ry={18} fill={[color, "#ffb347", "#ff2e88"][i]} stroke="#ffffff" strokeWidth={1} />; })}</g>;
    case "boombox": return <g><Box x={0.25} y={0.38} w={0.5} d={0.24} h={0.28} color={color} /><circle cx={iso(0.36, 0.62, 0.14)[0]} cy={iso(0.36, 0.62, 0.14)[1]} r={3.5} fill="#1d1d24" /><circle cx={iso(0.64, 0.62, 0.14)[0]} cy={iso(0.64, 0.62, 0.14)[1]} r={3.5} fill="#1d1d24" /></g>;
    case "neon": { const [cx, cy] = iso(0.5, 0.5, 0.9); return (<g><Pole gx={0.3} gy={0.5} h={0.7} /><Pole gx={0.7} gy={0.5} h={0.7} /><rect x={cx - 22} y={cy - 9} width={44} height={18} rx={4} fill="#120a1e" stroke={color} strokeWidth={2} /><text x={cx} y={cy + 4.5} textAnchor="middle" fontSize={12} fontWeight={900} fill={color} className="neon-flicker" style={{ filter: `drop-shadow(0 0 3px ${color})` }}>OPEN</text></g>); }
    case "statue": { const [cx, cy] = iso(0.5, 0.5, 0.35); return (<g><Box x={0.2} y={0.2} w={0.6} d={0.6} h={0.35} color="#d8cfc0" /><path d={`M${cx - 5} ${cy} L ${cx - 4} ${cy - 22} Q ${cx} ${cy - 34} ${cx + 4} ${cy - 22} L ${cx + 5} ${cy} Z`} fill={color} /><circle cx={cx} cy={cy - 30} r={4.5} fill={color} /><path d={`M${cx + 4} ${cy - 22} l 8 -10`} stroke={color} strokeWidth={3} strokeLinecap="round" /></g>); }
    case "portara": return <g><Shadow w={w} d={d} s={0.6} /><Box x={0.2} y={0.4} w={0.25} d={0.25} h={1.7} color={color} /><Box x={1.55} y={0.4} w={0.25} d={0.25} h={1.7} color={color} /><Box x={0.1} y={0.35} w={1.8} d={0.35} h={0.3} z={1.7} color={color} /></g>;
    default: return <Box x={0.15} y={0.15} w={w - 0.3} d={d - 0.3} h={0.6} color={color} />;
  }
}

/** Boote am Steg (Seitenansicht, schaukelnd) */
export function BoatArt({ art, color }: { art: string; color: string }) {
  const hull = (len: number, h: number, c: string) => <path d={`M0 0 L${len} 0 L${len - 10} ${h} L8 ${h} Z`} fill={c} stroke="rgba(20,10,30,0.4)" strokeWidth={1} />;
  switch (art) {
    case "jetski": return <g>{hull(40, 10, color)}<rect x={14} y={-8} width={12} height={8} rx={3} fill="#1d1d24" /></g>;
    case "sail": return <g>{hull(70, 14, color)}<line x1={32} y1={0} x2={32} y2={-70} stroke="#8a6a45" strokeWidth={2.5} /><path d="M34 -66 L34 -4 L66 -4 Z" fill="#ffffff" /><path d="M30 -60 L30 -4 L8 -4 Z" fill="#ffe5d0" /></g>;
    case "speed": return <g>{hull(80, 14, color)}<path d="M28 0 L44 -14 L64 -14 L70 0 Z" fill="#9fe8ff" opacity={0.85} /><rect x={6} y={4} width={60} height={3} fill="#ffffff" /></g>;
    case "yacht": return <g>{hull(150, 22, color)}<rect x={30} y={-20} width={90} height={20} rx={4} fill="#f5f5f5" /><rect x={36} y={-14} width={78} height={7} fill="#2a3a52" /><rect x={50} y={-36} width={56} height={16} rx={4} fill="#ffffff" /><rect x={56} y={-31} width={44} height={6} fill="#2a3a52" /><line x1={80} y1={-36} x2={80} y2={-56} stroke="#cfcfd6" strokeWidth={2} /></g>;
    default: return hull(50, 12, color);
  }
}
