"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Gem, ListChecks, Repeat2, Sparkles } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyDots, LocalDataNotice, PageHeader, ResetCountdown, TierBadge } from "@/components/bits";
import { HeroArt } from "@/components/hero-art";
import { maxPointsPerQuestion } from "@/lib/game/scoring";
import { addDays, formatDateDe } from "@/lib/time";
import { fmt } from "@/lib/utils";

export default function DailyPage() {
  const { overview, settings, hasOfficial, attempts, stats, today } = useApp();
  const daily = overview?.daily;
  const played = hasOfficial(daily?.id);
  const max = (daily?.count ?? settings.dailyQuestionCount) * maxPointsPerQuestion(settings);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const dailyByDate = new Map(attempts.filter((a) => a.official && a.mode === "daily").map((a) => [a.date, a]));

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Daily Quiz" title="Die tägliche Challenge">
        Jeden Tag {settings.dailyQuestionCount} neue Fragen aus verschiedenen Themenwelten – für alle gleich. Die offizielle Wertung zählt einmal pro Tag, der Wechsel erfolgt um Mitternacht (Schweizer Zeit).
      </PageHeader>

      <section className="relative overflow-hidden rounded-[28px] text-cream shadow-[var(--shadow-lift)]">
        <HeroArt className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-forest-950/55" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          <div>
            <p className="text-sm text-sand-200">{overview ? formatDateDe(overview.today, { weekday: "long", day: "numeric", month: "long" }) : ""}</p>
            <h2 className="mt-1 font-display text-3xl font-medium sm:text-4xl">{played ? `${played.total} Punkte – stark!` : "Bereit für heute?"}</h2>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sand-100">
              <li className="flex items-center gap-2"><ListChecks className="size-4" />{daily?.count ?? settings.dailyQuestionCount} Fragen</li>
              <li className="flex items-center gap-2"><Clock className="size-4" />{settings.timeLimitSeconds} Sek. pro Frage</li>
              <li className="flex items-center gap-2"><Gem className="size-4" />max. {fmt(max)} Punkte</li>
              {daily && <li className="flex items-center gap-2">Schwierigkeit <DifficultyDots value={daily.difficulty} /></li>}
            </ul>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {played ? (
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="sand" size="lg"><Link href={`/ergebnis/${played.id}`}>Ergebnis ansehen</Link></Button>
                <Button asChild variant="outlineLight" size="lg"><Link href="/play?mode=daily&practice=1"><Repeat2 />Training</Link></Button>
              </div>
            ) : (
              <Button asChild variant="sand" size="lg" className="min-w-48"><Link href="/play?mode=daily">Jetzt spielen <ArrowRight /></Link></Button>
            )}
            <ResetCountdown className="text-sm text-sand-200" prefix="Nächste Challenge in" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-5 text-accent" />Deine Woche</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {week.map((d) => {
                const a = dailyByDate.get(d);
                return (
                  <div key={d} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] text-fg-subtle">{formatDateDe(d, { weekday: "short" })}</span>
                    <span className={`flex size-10 items-center justify-center rounded-xl text-xs font-semibold tabular-nums ${a ? "bg-accent text-primary-fg dark:text-forest-950" : d === today ? "border-2 border-dashed border-line-strong text-fg-subtle" : "bg-surface-2 text-fg-subtle"}`}>
                      {a ? a.total : formatDateDe(d, { day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-fg-muted">Aktuelle Serie: <span className="font-semibold text-fg">{stats.streak.current} Tage</span> · Längste: {stats.streak.longest}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-5 text-accent" />So funktioniert die Wertung</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {settings.tiers.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <TierBadge tier={t.id} />
                <span className="font-display font-medium tabular-nums">{t.points} Pkt.</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-fg-subtle">Nur sachlich richtige Antworten aus unserer geprüften Antwortliste zählen. Die Seltenheit ist redaktionell eingestuft.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="secondary"><Link href="/archiv">Vergangene Challenges im Archiv</Link></Button>
        <Button asChild variant="ghost"><Link href="/info">Spielregeln im Detail</Link></Button>
      </div>
      <LocalDataNotice />
    </div>
  );
}
