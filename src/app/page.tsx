"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarCheck2, Clock, Flame, Gem, Infinity as InfinityIcon, Medal, Mountain, Sparkles, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/components/providers";
import { PackCard } from "@/components/pack-card";
import { HeroArt } from "@/components/hero-art";
import { AnimatedNumber, LocalDataNotice, ResetCountdown, StatTile, TierBadge } from "@/components/bits";
import { maxPointsPerQuestion } from "@/lib/game/scoring";
import { formatDateDe } from "@/lib/time";
import { fmt } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Gute Nacht";
  if (h < 11) return "Guten Morgen";
  if (h < 17) return "Guten Tag";
  return "Guten Abend";
}

function DailyHero() {
  const { overview, settings, hasOfficial, attemptsLoaded } = useApp();
  const daily = overview?.daily;
  const played = hasOfficial(daily?.id);
  const count = daily?.count ?? settings.dailyQuestionCount;
  const max = count * maxPointsPerQuestion(settings);
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-[28px] text-cream shadow-[var(--shadow-lift)]">
      <HeroArt className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/45 to-transparent" />
      <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sand-200 backdrop-blur">
            <Sparkles className="size-3.5" /> Daily Challenge · {overview ? formatDateDe(overview.today, { day: "numeric", month: "long" }) : "heute"}
          </p>
          <h1 className="font-display text-[32px] font-medium leading-[1.08] tracking-tight sm:text-5xl">
            {played ? "Heutige Challenge geschafft." : "Deine heutige Wissens-Challenge wartet."}
          </h1>
          {played ? (
            <p className="mt-4 max-w-md text-sand-200/90">
              Du hast <span className="font-semibold text-white">{played.total} von {played.maxTotal} Punkten</span> geholt. Morgen gibt es neue Fragen – du kannst die heutige Runde als Training wiederholen.
            </p>
          ) : (
            <p className="mt-4 max-w-md text-sand-200/90">Tippe deine eigenen Antworten. Je seltener eine richtige Antwort ist, desto mehr Punkte bekommst du.</p>
          )}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-sand-100">
            <li className="flex items-center gap-2"><CalendarCheck2 className="size-4 text-sand-300" />{count} neue Fragen</li>
            <li className="flex items-center gap-2"><Clock className="size-4 text-sand-300" />{settings.timeLimitSeconds} Sekunden pro Frage</li>
            <li className="flex items-center gap-2"><Gem className="size-4 text-sand-300" />Bis zu {fmt(max)} Punkte</li>
          </ul>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          {played ? (
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="sand"><Link href={`/ergebnis/${played.id}`}>Ergebnis ansehen</Link></Button>
              <Button asChild size="lg" variant="outlineLight"><Link href="/play?mode=daily&practice=1">Als Training</Link></Button>
            </div>
          ) : (
            <Button asChild size="lg" variant="sand" className="min-w-48 text-[17px]" disabled={!attemptsLoaded}>
              <Link href="/play?mode=daily">Jetzt spielen <ArrowRight /></Link>
            </Button>
          )}
          <ResetCountdown className="text-sm text-sand-200" prefix="Nächste Challenge in" />
          {daily && daily.repeats > 0 && <p className="text-xs text-sand-200/80">Enthält {daily.repeats} Wiederholung{daily.repeats > 1 ? "en" : ""} aus früheren Tagen.</p>}
        </div>
      </div>
    </motion.section>
  );
}

