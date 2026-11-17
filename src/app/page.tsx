"use client";
import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ChevronDown, ChevronUp, Crown, Flame, Gem, Infinity as InfinityIcon, LayoutGrid, RotateCcw, Swords, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { AnimatedNumber, LocalDataNotice, ResetCountdown } from "@/components/bits";
import { maxPointsPerQuestion } from "@/lib/game/scoring";
import { cashOf, formatCash, STAGES, stageFor } from "@/lib/game/wealth";
import { divisionFor, rankedFromAttempts, season } from "@/lib/game/ranked";
import { daysBetween } from "@/lib/time";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Hauptmenü – ein Bildschirm, ein Ziel: spielen.
   Aufbau: Titel · Spielregel · Ranked-Karte · PLAY NOW · Modus-Leiste.
   Darunter die Leiter vom Strand bis zur Privatinsel.
   ------------------------------------------------------------------ */

function Wordmark() {
  const reduce = useReducedMotion();
  const letters = "RARUM".split("");
  return (
    <h1 className="font-display title-chroma select-none text-center text-[clamp(84px,19vw,220px)] leading-[0.8] tracking-[0.04em] text-white" aria-label="Rarum">
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

function HowTo() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="text-left">
      <button onClick={() => setOpen((o) => !o)} className="group inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.28em] text-white/70 transition-colors hover:text-white" aria-expanded={open}>
        {open ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />}
        So wirst du reich
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }} className="overflow-hidden">
        <ol className="mt-3 grid gap-2 text-sm text-white/85 sm:grid-cols-3">
          {[
            ["01", "Tippe eine eigene Antwort.", "Keine Auswahl – du denkst selbst."],
            ["02", "Seltene Antworten zahlen mehr.", "10 bis 100 Punkte · jeder Punkt = 1’000 $."],
            ["03", "Steig die Leiter hoch.", "Vom Strand bis zur Privatinsel."],
          ].map(([n, t, d]) => (
            <li key={n} className="hud rounded-xl px-3 py-2.5">
              <span className="font-num text-xs text-[var(--peach)]">{n}</span>
              <p className="font-semibold text-white">{t}</p>
              <p className="text-xs text-white/60">{d}</p>
            </li>
          ))}
        </ol>
      </motion.div>
    </div>
  );
}

function RankedCard() {
  const { attempts, today } = useApp();
  const s = season(today);
  const me = rankedFromAttempts(attempts, s.start);
  const div = divisionFor(me.rp);
  return (
    <Link href="/ranked" className="group relative block overflow-hidden rounded-2xl border border-white/20 bg-[rgba(10,6,20,0.62)] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/45">
      <span className="bg-sunset absolute -top-px left-4 rounded-b-md px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] text-white">Neu · {s.label}</span>
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <div className="mt-2 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl border border-white/15" style={{ background: `linear-gradient(140deg, ${div.division.color}55, transparent)` }}>
          <Swords className="size-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[26px] leading-none tracking-wide text-white">Ranked</p>
          <p className="truncate text-xs text-white/65">{me.matches ? `${div.division.name} · ${me.rp} RP · ${me.matches} Matches` : "Miss dich mit allen – neue Saison jede Woche"}</p>
        </div>
        <span className="font-display text-xl tracking-wide text-[var(--peach)] transition-transform group-hover:translate-x-1">Spielen ›</span>
      </div>
    </Link>
  );
}

