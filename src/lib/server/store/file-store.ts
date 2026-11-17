import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { AnswerReport, ContentData, DailySet, GameSettings, Question, ThemePack } from "@/lib/types";
import { seedContent } from "@/content";
import type { ContentStore } from "./types";

interface StoreData extends ContentData {
  version: 1;
  sets: DailySet[];
  reports: AnswerReport[];
}

/**
 * Dateibasierter Store für den Demo-Modus. Beim ersten Start wird
 * data/store.json aus den Seed-Inhalten erzeugt. Admin-Änderungen, geplante
 * und eingefrorene Tages-Sets sowie Meldungen werden dort gespeichert.
 */
export class FileStore implements ContentStore {
  readonly kind = "file" as const;
  persistent = true;
  private data: StoreData | null = null;
  private loading: Promise<StoreData> | null = null;
  private writeChain: Promise<void> = Promise.resolve();

  constructor(private readonly file: string) {}

  private async load(): Promise<StoreData> {
    if (this.data) return this.data;
    if (!this.loading) {
      this.loading = (async () => {
        try {
          const raw = await fs.readFile(this.file, "utf8");
          const parsed = JSON.parse(raw) as StoreData;
          this.data = parsed;
        } catch {
          const seed = seedContent();
          this.data = { version: 1, ...seed, sets: [], reports: [] };
          await this.flush();
        }
        return this.data!;
      })();
    }
    return this.loading;
  }

  private flush(): Promise<void> {
    this.writeChain = this.writeChain.then(async () => {
      if (!this.data || !this.persistent) return;
      try {
        await fs.mkdir(path.dirname(this.file), { recursive: true });
        const tmp = this.file + "." + process.pid + ".tmp";
        await fs.writeFile(tmp, JSON.stringify(this.data, null, 1), "utf8");
        await fs.rename(tmp, this.file);
      } catch (e) {
        this.persistent = false;
        console.warn("[rarum] Store kann nicht gespeichert werden – Änderungen bleiben nur im Speicher.", e);
      }
    });
    return this.writeChain;
  }

  async getContent(): Promise<ContentData> {
    const d = await this.load();
    return { settings: d.settings, packs: d.packs, questions: d.questions };
  }

  async saveQuestion(q: Question) {
    const d = await this.load();
    const i = d.questions.findIndex((x) => x.id === q.id);
    if (i >= 0) d.questions[i] = q;
    else d.questions.push(q);
    await this.flush();
  }

  async deleteQuestion(id: string) {
    const d = await this.load();
    d.questions = d.questions.filter((q) => q.id !== id);
    await this.flush();
  }

  async importQuestions(qs: Question[]) {
    const d = await this.load();
    let created = 0;
    let updated = 0;
    for (const q of qs) {
      const i = d.questions.findIndex((x) => x.id === q.id);
      if (i >= 0) {
        d.questions[i] = q;
        updated++;
      } else {
        d.questions.push(q);
        created++;
      }
    }
    await this.flush();
    return { created, updated };
  }

  async saveSettings(s: GameSettings) {
    const d = await this.load();
    d.settings = s;
    await this.flush();
  }

  async savePack(p: ThemePack) {
    const d = await this.load();
    const i = d.packs.findIndex((x) => x.id === p.id);
    if (i >= 0) d.packs[i] = p;
    await this.flush();
  }

  async listSets() {
    return (await this.load()).sets;
  }

  async insertSets(sets: DailySet[]) {
    if (!sets.length) return;
    const d = await this.load();
    const have = new Set(d.sets.map((s) => s.id));
    for (const s of sets) if (!have.has(s.id)) d.sets.push(s);
    await this.flush();
  }

  async replacePlannedSet(set: DailySet) {
    const d = await this.load();
    d.sets = d.sets.filter((s) => s.id !== set.id);
    d.sets.push(set);
    await this.flush();
  }

  async deleteSet(id: string) {
    const d = await this.load();
    d.sets = d.sets.filter((s) => s.id !== id);
    await this.flush();
  }

  async addReport(r: AnswerReport) {
    const d = await this.load();
    d.reports.push(r);
    if (d.reports.length > 5000) d.reports.shift();
    await this.flush();
  }

  async listReports() {
    return (await this.load()).reports;
  }

  async updateReport(id: string, patch: Partial<AnswerReport>) {
    const d = await this.load();
    const r = d.reports.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
    await this.flush();
  }
}
