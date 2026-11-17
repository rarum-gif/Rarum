// =====================================================================
// Szenen-Generator für die Bildwelten (Sunset Coast Design)
// Erzeugt filmische SVG-Kompositionen (Sonnenuntergänge, Palmen, Skylines,
// Meer, Nachtlichter). Das Skript scripts/generate-assets.ts rendert sie
// als WebP nach public/images/. Keine fremden Bildrechte, keine Markenassets.
// =====================================================================

export const W = 1600;
export const H = 900;

type Rand = () => number;
function rng(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n: number) => n.toFixed(1);

class Svg {
  defs: string[] = [];
  body: string[] = [];
  private id = 0;
  uid(p: string) {
    return `${p}${this.id++}`;
  }
  add(s: string) {
    this.body.push(s);
  }
  def(s: string) {
    this.defs.push(s);
  }
  render() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"><defs>${this.defs.join("")}</defs>${this.body.join("")}</svg>`;
  }
}

function linear(s: Svg, stops: [number, string, number?][], x2 = 0, y2 = 1) {
  const id = s.uid("lg");
  s.def(`<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op ?? 1}"/>`).join("")}</linearGradient>`);
  return `url(#${id})`;
}
function radial(s: Svg, stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5) {
  const id = s.uid("rg");
  s.def(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op ?? 1}"/>`).join("")}</radialGradient>`);
  return `url(#${id})`;
}
function blur(s: Svg, sd: number) {
  const id = s.uid("bl");
  s.def(`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
  return `url(#${id})`;
}

// ---------------------------------------------------------------- Bausteine

function sky(s: Svg, stops: [number, string][]) {
  s.add(`<rect width="${W}" height="${H}" fill="${linear(s, stops)}"/>`);
}

function sun(s: Svg, cx: number, cy: number, r: number, core: string, glow: string, glowR = r * 6) {
  s.add(`<circle cx="${cx}" cy="${cy}" r="${glowR}" fill="${radial(s, [[0, glow, 0.75], [0.25, glow, 0.35], [1, glow, 0]])}"/>`);
  s.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${radial(s, [[0, "#fffbe8"], [0.55, core], [1, core, 0.95]])}"/>`);
}

function stars(s: Svg, r: Rand, n: number, maxY: number, color = "#fff") {
  let out = "";
  for (let i = 0; i < n; i++) out += `<circle cx="${f(r() * W)}" cy="${f(r() * maxY)}" r="${f(r() * 1.4 + 0.3)}" fill="${color}" opacity="${f(0.25 + r() * 0.7)}"/>`;
  s.add(`<g>${out}</g>`);
}

function clouds(s: Svg, r: Rand, n: number, y0: number, y1: number, color: string, opacity: number) {
  const b = blur(s, 14);
  let out = "";
  for (let i = 0; i < n; i++) {
    const cx = r() * W;
    const cy = y0 + r() * (y1 - y0);
    const w = 160 + r() * 380;
    out += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w)}" ry="${f(10 + r() * 22)}" fill="${color}" opacity="${f(opacity * (0.5 + r() * 0.5))}"/>`;
  }
  s.add(`<g filter="${b}">${out}</g>`);
}

function sea(s: Svg, y: number, top: string, bottom: string, sunX: number | null, reflect: string, r: Rand) {
  s.add(`<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${linear(s, [[0, top], [1, bottom]])}"/>`);
  let lines = "";
  for (let i = 0; i < 70; i++) {
    const yy = y + 4 + Math.pow(r(), 1.6) * (H - y);
    const near = (yy - y) / (H - y);
    const cx = sunX != null && r() < 0.65 ? sunX + (r() - 0.5) * (80 + near * 420) : r() * W;
    const w = 20 + r() * (60 + near * 240);
    lines += `<rect x="${f(cx - w / 2)}" y="${f(yy)}" width="${f(w)}" height="${f(1 + near * 3)}" rx="1" fill="${reflect}" opacity="${f(0.15 + r() * 0.5)}"/>`;
  }
  s.add(`<g>${lines}</g>`);
}

function ridge(r: Rand, baseY: number, amp: number, steps: number, sharp = false) {
  let d = `M -40 ${baseY}`;
  let y = baseY;
  for (let i = 1; i <= steps; i++) {
    const x = -40 + ((W + 80) / steps) * i;
    y = baseY - r() * amp * (sharp ? 1.6 : 1) + (y - baseY) * 0.3;
    d += sharp ? ` L ${f(x)} ${f(y)}` : ` Q ${f(x - (W + 80) / steps / 2)} ${f(y - amp * 0.3)} ${f(x)} ${f(y)}`;
  }
  return d + ` L ${W + 40} ${H} L -40 ${H} Z`;
}