export default function HomePage() {
  const { packs, stats, level, attempts, attemptsLoaded, overview, hasOfficial, user, packById } = useApp();
  const recent = attempts.slice(0, 5);
  const todaysSets = overview ? [overview.daily, ...overview.packs.map((p) => p.set)].filter(Boolean) : [];
  const doneToday = todaysSets.filter((s) => hasOfficial(s!.id)).length;
  const favorites = Object.values(stats.perPack).filter((p) => p.challenges + p.trainingRounds > 0).sort((a, b) => b.challenges + b.trainingRounds - (a.challenges + a.trainingRounds)).slice(0, 3);
  const discover = packs.filter((p) => !(stats.perPack[p.id]?.challenges || stats.perPack[p.id]?.trainingRounds)).slice(0, 3);

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="animate-rise">
          <p className="text-sm text-fg-muted">{greeting()}{user ? `, ${user.username}` : ""}</p>
          <p className="font-display text-xl font-medium">Bereit für seltene Antworten?</p>
        </div>
        <div className="w-full max-w-xs animate-rise">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold">Level {level.current.level} · {level.current.name}</span>
            <span className="text-fg-subtle">{level.next ? `noch ${fmt(level.toNext)} bis ${level.next.name}` : "Höchstes Level"}</span>
          </div>
          <Progress value={level.progress} />
        </div>
      </div>

      <DailyHero />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Gem} label="Gesamtpunkte" value={attemptsLoaded ? <AnimatedNumber value={stats.totalPoints} /> : "–"} hint="nur offizielle Wertungen" />
        <StatTile icon={Flame} label="Aktuelle Serie" value={`${stats.streak.current} ${stats.streak.current === 1 ? "Tag" : "Tage"}`} hint={`Längste: ${stats.streak.longest}`} />
        <StatTile icon={Mountain} label="Beste Daily" value={stats.bestDaily ? fmt(stats.bestDaily.total) : "–"} hint={stats.bestDaily?.date ? formatDateDe(stats.bestDaily.date, { day: "numeric", month: "short" }) : "noch keine"} />
        <StatTile icon={Medal} label="Dein Rang" value={level.current.name} hint={`Level ${level.current.level} von 6`} />
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>15 Themenwelten · alle kostenlos</Eyebrow>
            <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">Deine Themen-Packs</h2>
          </div>
          <ResetCountdown className="text-sm text-fg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {packs.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.03 }}>
              <PackCard pack={p} compact className="h-full" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Deine letzten Ergebnisse</CardTitle>
            {attempts.length > 0 && <Link href="/profil" className="text-sm text-fg-muted hover:text-fg">Alle ansehen</Link>}
          </CardHeader>
          <CardContent>
            {!attemptsLoaded ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-fg-muted">Noch keine Runden gespielt. Starte mit der Daily Challenge!</p>
            ) : (
              <ul className="divide-y divide-line">
                {recent.map((a) => {
                  const best = a.answers.filter((x) => x.tier).sort((x, y) => y.points - x.points)[0];
                  return (
                    <li key={a.id}>
                      <Link href={`/ergebnis/${a.id}`} className="flex items-center gap-4 py-3 transition-colors hover:text-accent">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-fg-muted">
                          {a.mode === "daily" ? <Sparkles className="size-5" /> : a.mode === "unlimited" ? <InfinityIcon className="size-5" /> : <Target className="size-5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {a.mode === "daily" ? "Daily Challenge" : a.mode === "unlimited" ? "Unlimited" : packById(a.packId)?.name ?? "Archiv"}
                            {!a.official && <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-fg-subtle">Training</span>}
                          </p>
                          <p className="text-xs text-fg-subtle">{a.date ? formatDateDe(a.date, { day: "numeric", month: "short" }) : new Date(a.finishedAt).toLocaleDateString("de-CH")} · {a.answers.length} Antworten</p>
                        </div>
                        {best?.tier && <TierBadge tier={best.tier} className="hidden sm:inline-flex" />}
                        <span className="font-display text-lg font-medium tabular-nums">{a.total}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Dein Tag</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-medium">{doneToday}<span className="text-lg text-fg-subtle">/{todaysSets.length}</span></span>
                <span className="text-sm text-fg-muted">{fmt(stats.todayPoints)} Punkte heute</span>
              </div>
              <Progress value={todaysSets.length ? doneToday / todaysSets.length : 0} className="mt-3" />
              <p className="mt-3 text-xs text-fg-subtle">Daily Challenge plus eine Tages-Challenge pro Themen-Pack.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{favorites.length ? "Deine Lieblingsthemen" : "Entdecke"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(favorites.length ? favorites.map((f) => packById(f.packId)!) : discover).map((p) => (
                <Link key={p.id} href={`/packs/${p.id}`} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2">
                  <span className="flex items-center gap-2.5 text-sm font-medium"><span className="size-2.5 rounded-full" style={{ background: p.accent }} />{p.name}</span>
                  <ArrowRight className="size-4 text-fg-subtle" />
                </Link>
              ))}
              <Link href="/unlimited" className="mt-2 flex items-center justify-between rounded-xl bg-accent-soft px-3 py-3 text-sm font-medium text-accent">
                <span className="flex items-center gap-2"><InfinityIcon className="size-4" />Unlimited: endlos trainieren</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/rangliste" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-fg-muted hover:bg-surface-2">
                <span className="flex items-center gap-2"><Trophy className="size-4" />Ranglisten & Freunde</span>
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <LocalDataNotice />
    </div>
  );
}
