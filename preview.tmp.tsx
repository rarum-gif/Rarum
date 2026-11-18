import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import fs from "node:fs";
import { CharacterArt } from "@/components/character";
import { PRESETS } from "@/lib/game/character";
import { Art, BoatArt, iso, TW, TH } from "@/components/world/iso";
import { CATALOG } from "@/lib/game/catalog";
const chars = PRESETS.map((p) => renderToStaticMarkup(<div style={{display:"inline-block",margin:6}}><CharacterArt c={p} size={180} /><div style={{color:"#fff",font:"12px sans-serif"}}>{p.name}</div></div>)).join("");
const dressed = [
  { ...PRESETS[0], top: "hawaii", eyes: "sonnenbrille", head: "cap", neck: "goldkette" },
  { ...PRESETS[1], top: "lederjacke", eyes: "pilotenbrille", ears: "creolen" },
  { ...PRESETS[2], top: "anzug", head: "panama", neck: "diamantkette" },
  { ...PRESETS[3], top: "hoodie", eyes: "neonbrille", head: "krone" },
  { ...PRESETS[4], top: "smoking", neck: "kopfhoerer", head: "cowboyhut" },
  { ...PRESETS[5], top: "bomber", head: "beanie" },
  { ...PRESETS[6], top: "track", head: "buckethat" },
].map((p) => renderToStaticMarkup(<div style={{display:"inline-block",margin:6}}><CharacterArt c={p as any} size={180} /></div>)).join("");
const items = CATALOG.filter((i) => i.place || i.dock).map((i) => {
  const w = i.place?.w ?? 3, d = i.place?.d ?? 1;
  const [ox] = iso(0, d); 
  const width = (w + d) * TW / 2 + 20, height = (w + d) * TH / 2 + 240;
  const svg = i.place ? <svg width={width} height={height} viewBox={`${-d*TW/2-10} ${-200} ${width} ${height}`}><Art art={i.place.art} w={w} d={d} color={i.place.color} color2={i.place.color2} /></svg> : <svg width={170} height={120} viewBox="-10 -80 170 120"><BoatArt art={i.dock!.art} color={i.dock!.color} /></svg>;
  return renderToStaticMarkup(<div style={{display:"inline-block",margin:4,background:"#3a7d44",verticalAlign:"bottom"}}>{svg}<div style={{color:"#fff",font:"10px sans-serif"}}>{i.name}</div></div>);
}).join("");
fs.writeFileSync(process.argv[2], `<html><body style="background:#1a1024">${chars}<hr/>${dressed}<hr/>${items}</body></html>`);
