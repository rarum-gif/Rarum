import "server-only";
import { NextResponse } from "next/server";
import { RunError } from "./run";

export function json<T>(data: T, init?: number | ResponseInit) {
  const opts = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, { ...opts, headers: { "Cache-Control": "no-store", ...(opts?.headers ?? {}) } });
}

export function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    const text = await req.text();
    if (text.length > 2_000_000) throw new Error("too large");
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new RunError("Ungültige Anfrage.", 400);
  }
}

/** Einheitliche Fehlerbehandlung für Route-Handler */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof RunError) return fail(e.message, e.status);
      console.error("[rarum] API-Fehler", e);
      return fail("Da ist etwas schiefgelaufen. Bitte versuche es erneut.", 500);
    }
  };
}
