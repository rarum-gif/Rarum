"use client";
import * as React from "react";
import { Bird, Clock3, Compass, Feather, HardDrive, Leaf, Moon, Mountain, Shell, Snowflake, Sprout, Sun, TreePine, Waves } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { TierId } from "@/lib/types";
import { AVATARS } from "@/lib/avatars";
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
      <svg viewBox="0 0 40 40" className="size-9 shrink-0 drop-shadow-[0_4px_14px_rgba(255,106,85,0.55)]" aria-hidden>
        <defs>
          <linearGradient id="logo-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1745" /><stop offset="1" stopColor="#4a1630" /></linearGradient>
          <linearGradient id="logo-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd36e" /><stop offset="0.55" stopColor="#ff7a45" /><stop offset="1" stopColor="#ff4f8b" /></linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#logo-sky)" />
        <circle cx="20" cy="23" r="11" fill="url(#logo-sun)" />
        <rect x="6" y="25" width="28" height="1.6" fill="#2a1745" />
        <rect x="6" y="28.5" width="28" height="2.2" fill="#2a1745" />
        <rect x="4" y="31.5" width="32" height="9" fill="#1b1530" />
        <path d="M27.5 32 C 27.8 26, 28.6 20, 30.6 15.5" stroke="#0c0a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M30.6 15.5 c -3 -1.8 -6 -1 -7.5 1 M30.6 15.5 c 2.6 -1.6 5.4 -0.8 6.6 1.4 M30.6 15.5 c -1 -2.6 -3.6 -3.6 -6 -3 M30.6 15.5 c 1.6 -2.4 4 -2.8 5.8 -1.8" stroke="#0c0a10" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      {withText && <span className="font-display text-[28px] leading-none tracking-[0.08em] text-white">NNAXOS</span>}
    </span>
  );
}

const AVATAR_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = { Leaf, Mountain, Waves, Bird, TreePine, Sun, Moon, Feather, Compass, Sprout, Shell, Snowflake };

export function AvatarBubble({ id, size = 36, className }: { id?: string | null; size?: number; className?: string }) {
  const a = AVATARS.find((x) => x.id === id) ?? AVATARS[0];
  const Icon = AVATAR_ICONS[a.icon] ?? Leaf;
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-white ring-2 ring-surface", className)} style={{ width: size, height: size, background: `linear-gradient(140deg, ${a.from}, ${a.to})` }} aria-hidden>
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
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
