"use client";
import { BookOpen, Compass, Crown, Feather, Flame, Gem, Mountain, Sprout, Star, Target } from "lucide-react";
import type { AchievementDef } from "@/lib/game/stats";
import { cn } from "@/lib/utils";

const ICONS = { seedling: Sprout, flame: Flame, gem: Gem, crown: Crown, compass: Compass, mountain: Mountain, star: Star, target: Target, book: BookOpen, feather: Feather };
const METAL = {
  bronze: ["#8a5a3a", "#c99a6a"],
  silver: ["#6e7473", "#c9cfcc"],
  gold: ["#9a7322", "#e2c27a"],
};

/** Dezente Medaille mit Prägung – grau, solange nicht verdient */
export function AchievementMedal({ achievement, earned, size = 56, className }: { achievement: Pick<AchievementDef, "icon" | "tier" | "title">; earned: boolean; size?: number; className?: string }) {
  const Icon = ICONS[achievement.icon] ?? Star;
  const [a, b] = METAL[achievement.tier];
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full", !earned && "opacity-45 grayscale", className)} style={{ width: size, height: size }} title={achievement.title}>
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`m-${achievement.tier}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={b} />
            <stop offset="1" stopColor={a} />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r="27" fill={`url(#m-${achievement.tier})`} />
        <circle cx="28" cy="28" r="22" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="1.5 2.5" />
        <circle cx="28" cy="28" r="19" fill="#000" fillOpacity="0.08" />
      </svg>
      <Icon className="relative text-white drop-shadow-sm" style={{ width: size * 0.4, height: size * 0.4 }} />
    </span>
  );
}
