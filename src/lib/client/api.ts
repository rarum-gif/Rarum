"use client";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

/** Gäste: signiertes Premium-Token mitsenden (wird nur vom Server geprüft) */
function premiumHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem("rarum.v1.premium");
    const t = raw ? (JSON.parse(raw) as { token?: string }).token : null;
    return t ? { "x-nnaxos-premium": t } : {};
  } catch {
    return {};
  }
}

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      method: rest.method ?? (json !== undefined ? "POST" : "GET"),
      headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...premiumHeader(), ...(rest.headers ?? {}) },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Keine Verbindung. Bitte prüfe deine Internetverbindung.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Unbekannter Fehler", res.status);
  return data as T;
}