function PlayButton() {
  const { overview, hasOfficial, attemptsLoaded, settings } = useApp();
  const played = hasOfficial(overview?.daily?.id);
  const reduce = useReducedMotion();
  if (played) {
    const st = stageFor(played.total, played.maxTotal);
    return (
      <Link href={`/ergebnis/${played.id}`} className="cta-glow group relative flex h-[76px] w-full items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/30 bg-[rgba(12,8,24,0.72)] backdrop-blur-xl">
        <Trophy className="size-6 text-[var(--gold)]" />
        <span className="font-display text-3xl tracking-[0.12em] text-white sm:text-4xl">Heute: {formatCash(cashOf(played.total))}</span>
        <span className="hidden text-xs font-bold uppercase tracking-[0.2em] text-white/60 sm:inline">{st.stage.name}</span>
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

/** Vertikales Lineal am rechten Rand – das Pendant zur Tiefenanzeige, nur nach oben. */
function CashRuler() {
  const { settings } = useApp();
  const max = settings.dailyQuestionCount * maxPointsPerQuestion(settings);
  return (
    <div className="pointer-events-none absolute right-3 top-24 bottom-28 hidden w-14 flex-col justify-between md:flex" aria-hidden>
      {STAGES.slice().reverse().map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.05 }} className="flex items-center justify-end gap-1.5">
          <span className="font-num text-[9px] text-white/55">{formatCash(cashOf(Math.round(s.at * max)))}</span>
          <span className={cn("h-px bg-white/45", i % 2 ? "w-2" : "w-3.5")} />
        </motion.div>
      ))}
      <span className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-white/50 via-white/25 to-white/5" />
    </div>
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
    <section ref={ref} className="relative left-1/2 flex min-h-[100svh] w-screen -translate-x-1/2 flex-col items-center justify-between px-4 pb-6 pt-20 sm:px-6">
      <div className="vignette pointer-events-none absolute inset-0" />
      <CashRuler />
      <motion.div style={{ opacity: fade, y: lift }} className="relative mt-[6vh] flex flex-col items-center text-center">
        <motion.p initial={{ opacity: 0, letterSpacing: "0.8em" }} animate={{ opacity: 1, letterSpacing: "0.42em" }} transition={{ duration: 1.2 }} className="mb-3 text-[11px] font-bold uppercase text-white/85 sm:text-xs">
          Ready for today&apos;s challenge?
        </motion.p>
        <Wordmark />
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.8 }} className="font-display text-sunset mt-2 text-[clamp(22px,4.4vw,40px)] tracking-[0.5em]">
          Vom Strand zur Skyline
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="mt-4 max-w-md text-[15px] text-white/85">
          Dein tägliches Wissen. Deine Antworten. Deine Punkte.
          <span className="mt-1 block text-xs font-bold uppercase tracking-[0.24em] text-white/55">{settings.dailyQuestionCount} Fragen · {settings.timeLimitSeconds} Sekunden · seltene Antworten machen dich reich</span>
        </motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }} className="relative w-full max-w-[600px] space-y-3">
        <HowTo />
        <div className="max-w-[360px]"><RankedCard /></div>
        <PlayButton />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="font-num text-[11px] uppercase tracking-[0.24em] text-white/60">
            {episode ? <>Episode #{episode}</> : "…"} · <ResetCountdown className="text-white/60" prefix="neu in" />
          </span>
          <span className="flex flex-wrap gap-2">
            <ModeChip href="/archiv">Archiv <RotateCcw className="size-3.5" /></ModeChip>
            <ModeChip href="/packs">Themen-Packs <LayoutGrid className="size-3.5" /></ModeChip>
            <ModeChip href="/unlimited">Unlimited <InfinityIcon className="size-3.5" /></ModeChip>
          </span>
        </div>
        {!attemptsLoaded && <div className="sr-only">Lädt …</div>}
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-4 flex flex-col items-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
        Die Leiter
        <ChevronDown className="mt-1 size-4 animate-bounce" />
      </motion.div>
    </section>
  );
}

