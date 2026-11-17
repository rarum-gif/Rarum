import type { GameSettings, ThemePack } from "@/lib/types";
import { defaultLevels } from "@/lib/game/stats";

export const seedSettings: GameSettings = {
  tiers: [
    { id: "known", label: "Bekannt", points: 10, rank: 1 },
    { id: "familiar", label: "Vertraut", points: 20, rank: 2 },
    { id: "unusual", label: "Ungewöhnlich", points: 35, rank: 3 },
    { id: "rare", label: "Selten", points: 55, rank: 4 },
    { id: "very_rare", label: "Sehr selten", points: 80, rank: 5 },
    { id: "legendary", label: "Legendär", points: 100, rank: 6 },
  ],
  levels: defaultLevels(),
  dailyQuestionCount: 7,
  packQuestionCount: 5,
  timeLimitSeconds: 25,
  launchDate: "2026-11-17",
  timezone: "Europe/Zurich",
};

const p = (order: number, id: string, name: string, short: string, tagline: string, description: string, topics: string[], accent: string, accentSoft: string, ink: string): ThemePack => ({
  id, name, short, tagline, description, topics, accent, accentSoft, ink, order, coverImage: null,
});

export const seedPacks: ThemePack[] = [
  p(1, "allgemeinwissen", "Allgemeinwissen", "Allgemein", "Von allem ein bisschen – und das Seltene zählt.", "Wissenschaft, Gesellschaft, Alltag und Kurioses: das Pack für Neugierige, die in jedem Gebiet eine überraschende Antwort parat haben.", ["Wissenschaft", "Gesellschaft", "Alltag", "Kurioses", "Persönlichkeiten", "Weltwissen"], "#5f6f3a", "#e7e4cf", "#2b3320"),
  p(2, "sport", "Sport", "Sport", "Abseits der Superstars wird es spannend.", "Fussball, Tennis, Formel 1, Olympische Spiele und Sportgeschichte. Wer nur die grössten Namen kennt, sammelt wenig Punkte.", ["Fussball", "Basketball", "Tennis", "Formel 1", "Olympia", "Sportgeschichte"], "#3f6b4f", "#dbe6dc", "#1c3326"),
  p(3, "musik", "Musik", "Musik", "Zwischen Charts und Plattenkiste.", "Bands, Musikerinnen, Instrumente, Genres und Musikgeschichte – vom Welthit bis zur Fussnote.", ["Musiker", "Bands", "Songs", "Alben", "Genres", "Instrumente"], "#7a4f3a", "#efe1d6", "#3a2419"),
  p(4, "geografie", "Geografie", "Geografie", "Die Welt jenseits der Hauptstädte.", "Länder, Städte, Inseln, Gebirge, Flüsse und Seen. Je entlegener deine Antwort, desto wertvoller.", ["Länder", "Hauptstädte", "Inseln", "Gebirge", "Flüsse", "Seen"], "#3d6a73", "#d8e6e6", "#17323a"),
  p(5, "geschichte", "Geschichte", "Geschichte", "Was in den Fussnoten der Geschichte steht.", "Antike, Mittelalter, Revolutionen, Persönlichkeiten und Erfindungen, die die Welt verändert haben.", ["Antike", "Mittelalter", "Weltkriege", "Persönlichkeiten", "Revolutionen"], "#8a6a3d", "#f0e6d2", "#3d2e17"),
  p(6, "wissenschaft", "Wissenschaft & Forschung", "Wissenschaft", "Vom Atom bis zum Andromedanebel.", "Physik, Chemie, Biologie, Astronomie und die Menschen, die geforscht haben.", ["Physik", "Chemie", "Biologie", "Astronomie", "Weltraum", "Forschende"], "#34506e", "#dae2ec", "#152336"),
  p(7, "tiere-pflanzen", "Tiere & Pflanzen", "Natur", "Artenvielfalt, Antwort für Antwort.", "Säugetiere, Vögel, Meerestiere, Insekten und Pflanzen – von der Hauskatze bis zum Axolotl.", ["Säugetiere", "Vögel", "Meerestiere", "Insekten", "Pflanzen", "Ökosysteme"], "#4d6b34", "#e0e8d3", "#223315"),
  p(8, "filme-serien", "Filme & Serien", "Film", "Hinter dem Blockbuster liegt das Archiv.", "Klassiker, Regie, Schauspiel, Animation und Serien – für alle, die den Abspann sitzen bleiben.", ["Hollywood", "Klassiker", "Regie", "Serien", "Animation", "Filmfiguren"], "#6e3f45", "#eddadb", "#33191d"),
  p(9, "gaming", "Gaming & E-Sport", "Gaming", "Von der Heimkonsole bis zum Turniersaal.", "Videospiele, Konsolen, Studios, Spielfiguren und E-Sport-Geschichte.", ["Videospiele", "Konsolen", "Entwickler", "Charaktere", "E-Sport"], "#4a4f6e", "#dfe0ea", "#1f2236"),
  p(10, "essen-trinken", "Essen & Trinken", "Kulinarik", "Eine Weltreise auf dem Teller.", "Gerichte, Zutaten, Gewürze, Früchte, Desserts und Getränke aus allen Esskulturen.", ["Küche", "Gerichte", "Zutaten", "Gewürze", "Desserts", "Getränke"], "#9a5b2e", "#f3e3d3", "#432612"),
  p(11, "literatur", "Bücher & Literatur", "Literatur", "Zwischen den Zeilen liegen die Punkte.", "Autorinnen und Autoren, Romane, Figuren, Klassiker, Fantasy und Krimis.", ["Autoren", "Romane", "Buchfiguren", "Klassiker", "Fantasy", "Krimis"], "#5c4a3a", "#ebe3d8", "#2a2018"),
  p(12, "technik", "Technik & Erfindungen", "Technik", "Wie aus Ideen Maschinen wurden.", "Computer, Internet, Elektronik, Maschinen und die Köpfe dahinter.", ["Computer", "Smartphones", "Internet", "Erfinder", "Maschinen", "Elektronik"], "#4f5b62", "#e0e4e6", "#1f2629"),
  p(13, "kunst-kultur", "Kunst & Kultur", "Kunst", "Museumsreife Antworten gesucht.", "Malerei, Architektur, Museen, Design und Kunstbewegungen aus aller Welt.", ["Künstler", "Gemälde", "Architektur", "Museen", "Design", "Bewegungen"], "#7d5a6a", "#efe2e7", "#36222b"),
  p(14, "marken-wirtschaft", "Marken & Wirtschaft", "Wirtschaft", "Mehr als nur bekannte Logos.", "Unternehmen, Marken, Autohersteller, Mode, Unternehmer und Wirtschaftsgeschichte.", ["Marken", "Unternehmen", "Automobil", "Mode", "Unternehmer"], "#55603f", "#e3e6d7", "#252b18"),
  p(15, "reisen", "Reisen & Weltkultur", "Reisen", "Fernweh mit Punktewertung.", "Sehenswürdigkeiten, Traditionen, Weltkulturerbe und Reiseziele rund um den Globus.", ["Sehenswürdigkeiten", "Traditionen", "Welterbe", "Reiseziele", "Kulturen"], "#8a6f4a", "#f1e9da", "#3b2e1b"),
];
