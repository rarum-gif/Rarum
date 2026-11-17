import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Signierte, manipulationssichere Tokens für den Spielablauf und für lokale
// Ergebnis-Quittungen. Der Client kann den Inhalt lesen, aber nicht verändern.

let fallbackSecret: string | null = null;

function secret(): string {
  const env = process.env.RUN_TOKEN_SECRET;
  if (env && env.length >= 16) return env;
  if (process.env.NODE_ENV !== "production") return "rarum-local-development-secret";
  // Produktion ohne Secret: zufälliges Secret pro Prozess (Tokens überleben keinen Neustart)
  if (!fallbackSecret) {
    fallbackSecret = randomBytes(32).toString("hex");
    console.warn("[rarum] RUN_TOKEN_SECRET fehlt – es wird ein temporäres Secret verwendet.");
  }
  return fallbackSecret;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function sign<T>(payload: T, purpose: string): string {
  const body = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const mac = createHmac("sha256", secret()).update(purpose + "." + body).digest();
  return body + "." + b64url(mac);
}

export function verify<T>(token: unknown, purpose: string): T | null {
  if (typeof token !== "string" || token.length > 200_000) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const mac = Buffer.from(token.slice(dot + 1), "base64url");
  const expected = createHmac("sha256", secret()).update(purpose + "." + body).digest();
  if (mac.length !== expected.length || !timingSafeEqual(mac, expected)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function newId(prefix = ""): string {
  return prefix + randomBytes(9).toString("base64url");
}