/** Skyline mit beleuchteten Fenstern */
function skyline(s: Svg, r: Rand, o: { base: number; x0?: number; x1?: number; minH: number; maxH: number; color: string; window?: string; density?: number; minW?: number; maxW?: number; glowTop?: string }) {
  const x1 = o.x1 ?? W + 20;
  let x = o.x0 ?? -20;
  let bld = "";
  let win = "";
  while (x < x1) {
    const w = (o.minW ?? 40) + r() * ((o.maxW ?? 110) - (o.minW ?? 40));
    const h = o.minH + Math.pow(r(), 1.4) * (o.maxH - o.minH);
    const top = o.base - h;
    bld += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 4)}" fill="${o.color}"/>`;
    const kind = r();
    if (kind < 0.18) bld += `<rect x="${f(x + w * 0.2)}" y="${f(top - 18)}" width="${f(w * 0.6)}" height="20" fill="${o.color}"/>`;
    else if (kind < 0.3) bld += `<rect x="${f(x + w / 2 - 1.5)}" y="${f(top - 60 - r() * 50)}" width="3" height="${f(70 + r() * 40)}" fill="${o.color}"/>`;
    else if (kind < 0.38) bld += `<path d="M ${f(x)} ${f(top)} L ${f(x + w / 2)} ${f(top - w * 0.5)} L ${f(x + w)} ${f(top)} Z" fill="${o.color}"/>`;
    if (o.glowTop && r() < 0.25) bld += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="2.5" fill="${o.glowTop}" opacity="0.9"/>`;
    if (o.window) {
      const cols = Math.max(2, Math.floor(w / 11));
      const rows = Math.floor(h / 15);
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++)
          if (r() < (o.density ?? 0.18)) win += `<rect x="${f(x + 5 + i * ((w - 8) / cols))}" y="${f(top + 8 + j * 15)}" width="4" height="6" fill="${o.window}" opacity="${f(0.45 + r() * 0.55)}"/>`;
    }
    x += w + 2 + r() * 6;
  }
  s.add(`<g>${bld}</g><g>${win}</g>`);
}

/** Art-déco-Gebäude im Ocean-Drive-Stil */
function artDeco(s: Svg, x: number, base: number, w: number, h: number, wall: string, trim: string, neon: string, r: Rand) {
  const top = base - h;
  let g = `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="6" fill="${wall}"/>`;
  g += `<rect x="${x + w * 0.38}" y="${top - h * 0.18}" width="${w * 0.24}" height="${h * 0.2}" rx="4" fill="${wall}"/>`;
  g += `<rect x="${x + w * 0.44}" y="${top - h * 0.3}" width="${w * 0.12}" height="${h * 0.14}" rx="3" fill="${wall}"/>`;
  for (let i = 1; i < 4; i++) g += `<rect x="${x}" y="${top + (h * i) / 4}" width="${w}" height="5" fill="${trim}" opacity="0.8"/>`;
  for (let i = 0; i < 3; i++) g += `<rect x="${x + w * (0.12 + i * 0.32)}" y="${top + 10}" width="${w * 0.12}" height="${h - 20}" rx="3" fill="${trim}" opacity="0.35"/>`;
  const nb = blur(s, 6);
  g += `<rect x="${x + w * 0.46}" y="${top - h * 0.28}" width="${w * 0.08}" height="${h * 0.7}" rx="3" fill="${neon}" filter="${nb}" opacity="0.9"/>`;
  g += `<rect x="${x + w * 0.475}" y="${top - h * 0.27}" width="${w * 0.05}" height="${h * 0.68}" rx="2" fill="#fff4f8" opacity="0.85"/>`;
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 6; i++) if (r() < 0.55) g += `<rect x="${x + 10 + i * ((w - 20) / 6)}" y="${top + 22 + j * (h / 4)}" width="${(w - 20) / 6 - 8}" height="${h / 4 - 34}" rx="2" fill="#ffd59a" opacity="${f(0.25 + r() * 0.55)}"/>`;
  s.add(`<g>${g}</g>`);
}

/** Palmen-Silhouette mit geschwungenem Stamm und Wedeln */
function palm(s: Svg, x: number, base: number, h: number, lean: number, color: string, r: Rand) {
  const topX = x + lean * h;
  const topY = base - h;
  const cx = x + lean * h * 0.15;
  const cy = base - h * 0.55;
  const tw = Math.max(6, h * 0.035);
  // Stamm als gefülltes Band (oben dünner)
  let trunk = `M ${f(x - tw)} ${base} Q ${f(cx - tw * 0.8)} ${f(cy)} ${f(topX - tw * 0.45)} ${f(topY)} L ${f(topX + tw * 0.45)} ${f(topY)} Q ${f(cx + tw * 0.8)} ${f(cy)} ${f(x + tw)} ${base} Z`;
  let g = `<path d="${trunk}" fill="${color}"/>`;
  // Ringe
  for (let i = 1; i < 14; i++) {
    const t = i / 14;
    const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * topX;
    const py = (1 - t) * (1 - t) * base + 2 * (1 - t) * t * cy + t * t * topY;
    g += `<rect x="${f(px - tw * (1 - t * 0.5))}" y="${f(py)}" width="${f(tw * 2 * (1 - t * 0.5))}" height="1.6" fill="#000" opacity="0.18"/>`;
  }
  const fronds = 9;
  for (let i = 0; i < fronds; i++) {
    const ang = (-170 + (i / (fronds - 1)) * 160 + (r() - 0.5) * 14) * (Math.PI / 180);
    const len = h * (0.36 + r() * 0.16);
    const ex = topX + Math.cos(ang) * len;
    const ey = topY + Math.sin(ang) * len * 0.55 + len * 0.42;
    const mx = topX + Math.cos(ang) * len * 0.55;
    const my = topY + Math.sin(ang) * len * 0.5 - len * 0.12;
    const wdt = len * 0.12;
    const nx = -Math.sin(ang) * wdt;
    const ny = Math.cos(ang) * wdt;
    g += `<path d="M ${f(topX)} ${f(topY)} Q ${f(mx + nx)} ${f(my + ny)} ${f(ex)} ${f(ey)} Q ${f(mx - nx)} ${f(my - ny)} ${f(topX)} ${f(topY)} Z" fill="${color}"/>`;
    // Fiederung
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const px = (1 - t) * (1 - t) * topX + 2 * (1 - t) * t * mx + t * t * ex;
      const py = (1 - t) * (1 - t) * topY + 2 * (1 - t) * t * my + t * t * ey;
      const l = len * 0.11 * (1 - t * 0.5);
      g += `<path d="M ${f(px)} ${f(py)} l ${f(Math.cos(ang + 1.2) * l)} ${f(Math.sin(ang + 1.2) * l + l * 0.6)} M ${f(px)} ${f(py)} l ${f(Math.cos(ang - 1.2) * l)} ${f(Math.sin(ang - 1.2) * l + l * 0.6)}" stroke="${color}" stroke-width="${f(Math.max(1.5, wdt * 0.35))}" stroke-linecap="round"/>`;
    }
  }
  g += `<circle cx="${f(topX)}" cy="${f(topY + 4)}" r="${f(tw * 1.3)}" fill="${color}"/>`;
  s.add(`<g>${g}</g>`);
}

/** Flache Sportwagen-Silhouette */
function car(s: Svg, x: number, y: number, sc: number, body: string, light: string, tail = "#ff3b5c") {
  const p = (px: number, py: number) => `${f(x + px * sc)} ${f(y + py * sc)}`;
  let g = `<path d="M ${p(0, 0)} L ${p(8, -14)} Q ${p(40, -20)} ${p(70, -34)} L ${p(130, -38)} Q ${p(170, -36)} ${p(195, -18)} L ${p(220, -14)} Q ${p(232, -10)} ${p(232, 0)} Z" fill="${body}"/>`;
  g += `<path d="M ${p(78, -32)} L ${p(128, -35)} Q ${p(160, -33)} ${p(178, -20)} L ${p(90, -20)} Z" fill="#0b0f1e" opacity="0.7"/>`;
  g += `<circle cx="${f(x + 48 * sc)}" cy="${f(y)}" r="${f(13 * sc)}" fill="#07070c"/><circle cx="${f(x + 186 * sc)}" cy="${f(y)}" r="${f(13 * sc)}" fill="#07070c"/>`;
  const b = blur(s, 6);
  g += `<ellipse cx="${f(x + 228 * sc)}" cy="${f(y - 9 * sc)}" rx="${f(30 * sc)}" ry="${f(6 * sc)}" fill="${light}" filter="${b}" opacity="0.9"/>`;
  g += `<rect x="${f(x)}" y="${f(y - 12 * sc)}" width="${f(8 * sc)}" height="${f(4 * sc)}" fill="${tail}"/>`;
  s.add(`<g>${g}</g>`);
}

function lightTrails(s: Svg, y: number, colors: string[], r: Rand) {
  const b = blur(s, 2.5);
  let g = "";
  for (let i = 0; i < 14; i++) {
    const yy = y + i * 4 + r() * 3;
    const c = colors[i % colors.length];
    g += `<path d="M -20 ${f(yy + 18)} C 500 ${f(yy - 6)} 1100 ${f(yy + 10)} ${W + 20} ${f(yy - 10)}" stroke="${c}" stroke-width="${f(1.4 + r() * 2.4)}" fill="none" opacity="${f(0.35 + r() * 0.55)}"/>`;
  }
  s.add(`<g filter="${b}">${g}</g>`);
}

function beams(s: Svg, x: number, y: number, angles: number[], color: string, len = 1100, width = 60) {
  const b = blur(s, 12);
  let g = "";
  for (const a of angles) {
    const rad = (a * Math.PI) / 180;
    const ex = x + Math.cos(rad) * len;
    const ey = y + Math.sin(rad) * len;
    const nx = -Math.sin(rad) * width;
    const ny = Math.cos(rad) * width;
    g += `<path d="M ${x} ${y} L ${f(ex + nx)} ${f(ey + ny)} L ${f(ex - nx)} ${f(ey - ny)} Z" fill="${color}" opacity="0.22"/>`;
  }
  s.add(`<g filter="${b}">${g}</g>`);
}

function crowd(s: Svg, y: number, color: string, r: Rand) {
  let g = "";
  for (let x = -10; x < W + 10; x += 12 + r() * 10) {
    const h = 30 + r() * 26;
    g += `<circle cx="${f(x)}" cy="${f(y - h)}" r="${f(7 + r() * 3)}" fill="${color}"/><rect x="${f(x - 9)}" y="${f(y - h + 6)}" width="18" height="${f(h)}" rx="8" fill="${color}"/>`;
    if (r() < 0.12) g += `<path d="M ${f(x + 6)} ${f(y - h)} L ${f(x + 14)} ${f(y - h - 34)}" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
  }
  s.add(`<g>${g}</g>`);
}

