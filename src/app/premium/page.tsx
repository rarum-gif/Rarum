"use client";
import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Crown, Gift, Loader2, Minus, Sparkles } from "lucide-react";
import { useApp } from "@/components/providers";
import { ItemArt } from "@/components/world/item-art";
import { Input } from "@/components/ui/input";
import { SceneOverride } from "@/components/scene";
import { CATALOG } from "@/lib/game/catalog";
import { cn } from "@/lib/utils";

/**
 * Premium – rein kosmetisch und Komfort, kein Pay-to-win:
 * Geld, XP, Ranked und alle Fragen sind für alle gleich.
 */
const ROWS: [string, boolean | string, boolean | string][] = [
  ["Daily Challenge, Ranked, Weltkarte", true, true],
  ["Alle 15 Themen-Packs endlos spielen", true, true],
  ["Fragen am Stück pro Endlos-Runde", "10", "60"],
  ["Geld, XP und Ranglisten", "gleich", "gleich"],
  ["Shop mit über 100 Gegenständen", true, true],
  ["Exklusive Premium-Gegenstände", false, true],
  ["Umgebungen Neon-Nacht und Dachterrasse", false, true],
  ["Premium-Abzeichen im Profil", false, true],
];

export default function PremiumPage() {
  const { premium, redeemPremium, character } = useApp();
  const [code, setCode] = React.useState("");
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const exclusives = CATALOG.filter((i) => i.premium);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = await redeemPremium(code);
    setBusy(false);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Premium ist aktiv. Viel Spass!" });
    if (!err) setCode("");
  };

  return (
    <div className="space-y-10">
      <SceneOverride scene="night" />
      <section className="relative overflow-hidden rounded-[32px] border border-[#b98cff]/35 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(138,79,255,0.45),transparent_55%),radial-gradient(120%_120%_at_100%_100%,rgba(255,46,136,0.35),transparent_55%),rgba(12,8,22,0.8)] p-6 sm:p-12">
        <motion.div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-[#ff2e88]/25 blur-3xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.35em] text-[#d9c2ff]"><Crown className="size-4" />NNAXOS Premium</p>
        <h1 className="font-display mt-2 max-w-3xl text-6xl leading-[0.9] text-white sm:text-8xl">Mehr Stil. Gleiche Chancen.</h1>
        {premium.active && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--success)]/20 px-4 py-2 text-sm font-bold text-[var(--success)]"><Check className="size-4" />Aktiv bis {new Date(premium.until!).toLocaleDateString("de-CH")}</p>
        )}
      </section>

      <section className="grid max-w-3xl gap-4 md:grid-cols-2">
        {[
          { name: "Kostenlos", price: "0", per: "für immer", cta: null, highlight: false },
          { name: "Premium", price: "1.–", per: "CHF einmalig · für immer, kein Abo", cta: "einmalig", highlight: true },
        ].map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={cn("relative flex flex-col rounded-[26px] border p-6", p.highlight ? "border-[#d9c2ff]/60 bg-gradient-to-b from-[rgba(138,79,255,0.28)] to-[rgba(12,8,22,0.8)]" : "border-white/12 bg-[rgba(12,8,22,0.6)]")}>
            {p.highlight && <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-[#8a4fff] to-[#ff2e88] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">Einmal zahlen</span>}
            <p className="font-display text-3xl text-white">{p.name}</p>
            <p className="font-num mt-3 text-5xl font-semibold text-white">{p.price === "0" ? "Gratis" : p.price}</p>
            <p className="text-sm text-white/60">{p.per}</p>
            <div className="mt-6">
              {p.cta ? (
                <button disabled className="w-full cursor-not-allowed rounded-xl border border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white/55" title="Die Bezahlung wird nach dem Sicherheits-Check freigeschaltet">
                  Bezahlung folgt
                </button>
              ) : (
                <Link href="/" className="block w-full rounded-xl bg-white/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-white/15">Spielen</Link>
              )}
            </div>
          </motion.div>
        ))}
      </section>

      <section className="overflow-hidden rounded-[26px] border border-white/12 bg-[rgba(12,8,22,0.6)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.2em] text-white/55">
              <th className="p-4 font-bold">Funktion</th><th className="p-4 text-center font-bold">Kostenlos</th><th className="p-4 text-center font-bold text-[#d9c2ff]">Premium</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, free, prem]) => (
              <tr key={label} className="border-b border-white/[0.06] last:border-0">
                <td className="p-4 text-white/85">{label}</td>
                {[free, prem].map((v, i) => (
                  <td key={i} className="p-4 text-center">
                    {v === true ? <Check className="mx-auto size-5 text-[var(--success)]" /> : v === false ? <Minus className="mx-auto size-5 text-white/30" /> : <span className="font-num font-semibold text-white">{v}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-display mb-4 flex items-center gap-2 text-5xl text-white"><Sparkles className="size-7 text-[#d9c2ff]" />Exklusiv</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {exclusives.map((it) => (
            <div key={it.id} className="rounded-[20px] border border-[#b98cff]/35 bg-[radial-gradient(circle_at_50%_60%,rgba(138,79,255,0.22),rgba(12,8,22,0.7)_70%)] p-3 text-center">
              <div className="flex h-28 items-end justify-center"><ItemArt item={it} character={character} size={110} /></div>
              <p className="mt-2 truncate text-xs font-bold text-white">{it.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass max-w-xl rounded-[26px] p-6">
        <h2 className="font-display flex items-center gap-2 text-3xl text-white"><Gift className="size-6 text-[var(--peach)]" />Code einlösen</h2>
        <form onSubmit={redeem} className="mt-4 flex gap-2">
          <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" aria-label="Premium-Code" className="font-num uppercase tracking-[0.2em]" maxLength={40} />
          <button type="submit" disabled={busy || code.trim().length < 3} className="btn-sunset shrink-0 rounded-xl px-5 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-50">{busy ? <Loader2 className="size-4 animate-spin" /> : "Einlösen"}</button>
        </form>
        {msg && <p className={cn("mt-3 text-sm font-semibold", msg.ok ? "text-[var(--success)]" : "text-[var(--danger)]")}>{msg.text}</p>}
      </section>
    </div>
  );
}
