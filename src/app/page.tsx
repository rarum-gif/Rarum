"use client";
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CalendarDays, ChevronDown, Crown, Globe2, Home as HomeIcon, Flame, Gem, Infinity as InfinityIcon, LayoutGrid, Lock, RotateCcw, ShoppingBag, Swords, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { CharacterArt } from "@/components/character";
import { EstateView } from "@/components/world/estate-view";
import { ItemArt } from "@/components/world/item-art";
import { ResetCountdown } from "@/components/bits";
import { formatCash } from "@/lib/game/wealth";
import { SHOP, canBuy } from "@/lib/game/economy";
import { divisionFor, rankedFromAttempts, season } from "@/lib/game/ranked";
import { daysBetween } from "@/lib/time";
import { cn } from "@/lib/utils";
import { MONETIZATION } from "@/lib/monetization";

/* ------------------------------------------------------------------
   Hauptmenü – ein Bildschirm, ein Ziel: spielen.
   Aufbau: Titel · Spielregel · Ranked-Karte · PLAY NOW · Modus-Leiste.
   Darunter die Leiter vom Strand bis zur Privatinsel.
   ------------------------------------------------------------------ */

function Wordmark() {
  const reduce = useReducedMotion();
  const letters = "NNAXOS".split("");
  return (
    <h1 className="font-display title-chroma select-none text-center text-[clamp(84px,19vw,220px)] leading-[0.8] tracking-[0.04em] text-white" aria-label="NNAXOS">
      {letters.map((l, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={reduce ? false : { opacity: 0, y: 40, rotateX: -70, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {l}
        </motion.span>
      ))}
    </h1>
  );
}

function RankedCard() {
  const { attempts, today } = useApp();
  const s = season(today);
  const me = rankedFromAttempts(attempts, s.start);
  const div = divisionFor(me.rp);
  return (
    <Link href="/ranked" className="group relative block overflow-hidden rounded-2xl border border-white/20 bg-[rgba(10,6,20,0.62)] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/45">
      <span className="bg-sunset absolute -top-px left-4 rounded-b-md px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-white">Neu</span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <div className="mt-2 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl border border-white/15" style={{ background: `linear-gradient(140deg, ${div.division.color}55, transparent)` }}>
          <Swords className="size-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[26px] leading-none tracking-wide text-white">Ranked</p>
          <p className="truncate text-xs text-white/65">{me.matches ? `${div.division.name} · ${me.rp} RP` : s.label}</p>
        </div>
        <span className="font-display text-xl tracking-wide text-[var(--peach)] transition-transform group-hover:translate-x-1">Spielen ›</span>
      </div>
    </Link>
  );
}

function PlayButton() {
  const { overview, hasOfficial, attemptsLoaded, settings, economy } = useApp();
  const played = hasOfficial(overview?.daily?.id);
  const reduce = useReducedMotion();
  if (played) {
    return (
      <Link href={`/ergebnis/${played.id}`} className="cta-glow group relative flex h-[76px] w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/30 bg-[rgba(12,8,24,0.72)] backdrop-blur-xl">
        <Trophy className="size-6 text-[var(--gold)]" />
        <span className="font-display text-3xl tracking-[0.12em] text-white sm:text-4xl">Heute: {played.total} Punkte</span>
        <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-white/60 sm:inline">+{formatCash(economy.rounds[played.id]?.cash ?? 0)}</span>
      </Link>
    );
  }
  const count = overview?.daily?.count ?? settings.dailyQuestionCount;
  return (
    <Link
      href="/play?mode=daily"
      aria-disabled={!attemptsLoaded}
      className={cn("cta-glow group relative flex h-[84px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/40 btn-sunset", !attemptsLoaded && "pointer-events-none opacity-70")}
    >
      <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/25 blur-md [animation:sheen_3.6s_ease-in-out_infinite]" />
      <motion.span animate={reduce ? undefined : { y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }} className="mr-4 text-2xl text-white/90">▲</motion.span>
      <span className="font-display text-[44px] leading-none tracking-[0.14em] text-white drop-shadow-[0_3px_0_rgba(80,0,40,0.35)] sm:text-5xl">Play now</span>
      <motion.span animate={reduce ? undefined : { y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.2 }} className="ml-4 text-2xl text-white/90">▲</motion.span>
      <span className="absolute bottom-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">{count} Fragen · {settings.timeLimitSeconds} Sekunden</span>
    </Link>
  );
}

function ModeChip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-[rgba(10,6,20,0.55)] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/50 hover:text-white">
      {children}
    </Link>
  );
}

