"use client";
import Link from "next/link";
import { Check, Repeat2 } from "lucide-react";
import type { ThemePack } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PackArt } from "./pack-art";
import { useApp } from "./providers";

export function PackCard({ pack, className, compact = false }: { pack: ThemePack; className?: string; compact?: boolean }) {
  const { overview, hasOfficial, stats } = useApp();
  const today = overview?.packs.find((p) => p.packId === pack.id);
  const played = hasOfficial(today?.set?.id);
  const ps = stats.perPack[pack.id];
  return (
    <Link
      href={`/packs/${pack.id}`}
      className={cn("group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]", className)}
    >
      <div className={cn("relative overflow-hidden", compact ? "aspect-[16/9]" : "aspect-[16/10]")}>
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
          <PackArt packId={pack.id} image={pack.coverImage} alt={`Illustration ${pack.name}`} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent" />
        {played ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-forest-800 backdrop-blur">
            <Check className="size-3.5" /> {played.total} Pkt.
          </span>
        ) : today?.set ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            Heute: {today.set.count} Fragen
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: pack.accent }} />
          <h3 className="font-display text-[17px] font-medium leading-tight">{pack.name}</h3>
        </div>
        {!compact && <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">{pack.tagline}</p>}
        <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-fg-subtle">
          {ps && ps.challenges > 0 ? <span>{ps.challenges}× gespielt · Ø {ps.average}</span> : <span>Noch nicht gespielt</span>}
          {today?.set && today.set.repeats > 0 && (
            <span className="inline-flex items-center gap-1" title="Enthält Wiederholungen"><Repeat2 className="size-3.5" />{today.set.repeats}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