function finish(s: Svg, o: { vignette?: number; grain?: number; tint?: string; tintOpacity?: number } = {}) {
  if (o.tint) s.add(`<rect width="${W}" height="${H}" fill="${o.tint}" opacity="${o.tintOpacity ?? 0.12}" style="mix-blend-mode:soft-light"/>`);
  s.add(`<rect width="${W}" height="${H}" fill="${radial(s, [[0, "#000", 0], [0.65, "#000", 0], [1, "#000", o.vignette ?? 0.55]], 0.5, 0.5, 0.75)}"/>`);
  const id = s.uid("gr");
  s.def(`<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 ${o.grain ?? 0.12} 0"/></filter>`);
  s.add(`<rect width="${W}" height="${H}" filter="url(#${id})"/>`);
}

// ---------------------------------------------------------------- Paletten

const SUNSET_SKY: [number, string][] = [[0, "#1b1440"], [0.28, "#4a1f5c"], [0.5, "#a3346b"], [0.66, "#e8566a"], [0.8, "#ff8a5b"], [0.9, "#ffb877"]];
const NIGHT_SKY: [number, string][] = [[0, "#05071a"], [0.5, "#121a45"], [0.8, "#2b2263"], [1, "#4b2a6e"]];
const DUSK_SKY: [number, string][] = [[0, "#0f1838"], [0.4, "#33306e"], [0.62, "#8a3f7c"], [0.78, "#e0607a"], [0.9, "#ffa178"]];
const DAY_SKY: [number, string][] = [[0, "#2f7fc4"], [0.5, "#69b4e3"], [0.85, "#bfe4f4"], [1, "#f4e7cf"]];

// ---------------------------------------------------------------- Szenen

type Builder = (s: Svg, r: Rand) => void;

