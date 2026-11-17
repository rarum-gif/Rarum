import type { AnswerReport, ContentData, DailySet, GameSettings, Question, ThemePack } from "@/lib/types";

export interface ContentStore {
  readonly kind: "file" | "supabase";
  /** false, wenn Änderungen nicht dauerhaft gespeichert werden können (z.B. read-only Dateisystem) */
  readonly persistent: boolean;
  getContent(): Promise<ContentData>;
  saveQuestion(q: Question): Promise<void>;
  deleteQuestion(id: string): Promise<void>;
  importQuestions(qs: Question[]): Promise<{ created: number; updated: number }>;
  saveSettings(s: GameSettings): Promise<void>;
  savePack(p: ThemePack): Promise<void>;
  listSets(): Promise<DailySet[]>;
  /** Fügt Sets ein; bereits vorhandene IDs werden nie überschrieben. */
  insertSets(sets: DailySet[]): Promise<void>;
  /** Ersetzt ein geplantes (zukünftiges) Set. Prüfung auf "Zukunft" erfolgt im Aufrufer. */
  replacePlannedSet(set: DailySet): Promise<void>;
  deleteSet(id: string): Promise<void>;
  addReport(r: AnswerReport): Promise<void>;
  listReports(): Promise<AnswerReport[]>;
  updateReport(id: string, patch: Partial<AnswerReport>): Promise<void>;
}
