"use client";
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, CalendarPlus, Check, CheckCircle2, Download, FileUp, Flag, Loader2, LogOut, Plus, Save, Search, Settings2, ShieldAlert, Trash2, Upload, X } from "lucide-react";
import type { Answer, AnswerReport, GameSettings, Question, ReviewStatus, ThemePack, TierId } from "@/lib/types";
import { TIER_IDS } from "@/lib/types";
import { api, ApiError } from "@/lib/client/api";
import { cn } from "@/lib/utils";
import { formatDateDe } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TierBadge } from "@/components/bits";

interface AdminData {
  questions: Question[];
  packs: ThemePack[];
  settings: GameSettings;
  usage: Record<string, string[]>;
  storeKind: "file" | "supabase";
  persistent: boolean;
}

const STATUS_LABEL: Record<ReviewStatus, string> = { draft: "Entwurf", review: "In Prüfung", verified: "Geprüft", invalid: "Ungültig" };
const STATUS_CLASS: Record<ReviewStatus, string> = {
  draft: "bg-surface-2 text-fg-muted",
  review: "bg-[color-mix(in_oklab,var(--tier-legendary)_18%,transparent)] text-[var(--tier-legendary)]",
  verified: "bg-success-soft text-success",
  invalid: "bg-danger-soft text-danger",
};