function Hero() {
  const { overview, settings, attemptsLoaded } = useApp();
  const episode = overview ? Math.max(1, daysBetween(settings.launchDate, overview.today) + 1) : null;
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -80]);
  return (
    <section ref={ref} className="bleed flex min-h-[100svh] flex-col items-center justify-between px-4 pb-6 pt-20 sm:px-6">
      <div className="vignette pointer-events-none absolute inset-0" />
      <HeroPlayer />
      <motion.div style={{ opacity: fade, y: lift }} className="relative mt-[6vh] flex flex-col items-center text-center">
        <Wordmark />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.8 }} className="font-display text-sunset mt-2 text-[clamp(22px,4.4vw,40px)] tracking-[0.5em]">
          Vom Strand zur Skyline
        </motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="relative w-full max-w-[600px] space-y-3">
        <div className="max-w-[360px]"><RankedCard /></div>
        <PlayButton />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="font-num text-[11px] uppercase tracking-[0.24em] text-white/60">
            {episode ? <>Episode #{episode}</> : "…"} · <ResetCountdown className="text-white/60" prefix="neu in" />
          </span>
          <span className="flex flex-wrap gap-2">
            <ModeChip href="/weltkarte">Weltkarte <Globe2 className="size-3.5" /></ModeChip>
            <ModeChip href="/packs">Themen-Packs <LayoutGrid className="size-3.5" /></ModeChip>
            <ModeChip href="/grundstueck">Grundstück <HomeIcon className="size-3.5" /></ModeChip>
          </span>
        </div>
        {!attemptsLoaded && <div className="sr-only">Lädt …</div>}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-4 flex flex-col items-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
        <ChevronDown className="mt-1 size-4 animate-bounce" />
      </motion.div>
    </section>
  );
}

