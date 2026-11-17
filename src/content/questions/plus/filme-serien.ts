import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("filme-serien", [
  {
    id: "nolan-film",
    prompt: "Nenne einen Film von Christopher Nolan.",
    topic: "Regie",
    difficulty: 3,
    sources: [wiki("Christopher Nolan")],
    list: `
K Inception
K Interstellar
K Oppenheimer
K The Dark Knight | Dark Knight
F The Dark Knight Rises | Dark Knight Rises
F Batman Begins
F Tenet
F Dunkirk | Dunkerque; Dünkirchen
U Memento
U Prestige – Die Meister der Magie | The Prestige; Prestige
U Die Odyssee | The Odyssey; Odyssey; Odyssee
R Insomnia – Schlaflos | Insomnia; Schlaflos
V Following
L Doodlebug
x Batman v Superman | | Regie: Zack Snyder – Nolan war nur Produzent.
x Man of Steel | | Regie: Zack Snyder – Nolan war Produzent.
x Transcendence | | Regie: Wally Pfister, Nolans Kameramann.
`,
  },
  {
    id: "tarantino-film",
    prompt: "Nenne einen Film von Quentin Tarantino.",
    topic: "Regie",
    difficulty: 3,
    sources: [wiki("Quentin Tarantino")],
    list: `
K Pulp Fiction
K Django Unchained | Django
K Inglourious Basterds | Inglorious Basterds
K Kill Bill | Kill Bill Vol. 1; Kill Bill Volume 1; Kill Bill Vol. 2; Kill Bill Volume 2; Kill Bill 2
F Once Upon a Time in Hollywood | Once Upon a Time … in Hollywood
F Reservoir Dogs | Reservoir Dogs – Wilde Hunde
F The Hateful Eight | The Hateful 8; Hateful Eight
U Jackie Brown
R Death Proof | Death Proof – Todsicher; Grindhouse
V Four Rooms | | Tarantino drehte die letzte Episode.
V Sin City | | Tarantino führte bei einer Szene Gastregie.
L My Best Friend's Birthday
x From Dusk Till Dawn | | Drehbuch von Tarantino, Regie Robert Rodriguez.
x True Romance | | Drehbuch von Tarantino, Regie Tony Scott.
x Natural Born Killers | | Nach einer Story von Tarantino, Regie Oliver Stone.
x Planet Terror | | Der andere Grindhouse-Film – Regie Robert Rodriguez.
`,
  },
  {
    id: "spielberg-film",
    prompt: "Nenne einen Kinofilm von Steven Spielberg.",
    topic: "Regie",
    difficulty: 3,
    sources: [wiki("Steven Spielberg")],
    list: `
K Der weiße Hai | Jaws; Der weisse Hai
K E.T. – Der Außerirdische | E.T.; ET; E.T. der Ausserirdische; E.T. the Extra-Terrestrial
K Jurassic Park
K Schindlers Liste | Schindler's List
K Jäger des verlorenen Schatzes | Indiana Jones; Raiders of the Lost Ark; Indiana Jones Jäger des verlorenen Schatzes
K Der Soldat James Ryan | Saving Private Ryan
F Catch Me If You Can
F Indiana Jones und der Tempel des Todes | Temple of Doom; Tempel des Todes
F Indiana Jones und der letzte Kreuzzug | Last Crusade; Der letzte Kreuzzug
F Indiana Jones und das Königreich des Kristallschädels | Königreich des Kristallschädels; Kristallschädel
F Vergessene Welt: Jurassic Park | The Lost World; Vergessene Welt; Jurassic Park 2
F Krieg der Welten | War of the Worlds
F Minority Report
F Hook
F Ready Player One
F Terminal | The Terminal
#auto
Unheimliche Begegnung der dritten Art | Close Encounters of the Third Kind; Unheimliche Begegnung
A.I. – Künstliche Intelligenz | A.I.; AI; Künstliche Intelligenz
Lincoln
Bridge of Spies | Bridge of Spies – Der Unterhändler
Die Fabelmans | The Fabelmans; Fabelmans
West Side Story
Die Verlegerin | The Post
München | Munich
Gefährten | War Horse
Die Abenteuer von Tim und Struppi | Tim und Struppi; The Adventures of Tintin
Die Farbe Lila | The Color Purple
Duell | Duel
Amistad
Das Reich der Sonne | Empire of the Sun
BFG – Big Friendly Giant | BFG; The BFG
Disclosure Day
1941 – Wo bitte geht's nach Hollywood | 1941
Always | Always – Der Feuerengel von Montana
Sugarland Express | The Sugarland Express
Unheimliche Schattenlichter | Twilight Zone: The Movie; Twilight Zone
Firelight
#end
x Jurassic World | | Regie: Colin Trevorrow – Spielberg war Produzent.
x Indiana Jones und das Rad des Schicksals | Rad des Schicksals | Regie: James Mangold.
x Zurück in die Zukunft | Back to the Future | Regie: Robert Zemeckis – Spielberg war Produzent.
x Gremlins | | Regie: Joe Dante – Spielberg war Produzent.
x Die Goonies | Goonies | Regie: Richard Donner – Spielberg schrieb die Story.
x Poltergeist | | Regie: Tobe Hooper – Spielberg war Produzent und Autor.
x Men in Black | | Regie: Barry Sonnenfeld – Spielberg war Produzent.
x Transformers | | Regie: Michael Bay – Spielberg war Produzent.
`,
  },
  {
    id: "mcu-film",
    prompt: "Nenne einen Kinofilm aus dem Marvel Cinematic Universe (MCU).",
    topic: "Hollywood",
    difficulty: 2,
    sources: [wiki("Marvel Cinematic Universe")],
    list: `
K Avengers: Endgame | Endgame; Avengers Endgame; Avengers 4
K Iron Man | Iron Man 1
K The Avengers | Marvel's The Avengers; Avengers; Avengers 1
K Avengers: Infinity War | Infinity War; Avengers 3
K Black Panther
K Spider-Man: No Way Home | No Way Home
F Guardians of the Galaxy | Guardians of the Galaxy Vol. 1
F Captain America: The First Avenger | The First Avenger; Captain America 1
F Thor | Thor 1
F Iron Man 2
F Iron Man 3
F Avengers: Age of Ultron | Age of Ultron; Avengers 2
F Captain America: Civil War | Civil War; The First Avenger: Civil War
F Doctor Strange
F Captain Marvel
F Spider-Man: Homecoming | Homecoming
F Deadpool & Wolverine | Deadpool und Wolverine; Deadpool 3
F Thor: Tag der Entscheidung | Thor: Ragnarok; Ragnarok; Thor 3
#auto
Spider-Man: Far From Home | Far From Home
Captain America: The Return of the First Avenger | The Winter Soldier; Captain America: The Winter Soldier; Winter Soldier; Captain America 2
Ant-Man
Black Widow
Guardians of the Galaxy Vol. 2 | Guardians of the Galaxy 2
Guardians of the Galaxy Vol. 3 | Guardians of the Galaxy 3
Shang-Chi and the Legend of the Ten Rings | Shang-Chi
Eternals
Thor: The Dark Kingdom | Thor: The Dark World; The Dark Kingdom; Thor 2
Ant-Man and the Wasp | Ant-Man and the Wasp; Ant-Man 2
Doctor Strange in the Multiverse of Madness | Multiverse of Madness; Doctor Strange 2
Thor: Love and Thunder | Love and Thunder; Thor 4
Black Panther: Wakanda Forever | Wakanda Forever; Black Panther 2
Der unglaubliche Hulk | The Incredible Hulk; Incredible Hulk
Ant-Man and the Wasp: Quantumania | Quantumania; Ant-Man 3
The Marvels
Captain America: Brave New World | Brave New World; Captain America 4
Thunderbolts* | Thunderbolts; The New Avengers
The Fantastic Four: First Steps | Fantastic Four: First Steps; The Fantastic Four
Spider-Man: Brand New Day | Brand New Day
#end
x Deadpool | | Die ersten zwei Deadpool-Filme stammen von 20th Century Fox – erst „Deadpool & Wolverine“ gehört zum MCU.
x Deadpool 2 | | Noch ein Fox-Film, nicht Teil des MCU.
x Venom | | Gehört zu Sonys eigenem Spider-Man-Universum, nicht zum MCU.
x Logan | Logan – The Wolverine | Ein X-Men-Film von Fox, nicht Teil des MCU.
x X-Men | | Die X-Men-Filme stammen von Fox, nicht aus dem MCU.
x The Amazing Spider-Man | | Sony-Film mit Andrew Garfield, vor dem MCU-Spider-Man.
x Joker | | DC-Film, nicht Marvel.
`,
  },
  {
    id: "dicaprio-film",
    prompt: "Nenne einen Kinofilm mit Leonardo DiCaprio.",
    topic: "Schauspiel",
    difficulty: 2,
    sources: [wiki("Leonardo DiCaprio")],
    list: `
K Titanic
K Inception
K The Wolf of Wall Street | Wolf of Wall Street
K The Revenant | The Revenant – Der Rückkehrer; Revenant
K Catch Me If You Can
F Shutter Island
F Django Unchained | Django
F Der große Gatsby | The Great Gatsby; Der grosse Gatsby
F Once Upon a Time in Hollywood
F The Departed | The Departed – Unter Feinden; Departed
F Romeo + Julia | Romeo und Julia; Romeo + Juliet
F Blood Diamond
F Don't Look Up
F Killers of the Flower Moon
#auto
Aviator | The Aviator
Gangs of New York
The Beach
Gilbert Grape – Irgendwo in Iowa | Gilbert Grape; What's Eating Gilbert Grape
One Battle After Another
Der Mann in der eisernen Maske | The Man in the Iron Mask
Zeiten des Aufruhrs | Revolutionary Road
J. Edgar
Der Mann, der niemals lebte | Body of Lies
Basketball Diaries | The Basketball Diaries
Marvins Töchter | Marvin's Room
This Boy's Life
Schneller als der Tod | The Quick and the Dead
Total Eclipse – Die Affäre von Rimbaud und Verlaine | Total Eclipse
Celebrity – Schön. Reich. Berühmt. | Celebrity
Critters 3
Poison Ivy
Don's Plum
#end
x Der Pate | | Kein DiCaprio-Film – mit Marlon Brando und Al Pacino.
x Fight Club | | Mit Brad Pitt und Edward Norton.
x Forrest Gump | | Mit Tom Hanks.
`,
  },
  {
    id: "friends-figur",
    prompt: "Nenne eine Figur aus der Serie „Friends“.",
    topic: "Serien",
    difficulty: 2,
    sources: [wiki("Friends")],
    list: `
K Rachel Green
K Ross Geller
K Monica Geller
K Chandler Bing
K Joey Tribbiani
K Phoebe Buffay
F Gunther
F Janice | Janice Litman-Goralnik; Janice Hosenstein
F Mike Hannigan
F Richard Burke
F Emily Waltham
F Carol Willick
F Ben Geller
F Emma Geller-Green | Emma
F Ursula Buffay
U Susan Bunch
U Jack Geller
U Judy Geller
U Frank Buffay Jr. | Frank Jr.
U Marcel | | Ross' Kapuzineraffe.
U Ugly Naked Guy | Hässlicher nackter Typ
U Mr. Heckles | Heckles
U Paolo
U Julie
U Tag Jones | Tag
U Charlie Wheeler
U Kathy
U Janine Lecroix | Janine
U Pete Becker
U Barry Farber | Barry
U Elizabeth Stevens
U Paul Stevens
U Estelle Leonard | Estelle
U David | | Der Wissenschaftler, in den sich Phoebe verliebt.
R Mona
R Mr. Treeger | Treeger
R Amy Green
R Jill Green
R Leonard Green
R Sandra Green
R Gavin Mitchell
R Eddie Menuek
R Erica | | Die leibliche Mutter von Monicas und Chandlers Zwillingen.
R Alice Knight
R Joshua Burgin
R Fun Bobby
R Gary | | Der Polizist, mit dem Phoebe zusammenzieht.
R Phoebe Abbott Sr. | Phoebe Abbott
R Charles Bing | Helena Handbasket
R Nora Bing | Nora Tyler Bing
R Leslie Buffay | Lily Buffay
R Frank Buffay Sr. | Frank Buffay
V Dr. Drake Ramoray | Drake Ramoray
V Ryan | | Phoebes U-Boot-Freund.
V Mark Robinson
V Joanna | | Rachels Chefin bei Bloomingdale's.
V Sophie | | Rachels Kollegin.
V Emily | Emily Waltham
V Bonnie
V Vince | | Der Feuerwehrmann.
V Jason | | Der andere Feuerwehrmann.
V Kip | | Monicas und Chandlers ehemaliger Mitbewohner.
V Danny | | Der Nachbar mit dem Bart.
V Timothy Burke
V Ronni Rapalono | Ronni
V Mr. Zelner | Zelner
V Rachel Green Sr. |
V Duncan | | Phoebes Ex-Mann.
V Hugsy | | Joeys Kuschelpinguin.
V Chick and Duck | Küken und Ente; Chick; Duck
V Molly | | Das Kindermädchen.
V Emma | Emma Geller-Green
L Mindy Hunter | Mindy
L Kristen Lang | Kristen
L Cassie Geller | Cassie
L Will Colbert | Will
L Lowell
L Malcolm
L Russ
x Ted Mosby | | Der gehört zu „How I Met Your Mother“.
x Sheldon Cooper | Sheldon | Der gehört zu „The Big Bang Theory“.
x Michael Scott | | Der gehört zu „The Office“.
`,
  },
  {
    id: "breaking-bad-figur",
    prompt: "Nenne eine Figur aus der Serie „Breaking Bad“.",
    topic: "Serien",
    difficulty: 2,
    sources: [wiki("Breaking Bad")],
    list: `
K Walter White | Heisenberg; Walt; Mr. White
K Jesse Pinkman
K Saul Goodman | Jimmy McGill; Saul
F Skyler White
F Hank Schrader
F Gustavo Fring | Gus Fring; Gus
F Mike Ehrmantraut | Mike
F Walter White Jr. | Flynn; Walt Jr.
F Marie Schrader
F Tuco Salamanca | Tuco
F Hector Salamanca | Tio Salamanca; Tio
U Todd Alquist | Todd
U Jane Margolis | Jane
U Gale Boetticher | Gale
U Lydia Rodarte-Quayle | Lydia
U Badger | Brandon Mayhew
U Skinny Pete
U Steven Gomez | Gomez; Gomie
U Krazy-8 | Domingo Molina; Krazy 8
U Leonel Salamanca | Die Cousins; The Cousins; Leonel
U Marco Salamanca | Marco
U Huell Babineaux | Huell
U Jack Welker | Onkel Jack; Uncle Jack
U Holly White | Holly
U Andrea Cantillo | Andrea
U Brock Cantillo | Brock
U Combo
U Ted Beneke | Ted
R Emilio Koyama | Emilio
R Don Eladio | Eladio Vuente
R Victor
R Tyrus Kitt | Tyrus
R Gretchen Schwartz | Gretchen
R Elliott Schwartz | Elliott
R Donald Margolis
R Kuby
R Francesca Liddy | Francesca
R Ed Galbraith | Ed; Der Staubsauger-Mann; The Disappearer
R Bogdan Wolynetz | Bogdan
R Juan Bolsa
R Kenny
R Tortuga
R Gonzo
R Wendy
R Max Arciniega | Max
R Declan
R Spooge
R Drew Sharp
V No-Doze | No Doze
V Clovis
V Lawson
V Dr. Delcavoli | Delcavoli
V Carmen Molina | Carmen
V Duane Chow | Chow
V Dan Wachsberger | Dan
V Pete | Skinny Pete
V Kaylee Ehrmantraut | Kaylee
V George Merkert | Merkert
V Kenny
L Gomez
L Hugo Archuleta | Hugo
L Louis Corbett | Louis
L Kenny
x Kim Wexler | Kim | Kommt nur im Ableger „Better Call Saul“ vor.
x Nacho Varga | Nacho | Kommt nur im Ableger „Better Call Saul“ vor.
x Lalo Salamanca | Lalo | Kommt nur im Ableger „Better Call Saul“ vor.
x Chuck McGill | Chuck | Kommt nur im Ableger „Better Call Saul“ vor.
`,
  },
  {
    id: "got-figur",
    prompt: "Nenne eine Figur aus der Serie „Game of Thrones“.",
    topic: "Serien",
    difficulty: 2,
    sources: [wiki("Game of Thrones")],
    list: `
K Jon Snow | Jon Schnee; Aegon Targaryen
K Daenerys Targaryen | Daenerys; Dany; Khaleesi; Mutter der Drachen
K Tyrion Lannister
K Cersei Lannister
K Arya Stark
K Jaime Lannister
K Sansa Stark
K Ned Stark | Eddard Stark
F Bran Stark | Brandon Stark; Dreiäugiger Rabe
F Joffrey Baratheon | Joffrey
F Robb Stark
F Catelyn Stark | Catelyn Tully
F Theon Greyjoy | Theon Graufreud; Stinker; Reek
F Petyr Baelish | Kleinfinger; Littlefinger
F Varys | Die Spinne
F Sandor Clegane | Der Bluthund; The Hound; Bluthund
F Gregor Clegane | Der Berg; The Mountain
F Brienne von Tarth | Brienne of Tarth; Brienne
F Samwell Tarly | Sam Tarly
F Tywin Lannister
F Robert Baratheon
F Stannis Baratheon
F Khal Drogo | Drogo
F Jorah Mormont | Jorah
F Hodor
F Ramsay Bolton | Ramsay Snow
F Melisandre | Die rote Frau
F Davos Seaworth | Davos
F Bronn
F Margaery Tyrell
F Der Nachtkönig | Night King; Nachtkönig
F Ygritte
F Tormund Riesentod | Tormund; Tormund Giantsbane
F Missandei
F Grauer Wurm | Grey Worm
F Oberyn Martell | Die Rote Viper
F Drogon
#auto
Renly Baratheon
Viserys Targaryen
Olenna Tyrell | Dornenkönigin
Tommen Baratheon
Myrcella Baratheon
Rickon Stark
Gendry
Gilly | Goldy
Podrick Payne | Pod
Daario Naharis
Shae
Ellaria Sand
Roose Bolton
Walder Frey
Mance Rayder
Yara Greyjoy | Asha Graufreud; Asha Greyjoy; Yara Graufreud
Euron Greyjoy | Euron Graufreud
Balon Greyjoy | Balon Graufreud
Jeor Mormont | Der alte Bär
Lyanna Mormont
Jaqen H'ghar | Jaqen
Der Hohe Spatz | High Sparrow
Qyburn
Loras Tyrell
Osha
Jojen Reed
Meera Reed
Beric Dondarrion
Thoros von Myr | Thoros
Talisa Stark | Talisa
Maester Aemon | Aemon Targaryen
Maester Luwin | Luwin
Grand Maester Pycelle | Pycelle
Alliser Thorne
Eddison Tollett | Dolorous Edd; Edd
Olly
Benjen Stark
Lysa Arryn
Robin Arryn
Septa Unella
Ilyn Payne
Syrio Forel
Shireen Baratheon
Selyse Baratheon
Lancel Lannister
Kevan Lannister
Randyll Tarly
Dickon Tarly
Craster
Rhaegal
Viserion
Geist | Ghost
Nymeria
Grauwind | Grey Wind
Sommer | Summer
Lady
Struppel | Shaggydog
Hot Pie | Heiße Pastete
Rhaegar Targaryen
Lyanna Stark
Aerys II. Targaryen | Der irre König; Mad King; Aerys Targaryen
Doran Martell
Trystane Martell
Obara Sand
Nymeria Sand
Tyene Sand
Areo Hotah
Xaro Xhoan Daxos
Kraznys mo Nakloz | Kraznys
Hizdahr zo Loraq | Hizdahr
Barristan Selmy | Barristan
Mace Tyrell
Rast
Karl Tanner
Qhorin Halbhand | Qhorin
Rakharo
Irri
Doreah
Kovarro
Mirri Maz Duur
Ser Arthur Dayne | Arthur Dayne
Howland Reed
Jon Arryn
Ros
Kinvara
Harald Karstark
Smalljon Umber
Edmure Tully
Brynden Tully | Der Schwarzfisch; Blackfish
Hoster Tully
Lothar Frey
Black Walder | Schwarzer Walder
Polliver
Biter | Beißer
Rorge
Yoren
Orell
Styr
Wun Wun
Der Mann ohne Gesicht | Der gütige Mann
Die Waisenmädchen | The Waif; Waif
Lady Crane
Myranda
Locke
Ser Meryn Trant | Meryn Trant
Janos Slynt
Tobho Mott
Grenn
Pypar | Pyp
Ser Jorah
#end
x Aegon II. | | Gehört zur Prequel-Serie „House of the Dragon“.
x Rhaenyra Targaryen | Rhaenyra | Gehört zur Prequel-Serie „House of the Dragon“.
x Daemon Targaryen | Daemon | Gehört zur Prequel-Serie „House of the Dragon“.
x Gandalf | | Kommt aus „Der Herr der Ringe“.
`,
  },
  {
    id: "simpsons-figur",
    prompt: "Nenne eine Figur aus „Die Simpsons“.",
    topic: "Animation",
    difficulty: 1,
    sources: [wiki("Figuren aus Die Simpsons")],
    list: `
K Homer Simpson | Homer
K Marge Simpson | Marge
K Bart Simpson | Bart
K Lisa Simpson | Lisa
K Maggie Simpson | Maggie
F Abraham Simpson | Grampa Simpson; Opa Simpson; Abe Simpson
F Ned Flanders
F Mr. Burns | Montgomery Burns; Charles Montgomery Burns
F Waylon Smithers | Smithers
F Moe Szyslak | Moe
F Milhouse Van Houten | Milhouse
F Krusty der Clown | Krusty; Krusty the Clown
F Apu Nahasapeemapetilon | Apu
F Barney Gumble | Barney
F Chief Wiggum | Clancy Wiggum; Polizeichef Wiggum
F Ralph Wiggum | Ralph
F Rektor Skinner | Seymour Skinner; Principal Skinner; Skinner
F Nelson Muntz | Nelson
F Tingeltangel-Bob | Sideshow Bob; Robert Terwilliger
F Patty Bouvier | Patty
F Selma Bouvier | Selma
F Knecht Ruprecht | Santa's Little Helper
F Lenny Leonard | Lenny
F Carl Carlson | Carl
F Hausmeister Willie | Groundskeeper Willie; Willie
F Edna Krabappel | Edna
F Otto Mann | Otto
F Comic-Book-Verkäufer | Comic Book Guy; Jeff Albertson; Comicbuchverkäufer
F Itchy
F Scratchy
#auto
Martin Prince | Martin
Dr. Hibbert | Julius Hibbert
Dr. Nick Riviera | Dr. Nick
Reverend Lovejoy | Timothy Lovejoy
Helen Lovejoy
Maude Flanders
Rod Flanders
Todd Flanders
Kent Brockman
Professor Frink | Frink
Snake | Schlange; Jailbird
Fat Tony | Dicker Tony
Hans Maulwurf | Hans Moleman
Troy McClure
Lionel Hutz
Cletus
Brandine
Jimbo Jones | Jimbo
Kearney
Dolph
Disco Stu
Sherri und Terri | Sherri; Terri
Superintendent Chalmers | Chalmers
Bürgermeister Quimby | Mayor Quimby; Quimby
Kang
Kodos
Mona Simpson
Herb Powell | Herb
Schneeball II | Snowball; Schneeball
Blinky
Duffman
Sideshow Mel | Tingeltangel-Mel
Cecil Terwilliger
Lunchlady Doris | Doris
Uter
Bleeding Gums Murphy | Zahnfleischbluter Murphy
Agnes Skinner
Luann Van Houten
Kirk Van Houten
Manjula
Rainier Wolfcastle | McBain
Bumblebee Man | Hummelmann
Lou
Eddie
Gil Gunderson | Gil
Frank Grimes | Grimey
Kapitän McCallister | Sea Captain; Der Kapitän
Mrs. Hoover
Mr. Largo | Dewey Largo
Database
Wendell
Lewis
Arnie Pye
Jasper | Jasper Beardsley
Old Jewish Man | Alter Jude
Lurleen Lumpkin
Artie Ziff
Ling Bouvier
Jacqueline Bouvier
Allison Taylor
Jessica Lovejoy
Raphael
Squeaky Voiced Teen | Pubertierender Teenager
Drederick Tatum
Rich Texan | Reicher Texaner
Plopper | Spider-Schwein; Spider-Pig
Poochie
Mr. Teeny
Hugo Simpson
Abbie Simpson
Leon Kompowsky
Lindsey Naegle
Sanjay
Akira
Marvin Monroe | Dr. Marvin Monroe
Wise Guy | Raphael
Hank Scorpio
Mindy Simmons
Jebediah Springfield
Gerald | Baby Gerald
Herman
Larry Burns
Lyle Lanley
#end
x Peter Griffin | | Der gehört zu „Family Guy“.
x Stewie | | Der gehört zu „Family Guy“.
x Cartman | | Der gehört zu „South Park“.
x Bender | | Der gehört zu „Futurama“.
`,
  },
  {
    id: "herr-der-ringe-figur",
    prompt: "Nenne eine Figur aus „Der Herr der Ringe“ (Buch oder Film).",
    topic: "Filmfiguren",
    difficulty: 2,
    sources: [wiki("Figuren in Tolkiens Welt")],
    list: `
K Frodo Beutlin | Frodo; Frodo Baggins
K Gandalf | Gandalf der Graue; Gandalf der Weiße; Mithrandir
K Aragorn | Streicher; Elessar
K Legolas
K Gimli
K Gollum | Sméagol; Smeagol
K Samweis Gamdschie | Sam; Samwise Gamgee; Samweis
K Sauron
F Bilbo Beutlin | Bilbo; Bilbo Baggins
F Boromir
F Saruman
F Merry | Meriadoc Brandybock; Meriadoc
F Pippin | Peregrin Tuk; Peregrin Took
F Arwen
F Galadriel
F Elrond
F Éowyn | Eowyn
F Théoden | Theoden
F Faramir
F Éomer | Eomer
F Baumbart | Treebeard; Fangorn
F Gríma Schlangenzunge | Grima; Schlangenzunge; Wormtongue
F Denethor
F Kankra | Shelob
F Hexenkönig von Angmar | Hexenkönig; Witch-king
F Balrog | Durins Fluch
F Nazgûl | Ringgeister; Nazgul; Schwarze Reiter
#auto
Tom Bombadil
Goldbeere | Goldberry
Celeborn
Haldir
Glorfindel
Gothmog
Lurtz
Isildur
Elendil
Gil-galad
Radagast
Schattenfell | Shadowfax
Lutz Farning | Bill Ferny; Lutz
Gerstenmann Butterblume | Barliman Butterbur; Butterblume
Rosie Hüttinger | Rosie Cotton; Rosie
Lobelia Sackheim-Beutlin | Lobelia
Bauer Maggot | Farmer Maggot
Gamling
Háma | Hama
Beregond
Imrahil
Halbarad
Elladan
Elrohir
Círdan | Cirdan
Glóin | Gloin
Ugluk | Uglúk
Grischnákh | Grishnakh
Schagrat | Shagrat
Gorbag
Mund Saurons | Mouth of Sauron
Déagol | Deagol
Erkenbrand
Ghân-buri-Ghân | Ghan-buri-Ghan
Fredegar Bolger | Dick Bolger; Fatty Bolger
Ohm Gamdschie | Hamfast Gamdschie; Gaffer
Sandig Müller | Ted Sandyman
Lotho Sackheim-Beutlin | Lotho
Bill das Pony | Lutz' Pony; Bill
Gwaihir | Windherr
Quickbeam | Flinkbaum
Grimbold
Elfhelm
Théodred | Theodred
Ioreth
Bergil
Damrod
Mablung
Madril
Celebrimbor
Thranduil
Fatty Bolger
Gaffer
Ufthak
Snaga
Shagrat
Gorbag
Gríma
x Smaug | | Der Drache gehört zu „Der Hobbit“.
x Thorin Eichenschild | Thorin | Gehört zu „Der Hobbit“.
x Beorn | | Gehört zu „Der Hobbit“.
x Dumbledore | | Kommt aus „Harry Potter“.
`,
  },
]);
