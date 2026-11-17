"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarCheck2, CloudUpload, Download, Flame, Gem, LayoutGrid, Loader2, LogOut, Mountain, Pencil, Sigma, Sparkles, Trash2, Trophy } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AvatarBubble, LocalDataNotice, StatTile, TierBadge } from "@/components/bits";
import { AchievementMedal } from "@/components/achievement-medal";
import { ACHIEVEMENTS, earnedAchievements } from "@/lib/game/stats";
import { AVATARS } from "@/lib/avatars";
import { api, ApiError } from "@/lib/client/api";
import { clearLocalAttempts, loadLocalAttempts, replaceLocalAttempts } from "@/lib/client/local";
import { browserSupabase } from "@/lib/client/supabase";
import { formatDateDe } from "@/lib/time";
import { cn, fmt } from "@/lib/utils";

function SyncCard() {
  const { user, reloadAttempts } = useApp();
  const params = useSearchParams();
  const [local, setLocal] = React.useState(0);
  const [state, setState] = React.useState<"idle" | "busy" | "done">("idle");
  const [msg, setMsg] = React.useState("");
  React.useEffect(() => setLocal(loadLocalAttempts().filter((a) => a.receipt).length), []);
  const sync = React.useCallback(async () => {
    setState("busy");
    try {
      const list = loadLocalAttempts().filter((a) => a.receipt);
      const r = await api<{ imported: number; skipped: number; rejected: number }>("/api/me/import", { json: { attempts: list } });
      replaceLocalAttempts(loadLocalAttempts().filter((a) => !a.receipt));
      setLocal(0);
      setMsg(`${r.imported} Ergebnisse übernommen${r.skipped ? `, ${r.skipped} übersprungen (bereits gewertet)` : ""}.`);
      setState("done");
      await reloadAttempts();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Übernahme fehlgeschlagen.");
      setState("idle");
    }
  }, [reloadAttempts]);
  React.useEffect(() => {
    if (user && local > 0 && params.get("sync") === "1" && state === "idle") void sync();
  }, [user, local, params, state, sync]);
  if (!user || (local === 0 && state !== "done")) return null;
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <CloudUpload className="mt-0.5 size-5 text-accent" />
          <div>
            <p className="font-medium">{state === "done" ? "Synchronisiert" : `${local} lokale Ergebnisse gefunden`}</p>
            <p className="text-sm text-fg-muted">{msg || "Übernimm deine bisherigen Gast-Ergebnisse in dein Konto. Bereits gewertete Tage werden nicht doppelt gezählt."}</p>
          </div>
        </div>
        {state !== "done" && <Button onClick={sync} disabled={state === "busy"}>{state === "busy" && <Loader2 className="animate-spin" />}Ins Konto übernehmen</Button>}
      </CardContent>
    </Card>
  );
}

