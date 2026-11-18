# NNAXOS – das Quiz der seltenen Antworten

**Design: „Sunset Coast“** – eine filmische Küstenmetropole bei Sonnenuntergang und Nacht: Palmen, Skylines, Ocean-Drive-Architektur, Sunset-Verläufe aus Orange, Pink, Violett und Blau. Inspiriert von modernen Open-World-Spielwelten, aber vollständig eigenständig – keine Logos, Screenshots, Figuren oder Markenassets fremder Spiele.

NNAXOS ist eine Quiz-Web-App: Du beantwortest täglich neue Wissensfragen selbst (ohne Multiple Choice). Je **seltener deine richtige Antwort** ist, desto mehr Punkte bekommst du. Es gibt 15 Themen-Packs. Alles ist **kostenlos**: keine Werbung, keine Abos, keine Paywalls, keine Energie-Limits.

**Tech-Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui-artige Komponenten (Radix) · Lucide · Motion · Supabase (Auth + PostgreSQL + Realtime) · Vitest · Playwright

## Spielsystem

- **Geld, XP und Level** (`src/lib/game/economy.ts`): Jede richtige Antwort bringt Geld (50 $ bis 400 $ je nach Seltenheit), jede abgeschlossene Runde XP. Pro Level gibt es 10 % mehr Geld pro Antwort. Alles wird aus den gespeicherten Runden nachgerechnet – auch der Server, bevor er einen Kauf im **Shop** (`/shop`) bestätigt.
- **Schwierige Fragen**: Aus grossen Antwortlisten entstehen automatisch Varianten mit Anfangsbuchstaben (`src/content/variants.ts`).
- **Keine Beispielantworten** nach einer Frage – so bleiben seltene Antworten selten.

- **Hauptmenü** im Stil eines Spiels: Menü-Knopf mit Seitenleiste (Spielen · Du · Mehr), grosser Titel, „PLAY NOW“, Ranked-Karte und Modus-Leiste (Archiv · Themen-Packs · Unlimited). Darunter „Die Leiter“.
- **Vom Strand zur Skyline** (`src/lib/game/wealth.ts`): Jeder Punkt ist 1’000 $ wert. In jeder Runde steigst du elf Stufen hoch – Pleite am Strand → Strassenmusiker → Food Truck → Motel → Cabrio → Nachtclub → Strandvilla → Penthouse → Superyacht → Privatjet → Privatinsel. Der Quiz-Bildschirm zeigt Kontostand, Stufe und eine kletternde Leiste; das Ergebnis zeigt die erreichte Stufe. Das Gesamtvermögen (offizielle Punkte) bestimmt den Karriere-Rang (Pleite … Legende der Küste).
- **Ranked** (`/ranked`, `src/lib/game/ranked.ts`, Migration `20261118000000_ranked.sql`): 7 Zufallsfragen aus allen Welten. RP-Änderung = (Punkte − 220) / 6, begrenzt auf −25 … +60. Wöchentliche Saison (Mo 00:00 Europe/Zurich, Start bei 1000 RP), Ligen Bronze · Silber · Gold · Platin · Diamant · Champion. Abgebrochene Matches zählen nach 30 Minuten mit ihrem Zwischenstand. Ohne Supabase zeigt die Liga klar gekennzeichnete Demo-Rivalen.
- **Antwortlisten**: über 8’200 gültige Antworten. Ergänzungen stehen kompakt in `src/content/extras/*.ts` (eine Antwort pro Zeile, `#auto` leitet die Seltenheit aus der Reihenfolge ab). Bei Personenfragen zählt auch der Nachname allein („Roosevelt“).

---

## Spielwelt (Runde 5)

