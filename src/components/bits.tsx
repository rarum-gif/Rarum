"use client";
import * as React from "react";
import { Anchor, Bird, Car, Cat, Clock3, Crown, Dices, Dog, Fish, Flame, Gamepad2, Gem, Ghost, Glasses, HardDrive, Headphones, Heart, Leaf, Moon, Mountain, Music, Palmtree, Rabbit, Rocket, Shield, Skull, Smile, Sprout, Star, Sun, Sword, Waves, Zap } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { TierId } from "@/lib/types";
import { parseAvatar } from "@/lib/avatars";
import { cn, fmt } from "@/lib/utils";
import { useApp } from "./providers";

export const TIER_ORDER: TierId[] = ["known", "familiar", "unusual", "rare", "very_rare", "legendary"];
export const tierVar = (t: TierId) => `var(--tier-${t})`;

export function useTierLabel() {
  const { settings } = useApp();
  return React.useCallback((t: TierId) => settings.tiers.find((x) => x.id === t)?.label ?? t, [settings.tiers]);
}

/** Markenzeichen: Sonne über dem Horizont mit Palme – eigenständiges Logo */
export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Logo: die Portara von Naxos – antikes Marmortor mit Sonnenuntergang */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" width={36} height={36} className="size-9 shrink-0 drop-shadow-[0_4px_14px_rgba(255,46,136,0.55)]" />
      {withText && <span className="font-display text-[28px] leading-none tracking-[0.08em] text-white">NNAXOS</span>}
    </span>
  );
}

const AVATAR_ICON: Record<string, React.ComponentType<{ style?: React.CSSProperties; strokeWidth?: number }>> = {
  crown: Crown, flame: Flame, zap: Zap, star: Star, gem: Gem, rocket: Rocket, ghost: Ghost, skull: Skull, cat: Cat, dog: Dog, rabbit: Rabbit, bird: Bird, fish: Fish,
  palm: Palmtree, sun: Sun, moon: Moon, waves: Waves, mountain: Mountain, leaf: Leaf, music: Music, gamepad: Gamepad2, car: Car, anchor: Anchor, dice: Dices,
  sword: Sword, shield: Shield, heart: Heart, smile: Smile, glasses: Glasses, headphones: Headphones,
};

export function AvatarIcon({ icon, size }: { icon: string; size: number }) {
  const Icon = AVATAR_ICON[icon] ?? Crown;
  return <Icon style={{ width: size, height: size }} strokeWidth={2.2} />;
}

export function AvatarBubble({ id, size = 36, className }: { id?: string | null; size?: number; className?: string }) {
  const a = parseAvatar(id);
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-white ring-2 ring-surface", className)} style={{ width: size, height: size, background: `linear-gradient(140deg, ${a.from}, ${a.to})` }} aria-hidden>
      <AvatarIcon icon={a.icon} size={size * 0.5} />
    </span>
  );
}

export function TierBadge({ tier, className }: { tier: TierId; className?: string }) {
  const label = useTierLabel()(tier);
  if (tier === "legendary")
    return (
      <span className={cn("bg-sunset inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-[0_4px_14px_-4px_rgba(255,106,85,0.9)]", className)}>
        <span className="size-1.5 rounded-full bg-white" />
        {label}
      </span>
    );
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", className)} style={{ color: tierVar(tier), background: `color-mix(in oklab, ${tierVar(tier)} 14%, transparent)` }}>
      <span className="size-1.5 rounded-full" style={{ background: tierVar(tier) }} />
      {label}
    </span>
  );
}

