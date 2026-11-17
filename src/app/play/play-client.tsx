"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CircleSlash, Clock, Flag, Hourglass, Info, Loader2, LogOut, Repeat2, Send, Sparkles, XCircle } from "lucide-react";
import type { AnswerResult, AttemptRecord, PlayMode, PublicQuestion } from "@/lib/types";
import { api, ApiError } from "@/lib/client/api";
import { clearRun, loadRun, runKey, saveRun } from "@/lib/client/local";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { useApp } from "@/components/providers";
import { PackArt } from "@/components/pack-art";
import { AnimatedNumber, DifficultyDots, RarityMeter, TierBadge, tierVar, useTierLabel } from "@/components/bits";
import { RunSummary } from "@/components/run-summary";

interface RunMeta {
  mode: PlayMode;
  official: boolean;
  title: string;
  subtitle: string;
  total: number | null;
  setId: string | null;
  date: string | null;
  packId: string | null;
  repeats: number;
  answered: number;
  points: number;
  practiceReason?: "already_played" | "past_date" | "training";
}
interface QuestionPayload {
  index: number;
  total: number | null;
  question: PublicQuestion;
  startedAt: string;
  deadline: string;
  serverNow: string;
}
type Phase = "loading" | "intro" | "preview" | "question" | "submitting" | "result" | "finishing" | "summary" | "error";

const PREVIEW_MS = 1600;