- **Spielfigur:** Beim ersten Start wählt jeder Spieler eine von acht eigenen Figuren (`/start`) und passt sie an: Haut, Frisur, Haarfarbe, Bart und Hintergrund. Kleidung und Accessoires aus dem Shop trägt die Figur (`/figur`). Alles ist als Vektorgrafik selbst gezeichnet, ohne fremde Bilder (`src/components/character.tsx`).
- **Grundstück:** Ein isometrisches Raster, 8 × 8 Felder, erweiterbar auf 10, 12 und 14. Gekaufte Gebäude, Fahrzeuge, Outdoor-Objekte und Deko werden frei platziert. Boote liegen automatisch am Steg. Es gibt fünf Umgebungen (`/grundstueck`, `src/components/world/*`).
- **Shop:** Über 100 Gegenstände in 9 Kategorien (`src/lib/game/catalog.ts`). Deko wie Palmen kann man mehrfach kaufen. Premium-Gegenstände sind rein kosmetisch.
- **Geld:** Offizielle Runden, Ranked und Daily zahlen voll. Freie Endlos-Runden zahlen 25 %, die Weltkarte 50 %. Am Ende einer Ranked-Saison gibt es eine Belohnung je erreichter Liga. Voraussetzung sind mindestens 3 Matches in der Woche.
- **Themen-Packs endlos:** Jedes Pack lässt sich endlos spielen, wahlweise leicht, normal, schwer oder gemischt. Kürzlich gespielte Fragen werden gemieden. Kostenlos sind es 10 Fragen am Stück, mit Premium bis 60.
- **Weltkarte:** Ein GeoGuessr-ähnlicher Modus mit 5 Orten pro Runde, Punkte nach Entfernung. Die Kartendaten stammen von Natural Earth (gemeinfrei) und werden mit `npx tsx scripts/build-world-map.ts` erzeugt.
- **Server-Prüfung:** Server und Client prüfen dieselbe Logik. Die Figur darf nur Gegenstände tragen, die der Spieler besitzt. Auf dem Grundstück wird geprüft: Besitz, Grenzen und keine Überlappungen. Bei Käufen wird der Kontostand aus den Runden nachgerechnet, und Käufe pro Konto werden nacheinander verarbeitet.

### Premium und Bezahlung

Premium kostet **einmalig 1 CHF** (kein Abo) und gilt danach für immer. Premium ist bewusst **kein Pay-to-win**: Geld, XP, Ranglisten und Fragen sind für alle gleich. Premium bringt längere Endlos-Runden, exklusive kosmetische Gegenstände, zwei Umgebungen und ein Profil-Abzeichen.

- **Heute:** Freischaltung über Codes (`PREMIUM_CODES`). Konten speichern `premium_until` in der Datenbank, Gäste erhalten ein vom Server signiertes Token.
- **Echte Zahlungen:** Noch nicht aktiv, der Knopf auf `/premium` sagt das offen. Empfohlen ist Stripe Checkout. Dafür braucht es:
  - einen Stripe-Account,
  - die Secrets `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET`,
  - eine Route, die eine Checkout-Session erstellt,
  - einen Webhook (`checkout.session.completed`), der nach der Einmalzahlung `premium_until` per Service-Role weit in die Zukunft setzt (z. B. 2099), also lebenslang.
  
  Zahlungen setzen ein Spielerkonto mit E-Mail voraus, ausserdem eine Datenschutzerklärung und AGB.

## Designsystem

- **Schriften** (Google Fonts via `next/font`, selbst gehostet beim Build): Bebas Neue für grosse Überschriften, Manrope für Text und Quiz-Fragen, Space Grotesk für Zahlen und Punkte.
- **Farben und Tokens**: `src/app/globals.css` (Sunset Orange, Coral, Peach, Gold, Ocean, Tropical Blue, Palm Green, Sand, Midnight Navy, Deep Purple …). Glas-Oberflächen (`.glass`, `.hud`), der Verlauf `.bg-sunset` und die Schrift `.text-sunset`.
- **Seltenheitsfarben**: Bekannt Grau · Vertraut Blau · Ungewöhnlich Türkis · Selten Violett · Sehr selten Gold · Legendär Sunset-Verlauf.
- **Hintergrund-Komponente**: `src/components/scene.tsx` (`SceneBackground`, `SceneOverride`). Jede Seite hat ihre eigene Bildwelt:

  | Bereich | Bildwelt |
  |---|---|
  | Home | Sunset |
  | Daily | Ocean Drive |
  | Packs | Florida Coast |
  | Unlimited | Tropical Night |
  | Archiv | Dusk Harbor |
  | Rangliste | Downtown |
  | Profil | Marina |

  Pack-Seiten und Quiz-Fragen nehmen automatisch die Welt ihres Packs an. Die Bilder bewegen sich mit einem langsamen Kamerazoom und einer leichten Maus-Parallaxe; `prefers-reduced-motion` wird respektiert.
- **Bilder**: Echte Fotos mit freier Lizenz (CC0 bzw. CC BY) von Wikimedia Commons und StockSnap, gefunden über Openverse. Sie wurden zugeschnitten und mit `scripts/grade-photos.mjs` eingefärbt (Split-Toning: violette Schatten, pinke und orange Lichter, Vignette). Dazu kommen Filmkorn und Farbversatz im Titel per CSS. Alle Nachweise stehen in `public/images/credits.json` und auf `/info#bilder`.
  - `public/images/backgrounds/` – 7 Welten, je Desktop- und Mobil-Format
  - `public/images/themes/` – 15 Pack-Welten, je Vollbild und Karte
  - `public/images/wealth/` – 11 Stufen der Leiter
  - `public/images/dashboard/`, `quiz/`, `profile/`

  Eigene, lizenzierte Fotos lassen sich jederzeit einsetzen: gleichnamige Datei ersetzen (bei CC-BY-Fotos den Nachweis in `credits.json` ergänzen) oder `coverImage` pro Pack setzen. Die früheren SVG-Illustrationen lassen sich mit `npm run assets:illustrations` erzeugen – Achtung, das überschreibt die Fotos.

