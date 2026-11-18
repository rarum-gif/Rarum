"use client";
import * as React from "react";
import Link from "next/link";
import { CalendarCheck2, Download, Flame, Gem, LayoutGrid, Loader2, Mountain, Pencil, Sigma, Sparkles, Trash2, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AvatarBubble, AvatarIcon, StatTile, TierBadge } from "@/components/bits";
import { AchievementMedal } from "@/components/achievement-medal";
import { ACHIEVEMENTS, WORLD_ACHIEVEMENTS, earnedAchievements } from "@/lib/game/stats";
import { AVATAR_COLORS, AVATAR_ICONS, avatarId, parseAvatar } from "@/lib/avatars";
import { clearLocalAttempts, loadLocalAttempts } from "@/lib/client/local";
import { formatDateDe } from "@/lib/time";
import { formatCash } from "@/lib/game/wealth";
import { CATALOG } from "@/lib/game/catalog";
import { MONETIZATION } from "@/lib/monetization";
import { DIVISIONS, divisionFor, rankedFromAttempts, season } from "@/lib/game/ranked";
import { CharacterArt } from "@/components/character";
import { ItemArt } from "@/components/world/item-art";
import { Crown } from "lucide-react";
import { cn, fmt } from "@/lib/utils";

function EditProfile({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { profile, saveProfile } = useApp();
  const [name, setName] = React.useState(profile.name);
  const [icon, setIcon] = React.useState(parseAvatar(profile.avatar).icon);
  const [color, setColor] = React.useState(parseAvatar(profile.avatar).color ?? AVATAR_COLORS[0].id);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const a = parseAvatar(profile.avatar);
    setName(profile.guest && profile.name === "Gast" ? "" : profile.name);
    setIcon(a.icon);
    setColor(a.color ?? AVATAR_COLORS[0].id);
    setErr(null);
  }, [open, profile]);
  const id = avatarId(icon, color);
  const save = async () => {
    setBusy(true);
    const e = await saveProfile({ name, avatar: id });
    setBusy(false);
    if (e) setErr(e);
    else onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Profil anpassen" className="sm:max-w-xl">
        <div className="flex items-center gap-4">
          <div className="bg-sunset glow-sunset rounded-full p-1"><AvatarBubble id={id} size={76} className="ring-0" /></div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="un">Name</Label>
            <Input id="un" value={name} placeholder="Dein Spielername" onChange={(e) => setName(e.target.value)} maxLength={24} autoComplete="off" />
          </div>
        </div>
        <p className="mb-2 mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Symbol</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
          {AVATAR_ICONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setIcon(a.id)}
              aria-label={a.label}
              aria-pressed={icon === a.id}
              className={cn("grid aspect-square place-items-center rounded-xl border text-white transition", icon === a.id ? "border-white/70 bg-white/15" : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/30 hover:text-white")}
            >
              <AvatarIcon icon={a.id} size={20} />
            </button>
          ))}
        </div>
        <p className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">Farbe</p>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c.id)}
              aria-label={c.label}
              aria-pressed={color === c.id}
              className={cn("aspect-square rounded-full transition", color === c.id ? "ring-2 ring-white ring-offset-2 ring-offset-[#120e20]" : "opacity-80 hover:opacity-100")}
              style={{ background: `linear-gradient(140deg, ${c.from}, ${c.to})` }}
            />
          ))}
        </div>
        {err && <p className="mt-4 text-sm text-danger">{err}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={save} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Besitz: Fahrzeuge, Boote, Gebäude, Kleidung und Sammlerstücke */
function Possessions() {
  const { owns, character } = useApp();
  const groups = [
    { label: "Fahrzeuge & Boote", items: CATALOG.filter((i) => (i.category === "fahrzeuge" || i.category === "boote") && owns(i.id) > 0) },
    { label: "Immobilien", items: CATALOG.filter((i) => (i.category === "gebaeude" || i.kind === "plot" || i.kind === "theme") && owns(i.id) > 0) },
    { label: "Garderobe", items: CATALOG.filter((i) => i.kind === "wear" && i.price > 0 && owns(i.id) > 0) },
    { label: "Sammlung", items: CATALOG.filter((i) => i.kind === "collect" && owns(i.id) > 0) },
  ].filter((g) => g.items.length);
  if (!groups.length) return null;
  return (
    <Card>
      <CardHeader><CardTitle>Besitz</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">{g.label}</p>
            <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
              {g.items.map((it) => (
                <div key={it.id} className="w-28 shrink-0 rounded-2xl border border-[var(--gold)]/30 bg-[radial-gradient(circle_at_50%_60%,rgba(242,193,78,0.12),rgba(255,255,255,0.02)_70%)] p-2 text-center" title={it.name}>
                  <div className="flex h-20 items-end justify-center"><ItemArt item={it} character={character} size={80} /></div>
                  <p className="mt-1 truncate text-[11px] font-semibold text-white">{it.name}{(it.stack ?? 1) > 1 ? ` ×${owns(it.id)}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProfileInner() {
  const { user, profile, accountsEnabled, stats, level, economy, wallet, attempts, packs, attemptsLoaded, packById, reloadAttempts, refreshSession, character, premium, today } = useApp();
  const rankDiv = divisionFor(rankedFromAttempts(attempts, season(today).start).rp);
  const [edit, setEdit] = React.useState(false);
  const { purchases, estate, plot } = useApp();
  const worldInfo = { purchases, placed: estate.items.length, plot, seasonsPlayed: economy.seasons.filter((x) => x.matches >= 3).length, bestDivision: Math.max(-1, ...economy.seasons.filter((x) => x.matches >= 3).map((x) => DIVISIONS.findIndex((d) => d.id === x.division.id))), hasCharacter: !!character };
  const earned = [...earnedAchievements(stats, attempts), ...WORLD_ACHIEVEMENTS.filter((a) => a.check(worldInfo, attempts)).map((a) => a.id)];
  const allAchievements = [...ACHIEVEMENTS, ...WORLD_ACHIEVEMENTS];
  const records = [
    { label: "Beste Daily Challenge", value: stats.bestDaily ? `${stats.bestDaily.total} Pkt.` : "–", hint: stats.bestDaily?.date ? formatDateDe(stats.bestDaily.date) : undefined },
    { label: "Beste Unlimited-Runde", value: stats.bestUnlimited ? `${stats.bestUnlimited} Pkt.` : "–" },
    { label: "Legendäre Antworten", value: String(stats.legendaryAnswers) },
    { label: "Seltene Antworten (ab „Selten“)", value: String(stats.rareAnswers) },
  ];

  const exportLocal = () => {
    const blob = new Blob([JSON.stringify(loadLocalAttempts(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rarum-lokale-ergebnisse.json";
    a.click();
  };
  const reset = async () => {
    if (!confirm("Alle lokal gespeicherten Ergebnisse auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.")) return;
    clearLocalAttempts();
    await reloadAttempts();
  };

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/12 shadow-[var(--shadow-lift)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/profile/header.webp" alt="" className="kenburns absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(12,8,20,0.97)] via-[rgba(12,8,20,0.55)] to-[rgba(12,8,20,0.15)]" />
        <div className="flex flex-col gap-6 p-6 pt-32 sm:flex-row sm:items-end sm:p-10 sm:pt-44">
        {character ? (
          <Link href="/figur" className="-mb-6 -mt-24 shrink-0 drop-shadow-[0_24px_40px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-1 sm:-mb-10"><CharacterArt c={character} size={190} /></Link>
        ) : (
          <div className="rounded-full p-1 bg-sunset glow-sunset"><AvatarBubble id={profile.avatar} size={96} className="ring-0" /></div>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-6xl text-white sm:text-7xl">{profile.name}</h1>
            <span className="bg-sunset rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Level {level.current.level} · {level.current.name}</span>
            <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#140d24]" style={{ background: rankDiv.division.color }}>{rankDiv.division.name}</span>
            {MONETIZATION && premium.active && <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8a4fff] to-[#ff2e88] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"><Crown className="size-3.5" />Premium</span>}
          </div>
          <div className="mt-3 max-w-md">
            <Progress value={level.progress} />
            <p className="mt-1.5 font-num text-xs text-white/70">{economy.xp} XP · noch {level.toNext} XP bis Level {level.current.level + 1}</p>
            <p className="font-num mt-3 text-4xl font-semibold text-white">{formatCash(wallet.balance, { compact: false })} <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-white/55">Kontostand</span></p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEdit(true)}><Pencil />Profil anpassen</Button>
        </div>
        </div>
      </section>


      <Possessions />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Gem} label="Gesamtpunktzahl" value={fmt(stats.totalPoints)} />
        <StatTile icon={Flame} label="Aktuelle Serie" value={stats.streak.current} hint={`Längste Serie: ${stats.streak.longest}`} />
        <StatTile icon={CalendarCheck2} label="Daily Challenges" value={stats.dailyCount} hint={`${stats.packCount} Pack-Challenges`} />
        <StatTile icon={Sigma} label="Ø Daily-Punktzahl" value={stats.averageDaily} />
        <StatTile icon={Mountain} label="Beste Daily" value={stats.bestDaily?.total ?? "–"} />
        <StatTile icon={LayoutGrid} label="Gespielte Packs" value={`${stats.packsPlayed}/15`} />
        <StatTile icon={Sparkles} label="Gültige Antworten" value={stats.acceptedAnswers} hint={`von ${stats.answeredTotal}`} />
        <StatTile icon={Trophy} label="Abzeichen" value={`${earned.length}/${allAchievements.length}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Abzeichen</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {allAchievements.map((a) => {
            const has = earned.includes(a.id);
            return (
              <div key={a.id} className={cn("group flex flex-col items-center rounded-2xl border p-4 text-center transition-all hover:-translate-y-0.5", has ? "border-[rgba(242,193,78,0.35)] bg-[linear-gradient(180deg,rgba(242,193,78,0.10),rgba(255,255,255,0.02))]" : "border-white/8 bg-white/[0.03]")}>
                <AchievementMedal achievement={a} earned={has} />
                <p className={cn("mt-3 text-sm font-bold", has ? "text-white" : "text-fg-muted")}>{a.title}</p>
                <p className="mt-0.5 text-xs text-fg-subtle">{a.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader><CardTitle>Persönliche Rekorde</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {records.map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.04] px-4 py-3">
                <div><p className="text-sm text-fg-muted">{r.label}</p>{r.hint && <p className="text-xs text-fg-subtle">{r.hint}</p>}</div>
                <span className="font-num text-lg font-semibold text-white">{r.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Statistik pro Themen-Pack</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-fg-subtle">
                  <tr><th className="pb-2 font-medium">Pack</th><th className="pb-2 text-right font-medium">Challenges</th><th className="pb-2 text-right font-medium">Punkte</th><th className="pb-2 text-right font-medium">Ø</th><th className="pb-2 text-right font-medium">Beste</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {packs.map((p) => {
                    const ps = stats.perPack[p.id];
                    return (
                      <tr key={p.id}>
                        <td className="py-2"><Link href={`/packs/${p.id}`} className="flex items-center gap-2.5 font-semibold text-white hover:text-[var(--peach)]"><img src={`/images/themes/${p.id}-card.webp`} alt="" className="size-8 rounded-md object-cover" />{p.name}</Link></td>
                        <td className="py-2.5 text-right tabular-nums">{ps?.challenges ?? 0}</td>
                        <td className="py-2.5 text-right tabular-nums">{fmt(ps?.points ?? 0)}</td>
                        <td className="py-2.5 text-right tabular-nums">{ps?.average ?? 0}</td>
                        <td className="py-2.5 text-right tabular-nums">{ps?.best ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Verlauf</CardTitle></CardHeader>
        <CardContent>
          {!attemptsLoaded ? <div className="skeleton h-24 rounded-xl" /> : attempts.length === 0 ? <p className="py-4 text-sm text-fg-muted">Noch keine Runden.</p> : (
            <ul className="divide-y divide-line">
              {attempts.slice(0, 30).map((a) => {
                const best = a.answers.filter((x) => x.tier).sort((x, y) => y.points - x.points)[0];
                return (
                  <li key={a.id}>
                    <Link href={`/ergebnis/${a.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-accent">
                      <span className="w-24 shrink-0 text-xs text-fg-subtle">{a.date ? formatDateDe(a.date, { day: "numeric", month: "short", year: "2-digit" }) : new Date(a.finishedAt).toLocaleDateString("de-CH")}</span>
                      <span className="flex-1 truncate">{a.mode === "daily" ? "Daily Challenge" : a.mode === "unlimited" ? "Unlimited" : packById(a.packId)?.name ?? "Archiv"}{!a.official && <span className="ml-2 text-xs text-fg-subtle">Training</span>}</span>
                      {best?.tier && <TierBadge tier={best.tier} className="hidden sm:inline-flex" />}
                      <span className="font-num w-12 text-right text-base font-semibold text-white">{a.total}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {!user && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={exportLocal}><Download />Lokale Daten exportieren</Button>
          <Button variant="danger" size="sm" onClick={reset}><Trash2 />Lokale Daten löschen</Button>
        </div>
      )}
      <EditProfile open={edit} onOpenChange={setEdit} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={null}>
      <ProfileInner />
    </React.Suspense>
  );
}