export function PlayClient() {
  const params = useSearchParams();
  const router = useRouter();
  const app = useApp();
  const tierLabel = useTierLabel();
  const mode = (params.get("mode") ?? "daily") as PlayMode;
  const packId = params.get("pack");
  const date = params.get("date");
  const practiceParam = params.get("practice") === "1";

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<RunMeta | null>(null);
  const [payload, setPayload] = React.useState<QuestionPayload | null>(null);
  const [result, setResult] = React.useState<AnswerResult | null>(null);
  const [totals, setTotals] = React.useState({ total: 0, answered: 0 });
  const [attempt, setAttempt] = React.useState<AttemptRecord | null>(null);
  const [input, setInput] = React.useState("");
  const [resumed, setResumed] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [lastDone, setLastDone] = React.useState(false);
  const tokenRef = React.useRef<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const submittingRef = React.useRef(false);
  const startedRef = React.useRef(false);

  const today = app.overview?.today ?? null;
  const officialSetId = mode === "daily" && (!date || date === today) ? (today ? `daily:${today}` : null) : mode === "pack" && packId && (!date || date === today) ? (today ? `pack:${packId}:${today}` : null) : null;
  const key = runKey(mode, packId, date ?? (mode === "daily" || mode === "pack" ? today : null));

  const persist = React.useCallback((t: string) => {
    tokenRef.current = t;
    saveRun(key, t);
  }, [key]);

  const fail = (e: unknown) => {
    setError(e instanceof ApiError ? e.message : "Da ist etwas schiefgelaufen.");
    setPhase("error");
  };

  const fetchQuestion = React.useCallback(async () => {
    const t0 = Date.now();
    const r = await api<{ token: string; done: boolean; payload?: QuestionPayload; meta: RunMeta }>("/api/run/next", { json: { token: tokenRef.current } });
    persist(r.token);
    setMeta(r.meta);
    if (r.done || !r.payload) return null;
    setOffset(new Date(r.payload.serverNow).getTime() - (t0 + Date.now()) / 2);
    setPayload(r.payload);
    return r.payload;
  }, [persist]);

  // Start bzw. Fortsetzen
  React.useEffect(() => {
    if (startedRef.current || !app.attemptsLoaded || !app.overview) return;
    startedRef.current = true;
    (async () => {
      try {
        const saved = loadRun(key);
        if (saved) {
          tokenRef.current = saved.token;
          try {
            const r = await api<{ token: string; done: boolean; payload?: QuestionPayload; meta: RunMeta }>("/api/run/next", { json: { token: saved.token, peek: true } });
            persist(r.token);
            setMeta(r.meta);
            setTotals({ total: r.meta.points, answered: r.meta.answered });
            if (r.done) {
              await finish();
              return;
            }
            setResumed(r.meta.answered > 0 || !!r.payload);
            if (r.payload) {
              // Frage lief bereits – direkt weiter, ohne zusätzliche Zeit
              setOffset(new Date(r.payload.serverNow).getTime() - Date.now());
              setPayload(r.payload);
              setInput("");
              setPhase("question");
            } else {
              setPhase("intro");
            }
            return;
          } catch {
            clearRun(key);
          }
        }
        const practice = practiceParam || !!app.hasOfficial(officialSetId);
        const r = await api<{ token: string; meta: RunMeta }>("/api/run/start", { json: { mode, packId, date, practice } });
        persist(r.token);
        setMeta(r.meta);
        setTotals({ total: r.meta.points, answered: r.meta.answered });
        setResumed(r.meta.answered > 0);
        setPhase("intro");
      } catch (e) {
        fail(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.attemptsLoaded, app.overview]);

  const begin = async () => {
    setPhase("preview");
    const wait = new Promise((r) => setTimeout(r, PREVIEW_MS));
    try {
      // Die Frage wird erst nach der Vorschau geladen – erst dann läuft die Zeit
      await wait;
      const q = await fetchQuestion();
      if (!q) return finish();
      setInput("");
      setResult(null);
      setPhase("question");
    } catch (e) {
      fail(e);
    }
  };

  const submit = React.useCallback(async (value: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setPhase("submitting");
    try {
      const r = await api<{ token: string; result: AnswerResult; totals: { total: number; max: number; answered: number; done: boolean } }>("/api/run/answer", { json: { token: tokenRef.current, input: value } });
      persist(r.token);
      setResult(r.result);
      setTotals({ total: r.totals.total, answered: r.totals.answered });
      setLastDone(r.totals.done);
      setPhase("result");
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // bereits beantwortet (z.B. zweiter Tab) – mit nächster Frage weiter
        try {
          const q = await fetchQuestion();
          if (!q) await finish();
          else setPhase("question");
        } catch (e2) {
          fail(e2);
        }
      } else fail(e);
    } finally {
      submittingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist, fetchQuestion]);

  const finish = async () => {
    setPhase("finishing");
    try {
      const r = await api<{ attempt: AttemptRecord; storage: "local" | "account" }>("/api/run/finish", { json: { token: tokenRef.current } });
      app.recordAttempt(r.attempt, r.storage);
      clearRun(key);
      setAttempt(r.attempt);
      setPhase("summary");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      fail(e);
    }
  };

  const next = () => {
    if (lastDone) return finish();
    void begin();
  };

  // Tastatur: Enter für „Weiter“
  React.useEffect(() => {
    if (phase !== "result") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        next();
      }
    };
    const t = setTimeout(() => window.addEventListener("keydown", onKey), 400);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, lastDone]);

  const pack = app.packById(payload?.question.packId ?? meta?.packId);

  if (phase === "summary" && attempt) {
    return (
      <div className="pt-4">
        <RunSummary attempt={attempt} previous={app.attempts.filter((a) => a.id !== attempt.id)} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3"><ArrowLeft />Zurück</Button>
        {meta && (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="truncate font-medium">{meta.title}</span>
            {!meta.official && <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">Training</span>}
          </div>
        )}
        <div className="font-display text-lg font-medium tabular-nums">{totals.total} <span className="text-xs font-sans text-fg-subtle">Pkt.</span></div>
      </div>

      {meta && meta.total ? <ProgressDots total={meta.total} answered={totals.answered} current={phase === "result" ? totals.answered - 1 : totals.answered} /> : null}

      <div className="relative flex flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          {phase === "loading" && (
            <motion.div key="loading" className="flex flex-col items-center gap-3 text-fg-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 className="size-6 animate-spin" />
              <span className="text-sm">Fragen werden vorbereitet …</span>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-line bg-surface p-8 text-center">
              <AlertCircle className="mx-auto mb-3 size-8 text-danger" />
              <p className="font-display text-xl font-medium">Das hat nicht geklappt</p>
              <p className="mt-2 text-fg-muted">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="secondary" onClick={() => { clearRun(key); location.reload(); }}>Neu laden</Button>
                <Button asChild><Link href="/">Zur Startseite</Link></Button>
              </div>
            </motion.div>
          )}

          {phase === "intro" && meta && (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-lift)]">
              <div className="relative h-40 sm:h-48">
                <PackArt packId={meta.packId ?? "allgemeinwissen"} image={app.packById(meta.packId)?.coverImage} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/10 to-transparent" />
              </div>
              <div className="-mt-10 px-6 pb-8 text-center sm:px-10">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{meta.subtitle}</p>
                <h1 className="mt-2 font-display text-3xl font-medium tracking-tight">{resumed ? "Weiter geht's" : meta.title}</h1>
                <p className="mx-auto mt-3 max-w-md text-fg-muted">
                  {meta.total ? `${meta.total} Fragen` : "Endlos viele Fragen"} · {app.settings.timeLimitSeconds} Sekunden pro Frage · Antwort selbst eintippen. Je seltener deine richtige Antwort, desto mehr Punkte.
                </p>
                {meta.practiceReason === "already_played" && <Notice icon={Repeat2}>Du hast diese Challenge heute schon offiziell gespielt. Diese Runde ist ein Training und verändert deine Wertung nicht.</Notice>}
                {meta.practiceReason === "past_date" && <Notice icon={BookOpen}>Archiv-Runde: zählt als Training, die damalige Wertung bleibt unverändert.</Notice>}
                {meta.official && <Notice icon={Sparkles}>Offizielle Tageswertung – jede Challenge zählt nur einmal pro Tag.</Notice>}
                {meta.repeats > 0 && <Notice icon={Info}>Der Fragenbestand ist begrenzt: {meta.repeats} dieser Fragen gab es bereits an einem früheren Tag. Sie sind entsprechend markiert.</Notice>}
                <Button size="lg" className="mt-7 min-w-48" onClick={begin} autoFocus>
                  {resumed ? "Fortsetzen" : "Los geht's"} <ArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "preview" && (
            <motion.div key={"preview" + (payload?.index ?? totals.answered)} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} className="text-center">
              <p className="text-sm font-medium text-fg-muted">Frage {totals.answered + 1}{meta?.total ? ` von ${meta.total}` : ""}</p>
              <p className="mt-2 font-display text-4xl font-medium tracking-tight">Bereit?</p>
              <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-surface-3">
                <motion.div className="h-full bg-accent" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: PREVIEW_MS / 1000, ease: "linear" }} />
              </div>
            </motion.div>
          )}

          {(phase === "question" || phase === "submitting") && payload && (
            <QuestionView
              key={"q" + payload.index + payload.question.id}
              payload={payload}
              offset={offset}
              input={input}
              setInput={setInput}
              submitting={phase === "submitting"}
              onSubmit={submit}
              inputRef={inputRef}
              packName={pack?.short ?? ""}
              packAccent={pack?.accent}
            />
          )}

          {phase === "result" && result && payload && (
            <ResultView key={"r" + payload.index} result={result} question={payload.question} onNext={next} last={lastDone} tierLabel={tierLabel} mode={meta?.mode} onEnd={finish} />
          )}

          {phase === "finishing" && (
            <motion.div key="fin" className="flex flex-col items-center gap-3 text-fg-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader2 className="size-6 animate-spin" />
              <span className="text-sm">Ergebnis wird gespeichert …</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Notice({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-4 flex max-w-md items-start gap-2.5 rounded-2xl bg-surface-2 px-4 py-3 text-left text-sm text-fg-muted">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
      <span>{children}</span>
    </p>
  );
}

function ProgressDots({ total, answered, current }: { total: number; answered: number; current: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Frage ${Math.min(answered + 1, total)} von ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < answered ? "bg-accent" : i === current ? "bg-fg-subtle/50" : "bg-surface-3")} />
      ))}
    </div>
  );
}

