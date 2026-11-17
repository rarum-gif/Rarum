"use client";
import * as React from "react";
import Link from "next/link";
import { Copy, Crown, HardDrive, Loader2, Medal, UserMinus, UserPlus, Users } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarBubble, EmptyState, PageHeader } from "@/components/bits";
import { api, ApiError } from "@/lib/client/api";
import { browserSupabase } from "@/lib/client/supabase";
import { formatDateDe } from "@/lib/time";
import { cn, fmt } from "@/lib/utils";

interface Row {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  challenges: number;
  is_me: boolean;
}
interface Friend {
  username: string;
  avatar: string;
  status: "pending" | "accepted";
  direction: "incoming" | "outgoing";
  totalPoints: number | null;
  streak: number | null;
  dailyCount: number | null;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="size-5 text-[var(--gold)]" />;
  if (rank <= 3) return <Medal className={cn("size-5", rank === 2 ? "text-[#d6d3e0]" : "text-[#e8a06a]")} />;
  return <span className="font-num w-5 text-center text-sm text-fg-subtle">{rank}</span>;
}

/** Top-3 als Podest mit Gold-/Sunset-Akzenten */
function Podium({ rows }: { rows: Row[] }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  return (
    <div className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-4">
      {order.map((r) => {
        const rank = Number(r.rank);
        const h = rank === 1 ? "h-44 sm:h-52" : rank === 2 ? "h-36 sm:h-44" : "h-32 sm:h-40";
        return (
          <div key={r.username} className={cn("relative flex flex-col items-center justify-end overflow-hidden rounded-2xl border p-3 text-center", h, rank === 1 ? "border-[rgba(242,193,78,0.6)] bg-[linear-gradient(180deg,rgba(242,193,78,0.25),rgba(255,93,115,0.12))] shadow-[0_0_40px_-10px_rgba(242,193,78,0.7)]" : "hud")}>
            {rank === 1 && <Crown className="absolute top-3 size-6 text-[var(--gold)] drop-shadow-[0_0_10px_rgba(242,193,78,0.8)]" />}
            <AvatarBubble id={r.avatar} size={rank === 1 ? 56 : 44} />
            <p className="mt-2 w-full truncate text-sm font-bold text-white">{r.username}</p>
            <p className={cn("font-num text-xl font-bold", rank === 1 ? "text-sunset" : "text-white")}>{fmt(Number(r.points))}</p>
            <p className="font-display text-2xl text-white/50">#{rank}</p>
          </div>
        );
      })}
    </div>
  );
}

