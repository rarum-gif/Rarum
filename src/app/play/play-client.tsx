"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, CircleSlash, Flag, Hourglass, Info, Loader2, LogOut, Repeat2, Send, XCircle } from "lucide-react";
import type { AnswerResult, AttemptRecord, PlayMode, PublicQuestion } from "@/lib/types";
import { api, ApiError } from "@/lib/client/api";
import { clearRun, loadRun, runKey, saveRun } from "@/lib/client/local";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { useApp } from "@/components/providers";
import { PackArt } from "@/components/pack-art";
import { AnimatedNumber, RarityMeter, TierBadge, tierVar, useTierLabel } from "@/components/bits";
import { RunSummary } from "@/components/run-summary";
import { SceneOverride } from "@/components/scene";
import { CashPop, RunCashBadge } from "@/components/wealth-hud";
import { cashForAnswer } from "@/lib/game/economy";

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
  const [runCash, setRunCash] = React.useState(0);
  const [lastCash, setLastCash] = React.useState<{ amount: number; key: number } | null>(null);
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
            setRunCash(Math.round(r.meta.points * 5 * (1 + (app.economy.level.level - 1) * 0.1)));
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
      if (r.result.status === "accepted") {
        const earned = cashForAnswer(r.result.tier, app.economy.level.level);
        setRunCash((c) => c + earned);
        setLastCash({ amount: earned, key: Date.now() });
      }
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
        <SceneOverride scene={attempt.packId ?? (attempt.mode === "unlimited" ? "night" : "dusk")} />
        <RunSummary attempt={attempt} previous={app.attempts.filter((a) => a.id !== attempt.id)} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl flex-col">
      <SceneOverride scene={payload?.question.packId ?? meta?.packId ?? (meta?.mode === "daily" ? "oceandrive" : meta?.mode === "ranked" ? "downtown" : "night")} />
      <div className="mb-4 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3"><ArrowLeft />Zurück</Button>
        {meta && (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className="truncate text-xs font-bold uppercase tracking-[0.18em] text-white/80">{meta.title}</span>
            {!meta.official && (meta.mode === "training" || meta.mode === "archive" || !!meta.practiceReason) && meta.mode !== "unlimited" && <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-fg-muted">Training</span>}
          </div>
        )}
        <RunCashBadge cash={runCash} level={app.economy.level.level} />
      </div>
      <CashPop pop={lastCash} />

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
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 text-center">
              <AlertCircle className="mx-auto mb-3 size-8 text-danger" />
              <p className="font-display text-4xl text-white">Das hat nicht geklappt</p>
              <p className="mt-2 text-fg-muted">{error}</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="secondary" onClick={() => { clearRun(key); location.reload(); }}>Neu laden</Button>
                <Button asChild><Link href="/">Zur Startseite</Link></Button>
              </div>
            </motion.div>
          )}

          {phase === "intro" && meta && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} className="relative isolate flex min-h-[440px] flex-col justify-end overflow-hidden rounded-[28px] border border-white/15 shadow-[var(--shadow-lift)] sm:min-h-[500px]">
              <div className="kenburns absolute inset-0 -z-20">
                {meta.packId ? <PackArt packId={meta.packId} image={app.packById(meta.packId)?.coverImage} variant="full" /> : <img src={meta.mode === "unlimited" ? "/images/backgrounds/night.webp" : meta.mode === "ranked" ? "/images/backgrounds/downtown.webp" : "/images/dashboard/daily.webp"} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(10,6,20,0.97)] from-10% via-[rgba(10,6,20,0.72)] via-55% to-[rgba(10,6,20,0.05)]" />
              <div className="px-6 pb-8 pt-24 text-center sm:px-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--peach)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">{meta.subtitle}</p>
                <h1 className="font-display title-chroma mt-2 text-6xl leading-[0.9] text-white sm:text-7xl">{resumed ? "Weiter geht's" : meta.title}</h1>
                <p className="mx-auto mt-3 max-w-md font-num text-sm uppercase tracking-[0.2em] text-white/75">
                  {meta.total ? `${meta.total} Fragen` : "Endlos"} · {app.settings.timeLimitSeconds} Sek.
                </p>
                {meta.practiceReason === "already_played" && <Notice icon={Repeat2}>Heute schon gespielt – das ist eine Trainingsrunde.</Notice>}
                <Button size="lg" variant="sand" className="mt-7 min-w-56" onClick={begin} autoFocus>
                  {resumed ? "Fortsetzen" : "Los geht's"} <ArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "preview" && (
            <motion.div key={"preview" + (payload?.index ?? totals.answered)} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--peach)]">Frage {totals.answered + 1}{meta?.total ? ` von ${meta.total}` : ""}</p>
              <motion.p initial={{ letterSpacing: "0.3em", opacity: 0 }} animate={{ letterSpacing: "0.04em", opacity: 1 }} transition={{ duration: 0.8 }} className="font-display mt-3 text-8xl text-white">Bereit?</motion.p>
              <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                <motion.div className="bg-sunset h-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: PREVIEW_MS / 1000, ease: "linear" }} />
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
    <p className="mx-auto mt-4 flex max-w-md items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left text-sm text-fg-muted">
      <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
      <span>{children}</span>
    </p>
  );
}