function QuestionView({ payload, offset, input, setInput, submitting, onSubmit, inputRef, packName, packAccent }: {
  payload: QuestionPayload;
  offset: number;
  input: string;
  setInput: (v: string) => void;
  submitting: boolean;
  onSubmit: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  packName: string;
  packAccent?: string;
}) {
  const deadline = new Date(payload.deadline).getTime();
  const limit = payload.question.timeLimitSeconds * 1000;
  const [remaining, setRemaining] = React.useState(() => Math.max(0, deadline - (Date.now() + offset)));
  const inputVal = React.useRef(input);
  inputVal.current = input;
  const fired = React.useRef(false);

  React.useEffect(() => {
    inputRef.current?.focus();
    let raf = 0;
    const tick = () => {
      const r = Math.max(0, deadline - (Date.now() + offset));
      setRemaining(r);
      if (r <= 0 && !fired.current) {
        fired.current = true;
        onSubmit(inputVal.current);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [deadline, offset, onSubmit, inputRef]);

  const frac = remaining / limit;
  const secs = Math.ceil(remaining / 1000);
  const urgent = secs <= 5;
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!fired.current) {
          fired.current = true;
          onSubmit(input);
        }
      }}
      className="flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg-muted">
          <span className="size-2 rounded-full" style={{ background: packAccent }} />
          {packName} · {payload.question.topic}
          <DifficultyDots value={payload.question.difficulty} className="ml-1 text-fg-subtle" />
        </span>
        <div className="relative size-16" role="timer" aria-live="off" aria-label={`${secs} Sekunden übrig`}>
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90">
            <circle cx="32" cy="32" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="4" />
            <circle cx="32" cy="32" r={R} fill="none" stroke={urgent ? "var(--danger)" : "var(--accent)"} strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: "stroke 0.3s" }} />
          </svg>
          <span className={cn("absolute inset-0 flex items-center justify-center font-display text-xl font-medium tabular-nums", urgent && "text-danger")}>{secs}</span>
        </div>
      </div>

      {payload.question.repeat && (
        <p className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs text-fg-muted"><Repeat2 className="size-3.5" />Wiederholung aus einem früheren Set</p>
      )}
      <h2 className="font-display text-[30px] font-medium leading-[1.15] tracking-tight text-balance sm:text-[40px]">{payload.question.prompt}</h2>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitting}
          maxLength={120}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
          enterKeyHint="send"
          placeholder="Deine Antwort …"
          aria-label="Deine Antwort"
          className="h-16 flex-1 rounded-2xl border-2 border-line bg-surface px-5 text-xl text-fg shadow-[var(--shadow-soft)] transition-colors placeholder:text-fg-subtle focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15 disabled:opacity-60"
        />
        <Button type="submit" size="lg" className="h-16 rounded-2xl px-7" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : <Send />}
          Antworten
        </Button>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">Enter zum Bestätigen · Gross-/Kleinschreibung und kleine Tippfehler sind egal.</p>
    </motion.form>
  );
}

