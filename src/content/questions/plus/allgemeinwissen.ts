import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("allgemeinwissen", [
  {
    id: "edelstein",
    prompt: "Nenne einen Edelstein oder Schmuckstein.",
    topic: "Weltwissen",
    difficulty: 1,
    sources: [wiki("Liste der Minerale und Edelsteine")],
    list: `
K Diamant
K Rubin
K Saphir
K Smaragd
F Amethyst
F Topas
F Opal
F Aquamarin
F Turmalin
F Granat
F Jade
F Türkis
F Perle | | Ein organischer Schmuckstein.
F Bernstein | | Ein organischer Schmuckstein.
F Lapislazuli | Lapis
F Onyx
F Achat
F Bergkristall
F Rosenquarz
F Citrin
F Peridot | Olivin
F Mondstein
F Tigerauge
F Malachit
#auto
Tansanit
Spinell
Zirkon
Alexandrit
Karneol
Hämatit
Jaspis
Chrysoberyll
Morganit
Heliodor
Iolith | Cordierit
Kunzit
Rhodochrosit
Sugilith
Larimar
Labradorit
Obsidian
Koralle | | Ein organischer Schmuckstein.
Beryll
Korund
Quarz
Rauchquarz
Chalcedon
Sardonyx
Andalusit
Titanit | Sphen
Demantoid
Tsavorit
Paraiba-Turmalin
Padparadscha
Benitoit
Taaffeit
Painit
Grandidierit
Jadeit
Nephrit
Fluorit
Apatit
Azurit
Chrysopras
Aventurin
Sodalith
Rhodonit
Charoit
Prasiolith
Ametrin
Kyanit | Disthen
Diopsid
Sonnenstein
Moissanit
Rubellit
Indigolith
Spessartin
Almandin
Pyrop
Hessonit
Rhodolith
Feueropal
Schwarzer Opal
Boulder-Opal
Gagat | Jet
Perlmutt
Ammolit
Serpentin
Amazonit
Variscit
Smithsonit
Prehnit
Sillimanit
Zoisit
Thulit
Euklas
Phenakit
Jeremejewit
Musgravit
Poudretteit
x Gold | | Gold ist ein Edelmetall.
x Silber | | Silber ist ein Edelmetall.
x Platin | | Platin ist ein Edelmetall.
x Zirkonia | | Zirkonia ist ein künstlicher Diamant-Ersatz, kein natürlicher Edelstein.
x Kristall | | Zu allgemein – gemeint ist vielleicht Bergkristall.
x Marmor | | Marmor ist ein Gestein, kein Edelstein.
x Granit | | Granit ist ein Gestein, kein Edelstein – gemeint ist vielleicht Granat.
`,
  },
  {
    id: "phobie",
    prompt: "Nenne eine Phobie (Fachbegriff oder deutscher Name).",
    topic: "Kurioses",
    difficulty: 3,
    sources: [wiki("Liste von Phobien")],
    list: `
K Arachnophobie | Spinnenangst; Angst vor Spinnen
K Klaustrophobie | Platzangst; Raumangst; Angst vor engen Räumen
K Akrophobie | Höhenangst; Angst vor Höhe
F Agoraphobie | Angst vor weiten Plätzen; Angst vor Menschenmengen
F Aviophobie | Flugangst; Aerophobie; Angst vor dem Fliegen
F Soziale Phobie | Sozialphobie; Soziophobie; soziale Angst
F Hydrophobie | Wasserscheu; Angst vor Wasser
F Xenophobie | Fremdenangst; Fremdenfeindlichkeit
F Homophobie
F Trypophobie | Angst vor Löchern
F Emetophobie | Angst vor dem Erbrechen
F Nyktophobie | Achluophobie; Skotophobie; Angst vor Dunkelheit; Dunkelangst
F Ophidiophobie | Schlangenangst; Angst vor Schlangen
F Kynophobie | Angst vor Hunden; Hundeangst
F Dentophobie | Zahnarztangst; Angst vor dem Zahnarzt; Odontophobie
F Coulrophobie | Angst vor Clowns; Clownangst
F Hämatophobie | Angst vor Blut; Hämophobie; Blutangst
F Trypanophobie | Angst vor Spritzen; Spritzenangst; Belonephobie
F Thanatophobie | Todesangst; Angst vor dem Tod
F Glossophobie | Lampenfieber; Redeangst; Angst vor dem Sprechen in der Öffentlichkeit
F Nomophobie | Angst, ohne Handy zu sein
#auto
Mysophobie | Angst vor Schmutz; Angst vor Keimen; Germophobie; Bakteriophobie
Apiphobie | Angst vor Bienen; Melissophobie
Ailurophobie | Angst vor Katzen; Felinophobie
Ornithophobie | Angst vor Vögeln
Entomophobie | Angst vor Insekten; Insektophobie
Musophobie | Angst vor Mäusen
Selachophobie | Angst vor Haien; Galeophobie
Thalassophobie | Angst vor dem Meer; Angst vor tiefem Wasser
Astraphobie | Angst vor Gewitter; Brontophobie; Keraunophobie
Pyrophobie | Angst vor Feuer
Iatrophobie | Angst vor Ärzten
Nosophobie | Angst vor Krankheiten; Hypochondrie
Philophobie | Angst vor der Liebe
Gamophobie | Angst vor der Ehe; Bindungsangst
Gerascophobie | Angst vor dem Älterwerden
Gephyrophobie | Angst vor Brücken
Amaxophobie | Angst vor dem Autofahren
Siderodromophobie | Angst vor Zügen
Ergophobie | Angst vor der Arbeit
Hexakosioihexekontahexaphobie | Angst vor der Zahl 666
Triskaidekaphobie | Angst vor der Zahl 13
Paraskavedekatriaphobie | Angst vor Freitag, dem 13.; Paraskevidekatriaphobie
Hippopotomonstrosesquippedaliophobie | Angst vor langen Wörtern
Arachibutyrophobie | Angst, dass Erdnussbutter am Gaumen kleben bleibt
Anatidaephobie | Angst, von einer Ente beobachtet zu werden
Pogonophobie | Angst vor Bärten
Phobophobie | Angst vor der Angst
Autophobie | Angst vor dem Alleinsein; Monophobie; Eremophobie
Anthophobie | Angst vor Blumen
Dendrophobie | Angst vor Bäumen
Botanophobie | Angst vor Pflanzen
Chronophobie | Angst vor der Zeit
Somniphobie | Angst vor dem Schlafen; Hypnophobie
Oneirophobie | Angst vor Träumen
Algophobie | Angst vor Schmerzen
Dysmorphophobie | Körperdysmorphe Störung
Ablutophobie | Angst vor dem Waschen
Chionophobie | Angst vor Schnee
Heliophobie | Angst vor der Sonne
Anemophobie | Angst vor Wind
Ombrophobie | Angst vor Regen
Basophobie | Angst vor dem Fallen; Sturzangst
Bathophobie | Angst vor Tiefe
Kenophobie | Angst vor leeren Räumen
Katsaridaphobie | Angst vor Kakerlaken
Vermiphobie | Angst vor Würmern
Ranidaphobie | Angst vor Fröschen
Batrachophobie | Angst vor Amphibien
Herpetophobie | Angst vor Reptilien
Equinophobie | Angst vor Pferden; Hippophobie
Ichthyophobie | Angst vor Fischen
Chiroptophobie | Angst vor Fledermäusen
Lepidopterophobie | Angst vor Schmetterlingen
Spheksophobie | Angst vor Wespen
Myrmecophobie | Angst vor Ameisen
Pediophobie | Angst vor Puppen
Automatonophobie | Angst vor Puppen und Figuren
Masklophobie | Angst vor Masken
Phasmophobie | Angst vor Geistern; Spektrophobie
Demonophobie | Angst vor Dämonen
Hadephobie | Angst vor der Hölle
Taphephobie | Angst, lebendig begraben zu werden
Nekrophobie | Angst vor Leichen
Koimetrophobie | Angst vor Friedhöfen
Atychiphobie | Versagensangst; Angst vor dem Versagen
Kakorrhaphiophobie | Angst vor Misserfolg
Ergasiophobie | Angst vor Verantwortung
Ephebiphobie | Angst vor Jugendlichen
Pädophobie | Angst vor Kindern
Gerontophobie | Angst vor alten Menschen
Gynophobie | Angst vor Frauen
Androphobie | Angst vor Männern
Genophobie | Angst vor Sex; Coitophobie
Tokophobie | Angst vor der Geburt
Ochlophobie | Angst vor Menschenmengen; Demophobie; Enochlophobie
Anthropophobie | Menschenangst
Haphephobie | Angst vor Berührung
Chrematophobie | Angst vor Geld
Plutophobie | Angst vor Reichtum
Bibliophobie | Angst vor Büchern
Cyberphobie | Angst vor Computern; Technophobie
Telefonphobie | Angst vor dem Telefonieren; Telephonophobie
Fonophobie | Angst vor Lärm; Phonophobie; Ligyrophobie
Agyrophobie | Angst, Strassen zu überqueren
Klimakophobie | Angst vor Treppen
Elevatophobie | Angst vor Aufzügen; Liftangst
Kathisophobie | Angst vor dem Sitzen
Stasiphobie | Angst vor dem Stehen
Hodophobie | Angst vor Reisen
Nostophobie | Angst vor der Heimkehr
Ecophobie | Angst vor dem eigenen Zuhause
Megalophobie | Angst vor grossen Objekten
Mikrophobie | Angst vor kleinen Dingen
Tachophobie | Angst vor Geschwindigkeit
Kinetophobie | Angst vor Bewegung
Chromophobie | Angst vor Farben
Leukophobie | Angst vor der Farbe Weiss
Melanophobie | Angst vor der Farbe Schwarz
Xanthophobie | Angst vor der Farbe Gelb
Erythrophobie | Angst vor dem Erröten; Errötungsangst
Lachanophobie | Angst vor Gemüse
Mageirocophobie | Angst vor dem Kochen
Cibophobie | Angst vor Essen; Sitophobie
Alektorophobie | Angst vor Hühnern
Pteronophobie | Angst vor Federn
Lilapsophobie | Angst vor Tornados
Seismophobie | Angst vor Erdbeben
Kosmikophobie | Angst vor dem Weltall; Astrophobie
Selenophobie | Angst vor dem Mond
Eisoptrophobie | Angst vor Spiegeln; Spektrophobie
Nephophobie | Angst vor Wolken
Kymophobie | Angst vor Wellen
Limnophobie | Angst vor Seen
Potamophobie | Angst vor Flüssen
Hylophobie | Angst vor Wäldern
Bromidrophobie | Angst vor Körpergeruch
Osmophobie | Angst vor Gerüchen
Deipnophobie | Angst vor Tischgesprächen
Optophobie | Angst, die Augen zu öffnen
Ommatophobie | Angst vor Augen
Dermatophobie | Angst vor Hautkrankheiten
Kardiophobie | Herzangst; Herzphobie
Karzinophobie | Krebsangst; Angst vor Krebs
Tomophobie | Angst vor Operationen
Pharmakophobie | Angst vor Medikamenten
Vakzinophobie | Angst vor Impfungen
Radiophobie | Angst vor Strahlung
Ballistophobie | Angst vor Kugeln
Hoplophobie | Angst vor Waffen
Polemophobie | Angst vor Krieg
Nukleomitophobie | Angst vor Atombomben
Theophobie | Angst vor Gott
Hierophobie | Angst vor Priestern
Islamophobie
Judäophobie | Antisemitismus
Transphobie
Biphobie
Chorophobie | Angst vor dem Tanzen
Melophobie | Angst vor Musik
Verbophobie | Angst vor Wörtern
Arithmophobie | Angst vor Zahlen; Numerophobie
Didaskaleinophobie | Angst vor der Schule; Schulangst; Scolionophobie
Testophobie | Prüfungsangst
Hedonophobie | Angst vor Vergnügen
Euphobie | Angst vor guten Nachrichten
Gelotophobie | Angst, ausgelacht zu werden
Katagelophobie | Angst, lächerlich gemacht zu werden
Allodoxaphobie | Angst vor Meinungen
Ideophobie | Angst vor Ideen
Neophobie | Angst vor Neuem
Metathesiophobie | Angst vor Veränderungen
Decidophobie | Angst vor Entscheidungen
Kainolophobie | Angst vor Neuheiten
Pantophobie | Angst vor allem; Panphobie
x Panikattacke | Panikstörung | Eine Panikstörung ist keine Phobie im engeren Sinn.
x Depression | | Eine Depression ist keine Phobie.
x Angst | | Zu allgemein – nenne eine bestimmte Phobie.
x Stress | | Stress ist keine Phobie.
`,
  },
]);
