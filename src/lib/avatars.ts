// Eingebaute Avatare – keine Fotos, keine personenbezogenen Daten.
// Ein Avatar besteht aus Symbol und Farbe und wird als "symbol.farbe" gespeichert
// (z. B. "crown.sunset"). Ältere Einzel-IDs wie "fern" bleiben gültig.

export const AVATAR_ICONS = [
  { id: "crown", label: "Krone" },
  { id: "flame", label: "Flamme" },
  { id: "zap", label: "Blitz" },
  { id: "star", label: "Stern" },
  { id: "gem", label: "Diamant" },
  { id: "rocket", label: "Rakete" },
  { id: "ghost", label: "Geist" },
  { id: "skull", label: "Totenkopf" },
  { id: "cat", label: "Katze" },
  { id: "dog", label: "Hund" },
  { id: "rabbit", label: "Hase" },
  { id: "bird", label: "Vogel" },
  { id: "fish", label: "Fisch" },
  { id: "palm", label: "Palme" },
  { id: "sun", label: "Sonne" },
  { id: "moon", label: "Mond" },
  { id: "waves", label: "Welle" },
  { id: "mountain", label: "Berg" },
  { id: "leaf", label: "Blatt" },
  { id: "music", label: "Musik" },
  { id: "gamepad", label: "Controller" },
  { id: "car", label: "Auto" },
  { id: "anchor", label: "Anker" },
  { id: "dice", label: "Würfel" },
  { id: "sword", label: "Schwert" },
  { id: "shield", label: "Schild" },
  { id: "heart", label: "Herz" },
  { id: "smile", label: "Smiley" },
  { id: "glasses", label: "Brille" },
  { id: "headphones", label: "Kopfhörer" },
] as const;

export const AVATAR_COLORS = [
  { id: "sunset", label: "Sunset", from: "#ff7a45", to: "#ff2e88" },
  { id: "neon", label: "Neon", from: "#ff2e88", to: "#8a4fff" },
  { id: "violet", label: "Violett", from: "#8a4fff", to: "#3b2bd6" },
  { id: "ocean", label: "Ozean", from: "#1b5f9e", to: "#2fa9d6" },
  { id: "teal", label: "Türkis", from: "#2fa9d6", to: "#2fd6c6" },
  { id: "mint", label: "Mint", from: "#2fbf8f", to: "#2fd6c6" },
  { id: "jungle", label: "Dschungel", from: "#1f7a4d", to: "#2fbf8f" },
  { id: "gold", label: "Gold", from: "#f2c14e", to: "#ff7a45" },
  { id: "peach", label: "Pfirsich", from: "#ffb38a", to: "#ff5d73" },
  { id: "cherry", label: "Kirsche", from: "#c4123f", to: "#ff5d73" },
  { id: "night", label: "Nacht", from: "#1a1030", to: "#4b3b8f" },
  { id: "silver", label: "Silber", from: "#8b93a7", to: "#d5dae6" },
] as const;

export type AvatarIconId = (typeof AVATAR_ICONS)[number]["id"];
export type AvatarColorId = (typeof AVATAR_COLORS)[number]["id"];

/** Frühere Avatare (ein Wert = Symbol + Farbe) */
const LEGACY: Record<string, { icon: string; from: string; to: string }> = {
  fern: { icon: "leaf", from: "#ff7a45", to: "#ff4f8b" },
  mountain: { icon: "mountain", from: "#1b5f9e", to: "#2fa9d6" },
  wave: { icon: "waves", from: "#2fa9d6", to: "#2fd6c6" },
  owl: { icon: "bird", from: "#8a4fff", to: "#ff5d73" },
  pine: { icon: "palm", from: "#2fbf8f", to: "#1b5f9e" },
  sun: { icon: "sun", from: "#ffb347", to: "#ff7a45" },
  moon: { icon: "moon", from: "#2a1745", to: "#6b5bd6" },
  feather: { icon: "bird", from: "#ff5d73", to: "#c04dff" },
  compass: { icon: "star", from: "#f2c14e", to: "#ff7a45" },
  sprout: { icon: "leaf", from: "#2fbf8f", to: "#f2c14e" },
  shell: { icon: "waves", from: "#ffb38a", to: "#ff5d73" },
  snow: { icon: "star", from: "#5b9dff", to: "#ad7bff" },
};

export const DEFAULT_AVATAR = "crown.sunset";

export function avatarId(icon: string, color: string) {
  return `${icon}.${color}`;
}

export function parseAvatar(id?: string | null): { icon: string; color: string | null; from: string; to: string } {
  if (id && LEGACY[id]) return { ...LEGACY[id], color: null };
  const [icon, color] = (id ?? DEFAULT_AVATAR).split(".");
  const c = AVATAR_COLORS.find((x) => x.id === color) ?? AVATAR_COLORS[0];
  const i = AVATAR_ICONS.find((x) => x.id === icon) ?? AVATAR_ICONS[0];
  return { icon: i.id, color: c.id, from: c.from, to: c.to };
}

export function isValidAvatar(id: unknown): id is string {
  if (typeof id !== "string") return false;
  if (LEGACY[id]) return true;
  const [icon, color] = id.split(".");
  return AVATAR_ICONS.some((x) => x.id === icon) && AVATAR_COLORS.some((x) => x.id === color);
}