function EditProfile({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, refreshSession } = useApp();
  const [username, setUsername] = React.useState(user?.username ?? "");
  const [avatar, setAvatar] = React.useState(user?.avatar ?? "fern");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  React.useEffect(() => {
    setUsername(user?.username ?? "");
    setAvatar(user?.avatar ?? "fern");
  }, [user, open]);
  const save = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api("/api/me/profile", { method: "PATCH", json: { username, avatar } });
      await refreshSession();
      onOpenChange(false);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Profil bearbeiten" description="Benutzername und Avatar sind in Ranglisten sichtbar.">
        <Label htmlFor="un">Benutzername</Label>
        <Input id="un" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={24} />
        <p className="mb-2 mt-5 text-sm font-medium text-fg-muted">Avatar</p>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button key={a.id} onClick={() => setAvatar(a.id)} className={cn("rounded-full p-1 transition", avatar === a.id ? "ring-2 ring-accent" : "opacity-80 hover:opacity-100")} aria-label={a.label} aria-pressed={avatar === a.id}>
              <AvatarBubble id={a.id} size={44} />
            </button>
          ))}
        </div>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={save} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileInner() {
  const { user, accountsEnabled, stats, level, attempts, packs, attemptsLoaded, packById, reloadAttempts, refreshSession } = useApp();
  const [edit, setEdit] = React.useState(false);
  const earned = earnedAchievements(stats, attempts);
  const records = [
    { label: "Beste Daily Challenge", value: stats.bestDaily ? `${stats.bestDaily.total} Pkt.` : "–", hint: stats.bestDaily?.date ? formatDateDe(stats.bestDaily.date) : undefined },
    { label: "Beste Unlimited-Runde", value: stats.bestUnlimited ? `${stats.bestUnlimited} Pkt.` : "–" },
    { label: "Legendäre Antworten", value: String(stats.legendaryAnswers) },
    { label: "Seltene Antworten (ab „Selten“)", value: String(stats.rareAnswers) },
  ];
  const signOut = async () => {
    await api("/api/auth/signout", { json: {} });
    await browserSupabase()?.auth.signOut();
    await refreshSession();
    location.href = "/";
  };
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
      <section className="flex flex-col gap-6 rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:p-8">
        <AvatarBubble id={user?.avatar} size={88} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-medium tracking-tight">{user?.username ?? "Gast"}</h1>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Level {level.current.level} · {level.current.name}</span>
          </div>
          <div className="mt-3 max-w-md">
            <Progress value={level.progress} />
            <p className="mt-1.5 text-xs text-fg-subtle">{level.next ? `${fmt(stats.totalPoints)} Punkte · noch ${fmt(level.toNext)} bis „${level.next.name}“` : `${fmt(stats.totalPoints)} Punkte · höchstes Level erreicht`}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEdit(true)}><Pencil />Bearbeiten</Button>
              <Button variant="ghost" size="sm" onClick={signOut}><LogOut />Abmelden</Button>
            </>
          ) : accountsEnabled ? (
            <Button asChild><Link href="/login">Kostenloses Konto erstellen</Link></Button>
          ) : null}
        </div>
      </section>

      <SyncCard />
      <LocalDataNotice />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Gem} label="Gesamtpunktzahl" value={fmt(stats.totalPoints)} />
        <StatTile icon={Flame} label="Aktuelle Serie" value={stats.streak.current} hint={`Längste Serie: ${stats.streak.longest}`} />
        <StatTile icon={CalendarCheck2} label="Daily Challenges" value={stats.dailyCount} hint={`${stats.packCount} Pack-Challenges`} />
        <StatTile icon={Sigma} label="Ø Daily-Punktzahl" value={stats.averageDaily} />
        <StatTile icon={Mountain} label="Beste Daily" value={stats.bestDaily?.total ?? "–"} />
        <StatTile icon={LayoutGrid} label="Gespielte Packs" value={`${stats.packsPlayed}/15`} />
        <StatTile icon={Sparkles} label="Gültige Antworten" value={stats.acceptedAnswers} hint={`von ${stats.answeredTotal}`} />
        <StatTile icon={Trophy} label="Abzeichen" value={`${earned.length}/${ACHIEVEMENTS.length}`} />
      </div>

      <Card>
        <CardHeader><CardTitle>Abzeichen</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const has = earned.includes(a.id);
            return (
              <div key={a.id} className={cn("flex flex-col items-center rounded-2xl border border-line p-4 text-center", has ? "bg-bg-elevated" : "bg-transparent")}>
                <AchievementMedal achievement={a} earned={has} />
                <p className={cn("mt-3 text-sm font-medium", !has && "text-fg-muted")}>{a.title}</p>
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
              <div key={r.label} className="flex items-center justify-between rounded-xl bg-bg-elevated px-4 py-3">
                <div><p className="text-sm text-fg-muted">{r.label}</p>{r.hint && <p className="text-xs text-fg-subtle">{r.hint}</p>}</div>
                <span className="font-display text-lg font-medium">{r.value}</span>
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
                        <td className="py-2.5"><Link href={`/packs/${p.id}`} className="flex items-center gap-2 hover:text-accent"><span className="size-2 rounded-full" style={{ background: p.accent }} />{p.name}</Link></td>
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
                      <span className="w-12 text-right font-display text-base font-medium">{a.total}</span>
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
