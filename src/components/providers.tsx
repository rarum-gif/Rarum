"use client";
import * as React from "react";
import type { AttemptRecord, GameSettings, ThemePack } from "@/lib/types";
import { computeStats, type UserStats } from "@/lib/game/stats";
import { canBuy, computeEconomy, ownedCount, shopItem, walletOf, type Economy, type Purchase } from "@/lib/game/economy";
import { api } from "@/lib/client/api";
import { loadGuestProfile, loadLocal, loadLocalAttempts, loadLocalPurchases, saveGuestProfile, saveLocal, saveLocalAttempt, saveLocalPurchase } from "@/lib/client/local";
import { presetOf, validateCharacter, type Character } from "@/lib/game/character";
import { EMPTY_ESTATE, plotSize, validateEstate, type Estate } from "@/lib/game/estate";
import { DEFAULT_AVATAR, isValidAvatar } from "@/lib/avatars";

export interface SetSummary {
  id: string;
  date: string;
  kind: "daily" | "pack";
  packId: string | null;
  count: number;
  repeats: number;
  difficulty: number;
  createdBy: "auto" | "admin";
}

export interface Overview {
  today: string;
  serverNow: string;
  nextReset: string;
  timezone: string;
  daily: SetSummary | null;
  packs: { packId: string; set: SetSummary | null; eligible: number }[];
}

export interface SessionInfo {
  username: string;
  avatar: string;
  role: "player" | "admin";
  inviteCode: string;
  email: string | null;
  character?: unknown;
  estate?: unknown;
  premiumUntil?: string | null;
}

interface AppState {
  packs: ThemePack[];
  settings: GameSettings;
  accountsEnabled: boolean;
  user: SessionInfo | null;
  sessionLoaded: boolean;
  attempts: AttemptRecord[];
  attemptsLoaded: boolean;
  storage: "local" | "account";
  overview: Overview | null;
  today: string;
  serverOffset: number;
  stats: UserStats;
  /** Level aus XP (Kompatibilitätsform für bestehende Anzeigen) */
  level: { current: { level: number; name: string }; next: { level: number; name: string } | null; toNext: number; progress: number };
  economy: Economy;
  purchases: Purchase[];
  wallet: ReturnType<typeof walletOf>;
  buy: (itemId: string) => Promise<string | null>;
  refreshOverview: () => Promise<void>;
  refreshSession: () => Promise<void>;
  reloadAttempts: () => Promise<void>;
  recordAttempt: (a: AttemptRecord, storage: "local" | "account") => void;
  packById: (id: string | null | undefined) => ThemePack | undefined;
  /** Angezeigter Name und Avatar – vom Konto oder (Gast) von diesem Gerät */
  profile: { name: string; avatar: string; guest: boolean };
  saveProfile: (p: { name: string; avatar: string }) => Promise<string | null>;
  /** Spielfigur (null = noch nicht gewählt) */
  character: Character | null;
  worldLoaded: boolean;
  saveCharacter: (c: Character) => Promise<string | null>;
  estate: Estate;
  plot: number;
  saveEstate: (e: Estate) => Promise<string | null>;
  owns: (id: string) => number;
  premium: { active: boolean; until: string | null };
  redeemPremium: (code: string) => Promise<string | null>;
  /** Echte Zahlungen (Stripe) eingerichtet */
  paymentsEnabled: boolean;
  hasOfficial: (setId: string | null | undefined) => AttemptRecord | undefined;
}

const Ctx = React.createContext<AppState | null>(null);

export function useApp() {
  const v = React.useContext(Ctx);
  if (!v) throw new Error("useApp ausserhalb des Providers");
  return v;
}

