import "server-only";
import { randomInt } from "node:crypto";
import type { AnswerResult, AttemptAnswer, AttemptRecord, ContentData, PlayMode, PublicQuestion, Question, ResultStatus, TierId } from "@/lib/types";
import { ATLAS, ATLAS_ROUND, ATLAS_TIME, atlasPlace } from "@/content/atlas";
import { geoPoints, haversineKm } from "@/lib/game/geo";
import { isEligible, setId as makeSetId } from "@/lib/game/schedule";
import { evaluateAnswer, maxPointsPerQuestion } from "@/lib/game/scoring";
import { RANKED_QUESTIONS } from "@/lib/game/ranked";
import { isValidDateKey, formatDateDe } from "@/lib/time";
import { getStore } from "./store";
import { ensureSets, toPublicQuestion, todayKey } from "./daily";
import { newId, sign, verify } from "./tokens";
import type { SessionUser } from "./supabase";
import * as progress from "./progress";

/**
 * Spiel-Engine
 * ------------
 * Der gesamte Ablauf einer Runde wird serverseitig gesteuert:
 *  - Fragen werden einzeln ausgegeben; der Server merkt sich den Startzeitpunkt.
 *  - Ein Neuladen liefert dieselbe Frage mit derselben Startzeit (keine Zusatzzeit).
 *  - Antworten werden nur auf dem Server ausgewertet; Punkte kann der Client nicht setzen.
 *  - Für Gäste steckt der Zustand in einem signierten Token, für eingeloggte
 *    Nutzer zusätzlich in der Datenbank (dort ist die Datenbank massgeblich).
 */

export class RunError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

interface CompactAnswer {
  q: string;
  in: string;
  s: ResultStatus;
  a: string | null;
  t: TierId | null;
  p: number;
}

export interface RunState {
  v: 1;
  rid: string;
  mode: PlayMode;
  official: boolean;
  setId: string | null;
  date: string | null;
  packId: string | null;
  qs: string[];
  rep: boolean[];
  i: number;
  st: number | null;
  ans: CompactAnswer[];
  total: number;
  max: number;
  t0: number;
  uid: string | null;
  aid: string | null;
  done: boolean;
  /** Endlos-Modi: Schwierigkeit, maximale Länge, zu meidende Fragen */
  diff?: Difficulty;
  cap?: number;
  av?: string[];
}

export type Difficulty = "leicht" | "normal" | "schwer" | "mix";
/** Kostenlos: Endlos-Runden mit 10 Fragen am Stück; Premium: bis 60 */
export const FREE_ENDLESS = 10;
const isEndless = (m: PlayMode) => m === "unlimited" || m === "training";
const isVariant = (q: Question) => q.id.includes("-buchstabe-");
function diffOk(q: Question, d?: Difficulty) {
  if (d === "leicht") return q.difficulty === 1 && !isVariant(q);
  if (d === "normal") return q.difficulty <= 2 && !isVariant(q);
  if (d === "schwer") return q.difficulty === 3 || isVariant(q);
  return true;
}

/** Fragetext auch für Weltkarten-Fragen */
export function promptOf(content: ContentData, id: string) {
  if (id.startsWith("atlas:")) {
    const p = atlasPlace(id.slice(6));
    return { prompt: p ? `Wo liegt ${p.name}?` : "Weltkarte", packId: "geografie" };
  }
  const q = content.questions.find((x) => x.id === id);
  return { prompt: q?.prompt ?? "", packId: q?.packId ?? "" };
}

export interface RunMeta {
  mode: PlayMode;
  official: boolean;
  title: string;
  subtitle: string;
  total: number | null; // null = unbegrenzt
  setId: string | null;
  date: string | null;
  packId: string | null;
  repeats: number;
  answered: number;
  points: number;
  practiceReason?: "already_played" | "past_date" | "training";
  cap?: number | null;
  difficulty?: Difficulty | null;
}

const UNLIMITED_MAX = 60;

