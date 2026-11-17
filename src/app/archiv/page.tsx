"use client";
import * as React from "react";
import Link from "next/link";
import { Check, Filter, Play, Repeat2 } from "lucide-react";
import { useApp, type SetSummary } from "@/components/providers";
import { Card } from "@/components/ui/card";
import { Select, Input } from "@/components/ui/input";
import { EmptyState, PageHeader } from "@/components/bits";
import { api } from "@/lib/client/api";
import { formatDateDe } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function ArchivePage() {
  const { packById, packs, attempts, today } = useApp();
  const [items, setItems] = React.useState<SetSummary[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pack, setPack] = React.useState("all");
  const [diff, setDiff] = React.useState("all");
  const [done, setDone] = React.useState("all");
  const [date, setDate] = React.useState("");

  React.useEffect(() => {
    api<{ items: SetSummary[] }>("/api/archive").then((r) => setItems(r.items)).catch((e) => setError(e.message));
  }, []);

  const playedSets = React.useMemo(() => {
    const m = new Map<string, { official?: number; training: number }>();
    for (const a of attempts) {
      if (!a.setId) continue;
      const e = m.get(a.setId) ?? { training: 0 };
      if (a.official) e.official = a.total;
      else e.training++;
      m.set(a.setId, e);
    }
    return m;
  }, [attempts]);

  const filtered = (items ?? []).filter((s) => {
    if (pack === "daily" && s.kind !== "daily") return false;
    if (pack !== "all" && pack !== "daily" && s.packId !== pack) return false;
    if (diff !== "all" && Math.round(s.difficulty) !== Number(diff)) return false;
    const p = playedSets.get(s.id);
    if (done === "done" && !p) return false;
    if (done === "open" && p) return false;
    if (date && s.date !== date) return false;
    return true;
  });
  const byDate = filtered.reduce<Record<string, SetSummary[]>>((acc, s) => ((acc[s.date] ??= []).push(s), acc), {});

  return (
    <div>
      <PageHeader title="Archiv" />

      <Card className="mb-6 grid gap-3 p-4 sm:grid-cols-4">
        <label className="text-xs font-medium text-fg-subtle">Datum<Input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="mt-1 h-10" /></label>
        <label className="text-xs font-medium text-fg-subtle">Themen-Pack
          <Select value={pack} onChange={(e) => setPack(e.target.value)} className="mt-1 h-10">
            <option value="all">Alle</option>
            <option value="daily">Nur Daily Challenges</option>
            {packs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </label>
        <label className="text-xs font-medium text-fg-subtle">Schwierigkeit
          <Select value={diff} onChange={(e) => setDiff(e.target.value)} className="mt-1 h-10">
            <option value="all">Alle</option><option value="1">Leicht</option><option value="2">Mittel</option><option value="3">Schwer</option>
          </Select>
        </label>
        <label className="text-xs font-medium text-fg-subtle">Status
          <Select value={done} onChange={(e) => setDone(e.target.value)} className="mt-1 h-10">
            <option value="all">Alle</option><option value="done">Gespielt</option><option value="open">Noch nicht gespielt</option>
          </Select>
        </label>
      </Card>

      {error && <p className="text-danger">{error}</p>}
      {!items && !error && <div className="space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>}
      {items && filtered.length === 0 && <EmptyState icon={Filter} title="Keine Challenges gefunden">Passe die Filter an, um weitere Sets zu sehen.</EmptyState>}

      <div className="space-y-8">
        {Object.entries(byDate).map(([d, sets]) => (
          <section key={d}>
            <h2 className="font-display mb-3 text-3xl text-white">{d === today ? "Heute" : formatDateDe(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sets.map((s) => {
                const p = s.packId ? packById(s.packId) : null;
                const played = playedSets.get(s.id);
                const isToday = s.date === today;
                const href = isToday && !played?.official ? (s.kind === "daily" ? "/play?mode=daily" : `/play?mode=pack&pack=${s.packId}`) : `/play?mode=archive&date=${s.date}${s.packId ? `&pack=${s.packId}` : ""}`;
                return (
                  <Link key={s.id} href={href} className="glass group flex items-center gap-3 rounded-2xl p-2.5 pr-4 transition-all hover:-translate-y-0.5 hover:border-white/25">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.packId ? `/images/themes/${s.packId}-card.webp` : "/images/backgrounds/oceandrive-mobile.webp"} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <span className={cn("absolute inset-0 flex items-center justify-center text-white", played ? "bg-black/45" : "bg-black/20")}>
                        {played ? <Check className="size-5" /> : <Play className="size-4 fill-current" />}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{p ? p.name : "Daily Challenge"}</p>
                      <p className="flex items-center gap-2 text-xs text-fg-subtle">
                        {s.count} Fragen
                        {s.repeats > 0 && <span className="inline-flex items-center gap-0.5"><Repeat2 className="size-3" />{s.repeats}</span>}
                      </p>
                    </div>
                    {played?.official !== undefined ? <span className="font-num text-lg font-semibold text-white">{played.official}</span> : played ? <span className="text-xs text-fg-subtle">{played.training}× Training</span> : null}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