export function AppProvider({ children, packs, settings, accountsEnabled, initialOverview }: { children: React.ReactNode; packs: ThemePack[]; settings: GameSettings; accountsEnabled: boolean; initialOverview: Overview | null }) {
  const [user, setUser] = React.useState<SessionInfo | null>(null);
  const [paymentsEnabled, setPaymentsEnabled] = React.useState(false);
  const [sessionLoaded, setSessionLoaded] = React.useState(!accountsEnabled);
  const [attempts, setAttempts] = React.useState<AttemptRecord[]>([]);
  const [attemptsLoaded, setAttemptsLoaded] = React.useState(false);
  const [overview, setOverview] = React.useState<Overview | null>(initialOverview);
  const [serverOffset, setServerOffset] = React.useState(0);
  const [purchases, setPurchases] = React.useState<Purchase[]>([]);
  const [guest, setGuest] = React.useState<{ name: string; avatar: string } | null>(null);
  const [localWorld, setLocalWorld] = React.useState<{ character: Character | null; estate: Estate | null; premium: { until: string; token: string } | null } | null>(null);
  React.useEffect(() => {
    setGuest(loadGuestProfile());
    setLocalWorld({ character: loadLocal<Character>("character"), estate: loadLocal<Estate>("estate"), premium: loadLocal<{ until: string; token: string }>("premium") });
  }, []);

  const refreshOverview = React.useCallback(async () => {
    try {
      const t0 = Date.now();
      const o = await api<Overview>("/api/overview");
      const t1 = Date.now();
      setServerOffset(new Date(o.serverNow).getTime() - (t0 + t1) / 2);
      setOverview(o);
    } catch {
      /* Übersicht bleibt beim letzten Stand */
    }
  }, []);

  const refreshSession = React.useCallback(async () => {
    if (!accountsEnabled) return;
    try {
      const me = await api<{ user: SessionInfo | null; paymentsEnabled?: boolean }>("/api/me");
      setUser(me.user);
      setPaymentsEnabled(!!me.paymentsEnabled);
    } finally {
      setSessionLoaded(true);
    }
  }, [accountsEnabled]);

  const reloadAttempts = React.useCallback(async () => {
    if (user) {
      try {
        const r = await api<{ attempts: AttemptRecord[] }>("/api/me/attempts");
        setAttempts(r.attempts);
      } catch {
        setAttempts([]);
      }
      try {
        const r = await api<{ purchases: Purchase[] }>("/api/shop");
        setPurchases(r.purchases);
      } catch {
        setPurchases([]);
      }
    } else {
      setAttempts(loadLocalAttempts());
      setPurchases(loadLocalPurchases());
    }
    setAttemptsLoaded(true);
  }, [user]);

  React.useEffect(() => {
    void refreshSession();
    void refreshOverview();
  }, [refreshSession, refreshOverview]);

  React.useEffect(() => {
    if (sessionLoaded) void reloadAttempts();
  }, [sessionLoaded, reloadAttempts]);

  // Tageswechsel: Übersicht neu laden, sobald Mitternacht erreicht ist
  React.useEffect(() => {
    if (!overview) return;
    const ms = new Date(overview.nextReset).getTime() - (Date.now() + serverOffset) + 1500;
    const t = setTimeout(() => void refreshOverview(), Math.max(1000, Math.min(ms, 2 ** 31 - 1)));
    return () => clearTimeout(t);
  }, [overview, serverOffset, refreshOverview]);

  const recordAttempt = React.useCallback((a: AttemptRecord, storage: "local" | "account") => {
    if (storage === "local") setAttempts(saveLocalAttempt(a));
    else setAttempts((prev) => [a, ...prev.filter((x) => x.id !== a.id)]);
  }, []);

  const today = overview?.today ?? new Date().toISOString().slice(0, 10);
  const stats = React.useMemo(() => computeStats(attempts, packs, today), [attempts, packs, today]);
  const economy = React.useMemo(() => computeEconomy(attempts), [attempts]);
  const wallet = React.useMemo(() => walletOf(economy, purchases), [economy, purchases]);
  const level = React.useMemo(() => {
    const l = economy.level;
    return { current: { level: l.level, name: l.title }, next: { level: l.level + 1, name: `Level ${l.level + 1}` }, toNext: l.toNext, progress: l.progress };
  }, [economy]);
  const premiumUntil = user ? user.premiumUntil ?? null : localWorld?.premium?.until ?? null;
  const premium = React.useMemo(() => ({ active: !!premiumUntil && new Date(premiumUntil).getTime() > Date.now(), until: premiumUntil }), [premiumUntil]);
  const buy = React.useCallback(async (itemId: string) => {
    const item = shopItem(itemId);
    if (!item) return "Unbekannter Artikel.";
    const err = canBuy(item, economy, purchases, premium.active);
    if (err) return err;
    if (user) {
      try {
        const r = await api<{ purchases: Purchase[] }>("/api/shop", { json: { itemId } });
        setPurchases(r.purchases);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Kauf fehlgeschlagen.";
      }
    }
    setPurchases(saveLocalPurchase({ itemId, price: item.price, at: new Date().toISOString() }));
    return null;
  }, [economy, purchases, user, premium.active]);
  const packById = React.useCallback((id: string | null | undefined) => packs.find((p) => p.id === id), [packs]);
  const hasOfficial = React.useCallback((setId: string | null | undefined) => (setId ? attempts.find((a) => a.official && a.setId === setId) : undefined), [attempts]);

  const profile = React.useMemo(
    () => (user ? { name: user.username, avatar: user.avatar, guest: false } : { name: guest?.name || presetOf(String((localWorld?.character as Character | null)?.preset ?? ""))?.name || "Gast", avatar: guest?.avatar || DEFAULT_AVATAR, guest: true }),
    [user, guest, localWorld],
  );
  const saveProfile = React.useCallback(async ({ name, avatar }: { name: string; avatar: string }) => {
    const n = name.trim();
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(n)) return "Name: 3–24 Zeichen, nur Buchstaben, Ziffern, Punkt, Strich und Unterstrich.";
    if (!isValidAvatar(avatar)) return "Unbekannter Avatar.";
    if (user) {
      try {
        await api("/api/me/profile", { method: "PATCH", json: { username: n, avatar } });
        await refreshSession();
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Profil konnte nicht gespeichert werden.";
      }
    }
    saveGuestProfile({ name: n, avatar });
    setGuest({ name: n, avatar });
    return null;
  }, [user, refreshSession]);

  const owns = React.useCallback((id: string) => ownedCount(purchases, id), [purchases]);
  const worldLoaded = sessionLoaded && attemptsLoaded && localWorld !== null;
  const character = React.useMemo<Character | null>(() => {
    const raw = user ? user.character : localWorld?.character;
    if (!raw) return null;
    const v = validateCharacter(raw, (id) => ownedCount(purchases, id) > 0);
    // Figur mit nicht (mehr) vorhandenen Gegenständen: Grundform behalten
    if (typeof v === "string") {
      const base = validateCharacter({ ...(raw as object), head: null, eyes: null, neck: null, ears: null, top: "tee-weiss" }, () => false);
      return typeof base === "string" ? null : base;
    }
    return v;
  }, [user, localWorld, purchases]);
  const estate = React.useMemo<Estate>(() => {
    const raw = user ? user.estate : localWorld?.estate;
    if (!raw) return EMPTY_ESTATE;
    const v = validateEstate(raw, purchases);
    return typeof v === "string" ? EMPTY_ESTATE : v;
  }, [user, localWorld, purchases]);
  const plot = React.useMemo(() => plotSize(purchases), [purchases]);

  const saveCharacter = React.useCallback(async (c: Character) => {
    const v = validateCharacter(c, (id) => ownedCount(purchases, id) > 0);
    if (typeof v === "string") return v;
    if (user) {
      try {
        await api("/api/me/character", { method: "PUT", json: { character: v } });
        await refreshSession();
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Speichern fehlgeschlagen.";
      }
    }
    saveLocal("character", v);
    setLocalWorld((w) => ({ ...(w ?? { estate: null, premium: null }), character: v }));
    return null;
  }, [user, purchases, refreshSession]);

  const saveEstate = React.useCallback(async (e: Estate) => {
    const v = validateEstate(e, purchases);
    if (typeof v === "string") return v;
    if (user) {
      try {
        await api("/api/me/estate", { method: "PUT", json: { estate: v } });
        await refreshSession();
        return null;
      } catch (err) {
        return err instanceof Error ? err.message : "Speichern fehlgeschlagen.";
      }
    }
    saveLocal("estate", v);
    setLocalWorld((w) => ({ ...(w ?? { character: null, premium: null }), estate: v }));
    return null;
  }, [user, purchases, refreshSession]);

  const redeemPremium = React.useCallback(async (code: string) => {
    try {
      const r = await api<{ until: string; token?: string }>("/api/premium/redeem", { json: { code } });
      if (user) await refreshSession();
      else if (r.token) {
        saveLocal("premium", { until: r.until, token: r.token });
        setLocalWorld((w) => ({ ...(w ?? { character: null, estate: null }), premium: { until: r.until, token: r.token! } }));
      }
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Code konnte nicht eingelöst werden.";
    }
  }, [user, refreshSession]);

  const value: AppState = {
    packs, settings, accountsEnabled, user, sessionLoaded, attempts, attemptsLoaded, storage: user ? "account" : "local",
    overview, today, serverOffset, stats, level, economy, purchases, wallet, buy, refreshOverview, refreshSession, reloadAttempts, recordAttempt, packById, hasOfficial, profile, saveProfile,
    character, worldLoaded, saveCharacter, estate, plot, saveEstate, owns, premium, redeemPremium, paymentsEnabled,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
