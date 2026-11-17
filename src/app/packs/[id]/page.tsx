"use client";
import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Dumbbell, Gem, ListChecks, Repeat2, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { PackArt } from "@/components/pack-art";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetCountdown, StatTile } from "@/components/bits";
import { SceneOverride } from "@/components/scene";
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
      <SceneOverride scene={pack.id} />
      <Button asChild variant="ghost" size="sm" className="-ml-3"><Link href="/packs"><ArrowLeft />Alle Packs</Link></Button>

      <section className="glass overflow-hidden rounded-[28px] shadow-[var(--shadow-lift)]">
        <div className="relative h-72 sm:h-[26rem]">
          <PackArt packId={pack.id} image={pack.coverImage} alt={pack.name} variant="full" className="kenburns" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(18,14,34,1)] via-[rgba(18,14,34,0.25)] to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white sm:p-10">
            <h1 className="font-display mt-2 text-6xl drop-shadow-[0_6px_30px_rgba(0,0,0,0.6)] sm:text-8xl">{pack.name}</h1>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="hud relative overflow-hidden rounded-3xl p-5 text-white">
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${pack.accent}, #ff7a45, #ff4f8b)` }} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--peach)]">Heute</p>
            {set ? (
              <>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex items-center gap-2"><ListChecks className="size-4" />{set.count} Fragen{set.repeats ? ` · ${set.repeats} Wiederholung${set.repeats > 1 ? "en" : ""}` : " · alle neu"}</li>
                  <li className="flex items-center gap-2"><Gem className="size-4" />Bis zu {fmt(max)} Punkte</li>
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {played ? (
                    <>
                      <Button asChild size="sm"><Link href={`/ergebnis/${played.id}`}><Check />{played.total} Punkte – ansehen</Link></Button>
                      <Button asChild size="sm" variant="secondary"><Link href={`/play?mode=pack&pack=${pack.id}&practice=1`}><Repeat2 />Wiederholen</Link></Button>
                    </>
                  ) : (
                    <Button asChild variant="sand" size="lg"><Link href={`/play?mode=pack&pack=${pack.id}`}>Challenge starten <ArrowRight /></Link></Button>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm">Heute keine Fragen.</p>
            )}
            <ResetCountdown className="mt-4 text-xs text-white/70" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Dumbbell className="size-5 text-[var(--peach)]" />Training</CardTitle></CardHeader>
          <CardContent>
            <Button asChild variant="secondary"><Link href={`/play?mode=training&pack=${pack.id}`}>Training starten</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="size-5 text-[var(--peach)]" />Deine {pack.short}-Statistik</CardTitle></CardHeader>
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
                  <Link href={`/ergebnis/${a.id}`} className="flex items-center justify-between py-3 text-sm hover:text-[var(--peach)]">
                    <span>{a.date ? formatDateDe(a.date) : new Date(a.finishedAt).toLocaleDateString("de-CH")} · {a.official ? "Tages-Challenge" : a.mode === "training" ? "Training" : "Archiv"}</span>
                    <span className="font-num text-base font-semibold text-white">{a.total}</span>
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
