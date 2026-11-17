"use client";
import type { AttemptRecord } from "@/lib/types";

// Lokale Speicherung für Gäste / Demo-Modus. Alles bleibt in diesem Browser.
const ATTEMPTS = "rarum.v1.attempts";
const RUN_PREFIX = "rarum.v1.run.";

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Speicher voll oder blockiert */
  }
}
function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadLocalAttempts(): AttemptRecord[] {
  try {
    const raw = safeGet(ATTEMPTS);
    const list = raw ? (JSON.parse(raw) as AttemptRecord[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveLocalAttempt(rec: AttemptRecord): AttemptRecord[] {
  const list = loadLocalAttempts().filter((a) => a.id !== rec.id);
  // Doppelte offizielle Wertung lokal verhindern
  const dup = rec.official && list.some((a) => a.official && a.setId === rec.setId);
  const next = [{ ...rec, official: dup ? false : rec.official }, ...list].slice(0, 1500);
  safeSet(ATTEMPTS, JSON.stringify(next));
  return next;
}

export function replaceLocalAttempts(list: AttemptRecord[]) {
  safeSet(ATTEMPTS, JSON.stringify(list));
}

export function clearLocalAttempts() {
  safeRemove(ATTEMPTS);
}

export interface SavedRun {
  token: string;
  savedAt: number;
}

export function runKey(mode: string, packId?: string | null, date?: string | null) {
  return [mode, packId ?? "-", date ?? "-"].join(":");
}

export function loadRun(key: string): SavedRun | null {
  try {
    const raw = safeGet(RUN_PREFIX + key);
    const r = raw ? (JSON.parse(raw) as SavedRun) : null;
    if (!r || Date.now() - r.savedAt > 36 * 3600 * 1000) return null;
    return r;
  } catch {
    return null;
  }
}

export function saveRun(key: string, token: string) {
  safeSet(RUN_PREFIX + key, JSON.stringify({ token, savedAt: Date.now() }));
}

export function clearRun(key: string) {
  safeRemove(RUN_PREFIX + key);
}

export function getPref(key: string): string | null {
  return safeGet("rarum.pref." + key);
}
export function setPref(key: string, value: string) {
  safeSet("rarum.pref." + key, value);
}

// Käufe im Shop (Gäste). Mit Konto liegen sie auf dem Server.
const PURCHASES = "rarum.v1.purchases";
export interface LocalPurchase {
  itemId: string;
  price: number;
  at: string;
}
export function loadLocalPurchases(): LocalPurchase[] {
  try {
    const raw = safeGet(PURCHASES);
    const list = raw ? (JSON.parse(raw) as LocalPurchase[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
export function saveLocalPurchase(p: LocalPurchase): LocalPurchase[] {
  const list = [...loadLocalPurchases().filter((x) => x.itemId !== p.itemId), p];
  safeSet(PURCHASES, JSON.stringify(list));
  return list;
}

// Gast-Profil: Name und Avatar nur auf diesem Gerät (keine personenbezogenen Daten)
const GUEST = "rarum.v1.guest";

export interface GuestProfile {
  name: string;
  avatar: string;
}

export function loadGuestProfile(): GuestProfile | null {
  try {
    const raw = localStorage.getItem(GUEST);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<GuestProfile>;
    return typeof p.name === "string" && typeof p.avatar === "string" ? { name: p.name, avatar: p.avatar } : null;
  } catch {
    return null;
  }
}

export function saveGuestProfile(p: GuestProfile) {
  try {
    localStorage.setItem(GUEST, JSON.stringify(p));
  } catch {
    /* privater Modus – dann eben nur für diese Sitzung */
  }
}
