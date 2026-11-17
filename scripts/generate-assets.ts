// Rendert alle Szenen als WebP:
//   public/images/backgrounds/<welt>.webp   (1920×1080, Seitenhintergründe)
//   public/images/themes/<pack>.webp        (1920×1080, Pack-Welten)
//   public/images/themes/<pack>-card.webp   (960×600, Karten)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { SCENE_NAMES, sceneSvg } from "../src/lib/scenes";
import { seedPacks } from "../src/content/packs";

const root = path.join(process.cwd(), "public", "images");
const packIds = new Set(seedPacks.map((p) => p.id));

async function main() {
  for (const dir of ["backgrounds", "themes", "dashboard", "quiz", "profile"]) fs.mkdirSync(path.join(root, dir), { recursive: true });
  for (const name of SCENE_NAMES) {
    const svg = Buffer.from(sceneSvg(name));
    const dir = packIds.has(name) ? "themes" : "backgrounds";
    const big = sharp(svg, { density: 110 }).resize(1920, 1080, { fit: "cover" });
    await big.clone().webp({ quality: 80 }).toFile(path.join(root, dir, `${name}.webp`));
    if (packIds.has(name)) await sharp(svg, { density: 72 }).resize(960, 600, { fit: "cover" }).webp({ quality: 78 }).toFile(path.join(root, dir, `${name}-card.webp`));
    else await sharp(svg, { density: 72 }).resize(900, 1600, { fit: "cover" }).webp({ quality: 76 }).toFile(path.join(root, dir, `${name}-mobile.webp`));
    process.stdout.write(".");
  }
  // Abgeleitete Bilder für Dashboard, Quiz und Profil
  fs.copyFileSync(path.join(root, "backgrounds", "sunset.webp"), path.join(root, "dashboard", "hero.webp"));
  fs.copyFileSync(path.join(root, "backgrounds", "oceandrive.webp"), path.join(root, "dashboard", "daily.webp"));
  fs.copyFileSync(path.join(root, "backgrounds", "night.webp"), path.join(root, "quiz", "default.webp"));
  fs.copyFileSync(path.join(root, "backgrounds", "marina.webp"), path.join(root, "profile", "header.webp"));
  console.log("\nfertig");
}
main();
