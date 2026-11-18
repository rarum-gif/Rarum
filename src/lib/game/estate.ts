import { BASE_PLOT, CATALOG, catalogItem, type EnvId } from "./catalog";
import { ownedCount, type Purchase } from "./economy";

/**
 * Grundstück
 * ----------
 * Ein quadratisches Raster (8 × 8, erweiterbar bis 14 × 14). Gekaufte Gegenstände
 * werden frei platziert; Boote liegen automatisch am Steg. Gespeichert wird nur,
 * was der Spieler wirklich besitzt – Client und Server prüfen gleich.
 */

export interface Placement {
  uid: string;
  id: string;
  x: number;
  y: number;
}

export interface Estate {
  env: EnvId;
  items: Placement[];
}

export const EMPTY_ESTATE: Estate = { env: "strand", items: [] };

export function plotSize(purchases: Purchase[]): number {
  let size = BASE_PLOT;
  for (const p of purchases) {
    const s = catalogItem(p.itemId)?.plot?.size;
    if (s && s > size) size = s;
  }
  return size;
}

export function ownedEnvs(purchases: Purchase[]): EnvId[] {
  const out: EnvId[] = ["strand"];
  for (const i of CATALOG) if (i.kind === "theme" && i.theme && ownedCount(purchases, i.id) > 0) out.push(i.theme.env);
  return out;
}

export function footprint(id: string) {
  const it = catalogItem(id);
  return it?.place ? { w: it.place.w, d: it.place.d } : null;
}

/** Gibt das bereinigte Grundstück zurück oder einen Fehlertext. */
export function validateEstate(raw: unknown, purchases: Purchase[]): Estate | string {
  if (!raw || typeof raw !== "object") return "Ungültiges Grundstück.";
  const r = raw as { env?: unknown; items?: unknown };
  const env = String(r.env ?? "strand") as EnvId;
  if (!ownedEnvs(purchases).includes(env)) return "Diese Umgebung besitzt du nicht.";
  if (!Array.isArray(r.items) || r.items.length > 400) return "Ungültige Gegenstände.";
  const size = plotSize(purchases);
  const used = new Map<string, number>();
  const grid = new Set<string>();
  const items: Placement[] = [];
  for (const p of r.items as Placement[]) {
    if (!p || typeof p.id !== "string" || !Number.isInteger(p.x) || !Number.isInteger(p.y)) return "Ungültige Platzierung.";
    const fp = footprint(p.id);
    if (!fp) return "Dieser Gegenstand lässt sich nicht platzieren.";
    const n = (used.get(p.id) ?? 0) + 1;
    if (n > ownedCount(purchases, p.id)) return "Du hast davon nicht genug.";
    used.set(p.id, n);
    if (p.x < 0 || p.y < 0 || p.x + fp.w > size || p.y + fp.d > size) return "Ausserhalb des Grundstücks.";
    for (let x = p.x; x < p.x + fp.w; x++)
      for (let y = p.y; y < p.y + fp.d; y++) {
        const k = `${x},${y}`;
        // Böden (Rasen, Weg) liegen unter allem anderen
        const ground = isGround(p.id);
        const key = ground ? `g:${k}` : k;
        if (grid.has(key)) return "Gegenstände überlappen sich.";
        grid.add(key);
      }
    items.push({ uid: String(p.uid ?? `${p.id}-${items.length}`).slice(0, 40), id: p.id, x: p.x, y: p.y });
  }
  return { env, items };
}

export function isGround(id: string) {
  const art = catalogItem(id)?.place?.art;
  return art === "lawn" || art === "path";
}

/** Freies Feld für einen Gegenstand suchen (für "Platzieren"-Klick) */
export function findFreeSpot(estate: Estate, id: string, size: number): { x: number; y: number } | null {
  const fp = footprint(id);
  if (!fp) return null;
  const ground = isGround(id);
  const taken = new Set<string>();
  for (const p of estate.items) {
    if (isGround(p.id) !== ground) continue;
    const f = footprint(p.id)!;
    for (let x = p.x; x < p.x + f.w; x++) for (let y = p.y; y < p.y + f.d; y++) taken.add(`${x},${y}`);
  }
  for (let y = 0; y + fp.d <= size; y++)
    for (let x = 0; x + fp.w <= size; x++) {
      let ok = true;
      for (let dx = 0; dx < fp.w && ok; dx++) for (let dy = 0; dy < fp.d && ok; dy++) if (taken.has(`${x + dx},${y + dy}`)) ok = false;
      if (ok) return { x, y };
    }
  return null;
}

export function canPlaceAt(estate: Estate, id: string, x: number, y: number, size: number, ignoreUid?: string) {
  const fp = footprint(id);
  if (!fp || x < 0 || y < 0 || x + fp.w > size || y + fp.d > size) return false;
  const ground = isGround(id);
  for (const p of estate.items) {
    if (p.uid === ignoreUid || isGround(p.id) !== ground) continue;
    const f = footprint(p.id)!;
    if (x < p.x + f.w && x + fp.w > p.x && y < p.y + f.d && y + fp.d > p.y) return false;
  }
  return true;
}
