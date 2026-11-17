// Datumshilfen für die Tageswertung. Der Tageswechsel erfolgt um Mitternacht
// in der konfigurierten Zeitzone (Standard: Europe/Zurich), DST-sicher.

export const DEFAULT_TZ = "Europe/Zurich";

function parts(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

/** YYYY-MM-DD des Kalendertags in der Zeitzone */
export function dateKey(date: Date = new Date(), timeZone = DEFAULT_TZ): string {
  const p = parts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Offset der Zeitzone zu UTC in Minuten zum Zeitpunkt `date` */
function tzOffsetMinutes(date: Date, timeZone: string): number {
  const p = parts(date, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/** Zeitpunkt (UTC) von 00:00 Uhr Lokalzeit am Tag `key` */
export function startOfDay(key: string, timeZone = DEFAULT_TZ): Date {
  const [y, m, d] = key.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, 0, 0, 0);
  let ts = guess - tzOffsetMinutes(new Date(guess), timeZone) * 60000;
  // zweite Iteration für Tage mit Zeitumstellung
  ts = guess - tzOffsetMinutes(new Date(ts), timeZone) * 60000;
  return new Date(ts);
}

export function addDays(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function utcOf(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetween(fromKey: string, toKey: string): number {
  return Math.round((utcOf(toKey) - utcOf(fromKey)) / 86400000);
}

/** Nächster Tageswechsel (Mitternacht) nach `now` */
export function nextReset(now: Date = new Date(), timeZone = DEFAULT_TZ): Date {
  return startOfDay(addDays(dateKey(now, timeZone), 1), timeZone);
}

/** Montag der Woche (ISO) zum Tag `key` */
export function weekStart(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = So
  const offset = (dow + 6) % 7;
  return addDays(key, -offset);
}

export function isValidDateKey(key: unknown): key is string {
  return typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key) && !Number.isNaN(Date.parse(key + "T00:00:00Z"));
}

export function formatDateDe(key: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("de-CH", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
