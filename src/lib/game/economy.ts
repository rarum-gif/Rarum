import type { AttemptRecord, TierId } from "@/lib/types";
import { CATALOG, FREE_ITEMS, catalogItem, type CatalogItem } from "./catalog";
import { seasonHistory, type SeasonResult } from "./ranked";
import { MONETIZATION } from "@/lib/monetization";

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
  const base = a.mode === "unlimited" || a.mode === "training" ? 20 : a.official || a.mode === "ranked" ? 100 : a.mode === "atlas" ? 50 : 60;
  const perfect = a.answers.length >= 5 && correct === a.answers.length ? 50 : 0;
  return base + correct * 15 + perfect;
}

export function cashForAnswer(tier: TierId | null, level: number, factor = 1): number {
  if (!tier) return 0;
  return Math.round(TIER_CASH[tier] * cashMultiplier(level) * factor);
}

/**
 * Freie Runden (Endlos, Training, Archiv) zahlen einen Viertel – sonst wäre
 * stundenlanges Endlosspielen der einzige Weg zum Reichtum. Gilt für Runden ab dem
 * Stichtag, damit bestehende Kontostände nicht schrumpfen.
 */
export const PRACTICE_CASH_SINCE = "2026-11-19T00:00:00.000Z";
export function cashFactor(a: Pick<AttemptRecord, "mode" | "official" | "finishedAt" | "startedAt">): number {
  if (a.official || a.mode === "ranked" || a.mode === "atlas") return a.mode === "atlas" ? 0.5 : 1;
  return (a.finishedAt || a.startedAt) >= PRACTICE_CASH_SINCE ? 0.25 : 1;
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
  seasons: SeasonResult[];
  seasonRewards: number;
}

/** Spielt alle Runden in zeitlicher Reihenfolge nach und berechnet Geld, XP und Level. */
export function computeEconomy(attempts: AttemptRecord[], now = new Date()): Economy {
  const sorted = attempts.slice().sort((a, b) => (a.finishedAt || a.startedAt).localeCompare(b.finishedAt || b.startedAt));
  let xp = 0;
  let earned = 0;
  const rounds: Record<string, RoundEconomy> = {};
  for (const a of sorted) {
    const levelBefore = levelForXp(xp).level;
    let cash = 0;
    const f = cashFactor(a);
    for (const ans of a.answers) if (ans.status === "accepted") cash += cashForAnswer(ans.tier, levelBefore, f);
    const gained = xpForAttempt(a);
    earned += cash;
    xp += gained;
    rounds[a.id] = { cash, xp: gained, levelBefore, levelAfter: levelForXp(xp).level };
  }
  // Saison-Belohnungen (mind. 3 Ranked-Matches in einer abgeschlossenen Woche)
  const seasons = seasonHistory(attempts, now);
  const seasonRewards = seasons.reduce((s, r) => s + r.reward, 0);
  earned += seasonRewards;
  return { earned, xp, level: levelForXp(xp), rounds, seasons, seasonRewards };
}

// ---------------------------------------------------------------------------
// Shop
// ---------------------------------------------------------------------------

export type ShopItem = CatalogItem;
export const SHOP = CATALOG;
export const shopItem = catalogItem;

export interface Purchase {
  itemId: string;
  price: number;
  at: string;
}

export function ownedCount(purchases: Purchase[], id: string) {
  return (FREE_ITEMS.has(id) ? 1 : 0) + purchases.filter((p) => p.itemId === id).length;
}

export function walletOf(economy: Economy, purchases: Purchase[]) {
  const spent = purchases.reduce((s, p) => s + p.price, 0);
  const assets = purchases.reduce((s, p) => s + (shopItem(p.itemId)?.price ?? 0), 0);
  return { balance: economy.earned - spent, spent, assets, netWorth: economy.earned - spent + assets };
}

/** Prüft einen Kauf – identisch auf Client und Server. */
export function canBuy(item: ShopItem, economy: Economy, purchases: Purchase[], premium = false): string | null {
  const max = item.stack ?? 1;
  if (ownedCount(purchases, item.id) >= max) return max > 1 ? `Maximal ${max} Stück.` : "Gehört dir schon.";
  if (item.premium && !premium && MONETIZATION) return "Nur mit Premium.";
  if (economy.level.level < item.minLevel) return `Ab Level ${item.minLevel}.`;
  if (walletOf(economy, purchases).balance < item.price) return "Nicht genug Geld.";
  return null;
}
