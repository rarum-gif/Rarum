"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, CalendarCheck2, Clock, Flame, Gem, Infinity as InfinityIcon, Medal, Play, Sparkles, Swords, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, Eyebrow } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/components/providers";
import { PackCard } from "@/components/pack-card";
import { HeroArt } from "@/components/hero-art";
import { AnimatedNumber, LocalDataNotice, ResetCountdown, TierBadge } from "@/components/bits";
import { maxPointsPerQuestion } from "@/lib/game/scoring";
import { formatDateDe } from "@/lib/time";
import { cn, fmt } from "@/lib/utils";

function Hud({ icon: Icon, label, value, hint, delay }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; hint?: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} className="hud group relative overflow-hidden rounded-2xl px-4 py-3.5">
      <span className="bg-sunset absolute left-0 top-3 h-8 w-[3px] rounded-r-full" />
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
        <Icon className="size-3.5 text-[var(--peach)] transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-110" />
        {label}
      </div>
      <div className="font-num mt-1 text-2xl font-semibold text-white sm:text-[28px]">{value}</div>
      {hint && <div className="text-[11px] text-white/55">{hint}</div>}
    </motion.div>
  );
}

function MainMenuHero() {
  const { stats, level, attemptsLoaded, overview, hasOfficial } = useApp();
  const played = hasOfficial(overview?.daily?.id);
  return (
    <section className="relative -mx-4 -mt-6 flex min-h-[78vh] flex-col justify-end px-4 pb-8 pt-16 sm:-mx-6 sm:-mt-10 sm:px-6 sm:pb-12">
      <motion.p initial={{ opacity: 0, letterSpacing: "0.6em" }} animate={{ opacity: 1, letterSpacing: "0.32em" }} transition={{ duration: 1.1 }} className="text-[11px] font-bold uppercase text-[var(--peach)] sm:text-xs">
        {overview ? formatDateDe(overview.today, { weekday: "long", day: "numeric", month: "long" }) : "Heute"} · Episode des Tages
      </motion.p>
      <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="font-display mt-3 max-w-4xl text-[64px] leading-[0.88] text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.55)] sm:text-[112px] lg:text-[140px]">
        Ready for <span className="text-sunset">today&apos;s</span> challenge?
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mt-5 max-w-xl text-lg text-white/85 sm:text-xl">
        Dein tägliches Wissen. Deine Antworten. Deine Punkte.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-8 flex flex-wrap items-center gap-4">
        {played ? (
          <>
            <Button asChild size="lg" variant="sand" className="h-16 px-10 text-lg"><Link href={`/ergebnis/${played.id}`}><Trophy />Ergebnis: {played.total}</Link></Button>
            <Button asChild size="lg" variant="outlineLight" className="h-16"><Link href="/unlimited"><InfinityIcon />Unlimited spielen</Link></Button>
          </>
        ) : (
          <Button asChild size="lg" variant="sand" className="h-16 px-10 text-lg" disabled={!attemptsLoaded}>
            <Link href="/play?mode=daily"><Play className="fill-current" />Play now</Link>
          </Button>
        )}
        <ResetCountdown className="text-sm text-white/80" prefix="Neue Episode in" />
      </motion.div>
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Hud icon={Gem} label="Gesamtpunkte" value={attemptsLoaded ? <AnimatedNumber value={stats.totalPoints} /> : "–"} hint="offizielle Wertungen" delay={0.6} />
        <Hud icon={Flame} label="Streak" value={`${stats.streak.current} ${stats.streak.current === 1 ? "Tag" : "Tage"}`} hint={`Rekord: ${stats.streak.longest}`} delay={0.68} />
        <Hud icon={Medal} label="Level" value={<span className="flex items-baseline gap-2">{level.current.level}<span className="font-display text-xl tracking-wide text-white/80">{level.current.name}</span></span>} hint={level.next ? `noch ${fmt(level.toNext)} bis ${level.next.name}` : "Höchstes Level"} delay={0.76} />
        <Hud icon={Swords} label="Challenges" value={stats.officialCount} hint={`${stats.dailyCount} Daily · ${stats.packCount} Packs`} delay={0.84} />
      </div>
    </section>
  );
}

function DailyCard() {
  const { overview, settings, hasOfficial, attemptsLoaded } = useApp();
  const daily = overview?.daily;
  const played = hasOfficial(daily?.id);
  const count = daily?.count ?? settings.dailyQuestionCount;
  const max = count * maxPointsPerQuestion(settings);
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="group relative isolate overflow-hidden rounded-[28px] border border-white/12 shadow-[var(--shadow-lift)]">
      <HeroArt className="absolute inset-0 -z-10 h-full w-full transition-transform duration-[2s] group-hover:scale-105" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(12,8,20,0.92)] via-[rgba(12,8,20,0.6)] to-[rgba(12,8,20,0.15)]" />
      <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
            <Sparkles className="size-3.5 text-[var(--gold)]" /> Daily Challenge
          </p>
          <h2 className="font-display mt-4 text-5xl text-white sm:text-6xl">{played ? "Mission erfüllt." : "Deine heutige Wissens-Challenge wartet."}</h2>
          <p className="mt-3 max-w-md text-white/80">
            {played ? `${played.total} von ${played.maxTotal} Punkten. Morgen wartet eine neue Episode – die heutige kannst du als Training wiederholen.` : "Tippe eigene Antworten. Je seltener eine richtige Antwort ist, desto mehr Punkte."}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm text-white">
            <li className="hud flex items-center gap-2 rounded-xl px-3 py-1.5"><CalendarCheck2 className="size-4 text-[var(--peach)]" />{count} Fragen</li>
            <li className="hud flex items-center gap-2 rounded-xl px-3 py-1.5"><Clock className="size-4 text-[var(--peach)]" />{settings.timeLimitSeconds} Sek.</li>
            <li className="hud flex items-center gap-2 rounded-xl px-3 py-1.5"><Gem className="size-4 text-[var(--peach)]" /><span className="font-num">bis {fmt(max)}</span> Punkte</li>
          </ul>
        </div>
        <div className="flex flex-col items-start gap-4 md:items-end">
          {played ? (
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="sand"><Link href={`/ergebnis/${played.id}`}>Ergebnis</Link></Button>
              <Button asChild size="lg" variant="outlineLight"><Link href="/play?mode=daily&practice=1">Training</Link></Button>
            </div>
          ) : (
            <Button asChild size="lg" variant="sand" className="min-w-56" disabled={!attemptsLoaded}>
              <Link href="/play?mode=daily">Start challenge <ArrowRight /></Link>
            </Button>
          )}
          <ResetCountdown className="text-sm text-white/80" prefix="Nächste Challenge in" />
        </div>
      </div>
    </motion.section>
  );
}

