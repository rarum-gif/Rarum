"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock, Crown, Info, Medal, Swords, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useApp } from "@/components/providers";
import { AvatarBubble, PageHeader } from "@/components/bits";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SceneOverride } from "@/components/scene";
import { api } from "@/lib/client/api";
import { formatCash } from "@/lib/game/wealth";
import { DIVISIONS, SEASON_REWARD, RANKED_PAR, RANKED_QUESTIONS, RANKED_START_RP, demoRivals, divisionFor, rankedDelta, rankedFromAttempts, season } from "@/lib/game/ranked";
import { cn } from "@/lib/utils";

interface Row { rank: number; username: string; avatar: string; rp: number; matches: number; best: number; is_me: boolean; demo?: boolean }
interface Resp { available: boolean; signedIn?: boolean; rows: Row[]; season: { label: string; start: string; end: string } }

function Emblem({ color, size = 120, label }: { color: string; size?: number; label: string }) {
  return (
    <svg viewBox="0 0 120 132" width={size} height={size * 1.1} aria-label={label} className="drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]">
      <defs>
        <linearGradient id={`em-${label}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.95" /><stop offset="0.35" stopColor={color} /><stop offset="1" stopColor="#1a0f2a" /></linearGradient>
        <linearGradient id={`em2-${label}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff2e88" /><stop offset="1" stopColor="#8f3dff" /></linearGradient>
      </defs>
      <path d="M60 4 L110 22 V66 C110 98 86 118 60 128 C34 118 10 98 10 66 V22 Z" fill={`url(#em-${label})`} stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />
      <path d="M60 16 L98 30 V66 C98 90 80 106 60 114 C40 106 22 90 22 66 V30 Z" fill="#0d0818" opacity="0.72" />
      <path d="M38 78 L60 44 L82 78 L71 78 L60 61 L49 78 Z" fill={`url(#em2-${label})`} />
      <circle cx="60" cy="90" r="5" fill={color} />
    </svg>
  );
}

function useCountdown(endIso: string | undefined, offset: number) {
  const [now, setNow] = React.useState<number | null>(null);
  React.useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!endIso || now === null) return "…";
  const ms = Math.max(0, new Date(endIso).getTime() - (now + offset));
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000), m = Math.floor((ms % 3600000) / 60000);
  return d > 0 ? `${d} T ${h} Std` : `${h} Std ${m} Min`;
}