function ProgressDots({ total, answered, current }: { total: number; answered: number; current: number }) {
  return (
    <div className="flex gap-1.5" aria-label={`Frage ${Math.min(answered + 1, total)} von ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", i < answered ? "bg-sunset shadow-[0_0_10px_rgba(255,106,85,0.8)]" : i === current ? "bg-white/45" : "bg-white/12")} />
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
        <span className="hud inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">
          <span className="size-2 rounded-full" style={{ background: packAccent }} />
          {packName}
        </span>
        <div className={cn("relative size-[72px] rounded-full", urgent && "animate-[pulse-soft_1s_ease-in-out_infinite]")} role="timer" aria-live="off" aria-label={`${secs} Sekunden übrig`}>
          <svg viewBox="0 0 64 64" className="size-[72px] -rotate-90 drop-shadow-[0_0_12px_rgba(255,106,85,0.45)]">
            <defs>
              <linearGradient id="timer-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffb347" /><stop offset="0.5" stopColor="#ff7a45" /><stop offset="1" stopColor="#ff4f8b" /></linearGradient>
            </defs>
            <circle cx="32" cy="32" r={R} fill="rgba(12,8,20,0.55)" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
            <circle cx="32" cy="32" r={R} fill="none" stroke={urgent ? "#ff5d73" : "url(#timer-grad)"} strokeWidth="4" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: "stroke 0.3s" }} />
          </svg>
          <span className={cn("font-num absolute inset-0 flex items-center justify-center text-2xl font-semibold text-white", urgent && "text-[#ff8a98]")}>{secs}</span>
        </div>
      </div>

      <h2 className="text-[30px] font-extrabold leading-[1.12] tracking-tight text-balance text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-[46px]">{payload.question.prompt}</h2>

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
          className="h-16 flex-1 rounded-2xl border border-white/20 bg-[rgba(14,10,26,0.7)] px-5 text-xl font-semibold text-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all placeholder:font-medium placeholder:text-white/40 focus:border-[var(--peach)] focus:outline-none focus:ring-4 focus:ring-[rgba(255,122,69,0.25)] disabled:opacity-60"
        />
        <Button type="submit" size="lg" className="h-16 rounded-2xl px-8 uppercase tracking-[0.1em]" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : <Send />}
          Antworten
        </Button>
      </div>
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
    unknown: { icon: CircleSlash, title: "Kennen wir noch nicht", tone: "text-[var(--gold)]" },
    empty: { icon: CircleSlash, title: "Keine Antwort abgegeben", tone: "text-fg-muted" },
    timeout: { icon: Hourglass, title: "Die Zeit ist abgelaufen", tone: "text-fg-muted" },
  }[result.status];
  const Icon = head.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="flex flex-col">
      <p className="mb-4 text-sm font-semibold text-white/70">{question.prompt}</p>
      <div className="glass relative overflow-hidden rounded-[28px] shadow-[var(--shadow-lift)]">
        {ok && result.tier && <motion.div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-3xl" style={{ background: result.tier === "legendary" ? "var(--sunset-gradient)" : tierVar(result.tier) }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 0.45, scale: 1 }} transition={{ duration: 0.9 }} />}
        <div className="relative p-6 sm:p-8">
          <div className={cn("flex items-start gap-3", head.tone)}>
            <motion.span initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
              <Icon className="size-7" />
            </motion.span>
            <h2 className="font-display text-4xl leading-none text-white">{head.title}</h2>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Deine Antwort</dt>
              <dd className="mt-1 text-2xl font-extrabold text-white">{ok ? result.answerText : result.input || "–"}</dd>
              {ok && result.matchKind === "fuzzy" && <dd className="mt-1 text-sm text-fg-muted">Erkannt aus „{result.input}“ – kleine Tippfehler verzeihen wir.</dd>}
              {ok && result.matchKind === "alias" && result.input && <dd className="mt-1 text-sm text-fg-muted">„{result.input}“ ist als Schreibweise hinterlegt.</dd>}
            </div>
            <div className="sm:text-right">
              <dt className="text-xs font-medium uppercase tracking-wider text-fg-subtle">Punkte</dt>
              <dd className={cn("font-num mt-1 text-6xl font-bold", result.tier === "legendary" && "text-sunset")} style={result.tier && result.tier !== "legendary" ? { color: tierVar(result.tier), textShadow: `0 0 30px ${tierVar(result.tier)}` } : undefined}>
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
            </div>
          )}

          {result.explanation && (
            <p className="mt-6 flex gap-2.5 rounded-2xl border border-white/8 bg-white/[0.05] p-4 text-[15px] leading-relaxed text-fg-muted">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>{result.explanation}</span>
            </p>
          )}

          {result.status === "unknown" && (
            <div className="mt-5">
              <Button variant="secondary" size="sm" onClick={() => setReportOpen(true)} disabled={reported}>
                <Flag />{reported ? "Danke, gemeldet!" : "Antwort melden"}
              </Button>
            </div>
          )}


        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {mode === "unlimited" && !last && (
          <Button variant="secondary" size="lg" onClick={onEnd}><LogOut />Runde beenden</Button>
        )}
        <Button size="lg" variant="sand" onClick={onNext} autoFocus>
          {last ? "Ergebnis anzeigen" : "Weiter"} <ArrowRight />
        </Button>
      </div>

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
        <div className="rounded-xl bg-white/10 px-4 py-3 font-semibold text-white">„{answer}“</div>
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