function HeroPlayer() {
  const { character, profile, economy } = useApp();
  if (!character) return null;
  return (
    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} className="absolute bottom-10 left-6 hidden xl:block">
      <Link href="/figur" className="group block">
        <div className="idle-breathe drop-shadow-[0_30px_50px_rgba(0,0,0,0.65)] transition-transform duration-500 group-hover:-translate-y-2">
          <CharacterArt c={character} size={210} />
        </div>
        <div className="hud mt-3 rounded-2xl px-4 py-2.5">
          <p className="font-display text-2xl leading-none text-white">{profile.name}</p>
          <p className="font-num text-[11px] uppercase tracking-[0.2em] text-white/60">Lvl {economy.level.level} · {economy.level.title}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function ShopTeaser() {
  const { economy, purchases, premium, character, owns } = useApp();
  // zuerst, was als Nächstes erreichbar ist
  const items = SHOP.filter((i) => i.price > 0 && (!i.premium || !MONETIZATION) && owns(i.id) < (i.stack ?? 1))
    .sort((a, b) => Number(economy.level.level < a.minLevel) - Number(economy.level.level < b.minLevel) || a.price - b.price)
    .slice(0, 12);
  return (
    <section className="bleed bg-[rgba(8,5,16,0.94)] px-4 pb-20 pt-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-5xl text-white">Als Nächstes</h2>
          <Link href="/shop" className="btn-sunset inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold uppercase tracking-[0.14em]"><ShoppingBag className="size-4" />Zum Shop</Link>
        </div>
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {items.map((it, i) => {
            const reason = canBuy(it, economy, purchases, premium.active);
            const locked = economy.level.level < it.minLevel;
            return (
              <motion.div key={it.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="snap-start">
                <Link href="/shop" className="group relative flex h-56 w-44 flex-col overflow-hidden rounded-2xl border border-white/12 bg-[radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.09),rgba(12,8,22,0.7)_70%)] transition-transform hover:-translate-y-1 sm:w-48">
                  <span className={cn("flex flex-1 items-end justify-center px-3 pt-4 transition-transform duration-500 group-hover:scale-105", locked && "opacity-45 grayscale")}><ItemArt item={it} character={character} size={130} /></span>
                  {locked && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white"><Lock className="size-3" />Lvl {it.minLevel}</span>}
                  {!reason && <span className="absolute left-2 top-2 rounded-full bg-[var(--success)] px-2 py-0.5 text-[10px] font-black uppercase text-black">Leistbar</span>}
                  <span className="p-3">
                    <span className="block truncate text-sm font-bold text-white">{it.name}</span>
                    <span className="font-num text-sm text-white/75">{formatCash(it.price)}</span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const MODES = [
  { href: "/play?mode=daily", label: "Daily", sub: "7 Fragen · täglich neu", img: "/images/dashboard/daily.webp", icon: CalendarDays },
  { href: "/ranked", label: "Ranked", sub: "Wochenliga", img: "/images/backgrounds/downtown.webp", icon: Swords },
  { href: "/weltkarte", label: "Weltkarte", sub: "Orte finden", img: "/images/backgrounds/coast.webp", icon: Globe2 },
  { href: "/packs", label: "Themen-Packs", sub: "15 Welten · endlos", img: "/images/backgrounds/dusk.webp", icon: LayoutGrid },
  { href: "/unlimited", label: "Unlimited", sub: "Alles gemischt", img: "/images/backgrounds/night.webp", icon: InfinityIcon },
  { href: "/archiv", label: "Archiv", sub: "Verpasste Tage", img: "/images/backgrounds/marina.webp", icon: RotateCcw },
];

function Dashboard() {
  const { stats, attemptsLoaded, attempts, today, wallet, economy, estate, plot, owns } = useApp();
  const me = rankedFromAttempts(attempts, season(today).start);
  const div = divisionFor(me.rp);
  const lvl = economy.level;
  const boats = SHOP.filter((i) => i.kind === "dock" && owns(i.id) > 0);
  const tiles = [
    { icon: Gem, label: "Kontostand", value: attemptsLoaded ? formatCash(wallet.balance) : "–", hint: `Vermögen ${formatCash(wallet.netWorth)}` },
    { icon: Trophy, label: `Level ${lvl.level}`, value: lvl.title, hint: `${lvl.toNext} XP bis Level ${lvl.level + 1}` },
    { icon: Flame, label: "Serie", value: `${stats.streak.current} ${stats.streak.current === 1 ? "Tag" : "Tage"}`, hint: `Rekord: ${stats.streak.longest}` },
    { icon: Crown, label: "Ranked", value: `${me.rp} RP`, hint: me.matches ? div.division.name : season(today).label },
  ];
  return (
    <section className="bleed bg-gradient-to-b from-transparent via-[rgba(8,5,16,0.86)] to-[rgba(8,5,16,0.94)] px-4 pb-6 pt-14 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-10">
        <div>
          <h2 className="font-display mb-4 text-5xl text-white">Spielmodi</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {MODES.map((m, i) => (
              <motion.div key={m.href} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={m.href} className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[22px] border border-white/12 p-4 transition-all duration-500 hover:-translate-y-1 hover:border-white/35">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.img} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(10,6,16,0.95)] via-[rgba(10,6,16,0.35)] to-transparent" />
                  <m.icon className="mb-auto size-6 text-white/90" />
                  <span className="font-display text-3xl leading-none text-white">{m.label}</span>
                  <span className="text-[11px] font-semibold text-white/65">{m.sub}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-5xl text-white">Dein Grundstück</h2>
              <Link href="/grundstueck" className="text-sm font-semibold text-[var(--peach)] hover:text-white">Gestalten ›</Link>
            </div>
            <Link href="/grundstueck" className="block overflow-hidden rounded-[24px] border border-white/12 transition-transform hover:-translate-y-0.5">
              <EstateView estate={estate} size={plot} boats={boats} className="aspect-[16/10] w-full" />
            </Link>
          </div>
          <div>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-5xl text-white">Dein Imperium</h2>
              <Link href="/profil" className="text-sm font-semibold text-[var(--peach)] hover:text-white">Profil ›</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {tiles.map((t, i) => (
                <motion.div key={t.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="hud relative overflow-hidden rounded-2xl px-4 py-4">
                  <span className="bg-sunset absolute left-0 top-4 h-8 w-[3px] rounded-r-full" />
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60"><t.icon className="size-3.5 text-[var(--peach)]" />{t.label}</p>
                  <p className="font-num mt-1 truncate text-2xl font-semibold text-white">{t.value}</p>
                  <p className="truncate text-[11px] text-white/55">{t.hint}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Dashboard />
      <ShopTeaser />
    </div>
  );
}
