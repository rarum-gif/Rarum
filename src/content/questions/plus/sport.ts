import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("sport", [
  {
    id: "ballon-dor",
    prompt: "Nenne eine Person, die den Ballon d'Or gewonnen hat.",
    topic: "Fussball",
    difficulty: 3,
    sources: [wiki("Ballon d’Or")],
    list: `
K Lionel Messi
K Cristiano Ronaldo
F Luka Modrić | Luka Modric
F Karim Benzema
F Ronaldinho
F Kaká | Kaka
F Zinedine Zidane | Zidane
F Ronaldo | Ronaldo Nazário; Ronaldo Luís Nazário de Lima; R9
F Franz Beckenbauer
F Johan Cruyff | Johan Cruijff
F Michel Platini
F Rodri | Rodrigo Hernández
F Ousmane Dembélé | Ousmane Dembele
F Gerd Müller
F Lothar Matthäus
F Marco van Basten
U Luís Figo | Luis Figo
U Pavel Nedvěd | Pavel Nedved
U Andrij Schewtschenko | Andriy Shevchenko; Schewtschenko
U Fabio Cannavaro
U Michael Owen
U Rivaldo
U Ruud Gullit
U Roberto Baggio
U George Weah
U Karl-Heinz Rummenigge
U Kevin Keegan
U Bobby Charlton
U George Best
U Eusébio | Eusebio
U Alfredo Di Stéfano | Di Stefano
U Lew Jaschin | Lev Yashin; Lew Yashin; Jaschin
U Alexia Putellas
U Aitana Bonmatí | Aitana Bonmati
U Megan Rapinoe
U Ada Hegerberg
R Matthias Sammer
R Hristo Stoichkov | Christo Stoitschkow
R Jean-Pierre Papin
R Paolo Rossi
R Igor Belanov | Ihor Belanow
R Oleg Blochin | Oleh Blochin
R Allan Simonsen
R Gianni Rivera
R Denis Law
R Raymond Kopa
R Stanley Matthews
R Omar Sívori | Omar Sivori
V Luis Suárez Miramontes | Luis Suárez; Luis Suarez
V Josef Masopust
V Flórián Albert | Florian Albert
x Robert Lewandowski | Lewandowski | Er wurde 2020 favorisiert, doch der Ballon d'Or fiel wegen der Pandemie aus.
x Erling Haaland | Haaland | Bisher kein Ballon d'Or – nur Podestplätze.
x Kylian Mbappé | Mbappé | Bisher kein Ballon d'Or.
x Pelé | Pele | Der Ballon d'Or war bis 1995 Europäern vorbehalten – Pelé bekam später nur eine Ehrenauszeichnung.
x Diego Maradona | Maradona | Der Ballon d'Or war damals Europäern vorbehalten – Maradona bekam später nur eine Ehrenauszeichnung.
x Thierry Henry | | Kein Ballon d'Or – Zweiter 2003.
x Xavi | | Kein Ballon d'Or – mehrmals auf dem Podest.
x Andrés Iniesta | Iniesta | Kein Ballon d'Or – Zweiter 2010.
x Virgil van Dijk | | Kein Ballon d'Or – Zweiter 2019.
`,
  },
  {
    id: "olympia-sommer-gastgeber",
    prompt: "Nenne eine Stadt, die bereits Olympische Sommerspiele ausgetragen hat.",
    topic: "Olympia",
    difficulty: 2,
    sources: [wiki("Olympische Sommerspiele")],
    list: `
K Paris
K London
K Los Angeles
K Peking | Beijing
K Tokio | Tokyo
K Rio de Janeiro | Rio
F Athen
F Sydney
F Barcelona
F Atlanta
F München
F Berlin
F Moskau
F Rom
F Seoul
F Montreal | Montréal
U Mexiko-Stadt | Mexico City; Mexiko
U Amsterdam
U Helsinki
U Melbourne
U Stockholm
U Antwerpen
R St. Louis | Saint Louis
x Brisbane | | Brisbane richtet die Sommerspiele erst 2032 aus.
x Mailand | Cortina d'Ampezzo | Mailand und Cortina richteten 2026 Winterspiele aus, keine Sommerspiele.
x Sotschi | | Sotschi richtete 2014 Winterspiele aus.
x Chamonix | | Chamonix richtete 1924 die ersten Winterspiele aus.
x Istanbul | | Istanbul bewarb sich mehrmals erfolglos.
`,
  },
  {
    id: "olympia-winter-gastgeber",
    prompt: "Nenne einen Ort, der bereits Olympische Winterspiele ausgetragen hat.",
    topic: "Olympia",
    difficulty: 3,
    sources: [wiki("Olympische Winterspiele")],
    list: `
K St. Moritz | Sankt Moritz
K Vancouver
K Sotschi | Sochi; Sotschi
F Peking | Beijing
F Mailand | Milano | Mailand-Cortina 2026
F Cortina d'Ampezzo | Cortina
F Innsbruck
F Lillehammer
F Salt Lake City
F Turin | Torino
F Pyeongchang | Pyeongchang; Pyongchang
F Calgary
F Nagano
F Chamonix
F Lake Placid
F Garmisch-Partenkirchen | Garmisch
U Oslo
U Sarajevo
U Albertville
U Grenoble
U Sapporo
U Squaw Valley | Palisades Tahoe
x Davos | | Davos bewarb sich, war aber nie Gastgeber.
x Zermatt | | Kein Olympia-Gastgeber.
x Crans-Montana | | Ausrichter von Ski-Weltmeisterschaften, aber nie Olympia.
x French Alps | Französische Alpen | Die Französischen Alpen richten die Spiele erst 2030 aus.
`,
  },
  {
    id: "bundesliga-verein-2025",
    prompt: "Nenne einen Verein, der in der Saison 2025/26 in der 1. Fussball-Bundesliga (Deutschland) spielt.",
    topic: "Fussball",
    difficulty: 2,
    sources: [wiki("Fußball-Bundesliga 2025/26")],
    list: `
K FC Bayern München | Bayern München; Bayern; FC Bayern
K Borussia Dortmund | Dortmund; BVB
K Bayer 04 Leverkusen | Bayer Leverkusen; Leverkusen
K RB Leipzig | Leipzig; Rasenballsport Leipzig
F Eintracht Frankfurt | Frankfurt
F VfB Stuttgart | Stuttgart
F Borussia Mönchengladbach | Gladbach; Mönchengladbach
F SV Werder Bremen | Werder Bremen; Bremen
F VfL Wolfsburg | Wolfsburg
F Hamburger SV | HSV; Hamburg
F 1. FC Köln | FC Köln; Köln
F SC Freiburg | Freiburg
U 1. FC Union Berlin | Union Berlin
U 1. FSV Mainz 05 | Mainz 05; Mainz
U TSG 1899 Hoffenheim | Hoffenheim; TSG Hoffenheim
U FC Augsburg | Augsburg
U FC St. Pauli | St. Pauli; Sankt Pauli
R 1. FC Heidenheim 1846 | 1. FC Heidenheim; Heidenheim
x FC Schalke 04 | Schalke 04; Schalke | Schalke spielt 2025/26 in der 2. Bundesliga.
x Hertha BSC | Hertha | Hertha spielt 2025/26 in der 2. Bundesliga.
x Holstein Kiel | Kiel | Kiel ist 2025 in die 2. Bundesliga abgestiegen.
x VfL Bochum | Bochum | Bochum ist 2025 in die 2. Bundesliga abgestiegen.
x Fortuna Düsseldorf | Düsseldorf | Düsseldorf spielt 2025/26 in der 2. Bundesliga.
x Hannover 96 | Hannover | Hannover spielt 2025/26 in der 2. Bundesliga.
x 1. FC Kaiserslautern | Kaiserslautern | Kaiserslautern spielt 2025/26 in der 2. Bundesliga.
x 1. FC Nürnberg | Nürnberg | Nürnberg spielt 2025/26 in der 2. Bundesliga.
x Darmstadt 98 | Darmstadt | Darmstadt spielt 2025/26 in der 2. Bundesliga.
`,
  },
  {
    id: "super-league-verein-2025",
    prompt: "Nenne einen Verein, der in der Saison 2025/26 in der Schweizer Super League spielt.",
    topic: "Fussball",
    difficulty: 2,
    sources: [wiki("Super League 2025/26")],
    list: `
K FC Basel | Basel; FCB
K BSC Young Boys | Young Boys; YB
K FC Zürich | FCZ
F Grasshopper Club Zürich | GC; Grasshoppers; GC Zürich
F FC Luzern | Luzern
F FC St. Gallen | St. Gallen
F FC Lugano | Lugano
F Servette FC | Servette; Servette Genf
F FC Sion | Sion; FC Sitten
U FC Lausanne-Sport | Lausanne-Sport; Lausanne
U FC Winterthur | Winterthur
U FC Thun | Thun
x Yverdon-Sport | Yverdon | Yverdon ist 2025 in die Challenge League abgestiegen.
x FC Aarau | Aarau | Aarau spielt 2025/26 in der Challenge League.
x Neuchâtel Xamax | Xamax | Xamax spielt 2025/26 in der Challenge League.
x FC Schaffhausen | Schaffhausen | Spielt nicht in der Super League.
x FC Vaduz | Vaduz | Vaduz spielt 2025/26 in der Challenge League.
`,
  },
]);