## Schnellstart (Demo-Modus, ohne Datenbank)

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

Für die Entwicklung: `npm run dev`.

Im Demo-Modus gilt:
- Die Inhalte (Fragen, Tages-Sets, Meldungen, Admin-Änderungen) liegen in `data/store.json`. Die Datei wird beim ersten Start aus `src/content/` erzeugt.
- Die Spielstände liegen im **Browser (localStorage)** und sind in der Oberfläche als „Lokale Daten“ gekennzeichnet.
- Konten, Freunde und globale Ranglisten sind deaktiviert. Es werden **keine** fremden Spieler vorgetäuscht.
- Admin-Bereich: `/admin`. Das Passwort steht in `ADMIN_PASSWORD`, im Entwicklungsmodus ist es ohne gesetzten Wert `admin`.

## Mit Supabase (Konten, Synchronisierung, Freunde, Ranglisten)

1. Lege ein Supabase-Projekt an.
2. Führe alle Dateien in `supabase/migrations/` der Reihe nach aus (Schema, Ranked, Shop, Spielwelt), im SQL-Editor oder mit `supabase db push`.
3. Spiele die Seed-Daten ein: `supabase/seed.sql`. Mit `supabase db reset` geschieht das automatisch. Neu erzeugen lässt sich die Datei mit `npm run db:seed-sql`.
4. Trage die Werte in `.env.local` ein (siehe `.env.example`).
5. **Konten mit E-Mail:** Registrierung mit E-Mail, Spielername und Passwort. Bei aktivem „Confirm email“ kommt ein Bestätigungslink (Redirect-URL `https://DEINE-DOMAIN/auth/callback` unter Authentication → URL Configuration eintragen). Wer ganz ohne E-Mail spielen will, kann das Häkchen „Ohne E-Mail“ setzen; das funktioniert nur, wenn „Confirm email“ ausgeschaltet ist.
6. Admin-Rechte für ein Konto vergeben: `update public.profiles set role = 'admin' where username = '…';`

Gäste können ihre lokal gespielten Ergebnisse nach der Anmeldung ins Konto übernehmen. Übernommen werden nur Ergebnisse mit gültiger Server-Signatur, und bereits gewertete Tage werden nicht doppelt gezählt.

## Umgebungsvariablen

`PREMIUM_CODES` (optional): Premium-Codes im Format `CODE:Tage`, mehrere durch Komma getrennt.


| Variable | Pflicht | Zweck |
|---|---|---|
| `RUN_TOKEN_SECRET` | in Produktion | Signiert Spielrunden und Ergebnis-Quittungen (mind. 32 Zeichen) |
| `ADMIN_PASSWORD` | in Produktion | Zugang zu `/admin` |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Öffentlicher Anon-Key |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Nur serverseitig: Wertung, Admin, Seeding |
| `NNAXOS_DATA_FILE` | optional | Pfad zum Demo-Datenspeicher |

## Tests

```bash
npm test                 # 40 Unit-/Integrationstests (Antworterkennung, Punkte, Tages-Sets, Streaks, Engine, CSV, SQL-Schema via PGlite)
npm run test:e2e         # 5 Playwright-Tests (Daily-Ablauf, Reload/Timer, Packs, Archiv, Admin, Mobile)
npm run content:validate # prüft den Fragenbestand (IDs, kollidierende Aliases, Mindestumfang)
```

## Architektur in Kürze

- **Spiellogik auf dem Server** (`src/lib/server/run.ts`): Fragen werden einzeln ausgegeben, und der Server merkt sich die Startzeit. Antworten werden nur auf dem Server ausgewertet. Neuladen gibt keine zusätzliche Zeit. Gäste erhalten ein HMAC-signiertes Run-Token; für eingeloggte Nutzer ist die Datenbank massgeblich (pro Set ist nur eine offizielle Wertung möglich, per Unique-Index erzwungen).
- **Antworterkennung** (`src/lib/game/matching.ts`):
  - ignoriert Gross-/Kleinschreibung, Leerzeichen, Akzente, Umlaut-Schreibweisen (ä/ae), ß/ss, Satzzeichen und Artikel
  - vereinheitlicht römische Zahlen
  - erkennt Aliases
  - korrigiert Tippfehler vorsichtig: höchstens 1–2 Zeichen, nur bei eindeutigem Treffer und mit gleichem Anfangsbuchstaben
  - erkennt bekannte Falschantworten und erklärt sie
  - Antworten, die nicht in der Liste stehen, gelten nicht als falsch und können gemeldet werden
