import { CAREER } from "./wealth";
import type { AttemptRecord, GameSettings, LevelDef, ThemePack, TierId } from "@/lib/types";
import { addDays, daysBetween } from "@/lib/time";

const TIER_RANK: Record<TierId, number> = { known: 1, familiar: 2, unusual: 3, rare: 4, very_rare: 5, legendary: 6 };
export const tierRank = (t: TierId) => TIER_RANK[t];

export function levelFor(levels: LevelDef[], points: number) {
  const sorted = levels.slice().sort((a, b) => a.minPoints - b.minPoints);
  let current = sorted[0];
  for (const l of sorted) if (points >= l.minPoints) current = l;
  const next = sorted.find((l) => l.minPoints > current.minPoints) ?? null;
  const progress = next ? (points - current.minPoints) / (next.minPoints - current.minPoints) : 1;
  return { current, next, progress: Math.max(0, Math.min(1, progress)), toNext: next ? next.minPoints - points : 0 };
}

/** Datumsschlüssel aller Tage mit abgeschlossener offizieller Daily Challenge */
export function dailyDays(attempts: AttemptRecord[]): string[] {
  const days = new Set<string>();
  for (const a of attempts) if (a.official && a.mode === "daily" && a.date) days.add(a.date);
  return [...days].sort();
}

/**
 * Streak = Anzahl aufeinanderfolgender Tage mit abgeschlossener Daily Challenge.
 * Ein noch nicht gespielter heutiger Tag unterbricht die Serie nicht.
 */
export function computeStreaks(attempts: AttemptRecord[], today: string) {
  const days = dailyDays(attempts);
  const set = new Set(days);
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && daysBetween(prev, d) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  let current = 0;
  let cursor = set.has(today) ? today : addDays(today, -1);
  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }
  return { current, longest, playedToday: set.has(today) };
}

export interface PackStats {
  packId: string;
  challenges: number;
  points: number;
  average: number;
  best: number;
  trainingRounds: number;
}

export interface UserStats {
  totalPoints: number;
  officialCount: number;
  dailyCount: number;
  packCount: number;
  bestDaily: AttemptRecord | null;
  averageDaily: number;
  streak: { current: number; longest: number; playedToday: boolean };
  rareAnswers: number;
  legendaryAnswers: number;
  acceptedAnswers: number;
  answeredTotal: number;
  packsPlayed: number;
  perPack: Record<string, PackStats>;
  bestUnlimited: number;
  todayPoints: number;
  averageTier: number; // 0..6
}

export function computeStats(attempts: AttemptRecord[], packs: ThemePack[], today: string): UserStats {
  const official = attempts.filter((a) => a.official);
  const daily = official.filter((a) => a.mode === "daily");
  const perPack: Record<string, PackStats> = {};
  for (const p of packs) perPack[p.id] = { packId: p.id, challenges: 0, points: 0, average: 0, best: 0, trainingRounds: 0 };
  for (const a of attempts) {
    if (!a.packId || !perPack[a.packId]) continue;
    const ps = perPack[a.packId];
    if (a.official && a.mode === "pack") {
      ps.challenges++;
      ps.points += a.total;
      ps.best = Math.max(ps.best, a.total);
    } else {
      ps.trainingRounds++;
    }
  }
  for (const ps of Object.values(perPack)) ps.average = ps.challenges ? Math.round(ps.points / ps.challenges) : 0;

  let rare = 0;
  let legendary = 0;
  let accepted = 0;
  let answered = 0;
  let tierSum = 0;
  for (const a of attempts) {
    for (const ans of a.answers) {
      answered++;
      if (ans.status === "accepted" && ans.tier) {
        accepted++;
        tierSum += TIER_RANK[ans.tier];
        if (TIER_RANK[ans.tier] >= TIER_RANK.rare) rare++;
        if (ans.tier === "legendary") legendary++;
      }
    }
  }
  const bestDaily = daily.reduce<AttemptRecord | null>((b, a) => (!b || a.total > b.total ? a : b), null);
  return {
    totalPoints: official.reduce((s, a) => s + a.total, 0),
    officialCount: official.length,
    dailyCount: daily.length,
    packCount: official.filter((a) => a.mode === "pack").length,
    bestDaily,
    averageDaily: daily.length ? Math.round(daily.reduce((s, a) => s + a.total, 0) / daily.length) : 0,
    streak: computeStreaks(attempts, today),
    rareAnswers: rare,
    legendaryAnswers: legendary,
    acceptedAnswers: accepted,
    answeredTotal: answered,
    packsPlayed: Object.values(perPack).filter((p) => p.challenges + p.trainingRounds > 0).length,
    perPack,
    bestUnlimited: attempts.filter((a) => a.mode === "unlimited").reduce((m, a) => Math.max(m, a.total), 0),
    todayPoints: official.filter((a) => a.date === today).reduce((s, a) => s + a.total, 0),
    averageTier: accepted ? tierSum / accepted : 0,
  };
}

