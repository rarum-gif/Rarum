"use client";
import Link from "next/link";
import { ArrowUpRight, Check, Repeat2 } from "lucide-react";
import type { ThemePack } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PackArt } from "./pack-art";
import { useApp } from "./providers";

/** Bildkarte eines Themen-Packs mit Zoom, Lichtreflex und animiertem Text */
export function PackCard({ pack, className, compact = false, tile = false }: { pack: ThemePack; className?: string; compact?: boolean; tile?: boolean }) {
  const { overview, hasOfficial, stats } = useApp();
  const today = overview?.packs.find((p) => p.packId === pack.id);
  const played = hasOfficial(today?.set?.id);
  const ps = stats.perPack[pack.id];
  return (
    <Link
      href={`/packs/${pack.id}`}
      style={{ ["--pack" as string]: pack.accent }}
      className={cn(
        "group relative isolate flex overflow-hidden rounded-[22px] border border-white/12 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] transition-all duration-500 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.95)]",
        tile ? "aspect-[5/4]" : compact ? "aspect-[4/5] sm:aspect-[3/4]" : "aspect-[16/11]",
        className,
      )}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[1.2s] ease-out group-hover:scale-110">
        <PackArt packId={pack.id} image={pack.coverImage} alt="" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(10,6,16,0.95)] via-[rgba(10,6,16,0.35)] to-transparent transition-opacity duration-500 group-hover:opacity-90" />
      {/* Lichtreflex */}
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity group-hover:animate-[sheen_1.1s_ease-out] group-hover:opacity-100" />
      {/* Akzentlinie in Pack-Farbe */}
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[var(--pack)] transition-transform duration-500 group-hover:scale-x-100" style={{ background: `linear-gradient(90deg, ${pack.accent}, #ff7a45)` }} />

      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        {played ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#1b1530]">
            <Check className="size-3.5" /> <span className="font-num">{played.total}</span>
          </span>
        ) : today?.set ? (
          <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {today.set.count} Fragen{today.set.repeats > 0 && <Repeat2 className="ml-1 inline size-3" />}
          </span>
        ) : null}
      </div>

      <div className="mt-auto w-full p-4 transition-transform duration-500 group-hover:-translate-y-1 sm:p-5">
        <h3 className={cn("font-display text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]", compact ? "text-[26px] sm:text-3xl" : "text-4xl")}>{pack.name}</h3>
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/65">
          <span>{ps && ps.challenges > 0 ? `${ps.challenges}× · Ø ${ps.average}` : "Neu für dich"}</span>
          <ArrowUpRight className="size-4 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
        </div>
      </div>
    </Link>
  );
}
