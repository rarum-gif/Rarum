"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { browserSupabase } from "@/lib/client/supabase";

/** Neues Passwort setzen (nach dem Link aus der E-Mail) */
export default function PasswordPage() {
  const router = useRouter();
  const [pw, setPw] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = browserSupabase();
    if (!sb) return;
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setErr(/session/i.test(error.message) ? "Der Link ist abgelaufen. Bitte fordere einen neuen an." : error.message);
    else router.replace("/profil");
  };
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="font-display mb-6 text-5xl text-white">Neues Passwort</h1>
      <Card><CardContent>
        <form onSubmit={save} className="space-y-4">
          <div><Label htmlFor="pw">Passwort (mind. 8 Zeichen)</Label><Input id="pw" type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div>
          {err && <p className="text-sm text-danger">{err}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />}Speichern</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
