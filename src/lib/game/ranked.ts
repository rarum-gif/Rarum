import type { AttemptRecord } from "@/lib/types";
import { addDays, dateKey, startOfDay, weekStart } from "@/lib/time";

/**
 * Ranked-Modus
 * ------------
 * Jede Ranked-Runde besteht aus 7 Zufallsfragen aus allen Themenwelten.
 * Das Ergebnis verändert deine Ranglistenpunkte (RP): Wer mehr als den Richtwert
 * holt, steigt, wer darunter bleibt, verliert ein wenig. Eine Saison dauert
 * eine Woche (Montag 00:00 Uhr, Europe/Zurich) – danach startet jeder wieder bei 1000 RP.
 *
 * Die Formel ist bewusst einfach und reihenfolgeunabhängig, damit sie in der
 * Datenbank (SQL-Funktion ranked_delta) identisch berechnet werden kann.
 */

export const RANKED_QUESTIONS = 7;
export const RANKED_START_RP = 1000;
export const RANKED_PAR = 220;

export function rankedDelta(points: number): number {
  return Math.max(-25, Math.min(60, Math.round((points - RANKED_PAR) / 6)));
}

export interface Division {
  id: string;
  name: string;
  min: number;
  color: string;
}

export const DIVISIONS: Division[] = [
  { id: "bronze", name: "Bronze", min: 0, color: "#c8875a" },
  { id: "silver", name: "Silber", min: 1050, color: "#c9d1e0" },
  { id: "gold", name: "Gold", min: 1150, color: "#f2c14e" },
  { id: "platinum", name: "Platin", min: 1300, color: "#2fd6c6" },
  { id: "diamond", name: "Diamant", min: 1500, color: "#7cc4ff" },
  { id: "champion", name: "Champion", min: 1800, color: "#ff5fa2" },
];

export function divisionFor(rp: number) {
  let i = 0;
  for (let k = 0; k < DIVISIONS.length; k++) if (rp >= DIVISIONS[k].min) i = k;
  const next = DIVISIONS[i + 1] ?? null;
  const cur = DIVISIONS[i];
  return { division: cur, index: i, next, progress: next ? (rp - cur.min) / (next.min - cur.min) : 1, toNext: next ? next.min - rp : 0 };
}

export interface RankedSummary {
  rp: number;
  matches: number;
  best: number;
  lastDelta: number | null;
}

/** RP einer Saison aus den eigenen Runden (Gäste: lokal gespeicherte, signierte Runden). */
export function rankedFromAttempts(attempts: AttemptRecord[], seasonStartIso: string): RankedSummary {
  const ranked = attempts
    .filter((a) => a.mode === "ranked" && a.startedAt >= seasonStartIso)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  let rp = RANKED_START_RP;
  let best = 0;
  let lastDelta: number | null = null;
  for (const a of ranked) {
    lastDelta = rankedDelta(a.total);
    rp += lastDelta;
    best = Math.max(best, a.total);
  }
  return { rp, matches: ranked.length, best, lastDelta };
}

/** Saison = Kalenderwoche (Mo 00:00 bis Mo 00:00, Europe/Zurich) */
export function season(todayKey: string, timeZone?: string) {
  const startKey = weekStart(todayKey);
  const start = startOfDay(startKey, timeZone);
  const end = startOfDay(addDays(startKey, 7), timeZone);
  const [y, m, d] = startKey.split("-").map(Number);
  // ISO-Kalenderwoche: Woche mit dem Donnerstag
  const thu = new Date(Date.UTC(y, m - 1, d + 3));
  const jan1 = Date.UTC(thu.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((thu.getTime() - jan1) / 86400000 + 1) / 7);
  return { startKey, start: start.toISOString(), end: end.toISOString(), week, label: `Saison KW ${week}` };
}

/** Beispiel-Rivalen für den Demo-Modus (ohne Konten). Deterministisch pro Saison, klar als Demo gekennzeichnet. */
export function demoRivals(seasonKey: string) {
  const names = ["NeonNomad", "PalmPilot", "SunsetSage", "MarinaMaven", "DecoDetective", "TropicTitan", "OceanOracle", "SkylineSam", "FlamingoFox", "CoastCaptain", "VelvetVoyager", "BayouBrain"];
  let h = 2166136261;
  for (const c of seasonKey) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0), (h % 10000) / 10000);
  return names.map((name) => {
    const matches = 2 + Math.floor(rnd() * 12);
    const rp = Math.round(RANKED_START_RP + (rnd() - 0.25) * 60 * Math.sqrt(matches) * 2.2);
    return { name, rp, matches, best: Math.min(700, Math.round(RANKED_PAR + 120 + rnd() * 260)), avatar: AVATARS[Math.floor(rnd() * AVATARS.length)] };
  });
}
const AVATARS = ["fern", "mountain", "wave", "owl", "pine", "sun", "moon", "feather", "compass", "shell"];

/** Belohnung am Saisonende je erreichter Liga (Bronze … Champion) */
export const SEASON_REWARD = [0, 1500, 4000, 9000, 20000, 45000];

export interface SeasonResult {
  key: string;
  label: string;
  rp: number;
  matches: number;
  division: Division;
  reward: number;
}

/** Abgeschlossene Saisons mit Endstand und Belohnung (deterministisch aus den Runden) */
export function seasonHistory(attempts: AttemptRecord[], now = new Date()): SeasonResult[] {
  const current = weekStart(dateKey(now));
  const keys = new Set<string>();
  for (const a of attempts) if (a.mode === "ranked") keys.add(weekStart(dateKey(new Date(a.startedAt))));
  const out: SeasonResult[] = [];
  for (const key of [...keys].sort()) {
    if (key >= current) continue;
    const s = season(key);
    const inSeason = attempts.filter((a) => a.mode === "ranked" && a.startedAt >= s.start && a.startedAt < s.end);
    const r = rankedFromAttempts(inSeason, s.start);
    const d = divisionFor(r.rp);
    out.push({ key, label: s.label, rp: r.rp, matches: r.matches, division: d.division, reward: r.matches >= 3 ? SEASON_REWARD[d.index] : 0 });
  }
  return out;
}