// Gäste: bereits beantwortete Fragen merken, damit ein altes Token nicht erneut
// eingereicht werden kann (Schutz gegen „Antwort ansehen und nochmal versuchen“).
const answeredGuest = new Map<string, number>();
function markGuestAnswered(rid: string, i: number): boolean {
  const key = rid + ":" + i;
  const now = Date.now();
  if (answeredGuest.size > 50_000) {
    for (const [k, t] of answeredGuest) if (now - t > 36 * 3600_000) answeredGuest.delete(k);
    if (answeredGuest.size > 50_000) answeredGuest.clear();
  }
  if (answeredGuest.has(key)) return false;
  answeredGuest.set(key, now);
  return true;
}
const TOKEN = "run";

function encode(s: RunState) {
  return sign(s, TOKEN);
}

export function decodeRun(token: unknown, user: SessionUser | null): RunState {
  const s = verify<RunState>(token, TOKEN);
  if (!s || s.v !== 1) throw new RunError("Diese Runde ist ungültig oder abgelaufen.", 400);
  if (s.uid && s.uid !== user?.id) throw new RunError("Diese Runde gehört zu einem anderen Konto.", 403);
  if (!s.uid && user && s.aid) throw new RunError("Bitte erneut anmelden.", 401);
  return s;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

function packName(content: ContentData, id: string | null) {
  return content.packs.find((p) => p.id === id)?.name ?? "";
}

export interface StartInput {
  mode: PlayMode;
  packId?: string | null;
  date?: string | null;
  /** Gäste: Client meldet, dass die offizielle Runde lokal bereits gespielt wurde */
  practice?: boolean;
  difficulty?: Difficulty | null;
  /** zuletzt gesehene Fragen (Gäste) – werden nach Möglichkeit gemieden */
  avoid?: string[];
  premium?: boolean;
}

export async function startRun(input: StartInput, user: SessionUser | null, now = new Date()) {
  const store = getStore();
  const content = await store.getContent();
  const sets = await ensureSets(content, now);
  const today = todayKey(content, now);
  const per = maxPointsPerQuestion(content.settings);

  let mode = input.mode;
  let official = false;
  let qs: string[] = [];
  let rep: boolean[] = [];
  let sid: string | null = null;
  let date: string | null = null;
  let packId: string | null = input.packId ?? null;
  let practiceReason: RunMeta["practiceReason"];

  if (packId && !content.packs.some((p) => p.id === packId)) throw new RunError("Unbekanntes Themen-Pack.");

  if (mode === "daily" || mode === "pack" || mode === "archive") {
    date = input.date && isValidDateKey(input.date) ? input.date : today;
    if (date > today) throw new RunError("Dieses Tages-Set ist noch nicht veröffentlicht.", 403);
    if (date < content.settings.launchDate) throw new RunError("Für dieses Datum gibt es kein Tages-Set.", 404);
    const kind = mode === "archive" ? (packId ? "pack" : "daily") : mode === "pack" ? "pack" : "daily";
    if (kind === "pack" && !packId) throw new RunError("Themen-Pack fehlt.");
    sid = makeSetId(kind, date, kind === "pack" ? packId : null);
    const set = sets.find((s) => s.id === sid);
    if (!set || !set.items.length) throw new RunError("Für dieses Set sind noch keine geprüften Fragen vorhanden.", 404);
    qs = set.items.map((i) => i.questionId);
    rep = set.items.map((i) => i.repeat);
    if (kind === "daily") packId = null;
    official = mode !== "archive" && date === today && !input.practice;
    if (mode !== "archive" && date !== today) {
      mode = "archive";
      practiceReason = "past_date";
    }
    if (input.practice && date === today) practiceReason = "already_played";
  } else if (mode === "training") {
    if (!packId) throw new RunError("Themen-Pack fehlt.");
    const pool = content.questions.filter((q) => q.packId === packId && isEligible(q));
    if (!pool.length) throw new RunError("Dieses Pack hat noch keine geprüften Fragen.", 404);
    qs = [];
    practiceReason = "training";
  } else if (mode === "unlimited") {
    packId = null;
    qs = [];
  } else if (mode === "atlas") {
    packId = null;
    // gemischte Schwierigkeit: je Runde mindestens ein leichter und ein schwerer Ort
    const avoid = new Set((input.avoid ?? []).filter((x) => x.startsWith("atlas:")).map((x) => x.slice(6)));
    const fresh = ATLAS.filter((p) => !avoid.has(p.id));
    const base = fresh.length >= ATLAS_ROUND * 2 ? fresh : ATLAS;
    const by = (l: number) => pickRandom(base.filter((p) => p.level === l), 5);
    const mix = [...by(1).slice(0, 2), ...by(2).slice(0, 2), ...by(3).slice(0, 1)];
    qs = pickRandom(mix, ATLAS_ROUND).map((p) => `atlas:${p.id}`);
    rep = qs.map(() => false);
  } else if (mode === "ranked") {
    packId = null;
    const pool = content.questions.filter((q) => isEligible(q));
    if (pool.length < RANKED_QUESTIONS) throw new RunError("Für Ranked gibt es noch zu wenige geprüfte Fragen.", 404);
    // je Themenwelt höchstens eine Frage, damit jede Ranked-Runde breit gemischt ist
    const byPack = new Map<string, typeof pool>();
    for (const q of pickRandom(pool, pool.length)) byPack.set(q.packId, [...(byPack.get(q.packId) ?? []), q]);
    const firsts = pickRandom([...byPack.values()].map((l) => l[0]), RANKED_QUESTIONS);
    qs = firsts.map((q) => q.id);
    rep = qs.map(() => false);
  } else {
    throw new RunError("Unbekannter Spielmodus.");
  }

  const state: RunState = {
    v: 1, rid: newId("r_"), mode, official, setId: sid, date, packId, qs, rep, i: 0, st: null, ans: [], total: 0,
    max: per * qs.length, t0: now.getTime(), uid: user?.id ?? null, aid: null, done: false,
  };
  if (isEndless(mode)) {
    const d = input.difficulty;
    state.diff = d === "leicht" || d === "normal" || d === "schwer" ? d : "mix";
    state.cap = input.premium ? UNLIMITED_MAX : FREE_ENDLESS;
    state.av = (input.avoid ?? []).filter((x) => typeof x === "string").slice(-120);
  }

  // Eingeloggt: Datenbank ist massgeblich (eine offizielle Wertung pro Set)
  if (user) {
    if (official && sid) {
      const existing = await progress.findOfficialAttempt(user.id, sid);
      if (existing?.finished_at) {
        state.official = false;
        state.mode = "archive";
        practiceReason = "already_played";
      } else if (existing) {
        await hydrateFromDb(state, existing, content);
      }
    }
    if (!state.aid) {
      const row = await progress.createAttempt({
        user_id: user.id, mode: state.mode, official: state.official, set_id: state.setId, set_date: state.date,
        pack_id: state.packId, question_ids: state.qs, max_total: state.max,
      });
      state.aid = row.id;
      if (row.official && state.official) await hydrateFromDb(state, row, content);
    }
  }

  const meta = buildMeta(content, state, practiceReason);
  return { token: encode(state), meta, state };
}

async function hydrateFromDb(state: RunState, row: progress.AttemptRow, content: ContentData) {
  state.aid = row.id;
  state.qs = row.question_ids;
  state.max = row.max_total || maxPointsPerQuestion(content.settings) * row.question_ids.length;
  state.t0 = new Date(row.started_at).getTime();
  const rows = await progress.getAnswerRows(row.id);
  state.ans = rows
    .filter((r) => r.answered_at)
    .map((r) => ({ q: r.question_id, in: r.input ?? "", s: r.status, a: r.answer_text, t: r.tier, p: r.points }));
  state.total = state.ans.reduce((s, a) => s + a.p, 0);
  state.i = state.ans.length;
  const open = rows.find((r) => r.position === state.i && !r.answered_at);
  state.st = open ? new Date(open.started_at).getTime() : null;
  state.done = state.i >= state.qs.length;
}

function buildMeta(content: ContentData, s: RunState, practiceReason?: RunMeta["practiceReason"]): RunMeta {
  const pack = packName(content, s.packId);
  let title = "";
  let subtitle = "";
  switch (s.mode) {
    case "daily":
      title = "Daily Challenge";
      subtitle = s.date ? formatDateDe(s.date) : "";
      break;
    case "pack":
      title = `${pack} · Tages-Challenge`;
      subtitle = s.date ? formatDateDe(s.date) : "";
      break;
    case "training":
      title = `${pack} · Endlos`;
      subtitle = "";
      break;
    case "atlas":
      title = "Weltkarte";
      subtitle = "";
      break;
    case "unlimited":
      title = "Unlimited";
      subtitle = "Fragen aus allen 15 Themenwelten";
      break;
    case "archive":
      title = s.packId ? `${pack} · Archiv` : "Daily Challenge · Archiv";
      subtitle = s.date ? formatDateDe(s.date) : "";
      break;
    case "ranked":
      title = "Ranked Match";
      subtitle = "7 Fragen aus allen Welten · zählt für die Wochen-Rangliste";
      break;
  }
  return {
    mode: s.mode, official: s.official, title, subtitle, total: isEndless(s.mode) ? null : s.qs.length, cap: s.cap ?? null, difficulty: s.diff ?? null,
    setId: s.setId, date: s.date, packId: s.packId, repeats: s.rep.filter(Boolean).length, answered: s.i, points: s.total, practiceReason,
  };
}

export interface QuestionPayload {
  index: number;
  total: number | null;
  question: PublicQuestion;
  startedAt: string;
  deadline: string;
  serverNow: string;
}

export async function nextQuestion(token: unknown, user: SessionUser | null, now = new Date(), opts: { peek?: boolean } = {}): Promise<{ token: string; done: boolean; payload?: QuestionPayload; meta: RunMeta }> {
  const s = decodeRun(token, user);
  const content = await getStore().getContent();
  if (s.done) return { token: encode(s), done: true, meta: buildMeta(content, s) };

  // peek: nur nachsehen, ob bereits eine Frage läuft – startet KEINE neue Frage
  if (opts.peek) {
    let started: number | null = s.st;
    if (s.aid && s.i < s.qs.length) {
      const row = (await progress.getAnswerRows(s.aid)).find((r) => r.position === s.i && !r.answered_at);
      started = row ? new Date(row.started_at).getTime() : null;
    }
    if (started == null || s.i >= s.qs.length) return { token: encode(s), done: false, meta: buildMeta(content, s) };
    s.st = started;
  }

  // Endlos: nächste Zufallsfrage anhängen
  if (isEndless(s.mode) && s.i >= s.qs.length) {
    if (s.qs.length >= (s.cap ?? UNLIMITED_MAX)) {
      s.done = true;
      return { token: encode(s), done: true, meta: buildMeta(content, s) };
    }
    const recent = new Set([...s.qs.slice(-80), ...(s.av ?? [])]);
    const inScope = (q: Question) => isEligible(q) && (!s.packId || q.packId === s.packId);
    let pool = content.questions.filter((q) => inScope(q) && diffOk(q, s.diff) && !recent.has(q.id));
    if (!pool.length) pool = content.questions.filter((q) => inScope(q) && diffOk(q, s.diff) && !s.qs.slice(-80).includes(q.id));
    if (!pool.length) pool = content.questions.filter((q) => inScope(q) && !s.qs.slice(-20).includes(q.id));
    if (!pool.length) pool = content.questions.filter(inScope);
    const lastPack = s.qs.length ? content.questions.find((q) => q.id === s.qs[s.qs.length - 1])?.packId : null;
    const varied = pool.filter((q) => q.packId !== lastPack);
    const pick = pickRandom(varied.length ? varied : pool, 1)[0];
    if (!pick) throw new RunError("Keine Fragen verfügbar.", 404);
    s.qs.push(pick.id);
    s.rep.push(false);
    s.max += maxPointsPerQuestion(content.settings);
    if (s.aid) await progress.appendQuestion(s.aid, s.qs, s.max);
  }

  if (s.i >= s.qs.length) {
    s.done = true;
    return { token: encode(s), done: true, meta: buildMeta(content, s) };
  }

  const qid = s.qs[s.i];
  if (qid.startsWith("atlas:")) {
    const place = atlasPlace(qid.slice(6));
    if (!place) throw new RunError("Dieser Ort existiert nicht mehr.", 410);
    if (s.aid) s.st = new Date((await progress.markStarted(s.aid, s.i, qid)).startedAt).getTime();
    else if (s.st == null) s.st = now.getTime();
    const pq: PublicQuestion = { id: qid, packId: "geografie", prompt: place.name, topic: "", difficulty: place.level, timeLimitSeconds: ATLAS_TIME, repeat: false, kind: "atlas", hint: place.hint };
    return {
      token: encode(s), done: false, meta: buildMeta(content, s),
      payload: { index: s.i, total: s.qs.length, question: pq, startedAt: new Date(s.st).toISOString(), deadline: new Date(s.st + ATLAS_TIME * 1000).toISOString(), serverNow: now.toISOString() },
    };
  }
  const q = content.questions.find((x) => x.id === qid);
  if (!q) throw new RunError("Diese Frage existiert nicht mehr.", 410);

  if (s.aid) {
    const { startedAt } = await progress.markStarted(s.aid, s.i, qid);
    s.st = new Date(startedAt).getTime();
  } else if (s.st == null) {
    s.st = now.getTime();
  }
  const pq = toPublicQuestion(content, q, s.rep[s.i] ?? false);
  return {
    token: encode(s),
    done: false,
    meta: buildMeta(content, s),
    payload: {
      index: s.i,
      total: isEndless(s.mode) ? null : s.qs.length,
      question: pq,
      startedAt: new Date(s.st).toISOString(),
      deadline: new Date(s.st + pq.timeLimitSeconds * 1000).toISOString(),
      serverNow: now.toISOString(),
    },
  };
}

export async function submitAnswer(token: unknown, rawInput: unknown, user: SessionUser | null, now = new Date()) {
  const s = decodeRun(token, user);
  if (s.done) throw new RunError("Diese Runde ist bereits beendet.", 409);
  if (s.st == null) throw new RunError("Die Frage wurde noch nicht gestartet.", 409);
  const input = typeof rawInput === "string" ? rawInput.slice(0, 120) : "";
  const content = await getStore().getContent();
  const qid = s.qs[s.i];
  const atlas = qid.startsWith("atlas:") ? atlasPlace(qid.slice(6)) : null;
  const q = atlas ? null : content.questions.find((x) => x.id === qid);
  if (!q && !atlas) throw new RunError("Diese Frage existiert nicht mehr.", 410);

  let startedAt = s.st;
  if (s.aid) {
    const rows = await progress.getAnswerRows(s.aid);
    const row = rows.find((r) => r.position === s.i);
    if (!row) throw new RunError("Die Frage wurde noch nicht gestartet.", 409);
    startedAt = new Date(row.started_at).getTime();
    if (row.answered_at) throw new RunError("Diese Frage wurde bereits beantwortet.", 409);
  }

  if (!s.aid && !markGuestAnswered(s.rid, s.i)) throw new RunError("Diese Frage wurde bereits beantwortet.", 409);
  const result: AnswerResult = atlas ? evaluateAtlas(atlas, qid, input, now.getTime() - startedAt) : evaluateAnswer(content.settings, q!, input, { elapsedMs: now.getTime() - startedAt });
  if (s.aid) {
    const ok = await progress.saveAnswer(s.aid, s.i, result);
    if (!ok) throw new RunError("Diese Frage wurde bereits beantwortet.", 409);
  }
  s.ans.push({ q: qid, in: result.input, s: result.status, a: result.answerText, t: result.tier, p: result.points });
  if (isEndless(s.mode) && s.ans.length > UNLIMITED_MAX) s.ans.shift();
  s.total += result.points;
  s.i += 1;
  s.st = null;
  if (!isEndless(s.mode) && s.i >= s.qs.length) s.done = true;
  if (isEndless(s.mode) && s.i >= (s.cap ?? UNLIMITED_MAX)) s.done = true;
  return { token: encode(s), result, totals: { total: s.total, max: s.max, answered: s.i, done: s.done } };
}

export async function finishRun(token: unknown, user: SessionUser | null, now = new Date()) {
  const s = decodeRun(token, user);
  const content = await getStore().getContent();
  if (!isEndless(s.mode) && s.i < s.qs.length) throw new RunError("Die Runde ist noch nicht abgeschlossen.", 409);
  if (isEndless(s.mode) && s.ans.length === 0) throw new RunError("Es wurde noch keine Frage beantwortet.", 409);
  s.done = true;
  // offene, unbeantwortete Endlos-Frage wird nicht gewertet
  const answeredCount = isEndless(s.mode) ? s.i : s.qs.length;
  const max = maxPointsPerQuestion(content.settings) * answeredCount;
  const answers: AttemptAnswer[] = s.ans.map((a) => ({
    questionId: a.q, ...promptOf(content, a.q), input: a.in, status: a.s, answerText: a.a, tier: a.t, points: a.p,
  }));
  const record: AttemptRecord = {
    id: s.aid ?? s.rid,
    mode: s.mode,
    official: s.official,
    setId: s.setId,
    date: s.date,
    packId: s.packId,
    total: s.total,
    maxTotal: max,
    answers,
    startedAt: new Date(s.t0).toISOString(),
    finishedAt: now.toISOString(),
  };
  if (s.aid && user) {
    await progress.finishAttempt(s.aid, s.total, max);
    await progress.refreshStats(user.id, content, todayKey(content, now));
    return { attempt: record, storage: "account" as const };
  }
  record.receipt = sign({ ...record, receipt: undefined }, "receipt");
  return { attempt: record, storage: "local" as const };
}

/** Prüft die Signatur lokal gespeicherter Ergebnisse (für die Kontoübernahme). */
export function verifyReceipt(record: AttemptRecord): AttemptRecord | null {
  const payload = verify<AttemptRecord>(record.receipt, "receipt");
  if (!payload || payload.id !== record.id) return null;
  return payload;
}

/** Weltkarte: Tipp "lat,lon" auswerten – Punkte nach Entfernung */
function evaluateAtlas(place: NonNullable<ReturnType<typeof atlasPlace>>, qid: string, input: string, elapsedMs: number): AnswerResult {
  const m = /^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/.exec(input.trim());
  const base = { questionId: qid, input: input.slice(0, 40), answerId: null, answerText: `${place.name}, ${place.hint}`, examples: [], sources: [] };
  const geo = { lat: place.lat, lon: place.lon, guessLat: null as number | null, guessLon: null as number | null, km: null as number | null };
  if (elapsedMs > ATLAS_TIME * 1000 + 2500) return { ...base, status: "timeout", tier: null, points: 0, explanation: "Die Zeit war abgelaufen.", geo };
  if (!m) return { ...base, status: "empty", tier: null, points: 0, explanation: "Kein Tipp abgegeben.", geo };
  const lat = Math.max(-90, Math.min(90, Number(m[1])));
  const lon = Math.max(-180, Math.min(180, Number(m[2])));
  const km = Math.round(haversineKm(lat, lon, place.lat, place.lon));
  const points = geoPoints(km);
  const tier: TierId | null = points >= 95 ? "legendary" : points >= 80 ? "very_rare" : points >= 60 ? "rare" : points >= 40 ? "unusual" : points >= 20 ? "familiar" : points >= 5 ? "known" : null;
  return { ...base, status: tier ? "accepted" : "unknown", tier, points, explanation: `${km.toLocaleString("de-CH")} km daneben`, geo: { ...geo, guessLat: lat, guessLon: lon, km } };
}
