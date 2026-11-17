import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("kunst-kultur", [
  {
    id: "van-gogh-gemaelde",
    prompt: "Nenne ein Gemälde von Vincent van Gogh.",
    topic: "Gemälde",
    difficulty: 3,
    sources: [wiki("Liste der Gemälde von Vincent van Gogh")],
    list: `
K Sternennacht | Die Sternennacht; The Starry Night
K Sonnenblumen | Die Sonnenblumen; Zwölf Sonnenblumen; Vierzehn Sonnenblumen
K Selbstbildnis mit verbundenem Ohr | Selbstporträt mit verbundenem Ohr
F Caféterrasse am Abend | Caféterrasse bei Nacht; Nachtcafé-Terrasse; Café Terrasse
F Das Schlafzimmer | Schlafzimmer in Arles; Vincents Schlafzimmer in Arles
F Die Kartoffelesser | Kartoffelesser
F Weizenfeld mit Krähen | Kornfeld mit Krähen; Weizenfeld mit Raben; Kornfeld mit Raben
F Sternennacht über der Rhône | Sternennacht über der Rhone
F Mandelblüte | Blühende Mandelbaumzweige; Mandelbaumzweige
F Schwertlilien | Iris; Irises
F Das Nachtcafé | Nachtcafé
F Bildnis des Dr. Gachet | Dr. Gachet; Porträt des Dr. Gachet
F Selbstbildnis | Selbstporträt | Van Gogh malte über 35 Selbstbildnisse.
#auto
Die Brücke von Langlois | Langlois-Brücke; Zugbrücke in Arles
Das gelbe Haus | Gelbes Haus; Die Straße
Weizenfeld mit Zypressen | Kornfeld mit Zypressen
Zypressen
Der Sämann | Sämann bei Sonnenuntergang
Die Kirche von Auvers | Kirche in Auvers
Vincents Stuhl | Van Goghs Stuhl
Gauguins Stuhl | Gauguins Sessel
Le Moulin de la Galette | Moulin de la Galette
Ein Paar Schuhe | Schuhe
Die Arlesierin | L'Arlésienne
Bildnis des Postmeisters Joseph Roulin | Joseph Roulin; Der Briefträger
La Berceuse | Augustine Roulin
Der Zuave
Die Ernte | Erntezeit
Fischerboote am Strand von Saintes-Maries | Fischerboote am Strand
Pfirsichbäume in Blüte
Der rosa Pfirsichbaum
Olivenbäume | Olivenhain
Weg mit Zypresse und Stern | Straße mit Zypresse und Stern
Pietà (nach Delacroix) | Pietà
Der barmherzige Samariter (nach Delacroix) | Der barmherzige Samariter
Erste Schritte (nach Millet) | Erste Schritte
Die Mittagsruhe (nach Millet) | Mittagsruhe; Siesta
Schädel mit brennender Zigarette | Totenkopf mit brennender Zigarette
Selbstbildnis mit Strohhut
Selbstbildnis mit grauem Filzhut
Bildnis des Père Tanguy | Père Tanguy
Blühender Pflaumenbaum (nach Hiroshige) | Japonaiserie; Blühender Pflaumengarten
Die Kurtisane (nach Eisen) | Die Kurtisane
Stillleben mit Bibel | Stillleben mit offener Bibel
Brücke im Regen (nach Hiroshige) | Brücke im Regen
Der Gefängnishof | Rundgang der Gefangenen
Der Hof des Spitals in Arles | Das Krankenhaus in Arles
Der Garten der Heilanstalt | Garten der Heilanstalt Saint-Paul
Bildnis Eugène Boch | Der Dichter; Eugène Boch
Mohnfeld | Mohnblumenfeld
Weißes Haus bei Nacht | Weisses Haus bei Nacht
Strohgedeckte Hütten in Cordeville | Strohdächer in Cordeville
Landschaft bei Auvers im Regen
Daubignys Garten
Baumwurzeln
Bildnis Adeline Ravoux | Adeline Ravoux
Die Alyscamps | Allee der Alyscamps
Der rote Weinberg | Rote Weinberge bei Arles; Roter Weinberg | Das einzige Bild, das van Gogh zu Lebzeiten nachweislich verkaufte.
Der Weber | Weber am Webstuhl
Bauernhäuser in Nuenen | Die Hütte
Bauernfrau
Stillleben mit Äpfeln
Vase mit Zinnien
Rosen | Vase mit Rosen
Vase mit Pfingstrosen
Vase mit Gladiolen
Die Pfarrkirche von Nuenen | Kirche in Nuenen
Der alte Turm von Nuenen
Kopf einer Bäuerin
Agostina Segatori im Café du Tambourin | Café du Tambourin
Restaurant de la Sirène
Montmartre
Gemüsegärten auf dem Montmartre
Blick auf Paris von Montmartre
Die Brücke von Asnières
Ein Weizenfeld mit Zypressen
Weizenfeld mit Mäher | Der Schnitter
Grüne Weizenfelder
Weizenfelder bei Auvers
Unter grauem Himmel
Die Ebene von Auvers
Felder mit Mohn
Garten in Arles | Blühender Garten
Obstgarten in Blüte | Blühender Obstgarten
Die Zugbrücke
Tarascon-Postkutsche | Die Postkutsche von Tarascon
Der Maler auf dem Weg zur Arbeit
Die Steinbrecher
Sonnenuntergang bei Montmajour
Die Bucht von Saintes-Maries | Meer bei Saintes-Maries
Mousmé | La Mousmé
Bildnis Patience Escalier | Patience Escalier
Zwei Liebespaare
Bildnis des Armand Roulin | Armand Roulin
Bildnis des Camille Roulin | Camille Roulin
Marcelle Roulin
Bildnis Madame Ginoux | Madame Ginoux
Bildnis Doktor Félix Rey | Félix Rey
Selbstbildnis mit Pfeife und verbundenem Ohr
Selbstbildnis vor der Staffelei
Selbstbildnis (Saint-Rémy) | Selbstbildnis 1889
Die Nacht (nach Millet)
Der Wald
Unterholz
Efeu
Eingang zu einem Steinbruch
Die Berge von Saint-Rémy | Berge bei Saint-Rémy
Olivenpflücken | Frauen beim Olivenpflücken
Zwei Pappeln
Kastanienzweige in Blüte | Blühende Kastanienzweige
Rosa Rosen
Stillleben mit Quitten
Schmetterlinge und Mohnblumen
Der Totenkopf
Der Postbote
Ein Feld mit Zypressen
#end
x Mona Lisa | | Gemalt von Leonardo da Vinci.
x Der Schrei | | Gemalt von Edvard Munch.
x Seerosen | | Gemalt von Claude Monet.
x Impression, Sonnenaufgang | | Gemalt von Claude Monet.
x Der Kuss | | Gemalt von Gustav Klimt.
x Die Geburt der Venus | | Gemalt von Sandro Botticelli.
x Guernica | | Gemalt von Pablo Picasso.
x Das Mädchen mit dem Perlenohrring | | Gemalt von Jan Vermeer.
`,
  },
  {
    id: "louvre-werk",
    prompt: "Nenne ein berühmtes Kunstwerk, das im Louvre in Paris zu sehen ist.",
    topic: "Museen",
    difficulty: 3,
    sources: [wiki("Louvre")],
    list: `
K Mona Lisa | La Gioconda; La Joconde
K Venus von Milo | Aphrodite von Milos
F Nike von Samothrake | Siegesgöttin von Samothrake
F Die Freiheit führt das Volk | Die Freiheit führt das Volk an
F Das Floß der Medusa | Das Floss der Medusa
F Die Krönung Napoleons | Die Krönung Napoleons I.; Le Sacre de Napoléon
F Die Hochzeit zu Kana
F Codex Hammurapi | Codex Hammurabi; Stele des Hammurabi
F Der Schwur der Horatier
F Die große Odaliske | Grosse Odaliske
F Die Spitzenklöpplerin
F Sterbender Sklave
U Felsgrottenmadonna | Madonna in der Felsgrotte
U Anna selbdritt | Die heilige Anna selbdritt
U Johannes der Täufer | | Von Leonardo da Vinci.
U La Belle Ferronnière | Belle Ferronnière
U Rebellischer Sklave
U Amor und Psyche | Psyche durch den Kuss Amors erweckt
U Der Falschspieler mit dem Karo-Ass | Der Falschspieler
U Die Wahrsagerin | | Von Caravaggio oder Georges de La Tour – beide hängen im Louvre.
U Der Tod der Jungfrau | Tod Mariens
U Gabrielle d'Estrées und eine ihrer Schwestern | Gabrielle d'Estrées
U Die Einschiffung nach Kythera | Pilgerfahrt nach Kythera
U Der Geldwechsler und seine Frau
U Der Tod des Sardanapal
U Das türkische Bad
U Hockender Schreiber | Der Schreiber; Der sitzende Schreiber
U Lamassu | Assyrische Flügelstiere; Geflügelte Stiere
U Große Sphinx von Tanis | Sphinx von Tanis
U Selbstbildnis mit Distel | Dürer Selbstbildnis
U Die Madonna des Kanzlers Rolin
U Der Astronom
U Bathseba im Bade | Bathseba
U Der geschlachtete Ochse
U Die Pilger von Emmaus | Emmausmahl
U Erasmus von Rotterdam | | Bildnis von Hans Holbein dem Jüngeren.
U Bildnis des Baldassare Castiglione | Baldassare Castiglione
U Die Hirten von Arkadien | Et in Arcadia ego
U Gilles | Pierrot
U Borghesischer Fechter
U Schlafender Hermaphrodit
U Diana von Versailles
U Pferde von Marly | Marly-Pferde
U Statue des Ebih-Il | Ebih-Il
U Die Bettler | | Von Pieter Bruegel dem Älteren.
U Das Narrenschiff | | Von Hieronymus Bosch.
U Die schöne Gärtnerin | La Belle Jardinière
U Der heilige Michael | | Von Raffael.
U Kreuzigung | | Von Andrea Mantegna.
U Der heilige Sebastian | | Von Andrea Mantegna.
U Bildnis Ludwigs XIV. | Ludwig XIV. | Von Hyacinthe Rigaud.
U Madame Récamier | Bildnis der Madame Récamier
U Der Raub der Sabinerinnen | Die Sabinerinnen
U Oedipus und die Sphinx
U Die Badende von Valpinçon | Badende von Valpinçon
U Die Kronjuwelen | Kronjuwelen Frankreichs; Regent-Diamant
U Napoleon III. Gemächer | Appartements Napoléon III
R Die Grablegung | | Von Tizian.
R Das ländliche Konzert | Ländliches Konzert
R Der Mann mit dem Handschuh
R Die Jungfrau mit dem Kaninchen
R Die Madonna mit den Engeln | Maestà
R Die Schlacht von San Romano
R Diana nach dem Bade | Das Bad der Diana
R Die Pest von Jaffa | Bonaparte bei den Pestkranken von Jaffa
x Die Pyramide | Louvre-Pyramide; Glaspyramide | Die Glaspyramide ist der Eingang des Museums – kein ausgestelltes Kunstwerk.
x Die Schule von Athen | Schule von Athen | Ein Fresko im Vatikan.
x Die Erschaffung Adams | | Ein Fresko in der Sixtinischen Kapelle.
x Der Kuss | | Klimts „Kuss“ hängt in Wien, Rodins „Kuss“ steht im Musée Rodin.
x Seerosen | | Monets Seerosen hängen im Musée de l'Orangerie.
x Der Denker | | Steht im Musée Rodin.
x Sternennacht | | Hängt im Museum of Modern Art in New York.
x Die Geburt der Venus | | Hängt in den Uffizien in Florenz.
x David | | Michelangelos David steht in Florenz.
x Das Abendmahl | | Ein Wandgemälde in Mailand.
x Das Frühstück im Grünen | | Hängt im Musée d'Orsay.
`,
  },
  {
    id: "michelangelo-werk",
    prompt: "Nenne ein Werk von Michelangelo.",
    topic: "Künstler",
    difficulty: 3,
    sources: [wiki("Michelangelo")],
    list: `
K David
K Die Erschaffung Adams | Erschaffung Adams
K Sixtinische Kapelle | Deckenfresko der Sixtinischen Kapelle; Sixtinische Decke
K Pietà | Römische Pietà; Pietà im Petersdom
F Das Jüngste Gericht | Jüngstes Gericht
F Moses | Mosesstatue
F Kuppel des Petersdoms | Petersdom; Petersdom-Kuppel
F Bacchus
F Sterbender Sklave
F Rebellischer Sklave
F Madonna von Brügge | Brügger Madonna
F Grabmal von Julius II. | Juliusgrabmal; Grabmal Julius II.
U Tondo Doni | Heilige Familie; Doni Tondo
U Pietà Rondanini | Rondanini-Pietà
U Pietà Bandini | Florentiner Pietà
U Medici-Kapelle | Neue Sakristei; Medici-Gräber
U Die Nacht | | Allegorie auf dem Medici-Grab.
U Der Tag | | Allegorie auf dem Medici-Grab.
U Die Morgenröte | Der Morgen
U Die Abenddämmerung | Der Abend
U Biblioteca Laurenziana | Laurenziana
U Kapitolsplatz | Piazza del Campidoglio
U Kentaurenschlacht | Die Kentaurenschlacht
U Madonna an der Treppe | Treppenmadonna
U Tondo Pitti
U Tondo Taddei
U Die Bekehrung des Saulus | Bekehrung des Paulus
U Die Kreuzigung Petri | Kreuzigung des Petrus
U Die Schlacht von Cascina | Schlacht bei Cascina
U Palazzo Farnese | | Michelangelo vollendete den Bau.
U Porta Pia
U Santa Maria degli Angeli
R Kauernder Knabe
R Giuliano de' Medici
R Lorenzo de' Medici | Il Pensieroso
R Brutus | Büste des Brutus
R Apollo | David-Apollo
R Engel mit Leuchter | Leuchterengel
R Heiliger Petronius
R Heiliger Proculus
R Heiliger Paulus
R Heiliger Petrus
R Genius des Sieges | Der Sieger
R Christus mit dem Kreuz | Auferstandener Christus; Christus von Santa Maria sopra Minerva
R Die Sintflut | Sintflut
R Die Erschaffung Evas
R Die Trennung von Licht und Finsternis
R Die Erschaffung der Gestirne
R Der Sündenfall | Sündenfall und Vertreibung aus dem Paradies
R Die Trunkenheit Noahs
R Delphische Sibylle
R Libysche Sibylle
R Cumäische Sibylle
R Der Prophet Jeremia | Jeremia
R Der Prophet Jona | Jona
R Die Grablegung | Grablegung Christi
R Manchester-Madonna
R Leda und der Schwan
R Venus und Amor
R Atlas | Sklave Atlas
R Der bärtige Sklave | Bärtiger Sklave
R Der junge Sklave
R Der erwachende Sklave
R Kruzifix von Santo Spirito | Holzkruzifix
R Sonette | Gedichte | Michelangelo schrieb auch rund 300 Gedichte.
x Mona Lisa | | Gemalt von Leonardo da Vinci.
x Das Abendmahl | | Gemalt von Leonardo da Vinci.
x Die Schule von Athen | | Gemalt von Raffael.
x Die Geburt der Venus | | Gemalt von Sandro Botticelli.
x Der Denker | | Geschaffen von Auguste Rodin.
x Der Kuss | | Von Gustav Klimt oder Auguste Rodin.
x Die Sixtinische Madonna | Sixtinische Madonna | Gemalt von Raffael – trotz des Namens.
x Perseus | | Geschaffen von Benvenuto Cellini.
x David von Donatello | | Der bronzene David stammt von Donatello.
`,
  },
]);