const SCENES: Record<string, Builder> = {
  // ---------- Welten ----------
  sunset(s, r) {
    sky(s, SUNSET_SKY);
    stars(s, r, 60, 220, "#ffe9f4");
    clouds(s, r, 14, 260, 480, "#ffb38a", 0.55);
    sun(s, 980, 560, 120, "#ffb15e", "#ff7a59", 600);
    clouds(s, r, 6, 500, 560, "#ff8e6e", 0.5);
    skyline(s, r, { base: 610, x0: 120, x1: 1500, minH: 40, maxH: 260, color: "#3a1640", window: "#ffc98a", density: 0.12, glowTop: "#ff9cb0" });
    sea(s, 606, "#ff8a6b", "#2a1240", 980, "#ffd29a", r);
    palm(s, 140, 900, 640, 0.08, "#140818", r);
    palm(s, 300, 900, 480, -0.12, "#140818", r);
    palm(s, 1480, 900, 600, -0.1, "#140818", r);
    palm(s, 1350, 900, 420, 0.1, "#140818", r);
    finish(s, { vignette: 0.6 });
  },
  oceandrive(s, r) {
    sky(s, [[0, "#26205a"], [0.35, "#7b3a83"], [0.6, "#ee6c7f"], [0.78, "#ffa577"], [0.92, "#ffd59a"]]);
    clouds(s, r, 12, 180, 420, "#ffc0a3", 0.55);
    sun(s, 1180, 470, 80, "#ffc777", "#ff8661", 420);
    artDeco(s, 160, 760, 300, 330, "#f6b7c6", "#ffffff", "#ff4f8b", r);
    artDeco(s, 500, 760, 260, 260, "#9fd8d0", "#f8fff8", "#38d6ff", r);
    artDeco(s, 800, 760, 320, 300, "#ffd0a0", "#fff6ea", "#ff7a3d", r);
    s.add(`<rect x="0" y="752" width="${W}" height="150" fill="${linear(s, [[0, "#2b1736"], [1, "#0d0815"]])}"/>`);
    lightTrails(s, 790, ["#ffd59a", "#ff5c7a", "#ffffff"], r);
    car(s, 980, 860, 1.6, "#0e0b18", "#fff2c8");
    palm(s, 1260, 900, 700, -0.06, "#170b1e", r);
    palm(s, 1450, 900, 560, 0.08, "#170b1e", r);
    palm(s, 60, 900, 560, 0.1, "#170b1e", r);
    finish(s, { vignette: 0.5 });
  },
  downtown(s, r) {
    sky(s, NIGHT_SKY);
    stars(s, r, 120, 400);
    s.add(`<rect x="0" y="420" width="${W}" height="300" fill="${radial(s, [[0, "#ff5c8a", 0.55], [1, "#ff5c8a", 0]], 0.5, 1, 0.6)}"/>`);
    skyline(s, r, { base: 720, minH: 120, maxH: 420, color: "#1a1840", window: "#8fb8ff", density: 0.12, minW: 50, maxW: 130 });
    skyline(s, r, { base: 760, minH: 80, maxH: 520, color: "#0c0b22", window: "#ffd38a", density: 0.22, minW: 70, maxW: 160, glowTop: "#ff5c8a" });
    s.add(`<rect x="0" y="756" width="${W}" height="150" fill="#06050f"/>`);
    lightTrails(s, 790, ["#ff3b5c", "#ffd59a", "#7fd3ff"], r);
    palm(s, 220, 900, 520, 0.08, "#040309", r);
    palm(s, 1400, 900, 600, -0.1, "#040309", r);
    finish(s, { vignette: 0.6 });
  },
  night(s, r) {
    sky(s, [[0, "#04051a"], [0.55, "#0e1846"], [0.85, "#3a1f63"], [1, "#6b2a6b"]]);
    stars(s, r, 200, 520);
    s.add(`<circle cx="1260" cy="190" r="56" fill="#f3efe0"/><circle cx="1240" cy="178" r="56" fill="#0b123a" opacity="0.35"/>`);
    s.add(`<circle cx="1260" cy="190" r="200" fill="${radial(s, [[0, "#c9d6ff", 0.35], [1, "#c9d6ff", 0]])}"/>`);
    skyline(s, r, { base: 650, x0: 400, x1: 1300, minH: 60, maxH: 300, color: "#140f35", window: "#ff9ec4", density: 0.16, glowTop: "#38d6ff" });
    sea(s, 646, "#2a1d5e", "#050414", 860, "#ff9ec4", r);
    const b = blur(s, 10);
    s.add(`<g filter="${b}" opacity="0.85"><circle cx="260" cy="560" r="40" fill="#ff4f8b"/><circle cx="1440" cy="540" r="34" fill="#38d6ff"/></g>`);
    palm(s, 220, 900, 620, 0.1, "#05030c", r);
    palm(s, 1420, 900, 640, -0.12, "#05030c", r);
    palm(s, 1280, 900, 420, 0.06, "#05030c", r);
    finish(s, { vignette: 0.6 });
  },
  coast(s, r) {
    sky(s, DAY_SKY);
    clouds(s, r, 14, 100, 380, "#ffffff", 0.85);
    sun(s, 1300, 150, 60, "#fff8d8", "#fff3c0", 360);
    s.add(`<path d="${ridge(r, 520, 60, 8)}" fill="#5f8fb0" opacity="0.5"/>`);
    sea(s, 520, "#1fb5c9", "#0f6e9e", null, "#ffffff", r);
    s.add(`<path d="M -40 740 Q 400 690 900 720 T ${W + 40} 700 L ${W + 40} ${H} L -40 ${H} Z" fill="#f4e3c1"/>`);
    s.add(`<path d="M -40 735 Q 400 685 900 715 T ${W + 40} 695" stroke="#ffffff" stroke-width="6" fill="none" opacity="0.85"/>`);
    palm(s, 200, 860, 600, 0.12, "#21402f", r);
    palm(s, 360, 880, 440, -0.08, "#21402f", r);
    palm(s, 1420, 860, 560, -0.12, "#21402f", r);
    finish(s, { vignette: 0.35, grain: 0.08 });
  },
  dusk(s, r) {
    sky(s, DUSK_SKY);
    stars(s, r, 80, 300);
    clouds(s, r, 10, 300, 500, "#ff9a8a", 0.45);
    sun(s, 520, 600, 90, "#ffae6b", "#ff6f6a", 480);
    sea(s, 600, "#e7687a", "#1a1438", 520, "#ffd0a0", r);
    // Hafen mit Yachten
    let yachts = "";
    for (let i = 0; i < 6; i++) {
      const x = 760 + i * 130 + r() * 30;
      const sc = 0.7 + r() * 0.5;
      yachts += `<path d="M ${f(x)} ${f(640)} l ${f(110 * sc)} 0 l ${f(-16 * sc)} ${f(18 * sc)} l ${f(-82 * sc)} 0 Z" fill="#1c1029"/><rect x="${f(x + 30 * sc)}" y="${f(626)}" width="${f(46 * sc)}" height="${f(14 * sc)}" rx="3" fill="#1c1029"/><line x1="${f(x + 50 * sc)}" y1="${f(626)}" x2="${f(x + 50 * sc)}" y2="${f(540 - r() * 40)}" stroke="#1c1029" stroke-width="2"/>`;
    }
    s.add(`<g>${yachts}</g>`);
    skyline(s, r, { base: 600, x0: 1100, x1: 1620, minH: 60, maxH: 240, color: "#2a1640", window: "#ffd38a", density: 0.15 });
    palm(s, 120, 900, 560, 0.1, "#120818", r);
    finish(s, { vignette: 0.55 });
  },
  marina(s, r) {
    sky(s, [[0, "#120c2c"], [0.4, "#3b1c55"], [0.7, "#8e3463"], [0.88, "#e65a62"], [1, "#ff9a6a"]]);
    stars(s, r, 90, 340);
    sun(s, 800, 720, 110, "#ff9e5f", "#ff5e66", 520);
    s.add(`<rect x="0" y="0" width="${W}" height="${H}" fill="${linear(s, [[0, "#000", 0], [0.6, "#000", 0], [1, "#000", 0.4]])}"/>`);
    // Penthouse-Terrasse: Geländer und Lounge
    s.add(`<rect x="0" y="700" width="${W}" height="200" fill="#0d0814"/>`);
    let rail = "";
    for (let x = 0; x < W; x += 40) rail += `<rect x="${x}" y="640" width="4" height="62" fill="#1d1226"/>`;
    s.add(`<g>${rail}<rect x="0" y="636" width="${W}" height="6" fill="#ffb27a" opacity="0.55"/></g>`);
    s.add(`<rect x="0" y="700" width="${W}" height="4" fill="#ff6f8b" opacity="0.35"/>`);
    palm(s, 1450, 900, 560, -0.1, "#07040b", r);
    palm(s, 140, 900, 500, 0.12, "#07040b", r);
    finish(s, { vignette: 0.6 });
  },

  // ---------- Themen-Packs ----------
  allgemeinwissen(s, r) {
    sky(s, [[0, "#1d1748"], [0.4, "#6b2f6d"], [0.65, "#e65f6d"], [0.85, "#ffaa6e"]]);
    clouds(s, r, 10, 240, 460, "#ffbf96", 0.5);
    sun(s, 800, 520, 100, "#ffbb66", "#ff7f5e", 520);
    skyline(s, r, { base: 640, minH: 120, maxH: 440, color: "#2c1438", window: "#ffd38a", density: 0.14, minW: 50, maxW: 120, glowTop: "#ff9cb0" });
    sea(s, 636, "#e86f72", "#1c0d2a", 800, "#ffd29a", r);
    palm(s, 1440, 900, 620, -0.1, "#12071a", r);
    palm(s, 160, 900, 520, 0.1, "#12071a", r);
    finish(s);
  },
  sport(s, r) {
    sky(s, [[0, "#142050"], [0.45, "#56307a"], [0.7, "#ef6a6a"], [0.88, "#ffb26b"]]);
    clouds(s, r, 8, 200, 400, "#ffb18e", 0.45);
    sun(s, 1200, 420, 70, "#ffc56f", "#ff8a5e", 380);
    // Stadionschüssel
    s.add(`<path d="M 120 760 Q 800 470 1480 760 L 1480 900 L 120 900 Z" fill="#170d26"/>`);
    s.add(`<path d="M 220 770 Q 800 560 1380 770 Z" fill="#2b1b3c"/>`);
    s.add(`<ellipse cx="800" cy="820" rx="520" ry="70" fill="${linear(s, [[0, "#3e9a5a"], [1, "#1f5a35"]])}"/>`);
    let stripes = "";
    for (let i = -5; i <= 5; i++) stripes += `<rect x="${800 + i * 90 - 22}" y="752" width="44" height="140" fill="#fff" opacity="0.05"/>`;
    s.add(`<g>${stripes}</g><ellipse cx="800" cy="820" rx="520" ry="70" fill="none" stroke="#fff" stroke-opacity="0.5" stroke-width="2"/><line x1="800" y1="750" x2="800" y2="890" stroke="#fff" stroke-opacity="0.45" stroke-width="2"/>`);
    for (const x of [230, 1370]) {
      s.add(`<rect x="${x - 4}" y="380" width="8" height="400" fill="#120a1d"/><rect x="${x - 50}" y="360" width="100" height="34" rx="4" fill="#120a1d"/>`);
      let lamps = "";
      for (let i = 0; i < 5; i++) lamps += `<circle cx="${x - 40 + i * 20}" cy="377" r="6" fill="#fff8de"/>`;
      s.add(`<g>${lamps}</g>`);
      beams(s, x, 380, x < 800 ? [30, 42, 54] : [126, 138, 150], "#fff1c4", 700, 50);
    }
    crowd(s, 900, "#0a0612", r);
    finish(s);
  },
  musik(s, r) {
    sky(s, [[0, "#060418"], [0.5, "#1c0f45"], [0.8, "#4b1a62"], [1, "#a1305e"]]);
    stars(s, r, 140, 420);
    s.add(`<rect x="460" y="430" width="680" height="260" fill="#0f0a1d"/><rect x="430" y="410" width="740" height="28" fill="#1a1330"/>`);
    const b = blur(s, 18);
    s.add(`<rect x="520" y="470" width="560" height="200" fill="#ff4f8b" opacity="0.35" filter="${b}"/>`);
    beams(s, 520, 420, [-120, -100, -80], "#ff5fa5", 900, 40);
    beams(s, 1080, 420, [-100, -80, -60], "#5fd8ff", 900, 40);
    beams(s, 800, 420, [-95, -85], "#ffd27a", 900, 30);
    s.add(`<rect x="770" y="620" width="60" height="70" fill="#130d24"/><rect x="740" y="610" width="120" height="14" rx="3" fill="#1d1533"/>`);
    sea(s, 690, "#3a1650", "#09051a", 800, "#ff7ab0", r);
    crowd(s, 900, "#05030b", r);
    palm(s, 120, 900, 640, 0.12, "#05030b", r);
    palm(s, 1480, 900, 600, -0.12, "#05030b", r);
    finish(s, { vignette: 0.6 });
  },
  geografie(s, r) {
    sky(s, [[0, "#3a6fb8"], [0.5, "#86b9e0"], [0.8, "#ffd2a8"], [1, "#ffb48a"]]);
    clouds(s, r, 12, 120, 360, "#fff4ea", 0.8);
    sun(s, 400, 300, 60, "#fff1c8", "#ffd39a", 380);
    s.add(`<path d="${ridge(r, 470, 220, 9, true)}" fill="#6e7fb3" opacity="0.6"/>`);
    const front = ridge(r, 520, 160, 10, true);
    s.add(`<path d="${front}" fill="#4b5d8f"/>`);
    s.add(`<path d="${front}" fill="none" stroke="#e8f0ff" stroke-width="4" opacity="0.45"/>`);
    sea(s, 560, "#2bb7c8", "#0c5a8a", 400, "#ffffff", r);
    s.add(`<path d="M 980 620 Q 1180 560 1420 610 Q 1350 650 1000 650 Z" fill="#2f7a4c"/><path d="M 990 646 Q 1200 664 1410 640" stroke="#f6e3bd" stroke-width="10" fill="none"/>`);
    palm(s, 1180, 640, 160, -0.1, "#1d3a28", r);
    palm(s, 1260, 640, 130, 0.12, "#1d3a28", r);
    finish(s, { vignette: 0.4, grain: 0.08 });
  },
  geschichte(s, r) {
    sky(s, [[0, "#1c1530"], [0.4, "#5b2f4e"], [0.65, "#c75b4f"], [0.85, "#f2a061"]]);
    clouds(s, r, 16, 160, 520, "#f2a372", 0.55);
    sun(s, 1150, 520, 90, "#ffc17a", "#ff8a55", 440);
    s.add(`<path d="${ridge(r, 690, 60, 8)}" fill="#3a1d2b"/>`);
    // Kolosseum-ähnliche Bogenruine
    let arches = "";
    const x0 = 360;
    for (let row = 0; row < 3; row++)
      for (let i = 0; i < 10; i++) {
        const x = x0 + i * 70;
        const y = 690 - (row + 1) * 90;
        if (row === 2 && (i < 2 || i > 7)) continue;
        arches += `<path d="M ${x} ${y + 90} V ${y + 35} a 25 25 0 0 1 50 0 V ${y + 90} Z" fill="#ffb27a" opacity="0.65"/>`;
      }
    s.add(`<rect x="${x0 - 20}" y="430" width="740" height="262" fill="#2b1520"/><path d="M ${x0 - 20} 430 L ${x0 + 120} 410 L ${x0 + 600} 410 L ${x0 + 720} 430 Z" fill="#2b1520"/><g>${arches}</g>`);
    s.add(`<rect x="0" y="690" width="${W}" height="220" fill="${linear(s, [[0, "#26121c"], [1, "#0c060a"]])}"/>`);
    palm(s, 1420, 900, 480, -0.1, "#0d060a", r);
    finish(s, { vignette: 0.6 });
  },
  wissenschaft(s, r) {
    sky(s, [[0, "#030414"], [0.55, "#0b1640"], [0.85, "#2c2a6a"], [1, "#d06a6f"]]);
    stars(s, r, 260, 620);
    s.add(`<circle cx="1220" cy="220" r="110" fill="${radial(s, [[0, "#c4d4ff"], [0.7, "#5e6fb8"], [1, "#2b3778"]], 0.35, 0.35, 0.7)}"/>`);
    s.add(`<ellipse cx="1220" cy="225" rx="200" ry="34" fill="none" stroke="#e3c7ff" stroke-width="5" opacity="0.6" transform="rotate(-16 1220 225)"/>`);
    // Rakete mit Abgasfahne
    const b = blur(s, 16);
    s.add(`<path d="M 520 760 C 540 600 560 420 640 210" stroke="#ffd7a8" stroke-width="34" fill="none" opacity="0.45" filter="${b}"/>`);
    s.add(`<path d="M 520 760 C 540 600 560 420 640 210" stroke="#fff5e0" stroke-width="6" fill="none" opacity="0.8"/>`);
    s.add(`<g transform="translate(640 200) rotate(22)"><path d="M 0 -60 Q 14 -40 14 0 L 14 40 L -14 40 L -14 0 Q -14 -40 0 -60 Z" fill="#eef1f8"/><path d="M -14 20 L -26 46 L -14 40 Z M 14 20 L 26 46 L 14 40 Z" fill="#ff6f6f"/><circle cx="0" cy="-12" r="5" fill="#38d6ff"/></g>`);
    sea(s, 760, "#3a2a6a", "#060414", 600, "#ffd29a", r);
    skyline(s, r, { base: 764, x0: 900, x1: 1600, minH: 40, maxH: 160, color: "#0d0b26", window: "#7fd3ff", density: 0.2 });
    palm(s, 140, 900, 460, 0.1, "#03020a", r);
    finish(s, { vignette: 0.55 });
  },
  "tiere-pflanzen"(s, r) {
    sky(s, [[0, "#1a3a3c"], [0.45, "#4f7a55"], [0.7, "#e5a35f"], [0.9, "#ffcf8a"]]);
    sun(s, 820, 470, 90, "#ffe0a0", "#ffb86b", 520);
    s.add(`<path d="${ridge(r, 600, 80, 9)}" fill="#2c5a3f" opacity="0.7"/>`);
    sea(s, 640, "#6fb6a6", "#173f3c", 820, "#fff1c8", r);
    // Flamingos
    let fl = "";
    for (let i = 0; i < 5; i++) {
      const x = 900 + i * 70 + r() * 20;
      const y = 690 + r() * 30;
      fl += `<ellipse cx="${x}" cy="${y}" rx="22" ry="12" fill="#ff8aa4"/><path d="M ${x + 14} ${y - 4} q 18 -20 4 -44 q -4 -8 6 -10" stroke="#ff8aa4" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="${x}" y1="${y + 10}" x2="${x}" y2="${y + 56}" stroke="#d06a84" stroke-width="3"/>`;
    }
    s.add(`<g>${fl}</g>`);
    // Dschungelblätter als Rahmen
    const leaf = (cx: number, cy: number, sc: number, rot: number, c: string) =>
      `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sc})"><path d="M 0 0 C 80 -140 260 -150 340 -40 C 260 40 90 60 0 0 Z" fill="${c}"/><path d="M 0 0 C 120 -50 220 -60 330 -40" stroke="#0b2016" stroke-width="5" fill="none" opacity="0.5"/></g>`;
    let leaves = "";
    for (let i = 0; i < 9; i++) leaves += leaf(-40 + r() * 120, 900 - r() * 700, 1 + r() * 0.8, -20 + r() * 60, i % 2 ? "#0e2b1c" : "#123824");
    for (let i = 0; i < 9; i++) leaves += leaf(W + 40 - r() * 120, 900 - r() * 700, 1 + r() * 0.8, 160 + r() * 60, i % 2 ? "#0e2b1c" : "#123824");
    s.add(`<g>${leaves}</g>`);
    finish(s, { vignette: 0.55 });
  },
  "filme-serien"(s, r) {
    sky(s, [[0, "#07061a"], [0.5, "#1e1440"], [0.85, "#5c1f4f"], [1, "#a8355a"]]);
    stars(s, r, 90, 360);
    beams(s, 520, 760, [-110, -80], "#fff2d0", 1100, 45);
    beams(s, 1100, 760, [-105, -70], "#fff2d0", 1100, 45);
    s.add(`<path d="${ridge(r, 600, 120, 8)}" fill="#1c1030"/>`);
    // Kino mit Leuchtreklame
    s.add(`<rect x="560" y="520" width="480" height="260" rx="8" fill="#2a1430"/><rect x="520" y="500" width="560" height="70" rx="10" fill="#3a1a3a"/>`);
    const nb = blur(s, 8);
    s.add(`<rect x="540" y="512" width="520" height="46" rx="8" fill="none" stroke="#ff5f8f" stroke-width="6" filter="${nb}"/><rect x="540" y="512" width="520" height="46" rx="8" fill="none" stroke="#ffd0dd" stroke-width="2"/>`);
    let bulbs = "";
    for (let i = 0; i < 26; i++) bulbs += `<circle cx="${552 + i * 19.5}" cy="580" r="4" fill="#ffe7a8"/>`;
    s.add(`<g>${bulbs}</g><rect x="740" y="620" width="120" height="160" fill="#ffcf8a" opacity="0.8"/>`);
    s.add(`<rect x="0" y="776" width="${W}" height="130" fill="#0a0612"/><path d="M 700 780 L 900 780 L 1020 900 L 580 900 Z" fill="#b1203c"/>`);
    palm(s, 300, 900, 520, 0.08, "#05030a", r);
    palm(s, 1320, 900, 560, -0.1, "#05030a", r);
    finish(s, { vignette: 0.6 });
  },
  gaming(s, r) {
    sky(s, [[0, "#05031a"], [0.5, "#150f45"], [0.85, "#2e1a6b"], [1, "#55308c"]]);
    stars(s, r, 120, 420);
    // Arena-Kuppel
    s.add(`<path d="M 260 760 Q 800 300 1340 760 Z" fill="#120d30"/>`);
    let ribs = "";
    for (let i = 1; i < 10; i++) ribs += `<path d="M ${260 + i * 108} 760 Q 800 ${330 + Math.abs(5 - i) * 30} ${800} 330" stroke="#5fd8ff" stroke-opacity="0.25" stroke-width="2" fill="none"/>`;
    s.add(`<g>${ribs}</g>`);
    const b = blur(s, 20);
    s.add(`<rect x="620" y="560" width="360" height="150" rx="10" fill="#7a5cff" opacity="0.65" filter="${b}"/><rect x="640" y="575" width="320" height="120" rx="8" fill="#1b1550"/><rect x="650" y="585" width="300" height="100" rx="6" fill="${linear(s, [[0, "#ff4f8b"], [1, "#5fd8ff"]], 1, 0)}" opacity="0.85"/>`);
    s.add(`<path d="M 260 760 Q 800 300 1340 760" stroke="#ff4f8b" stroke-width="4" fill="none" opacity="0.7" filter="${blur(s, 4)}"/>`);
    s.add(`<rect x="0" y="756" width="${W}" height="150" fill="#06041a"/>`);
    lightTrails(s, 790, ["#ff4f8b", "#5fd8ff", "#a68bff"], r);
    crowd(s, 905, "#03020c", r);
    finish(s, { vignette: 0.6 });
  },
  "essen-trinken"(s, r) {
    sky(s, [[0, "#2a1a52"], [0.4, "#8a3a73"], [0.65, "#f06f6a"], [0.85, "#ffb46e"]]);
    clouds(s, r, 10, 220, 440, "#ffc49a", 0.5);
    sun(s, 520, 560, 90, "#ffc06a", "#ff8a5c", 460);
    sea(s, 600, "#f08074", "#2a1438", 520, "#ffe0aa", r);
    // Beachclub-Theke
    s.add(`<rect x="0" y="720" width="${W}" height="190" fill="#1a0e1c"/><rect x="0" y="712" width="${W}" height="12" fill="#b8722e"/>`);
    // Cocktailglas mit Schirmchen
    s.add(`<g transform="translate(1040 420)"><path d="M -110 0 L 110 0 L 10 120 L -10 120 Z" fill="#ffffff" opacity="0.18"/><path d="M -92 20 L 92 20 L 8 118 L -8 118 Z" fill="${linear(s, [[0, "#ffb15e"], [1, "#ff4f6b"]])}" opacity="0.9"/><rect x="-5" y="118" width="10" height="160" fill="#fff" opacity="0.35"/><ellipse cx="0" cy="292" rx="70" ry="10" fill="#fff" opacity="0.3"/><circle cx="70" cy="6" r="28" fill="#ffd14f"/><circle cx="70" cy="6" r="20" fill="#ffe680"/><path d="M -40 -110 Q 10 -150 60 -110 Z" fill="#38c6c9"/><line x1="10" y1="-125" x2="-20" y2="40" stroke="#f6e6c8" stroke-width="4"/></g>`);
    palm(s, 160, 900, 620, 0.1, "#140918", r);
    palm(s, 1480, 900, 560, -0.12, "#140918", r);
    finish(s, { vignette: 0.55 });
  },
  literatur(s, r) {
    sky(s, [[0, "#1b0f12"], [1, "#3c2117"]]);
    // Bibliothek mit Bögen und Regalen
    const lamp = radial(s, [[0, "#ffcf8a", 0.9], [0.4, "#ff9a4a", 0.35], [1, "#ff9a4a", 0]]);
    for (let a = 0; a < 3; a++) {
      const x = 140 + a * 460;
      s.add(`<path d="M ${x} 900 V 260 a 200 200 0 0 1 400 0 V 900 Z" fill="#2a1710"/>`);
      let books = "";
      for (let shelf = 0; shelf < 8; shelf++) {
        const y = 300 + shelf * 72;
        let bx = x + 24;
        books += `<rect x="${x + 16}" y="${y + 58}" width="368" height="8" fill="#6b3d20"/>`;
        while (bx < x + 376) {
          const w = 8 + r() * 14;
          const h = 34 + r() * 22;
          const col = ["#7a2f2f", "#2f4a6b", "#3d5a3a", "#8a6a2e", "#5a2f5a", "#a0522d", "#2b2b2b"][Math.floor(r() * 7)];
          books += `<rect x="${f(bx)}" y="${f(y + 58 - h)}" width="${f(w)}" height="${f(h)}" fill="${col}"/><rect x="${f(bx + 2)}" y="${f(y + 62 - h)}" width="${f(w - 4)}" height="2" fill="#e8c87a" opacity="0.5"/>`;
          bx += w + 1;
        }
      }
      s.add(`<g>${books}</g>`);
    }
    s.add(`<circle cx="800" cy="330" r="420" fill="${lamp}"/>`);
    s.add(`<rect x="0" y="800" width="${W}" height="100" fill="#140a08"/><rect x="560" y="740" width="480" height="20" rx="4" fill="#4a2a16"/><path d="M 760 740 L 780 640 L 820 640 L 840 740 Z" fill="#2a160c"/><ellipse cx="800" cy="640" rx="70" ry="22" fill="#ffd08a"/>`);
    finish(s, { vignette: 0.7, tint: "#ff8a3d", tintOpacity: 0.1 });
  },
  technik(s, r) {
    sky(s, [[0, "#030a1c"], [0.6, "#0d2146"], [1, "#1f3f6e"]]);
    stars(s, r, 80, 300);
    let grid = "";
    for (let i = 0; i < 14; i++) grid += `<path d="M 0 ${120 + i * 26} H ${200 + r() * 400} V ${140 + i * 26} H ${W}" stroke="#38d6ff" stroke-opacity="0.08" fill="none"/>`;
    s.add(`<g>${grid}</g>`);
    // Glastürme
    const glass = linear(s, [[0, "#7fd3ff", 0.55], [1, "#1a3a6e", 0.9]], 1, 1);
    for (const [x, w, h] of [[300, 140, 520], [470, 110, 640], [610, 170, 460], [820, 130, 700], [980, 160, 560], [1180, 120, 480]] as const) {
      s.add(`<rect x="${x}" y="${780 - h}" width="${w}" height="${h}" fill="${glass}"/>`);
      let lines = "";
      for (let y = 780 - h + 14; y < 780; y += 16) lines += `<rect x="${x}" y="${y}" width="${w}" height="1" fill="#bfeaff" opacity="0.25"/>`;
      s.add(`<g>${lines}</g><rect x="${x}" y="${780 - h}" width="3" height="${h}" fill="#e6f8ff" opacity="0.6"/>`);
    }
    s.add(`<rect x="0" y="776" width="${W}" height="130" fill="#030712"/>`);
    lightTrails(s, 800, ["#38d6ff", "#ffffff", "#ff5c7a"], r);
    palm(s, 140, 900, 520, 0.1, "#02040a", r);
    palm(s, 1460, 900, 560, -0.1, "#02040a", r);
    finish(s, { vignette: 0.55 });
  },
  "kunst-kultur"(s, r) {
    sky(s, [[0, "#3a2a6a"], [0.45, "#b05a8a"], [0.75, "#ff9a86"], [0.95, "#ffd6a8"]]);
    clouds(s, r, 10, 160, 420, "#ffd8c8", 0.55);
    sun(s, 1300, 420, 70, "#ffd28a", "#ff9a7a", 380);
    artDeco(s, 220, 800, 520, 380, "#ffd9e4", "#ffffff", "#ff4f8b", r);
    // Skulpturen
    s.add(`<circle cx="1000" cy="660" r="70" fill="#ff7a59"/><rect x="1080" y="540" width="60" height="200" rx="30" fill="#38c6c9"/><path d="M 1180 740 L 1260 560 L 1340 740 Z" fill="#ffd14f"/><rect x="960" y="736" width="420" height="16" fill="#2b1838"/>`);
    s.add(`<rect x="0" y="800" width="${W}" height="110" fill="${linear(s, [[0, "#2b1838"], [1, "#0f0814"]])}"/>`);
    palm(s, 1480, 900, 600, -0.08, "#150a1e", r);
    finish(s, { vignette: 0.5 });
  },
  "marken-wirtschaft"(s, r) {
    sky(s, [[0, "#06061c"], [0.5, "#1d1a4a"], [0.8, "#6a2a5e"], [1, "#e0606a"]]);
    stars(s, r, 80, 300);
    skyline(s, r, { base: 740, minH: 260, maxH: 640, color: "#100e2c", window: "#ffd38a", density: 0.2, minW: 90, maxW: 170, glowTop: "#ffb46e" });
    s.add(`<rect x="0" y="736" width="${W}" height="170" fill="#05040e"/>`);
    lightTrails(s, 770, ["#ffd59a", "#ff3b5c", "#ffffff"], r);
    car(s, 560, 880, 2.1, "#16121f", "#fff4d0");
    s.add(`<ellipse cx="800" cy="884" rx="320" ry="10" fill="#ffb46e" opacity="0.25"/>`);
    palm(s, 160, 900, 600, 0.1, "#030208", r);
    palm(s, 1460, 900, 640, -0.1, "#030208", r);
    finish(s, { vignette: 0.6 });
  },
  reisen(s, r) {
    sky(s, [[0, "#3d74c4"], [0.45, "#8ac0e8"], [0.75, "#ffd3b0"], [0.95, "#ffb58f"]]);
    clouds(s, r, 12, 100, 360, "#fff5ec", 0.8);
    s.add(`<path d="M 200 160 Q 800 60 1500 200" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.6"/><path d="M 1490 196 l 18 4 l -8 -10 Z" fill="#fff"/>`);
    sun(s, 1200, 360, 60, "#fff1c8", "#ffd39a", 360);
    s.add(`<path d="${ridge(r, 520, 140, 7, true)}" fill="#3e7a6a" opacity="0.6"/>`);
    sea(s, 560, "#36d1d1", "#0d74a0", 1200, "#ffffff", r);
    // Wasserbungalows
    let bung = "";
    for (let i = 0; i < 7; i++) {
      const x = 260 + i * 160;
      bung += `<rect x="${x}" y="640" width="90" height="40" fill="#a06a3a"/><path d="M ${x - 14} 642 L ${x + 45} 600 L ${x + 104} 642 Z" fill="#d6a45e"/><rect x="${x + 10}" y="680" width="4" height="40" fill="#5a3a1e"/><rect x="${x + 76}" y="680" width="4" height="40" fill="#5a3a1e"/><rect x="${x + 34}" y="650" width="20" height="20" fill="#ffe2a8" opacity="0.8"/>`;
    }
    s.add(`<rect x="200" y="700" width="1200" height="8" fill="#6a4524"/><g>${bung}</g>`);
    palm(s, 120, 900, 640, 0.12, "#1d3d2c", r);
    palm(s, 1480, 900, 600, -0.12, "#1d3d2c", r);
    finish(s, { vignette: 0.4, grain: 0.08 });
  },
};

export const SCENE_NAMES = Object.keys(SCENES);

export function sceneSvg(name: string): string {
  const build = SCENES[name] ?? SCENES.sunset;
  const s = new Svg();
  let seed = 7;
  for (const ch of name) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  build(s, rng(seed));
  return s.render();
}