function LocalBoard() {
  const { attempts } = useApp();
  const best = attempts.filter((a) => a.official && a.mode === "daily").sort((a, b) => b.total - a.total).slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="glass flex items-start gap-3 rounded-2xl p-4 text-sm text-fg-muted">
        <HardDrive className="mt-0.5 size-4 shrink-0" />
        <p><span className="font-medium text-fg">Demo-Modus ohne Server-Datenbank.</span> Globale Ranglisten und Freunde benötigen Supabase. Unten siehst du nur deine eigenen, lokal gespeicherten Bestleistungen – es werden keine anderen Spieler vorgetäuscht.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Deine persönliche Bestenliste (dieses Gerät)</CardTitle></CardHeader>
        <CardContent>
          {best.length === 0 ? <p className="py-6 text-center text-sm text-fg-muted">Noch keine offiziellen Daily Challenges gespielt.</p> : (
            <ol className="divide-y divide-line">
              {best.map((a, i) => (
                <li key={a.id} className="flex items-center gap-4 py-3">
                  <RankIcon rank={i + 1} />
                  <Link href={`/ergebnis/${a.id}`} className="flex-1 hover:text-accent">{a.date ? formatDateDe(a.date) : ""}</Link>
                  <span className="font-num text-lg font-semibold text-white">{a.total}</span>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FriendsPanel() {
  const [data, setData] = React.useState<{ inviteCode: string; friends: Friend[] } | null>(null);
  const [query, setQuery] = React.useState("");
  const [msg, setMsg] = React.useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const load = React.useCallback(() => api<{ inviteCode: string; friends: Friend[] }>("/api/friends").then(setData).catch(() => setData(null)), []);
  React.useEffect(() => void load(), [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const r = await api<{ friends: Friend[] }>("/api/friends", { json: { query } });
      setData((d) => (d ? { ...d, friends: r.friends } : d));
      setQuery("");
      setMsg({ ok: true, text: "Anfrage gesendet." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof ApiError ? err.message : "Fehler" });
    } finally {
      setBusy(false);
    }
  };
  const accept = async (username: string) => {
    const r = await api<{ friends: Friend[] }>("/api/friends", { json: { accept: username } });
    setData((d) => (d ? { ...d, friends: r.friends } : d));
  };
  const remove = async (username: string) => {
    if (!confirm(`${username} wirklich aus deiner Freundesliste entfernen?`)) return;
    const r = await api<{ friends: Friend[] }>("/api/friends", { method: "DELETE", json: { username } });
    setData((d) => (d ? { ...d, friends: r.friends } : d));
  };

  const accepted = data?.friends.filter((f) => f.status === "accepted") ?? [];
  const incoming = data?.friends.filter((f) => f.status === "pending" && f.direction === "incoming") ?? [];
  const outgoing = data?.friends.filter((f) => f.status === "pending" && f.direction === "outgoing") ?? [];

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Users className="size-5 text-[var(--peach)]" />Freunde</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={add} className="flex gap-2">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Benutzername oder Einladungscode" aria-label="Freund finden" />
          <Button type="submit" disabled={busy || query.trim().length < 3} size="icon" aria-label="Hinzufügen">{busy ? <Loader2 className="animate-spin" /> : <UserPlus />}</Button>
        </form>
        {msg && <p className={cn("text-sm", msg.ok ? "text-success" : "text-danger")}>{msg.text}</p>}
        {data && (
          <button onClick={() => navigator.clipboard?.writeText(data.inviteCode)} className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm">
            <span className="text-fg-muted">Dein Einladungscode</span>
            <span className="flex items-center gap-2 font-mono font-semibold tracking-wider">{data.inviteCode}<Copy className="size-4 text-fg-subtle" /></span>
          </button>
        )}
        {incoming.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Anfragen</p>
            {incoming.map((f) => (
              <div key={f.username} className="flex items-center gap-3 py-2">
                <AvatarBubble id={f.avatar} size={32} />
                <span className="flex-1 text-sm font-medium">{f.username}</span>
                <Button size="sm" onClick={() => accept(f.username)}>Annehmen</Button>
              </div>
            ))}
          </div>
        )}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Deine Freunde</p>
          {accepted.length === 0 ? <p className="text-sm text-fg-muted">Noch keine Freunde – teile deinen Einladungscode.</p> : accepted.map((f) => (
            <div key={f.username} className="group flex items-center gap-3 py-2">
              <AvatarBubble id={f.avatar} size={32} />
              <div className="flex-1">
                <p className="text-sm font-medium">{f.username}</p>
                <p className="text-xs text-fg-subtle">{fmt(f.totalPoints ?? 0)} Punkte · Serie {f.streak ?? 0}</p>
              </div>
              <button onClick={() => remove(f.username)} className="rounded-full p-2 text-fg-subtle opacity-0 hover:bg-surface-2 group-hover:opacity-100" aria-label="Entfernen"><UserMinus className="size-4" /></button>
            </div>
          ))}
          {outgoing.length > 0 && <p className="mt-2 text-xs text-fg-subtle">Ausstehend: {outgoing.map((f) => f.username).join(", ")}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeaderboardPage() {
  const { accountsEnabled, user, sessionLoaded } = useApp();
  const [period, setPeriod] = React.useState("day");
  const [scope, setScope] = React.useState("global");
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const r = await api<{ rows: Row[] }>(`/api/leaderboard?period=${period}&scope=${scope}`);
      setRows(r.rows);
      setErr(null);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Fehler");
    }
  }, [period, scope]);

  React.useEffect(() => {
    if (!user) return;
    setRows(null);
    void load();
  }, [user, load]);

  // Realtime: bei neuen Ergebnissen (user_stats) automatisch aktualisieren
  React.useEffect(() => {
    const sb = browserSupabase();
    if (!sb || !user) return;
    let t: ReturnType<typeof setTimeout>;
    const ch = sb.channel("rarum-leaderboard").on("postgres_changes", { event: "*", schema: "public", table: "user_stats" }, () => {
      clearTimeout(t);
      t = setTimeout(() => void load(), 800);
    }).subscribe();
    return () => {
      clearTimeout(t);
      void sb.removeChannel(ch);
    };
  }, [user, load]);

  return (
    <div>
      <PageHeader title="Rangliste">
        <Link href="/ranked" className="btn-sunset mt-5 flex max-w-md items-center justify-between rounded-2xl px-5 py-4 transition-transform hover:-translate-y-0.5">
          <span className="font-display block text-3xl leading-none tracking-wide">Ranked-Liga</span>
          <Crown className="size-7" />
        </Link>
      </PageHeader>
      {!accountsEnabled ? (
        <LocalBoard />
      ) : !sessionLoaded ? (
        <div className="skeleton h-64 rounded-3xl" />
      ) : !user ? (
        <EmptyState icon={Users} title="Melde dich an, um mitzuspielen">
          Mit einem kostenlosen Konto erscheinst du in den Ranglisten und kannst Freunde hinzufügen.
          <div className="mt-4"><Button asChild><Link href="/login">Kostenloses Konto</Link></Button></div>
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardContent>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <Tabs value={period} onValueChange={setPeriod}>
                  <TabsList><TabsTrigger value="day">Heute</TabsTrigger><TabsTrigger value="week">Woche</TabsTrigger><TabsTrigger value="all">Gesamt</TabsTrigger></TabsList>
                </Tabs>
                <Tabs value={scope} onValueChange={setScope}>
                  <TabsList><TabsTrigger value="global">Alle</TabsTrigger><TabsTrigger value="friends">Freunde</TabsTrigger></TabsList>
                </Tabs>
              </div>
              {err && <p className="text-sm text-danger">{err}</p>}
              {!rows ? <div className="space-y-2">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}</div> : rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-fg-muted">Für diesen Zeitraum gibt es noch keine Ergebnisse.</p>
              ) : (
                <>
                {rows.length >= 3 && <Podium rows={rows.slice(0, 3)} />}
                <ol className="space-y-1.5">
                  {rows.slice(rows.length >= 3 ? 3 : 0).map((r) => (
                    <li key={r.username} className={cn("flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5", r.is_me && "border-[rgba(255,122,69,0.5)] bg-[rgba(255,122,69,0.14)]")}>
                      <RankIcon rank={Number(r.rank)} />
                      <AvatarBubble id={r.avatar} size={34} />
                      <span className="flex-1 truncate font-medium">{r.username}{r.is_me && <span className="ml-2 text-xs text-accent">Du</span>}</span>
                      <span className="hidden text-xs text-fg-subtle sm:inline">{r.challenges} Challenges</span>
                      <span className="font-num w-16 text-right text-lg font-semibold text-white">{fmt(Number(r.points))}</span>
                    </li>
                  ))}
                </ol>
                </>
              )}
            </CardContent>
          </Card>
          <FriendsPanel />
        </div>
      )}
    </div>
  );
}
