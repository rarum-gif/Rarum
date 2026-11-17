import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("marken-wirtschaft", [
  {
    id: "vw-konzern-marke",
    prompt: "Nenne eine Marke, die zum Volkswagen-Konzern gehört.",
    topic: "Automobil",
    difficulty: 2,
    sources: [wiki("Volkswagen AG")],
    list: `
K Volkswagen | VW
K Audi
K Porsche
F Škoda | Skoda
F SEAT | Seat
F Lamborghini
F Bentley
F Cupra
U Ducati
U MAN | MAN Truck & Bus
U Scania
R Traton
R Navistar | International
R Bugatti | Bugatti Rimac | Gehört heute zu Bugatti Rimac – Porsche ist daran beteiligt.
R Moia
R Cariad
R PowerCo
R Elli
R Italdesign
R Volkswagen Nutzfahrzeuge | VW Nutzfahrzeuge
R Scout Motors | Scout
V Rimac | | Porsche ist an Rimac beteiligt.
x BMW | | BMW ist ein eigener Konzern.
x Mercedes-Benz | Mercedes | Mercedes-Benz ist ein eigener Konzern.
x Rolls-Royce | | Rolls-Royce gehört zu BMW.
x Mini | | Mini gehört zu BMW.
x Opel | | Opel gehört zu Stellantis.
x Fiat | | Fiat gehört zu Stellantis.
x Ferrari | | Ferrari ist eigenständig.
x Smart | | Smart gehört zu Mercedes-Benz und Geely.
x Volvo | | Volvo gehört zu Geely.
x Maserati | | Maserati gehört zu Stellantis.
`,
  },
  {
    id: "porsche-modell",
    prompt: "Nenne ein Automodell von Porsche.",
    topic: "Automobil",
    difficulty: 3,
    sources: [wiki("Porsche")],
    list: `
K 911 | Porsche 911; Elfer; Neunelfer; Carrera
K Cayenne
F Panamera
F Macan
F Taycan
F Boxster | 718 Boxster
F Cayman | 718 Cayman
F 356 | Porsche 356
F Carrera GT
F 918 Spyder | 918
U 718 | | Heute die Modellreihe für Boxster und Cayman.
U 944
U 928
U 924
U 959
U 914
U 912
U 968
U 550 Spyder | 550
U 911 Turbo | Turbo
U 911 GT3 | GT3
U 911 Targa | Targa
U Taycan Cross Turismo
U Cayenne Coupé
R 904 | Carrera GTS
R 917
R 935
R 956
R 962
R 919 Hybrid | 919
R 908
R 906
R 910
R 936
R 961
R 993 | | Interne Bezeichnung einer 911-Generation.
R 964 | | Interne Bezeichnung einer 911-Generation.
R 996 | | Interne Bezeichnung einer 911-Generation.
R 997 | | Interne Bezeichnung einer 911-Generation.
R 991 | | Interne Bezeichnung einer 911-Generation.
R 992 | | Interne Bezeichnung einer 911-Generation.
R 901 | | Ursprünglicher Name des 911.
R 911 Dakar | Dakar
R 911 S/T
R 911 R
R Speedster | 356 Speedster
R 718 Spyder
R 718 RS 60 Spyder | RS 60
R Mission E | | Die Studie, aus der der Taycan wurde.
R Mission X
R Junior | Porsche-Diesel Junior | Ein Porsche-Traktor.
R Standard | Porsche-Diesel Standard | Ein Porsche-Traktor.
R Super | Porsche-Diesel Super | Ein Porsche-Traktor.
R Master | Porsche-Diesel Master | Ein Porsche-Traktor.
R Typ 64 | Porsche 64
R Lohner-Porsche | | Das erste von Ferdinand Porsche konstruierte Auto.
R 989 | | Ein nie gebauter Prototyp.
x Golf | VW Golf | Der Golf ist ein Volkswagen.
x Käfer | VW Käfer | Den Käfer konstruierte Ferdinand Porsche – gebaut wurde er aber von Volkswagen.
x Testarossa | | Ein Ferrari.
x Countach | | Ein Lamborghini.
x R8 | Audi R8 | Ein Audi.
x M3 | BMW M3 | Ein BMW.
x 4C | | Ein Alfa Romeo.
`,
  },
  {
    id: "nestle-marke",
    prompt: "Nenne eine Marke, die zu Nestlé gehört.",
    topic: "Marken",
    difficulty: 2,
    sources: [wiki("Nestlé")],
    list: `
K Nescafé | Nescafe
K Nespresso
K KitKat | Kit Kat
K Maggi
F Smarties
F Nesquik
F Thomy
F Cailler
F Perrier
F S.Pellegrino | San Pellegrino; Sanpellegrino
F Vittel
F Henniez
F Purina
F Felix
F Buitoni
F After Eight
F Lion
F Cheerios | | Ausserhalb Nordamerikas über Cereal Partners Worldwide, ein Gemeinschaftsunternehmen mit General Mills.
F Garden Gourmet
F Gerber
F Frigor
U Acqua Panna
U Friskies
U Gourmet
U Pro Plan
U Beneful
U Coffee-Mate | Coffeemate
U Nido
U Cerelac
U Beba
U Milkybar
U Aero
U Quality Street
U Polo
U Rolo
U Toll House
U Stouffer's
U Wagner | | Die Tiefkühlpizza-Marke.
U Buitoni
U Chocapic
U Fitness | | Die Cerealien-Marke.
U Clusters
U Cini Minis
U Lion Cereals
U Ricoré
U Caro
U Blue Bottle Coffee | Blue Bottle
U Starbucks at Home | Starbucks | Nestlé verkauft Starbucks-Kaffee für zu Hause unter Lizenz.
U Nature's Bounty
U Garden of Life
U Pure Encapsulations
U Vital Proteins
U Orgain
U Boost
U Optifast
U Resource
U Nutren
U NAN
U BEBA
U Totole
U Dancow
U Milo
U Nestea | | Lange gemeinsam mit Coca-Cola, die Marke gehört weiter Nestlé.
U Dolce Gusto | Nescafé Dolce Gusto
U Galak
U Crunch
U Baci Perugina | Baci; Perugina
U Mövenpick | | Bei Kaffee hat Nestlé die Lizenz – das Eis gehört zu Froneri.
U Hot Pockets
U Lean Cuisine
U DiGiorno
U Tombstone
U Sweet Earth
U Pure Life
U Contrex
U Hépar | Hepar
U Levissima
U Kitkat Chunky
U Nescafé Gold
U Nescafé Azera
U Nesvita
U Purina ONE
U Cat Chow
U Dog Chow
U Fancy Feast
U Tidy Cats
U Merrick
U Lily's Kitchen
x Lindt | | Lindt & Sprüngli ist eigenständig.
x Toblerone | | Toblerone gehört zu Mondelēz.
x Milka | | Milka gehört zu Mondelēz.
x Ovomaltine | Ovo | Ovomaltine gehört zu Wander (Associated British Foods).
x Rivella | | Rivella ist eigenständig.
x Coca-Cola | | Ein eigener Konzern.
x Nutella | | Nutella gehört zu Ferrero.
x Kinder | Kinder Schokolade | Kinder gehört zu Ferrero.
x Ricola | | Ricola ist eigenständig.
x Emmi | | Emmi ist eigenständig.
x Red Bull | | Red Bull ist eigenständig.
x Knorr | | Knorr gehört zu Unilever.
x Pringles | | Pringles gehört zu Kellogg (Kellanova).
`,
  },
]);