- **Daily-Content-System** (`src/lib/game/schedule.ts`):
  - Pro Tag gibt es eine Daily Challenge (7 Fragen aus verschiedenen Packs) und eine Challenge pro Pack (5 Fragen). Wechsel um Mitternacht Europe/Zurich, auch bei Sommerzeit korrekt.
  - Ein Set wird beim ersten Abruf berechnet und gespeichert. Danach ändert es sich nie mehr.
  - Bevorzugt werden Fragen, die noch nie gespielt wurden. Ist der Bestand erschöpft, kommen die am längsten nicht gespielten Fragen erneut – sichtbar als Wiederholung markiert.
  - Admins können zukünftige Sets planen.
- **Inhalte**: `src/content/questions/*.ts` (kompaktes Autorenformat). JSON/CSV-Import und -Export gibt es im Admin-Bereich.

## Datenbank (Supabase)

Tabellen: `profiles` (Users = `auth.users`), `questions`, `accepted_answers`, `answer_aliases`, `rejected_answers`, `answer_options` (View), `rarity_tiers`, `theme_packs`, `app_settings`, `daily_challenges`, `daily_pack_challenges`, `challenge_attempts`, `user_answers`, `user_stats`, `achievements`, `user_achievements`, `friendships`, `answer_reports`. Ranglisten liefern die Funktion `leaderboard()` und die View `leaderboard_alltime`.

RLS-Regeln:
- Antwortlisten sind für Clients nicht lesbar.
- Spielstände sind nur für den Eigentümer lesbar und werden nur vom Server geschrieben.
- Rolle und Einladungscode im Profil sind gegen Änderungen durch Clients geschützt.
- Öffentlich sind nur Benutzername, Avatar und Punkte.

## Hinweise zu den Inhalten

Der Seed-Bestand umfasst **107 Fragen mit rund 3 400 gültigen Antworten**, Aliases, Erklärungen und bekannten Falschantworten. Er ist redaktionell aus Allgemeinwissen zusammengestellt. Die Seltenheitsstufen sind **redaktionell eingestuft**, nicht gemessen. Als Quellen sind Wikipedia-Artikel oder, wo kein einzelner Artikel eindeutig passt, ehrlich als solche gekennzeichnete Wikipedia-Suchlinks hinterlegt. Vor einem öffentlichen Betrieb empfiehlt sich eine Stichprobenprüfung durch die Redaktion. Eine Beispielfrage („Schweizer Alpenpass“) steht bewusst auf „In Prüfung“ und erscheint deshalb in keiner gewerteten Challenge.

## Eigene Titelbilder

Die Packs nutzen eigene, generierte Landschafts-Illustrationen (SVG). Eigene Fotos (z. B. `public/packs/geografie.jpg`) lassen sich pro Pack als `coverImage` hinterlegen – im Seed (`src/content/packs.ts`) oder über `PUT /api/admin/packs`.

## Online veröffentlichen (Vercel)

1. Lade den Projektordner in ein GitHub-Repository hoch: Neues Repository anlegen und den Inhalt der ZIP-Datei committen.
2. Auf **vercel.com**: „Add New → Project“, dann das Repository wählen. Das Framework „Next.js“ wird automatisch erkannt.
3. Unter **Environment Variables** mindestens diese Werte setzen:
   - `RUN_TOKEN_SECRET`: eine lange, zufällige Zeichenkette
   - `ADMIN_PASSWORD`
4. Optional die drei Supabase-Variablen setzen. Ohne Supabase läuft die App auf Vercel im Demo-Modus.
   - Spielen funktioniert vollständig.
   - Admin-Änderungen werden ohne Supabase nicht dauerhaft gespeichert, weil das Dateisystem auf Vercel schreibgeschützt ist.
   - Für den Produktivbetrieb Supabase verbinden.
5. „Deploy“ klicken. Eine eigene Domain trägst du unter „Settings → Domains“ ein.
6. In Supabase unter Auth → URL Configuration die Domain sowie `https://deine-domain/auth/callback` als Redirect-URL eintragen.

## Als App installieren (PWA)

Die App bringt ein Manifest, App-Icons (192/512, maskable) und einen Service Worker mit (aktiv auf HTTPS-Domains, nicht auf localhost).

- **Android/Chrome**: Seite öffnen → Menü → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
- **iPhone/iPad (Safari)**: Teilen-Symbol → „Zum Home-Bildschirm“.
- **Desktop (Chrome/Edge)**: Installations-Symbol in der Adressleiste.

## Produktions-Build

```bash
npm install
npm run build
npm start
```
