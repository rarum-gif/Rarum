"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Award, Check, Crown, Home, RotateCcw, Share2, Sparkles, TrendingUp } from "lucide-react";
import type { AttemptRecord, TierId } from "@/lib/types";
import { ACHIEVEMENTS, computeStats, earnedAchievements } from "@/lib/game/stats";
import { formatDateDe } from "@/lib/time";
import { cn, fmt } from "@/lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useApp } from "./providers";
import { AnimatedNumber, TIER_ORDER, TierBadge, tierVar, useTierLabel } from "./bits";
import { AchievementMedal } from "./achievement-medal";

const SHARE_EMOJI: Record<TierId, string> = { known: "⬜", familiar: "🟩", unusual: "🟨", rare: "🟦", very_rare: "🟧", legendary: "🌟" };

function title(a: AttemptRecord, packName?: string) {
  if (a.mode === "daily") return "Daily Challenge";
  if (a.mode === "unlimited") return "Unlimited";
  if (a.mode === "training") return `${packName} · Training`;
  if (a.mode === "pack") return `${packName} · Tages-Challenge`;
  return a.packId ? `${packName} · Archiv` : "Daily Challenge · Archiv";
}

export function RunSummary({ attempt, previous }: { attempt: AttemptRecord; previous?: AttemptRecord[] }) {
  const { attempts, packById, packs, today } = useApp();
  const tierLabel = useTierLabel();
  const [copied, setCopied] = React.useState(false);
  const pack = packById(attempt.packId);
  const others = previous ?? attempts.filter((x) => x.id !== attempt.id);

  // Vergleich mit früheren Ergebnissen derselben Art
  const sameKind = others.filter((x) => (attempt.mode === "daily" || (attempt.mode === "archive" && !attempt.packId) ? x.mode === "daily" && x.official : attempt.mode === "unlimited" ? x.mode === "unlimited" : x.packId === attempt.packId && x.official && x.mode === "pack"));
  const prevBest = sameKind.reduce((m, x) => Math.max(m, x.total), 0);
  const isBest = attempt.total > prevBest && sameKind.length > 0;
  const history = [...sameKind.filter((x) => x.finishedAt < attempt.finishedAt).slice(0, 6).reverse(), attempt];
  const histMax = Math.max(attempt.maxTotal, ...history.map((h) => h.total), 1);

  const accepted = attempt.answers.filter((x) => x.status === "accepted" && x.tier);
  const best = accepted.slice().sort((a, b) => b.points - a.points)[0];
  const avgRank = accepted.length ? accepted.reduce((s, a) => s + TIER_ORDER.indexOf(a.tier!) + 1, 0) / accepted.length : 0;
  const avgTier = avgRank ? TIER_ORDER[Math.round(avgRank) - 1] : null;

  // neu verdiente Abzeichen
  const before = earnedAchievements(computeStats(others, packs, today), others);
  const after = earnedAchievements(computeStats([attempt, ...others], packs, today), [attempt, ...others]);
  const fresh = after.filter((id) => !before.includes(id)).map((id) => ACHIEVEMENTS.find((a) => a.id === id)!);

  const shareText = () => {
    const grid = attempt.answers.map((a) => (a.tier ? SHARE_EMOJI[a.tier] : "⬛")).join("");
    const when = attempt.date ? formatDateDe(attempt.date, { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
    return `Rarum · ${title(attempt, pack?.name)}${when ? " " + when : ""}\n${grid}  ${attempt.total}/${attempt.maxTotal}\n${typeof location !== "undefined" ? location.origin : ""}`;
  };
  const share = async () => {
    const text = shareText();
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* Teilen abgebrochen */
    }
  };

  const replayHref = attempt.mode === "unlimited" ? "/unlimited" : attempt.mode === "training" ? `/play?mode=training&pack=${attempt.packId}` : attempt.packId ? `/packs/${attempt.packId}` : "/daily";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] bg-forest-800 p-8 text-center text-cream shadow-[var(--shadow-lift)] sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-sand-300/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-olive-400/20 blur-3xl" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-sand-300">
          {title(attempt, pack?.name)} {attempt.date ? "· " + formatDateDe(attempt.date, { day: "numeric", month: "long" }) : ""}
        </p>
        {!attempt.official && <p className="relative mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-sand-200">Trainingsrunde – zählt nicht für die offizielle Wertung</p>}
        <div className="relative mt-5 font-display text-7xl font-medium tracking-tight sm:text-8xl">
          <AnimatedNumber value={attempt.total} duration={1.4} />
        </div>
        <p className="relative mt-1 text-sand-200">von {fmt(attempt.maxTotal)} möglichen Punkten</p>
        {isBest && (
          <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2, type: "spring" }} className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--tier-legendary)] px-4 py-1.5 text-sm font-semibold text-forest-950">
            <Crown className="size-4" /> Neue persönliche Bestleistung!
          </motion.p>
        )}
        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          <Button variant="sand" onClick={share}>{copied ? <Check /> : <Share2 />}{copied ? "Kopiert" : "Ergebnis teilen"}</Button>
          <Button asChild variant="outlineLight"><Link href={replayHref}><RotateCcw />Weiter spielen</Link></Button>
          <Button asChild variant="outlineLight"><Link href="/"><Home />Startseite</Link></Button>
        </div>
      </motion.section>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-fg-subtle">Beste Antwort</p>
          {best ? (
            <>
              <p className="mt-1 truncate font-display text-lg font-medium">{best.answerText}</p>
              <TierBadge tier={best.tier!} className="mt-1" />
            </>
          ) : <p className="mt-1 text-fg-muted">–</p>}
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-fg-subtle">Ø Seltenheit</p>
          <p className="mt-1 font-display text-lg font-medium">{avgTier ? tierLabel(avgTier) : "–"}</p>
          <p className="text-xs text-fg-muted">{accepted.length} von {attempt.answers.length} Antworten gültig</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="text-xs font-medium text-fg-subtle">Persönliche Bestleistung</p>
          <p className="mt-1 font-display text-lg font-medium">{fmt(Math.max(prevBest, attempt.total))}</p>
          <p className="text-xs text-fg-muted">
            {sameKind.length === 0 ? "Erste Runde dieser Art" : isBest ? `+${attempt.total - prevBest} gegenüber vorher` : `Noch ${fmt(prevBest - attempt.total + 1)} bis zur neuen Bestleistung`}
          </p>
        </div>
      </div>

      {fresh.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="size-5 text-accent" />Neues Abzeichen</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {fresh.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <AchievementMedal achievement={a} earned size={52} />
                <div><p className="font-medium">{a.title}</p><p className="text-sm text-fg-muted">{a.description}</p></div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Deine Antworten</CardTitle></CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {attempt.answers.map((a, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className="flex items-center gap-3 rounded-xl border border-line bg-bg-elevated px-4 py-3">
                <span className="w-5 text-sm tabular-nums text-fg-subtle">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg-muted">{a.prompt}</p>
                  <p className="truncate font-medium">
                    {a.status === "accepted" ? a.answerText : a.input ? <span className="text-fg-muted line-through decoration-1">{a.input}</span> : <span className="text-fg-subtle">keine Antwort</span>}
                  </p>
                </div>
                {a.tier ? <TierBadge tier={a.tier} className="hidden sm:inline-flex" /> : <span className="hidden text-xs text-fg-subtle sm:inline">{a.status === "unknown" ? "nicht in der Liste" : a.status === "timeout" ? "Zeit abgelaufen" : a.status === "known_wrong" ? "falsch" : ""}</span>}
                <span className={cn("w-10 text-right font-display text-lg font-medium tabular-nums", !a.points && "text-fg-subtle")} style={a.tier ? { color: tierVar(a.tier) } : undefined}>{a.points}</span>
              </motion.li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {history.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="size-5 text-accent" />Vergleich mit früheren Runden</CardTitle></CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2 sm:gap-3">
              {history.map((h) => (
                <div key={h.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-xs tabular-nums text-fg-muted">{h.total}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(h.total / histMax) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} className={cn("w-full max-w-12 rounded-t-lg", h.id === attempt.id ? "bg-accent" : "bg-surface-3")} />
                  <span className="text-[11px] text-fg-subtle">{h.date ? formatDateDe(h.date, { day: "numeric", month: "numeric" }) : new Date(h.finishedAt).toLocaleDateString("de-CH", { day: "numeric", month: "numeric" })}</span>
                </div>
              ))}
            </div>
            {prevBest > 0 && !isBest && (
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-fg-muted"><span>Fortschritt zur Bestleistung</span><span>{attempt.total} / {prevBest}</span></div>
                <Progress value={attempt.total / prevBest} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-fg-subtle">
        <Sparkles className="size-3.5" /> Seltenheitsstufen sind redaktionell eingestuft – keine weltweit gemessenen Häufigkeiten.
      </p>
    </div>
  );
}