// ---------- Erfolge ----------

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: "seedling" | "flame" | "gem" | "crown" | "compass" | "mountain" | "star" | "target" | "book" | "feather";
  tier: "bronze" | "silver" | "gold";
  check: (s: UserStats, attempts: AttemptRecord[]) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_challenge", title: "Erster Schritt", description: "Erste Challenge abgeschlossen", icon: "seedling", tier: "bronze", check: (s) => s.officialCount >= 1 },
  { id: "streak_3", title: "Drei am Stück", description: "3 Tage in Folge die Daily Challenge gespielt", icon: "flame", tier: "bronze", check: (s) => s.streak.longest >= 3 },
  { id: "streak_7", title: "Wochenbrand", description: "7 Tage in Folge gespielt", icon: "flame", tier: "silver", check: (s) => s.streak.longest >= 7 },
  { id: "streak_14", title: "Zwei Wochen Glut", description: "14 Tage in Folge gespielt", icon: "flame", tier: "silver", check: (s) => s.streak.longest >= 14 },
  { id: "streak_30", title: "Monatsfeuer", description: "30 Tage in Folge gespielt", icon: "flame", tier: "gold", check: (s) => s.streak.longest >= 30 },
  { id: "streak_100", title: "Ewige Flamme", description: "100 Tage in Folge gespielt", icon: "crown", tier: "gold", check: (s) => s.streak.longest >= 100 },
  { id: "daily_10", title: "Stammgast", description: "10 Daily Challenges gespielt", icon: "compass", tier: "silver", check: (s) => s.dailyCount >= 10 },
  { id: "points_1000", title: "Tausender", description: "1.000 Punkte gesammelt", icon: "star", tier: "bronze", check: (s) => s.totalPoints >= 1000 },
  { id: "points_10000", title: "Schatzkammer", description: "10.000 Punkte gesammelt", icon: "star", tier: "gold", check: (s) => s.totalPoints >= 10000 },
  { id: "legendary_1", title: "Legendärer Fund", description: "Erste legendäre Antwort gefunden", icon: "gem", tier: "silver", check: (s) => s.legendaryAnswers >= 1 },
  { id: "rare_10", title: "Spürnase", description: "10 seltene Antworten gefunden", icon: "feather", tier: "bronze", check: (s) => s.rareAnswers >= 10 },
  { id: "rare_100", title: "Raritätensammler", description: "100 seltene Antworten gefunden", icon: "gem", tier: "gold", check: (s) => s.rareAnswers >= 100 },
  { id: "perfect_daily", title: "Volltreffer", description: "Alle Fragen einer Daily Challenge gültig beantwortet", icon: "target", tier: "silver", check: (_s, at) => at.some((a) => a.official && a.mode === "daily" && a.answers.length > 0 && a.answers.every((x) => x.status === "accepted")) },
  { id: "score_500", title: "Hochplateau", description: "500+ Punkte in einer Daily Challenge", icon: "mountain", tier: "gold", check: (s) => (s.bestDaily?.total ?? 0) >= 500 },
  { id: "all_packs", title: "Weltenbummler", description: "In jedem Themen-Pack mindestens eine Challenge gespielt", icon: "book", tier: "gold", check: (s) => Object.values(s.perPack).every((p) => p.challenges + p.trainingRounds > 0) },
];

export function earnedAchievements(stats: UserStats, attempts: AttemptRecord[]): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(stats, attempts)).map((a) => a.id);
}

export function defaultLevels(): LevelDef[] {
  return CAREER.map((l) => ({ ...l }));
}

export function settingsMaxTotal(settings: GameSettings, count: number) {
  return Math.max(...settings.tiers.map((t) => t.points)) * count;
}
