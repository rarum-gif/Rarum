import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("essen-trinken", [
  {
    id: "cocktail",
    prompt: "Nenne einen Cocktail.",
    topic: "Getränke",
    difficulty: 1,
    sources: [wiki("Liste von Cocktails")],
    list: `
K Mojito
K Caipirinha
K Piña Colada | Pina Colada
K Margarita
K Aperol Spritz | Spritz; Aperol
K Sex on the Beach
K Cosmopolitan | Cosmo
K Martini | Dry Martini
K Long Island Iced Tea | Long Island
K Tequila Sunrise
F Negroni
F Hugo
F Daiquiri
F Mai Tai
F Bloody Mary
F Moscow Mule
F Gin Tonic | Gin and Tonic; Gin & Tonic
F Cuba Libre
F Old Fashioned
F Manhattan
F Whiskey Sour | Whisky Sour
F Pisco Sour
F Espresso Martini
F White Russian
F Caipiroska
F Swimming Pool
F Pornstar Martini | Porn Star Martini
F Mimosa
F Bellini
F Kir Royal
F Irish Coffee
F Sangria | | Eine Bowle – wir zählen sie gerne mit.
#auto
Black Russian
Mint Julep
Sidecar
Tom Collins
Gimlet
French 75
Kir
Americano
Boulevardier
Sazerac
Zombie
Hurricane
Singapore Sling
Blue Lagoon
Screwdriver | Wodka Orange
Harvey Wallbanger
Planter's Punch
Dark 'n' Stormy | Dark and Stormy
Paloma
Bramble
Aviation
Last Word
Penicillin
Clover Club
Ramos Gin Fizz
Gin Fizz
Paper Plane
Lemon Drop
Appletini
Grasshopper
Brandy Alexander
Rusty Nail
Godfather
Rob Roy
Vesper
Hemingway Daiquiri | Papa Doble
Corpse Reviver
B-52
Kamikaze
Mudslide
Painkiller
Bahama Mama
Jungle Bird
Tommy's Margarita
Frozen Margarita
Batida de Coco | Batida
Aperol Sour
Amaretto Sour
Sgroppino
Campari Orange
Campari Soda
Tinto de Verano
Michelada
Caesar | Bloody Caesar
El Diablo
Golden Dream
Blue Hawaii
Hanky Panky
Bee's Knees
Southside
Gin Basil Smash
Vieux Carré
Bronx
Monkey Gland
Floradora
Mai Tai
Charlie Chaplin
Pink Lady
White Lady
Alexander
Stinger
French Martini
Dirty Martini
Gibson
Cuba Libre
Sex on the Beach
Bramble
Clover Club
Zombie
Lillet Wild Berry | Lillet Berry
Limoncello Spritz
Hugo Spritz
Eierpunsch
Glühwein | | Ein heisses Mischgetränk – zählt bei uns mit.
Feuerzangenbowle
Bowle
Pimm's Cup | Pimm's
Mezcal Negroni
Paloma
Moscow Mule
Gin Gin Mule
Kentucky Mule
London Mule
Tequila Sour
Midori Sour
Spritzer | Weinschorle | Wein mit Sprudel – ein Klassiker der Longdrinks.
Radler | Alster | Ein Biermischgetränk – wir zählen es gerne mit.
Sex on the Beach
Swimming Pool
Tom and Jerry
Eggnog
Rum Punch
Hot Toddy
Grog
Dirty Shirley
Shirley Temple | | Ein alkoholfreier Klassiker.
Virgin Colada
Virgin Mojito | Nojito
Ipanema | | Alkoholfreie Caipirinha.
Cinderella
Pussyfoot
x Prosecco | | Ein Schaumwein, kein Cocktail.
x Champagner | | Ein Schaumwein, kein Cocktail.
x Bier | | Bier allein ist kein Cocktail.
x Wodka | | Eine Spirituose, kein Cocktail.
x Rum | | Eine Spirituose, kein Cocktail.
x Whisky | | Eine Spirituose, kein Cocktail.
x Cola | | Ein Softdrink.
`,
  },
  {
    id: "rebsorte",
    prompt: "Nenne eine Rebsorte (Traubensorte für Wein).",
    topic: "Getränke",
    difficulty: 2,
    sources: [wiki("Liste von Rebsorten")],
    list: `
K Merlot
K Chardonnay
K Cabernet Sauvignon | Cabernet
K Pinot Noir | Blauburgunder; Spätburgunder; Pinot Nero
K Riesling
F Sauvignon Blanc
F Syrah | Shiraz
F Grenache | Garnacha; Cannonau
F Tempranillo | Tinta Roriz; Aragonez
F Sangiovese | Brunello
F Nebbiolo
F Zinfandel | Primitivo
F Malbec | Côt
F Gamay
F Chasselas | Gutedel; Fendant
F Müller-Thurgau | Rivaner; Riesling-Silvaner
F Grüner Veltliner | Veltliner
F Gewürztraminer | Traminer
F Pinot Grigio | Grauburgunder; Pinot Gris; Ruländer
F Pinot Blanc | Weissburgunder; Weißburgunder; Pinot Bianco
F Chenin Blanc
F Muskateller | Muscat; Moscato; Muskat
F Silvaner | Sylvaner
F Dornfelder
F Blaufränkisch | Lemberger
F Zweigelt | Blauer Zweigelt
F Trollinger | Vernatsch; Schiava
F Lambrusco
F Glera | Prosecco | Die Prosecco-Traube heisst offiziell Glera.
#auto
Sémillon | Semillon
Viognier
Cabernet Franc
Carménère | Carmenere
Mourvèdre | Monastrell; Mataro
Carignan | Cariñena
Cinsault
Petit Verdot
Barbera
Montepulciano
Nero d'Avola
Aglianico
Corvina
Dolcetto
Trebbiano | Ugni Blanc
Vermentino
Garganega
Arneis
Fiano
Greco
Albariño | Alvarinho
Verdejo
Godello
Touriga Nacional
Furmint
Petite Arvine
Humagne Rouge
Cornalin
Heida | Savagnin; Païen
Amigne
Completer
Räuschling
Gamaret
Garanoir
Pinotage
Tannat
Petite Sirah | Durif
Kerner
Bacchus
Scheurebe
Regent
St. Laurent | Sankt Laurent
Welschriesling | Graševina; Olaszrizling
Saperavi
Rkatsiteli
Assyrtiko
Xinomavro
Agiorgitiko
Moschofilero
Torrontés | Torrontes
Marsanne
Roussanne
Melon de Bourgogne | Muscadet
Aligoté
Colombard
Pinot Meunier | Schwarzriesling; Müllerrebe
Elbling
Ortega
Solaris
Divico
Cabernet Jura
Mondeuse
Plavac Mali
Mencía | Mencia
Bobal
Verdelho
Sercial
Baga
Malvasia | Malvasier
Pedro Ximénez
Palomino
Macabeo | Viura
Xarel·lo | Xarello
Parellada
Lagrein
Teroldego
Blauer Portugieser | Portugieser
Frühburgunder
Auxerrois
Gutedel
Ruländer
Rotgipfler
Zierfandler
Neuburger
Roter Veltliner
Gelber Muskateller
Muscat Ottonel
Nerello Mascalese
Primitivo
Negroamaro
Grillo
Catarratto
Carricante
Pecorino
Passerina
Verdicchio
Cortese
Ribolla Gialla
Friulano
Refosco
Schioppettino
Sagrantino
Canaiolo
Grechetto
Malvasia Nera
Tinta Barroca
Touriga Franca
Alicante Bouschet
Graciano
Mazuelo
Hondarrabi Zuri
Prieto Picudo
Kadarka
Hárslevelű
Juhfark
Kékfrankos
Feteasca Neagra | Fetească Neagră
Feteasca Alba
Tamjanika
Vranac
Prokupac
Mavrud
Kotsifali
Mandilaria
Vidal
Concord
Norton
Chambourcin
Seyval Blanc
Baco Noir
Marquette
Frontenac
x Bordeaux | | Bordeaux ist eine Weinregion, keine Rebsorte.
x Chianti | | Chianti ist ein Wein aus der Toskana – die Rebsorte heisst Sangiovese.
x Rioja | | Rioja ist eine Weinregion – die Rebsorte heisst meist Tempranillo.
x Champagner | Champagne | Champagner ist ein Schaumwein aus einer Region – keine Rebsorte.
x Rosé | | Rosé ist eine Weinart, keine Rebsorte.
x Beaujolais | | Beaujolais ist eine Region – die Rebsorte heisst Gamay.
`,
  },
  {
    id: "franzoesischer-kaese",
    prompt: "Nenne einen Käse aus Frankreich.",
    topic: "Zutaten",
    difficulty: 2,
    sources: [wiki("Liste französischer Käsesorten")],
    list: `
K Camembert
K Brie
K Roquefort
F Comté | Comte
F Reblochon
F Munster | Münster
F Raclette | Raclette de Savoie | Auch in Frankreich gibt es Raclette-Käse (Savoyen).
F Brie de Meaux
F Époisses | Epoisses
F Morbier
F Tomme de Savoie | Tomme
F Beaufort
F Cantal
F Saint-Nectaire
F Boursin
F Mimolette
F Chèvre | Ziegenkäse; Bûche de chèvre
F Mont d'Or | Vacherin Mont-d'Or; Vacherin du Haut-Doubs
F Emmental de Savoie | Französischer Emmentaler
#auto
Pont-l'Évêque
Livarot
Neufchâtel
Chaource
Crottin de Chavignol | Crottin
Sainte-Maure de Touraine
Valençay
Selles-sur-Cher
Banon
Bleu d'Auvergne
Fourme d'Ambert
Bleu de Gex
Abondance
Ossau-Iraty
Port-Salut
Saint-Marcellin
Saint-Félicien
Rocamadour
Pélardon
Picodon
Langres
Maroilles
Brillat-Savarin
Coulommiers
Brie de Melun
Salers
Laguiole
Tomme des Pyrénées
Chabichou du Poitou | Chabichou
Pouligny-Saint-Pierre
Bleu des Causses
Saint-Agur
Caprice des Dieux
Cancoillotte
Explorateur
Chaumes
Vieux Lille
Tamié
Abbaye de Cîteaux
Mothais-sur-feuille | Mothais
Bethmale
Saint-Paulin
Tomme de Brebis
Fromage de Meaux
Bleu de Bresse
Pavé d'Affinois
Délice de Bourgogne
Soumaintrain
Mâconnais
Charolais
Chevrotin
Persillé de Savoie
Gruyère | | Auch in Frankreich gibt es geschützten Gruyère – das Original ist aber Schweizer.
Fourme de Montbrison
Gaperon
Cabécou
Rigotte de Condrieu
Saint-Félicien
Tomme de Chèvre
Brocciu
Fleur du Maquis
Petit Suisse | Petit-Suisse | Trotz des Namens ein französischer Frischkäse.
Fromage blanc
Bleu de Laqueuille
Murol
Trou du Cru
Cœur de Neufchâtel
Bouton de Culotte
x Gouda | | Gouda kommt aus den Niederlanden.
x Parmesan | Parmigiano Reggiano | Parmesan kommt aus Italien.
x Mozzarella | | Mozzarella kommt aus Italien.
x Feta | | Feta kommt aus Griechenland.
x Appenzeller | | Appenzeller kommt aus der Schweiz.
x Tête de Moine | | Tête de Moine kommt aus der Schweiz.
x Emmentaler | | Emmentaler stammt ursprünglich aus der Schweiz – das französische Gegenstück heisst Emmental de Savoie.
x Cheddar | | Cheddar kommt aus England.
x Gorgonzola | | Gorgonzola kommt aus Italien.
`,
  },
]);
