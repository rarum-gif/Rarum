# Rarum – das Quiz der seltenen Antworten

Rarum ist eine Quiz-Web-App: Du beantwortest täglich neue Wissensfragen selbst (ohne Multiple Choice). Je **seltener deine richtige Antwort** ist, desto mehr Punkte bekommst du. Es gibt 15 Themen-Packs. Alles ist **kostenlos**: keine Werbung, keine Abos, keine Paywalls, keine Energie-Limits.

**Tech-Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui-artige Komponenten (Radix) · Lucide · Motion · Supabase (Auth + PostgreSQL + Realtime) · Vitest · Playwright

---

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
2. Führe `supabase/migrations/20261117000000_rarum_schema.sql` aus, im SQL-Editor oder mit `supabase db push`.
3. Spiele die Seed-Daten ein: `supabase/seed.sql`. Mit `supabase db reset` geschieht das automatisch. Neu erzeugen lässt sich die Datei mit `npm run db:seed-sql`.
4. Trage die Werte in `.env.local` ein (siehe `.env.example`).
5. Unter Auth → URL Configuration: Trage `https://deine-domain/auth/callback` als Redirect-URL ein.
6. Admin-Rechte für ein Konto vergeben: `update public.profiles set role = 'admin' where username = '…';`

Gäste können ihre lokal gespielten Ergebnisse nach der Anmeldung ins Konto übernehmen. Übernommen werden nur Ergebnisse mit gültiger Server-Signatur, und bereits gewertete Tage werden nicht doppelt gezählt.

## Umgebungsvariablen

| Variable | Pflicht | Zweck |
|---|---|---|
| `RUN_TOKEN_SECRET` | in Produktion | Signiert Spielrunden und Ergebnis-Quittungen (mind. 32 Zeichen) |
| `ADMIN_PASSWORD` | in Produktion | Zugang zu `/admin` |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Supabase-Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Öffentlicher Anon-Key |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Nur serverseitig: Wertung, Admin, Seeding |
| `RARUM_DATA_FILE` | optional | Pfad zum Demo-Datenspeicher |

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