export default function RankedPage() {
  const { attempts, attemptsLoaded, today, user, serverOffset, economy } = useApp();
  const s = season(today);
  const me = rankedFromAttempts(attempts, s.start);
  const div = divisionFor(me.rp);
  const [scope, setScope] = React.useState<"global" | "friends">("global");
  const [data, setData] = React.useState<Resp | null>(null);
  const left = useCountdown(s.end, serverOffset);
  const recent = attempts.filter((a) => a.mode === "ranked" && a.startedAt >= s.start).slice(0, 6);

  React.useEffect(() => {
    api<Resp>(`/api/ranked?scope=${scope}`).then(setData).catch(() => setData(null));
  }, [scope]);

  const rows: Row[] = React.useMemo(() => {
    if (data?.available && data.signedIn) return data.rows;
    const rivals: Row[] = demoRivals(s.startKey).map((r) => ({ rank: 0, username: r.name, avatar: r.avatar, rp: r.rp, matches: r.matches, best: r.best, is_me: false, demo: true }));
    const mine: Row = { rank: 0, username: user?.username ?? "Du", avatar: user?.avatar ?? "sun", rp: me.rp, matches: me.matches, best: me.best, is_me: true };
    return [...rivals, mine].sort((a, b) => b.rp - a.rp).map((r, i) => ({ ...r, rank: i + 1 }));
  }, [data, s.startKey, user, me.rp, me.matches, me.best]);
  const demo = !(data?.available && data.signedIn);

  return (
    <div>
      <SceneOverride scene="downtown" />
      <PageHeader eyebrow={`${s.label} · endet in ${left}`} title="Ranked" />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-[28px] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full opacity-40 blur-3xl" style={{ background: div.division.color }} />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <motion.div initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", damping: 12, stiffness: 120, delay: 0.1 }}>
              <Emblem color={div.division.color} label={div.division.name} />
            </motion.div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/55">Deine Liga</p>
              <p className="font-display text-6xl leading-none tracking-wide" style={{ color: div.division.color }}>{div.division.name}</p>
              <p className="font-num mt-1 text-3xl font-semibold text-white">{attemptsLoaded ? me.rp : "–"} <span className="text-base text-white/55">RP</span></p>
              {me.lastDelta !== null && (
                <p className={cn("mt-1 inline-flex items-center gap-1 text-sm font-semibold", me.lastDelta >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>
                  {me.lastDelta >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  {me.lastDelta >= 0 ? "+" : ""}{me.lastDelta} RP im letzten Match
                </p>
              )}
              {div.next && (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-sunset" initial={{ width: 0 }} animate={{ width: `${Math.round(div.progress * 100)}%` }} transition={{ duration: 1, delay: 0.3 }} />
                  </div>
                  <p className="mt-1.5 text-xs text-white/60">Noch {div.toNext} RP bis {div.next.name}</p>
                </div>
              )}
            </div>
          </div>
          <Link href="/play?mode=ranked" className="cta-glow btn-sunset relative mt-7 flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/40">
            <Swords className="size-6" />
            <span className="font-display text-4xl tracking-[0.14em]">Match starten</span>
          </Link>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["Matches", me.matches], ["Bestes Match", me.best || "–"], ["Richtwert", RANKED_PAR]].map(([l, v]) => (
              <div key={l as string} className="hud rounded-xl px-2 py-2.5">
                <p className="font-num text-xl font-semibold text-white">{v}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="glass rounded-[28px] p-6">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/55"><Medal className="size-4" />Ligen</p>
            <ol className="space-y-1.5">
              {DIVISIONS.slice().reverse().map((d) => (
                <li key={d.id} className={cn("flex items-center gap-3 rounded-xl px-3 py-2", d.id === div.division.id ? "bg-white/10" : "")}>
                  <span className="size-3 rounded-full" style={{ background: d.color, boxShadow: `0 0 12px ${d.color}` }} />
                  <span className="font-display flex-1 text-xl tracking-wide text-white">{d.name}</span>
                  <span className="font-num text-sm text-white/55">ab {d.min || 0} RP</span>
                  {SEASON_REWARD[DIVISIONS.indexOf(d)] > 0 && <span className="font-num ml-3 w-20 text-right text-sm font-semibold text-[var(--gold)]">+{formatCash(SEASON_REWARD[DIVISIONS.indexOf(d)])}</span>}
                </li>
              ))}
            </ol>
          </div>
          <div className="glass rounded-[28px] p-6">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-white/55"><Info className="size-4" />So zählt ein Match</p>
            <ul className="space-y-1 text-sm text-white/80">
              <li className="flex justify-between"><span>700 Punkte (perfekt)</span><span className="font-num text-[var(--success)]">+{rankedDelta(700)} RP</span></li>
              <li className="flex justify-between"><span>400 Punkte</span><span className="font-num text-[var(--success)]">+{rankedDelta(400)} RP</span></li>
              <li className="flex justify-between"><span>{RANKED_PAR} Punkte</span><span className="font-num text-white/60">±0 RP</span></li>
              <li className="flex justify-between"><span>100 Punkte</span><span className="font-num text-[var(--danger)]">{rankedDelta(100)} RP</span></li>
              <li className="flex justify-between"><span>0 Punkte</span><span className="font-num text-[var(--danger)]">{rankedDelta(0)} RP</span></li>
            </ul>
          </div>
        </div>
      </section>

      {economy.seasons.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display mb-3 text-4xl text-white">Vergangene Saisons</h2>
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
            {economy.seasons.slice().reverse().map((x) => (
              <div key={x.key} className="hud w-44 shrink-0 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">{x.label}</p>
                <p className="font-display text-3xl" style={{ color: x.division.color }}>{x.division.name}</p>
                <p className="font-num text-xs text-white/65">{x.rp} RP · {x.matches} Matches</p>
                <p className="font-num mt-1 text-sm font-semibold text-[var(--gold)]">{x.reward ? `+${formatCash(x.reward)}` : x.matches < 3 ? "mind. 3 Matches" : "–"}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-5xl text-white">Wochen-Rangliste</h2>
            <p className="flex items-center gap-1.5 text-sm text-white/60"><Clock className="size-4" />Saison endet in {left}</p>
          </div>
          {!demo && (
            <Tabs value={scope} onValueChange={(v) => setScope(v as "global" | "friends")}>
              <TabsList><TabsTrigger value="global">Alle</TabsTrigger><TabsTrigger value="friends"><Users className="mr-1 size-4" />Freunde</TabsTrigger></TabsList>
            </Tabs>
          )}
        </div>
        {demo && (
          <p className="mb-4 rounded-2xl border border-dashed border-white/20 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
            {data?.available ? "Melde dich an, um gegen echte Spieler anzutreten." : "Demo-Liga mit Beispiel-Rivalen."}
          </p>
        )}
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const d = divisionFor(r.rp).division;
            return (
              <motion.li key={r.username + r.rank} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i, 12) * 0.03 }}
                className={cn("flex items-center gap-3 rounded-2xl border px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-4", r.is_me ? "border-[var(--sunset-pink)]/60 bg-[rgba(255,46,136,0.14)]" : "border-white/10 bg-[rgba(12,8,22,0.55)]", r.rank <= 3 && "py-3.5")}>
                <span className={cn("font-display w-8 text-center text-2xl", r.rank === 1 ? "text-[var(--gold)]" : r.rank === 2 ? "text-[#d6d3e0]" : r.rank === 3 ? "text-[#e8a06a]" : "text-white/45")}>{r.rank === 1 ? <Crown className="mx-auto size-6" /> : r.rank}</span>
                <AvatarBubble id={r.avatar} size={r.rank <= 3 ? 44 : 36} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 truncate font-semibold text-white">{r.username}{r.is_me && <span className="rounded bg-white/15 px-1.5 text-[10px] uppercase tracking-wider">Du</span>}{r.demo && <span className="rounded bg-white/10 px-1.5 text-[10px] uppercase tracking-wider text-white/55">Demo</span>}</span>
                  <span className="text-xs" style={{ color: d.color }}>{d.name} <span className="text-white/45">· {r.matches} Matches · Bestes {r.best}</span></span>
                </span>
                <span className="font-num text-xl font-semibold text-white">{r.rp}<span className="ml-1 text-xs text-white/50">RP</span></span>
              </motion.li>
            );
          })}
        </ol>
      </section>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display mb-3 text-4xl text-white">Deine Matches</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {recent.map((a) => {
              const dlt = rankedDelta(a.total);
              return (
                <li key={a.id}>
                  <Link href={`/ergebnis/${a.id}`} className="hud flex items-center justify-between rounded-xl px-4 py-3 transition-colors hover:border-white/30">
                    <span className="text-sm text-white/80">{new Date(a.startedAt).toLocaleString("de-CH", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <span className="font-num text-white">{a.total} Pkt</span>
                    <span className={cn("font-num font-semibold", dlt >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]")}>{dlt >= 0 ? "+" : ""}{dlt} RP</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
