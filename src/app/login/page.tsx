"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, Logo } from "@/components/bits";
import { browserSupabase } from "@/lib/client/supabase";

export default function LoginPage() {
  const { accountsEnabled, refreshSession, user } = useApp();
  const router = useRouter();
  const [mode, setMode] = React.useState("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (user) router.replace("/profil?sync=1");
  }, [user, router]);

  if (!accountsEnabled) {
    return (
      <EmptyState icon={ShieldCheck} title="Konten sind im Demo-Modus deaktiviert" className="mx-auto max-w-lg">
        Diese Installation läuft ohne Supabase. Du kannst trotzdem alles spielen – deine Ergebnisse werden lokal in diesem Browser gespeichert. Sobald Supabase in der <code>.env</code> konfiguriert ist, stehen kostenlose Konten, Synchronisierung, Freunde und globale Ranglisten zur Verfügung.
        <div className="mt-4"><Button asChild><Link href="/">Weiter ohne Konto</Link></Button></div>
      </EmptyState>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = browserSupabase();
    if (!sb) return;
    setBusy(true);
    setErr(null);
    try {
      if (mode === "signup") {
        if (!/^[A-Za-z0-9_.-]{3,24}$/.test(username)) throw new Error("Benutzername: 3–24 Zeichen (Buchstaben, Ziffern, . _ -).");
        const { data, error } = await sb.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: `${location.origin}/auth/callback` } });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          return;
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "E-Mail oder Passwort ist falsch." : error.message);
      }
      await refreshSession();
      router.replace("/profil?sync=1");
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="mb-8 text-center">
        <Logo className="justify-center" />
        <p className="mt-4 text-fg-muted">Kostenloses Konto: Fortschritt auf allen Geräten, Freunde und Ranglisten. Keine Zahlungsdaten, keine Werbung.</p>
      </div>
      <Card>
        <CardContent>
          {sent ? (
            <div className="py-6 text-center">
              <MailCheck className="mx-auto size-10 text-accent" />
              <p className="mt-3 font-display text-3xl">Fast geschafft</p>
              <p className="mt-2 text-sm text-fg-muted">Wir haben dir eine Bestätigungs-E-Mail an {email} geschickt. Klicke auf den Link, um dein Konto zu aktivieren.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Tabs value={mode} onValueChange={setMode} className="flex justify-center">
                <TabsList><TabsTrigger value="signin">Anmelden</TabsTrigger><TabsTrigger value="signup">Registrieren</TabsTrigger></TabsList>
              </Tabs>
              {mode === "signup" && (
                <div><Label htmlFor="username">Benutzername (öffentlich sichtbar)</Label><Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
              )}
              <div><Label htmlFor="email">E-Mail (nicht öffentlich)</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
              <div><Label htmlFor="pw">Passwort</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required /></div>
              {err && <p className="text-sm text-danger">{err}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === "signup" ? "Konto erstellen" : "Anmelden"}</Button>
              <p className="text-center text-xs text-fg-subtle">Deine bisherigen lokalen Ergebnisse kannst du nach der Anmeldung übernehmen.</p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