function StatusPill({ s }: { s: ReviewStatus }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[s])}>{STATUS_LABEL[s]}</span>;
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Login({ onDone, defaultPw }: { onDone: () => void; defaultPw: boolean }) {
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api("/api/admin/login", { json: { password: pw } });
      onDone();
    } catch (e2) {
      setErr(e2 instanceof ApiError ? e2.message : "Fehler");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardContent>
        <ShieldAlert className="size-8 text-accent" />
        <h1 className="mt-3 font-display text-2xl font-medium">Redaktion</h1>
        <p className="mt-1 text-sm text-fg-muted">Geschützter Admin-Bereich für Fragen, Tages-Sets und Meldungen.</p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <Input type="password" placeholder="Admin-Passwort" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          {err && <p className="text-sm text-danger">{err}</p>}
          <Button className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Anmelden</Button>
        </form>
        {defaultPw && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-fg-muted">Entwicklungsmodus: Ohne <code>ADMIN_PASSWORD</code> lautet das Passwort <code>admin</code>. In Produktion muss es gesetzt werden.</p>}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------- Editor

function emptyQuestion(packId: string): Question {
  const now = new Date().toISOString();
  return { id: "", packId, prompt: "", topic: "", difficulty: 2, timeLimitSeconds: null, status: "draft", sources: [], notes: "", answers: [], wrongAnswers: [], createdAt: now, updatedAt: now };
}

function QuestionEditor({ initial, packs, isNew, onClose, onSaved, presetAnswer }: { initial: Question; packs: ThemePack[]; isNew: boolean; onClose: () => void; onSaved: () => void; presetAnswer?: string }) {
  const [q, setQ] = React.useState<Question>(() => {
    const base = structuredClone(initial);
    if (presetAnswer) base.answers.push({ id: `${base.id}:${slugify(presetAnswer)}`, text: presetAnswer, aliases: [], tier: "rare", explanation: "", status: "verified", source: null });
    return base;
  });
  const [errors, setErrors] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const set = <K extends keyof Question>(k: K, v: Question[K]) => setQ((p) => ({ ...p, [k]: v }));
  const setAnswer = (i: number, patch: Partial<Answer>) => setQ((p) => ({ ...p, answers: p.answers.map((a, j) => (j === i ? { ...a, ...patch } : a)) }));

  const save = async () => {
    setBusy(true);
    setErrors(null);
    const payload: Question = {
      ...q,
      id: isNew ? (q.id || `${q.packId}-${slugify(q.prompt).slice(0, 50)}`) : q.id,
      answers: q.answers.filter((a) => a.text.trim()).map((a) => ({ ...a, id: a.id && !a.id.endsWith(":") ? a.id : `${q.id || q.packId}:${slugify(a.text)}` })),
    };
    payload.answers = payload.answers.map((a) => ({ ...a, id: a.id.startsWith(payload.id + ":") ? a.id : `${payload.id}:${slugify(a.text)}` }));
    try {
      if (isNew) await api("/api/admin/questions", { json: payload });
      else await api(`/api/admin/questions/${encodeURIComponent(q.id)}`, { method: "PUT", json: payload });
      onSaved();
    } catch (e) {
      setErrors(e instanceof ApiError ? e.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={isNew ? "Neue Frage" : "Frage bearbeiten"} description="Nur geprüfte Fragen mit mindestens 3 geprüften Antworten und einer Quelle erscheinen in offiziellen Challenges." className="sm:max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label>Frage</Label><Input value={q.prompt} onChange={(e) => set("prompt", e.target.value)} placeholder="Nenne …" /></div>
          <div><Label>Themen-Pack</Label><Select value={q.packId} onChange={(e) => set("packId", e.target.value)}>{packs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>
          <div><Label>Unterthema</Label><Input value={q.topic} onChange={(e) => set("topic", e.target.value)} /></div>
          <div><Label>ID {isNew && <span className="text-fg-subtle">(leer = automatisch)</span>}</Label><Input value={q.id} disabled={!isNew} onChange={(e) => set("id", e.target.value)} placeholder="geografie-meine-frage" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Schwierigkeit</Label><Select value={q.difficulty} onChange={(e) => set("difficulty", Number(e.target.value) as 1 | 2 | 3)}><option value={1}>Leicht</option><option value={2}>Mittel</option><option value={3}>Schwer</option></Select></div>
            <div><Label>Zeit (s)</Label><Input type="number" min={5} max={120} value={q.timeLimitSeconds ?? ""} placeholder="25" onChange={(e) => set("timeLimitSeconds", e.target.value ? Number(e.target.value) : null)} /></div>
            <div><Label>Status</Label><Select value={q.status} onChange={(e) => set("status", e.target.value as ReviewStatus)}>{(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select></div>
          </div>
          <div className="sm:col-span-2">
            <Label>Quellen</Label>
            {q.sources.map((s, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <Input value={s.label} placeholder="Bezeichnung" onChange={(e) => set("sources", q.sources.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <Input value={s.url ?? ""} placeholder="https://…" onChange={(e) => set("sources", q.sources.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                <Button variant="ghost" size="icon" onClick={() => set("sources", q.sources.filter((_, j) => j !== i))} aria-label="Quelle entfernen"><X /></Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => set("sources", [...q.sources, { label: "", url: "" }])}><Plus />Quelle</Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium">Gültige Antworten ({q.answers.length})</p>
            <Button variant="secondary" size="sm" onClick={() => set("answers", [...q.answers, { id: "", text: "", aliases: [], tier: "unusual", explanation: "", status: "verified", source: null }])}><Plus />Antwort</Button>
          </div>
          <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
            {q.answers.map((a, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-line bg-bg-elevated p-3 sm:grid-cols-[1.2fr_1.4fr_0.9fr_0.6fr_0.9fr_auto]">
                <Input value={a.text} placeholder="Hauptantwort" onChange={(e) => setAnswer(i, { text: e.target.value })} className="h-9" />
                <Input value={a.aliases.join(" | ")} placeholder="Aliases (mit | trennen)" onChange={(e) => setAnswer(i, { aliases: e.target.value.split("|").map((x) => x.trim()).filter(Boolean) })} className="h-9" />
                <Select value={a.tier} onChange={(e) => setAnswer(i, { tier: e.target.value as TierId })} className="h-9">{TIER_IDS.map((t) => <option key={t} value={t}>{t}</option>)}</Select>
                <Input type="number" value={a.pointsOverride ?? ""} placeholder="Pkt." title="Punkte überschreiben (optional)" onChange={(e) => setAnswer(i, { pointsOverride: e.target.value ? Number(e.target.value) : null })} className="h-9" />
                <Select value={a.status} onChange={(e) => setAnswer(i, { status: e.target.value as ReviewStatus })} className="h-9">{(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => set("answers", q.answers.filter((_, j) => j !== i))} aria-label="Antwort entfernen"><Trash2 /></Button>
                <Input value={a.explanation} placeholder="Kurze Erklärung" onChange={(e) => setAnswer(i, { explanation: e.target.value })} className="h-9 sm:col-span-6" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-medium">Bekannte Falschantworten</p>
            <Button variant="secondary" size="sm" onClick={() => set("wrongAnswers", [...(q.wrongAnswers ?? []), { text: "", aliases: [], explanation: "" }])}><Plus />Falschantwort</Button>
          </div>
          {(q.wrongAnswers ?? []).map((w, i) => (
            <div key={i} className="mb-2 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
              <Input value={w.text} placeholder="Antwort" onChange={(e) => set("wrongAnswers", q.wrongAnswers!.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} className="h-9" />
              <Input value={w.explanation} placeholder="Freundliche Erklärung" onChange={(e) => set("wrongAnswers", q.wrongAnswers!.map((x, j) => (j === i ? { ...x, explanation: e.target.value } : x)))} className="h-9" />
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => set("wrongAnswers", q.wrongAnswers!.filter((_, j) => j !== i))}><Trash2 /></Button>
            </div>
          ))}
        </div>

        <div className="mt-4"><Label>Interne Notizen</Label><Textarea rows={2} value={q.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
        {errors && <p className="mt-4 flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-sm text-danger"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{errors}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button onClick={save} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Save />}Speichern</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------- Tabs

function QuestionsTab({ data, reload }: { data: AdminData; reload: () => void }) {
  const [pack, setPack] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [q, setQ] = React.useState("");
  const [editing, setEditing] = React.useState<{ q: Question; isNew: boolean } | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const list = data.questions.filter((x) => (pack === "all" || x.packId === pack) && (status === "all" || x.status === status) && (!q || (x.prompt + x.id).toLowerCase().includes(q.toLowerCase())));

  const quick = async (x: Question, s: ReviewStatus) => {
    try {
      await api(`/api/admin/questions/${encodeURIComponent(x.id)}`, { method: "PUT", json: { ...x, status: s } });
      setMsg(`„${x.prompt}“ ist jetzt ${STATUS_LABEL[s]}.`);
      reload();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Fehler");
    }
  };
  const remove = async (x: Question) => {
    if (!confirm(`Frage „${x.prompt}“ endgültig löschen?`)) return;
    try {
      await api(`/api/admin/questions/${encodeURIComponent(x.id)}`, { method: "DELETE" });
      reload();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Fehler");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suchen …" className="pl-9" /></div>
        <Select value={pack} onChange={(e) => setPack(e.target.value)} className="w-auto"><option value="all">Alle Packs</option>{data.packs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-auto"><option value="all">Alle Status</option>{(Object.keys(STATUS_LABEL) as ReviewStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select>
        <Button onClick={() => setEditing({ q: emptyQuestion(pack === "all" ? data.packs[0].id : pack), isNew: true })}><Plus />Neue Frage</Button>
      </div>
      {msg && <p className="rounded-xl bg-surface-2 px-4 py-2 text-sm">{msg}</p>}
      <p className="text-sm text-fg-muted">{list.length} Fragen · {list.reduce((s, x) => s + x.answers.length, 0)} Antworten</p>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs text-fg-subtle"><tr><th className="p-3 font-medium">Frage</th><th className="hidden p-3 font-medium md:table-cell">Pack</th><th className="p-3 font-medium">Antworten</th><th className="hidden p-3 font-medium sm:table-cell">Verwendet</th><th className="p-3 font-medium">Status</th><th className="p-3" /></tr></thead>
          <tbody className="divide-y divide-line">
            {list.map((x) => {
              const used = data.usage[x.id] ?? [];
              return (
                <tr key={x.id} className="hover:bg-bg-elevated">
                  <td className="p-3"><button onClick={() => setEditing({ q: x, isNew: false })} className="text-left font-medium hover:text-accent">{x.prompt}</button><p className="text-xs text-fg-subtle">{x.id}</p></td>
                  <td className="hidden p-3 text-fg-muted md:table-cell">{data.packs.find((p) => p.id === x.packId)?.short}</td>
                  <td className="p-3 tabular-nums">{x.answers.length}</td>
                  <td className="hidden p-3 text-xs text-fg-muted sm:table-cell">{used.length ? `${used.length}× · zuletzt ${formatDateDe(used.sort().at(-1)!, { day: "numeric", month: "short" })}` : "nie"}</td>
                  <td className="p-3"><StatusPill s={x.status} /></td>
                  <td className="whitespace-nowrap p-3 text-right">
                    {x.status !== "verified" && <Button variant="ghost" size="sm" onClick={() => quick(x, "verified")} title="Als geprüft markieren"><CheckCircle2 /></Button>}
                    {x.status !== "invalid" && <Button variant="ghost" size="sm" onClick={() => quick(x, "invalid")} title="Als ungültig markieren"><X /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => remove(x)} title="Löschen"><Trash2 /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editing && <QuestionEditor initial={editing.q} isNew={editing.isNew} packs={data.packs} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

interface SetRow { id: string; date: string; kind: "daily" | "pack"; packId: string | null; count: number; repeats: number; difficulty: number; createdBy: string; items: { questionId: string; repeat: boolean }[] }

function SetsTab({ data }: { data: AdminData }) {
  const [sets, setSets] = React.useState<SetRow[] | null>(null);
  const [today, setToday] = React.useState("");
  const [date, setDate] = React.useState("");
  const [kind, setKind] = React.useState<"daily" | "pack">("daily");
  const [pack, setPack] = React.useState(data.packs[0].id);
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [msg, setMsg] = React.useState<{ ok: boolean; t: string } | null>(null);
  const load = React.useCallback(() => api<{ today: string; sets: SetRow[] }>("/api/admin/sets").then((r) => { setSets(r.sets); setToday(r.today); }), []);
  React.useEffect(() => void load(), [load]);
  const eligible = data.questions.filter((q) => q.status === "verified" && q.answers.filter((a) => a.status === "verified").length >= 3 && (kind === "daily" || q.packId === pack));
  const plan = async () => {
    try {
      await api("/api/admin/sets", { json: { date, kind, packId: kind === "pack" ? pack : null, questionIds: chosen } });
      setMsg({ ok: true, t: "Set geplant." });
      setChosen([]);
      load();
    } catch (e) {
      setMsg({ ok: false, t: e instanceof ApiError ? e.message : "Fehler" });
    }
  };
  const del = async (id: string) => {
    if (!confirm("Geplantes Set löschen? Es wird dann automatisch neu zusammengestellt.")) return;
    await api("/api/admin/sets", { method: "DELETE", json: { id } });
    load();
  };
  const future = sets?.filter((s) => s.date > today) ?? [];
  const recent = sets?.filter((s) => s.date <= today).slice(0, 40) ?? [];
  const qName = (id: string) => data.questions.find((q) => q.id === id)?.prompt ?? id;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarPlus className="size-5 text-accent" />Zukünftiges Set planen</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Datum</Label><Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Art</Label><Select value={kind} onChange={(e) => { setKind(e.target.value as "daily" | "pack"); setChosen([]); }}><option value="daily">Daily Challenge</option><option value="pack">Pack-Challenge</option></Select></div>
          </div>
          {kind === "pack" && <div><Label>Pack</Label><Select value={pack} onChange={(e) => { setPack(e.target.value); setChosen([]); }}>{data.packs.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select></div>}
          <p className="text-sm text-fg-muted">{chosen.length} ausgewählt · Ziel: {kind === "daily" ? data.settings.dailyQuestionCount : data.settings.packQuestionCount} Fragen. Nur geprüfte Fragen stehen zur Auswahl.</p>
          <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
            {eligible.map((q) => {
              const last = (data.usage[q.id] ?? []).sort().at(-1);
              return (
                <label key={q.id} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2">
                  <input type="checkbox" className="mt-1 accent-[var(--primary)]" checked={chosen.includes(q.id)} onChange={(e) => setChosen((c) => (e.target.checked ? [...c, q.id] : c.filter((x) => x !== q.id)))} />
                  <span className="flex-1">{q.prompt}<span className="block text-xs text-fg-subtle">{data.packs.find((p) => p.id === q.packId)?.short} · {last ? `zuletzt ${formatDateDe(last, { day: "numeric", month: "short" })}` : "noch nie verwendet"}</span></span>
                </label>
              );
            })}
          </div>
          {msg && <p className={cn("text-sm", msg.ok ? "text-success" : "text-danger")}>{msg.t}</p>}
          <Button onClick={plan} disabled={!date || !chosen.length}><Check />Set planen</Button>
          <p className="text-xs text-fg-subtle">Veröffentlichte Sets (heute und früher) sind eingefroren und können nicht verändert werden. Ohne Planung stellt das System Sets automatisch zusammen – bevorzugt mit noch nie gespielten Fragen.</p>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Geplant</CardTitle></CardHeader>
          <CardContent>
            {future.length === 0 ? <p className="text-sm text-fg-muted">Keine geplanten Sets.</p> : future.map((s) => (
              <div key={s.id} className="mb-2 rounded-xl border border-line p-3 text-sm">
                <div className="flex items-center justify-between"><span className="font-medium">{formatDateDe(s.date)} · {s.kind === "daily" ? "Daily" : data.packs.find((p) => p.id === s.packId)?.name}</span><Button variant="ghost" size="sm" onClick={() => del(s.id)}><Trash2 /></Button></div>
                <ul className="mt-1 list-inside list-decimal text-xs text-fg-muted">{s.items.map((i) => <li key={i.questionId}>{qName(i.questionId)}</li>)}</ul>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Veröffentlicht (eingefroren)</CardTitle></CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {!sets ? <Loader2 className="animate-spin" /> : recent.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
                <span>{formatDateDe(s.date, { day: "numeric", month: "short" })} · {s.kind === "daily" ? "Daily" : data.packs.find((p) => p.id === s.packId)?.short}</span>
                <span className="text-xs text-fg-subtle">{s.count} Fragen{s.repeats ? ` · ${s.repeats} Wdh.` : ""} · {s.createdBy === "admin" ? "geplant" : "automatisch"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReportsTab({ data, reload }: { data: AdminData; reload: () => void }) {
  const [reports, setReports] = React.useState<(AnswerReport & { prompt: string })[] | null>(null);
  const [filter, setFilter] = React.useState("open");
  const [editing, setEditing] = React.useState<{ q: Question; answer: string; reportId: string } | null>(null);
  const load = React.useCallback(() => api<{ reports: (AnswerReport & { prompt: string })[] }>("/api/admin/reports").then((r) => setReports(r.reports)), []);
  React.useEffect(() => void load(), [load]);
  const update = async (id: string, status: "accepted" | "rejected" | "open") => {
    await api("/api/admin/reports", { method: "PATCH", json: { id, status } });
    load();
  };
  const list = (reports ?? []).filter((r) => filter === "all" || r.status === filter);
  return (
    <div className="space-y-4">
      <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto"><option value="open">Offen</option><option value="accepted">Angenommen</option><option value="rejected">Abgelehnt</option><option value="all">Alle</option></Select>
      {!reports ? <Loader2 className="animate-spin" /> : list.length === 0 ? <p className="text-sm text-fg-muted">Keine Meldungen.</p> : list.map((r) => {
        const q = data.questions.find((x) => x.id === r.questionId);
        return (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center gap-4">
              <Flag className="size-5 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg-muted">{r.prompt}</p>
                <p className="font-display text-lg font-medium">„{r.answerText}“</p>
                {r.note && <p className="text-sm text-fg-muted">Hinweis: {r.note}</p>}
                <p className="text-xs text-fg-subtle">{new Date(r.createdAt).toLocaleString("de-CH")} · {r.status}</p>
              </div>
              {r.status === "open" && (
                <div className="flex gap-2">
                  {q && <Button size="sm" onClick={() => setEditing({ q, answer: r.answerText, reportId: r.id })}><Plus />Als Antwort aufnehmen</Button>}
                  <Button size="sm" variant="secondary" onClick={() => update(r.id, "rejected")}>Ablehnen</Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
      {editing && (
        <QuestionEditor initial={editing.q} isNew={false} packs={data.packs} presetAnswer={editing.answer} onClose={() => setEditing(null)} onSaved={async () => { await update(editing.reportId, "accepted"); setEditing(null); reload(); }} />
      )}
    </div>
  );
}

function SettingsTab({ data, reload }: { data: AdminData; reload: () => void }) {
  const [s, setS] = React.useState<GameSettings>(() => structuredClone(data.settings));
  const [msg, setMsg] = React.useState<{ ok: boolean; t: string } | null>(null);
  const save = async () => {
    try {
      await api("/api/admin/settings", { method: "PUT", json: s });
      setMsg({ ok: true, t: "Gespeichert." });
      reload();
    } catch (e) {
      setMsg({ ok: false, t: e instanceof ApiError ? e.message : "Fehler" });
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Seltenheitsstufen & Punkte</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {s.tiers.map((t, i) => (
            <div key={t.id} className="grid grid-cols-[auto_1fr_90px] items-center gap-3">
              <TierBadge tier={t.id} className="w-28 justify-center" />
              <Input value={t.label} onChange={(e) => setS({ ...s, tiers: s.tiers.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} className="h-9" />
              <Input type="number" min={0} value={t.points} onChange={(e) => setS({ ...s, tiers: s.tiers.map((x, j) => (j === i ? { ...x, points: Number(e.target.value) } : x)) })} className="h-9" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Level</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {s.levels.map((l, i) => (
            <div key={i} className="grid grid-cols-[40px_1fr_110px] items-center gap-3">
              <span className="text-sm text-fg-subtle">{l.level}</span>
              <Input value={l.name} onChange={(e) => setS({ ...s, levels: s.levels.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} className="h-9" />
              <Input type="number" min={0} value={l.minPoints} onChange={(e) => setS({ ...s, levels: s.levels.map((x, j) => (j === i ? { ...x, minPoints: Number(e.target.value) } : x)) })} className="h-9" />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Spielregeln</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div><Label>Fragen Daily</Label><Input type="number" min={1} max={20} value={s.dailyQuestionCount} onChange={(e) => setS({ ...s, dailyQuestionCount: Number(e.target.value) })} /></div>
          <div><Label>Fragen pro Pack</Label><Input type="number" min={1} max={20} value={s.packQuestionCount} onChange={(e) => setS({ ...s, packQuestionCount: Number(e.target.value) })} /></div>
          <div><Label>Sekunden pro Frage</Label><Input type="number" min={5} max={120} value={s.timeLimitSeconds} onChange={(e) => setS({ ...s, timeLimitSeconds: Number(e.target.value) })} /></div>
          <div><Label>Zeitzone</Label><Input value={s.timezone} onChange={(e) => setS({ ...s, timezone: e.target.value })} /></div>
          <p className="text-xs text-fg-subtle sm:col-span-4">Änderungen an Fragenanzahl wirken sich erst auf noch nicht veröffentlichte Tage aus. Starttag des Archivs: {formatDateDe(s.launchDate)} (fest).</p>
        </CardContent>
      </Card>
      <div className="flex items-center gap-3 lg:col-span-2">
        <Button onClick={save}><Save />Einstellungen speichern</Button>
        {msg && <span className={cn("text-sm", msg.ok ? "text-success" : "text-danger")}>{msg.t}</span>}
      </div>
    </div>
  );
}

function ImportTab({ data, reload }: { data: AdminData; reload: () => void }) {
  const [format, setFormat] = React.useState<"json" | "csv">("json");
  const [text, setText] = React.useState("");
  const [res, setRes] = React.useState<{ ok: boolean; lines: string[] } | null>(null);
  const [busy, setBusy] = React.useState(false);
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setFormat(f.name.endsWith(".csv") ? "csv" : "json");
    setText(await f.text());
  };
  const run = async (dryRun: boolean) => {
    setBusy(true);
    try {
      const r = await api<{ valid?: number; created?: number; updated?: number; errors: string[] }>("/api/admin/import", { json: { format, data: text, dryRun } });
      setRes({ ok: !r.errors.length, lines: [dryRun ? `${r.valid} Fragen gültig.` : `${r.created} neu, ${r.updated} aktualisiert.`, ...r.errors] });
      if (!dryRun) reload();
    } catch (e) {
      setRes({ ok: false, lines: [e instanceof ApiError ? e.message : "Fehler"] });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="size-5 text-accent" />Export</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-fg-muted">Exportiert alle {data.questions.length} Fragen inklusive Antworten, Aliases, Stufen, Erklärungen und Quellen.</p>
          <div className="flex gap-2">
            <Button asChild variant="secondary"><a href="/api/admin/export?format=json">JSON</a></Button>
            <Button asChild variant="secondary"><a href="/api/admin/export?format=csv">CSV</a></Button>
          </div>
          <p className="text-xs text-fg-subtle">CSV: eine Zeile pro Antwort, Spalten <code>question_id, pack_id, prompt, topic, difficulty, status, time_limit, sources, notes, answer_text, aliases, tier, points_override, explanation, answer_status</code>. Aliases mit „|“ trennen, Quellen als „Name|URL ;; Name|URL“. <code>tier = wrong</code> kennzeichnet eine Falschantwort.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="size-5 text-accent" />Import</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={format} onChange={(e) => setFormat(e.target.value as "json" | "csv")} className="w-auto"><option value="json">JSON</option><option value="csv">CSV</option></Select>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:bg-surface-2"><FileUp className="size-4" />Datei wählen<input type="file" accept=".json,.csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          </div>
          <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={format === "json" ? '[{ "id": "…", "packId": "geografie", "prompt": "Nenne …", "answers": [ … ] }]' : "question_id,pack_id,prompt,…"} className="font-mono text-xs" />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => run(true)} disabled={busy || !text}>Prüfen</Button>
            <Button onClick={() => run(false)} disabled={busy || !text}>{busy && <Loader2 className="animate-spin" />}Importieren</Button>
          </div>
          {res && <div className={cn("rounded-xl p-3 text-sm", res.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>{res.lines.map((l, i) => <p key={i}>{l}</p>)}</div>}
          <p className="text-xs text-fg-subtle">Bestehende Fragen mit gleicher ID werden aktualisiert. Ungültige Datensätze werden nicht importiert. Importierte Fragen erscheinen nur in Challenges, wenn ihr Status „Geprüft“ ist.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminClient({ defaultPw }: { defaultPw: boolean }) {
  const [data, setData] = React.useState<AdminData | null>(null);
  const [needLogin, setNeedLogin] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(async () => {
    try {
      setData(await api<AdminData>("/api/admin/questions"));
      setNeedLogin(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setNeedLogin(true);
      else setError(e instanceof ApiError ? e.message : "Fehler");
    }
  }, []);
  React.useEffect(() => void load(), [load]);

  if (needLogin) return <Login onDone={load} defaultPw={defaultPw} />;
  if (error) return <p className="text-danger">{error}</p>;
  if (!data) return <div className="skeleton h-96 rounded-3xl" />;
  const verified = data.questions.filter((q) => q.status === "verified").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent"><Settings2 className="size-4" />Redaktion</p>
          <h1 className="font-display text-3xl font-medium tracking-tight">Admin-Dashboard</h1>
          <p className="mt-1 text-sm text-fg-muted">{data.questions.length} Fragen · {verified} geprüft · Speicher: {data.storeKind === "supabase" ? "Supabase" : "lokale Datei (data/store.json)"}{!data.persistent && " – NICHT dauerhaft!"}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" size="sm"><Link href="/">Zur App</Link></Button>
          <Button variant="secondary" size="sm" onClick={async () => { await api("/api/admin/logout", { json: {} }); location.reload(); }}><LogOut />Abmelden</Button>
        </div>
      </div>
      {defaultPw && <p className="mb-4 rounded-xl bg-[color-mix(in_oklab,var(--tier-legendary)_15%,transparent)] px-4 py-2 text-sm">Hinweis: Es wird das Standard-Passwort für die Entwicklung verwendet. Setze <code>ADMIN_PASSWORD</code> für den Produktivbetrieb.</p>}
      <Tabs defaultValue="questions">
        <TabsList className="mb-6 flex w-full flex-wrap justify-start sm:w-auto">
          <TabsTrigger value="questions">Fragen</TabsTrigger>
          <TabsTrigger value="sets">Tages-Sets</TabsTrigger>
          <TabsTrigger value="reports">Meldungen</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
          <TabsTrigger value="import">Import / Export</TabsTrigger>
        </TabsList>
        <TabsContent value="questions"><QuestionsTab data={data} reload={load} /></TabsContent>
        <TabsContent value="sets"><SetsTab data={data} /></TabsContent>
        <TabsContent value="reports"><ReportsTab data={data} reload={load} /></TabsContent>
        <TabsContent value="settings"><SettingsTab data={data} reload={load} /></TabsContent>
        <TabsContent value="import"><ImportTab data={data} reload={load} /></TabsContent>
      </Tabs>
    </div>
  );
}
