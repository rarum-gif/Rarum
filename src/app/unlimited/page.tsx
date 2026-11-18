"use client";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { EndlessLauncher } from "@/components/endless-launcher";
import { useApp } from "@/components/providers";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, StatTile } from "@/components/bits";
import { PackArt } from "@/components/pack-art";
import { fmt } from "@/lib/utils";

export default function UnlimitedPage() {
  const { stats, attempts, packs } = useApp();
  const runs = attempts.filter((a) => a.mode === "unlimited");
  const answered = runs.reduce((s, a) => s + a.answers.length, 0);
  return (
    <div className="space-y-8">
      <PageHeader title="Unlimited" />
      <section className="glass relative overflow-hidden rounded-[28px] shadow-[var(--shadow-lift)]">
        <div className="flex h-32 sm:h-44">
          {packs.map((p) => <div key={p.id} className="min-w-0 flex-1 transition-[flex] duration-500 hover:flex-[3]"><PackArt packId={p.id} image={p.coverImage} /></div>)}
        </div>
        <div className="p-6 sm:p-8">
          <EndlessLauncher href="/play?mode=unlimited" />
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
            <p className="font-display mb-3 text-2xl text-white">Letzte Runden</p>
            <ul className="divide-y divide-line">
              {runs.slice(0, 8).map((a) => (
                <li key={a.id}><Link href={`/ergebnis/${a.id}`} className="flex justify-between py-2.5 text-sm hover:text-[var(--peach)]"><span>{new Date(a.finishedAt).toLocaleString("de-CH", { dateStyle: "medium", timeStyle: "short" })} · {a.answers.length} Fragen</span><span className="font-num font-semibold text-white">{a.total}</span></Link></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