/** Sechsstufige Seltenheitsanzeige, füllt sich animiert bis zur erreichten Stufe */
export function RarityMeter({ tier, animate = true, className }: { tier: TierId | null; animate?: boolean; className?: string }) {
  const idx = tier ? TIER_ORDER.indexOf(tier) : -1;
  return (
    <div className={cn("flex items-end gap-1.5", className)} aria-label={tier ? `Seltenheitsstufe ${idx + 1} von 6` : "Keine Wertung"}>
      {TIER_ORDER.map((t, i) => (
        <motion.span
          key={t}
          className="block w-full rounded-full"
          style={{ height: 6 + i * 3, background: i <= idx ? (t === "legendary" ? "var(--sunset-gradient)" : tierVar(t)) : "var(--surface-3)", boxShadow: i <= idx ? `0 0 14px -2px ${tierVar(t)}` : undefined }}
          initial={animate ? { scaleY: 0.3, opacity: 0.4 } : false}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ delay: animate ? 0.15 + i * 0.09 : 0, type: "spring", stiffness: 260, damping: 18 }}
        />
      ))}
    </div>
  );
}

export function AnimatedNumber({ value, className, duration = 0.9 }: { value: number; className?: string; duration?: number }) {
  // Zahlen immer in der klaren Statistik-Schrift
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: duration * 1000, bounce: 0 });
  const text = useTransform(spring, (v) => fmt(Math.round(v)));
  React.useEffect(() => {
    mv.set(value);
  }, [mv, value]);
  return <motion.span className={cn("font-num tabular-nums", className)}>{text}</motion.span>;
}

export function useCountdown(targetIso: string | null | undefined, offset = 0) {
  const [now, setNow] = React.useState(() => Date.now() + offset);
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(t);
  }, [offset]);
  const ms = targetIso ? Math.max(0, new Date(targetIso).getTime() - now) : 0;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { ms, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` };
}

export function ResetCountdown({ className, prefix = "Neue Fragen in" }: { className?: string; prefix?: string }) {
  const { overview, serverOffset } = useApp();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const { label } = useCountdown(overview?.nextReset, serverOffset);
  return (
    <span className={cn("inline-flex items-center gap-1.5 tabular-nums", className)}>
      <Clock3 className="size-4 opacity-70" />
      {prefix} <span className="font-semibold">{mounted && overview ? label : "--:--:--"}</span>
    </span>
  );
}

export function StatTile({ label, value, hint, icon: Icon, className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>; className?: string }) {
  return (
    <div className={cn("hud group rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-0.5", className)}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
        {Icon && <Icon className="size-4 text-[var(--peach)] transition-transform duration-300 group-hover:scale-110" />}
        {label}
      </div>
      <div className="font-num mt-1.5 text-2xl font-semibold tracking-tight text-white">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-fg-muted">{hint}</div>}
    </div>
  );
}

export function LocalDataNotice({ className }: { className?: string }) {
  const { accountsEnabled, user } = useApp();
  if (user) return null;
  return (
    <div className={cn("glass flex items-start gap-3 rounded-2xl border-dashed p-4 text-sm text-fg-muted", className)}>
      <HardDrive className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-medium text-fg">Lokale Daten:</span> Deine Ergebnisse werden nur in diesem Browser gespeichert.{" "}
        {accountsEnabled ? "Mit einem kostenlosen Konto kannst du sie auf allen Geräten synchronisieren." : "Konten und globale Ranglisten werden aktiv, sobald Supabase konfiguriert ist."}
      </p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Sprout, title, children, className }: { icon?: React.ComponentType<{ className?: string }>; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("glass flex flex-col items-center rounded-3xl px-6 py-12 text-center", className)}>
      <span className="mb-4 rounded-full bg-accent-soft p-3 text-accent">
        <Icon className="size-6" />
      </span>
      <h3 className="font-display text-2xl">{title}</h3>
      {children && <div className="mt-2 max-w-sm text-sm text-fg-muted">{children}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, className }: { eyebrow?: string; title: string; children?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("mb-8 animate-rise", className)}>
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-sunset">{eyebrow}</p>}
      <h1 className="font-display text-5xl text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)] sm:text-7xl">{title}</h1>
      {children && <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-fg-muted">{children}</div>}
    </header>
  );
}

export function DifficultyDots({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`Schwierigkeit ${value} von 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={cn("size-1.5 rounded-full", i <= Math.round(value) ? "bg-current" : "bg-current opacity-25")} />
      ))}
    </span>
  );
}