function ResultView({ result, question, onNext, last, tierLabel, mode, onEnd }: { result: AnswerResult; question: PublicQuestion; onNext: () => void; last: boolean; tierLabel: (t: AnswerResult["tier"] & string) => string; mode?: PlayMode; onEnd: () => void }) {
  const [reportOpen, setReportOpen] = React.useState(false);
  const [reported, setReported] = React.useState(false);
  const ok = result.status === "accepted";
  const head = {
    accepted: { icon: CheckCircle2, title: "Antwort erkannt!", tone: "text-success" },
    known_wrong: { icon: XCircle, title: "Leider nicht richtig", tone: "text-danger" },
    unknown: { icon: CircleSlash, title: "Diese Antwort ist noch nicht in unserer Antwortliste", tone: "text-fg-muted" },
    empty: { icon: CircleSlash, title: "Keine Antwort abgegeben", tone: "text-fg-muted" },
    timeout: { icon: Hourglass, title: "Die Zeit ist abgelaufen", tone: "text-fg-muted" },
  }[result.status];
  const Icon = head.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-col">
      <p className="mb-4 text-sm text-fg-muted">{question.prompt}</p>
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="relative p-6 sm:p-8" style={ok && result.tier ? { background: `linear-gradient(160deg, color-mix(in oklab, ${tierVar(result.tier)} 16%, transparent), transparent 60%)` } : undefined}>
          <div className={cn("flex items-start gap-3", head.tone)}>
            <motion.span initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
              <Icon className="size-7" />
            </motion.span>
            <h2 className="font-display text-2xl font-medium leading-tight text-fg">{head.title}</h2>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Deine Antwort</dt>
              <dd className="mt-1 font-display text-2xl font-medium">{ok ? result.answerText : result.input || "–"}</dd>
              {ok && result.matchKind === "fuzzy" && <dd className="mt-1 text-sm text-fg-muted">Erkannt aus „{result.input}“ – kleine Tippfehler verzeihen wir.</dd>}
              {ok && result.matchKind === "alias" && result.input && <dd className="mt-1 text-sm text-fg-muted">„{result.input}“ ist als Schreibweise hinterlegt.</dd>}
            </div>
            <div className="sm:text-right">
              <dt className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Punkte</dt>
              <dd className="mt-1 font-display text-5xl font-medium" style={result.tier ? { color: tierVar(result.tier) } : undefined}>
                +<AnimatedNumber value={result.points} duration={0.8} />
              </dd>
            </div>
          </dl>

          {ok && result.tier && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Seltenheitsstufe</span>
                <TierBadge tier={result.tier} />
              </div>
              <RarityMeter tier={result.tier} />
              <p className="mt-2 text-xs text-fg-subtle">{tierLabel(result.tier)} – redaktionell eingestuft</p>
            </div>
          )}

          {result.explanation && (
            <p className="mt-6 flex gap-2.5 rounded-2xl bg-bg-elevated p-4 text-[15px] leading-relaxed text-fg-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>{result.explanation}</span>
            </p>
          )}

          {result.status === "unknown" && (
            <div className="mt-5 rounded-2xl border border-dashed border-line-strong p-4 text-sm text-fg-muted">
              <p>Wir werten sie deshalb nicht – sie gilt aber nicht automatisch als falsch. Wenn du sicher bist, dass sie stimmt, melde sie unserer Redaktion.</p>
              <Button variant="secondary" size="sm" className="mt-3" onClick={() => setReportOpen(true)} disabled={reported}>
                <Flag />{reported ? "Danke, gemeldet!" : "Antwort melden"}
              </Button>
            </div>
          )}

          {result.examples.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-subtle">{ok ? "Andere gültige Antworten" : "Gültig wären z. B."}</p>
              <div className="flex flex-wrap gap-2">
                {result.examples.map((e) => (
                  <span key={e.text} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-elevated px-3 py-1 text-sm">
                    <span className="size-1.5 rounded-full" style={{ background: tierVar(e.tier) }} />
                    {e.text}
                    <span className="text-xs text-fg-subtle">{tierLabel(e.tier)}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.sources.length > 0 && (
            <p className="mt-5 text-xs text-fg-subtle">
              Quelle:{" "}
              {result.sources.slice(0, 2).map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && " · "}
                  {s.url ? <a href={s.url} target="_blank" rel="noreferrer noopener" className="underline decoration-dotted underline-offset-2 hover:text-fg">{s.label}</a> : s.label}
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {mode === "unlimited" && !last && (
          <Button variant="secondary" size="lg" onClick={onEnd}><LogOut />Runde beenden</Button>
        )}
        <Button size="lg" onClick={onNext} autoFocus>
          {last ? "Ergebnis anzeigen" : "Weiter"} <ArrowRight />
        </Button>
      </div>
      <p className="mt-2 text-right text-xs text-fg-subtle"><Clock className="mr-1 inline size-3" />Die nächste Frage startet erst, wenn du weiterklickst.</p>

      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} questionId={result.questionId} answer={result.input} onDone={() => setReported(true)} />
    </motion.div>
  );
}

function ReportDialog({ open, onOpenChange, questionId, answer, onDone }: { open: boolean; onOpenChange: (v: boolean) => void; questionId: string; answer: string; onDone: () => void }) {
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const send = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api("/api/report", { json: { questionId, answerText: answer, note } });
      onDone();
      onOpenChange(false);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Meldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Antwort melden" description="Unsere Redaktion prüft deine Antwort und nimmt sie bei Bedarf in die Liste auf.">
        <div className="rounded-xl bg-surface-2 px-4 py-3 font-medium">„{answer}“</div>
        <label className="mt-4 block text-sm font-medium text-fg-muted" htmlFor="report-note">Hinweis oder Quelle (optional)</label>
        <Textarea id="report-note" className="mt-1.5" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. ein Link, der die Antwort belegt" />
        {err && <p className="mt-2 text-sm text-danger">{err}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={send} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Melden</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
