// Zentrale Domänentypen von NNAXOS. Diese Typen werden von Server, Client,
// Seed-Skripten und Tests gemeinsam genutzt.

export const TIER_IDS = ["known", "familiar", "unusual", "rare", "very_rare", "legendary"] as const;
export type TierId = (typeof TIER_IDS)[number];

export type ReviewStatus = "draft" | "review" | "verified" | "invalid";

export interface RarityTier {
  id: TierId;
  label: string;
  points: number;
  rank: number; // 1 (bekannt) … 6 (legendär)
}

export interface LevelDef {
  level: number;
  name: string;
  minPoints: number;
}

export interface GameSettings {
  tiers: RarityTier[];
  levels: LevelDef[];
  dailyQuestionCount: number;
  packQuestionCount: number;
  timeLimitSeconds: number;
  /** Erster Tag, für den Tages-Sets existieren (YYYY-MM-DD, Europe/Zurich). */
  launchDate: string;
  timezone: string;
}

export interface SourceRef {
  label: string;
  url?: string;
}

export interface ThemePack {
  id: string; // = slug
  name: string;
  short: string;
  tagline: string;
  description: string;
  topics: string[];
  /** Akzentfarben innerhalb des globalen Designsystems */
  accent: string;
  accentSoft: string;
  ink: string;
  order: number;
  /** Optionales Titelbild (z.B. /packs/geografie.jpg). Ohne Bild wird die Illustration genutzt. */
  coverImage?: string | null;
}

export interface Answer {
  id: string;
  text: string;
  aliases: string[];
  tier: TierId;
  /** Optional: überschreibt die Punktzahl der Seltenheitsstufe */
  pointsOverride?: number | null;
  explanation: string;
  source?: SourceRef | null;
  status: ReviewStatus;
}

/** Bekannte, häufige Falschantworten mit freundlicher Erklärung. */
export interface WrongAnswer {
  text: string;
  aliases?: string[];
  explanation: string;
}

export interface Question {
  id: string;
  packId: string;
  prompt: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  timeLimitSeconds?: number | null;
  status: ReviewStatus;
  sources: SourceRef[];
  notes?: string;
  answers: Answer[];
  wrongAnswers?: WrongAnswer[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentData {
  settings: GameSettings;
  packs: ThemePack[];
  questions: Question[];
}

export type SetKind = "daily" | "pack";

export interface DailySetItem {
  questionId: string;
  /** true, wenn die Frage bereits in einem früheren Set dieser Art vorkam */
  repeat: boolean;
}

export interface DailySet {
  id: string; // daily:2026-11-17 | pack:geografie:2026-11-17
  date: string;
  kind: SetKind;
  packId: string | null;
  items: DailySetItem[];
  createdBy: "auto" | "admin";
  publishedAt: string;
}

export interface AnswerReport {
  id: string;
  questionId: string;
  answerText: string;
  note?: string;
  status: "open" | "accepted" | "rejected";
  createdAt: string;
  resolution?: string;
}

// ---------- Spielablauf ----------

export type PlayMode = "daily" | "pack" | "training" | "unlimited" | "archive" | "ranked" | "atlas";

export type ResultStatus = "accepted" | "known_wrong" | "unknown" | "empty" | "timeout";

export interface AnswerResult {
  questionId: string;
  input: string;
  status: ResultStatus;
  answerId: string | null;
  answerText: string | null;
  tier: TierId | null;
  points: number;
  explanation: string | null;
  matchKind?: "exact" | "alias" | "fuzzy" | null;
  /** Einige andere gültige Antworten als Lernanreiz */
  examples: { text: string; tier: TierId }[];
  sources: SourceRef[];
  /** Weltkarte: richtiger Ort, Tipp und Entfernung */
  geo?: { lat: number; lon: number; guessLat: number | null; guessLon: number | null; km: number | null };
}

export interface PublicQuestion {
  id: string;
  packId: string;
  prompt: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  timeLimitSeconds: number;
  repeat: boolean;
  /** Weltkarten-Frage: Ort auf der Karte antippen */
  kind?: "atlas";
  hint?: string;
}

export interface AttemptAnswer {
  questionId: string;
  prompt: string;
  packId: string;
  input: string;
  status: ResultStatus;
  answerText: string | null;
  tier: TierId | null;
  points: number;
}

export interface AttemptRecord {
  id: string;
  mode: PlayMode;
  official: boolean;
  setId: string | null;
  date: string | null; // Datum des Sets (Europe/Zurich)
  packId: string | null;
  total: number;
  maxTotal: number;
  answers: AttemptAnswer[];
  startedAt: string;
  finishedAt: string;
  /** Lokale Datensätze tragen eine Server-Signatur, mit der sie später ins Konto übernommen werden können. */
  receipt?: string;
}
