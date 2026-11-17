"use client";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Dumbbell, Gem, ListChecks, Repeat2, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { PackArt } from "@/components/pack-art";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DifficultyDots, ResetCountdown, StatTile } from "@/components/bits";
import { maxPointsPerQuestion } from "@/lib/game/scoring";
import { formatDateDe } from "@/lib/time";
import { fmt } from "@/lib/utils";

export default function PackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { packById, overview, hasOfficial, stats, attempts, settings } = useApp();
  const pack = packById(id);
  if (!pack) notFound();
  const today = overview?.packs.find((p) => p.packId === id);
  const set = today?.set;
  const played = hasOfficial(set?.id);
  const ps = stats.perPack[id];
  const history = attempts.filter((a) => a.packId === id).slice(0, 8);
  const max = (set?.count ?? settings.packQuestionCount) * maxPointsPerQuestion(settings);

  return (
    <div className="space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-3"><Link href="/packs"><ArrowLeft />Alle Packs</Link></Button>

      <section className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="relative h-56 sm:h-72">
          <PackArt packId={pack.id} image={pack.coverImage} alt={pack.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Themen-Pack</p>
            <h1 className="mt-1 font-display text-4xl font-medium tracking-tight sm:text-5xl">{pack.name}</h1>
            <p className="mt-2 max-w-xl text-white/85">{pack.tagline}</p>
          </div>
        </div>
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-fg-muted">{pack.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {pack.topics.map((t) => <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-fg-muted">{t}</span>)}
            </div>
          </div>
          <div className="rounded-3xl p-5" style={{ background: pack.accentSoft, color: pack.ink }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">Die heutige {pack.short}-Challenge</p>
            {set ? (
              <>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2"><ListChecks className="size-4" />{set.count} Fragen{set.repeats ? ` · ${set.repeats} Wiederholung${set.repeats > 1 ? "en" : ""}` : " · alle neu"}</li>
                  <li className="flex items-center gap-2"><Gem className="size-4" />Bis zu {fmt(max)} Punkte</li>
                  <li className="flex items-center gap-2">Schwierigkeit <DifficultyDots value={set.difficulty} /></li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {played ? (
                    <>
                      <Button asChild size="sm" style={{ background: pack.ink, color: pack.accentSoft }}><Link href={`/ergebnis/${played.id}`}><Check />{played.total} Punkte – ansehen</Link></Button>
                      <Button asChild size="sm" variant="secondary"><Link href={`/play?mode=pack&pack=${pack.id}&practice=1`}><Repeat2 />Wiederholen</Link></Button>
                    </>
                  ) : (
                    <Button asChild style={{ background: pack.ink, color: pack.accentSoft }}><Link href={`/play?mode=pack&pack=${pack.id}`}>Challenge starten <ArrowRight /></Link></Button>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm">Für heute sind in diesem Pack noch keine geprüften Fragen verfügbar.</p>
            )}
            <ResetCountdown className="mt-4 text-xs opacity-75" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="size-5 text-accent" />Training</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-fg-muted">Zufällige Fragen aus dem gesamten {pack.short}-Bestand. Beliebig oft spielbar, zählt nicht für die Tageswertung.</p>
            <Button asChild variant="secondary" className="mt-4"><Link href={`/play?mode=training&pack=${pack.id}`}>Training starten</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="size-5 text-accent" />Deine {pack.short}-Statistik</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <StatTile label="Challenges" value={ps?.challenges ?? 0} />
            <StatTile label="Punkte gesammelt" value={fmt(ps?.points ?? 0)} />
            <StatTile label="Durchschnitt" value={ps?.average ?? 0} />
            <StatTile label="Beste Challenge" value={ps?.best ?? 0} hint={`${ps?.trainingRounds ?? 0} Trainingsrunden`} />
          </CardContent>
        </Card>
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Letzte Runden</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-line">
              {history.map((a) => (
                <li key={a.id}>
                  <Link href={`/ergebnis/${a.id}`} className="flex items-center justify-between py-3 text-sm hover:text-accent">
                    <span>{a.date ? formatDateDe(a.date) : new Date(a.finishedAt).toLocaleDateString("de-CH")} · {a.official ? "Tages-Challenge" : a.mode === "training" ? "Training" : "Archiv"}</span>
                    <span className="font-display text-base font-medium">{a.total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