export default function HomePage() {
  const { packs, stats, attempts, attemptsLoaded, overview, hasOfficial, packById } = useApp();
  const recent = attempts.slice(0, 5);
  const todaysSets = overview ? [overview.daily, ...overview.packs.map((p) => p.set)].filter(Boolean) : [];
  const doneToday = todaysSets.filter((s) => hasOfficial(s!.id)).length;
  const favorites = Object.values(stats.perPack).filter((p) => p.challenges + p.trainingRounds > 0).sort((a, b) => b.challenges + b.trainingRounds - (a.challenges + a.trainingRounds)).slice(0, 3);
  const discover = packs.filter((p) => !(stats.perPack[p.id]?.challenges || stats.perPack[p.id]?.trainingRounds)).slice(0, 3);

  return (
    <div className="space-y-16">
      <MainMenuHero />
      <DailyCard />

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Eyebrow>15 Welten · alle kostenlos</Eyebrow>
            <h2 className="font-display mt-2 text-5xl text-white">Themen-Packs</h2>
          </div>
          <ResetCountdown className="text-sm text-fg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {packs.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.035, duration: 0.5 }}>
              <PackCard pack={p} compact className="h-full" />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Letzte Ergebnisse</CardTitle>
            {attempts.length > 0 && <Link href="/profil" className="text-sm font-semibold text-[var(--peach)] hover:text-white">Alle ansehen</Link>}
          </CardHeader>
          <CardContent>
            {!attemptsLoaded ? (
              <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
            ) : recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-fg-muted">Noch keine Runden gespielt. Starte mit der Daily Challenge!</p>
            ) : (
              <ul className="space-y-2">
                {recent.map((a) => {
                  const best = a.answers.filter((x) => x.tier).sort((x, y) => y.points - x.points)[0];
                  return (
                    <li key={a.id}>
                      <Link href={`/ergebnis/${a.id}`} className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white/[0.04] px-3 py-2.5 transition-all hover:border-white/15 hover:bg-white/[0.08]">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={a.packId ? `/images/themes/${a.packId}-card.webp` : a.mode === "unlimited" ? "/images/backgrounds/night-mobile.webp" : "/images/backgrounds/oceandrive-mobile.webp"} alt="" className="h-full w-full object-cover" />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                            {a.mode === "daily" ? <Sparkles className="size-4" /> : a.mode === "unlimited" ? <InfinityIcon className="size-4" /> : <Target className="size-4" />}
                          </span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-white">
                            {a.mode === "daily" ? "Daily Challenge" : a.mode === "unlimited" ? "Unlimited" : packById(a.packId)?.name ?? "Archiv"}
                            {!a.official && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">Training</span>}
                          </p>
                          <p className="text-xs text-fg-subtle">{a.date ? formatDateDe(a.date, { day: "numeric", month: "short" }) : new Date(a.finishedAt).toLocaleDateString("de-CH")} · {a.answers.length} Antworten</p>
                        </div>
                        {best?.tier && <TierBadge tier={best.tier} className="hidden sm:inline-flex" />}
                        <span className="font-num text-xl font-semibold text-white">{a.total}</span>
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
                <span className="font-num text-4xl font-semibold text-white">{doneToday}<span className="text-lg text-fg-subtle">/{todaysSets.length}</span></span>
                <span className="text-sm text-fg-muted"><span className="font-num">{fmt(stats.todayPoints)}</span> Punkte heute</span>
              </div>
              <Progress value={todaysSets.length ? doneToday / todaysSets.length : 0} className="mt-3" />
              <p className="mt-3 text-xs text-fg-subtle">Daily Challenge plus eine Tages-Challenge pro Themen-Pack.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{favorites.length ? "Deine Favoriten" : "Entdecke"}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(favorites.length ? favorites.map((f) => packById(f.packId)!) : discover).map((p) => (
                <Link key={p.id} href={`/packs/${p.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.07]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/themes/${p.id}-card.webp`} alt="" className="size-10 rounded-lg object-cover" />
                  <span className="flex-1 text-sm font-semibold text-white">{p.name}</span>
                  <ArrowRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              ))}
              <Link href="/unlimited" className={cn("bg-sunset mt-2 flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-white glow-sunset")}>
                <span className="flex items-center gap-2"><InfinityIcon className="size-4" />Unlimited: endlos trainieren</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/rangliste" className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-fg-muted hover:bg-white/[0.07] hover:text-white">
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
