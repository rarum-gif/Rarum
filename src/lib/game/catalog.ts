/**
 * Katalog aller Gegenstände
 * -------------------------
 * Ein Gegenstand ist entweder
 *  • place   – steht auf dem Grundstück (Fahrzeuge, Gebäude, Outdoor, Deko),
 *  • dock    – Boote, sie liegen automatisch am Steg deines Grundstücks,
 *  • wear    – trägt dein Charakter (Kleidung, Accessoires),
 *  • collect – Sammlerstück in deiner Vitrine,
 *  • plot    – Grundstückserweiterung,
 *  • theme   – Umgebung des Grundstücks.
 *
 * Viele Dinge bringen keinen Vorteil – sie sind zum Sammeln und Gestalten da.
 * Premium-Gegenstände sind rein kosmetisch und kosten trotzdem Spielgeld.
 * Die ersten elf IDs stammen aus dem früheren Shop und bleiben gültig.
 */

export type Category = "fahrzeuge" | "boote" | "gebaeude" | "outdoor" | "deko" | "kleidung" | "accessoires" | "sammlung" | "grundstueck";
export type WearSlot = "top" | "head" | "eyes" | "neck" | "ears";

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: Category;
  minLevel: number;
  kind: "place" | "dock" | "wear" | "collect" | "plot" | "theme";
  /** wie oft man es besitzen kann (Standard 1) */
  stack?: number;
  premium?: boolean;
  /** Grundfläche in Feldern (Breite × Tiefe) und Zeichnung */
  place?: { w: number; d: number; art: string; color?: string; color2?: string };
  wear?: { slot: WearSlot; style: string; color: string; color2?: string };
  collect?: { icon: string; color: string };
  plot?: { size: number };
  theme?: { env: EnvId };
  dock?: { art: string; color: string };
}

export type EnvId = "strand" | "downtown" | "insel" | "neon" | "dach";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "fahrzeuge", label: "Fahrzeuge" },
  { id: "boote", label: "Boote" },
  { id: "gebaeude", label: "Gebäude" },
  { id: "outdoor", label: "Outdoor" },
  { id: "deko", label: "Deko" },
  { id: "kleidung", label: "Kleidung" },
  { id: "accessoires", label: "Accessoires" },
  { id: "sammlung", label: "Sammlerstücke" },
  { id: "grundstueck", label: "Grundstück" },
];

const P = (id: string, name: string, price: number, category: Category, minLevel: number, w: number, d: number, art: string, color?: string, extra: Partial<CatalogItem> = {}, color2?: string): CatalogItem => ({
  id, name, price, category, minLevel, kind: "place", place: { w, d, art, color, color2 }, ...extra,
});
const W = (id: string, name: string, price: number, category: Category, minLevel: number, slot: WearSlot, style: string, color: string, extra: Partial<CatalogItem> = {}, color2?: string): CatalogItem => ({
  id, name, price, category, minLevel, kind: "wear", wear: { slot, style, color, color2 }, ...extra,
});
const C = (id: string, name: string, price: number, minLevel: number, icon: string, color: string, extra: Partial<CatalogItem> = {}): CatalogItem => ({
  id, name, price, category: "sammlung", minLevel, kind: "collect", collect: { icon, color }, ...extra,
});
const B = (id: string, name: string, price: number, minLevel: number, art: string, color: string, extra: Partial<CatalogItem> = {}): CatalogItem => ({
  id, name, price, category: "boote", minLevel, kind: "dock", dock: { art, color }, ...extra,
});

