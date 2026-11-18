"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Globe2, MapPin, Target, Timer } from "lucide-react";
import { useApp } from "@/components/providers";
import { WorldMap } from "@/components/world-map";
import { StatTile } from "@/components/bits";
import { SceneOverride } from "@/components/scene";
import { ATLAS, ATLAS_ROUND, ATLAS_TIME } from "@/content/atlas";

export default function AtlasPage() {
  const { attempts } = useApp();
  const runs = attempts.filter((a) => a.mode === "atlas");
  const best = runs.reduce((m, a) => Math.max(m, a.total), 0);
  const bull = runs.reduce((n, a) => n + a.answers.filter((x) => x.tier === "legendary").length, 0);
  return (
    <div className="space-y-8">
      <SceneOverride scene="coast" />
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 shadow-[var(--shadow-lift)]">
        <WorldMap guess={null} disabled className="pointer-events-none aspect-[16/9] w-full rounded-none border-0 opacity-80 sm:aspect-[21/9]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,6,20,0.95)] via-[rgba(10,6,20,0.35)] to-transparent" />
        {[[22, 38], [48, 30], [70, 52], [83, 70]].map(([x, y], i) => (
          <motion.span key={i} className="absolute" style={{ left: `${x}%`, top: `${y}%` }} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + i * 0.18, type: "spring", damping: 10 }}>
            <MapPin className="size-7 fill-[#ff2e88] text-white drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]" />
          </motion.span>
        ))}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6 sm:p-10">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.35em] text-[var(--peach)]"><Globe2 className="size-4" />Neu</p>
            <h1 className="font-display title-chroma text-6xl leading-none text-white sm:text-8xl">Weltkarte</h1>
            <p className="font-num mt-2 text-sm uppercase tracking-[0.2em] text-white/75">{ATLAS_ROUND} Orte · {ATLAS_TIME} Sek. · {ATLAS.length} Ziele weltweit</p>
          </div>
          <Link href="/play?mode=atlas" className="btn-sunset cta-glow inline-flex items-center gap-3 rounded-2xl px-8 py-4 font-display text-3xl tracking-[0.12em]">Spielen <ArrowRight className="size-6" /></Link>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile icon={Target} label="Beste Runde" value={best || "–"} hint="max. 500" />
        <StatTile icon={MapPin} label="Volltreffer" value={bull} hint="unter 25 km" />
        <StatTile icon={Timer} label="Gespielte Runden" value={runs.length} className="col-span-2 md:col-span-1" />
      </div>
      {runs.length > 0 && (
        <div className="glass rounded-[24px] p-5">
          <p className="font-display mb-3 text-2xl text-white">Letzte Runden</p>
          <ul className="divide-y divide-line">
            {runs.slice(0, 8).map((a) => (
              <li key={a.id}><Link href={`/ergebnis/${a.id}`} className="flex justify-between py-2.5 text-sm hover:text-[var(--peach)]"><span className="truncate">{a.answers.map((x) => x.prompt.replace("Wo liegt ", "").replace("?", "")).join(" · ")}</span><span className="font-num ml-3 font-semibold text-white">{a.total}</span></Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
