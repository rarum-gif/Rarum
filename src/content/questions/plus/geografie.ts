import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("geografie", [
  {
    id: "us-bundesstaat",
    prompt: "Nenne einen Bundesstaat der USA.",
    topic: "Länder",
    difficulty: 1,
    sources: [wiki("Bundesstaat der Vereinigten Staaten")],
    list: `
K Kalifornien | California
K Texas
K Florida
K New York
K Hawaii
K Alaska
F Nevada
F Arizona
F Washington
F Colorado
F Illinois
F Georgia
F Massachusetts
F Michigan
F Ohio
F Louisiana
F Pennsylvania | Pennsylvanien
F New Jersey
F Utah
F Oregon
U Virginia
U North Carolina | Nord-Carolina; Nordkarolina
U South Carolina | Süd-Carolina; Südkarolina
U Tennessee
U Kentucky
U Alabama
U Mississippi
U Missouri
U Minnesota
U Wisconsin
U Indiana
U Iowa
U Kansas
U Oklahoma
U New Mexico | Neumexiko
U Montana
U Idaho
U Wyoming
U Arkansas
U Maryland
U Connecticut
U Maine
R Nebraska
R North Dakota | Nord-Dakota; Norddakota
R South Dakota | Süd-Dakota; Süddakota
R West Virginia
R Vermont
R New Hampshire
R Rhode Island
R Delaware
x Washington, D.C. | Washington DC; District of Columbia | Washington, D.C. ist ein Bundesdistrikt, kein Bundesstaat.
x Puerto Rico | | Puerto Rico ist ein Aussengebiet der USA, kein Bundesstaat.
x Guam | | Guam ist ein Aussengebiet der USA.
x Los Angeles | | Das ist eine Stadt in Kalifornien.
x Chicago | | Das ist eine Stadt in Illinois.
x Dakota | | Es gibt North Dakota und South Dakota.
x Carolina | | Es gibt North Carolina und South Carolina.
`,
  },
  {
    id: "binnenstaat",
    prompt: "Nenne ein Land ohne Zugang zum Meer.",
    topic: "Länder",
    difficulty: 3,
    sources: [wiki("Binnenstaat")],
    list: `
K Schweiz
K Österreich
F Liechtenstein
F Luxemburg
F Tschechien
F Slowakei
F Ungarn
F Serbien
F Nepal
F Mongolei
F Bolivien
F Paraguay
F Afghanistan
F Kasachstan
F Andorra
F San Marino
F Vatikanstadt | Vatikan
F Belarus | Weissrussland
U Moldau | Moldawien; Republik Moldau
U Nordmazedonien | Mazedonien
U Kosovo
U Armenien
U Aserbaidschan
U Usbekistan
U Turkmenistan
U Kirgisistan
U Tadschikistan
U Bhutan
U Laos
U Äthiopien
U Mali
U Niger
U Tschad
U Uganda
U Ruanda
U Simbabwe
U Sambia
U Botswana
R Burkina Faso
R Zentralafrikanische Republik
R Südsudan
R Burundi
R Malawi
R Lesotho
R Eswatini | Swasiland
x Bosnien und Herzegowina | Bosnien | Bosnien hat bei Neum einen kurzen Küstenabschnitt an der Adria.
x Demokratische Republik Kongo | Kongo | Der Kongo hat einen schmalen Zugang zum Atlantik.
x Jordanien | | Jordanien grenzt bei Akaba ans Rote Meer.
x Slowenien | | Slowenien hat einen kurzen Küstenabschnitt an der Adria.
x Irak | | Der Irak hat einen kurzen Zugang zum Persischen Golf.
x Deutschland | | Deutschland liegt an Nord- und Ostsee.
`,
  },
  {
    id: "hauptstadt-afrika",
    prompt: "Nenne die Hauptstadt eines afrikanischen Landes.",
    topic: "Hauptstädte",
    difficulty: 3,
    sources: [wiki("Liste der Hauptstädte der Erde")],
    list: `
K Kairo
K Nairobi
F Pretoria | | Südafrika hat drei Hauptstädte.
F Kapstadt | Cape Town | Südafrika hat drei Hauptstädte – Kapstadt ist Sitz des Parlaments.
F Rabat
F Tunis
F Addis Abeba | Addis Ababa
F Abuja
F Dakar
F Accra
F Algier
F Tripolis
F Khartum
F Kinshasa
F Luanda
F Harare
F Kampala
F Kigali
F Mogadischu
F Antananarivo | Tananarive
U Dodoma
U Windhoek
U Gaborone
U Lusaka
U Maputo
U Lilongwe
U Bamako
U Niamey
U Ouagadougou
U Yaoundé | Jaunde
U Bangui
U N'Djamena | Ndjamena
U Brazzaville
U Libreville
U Malabo
U Monrovia
U Freetown
U Conakry
U Bissau
U Banjul
U Nouakchott
U Lomé
U Porto-Novo
U Yamoussoukro
U Asmara
U Dschibuti | Djibouti
U Juba
U Maseru
R Bloemfontein | | Südafrika hat drei Hauptstädte – Bloemfontein ist Sitz der Justiz.
R Mbabane | | Verwaltungshauptstadt von Eswatini.
R Lobamba | | Königliche und legislative Hauptstadt von Eswatini.
R Gitega | | Seit 2019 Hauptstadt von Burundi.
R Praia
R Moroni
R Port Louis
R Victoria | | Hauptstadt der Seychellen.
R São Tomé | Sao Tome
x Lagos | | Lagos war bis 1991 Hauptstadt – heute ist es Abuja.
x Johannesburg | | Grösste Stadt Südafrikas, aber keine Hauptstadt.
x Casablanca | | Grösste Stadt Marokkos – die Hauptstadt ist Rabat.
x Daressalam | Dar es Salaam | Wichtigste Stadt Tansanias – die offizielle Hauptstadt ist Dodoma.
x Abidjan | | Wirtschaftszentrum der Elfenbeinküste – die Hauptstadt ist Yamoussoukro.
x Cotonou | | Regierungssitz von Benin – die Hauptstadt ist Porto-Novo.
x Bujumbura | | Bis 2019 Hauptstadt von Burundi – heute ist es Gitega.
x Marrakesch | | Die Hauptstadt Marokkos ist Rabat.
x Alexandria | | Die Hauptstadt Ägyptens ist Kairo.
x Sansibar | | Sansibar ist eine Inselgruppe Tansanias.
`,
  },
  {
    id: "griechische-insel",
    prompt: "Nenne eine griechische Insel.",
    topic: "Inseln",
    difficulty: 2,
    sources: [wiki("Liste griechischer Inseln")],
    list: `
K Kreta
K Rhodos
K Korfu
K Santorini | Santorin; Thira
K Mykonos
K Naxos
F Kos
F Zakynthos | Zante
F Kefalonia | Kephalonia
F Lesbos
F Paros
F Chios
F Samos
F Euböa | Evia; Euboea
F Ithaka
F Lefkada | Lefkas
F Skiathos
F Thassos | Thasos
F Ägina | Aegina
F Hydra
F Milos
F Patmos
U Skopelos
U Alonissos | Alonnisos
U Skyros
U Samothraki | Samothrake
U Limnos | Lemnos
U Ikaria
U Leros
U Kalymnos
U Karpathos
U Symi
U Tilos
U Nisyros
U Astypalea | Astypalaia
U Sifnos
U Serifos
U Kythnos
U Kea | Tzia
U Syros
U Tinos
U Andros
U Amorgos
U Ios
U Folegandros
U Antiparos
U Delos
U Spetses
U Poros
U Kythira
U Paxos | Paxi
U Salamis
U Kastellorizo | Megisti
U Spinalonga
R Sikinos
R Anafi
R Kimolos
R Koufonisia | Koufonissi
R Schinoussa
R Iraklia
R Donoussa
R Antikythira
R Elafonisos
R Antipaxos
R Ereikoussa
R Othonoi
R Mathraki
R Meganisi
R Chalki
R Kasos
R Gavdos
R Psara
R Inousses
R Fourni
R Agios Efstratios
R Lipsi
R Agathonisi
R Pserimos
R Telendos
R Agistri
R Skorpios
R Kalamos
R Kastos
R Chrysi
R Gramvousa
R Thirasia
R Nea Kameni
R Dia
V Arki
V Strofades
V Sapientza
V Atokos
V Makronisos
V Gyaros
V Psathoura
V Kyra Panagia
V Peristera
V Skantzoura
V Palea Kameni
V Polyaigos
V Despotiko
V Fidonisi
x Zypern | | Zypern ist ein eigener Staat.
x Malta | | Malta ist ein eigener Staat.
x Sizilien | | Sizilien gehört zu Italien.
x Sardinien | | Sardinien gehört zu Italien.
x Mallorca | | Mallorca gehört zu Spanien.
x Bodrum | | Bodrum liegt auf dem türkischen Festland.
x Chalkidiki | | Chalkidiki ist eine Halbinsel.
`,
  },
]);
