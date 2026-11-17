import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Clock, Flag, Gift, Keyboard, Scale, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import credits from "../../../public/images/credits.json";

export const metadata: Metadata = { title: "So funktioniert's" };

const items = [
  { icon: Keyboard, title: "Selbst eintippen", text: "Es gibt keine Multiple-Choice-Antworten. Du überlegst selbst und tippst deine Antwort ein – Gross-/Kleinschreibung, Umlaute, Akzente und kleine Tippfehler sind egal." },
  { icon: Sparkles, title: "Seltenheit zählt", text: "Jede richtige Antwort hat eine Seltenheitsstufe: Bekannt (10), Vertraut (20), Ungewöhnlich (35), Selten (55), Sehr selten (80) und Legendär (100 Punkte)." },
  { icon: Scale, title: "Nur richtige Antworten zählen", text: "Ungewöhnlich allein reicht nicht: Gewertet wird nur, was in unserer geprüften Antwortliste steht. Die Seltenheit ist redaktionell eingestuft – wir behaupten keine weltweit gemessenen Häufigkeiten." },
  { icon: Flag, title: "Fehlt deine Antwort?", text: "Unbekannte Antworten gelten nicht automatisch als falsch. Du kannst sie melden – die Redaktion prüft sie und ergänzt die Liste." },
  { icon: Clock, title: "Faire Zeit", text: "Pro Frage hast du 25 Sekunden. Die Zeit läuft auf dem Server: Neuladen der Seite bringt keine zusätzlichen Sekunden." },
  { icon: BadgeCheck, title: "Eine offizielle Wertung pro Tag", text: "Die Daily Challenge und die Tages-Challenges der Packs zählen einmal pro Tag. Wiederholungen und Archiv-Runden sind Trainingsrunden." },
  { icon: Gift, title: "Komplett kostenlos", text: "Alle 15 Themen-Packs und alle Spielmodi sind gratis. Keine Werbung, keine Abos, keine Energie- oder Lebenslimits." },
  { icon: Sparkles, title: "Vom Strand zur Skyline", text: "Jeder Punkt ist 1’000 $ wert. In jeder Runde kletterst du elf Stufen hoch – von „Pleite am Strand“ bis zur „Privatinsel“. Dein Gesamtvermögen bestimmt deinen Karriere-Rang." },
  { icon: Scale, title: "Ranked", text: "7 Fragen aus allen Welten. Über 220 Punkte bringen Ranglistenpunkte (RP), darunter verlierst du ein paar. Jede Woche startet eine neue Saison mit Ligen von Bronze bis Champion." },
  { icon: ShieldCheck, title: "Datenschutz", text: "Öffentlich sichtbar sind nur Benutzername, Avatar und Punkte. Ohne Konto bleiben deine Ergebnisse ausschliesslich in deinem Browser." },
];

export default function InfoPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Spielregeln</p>
      <h1 className="font-display text-6xl">So funktioniert Rarum</h1>
      <p className="mt-3 text-fg-muted">Rarum belohnt nicht nur Wissen, sondern Tiefe: Wer statt der naheliegenden Antwort eine seltene, aber korrekte findet, sammelt die meisten Punkte.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <div key={i.title} className="glass rounded-3xl p-6">
            <i.icon className="size-6 text-accent" />
            <h2 className="mt-3 font-display text-2xl">{i.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{i.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex gap-3"><Button asChild size="lg"><Link href="/play?mode=daily">Daily Challenge spielen</Link></Button></div>
      <section id="bilder" className="mt-16 scroll-mt-24">
        <h2 className="font-display text-4xl">Bildnachweise</h2>
        <p className="mt-2 text-sm text-fg-muted">Alle Hintergründe sind echte Fotos mit freier Lizenz (CC0 bzw. Creative Commons Namensnennung) von Wikimedia Commons und StockSnap, gefunden über Openverse. Für den Look wurden sie zugeschnitten und farblich bearbeitet. Keine Bilder aus Spielen oder von Marken.</p>
        <ul className="mt-5 divide-y divide-white/10 text-sm">
          {credits.map((c) => (
            <li key={c.file} className="py-2.5">
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline">{c.title}</a>
              <span className="text-fg-muted"> · {c.creator ?? "unbekannt"} · </span>
              <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="text-fg-muted underline-offset-2 hover:underline">{c.license === "cc0" ? "CC0 1.0 (gemeinfrei)" : `CC BY ${c.licenseVersion}`}</a>
              <span className="text-fg-subtle"> · bearbeitet · verwendet für {c.usedFor.join(", ")}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
