"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, Logo } from "@/components/bits";
import { CharacterArt } from "@/components/character";
import { browserSupabase } from "@/lib/client/supabase";

/**
 * Spielerkonto mit E-Mail und Passwort (Supabase Auth).
 * Wer keine E-Mail angeben möchte, kann weiterhin nur mit Spielername spielen:
 * Dann bilden wir intern eine nie zustellbare Adresse auf .invalid.
 * Spielfigur und Fortschritt des Gastes werden nach der Anmeldung übernommen.
 */
const PLAYER_DOMAIN = "spieler.nnaxos.invalid";
const NAME_RE = /^[A-Za-z0-9_.-]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginPage() {
  const { accountsEnabled, refreshSession, user, character, saveCharacter } = useApp();
  const router = useRouter();
  const [mode, setMode] = React.useState("signup");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [noEmail, setNoEmail] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const guestCharacter = React.useRef(character);

  React.useEffect(() => {
    if (!user) return;
    // Gast-Figur ins neue Konto übernehmen
    void (async () => {
      if (guestCharacter.current && !user.character) await saveCharacter(guestCharacter.current);
      router.replace("/profil?sync=1");
    })();
  }, [user, router, saveCharacter]);

  if (!accountsEnabled) {
    return (
      <EmptyState icon={ShieldCheck} title="Spielerkonten sind noch nicht aktiv" className="mx-auto max-w-lg">
        Dein Fortschritt wird auf diesem Gerät gespeichert.
        <div className="mt-4"><Button asChild><Link href="/">Weiterspielen</Link></Button></div>
      </EmptyState>
    );
  }

  const loginEmail = (id: string) => (id.includes("@") ? id.trim() : `${id.trim().toLowerCase()}@${PLAYER_DOMAIN}`);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = browserSupabase();
    if (!sb) return;
    setBusy(true);
    setErr(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        if (!NAME_RE.test(username)) throw new Error("Spielername: 3–24 Zeichen (Buchstaben, Ziffern, . _ -).");
        if (!noEmail && !EMAIL_RE.test(email)) throw new Error("Bitte gib eine gültige E-Mail-Adresse an.");
        const address = noEmail ? loginEmail(username) : email.trim();
        const { data, error } = await sb.auth.signUp({ email: address, password, options: { data: { username }, emailRedirectTo: `${location.origin}/auth/callback?next=/profil?sync=1` } });
        if (error) throw new Error(/registered|exists/i.test(error.message) ? "Diese E-Mail bzw. dieser Spielername ist schon vergeben." : error.message);
        if (!data.session) {
          if (noEmail) throw new Error("Konto angelegt, aber nicht aktiviert. (Admin: In Supabase „Confirm email“ ausschalten oder mit E-Mail registrieren.)");
          setInfo("Fast geschafft! Wir haben dir eine E-Mail geschickt – bestätige den Link, dann bist du angemeldet.");
          return;
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: loginEmail(username), password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "Anmeldedaten sind falsch." : /confirm/i.test(error.message) ? "Bitte bestätige zuerst den Link in deiner E-Mail." : error.message);
      }
      await refreshSession();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    const sb = browserSupabase();
    if (!sb) return;
    if (!EMAIL_RE.test(username)) return setErr("Gib oben deine E-Mail-Adresse ein, dann schicken wir dir einen Link.");
    setBusy(true);
    const { error } = await sb.auth.resetPasswordForEmail(username.trim(), { redirectTo: `${location.origin}/auth/callback?next=/passwort` });
    setBusy(false);
    if (error) setErr(error.message);
    else setInfo("Falls ein Konto existiert, ist der Link zum Zurücksetzen unterwegs.");
  };

  return (
    <div className="mx-auto grid max-w-4xl items-center gap-8 py-6 md:grid-cols-[1fr_1.1fr]">
      <div className="hidden justify-center md:flex">
        {character ? <div className="idle-breathe"><CharacterArt c={character} size={280} /></div> : <Logo />}
      </div>
      <div>
        <div className="mb-6">
          <h1 className="font-display text-5xl text-white sm:text-6xl">{mode === "signup" ? "Spielerkonto" : "Willkommen zurück"}</h1>
          <p className="mt-1 text-sm text-white/65">Fortschritt, Figur und Grundstück auf allen Geräten.</p>
        </div>
        <Card>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Tabs value={mode} onValueChange={(v) => { setMode(v); setErr(null); setInfo(null); }} className="flex justify-center">
                <TabsList><TabsTrigger value="signup">Neues Konto</TabsTrigger><TabsTrigger value="signin">Anmelden</TabsTrigger></TabsList>
              </Tabs>
              {mode === "signup" ? (
                <>
                  <div><Label htmlFor="username">Spielername</Label><Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
                  {!noEmail && <div><Label htmlFor="email">E-Mail</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>}
                  <label className="flex items-center gap-2 text-xs text-white/65"><input type="checkbox" checked={noEmail} onChange={(e) => setNoEmail(e.target.checked)} />Ohne E-Mail (dann kein Passwort-Zurücksetzen möglich)</label>
                </>
              ) : (
                <div><Label htmlFor="username">E-Mail oder Spielername</Label><Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
              )}
              <div><Label htmlFor="pw">Passwort</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required /></div>
              {err && <p className="text-sm text-danger">{err}</p>}
              {info && <p className="flex items-start gap-2 text-sm text-[var(--success)]"><Mail className="mt-0.5 size-4 shrink-0" />{info}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === "signup" ? "Konto erstellen" : "Anmelden"}</Button>
              {mode === "signin" && <button type="button" onClick={reset} className="w-full text-center text-xs font-semibold text-white/60 hover:text-white">Passwort vergessen?</button>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
