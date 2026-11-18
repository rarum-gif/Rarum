import { catalogItem, FREE_ITEMS, type WearSlot } from "./catalog";

/**
 * Spielfigur
 * ----------
 * Jeder Spieler wählt am Anfang eine von acht eigenen Figuren und kann sie
 * danach frei anpassen (Haut, Frisur, Haarfarbe, Bart, Hintergrund). Kleidung
 * und Accessoires kommen aus dem Shop – getragen werden kann nur, was man besitzt.
 */

export const SKINS = [
  { id: "s1", color: "#f6d3b5" },
  { id: "s2", color: "#eab68f" },
  { id: "s3", color: "#d29a6d" },
  { id: "s4", color: "#b07650" },
  { id: "s5", color: "#8a5a3b" },
  { id: "s6", color: "#5e3b26" },
] as const;

export const HAIR_COLORS = [
  { id: "black", color: "#1b1418" },
  { id: "brown", color: "#5a3622" },
  { id: "auburn", color: "#9a3f1f" },
  { id: "blond", color: "#e2b65c" },
  { id: "platinum", color: "#f1e7d0" },
  { id: "grey", color: "#b9b4ae" },
  { id: "pink", color: "#ff5da8" },
  { id: "blue", color: "#3fb6ff" },
  { id: "violet", color: "#8a4fff" },
] as const;

export const HAIR_STYLES = [
  { id: "buzz", label: "Buzzcut" },
  { id: "short", label: "Kurz" },
  { id: "slick", label: "Zurückgegelt" },
  { id: "wavy", label: "Lang & wellig" },
  { id: "ponytail", label: "Pferdeschwanz" },
  { id: "bob", label: "Bob" },
  { id: "bangs", label: "Pony" },
  { id: "afro", label: "Afro" },
  { id: "curls", label: "Locken" },
  { id: "braids", label: "Zöpfe" },
  { id: "bun", label: "Dutt" },
  { id: "bald", label: "Glatze" },
] as const;

export const FACIAL = [
  { id: "none", label: "Ohne" },
  { id: "stubble", label: "Dreitagebart" },
  { id: "mustache", label: "Schnurrbart" },
  { id: "beard", label: "Vollbart" },
] as const;

export const BACKDROPS = [
  { id: "sunset", from: "#ff7a45", to: "#ff2e88" },
  { id: "ocean", from: "#2fa9d6", to: "#1b3f9e" },
  { id: "neon", from: "#ff2e88", to: "#8a4fff" },
  { id: "mint", from: "#2fd6c6", to: "#1f7a4d" },
  { id: "gold", from: "#f2c14e", to: "#c86b3c" },
  { id: "night", from: "#3b2b6e", to: "#120a1e" },
] as const;

export interface Character {
  preset: string;
  skin: string;
  hair: string;
  hairColor: string;
  facial: string;
  backdrop: string;
  top: string;
  head: string | null;
  eyes: string | null;
  neck: string | null;
  ears: string | null;
}

export interface Preset extends Character {
  name: string;
  role: string;
}

/** Acht eigene Figuren – jede mit eigener Silhouette und Farbwelt */
export const PRESETS: Preset[] = [
  { preset: "kai", name: "Kai", role: "Der Surfer", skin: "s3", hair: "wavy", hairColor: "blond", facial: "stubble", backdrop: "ocean", top: "tank-schwarz", head: null, eyes: null, neck: null, ears: null },
  { preset: "mara", name: "Mara", role: "Die Fahrerin", skin: "s2", hair: "ponytail", hairColor: "black", facial: "none", backdrop: "sunset", top: "tee-weiss", head: null, eyes: null, neck: null, ears: null },
  { preset: "dante", name: "Dante", role: "Der Hustler", skin: "s5", hair: "buzz", hairColor: "black", facial: "beard", backdrop: "gold", top: "tee-weiss", head: null, eyes: null, neck: null, ears: null },
  { preset: "lena", name: "Lena", role: "Die Influencerin", skin: "s1", hair: "bob", hairColor: "pink", facial: "none", backdrop: "neon", top: "tee-weiss", head: null, eyes: null, neck: null, ears: null },
  { preset: "rio", name: "Rio", role: "Der DJ", skin: "s4", hair: "afro", hairColor: "black", facial: "mustache", backdrop: "night", top: "tank-schwarz", head: null, eyes: null, neck: null, ears: null },
  { preset: "yuki", name: "Yuki", role: "Die Hackerin", skin: "s1", hair: "bangs", hairColor: "violet", facial: "none", backdrop: "night", top: "tank-schwarz", head: null, eyes: null, neck: null, ears: null },
  { preset: "zara", name: "Zara", role: "Die Architektin", skin: "s6", hair: "braids", hairColor: "brown", facial: "none", backdrop: "mint", top: "tee-weiss", head: null, eyes: null, neck: null, ears: null },
  { preset: "ozzy", name: "Ozzy", role: "Der Ruheständler", skin: "s2", hair: "slick", hairColor: "grey", facial: "beard", backdrop: "gold", top: "tee-weiss", head: null, eyes: null, neck: null, ears: null },
];

export const DEFAULT_CHARACTER: Character = (({ name: _n, role: _r, ...c }) => c)(PRESETS[0]);

export function presetOf(id: string) {
  return PRESETS.find((p) => p.preset === id);
}

const inList = <T extends { id: string }>(list: readonly T[], v: unknown) => typeof v === "string" && list.some((x) => x.id === v);

/**
 * Prüft eine Figur. `owns(itemId)` sagt, ob der Spieler einen Gegenstand besitzt.
 * Gibt eine bereinigte Figur zurück oder einen Fehlertext.
 */
export function validateCharacter(raw: unknown, owns: (id: string) => boolean): Character | string {
  if (!raw || typeof raw !== "object") return "Ungültige Figur.";
  const c = raw as Record<string, unknown>;
  if (!presetOf(String(c.preset))) return "Unbekannte Figur.";
  if (!inList(SKINS, c.skin) || !inList(HAIR_STYLES, c.hair) || !inList(HAIR_COLORS, c.hairColor) || !inList(FACIAL, c.facial) || !inList(BACKDROPS, c.backdrop)) return "Ungültige Anpassung.";
  const slot = (key: WearSlot, required = false): string | null | false => {
    const v = c[key];
    if (v == null || v === "") return required ? false : null;
    const item = catalogItem(String(v));
    if (!item || item.kind !== "wear" || item.wear?.slot !== key) return false;
    if (!FREE_ITEMS.has(item.id) && !owns(item.id)) return false;
    return item.id;
  };
  const top = slot("top", true) as string | false;
  const head = slot("head");
  const eyes = slot("eyes");
  const neck = slot("neck");
  const ears = slot("ears");
  if (top === false || head === false || eyes === false || neck === false || ears === false) return "Diesen Gegenstand besitzt du nicht.";
  return { preset: String(c.preset), skin: String(c.skin), hair: String(c.hair), hairColor: String(c.hairColor), facial: String(c.facial), backdrop: String(c.backdrop), top, head, eyes, neck, ears };
}
