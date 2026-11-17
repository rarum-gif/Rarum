// Farbgrading für die Hintergrundfotos ("Vice-Sunset"-Look)
// Aufruf: node scripts/grade-photos.mjs <manifest.json> <rohbild-ordner>
//
// Manifest-Einträge: { key, file, out: [{ path, w, h, position? }], tone: "sunset"|"night"|"day" }
// Jeder Eintrag wird zugeschnitten und mit Split-Toning (Schatten violett/blau,
// Lichter orange/pink), leichter Kontrastkurve, Sättigung und Vignette versehen.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [, , manifestPath, rawDir] = process.argv;
if (!manifestPath || !rawDir) {
  console.error("Aufruf: node scripts/grade-photos.mjs <manifest.json> <rohbild-ordner>");
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "public");

const TONES = {
  // [Lichter-Farbe, Schatten-Farbe, Sättigung, Helligkeit, Overlay-Stärke]
  sunset: { hi: "#ff8a3d", mid: "#ff2e88", lo: "#2a0d4a", sat: 1.22, bri: 1.0, k: 0.42 },
  night: { hi: "#ff2e88", mid: "#7a2cff", lo: "#07102e", sat: 1.18, bri: 0.92, k: 0.48 },
  day: { hi: "#ffb15a", mid: "#ff4f9a", lo: "#1a2a6a", sat: 1.12, bri: 1.0, k: 0.3 },
};

function gradientSvg(w, h, t) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${t.mid}"/>
      <stop offset="0.45" stop-color="${t.hi}"/>
      <stop offset="1" stop-color="${t.lo}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
</svg>`);
}
function vignetteSvg(w, h) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs><radialGradient id="v" cx="50%" cy="45%" r="75%">
    <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#05020c" stop-opacity="0.72"/>
  </radialGradient></defs>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);
}
function shadowTintSvg(w, h, color) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${color}"/></svg>`);
}

async function grade(file, { path: rel, w, h, position = "attention", quality = 74 }, toneName) {
  const t = TONES[toneName] ?? TONES.sunset;
  const base = await sharp(file)
    .rotate()
    .resize(w, h, { fit: "cover", position: position === "attention" ? sharp.strategy.attention : position })
    .modulate({ saturation: t.sat, brightness: t.bri })
    .linear(1.08, -8) // leichte S-Kurve: mehr Kontrast
    .toBuffer();
  const graded = await sharp(base)
    .composite([
      { input: await sharp(gradientSvg(w, h, t)).png().toBuffer(), blend: "soft-light" },
      { input: await sharp(shadowTintSvg(w, h, t.lo)).ensureAlpha(t.k * 0.55).png().toBuffer(), blend: "lighten" },
      { input: await sharp(vignetteSvg(w, h)).png().toBuffer(), blend: "over" },
    ])
    .webp({ quality, effort: 5 })
    .toBuffer();
  const out = path.join(root, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, graded);
  return { out: rel, kb: Math.round(graded.length / 1024) };
}

let total = 0;
for (const item of manifest) {
  const file = path.join(rawDir, item.file);
  if (!fs.existsSync(file)) {
    console.warn("fehlt:", item.file);
    continue;
  }
  for (const o of item.out) {
    const r = await grade(file, o, item.tone);
    total += r.kb;
    console.log(`${r.out.padEnd(44)} ${String(r.kb).padStart(4)} KB`);
  }
}
console.log(`gesamt ${total} KB`);
