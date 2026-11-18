"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Crown, Flame, Infinity as InfinityIcon, Leaf, Shuffle } from "lucide-react";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

const LEVELS = [
  { id: "leicht", label: "Leicht", icon: Leaf, tone: "from-[#2fbf8f] to-[#2fa9d6]" },
  { id: "normal", label: "Normal", icon: Shuffle, tone: "from-[#ffb347] to-[#ff7a45]" },
  { id: "schwer", label: "Schwer", icon: Flame, tone: "from-[#ff2e88] to-[#8a4fff]" },
  { id: "mix", label: "Alles", icon: InfinityIcon, tone: "from-[#35e0ff] to-[#8a4fff]" },
] as const;

/** Start für Endlos-Runden mit Schwierigkeitswahl (Themen-Packs und Unlimited) */
export function EndlessLauncher({ href, className }: { href: string; className?: string }) {
  const { premium } = useApp();
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LEVELS.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`${href}&diff=${l.id}`} className={cn("group relative flex h-24 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-3 text-white transition-transform hover:-translate-y-1 active:scale-[0.98]", l.tone)}>
              <l.icon className="size-5 opacity-90" />
              <span className="font-display text-3xl leading-none tracking-wide">{l.label}</span>
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-white/60">
        {premium.active ? <><Crown className="size-3.5 text-[#d9c2ff]" />Premium: bis zu 60 Fragen am Stück</> : <>10 Fragen am Stück · <Link href="/premium" className="font-semibold text-[#d9c2ff] hover:text-white">mit Premium ohne Pause</Link></>}
      </p>
    </div>
  );
}
