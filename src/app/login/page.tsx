"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, Logo } from "@/components/bits";
import { browserSupabase } from "@/lib/client/supabase";

/**
 * Spielerkonten ohne E-Mail: Benutzername + Passwort. Intern braucht Supabase eine
 * E-Mail-Adresse – wir bilden sie aus dem Benutzernamen auf einer reservierten,
 * nie zustellbaren Domain (.invalid). Es werden keine persönlichen Daten erhoben.
 * Voraussetzung: In Supabase ist „Confirm email“ ausgeschaltet.
 */
const PLAYER_DOMAIN = "spieler.nnaxos.invalid";
const playerEmail = (name: string) => (name.includes("@") ? name.trim() : `${name.trim().toLowerCase()}@${PLAYER_DOMAIN}`);

export default function LoginPage() {
  const { accountsEnabled, refreshSession, user } = useApp();
  const router = useRouter();
  const [mode, setMode] = React.useState("signup");
  const [password, setPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) router.replace("/profil?sync=1");
  }, [user, router]);

  if (!accountsEnabled) {
    return (
      <EmptyState icon={ShieldCheck} title="Spielerkonten sind noch nicht aktiv" className="mx-auto max-w-lg">
        Dein Fortschritt wird auf diesem Gerät gespeichert.
        <div className="mt-4"><Button asChild><Link href="/">Weiterspielen</Link></Button></div>
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
      if (!/^[A-Za-z0-9_.-]{3,24}$/.test(username) && !(mode === "signin" && username.includes("@"))) throw new Error("Benutzername: 3–24 Zeichen (Buchstaben, Ziffern, . _ -).");
      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({ email: playerEmail(username), password, options: { data: { username } } });
        if (error) throw new Error(/registered|exists/i.test(error.message) ? "Dieser Benutzername ist schon vergeben." : error.message);
        if (!data.session) throw new Error("Das Konto wurde angelegt, konnte aber nicht sofort aktiviert werden. (Admin: In Supabase „Confirm email“ ausschalten.)");
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: playerEmail(username), password });
        if (error) throw new Error(error.message === "Invalid login credentials" ? "Benutzername oder Passwort ist falsch." : error.message);
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
        <p className="mt-4 text-white/75">Dein Spielerkonto – nur Benutzername und Passwort. Keine E-Mail, keine persönlichen Daten.</p>
      </div>
      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Tabs value={mode} onValueChange={setMode} className="flex justify-center">
              <TabsList><TabsTrigger value="signup">Neues Konto</TabsTrigger><TabsTrigger value="signin">Anmelden</TabsTrigger></TabsList>
            </Tabs>
            <div><Label htmlFor="username">Benutzername</Label><Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
            <div><Label htmlFor="pw">Passwort</Label><Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} required /></div>
            {err && <p className="text-sm text-danger">{err}</p>}
            <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{mode === "signup" ? "Spielerkonto erstellen" : "Anmelden"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
