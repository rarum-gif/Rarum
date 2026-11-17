"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Gem, ListChecks, Repeat2 } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, ResetCountdown } from "@/components/bits";
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
      <PageHeader title="Daily Challenge" />

      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/12 text-white shadow-[var(--shadow-lift)]">
        <HeroArt className="kenburns absolute inset-0 -z-10 h-full w-full" src="/images/backgrounds/oceandrive.webp" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(12,8,20,0.9)] via-[rgba(12,8,20,0.55)] to-[rgba(12,8,20,0.2)]" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--peach)]">{overview ? formatDateDe(overview.today, { weekday: "long", day: "numeric", month: "long" }) : ""}</p>
            <h2 className="font-display mt-2 text-5xl sm:text-7xl">{played ? `${played.total} Punkte – stark!` : "Bereit für heute?"}</h2>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
              <li className="flex items-center gap-2"><ListChecks className="size-4" />{daily?.count ?? settings.dailyQuestionCount} Fragen</li>
              <li className="flex items-center gap-2"><Clock className="size-4" />{settings.timeLimitSeconds} Sek. pro Frage</li>
              <li className="flex items-center gap-2"><Gem className="size-4" />max. {fmt(max)} Punkte</li>
            </ul>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {played ? (
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="sand" size="lg"><Link href={`/ergebnis/${played.id}`}>Ergebnis ansehen</Link></Button>
                <Button asChild variant="outlineLight" size="lg"><Link href="/play?mode=daily&practice=1"><Repeat2 />Training</Link></Button>
              </div>
            ) : (
              <Button asChild variant="sand" size="lg" className="min-w-56"><Link href="/play?mode=daily">Start challenge <ArrowRight /></Link></Button>
            )}
            <ResetCountdown className="text-sm text-white/80" prefix="Nächste Challenge in" />
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-5 text-[var(--peach)]" />Deine Woche</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {week.map((d) => {
                const a = dailyByDate.get(d);
                return (
                  <div key={d} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] text-fg-subtle">{formatDateDe(d, { weekday: "short" })}</span>
                    <span className={`font-num flex size-11 items-center justify-center rounded-xl text-xs font-semibold ${a ? "bg-sunset text-white shadow-[0_6px_18px_-6px_rgba(255,106,85,0.9)]" : d === today ? "border-2 border-dashed border-white/30 text-white/70" : "bg-white/[0.06] text-fg-subtle"}`}>
                      {a ? a.total : formatDateDe(d, { day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-fg-muted">Aktuelle Serie: <span className="font-semibold text-fg">{stats.streak.current} Tage</span> · Längste: {stats.streak.longest}</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
