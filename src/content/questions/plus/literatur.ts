import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("literatur", [
  {
    id: "stephen-king-werk",
    prompt: "Nenne einen Roman oder eine Novelle von Stephen King.",
    topic: "Autoren",
    difficulty: 3,
    sources: [wiki("Stephen King")],
    list: `
K Es | It
K Shining | The Shining
K Friedhof der Kuscheltiere | Pet Sematary
K Carrie
K The Green Mile | Green Mile
F Sie | Misery
F The Stand | The Stand – Das letzte Gefecht; Das letzte Gefecht
F Cujo
F Christine
F Brennen muss Salem | 'Salem's Lot; Salem's Lot
F Der dunkle Turm | The Dark Tower; Dunkle Turm
F Die Arena | Under the Dome
F Der Anschlag | 11/22/63; 11.22.63
F Doctor Sleep
F Die Verurteilten | Pin-up, oder: Rita Hayworth und die Erlösung von Shawshank; Rita Hayworth and Shawshank Redemption; Shawshank | Die Novelle, die als „Die Verurteilten“ verfilmt wurde.
F Die Leiche | The Body; Stand by Me | Die Novelle hinter „Stand by Me“.
F Dead Zone | The Dead Zone; Dead Zone – Das Attentat
F Feuerkind | Firestarter
F Das Institut | The Institute
F Der Outsider | The Outsider
#auto
Das Monstrum | The Tommyknockers; Tommyknockers
Stark | The Dark Half
In einer kleinen Stadt | Needful Things
Das Spiel | Gerald's Game
Dolores | Dolores Claiborne
Schlaflos | Insomnia
Das Bild | Rose Madder
Desperation
Regulator | The Regulators
Sara | Bag of Bones
Das Mädchen | The Girl Who Loved Tom Gordon
Duddits | Dreamcatcher
Puls | Cell
Love | Lisey's Story
Wahn | Duma Key
Joyland
Mr. Mercedes
Finderlohn | Finders Keepers
Mind Control | End of Watch
Revival
Sleeping Beauties
Später | Later
Billy Summers
Fairy Tale
Holly
Never Flinch
Amok | Rage
Todesmarsch | The Long Walk
Sprengstoff | Roadwork
Menschenjagd | The Running Man; Running Man
Der Fluch | Thinner
Blaze
Schwarz | The Gunslinger | Band 1 des Dunklen Turms.
Drei | The Drawing of the Three | Band 2 des Dunklen Turms.
tot. | The Waste Lands | Band 3 des Dunklen Turms.
Glas | Wizard and Glass | Band 4 des Dunklen Turms.
Wolfsmond | Wolves of the Calla
Susannah | Song of Susannah
Der Turm | The Dark Tower VII
Wind | The Wind Through the Keyhole
Die Augen des Drachen | The Eyes of the Dragon
Der Talisman | The Talisman | Gemeinsam mit Peter Straub.
Das schwarze Haus | Black House | Gemeinsam mit Peter Straub.
Colorado Kid | The Colorado Kid
Die Langoliers | The Langoliers
Das geheime Fenster | Secret Window, Secret Garden; Das heimliche Fenster
Der Musterschüler | Apt Pupil
Atemtechnik | The Breathing Method
Der Nebel | The Mist
Gwendys Wunschkasten | Gwendy's Button Box
Erhebung | Elevation
Blutige Nachrichten | If It Bleeds
Raststätte Mile 81 | Mile 81
Big Driver
Eine gute Ehe | A Good Marriage
Kinder des Zorns | Children of the Corn
Quitters, Inc.
Der Mann im schwarzen Anzug | The Man in the Black Suit
Das Leben des Chuck | The Life of Chuck
Der Rasenmähermann | The Lawnmower Man
Danse Macabre
Das Leben und das Schreiben | On Writing
Nachtschicht | Night Shift
Im Kabinett des Todes | Everything's Eventual
Frühling, Sommer, Herbst und Tod | Different Seasons
Zwischen Nacht und Dunkel | Full Dark, No Stars
Basar der bösen Träume | The Bazaar of Bad Dreams
Der Gesang der Toten | Skeleton Crew
Der Werwolf von Tarker Mills | Cycle of the Werewolf
x Der Exorzist | | Ein Roman von William Peter Blatty.
x Das Schweigen der Lämmer | | Ein Roman von Thomas Harris.
x Dracula | | Ein Roman von Bram Stoker.
x Frankenstein | | Ein Roman von Mary Shelley.
x Interview mit einem Vampir | | Ein Roman von Anne Rice.
`,
  },
  {
    id: "goethe-werk",
    prompt: "Nenne ein Werk von Johann Wolfgang von Goethe.",
    topic: "Klassiker",
    difficulty: 3,
    sources: [wiki("Johann Wolfgang von Goethe")],
    list: `
K Faust | Faust I; Faust. Der Tragödie erster Teil; Faust II; Faust. Der Tragödie zweiter Teil
K Die Leiden des jungen Werthers | Werther; Die Leiden des jungen Werther
F Der Erlkönig | Erlkönig
F Der Zauberlehrling | Zauberlehrling
F Götz von Berlichingen
F Iphigenie auf Tauris | Iphigenie
F Egmont
F Prometheus
F Wilhelm Meisters Lehrjahre | Wilhelm Meister
F Die Wahlverwandtschaften
F Torquato Tasso | Tasso
F Heidenröslein | Sah ein Knab ein Röslein stehn
F Italienische Reise
U West-östlicher Divan
U Dichtung und Wahrheit | Aus meinem Leben. Dichtung und Wahrheit
U Wilhelm Meisters Wanderjahre
U Hermann und Dorothea
U Reineke Fuchs
U Urfaust
U Wandrers Nachtlied | Über allen Gipfeln ist Ruh; Ein Gleiches
U Willkommen und Abschied
U Clavigo
U Stella
U Zur Farbenlehre | Farbenlehre
U Römische Elegien
U Der König in Thule
U Mignon | Kennst du das Land
U Ganymed
U Gesang der Geister über den Wassern
U Das Göttliche | Edel sei der Mensch
U Mailied
U An den Mond
R Der Fischer
R Gefunden
R Grenzen der Menschheit
R Die Braut von Korinth
R Der Gott und die Bajadere
R Der Schatzgräber
R Die Metamorphose der Pflanzen
R Venezianische Epigramme
R Xenien | | Gemeinsam mit Schiller.
R Novelle
R Die natürliche Tochter
R Die Mitschuldigen
R Die Laune des Verliebten
R Marienbader Elegie | Elegie
R Trilogie der Leidenschaft
R Campagne in Frankreich
R Maximen und Reflexionen
R Wilhelm Meisters theatralische Sendung
R Unterhaltungen deutscher Ausgewanderten
R Das Märchen
V Der Bürgergeneral
V Der Groß-Cophta
V Pandora
V Des Epimenides Erwachen
V Satyros
V Erwin und Elmire
V Claudine von Villa Bella
V Lila
V Der Triumph der Empfindsamkeit
V Die Vögel
V Die Geschwister
V Jery und Bätely
V Chinesisch-deutsche Jahres- und Tageszeiten
V Rastlose Liebe
V Nähe des Geliebten | Ich denke dein
V Der Sänger
V Der getreue Eckart
V Der Totentanz
V Der Rattenfänger
V Die wandelnde Glocke
V Der neue Amadis
V Seefahrt
V Harzreise im Winter
V Auf dem See
V Dauer im Wechsel
V Selige Sehnsucht
V Gingo biloba | Ginkgo biloba; Ginkgo
V Neue Liebe, neues Leben
V Annette
V Die Aufgeregten
V Hanswursts Hochzeit
V Mahomet
V Tancred
V Paläophron und Neoterpe
V Die Fischerin
V Scherz, List und Rache
x Die Räuber | | Ein Drama von Friedrich Schiller.
x Wilhelm Tell | | Ein Drama von Friedrich Schiller.
x Kabale und Liebe | | Ein Drama von Friedrich Schiller.
x Maria Stuart | | Ein Drama von Friedrich Schiller.
x Die Glocke | Das Lied von der Glocke | Ein Gedicht von Friedrich Schiller.
x Die Bürgschaft | | Eine Ballade von Friedrich Schiller.
x Nathan der Weise | | Ein Drama von Gotthold Ephraim Lessing.
x Emilia Galotti | | Ein Drama von Gotthold Ephraim Lessing.
x Woyzeck | | Ein Drama von Georg Büchner.
`,
  },
  {
    id: "jane-austen-roman",
    prompt: "Nenne einen Roman von Jane Austen.",
    topic: "Klassiker",
    difficulty: 3,
    sources: [wiki("Jane Austen")],
    list: `
K Stolz und Vorurteil | Pride and Prejudice
F Emma
F Verstand und Gefühl | Sense and Sensibility; Gefühl und Verstand; Vernunft und Gefühl
U Überredung | Persuasion; Anne Elliot
U Mansfield Park
U Die Abtei von Northanger | Northanger Abbey; Kloster Northanger
R Lady Susan
V Sanditon
V Die Watsons | The Watsons
x Jane Eyre | | Ein Roman von Charlotte Brontë.
x Sturmhöhe | Wuthering Heights | Ein Roman von Emily Brontë.
x Middlemarch | | Ein Roman von George Eliot.
x Bridget Jones | Bridget Jones' Diary | Ein Roman von Helen Fielding – allerdings frei nach „Stolz und Vorurteil“.
`,
  },
  {
    id: "duerrenmatt-werk",
    prompt: "Nenne ein Werk von Friedrich Dürrenmatt.",
    topic: "Klassiker",
    difficulty: 3,
    sources: [wiki("Friedrich Dürrenmatt")],
    list: `
K Der Besuch der alten Dame | Besuch der alten Dame
K Die Physiker
F Der Richter und sein Henker
F Das Versprechen
F Der Verdacht
F Die Panne
F Romulus der Große | Romulus der Grosse
U Der Tunnel
U Die Ehe des Herrn Mississippi
U Ein Engel kommt nach Babylon
U Justiz
U Der Auftrag
U Grieche sucht Griechin
U Der Meteor
U Frank der Fünfte
R Die Wiedertäufer
R Es steht geschrieben
R Der Blinde
R Herkules und der Stall des Augias
R Das Unternehmen der Wega
R Der Doppelgänger
R Abendstunde im Spätherbst
R Die Stadt
R Pilatus
R Der Mitmacher
R Die Frist
R Achterloo
R Durcheinandertal
R Porträt eines Planeten
R König Johann
R Play Strindberg
R Titus Andronicus
R Theaterprobleme
R Stoffe
R Labyrinth
R Turmbau
R Der Winterkrieg in Tibet
R Mondfinsternis
R Minotaurus
R Der Prozess um des Esels Schatten
R Nächtliches Gespräch mit einem verachteten Menschen
R Die Falle
R Der Sturz
R Smithy
R Das Sterben der Pythia
R Midas oder Die schwarze Leinwand | Midas
R Der Hund
R Der Folterknecht
R Weihnacht
R Der Theaterdirektor
R Die Wurst
R Monstervortrag über Gerechtigkeit und Recht
R Der Hausierer
R Urfaust | | Dürrenmatts Bearbeitung von Goethes Urfaust.
R Woyzeck | | Dürrenmatts Bearbeitung von Büchners Woyzeck.
x Andorra | | Ein Drama von Max Frisch.
x Homo faber | | Ein Roman von Max Frisch.
x Biedermann und die Brandstifter | | Ein Drama von Max Frisch.
x Stiller | | Ein Roman von Max Frisch.
x Mein Name sei Gantenbein | Gantenbein | Ein Roman von Max Frisch.
x Heidi | | Ein Roman von Johanna Spyri.
`,
  },
]);
