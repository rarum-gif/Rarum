import type { LevelDef } from "@/lib/types";

/**
 * Vom Strand zur Skyline
 * ----------------------
 * Punkte sind Geld: Jeder Punkt ist 1’000 $ wert. In jeder Runde steigst du
 * die Leiter hinauf – von „Pleite am Strand“ bis zur „Privatinsel“. Über alle
 * offiziellen Wertungen hinweg wächst dein Vermögen und mit ihm dein Karriere-Rang.
 */

export const CASH_PER_POINT = 1000;

export interface Stage {
  id: string;
  name: string;
  /** Anteil der maximal möglichen Punkte einer Runde (0–1) */
  at: number;
  line: string;
  image: string;
}

/** Stufen innerhalb einer Runde – relativ zur maximal möglichen Punktzahl. */
export const STAGES: Stage[] = [
  { id: "broke", name: "Pleite am Strand", at: 0, line: "Nur Sand in den Taschen.", image: "broke" },
  { id: "busker", name: "Strassenmusiker", at: 0.06, line: "Die ersten Münzen im Gitarrenkoffer.", image: "busker" },
  { id: "truck", name: "Food Truck", at: 0.14, line: "Tacos, Neonlicht und eine Schlange vor dem Fenster.", image: "truck" },
  { id: "motel", name: "Motel am Highway", at: 0.24, line: "Ein Zimmer mit Pool – fast.", image: "motel" },
  { id: "cabrio", name: "Cabrio", at: 0.35, line: "Verdeck runter, Ocean Drive rauf.", image: "cabrio" },
  { id: "club", name: "Nachtclub", at: 0.46, line: "Dein Name leuchtet über dem Eingang.", image: "club" },
  { id: "villa", name: "Strandvilla", at: 0.57, line: "Palmen, Pool und Meerblick.", image: "villa" },
  { id: "penthouse", name: "Penthouse", at: 0.68, line: "Die ganze Skyline unter dir.", image: "penthouse" },
  { id: "yacht", name: "Superyacht", at: 0.8, line: "Anker werfen, wo es dir gefällt.", image: "yacht" },
  { id: "jet", name: "Privatjet", at: 0.9, line: "Wochenende? Irgendwo anders.", image: "jet" },
  { id: "island", name: "Privatinsel", at: 0.985, line: "Perfekter Lauf. Die Insel gehört dir.", image: "island" },
];

export function stageFor(points: number, maxPoints: number): { stage: Stage; index: number; next: Stage | null; progress: number } {
  const p = maxPoints > 0 ? Math.max(0, points) / maxPoints : 0;
  let index = 0;
  for (let i = 0; i < STAGES.length; i++) if (p >= STAGES[i].at) index = i;
  const stage = STAGES[index];
  const next = STAGES[index + 1] ?? null;
  const progress = next ? (p - stage.at) / (next.at - stage.at) : 1;
  return { stage, index, next, progress: Math.max(0, Math.min(1, progress)) };
}

/** Karriere-Ränge nach Gesamtvermögen (offizielle Punkte). */
export const CAREER: LevelDef[] = [
  { level: 1, name: "Pleite", minPoints: 0 },
  { level: 2, name: "Tellerwäscher", minPoints: 100 },
  { level: 3, name: "Strassenhändler", minPoints: 350 },
  { level: 4, name: "Hustler", minPoints: 800 },
  { level: 5, name: "Kleinunternehmer", minPoints: 1600 },
  { level: 6, name: "Unternehmer", minPoints: 3000 },
  { level: 7, name: "Investor", minPoints: 5000 },
  { level: 8, name: "Immobilienhai", minPoints: 8000 },
  { level: 9, name: "Tycoon", minPoints: 12500 },
  { level: 10, name: "Mogul", minPoints: 19000 },
  { level: 11, name: "Legende der Küste", minPoints: 28000 },
];

export function cashOf(points: number) {
  return points * CASH_PER_POINT;
}

/** 1’250’000 → "$1.25M" – kompakt für HUDs */
export function formatCash(dollars: number, opts: { compact?: boolean } = {}): string {
  const compact = opts.compact ?? true;
  const sign = dollars < 0 ? "-" : "";
  const v = Math.abs(dollars);
  if (!compact || v < 10_000) return `${sign}$${Math.round(v).toLocaleString("de-CH")}`;
  const units: [number, string][] = [[1e9, "B"], [1e6, "M"], [1e3, "K"]];
  for (const [u, s] of units) {
    if (v >= u) {
      const n = v / u;
      const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2;
      return `${sign}$${n.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1")}${s}`;
    }
  }
  return `${sign}$${v}`;
}