export const CATALOG: CatalogItem[] = [
  // ---------------- Fahrzeuge ----------------
  P("bmx", "BMX", 150, "fahrzeuge", 1, 1, 1, "bike", "#ff2e88"),
  P("scooter", "Vespa-Roller", 450, "fahrzeuge", 1, 1, 1, "scooter", "#35e0ff"),
  P("golfcart", "Golfwagen", 1200, "fahrzeuge", 2, 2, 1, "cart", "#f5f0e6"),
  P("food-truck", "Food Truck", 1500, "fahrzeuge", 2, 2, 1, "truck", "#ffb347"),
  P("kleinwagen", "Kleinwagen", 2500, "fahrzeuge", 2, 2, 1, "car", "#8fd14f"),
  P("motorrad", "Chopper", 4500, "fahrzeuge", 3, 1, 1, "moto", "#1d1d24"),
  P("pickup", "Pick-up", 6000, "fahrzeuge", 3, 2, 1, "pickup", "#c4123f"),
  P("cabrio", "Cabrio", 9000, "fahrzeuge", 4, 2, 1, "cabrio", "#ff7a45"),
  P("muscle", "Muscle Car", 18000, "fahrzeuge", 6, 2, 1, "muscle", "#f2c14e"),
  P("suv", "Luxus-SUV", 22000, "fahrzeuge", 7, 2, 1, "suv", "#20202a"),
  P("sportwagen", "Sportwagen", 28000, "fahrzeuge", 8, 2, 1, "sport", "#ff2e88"),
  P("limousine", "Stretch-Limo", 60000, "fahrzeuge", 11, 3, 1, "limo", "#f5f5f5"),
  P("supersport", "Hypercar", 150000, "fahrzeuge", 16, 2, 1, "hyper", "#8a4fff"),
  P("neon-racer", "Neon-Racer", 40000, "fahrzeuge", 6, 2, 1, "hyper", "#35e0ff", { premium: true }),

  // ---------------- Boote (liegen am Steg) ----------------
  B("jetski", "Jetski", 3500, 3, "jetski", "#35e0ff"),
  B("segelboot", "Segelboot", 12000, 6, "sail", "#f5f0e6"),
  B("speedboot", "Speedboot", 25000, 9, "speed", "#ff2e88"),
  B("yacht", "Superyacht", 180000, 15, "yacht", "#ffffff"),

  // ---------------- Gebäude ----------------
  P("wohnwagen", "Wohnwagen", 900, "gebaeude", 1, 2, 1, "trailer", "#e8e2d0", {}, "#35e0ff"),
  P("beach-hut", "Strandbude", 800, "gebaeude", 1, 1, 1, "hut", "#ff7a45", {}, "#35e0ff"),
  P("motel", "Motel", 4000, "gebaeude", 3, 3, 2, "motel", "#f5e6c8", {}, "#ff2e88"),
  P("bungalow", "Bungalow", 6000, "gebaeude", 3, 2, 2, "bungalow", "#ffd9b8", {}, "#2fa9d6"),
  P("garage", "Garage", 7500, "gebaeude", 4, 2, 2, "garage", "#d9d4cc", {}, "#ff7a45"),
  P("surfshop", "Surfshop", 9500, "gebaeude", 5, 2, 2, "shop", "#35e0ff", {}, "#ffb347"),
  P("diner", "Diner", 16000, "gebaeude", 6, 3, 2, "diner", "#f5f0e6", {}, "#ff2e88"),
  P("nightclub", "Nachtclub", 20000, "gebaeude", 6, 3, 3, "club", "#2a1745", {}, "#ff2e88"),
  P("tankstelle", "Tankstelle", 30000, "gebaeude", 8, 3, 2, "gas", "#f5f5f5", {}, "#c4123f"),
  P("villa", "Strandvilla", 45000, "gebaeude", 8, 3, 3, "villa", "#fff4e6", {}, "#ff7a45"),
  P("leuchtturm", "Leuchtturm", 55000, "gebaeude", 10, 1, 1, "lighthouse", "#ffffff", {}, "#c4123f"),
  P("hotel", "Art-déco-Hotel", 85000, "gebaeude", 12, 3, 2, "hotel", "#ffd1dc", {}, "#35e0ff"),
  P("helipad", "Heliport", 120000, "gebaeude", 14, 2, 2, "helipad", "#3a3a46"),
  P("glasvilla", "Glasvilla", 200000, "gebaeude", 18, 4, 3, "glass", "#e9f6ff", {}, "#1d1d24"),
  P("hochhaus", "Wolkenkratzer", 400000, "gebaeude", 24, 2, 2, "tower", "#9fd4ff", {}, "#ff2e88"),

  // ---------------- Outdoor ----------------
  P("rasen", "Rasenfeld", 15, "outdoor", 1, 1, 1, "lawn", "#4caf50", { stack: 80 }),
  P("weg", "Pflasterweg", 20, "outdoor", 1, 1, 1, "path", "#d9cbb3", { stack: 80 }),
  P("palme", "Palme", 150, "outdoor", 1, 1, 1, "palm", "#2f9e5b", { stack: 16 }),
  P("hecke", "Hecke", 60, "outdoor", 1, 1, 1, "hedge", "#2f7d4a", { stack: 40 }),
  P("zaun", "Holzzaun", 40, "outdoor", 1, 1, 1, "fence", "#f5f0e6", { stack: 40 }),
  P("liegestuhl", "Liegestuhl", 120, "outdoor", 1, 1, 1, "lounger", "#ff7a45", { stack: 8 }),
  P("sonnenschirm", "Sonnenschirm", 180, "outdoor", 1, 1, 1, "umbrella", "#ff2e88", { stack: 8 }),
  P("grill", "Grill", 400, "outdoor", 1, 1, 1, "grill", "#2a2a33"),
  P("feuerstelle", "Feuerstelle", 600, "outdoor", 2, 1, 1, "fire", "#ff7a45"),
  P("haengematte", "Hängematte", 500, "outdoor", 2, 2, 1, "hammock", "#f2c14e"),
  P("basketball", "Basketballkorb", 900, "outdoor", 2, 1, 1, "hoop", "#ff7a45"),
  P("whirlpool", "Whirlpool", 2800, "outdoor", 3, 1, 1, "jacuzzi", "#35e0ff"),
  P("pool", "Pool", 4000, "outdoor", 3, 2, 2, "pool", "#35e0ff"),
  P("brunnen", "Springbrunnen", 12000, "outdoor", 7, 2, 2, "fountain", "#e8e2d0"),
  P("tennisplatz", "Tennisplatz", 20000, "outdoor", 8, 3, 2, "court", "#2fa9d6"),
  P("infinitypool", "Infinity-Pool", 35000, "outdoor", 10, 3, 2, "pool", "#2fd6c6"),

  // ---------------- Deko ----------------
  P("flamingo", "Plastik-Flamingo", 90, "deko", 1, 1, 1, "flamingo", "#ff5d9e", { stack: 12 }),
  P("kaktus", "Kaktus", 80, "deko", 1, 1, 1, "cactus", "#3f9e5b", { stack: 12 }),
  P("blumen", "Blumenbeet", 120, "deko", 1, 1, 1, "flowers", "#ff7a45", { stack: 16 }),
  P("laterne", "Laterne", 250, "deko", 1, 1, 1, "lamp", "#f2c14e", { stack: 12 }),
  P("guitar", "Gitarrenkoffer", 300, "deko", 1, 1, 1, "guitar", "#b5651d"),
  P("surfbrett", "Surfbrett-Ständer", 350, "deko", 1, 1, 1, "surf", "#35e0ff"),
  P("boombox", "Ghettoblaster", 250, "deko", 1, 1, 1, "boombox", "#c0c0c8"),
  P("neonschild", "Neonschild „OPEN“", 1500, "deko", 4, 1, 1, "neon", "#ff2e88"),
  P("statue", "Marmorstatue", 8000, "deko", 7, 1, 1, "statue", "#f0ece4"),
  P("portara", "Mini-Portara", 25000, "deko", 10, 2, 1, "portara", "#f0ece4"),
  P("neonpalme", "Neon-Palme", 2500, "deko", 3, 1, 1, "palm", "#35e0ff", { premium: true, stack: 6 }),
  P("goldstatue", "Goldene Statue", 50000, "deko", 12, 1, 1, "statue", "#f2c14e", { premium: true }),

  // ---------------- Kleidung (Oberteil) ----------------
  W("tee-weiss", "Weisses Shirt", 0, "kleidung", 1, "top", "tee", "#f5f5f5"),
  W("tank-schwarz", "Tanktop", 0, "kleidung", 1, "top", "tank", "#1d1d24"),
  W("hawaii", "Hawaiihemd", 300, "kleidung", 1, "top", "hawaii", "#ff7a45", {}, "#35e0ff"),
  W("hoodie", "Hoodie", 600, "kleidung", 2, "top", "hoodie", "#8a4fff"),
  W("track", "Trainingsjacke", 800, "kleidung", 2, "top", "track", "#2fa9d6", {}, "#ffffff"),
  W("lederjacke", "Lederjacke", 2500, "kleidung", 4, "top", "jacket", "#1d1d24"),
  W("bomber", "Bomberjacke", 3500, "kleidung", 5, "top", "bomber", "#4b5d3a", {}, "#ff7a45"),
  W("anzug", "Leinenanzug", 12000, "kleidung", 9, "top", "suit", "#f0e6d2", {}, "#ff7a45"),
  W("smoking", "Smoking", 40000, "kleidung", 14, "top", "tux", "#121218", {}, "#ffffff"),
  W("goldjacke", "Goldene Jacke", 30000, "kleidung", 8, "top", "jacket", "#f2c14e", { premium: true }),
  W("neonhoodie", "Neon-Hoodie", 8000, "kleidung", 4, "top", "hoodie", "#ff2e88", { premium: true }),

  // ---------------- Accessoires ----------------
  W("cap", "Basecap", 150, "accessoires", 1, "head", "cap", "#ff2e88"),
  W("stirnband", "Stirnband", 100, "accessoires", 1, "head", "band", "#35e0ff"),
  W("beanie", "Beanie", 200, "accessoires", 1, "head", "beanie", "#f2c14e"),
  W("buckethat", "Fischerhut", 250, "accessoires", 2, "head", "bucket", "#f5f0e6"),
  W("cowboyhut", "Cowboyhut", 1200, "accessoires", 4, "head", "cowboy", "#8b5a2b"),
  W("panama", "Panamahut", 2500, "accessoires", 6, "head", "panama", "#efe4c8", {}, "#1d1d24"),
  W("krone", "Krone", 250000, "accessoires", 30, "head", "crown", "#f2c14e"),
  W("sonnenbrille", "Sonnenbrille", 200, "accessoires", 1, "eyes", "shades", "#1d1d24"),
  W("pilotenbrille", "Pilotenbrille", 900, "accessoires", 3, "eyes", "aviator", "#f2c14e"),
  W("neonbrille", "Neon-Shades", 3000, "accessoires", 3, "eyes", "visor", "#35e0ff", { premium: true }),
  W("bandana", "Bandana", 150, "accessoires", 1, "neck", "bandana", "#c4123f"),
  W("kopfhoerer", "Kopfhörer", 700, "accessoires", 2, "neck", "headphones", "#f5f5f5"),
  W("goldkette", "Goldkette", 5000, "accessoires", 6, "neck", "chain", "#f2c14e"),
  W("diamantkette", "Diamantkette", 60000, "accessoires", 15, "neck", "chain", "#d5f3ff"),
  W("ohrring", "Ohrring", 400, "accessoires", 2, "ears", "stud", "#f2c14e"),
  W("creolen", "Creolen", 1100, "accessoires", 4, "ears", "hoop", "#f2c14e"),

  // ---------------- Sammlerstücke ----------------
  C("vinyl", "Vinyl-Rarität", 500, 1, "disc", "#ff2e88"),
  C("sneaker", "Limitierte Sneaker", 1800, 3, "footprints", "#35e0ff"),
  C("polaroid", "Polaroid-Kamera", 900, 2, "camera", "#f5f0e6"),
  C("arcade", "Arcade-Automat", 6500, 5, "gamepad", "#8a4fff"),
  C("uhr", "Taucheruhr", 14000, 7, "watch", "#2fa9d6"),
  C("gemaelde", "Ölgemälde", 30000, 10, "frame", "#f2c14e"),
  C("goldbarren", "Goldbarren", 10000, 6, "bar", "#f2c14e", { stack: 10 }),
  C("penthouse", "Penthouse in der Stadt", 90000, 11, "building", "#9fd4ff"),
  C("jet", "Privatjet", 350000, 20, "plane", "#f5f5f5"),
  C("meteorit", "Meteorit", 120000, 16, "star", "#c0c0c8"),

  // ---------------- Grundstück ----------------
  { id: "plot-10", name: "Grundstück 10 × 10", price: 5000, category: "grundstueck", minLevel: 3, kind: "plot", plot: { size: 10 } },
  { id: "plot-12", name: "Grundstück 12 × 12", price: 25000, category: "grundstueck", minLevel: 8, kind: "plot", plot: { size: 12 } },
  { id: "plot-14", name: "Grundstück 14 × 14", price: 90000, category: "grundstueck", minLevel: 14, kind: "plot", plot: { size: 14 } },
  { id: "env-downtown", name: "Umgebung: Downtown", price: 12000, category: "grundstueck", minLevel: 6, kind: "theme", theme: { env: "downtown" } },
  { id: "island", name: "Umgebung: Privatinsel", price: 750000, category: "grundstueck", minLevel: 26, kind: "theme", theme: { env: "insel" } },
  { id: "env-neon", name: "Umgebung: Neon-Nacht", price: 15000, category: "grundstueck", minLevel: 4, kind: "theme", theme: { env: "neon" }, premium: true },
  { id: "env-dach", name: "Umgebung: Dachterrasse", price: 40000, category: "grundstueck", minLevel: 8, kind: "theme", theme: { env: "dach" }, premium: true },
];

export const BASE_PLOT = 8;

export function catalogItem(id: string) {
  return CATALOG.find((i) => i.id === id);
}

/** Gratis-Dinge, die jeder Spieler von Anfang an hat */
export const FREE_ITEMS = new Set(CATALOG.filter((i) => i.price === 0).map((i) => i.id));
