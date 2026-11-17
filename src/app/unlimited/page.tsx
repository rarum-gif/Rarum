"use client";
import Link from "next/link";
import { ArrowRight, Infinity as InfinityIcon, Shuffle, Timer, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatTile } from "@/components/bits";
import { PackArt } from "@/components/pack-art";
import { fmt } from "@/lib/utils";

export default function UnlimitedPage() {
  const { stats, attempts, settings, packs } = useApp();
  const runs = attempts.filter((a) => a.mode === "unlimited");
  const answered = runs.reduce((s, a) => s + a.answers.length, 0);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Unlimited" title="Endlos trainieren">
        Zufällige Fragen aus allen 15 Themenwelten, so lange du willst. Kein Tageslimit, keine Energie, keine Pausen – beende die Runde, wann du möchtest.
      </PageHeader>
      <section className="relative overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="grid grid-cols-5 opacity-90">
          {packs.slice(0, 5).map((p) => <div key={p.id} className="h-24 sm:h-32"><PackArt packId={p.id} image={p.coverImage} /></div>)}
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <ul className="space-y-2 text-sm text-fg-muted">
              <li className="flex items-center gap-2"><Shuffle className="size-4 text-accent" />Immer neue Kombinationen aus allen Packs</li>
              <li className="flex items-center gap-2"><Timer className="size-4 text-accent" />{settings.timeLimitSeconds} Sekunden pro Frage</li>
              <li className="flex items-center gap-2"><InfinityIcon className="size-4 text-accent" />Raritäts-Punkte wie in der Daily Challenge</li>
            </ul>
            <Button asChild size="lg"><Link href="/play?mode=unlimited">Unlimited starten <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile icon={Trophy} label="Persönliche Bestleistung" value={fmt(stats.bestUnlimited)} />
        <StatTile label="Gespielte Runden" value={runs.length} />
        <StatTile label="Beantwortete Fragen" value={answered} className="col-span-2 md:col-span-1" />
      </div>
      {runs.length > 0 && (
        <Card>
          <CardContent>
            <p className="mb-3 font-display text-lg font-medium">Letzte Runden</p>
            <ul className="divide-y divide-line">
              {runs.slice(0, 8).map((a) => (
                <li key={a.id}><Link href={`/ergebnis/${a.id}`} className="flex justify-between py-2.5 text-sm hover:text-accent"><span>{new Date(a.finishedAt).toLocaleString("de-CH", { dateStyle: "medium", timeStyle: "short" })} · {a.answers.length} Fragen</span><span className="font-display font-medium">{a.total}</span></Link></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
