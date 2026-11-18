/**
 * Erzeugt die Weltkarte für den Weltkarten-Modus aus Natural-Earth-Daten
 * (gemeinfrei, via npm-Paket world-atlas). Ergebnis: public/maps/world.json
 * mit fertigen SVG-Pfaden in einer festen Projektion (siehe src/lib/game/geo.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { feature, mesh } from "topojson-client";
import { geoPath } from "d3-geo";
import { worldProjection, MAP_W, MAP_H } from "../src/lib/game/geo";

const topo = JSON.parse(fs.readFileSync(path.join("node_modules/world-atlas/countries-50m.json"), "utf8"));
const projection = worldProjection();
const gp = geoPath(projection).digits(0);
const land = gp(feature(topo, topo.objects.land) as never) ?? "";
const borders = gp(mesh(topo, topo.objects.countries, (a, b) => a !== b) as never) ?? "";
const graticule = "";
fs.writeFileSync("public/maps/world.json", JSON.stringify({ w: MAP_W, h: MAP_H, land, borders, graticule }));
console.log("world.json", Math.round(fs.statSync("public/maps/world.json").size / 1024), "KB");