function Ladder() {
  const { settings, attempts } = useApp();
  const max = settings.dailyQuestionCount * maxPointsPerQuestion(settings);
  const best = attempts.filter((a) => a.mode === "daily" && a.official).reduce((m, a) => Math.max(m, a.maxTotal ? a.total / a.maxTotal : 0), 0);
  const reached = stageFor(best * max, max).index;
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-gradient-to-b from-transparent via-[rgba(8,5,16,0.82)] to-[rgba(8,5,16,0.92)] px-4 py-16 sm:px-6">
      <div className="relative mx-auto max-w-3xl">
      <div className="mb-12 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--peach)]">Eine Runde · elf Stufen</p>
        <h2 className="font-display mt-2 text-6xl text-white sm:text-7xl">Die Leiter</h2>
        <p className="mx-auto mt-3 max-w-md text-white/70">Jede richtige Antwort bringt Geld. Je seltener sie ist, desto schneller kletterst du – ein perfekter Lauf endet auf der Privatinsel.</p>
      </div>
      <div className="absolute bottom-16 left-[27px] top-56 w-px bg-gradient-to-b from-white/5 via-white/30 to-[var(--sunset-pink)] sm:left-1/2" aria-hidden />
      <ol className="space-y-10">
        {STAGES.map((s, i) => {
          const left = i % 2 === 0;
          const done = attempts.length > 0 && i <= reached;
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative grid items-center gap-4 pl-16 sm:grid-cols-2 sm:gap-12 sm:pl-0"
            >
              <span className={cn("absolute left-[19px] top-1/2 z-10 grid size-[18px] -translate-y-1/2 place-items-center rounded-full border-2 sm:left-1/2 sm:-translate-x-1/2", done ? "border-white bg-[var(--sunset-pink)] shadow-[0_0_20px_var(--sunset-pink)]" : "border-white/40 bg-[#120c1e]")} />
              <div className={cn("group relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]", left ? "sm:mr-4" : "sm:order-2 sm:ml-4")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/images/wealth/${s.image}.webp`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-110" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="font-num absolute bottom-2 left-3 text-sm font-semibold text-white">{formatCash(cashOf(Math.round(s.at * max)))}+</span>
              </div>
              <div className={cn(left ? "sm:text-left" : "sm:text-right")}>
                <p className="font-num text-[11px] uppercase tracking-[0.3em] text-white/45">Stufe {String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-display text-4xl tracking-wide text-white">{s.name}</h3>
                <p className="text-white/70">{s.line}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
      <p className="font-display mt-14 text-center text-3xl tracking-[0.2em] text-white/80">— ein perfekter Lauf endet hier —</p>
      </div>
    </section>
  );
}

function Empire() {
  const { stats, level, attemptsLoaded, attempts, today } = useApp();
  const me = rankedFromAttempts(attempts, season(today).start);
  const div = divisionFor(me.rp);
  const tiles = [
    { icon: Gem, label: "Vermögen", value: attemptsLoaded ? formatCash(cashOf(stats.totalPoints)) : "–", hint: `${level.current.name}${level.next ? ` · nächster Rang: ${level.next.name}` : ""}` },
    { icon: Flame, label: "Serie", value: `${stats.streak.current} ${stats.streak.current === 1 ? "Tag" : "Tage"}`, hint: `Rekord: ${stats.streak.longest}` },
    { icon: Crown, label: "Ranked", value: `${me.rp} RP`, hint: me.matches ? `${div.division.name} · ${me.matches} Matches` : "Noch kein Match diese Saison" },
    { icon: Trophy, label: "Challenges", value: <AnimatedNumber value={stats.officialCount} />, hint: `${stats.dailyCount} Daily · ${stats.packCount} Packs` },
  ];
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[rgba(8,5,16,0.92)] px-4 pb-16 pt-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-5xl text-white">Dein Imperium</h2>
        <Link href="/profil" className="text-sm font-semibold text-[var(--peach)] hover:text-white">Alles ansehen ›</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div key={t.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="hud relative overflow-hidden rounded-2xl px-4 py-4">
            <span className="bg-sunset absolute left-0 top-4 h-8 w-[3px] rounded-r-full" />
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60"><t.icon className="size-3.5 text-[var(--peach)]" />{t.label}</p>
            <p className="font-num mt-1 text-2xl font-semibold text-white sm:text-3xl">{t.value}</p>
            <p className="truncate text-[11px] text-white/55">{t.hint}</p>
          </motion.div>
        ))}
      </div>
      <LocalDataNotice className="mt-6" />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Ladder />
      <Empire />
    </div>
  );
}
