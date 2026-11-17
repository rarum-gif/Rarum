import type { AttemptRecord, TierId } from "@/lib/types";

/**
 * Spielwirtschaft
 * ---------------
 * • Geld gibt es für jede richtige Antwort – je seltener, desto mehr (ab 50 $).
 * • XP gibt es für jede abgeschlossene Runde. XP bestimmen das Level.
 * • Je höher das Level, desto mehr Geld pro Antwort (+10 % pro Level).
 * • Mit dem Geld kauft man im Shop Besitz – vom Gitarrenkoffer bis zur Privatinsel.
 *
 * Alles wird aus den gespeicherten Runden berechnet (chronologisch nachgespielt).
 * Dadurch braucht es keinen separaten Kontostand, der manipuliert werden könnte –
 * der Server kann jeden Kauf mit derselben Rechnung prüfen.
 */

export const TIER_CASH: Record<TierId, number> = {
  known: 50,
  familiar: 80,
  unusual: 120,
  rare: 180,
  very_rare: 260,
  legendary: 400,
};

/** XP-Schwelle für Level n (Level 1 = 0 XP). Wächst sanft: 250, 600, 1050, 1600 … */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 200 * n + 50 * n * n;
}

export function levelForXp(xp: number) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xp, cur, next, progress: (xp - cur) / (next - cur), toNext: next - xp, title: titleFor(level) };
}

/** Geld-Multiplikator pro Level: Level 1 = ×1.0, Level 11 = ×2.0 */
export function cashMultiplier(level: number): number {
  return 1 + (Math.max(1, level) - 1) * 0.1;
}

const TITLES: [number, string][] = [
  [1, "Pleite"],
  [3, "Tellerwäscher"],
  [5, "Strassenhändler"],
  [8, "Hustler"],
  [11, "Kleinunternehmer"],
  [15, "Unternehmer"],
  [20, "Investor"],
  [26, "Immobilienhai"],
  [33, "Tycoon"],
  [41, "Mogul"],
  [50, "Legende von Naxos"],
];

export function titleFor(level: number): string {
  let t = TITLES[0][1];
  for (const [min, name] of TITLES) if (level >= min) t = name;
  return t;
}

/** XP für eine abgeschlossene Runde */
export function xpForAttempt(a: Pick<AttemptRecord, "mode" | "official" | "answers">): number {
  const correct = a.answers.filter((x) => x.status === "accepted").length;
  const base = a.mode === "unlimited" ? 20 : a.official || a.mode === "ranked" ? 100 : 60;
  const perfect = a.answers.length >= 5 && correct === a.answers.length ? 50 : 0;
  return base + correct * 15 + perfect;
}

export function cashForAnswer(tier: TierId | null, level: number): number {
  if (!tier) return 0;
  return Math.round(TIER_CASH[tier] * cashMultiplier(level));
}

export interface RoundEconomy {
  cash: number;
  xp: number;
  levelBefore: number;
  levelAfter: number;
}

export interface Economy {
  earned: number;
  xp: number;
  level: ReturnType<typeof levelForXp>;
  rounds: Record<string, RoundEconomy>;
}

/** Spielt alle Runden in zeitlicher Reihenfolge nach und berechnet Geld, XP und Level. */
export function computeEconomy(attempts: AttemptRecord[]): Economy {
  const sorted = attempts.slice().sort((a, b) => (a.finishedAt || a.startedAt).localeCompare(b.finishedAt || b.startedAt));
  let xp = 0;
  let earned = 0;
  const rounds: Record<string, RoundEconomy> = {};
  for (const a of sorted) {
    const levelBefore = levelForXp(xp).level;
    let cash = 0;
    for (const ans of a.answers) if (ans.status === "accepted") cash += cashForAnswer(ans.tier, levelBefore);
    const gained = xpForAttempt(a);
    earned += cash;
    xp += gained;
    rounds[a.id] = { cash, xp: gained, levelBefore, levelAfter: levelForXp(xp).level };
  }
  return { earned, xp, level: levelForXp(xp), rounds };
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: "Start" | "Fahrzeuge" | "Immobilien" | "Luxus";
  line: string;
  minLevel: number;
}

export const SHOP: ShopItem[] = [
  { id: "guitar", name: "Gitarrenkoffer", price: 300, image: "busker", category: "Start", line: "Die ersten Münzen auf der Promenade.", minLevel: 1 },
  { id: "beach-hut", name: "Strandbude", price: 800, image: "broke", category: "Start", line: "Ein bunter Turm am South Beach.", minLevel: 1 },
  { id: "food-truck", name: "Food Truck", price: 1500, image: "truck", category: "Fahrzeuge", line: "Tacos, Neonlicht und eine Schlange vor dem Fenster.", minLevel: 2 },
  { id: "motel", name: "Motel am Highway", price: 4000, image: "motel", category: "Immobilien", line: "Leuchtschrift: No Vacancy.", minLevel: 3 },
  { id: "cabrio", name: "Cabrio", price: 9000, image: "cabrio", category: "Fahrzeuge", line: "Verdeck runter, Küstenstrasse rauf.", minLevel: 4 },
  { id: "nightclub", name: "Nachtclub", price: 20000, image: "club", category: "Immobilien", line: "Dein Name leuchtet über dem Eingang.", minLevel: 6 },
  { id: "villa", name: "Strandvilla", price: 45000, image: "villa", category: "Immobilien", line: "Palmen, Pool und Meerblick.", minLevel: 8 },
  { id: "penthouse", name: "Penthouse", price: 90000, image: "penthouse", category: "Luxus", line: "Die ganze Skyline unter dir.", minLevel: 11 },
  { id: "yacht", name: "Superyacht", price: 180000, image: "yacht", category: "Luxus", line: "Anker werfen, wo es dir gefällt.", minLevel: 15 },
  { id: "jet", name: "Privatjet", price: 350000, image: "jet", category: "Luxus", line: "Wochenende? Irgendwo anders.", minLevel: 20 },
  { id: "island", name: "Privatinsel", price: 750000, image: "island", category: "Luxus", line: "Die Insel gehört dir.", minLevel: 26 },
];

export function shopItem(id: string) {
  return SHOP.find((i) => i.id === id);
}

export interface Purchase {
  itemId: string;
  price: number;
  at: string;
}

export function walletOf(economy: Economy, purchases: Purchase[]) {
  const spent = purchases.reduce((s, p) => s + p.price, 0);
  const assets = purchases.reduce((s, p) => s + (shopItem(p.itemId)?.price ?? 0), 0);
  return { balance: economy.earned - spent, spent, assets, netWorth: economy.earned - spent + assets };
}

/** Prüft einen Kauf – identisch auf Client und Server. */
export function canBuy(item: ShopItem, economy: Economy, purchases: Purchase[]): string | null {
  if (purchases.some((p) => p.itemId === item.id)) return "Gehört dir schon.";
  if (economy.level.level < item.minLevel) return `Ab Level ${item.minLevel}.`;
  if (walletOf(economy, purchases).balance < item.price) return "Nicht genug Geld.";
  return null;
}
