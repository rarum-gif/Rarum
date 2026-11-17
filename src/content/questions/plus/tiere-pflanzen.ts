import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("tiere-pflanzen", [
  {
    id: "hunderasse",
    prompt: "Nenne eine Hunderasse.",
    topic: "Säugetiere",
    difficulty: 1,
    sources: [wiki("Liste der Hunderassen")],
    list: `
K Labrador Retriever | Labrador
K Deutscher Schäferhund | Schäferhund; German Shepherd
K Golden Retriever
K Dackel | Dachshund; Teckel
K Mops | Pug
K Chihuahua
K Pudel | Poodle
K Französische Bulldogge | Frenchie; French Bulldog
K Husky | Siberian Husky; Sibirischer Husky
K Dalmatiner
K Rottweiler
K Beagle
K Dobermann
K Boxer
F Border Collie
F Berner Sennenhund | Berner
F Bernhardiner | St. Bernhardshund
F Yorkshire Terrier | Yorkie
F Jack Russell Terrier | Jack Russell
F Englische Bulldogge | Bulldogge; English Bulldog
F Cocker Spaniel | Cockerspaniel
F Australian Shepherd | Aussie
F Malteser
F Shih Tzu
F Rhodesian Ridgeback
F Collie | Langhaarcollie
F Deutsche Dogge | Dogge; Great Dane
F Neufundländer
F Windhund | Greyhound
F Chow-Chow | Chow Chow
F Akita | Akita Inu
F Shiba Inu | Shiba
F Pitbull | American Pit Bull Terrier; Pit Bull
F Weimaraner
F Malinois | Belgischer Schäferhund
F Bichon Frisé | Bichon
F Havaneser
F Pomeranian | Zwergspitz
F Spitz | Deutscher Spitz
F Schnauzer | Zwergschnauzer; Riesenschnauzer
F Corgi | Welsh Corgi; Welsh Corgi Pembroke
F Cavalier King Charles Spaniel | King Charles; Cavalier
F West Highland White Terrier | Westie
F Samojede
F Appenzeller Sennenhund | Appenzeller
F Entlebucher Sennenhund | Entlebucher
F Grosser Schweizer Sennenhund
F Leonberger
F Hovawart
F Afghanischer Windhund | Afghane
F Basset | Basset Hound
F Bluthund | Bloodhound
F Mastiff
F Bullterrier
F Shar-Pei | Shar Pei
F Pekinese
F Papillon
F Whippet
F Irish Setter | Irischer Setter
F Magyar Vizsla | Vizsla
F Alaskan Malamute | Malamute
F Cane Corso
F Staffordshire Bullterrier | Staffy
F American Staffordshire Terrier | Amstaff
#auto
Deutsch Drahthaar
Deutsch Kurzhaar
Münsterländer
Labradoodle
Goldendoodle
Maltipoo
Lagotto Romagnolo
Bearded Collie
Sheltie | Shetland Sheepdog
Old English Sheepdog | Bobtail
Airedale Terrier
Foxterrier
Parson Russell Terrier
Scottish Terrier | Scottie
Cairn Terrier
Border Terrier
Bedlington Terrier
Irish Wolfhound | Irischer Wolfshund
Barsoi | Borzoi
Saluki
Sloughi
Galgo Español | Galgo
Italienisches Windspiel
Dogo Argentino
Bordeauxdogge | Dogue de Bordeaux
Bullmastiff
Mastino Napoletano
Tibet-Terrier
Tibet-Mastiff | Do Khyi
Lhasa Apso
Bolonka Zwetna | Bolonka
Coton de Tuléar
Bologneser
Löwchen
Japan-Chin
Affenpinscher
Zwergpinscher
Deutscher Pinscher
Kangal
Kaukasischer Owtscharka | Kaukasischer Schäferhund
Pyrenäenberghund
Kuvasz
Komondor
Puli
Pumi
Mudi
Beauceron
Briard
Groenendael
Tervueren
Laekenois
Holländischer Schäferhund
Weisser Schweizer Schäferhund
Tschechoslowakischer Wolfhund
Saarlooswolfhund
Eurasier
Keeshond | Wolfsspitz
Finnischer Lapphund
Norwegischer Elchhund
Grönlandhund
Basenji
Pharaonenhund
Podenco
Xoloitzcuintle | Mexikanischer Nackthund
Chinesischer Schopfhund
Peruanischer Nackthund
Thai Ridgeback
Jindo
Kishu
Hokkaido
Tosa
Kai Ken
Chesapeake Bay Retriever
Flat Coated Retriever
Nova Scotia Duck Tolling Retriever | Toller
Curly Coated Retriever
Springer Spaniel | English Springer Spaniel
Clumber Spaniel
Field Spaniel
Sussex Spaniel
Wachtelhund | Deutscher Wachtelhund
Kooikerhondje
Pointer
English Setter
Gordon Setter
Bracco Italiano
Spinone Italiano
Épagneul Breton | Bretonischer Spaniel
Rauhaardackel
Schweizer Laufhund
Berner Laufhund
Luzerner Laufhund
Dürrbächler
Bayerischer Gebirgsschweisshund
Hannoverscher Schweisshund
Brandlbracke
Dachsbracke
Foxhound
Harrier
Coonhound
Plott Hound
Rafeiro do Alentejo
Portugiesischer Wasserhund
Spanischer Wasserhund
Irish Water Spaniel
Barbet
Landseer
Neapolitanischer Mastiff
Boston Terrier
Bull Terrier
Manchester Terrier
Rat Terrier
Silky Terrier
Australian Terrier
Norfolk Terrier
Norwich Terrier
Sealyham Terrier
Skye Terrier
Dandie Dinmont Terrier
Kerry Blue Terrier
Soft Coated Wheaten Terrier
Lakeland Terrier
Welsh Terrier
Irish Terrier
Glen of Imaal Terrier
Jagdterrier | Deutscher Jagdterrier
Prager Rattler
Russkiy Toy
Chinook
Australian Cattle Dog
Kelpie | Australian Kelpie
Catahoula
Picardie-Schäferhund
Schapendoes
Bergamasker
Cão da Serra da Estrela
Anatolischer Hirtenhund
Sarplaninac
Karakatschan
Shikoku
Azawakh
Cirneco dell'Etna
Grand Bleu de Gascogne
Petit Basset Griffon Vendéen
Griffon Bruxellois
Brabançon
Malteser
#end
x Wolf | | Der Wolf ist die Wildform – keine Hunderasse.
x Dingo | | Der Dingo gilt als verwilderter Haushund, nicht als Rasse.
x Kojote | | Der Kojote ist eine eigene Wildart.
x Fuchs | | Der Fuchs ist eine Wildart, kein Hund.
x Schakal | | Der Schakal ist eine Wildart.
x Mischling | | Ein Mischling ist gerade keine Rasse.
`,
  },
  {
    id: "haiart",
    prompt: "Nenne eine Haiart.",
    topic: "Meerestiere",
    difficulty: 2,
    sources: [wiki("Haie")],
    list: `
K Weißer Hai | Weisser Hai; Weißhai; Great White
K Hammerhai
K Walhai
K Tigerhai
F Riesenhai
F Bullenhai | Stierhai
F Makohai | Mako; Kurzflossen-Mako
F Blauhai
F Zitronenhai
F Ammenhai
F Schwarzspitzen-Riffhai | Schwarzspitzenriffhai; Schwarzspitzenhai
F Weißspitzen-Riffhai | Weissspitzen-Riffhai; Weißspitzenriffhai
F Grauer Riffhai
F Grönlandhai | Eishai
F Katzenhai
F Megamaulhai | Riesenmaulhai
F Fuchshai | Drescherhai
F Dornhai
F Koboldhai | Nasenhai
F Megalodon | | Ausgestorben – aber eine Haiart.
#auto
Weißspitzen-Hochseehai | Weissspitzen-Hochseehai; Hochseehai; Longimanus
Heringshai
Sandtigerhai | Schnauzen-Sandtigerhai
Wobbegong | Teppichhai
Engelhai | Meerengel
Sägehai
Kragenhai
Zebrahai
Leopardenhai
Seidenhai
Schwarzhai
Galapagoshai
Karibischer Riffhai
Bambushai
Epaulettenhai
Port-Jackson-Stierkopfhai | Stierkopfhai
Großer Hammerhai | Grosser Hammerhai
Glatter Hammerhai
Bogenstirn-Hammerhai
Schaufelnasen-Hammerhai
Zigarrenhai
Laternenhai
Sechskiemerhai
Siebenkiemerhai
Glatthai | Südlicher Glatthai
Hundshai
Marderhai | Gewöhnlicher Glatthai
Schlafhai
Pazifischer Schlafhai
Langflossen-Mako
Großaugen-Fuchshai
Pazifischer Fuchshai
Lachshai
Kleiner Gefleckter Katzenhai
Großgefleckter Katzenhai
Schwellhai
Schwarzmaul-Katzenhai
Krokodilhai
Gangeshai
Sandbankhai | Grosser Schwarzspitzenhai
Silberspitzenhai
Dämmerungshai
Schwarzflossenhai
Spinnerhai
Zwerglaternenhai
Australischer Schwarzspitzenhai
Bronzehai
Nervöser Hai
Sichelflossen-Zitronenhai
Gabelschwanz-Katzenhai
Kurzflossen-Mako
Stierhai
Hornhai
Japanischer Stierkopfhai
#end
x Rochen | | Rochen sind Verwandte der Haie, aber keine Haie.
x Delfin | | Delfine sind Säugetiere.
x Orca | Schwertwal; Killerwal | Der Orca ist ein Wal.
x Barrakuda | | Ein Raubfisch, aber kein Hai.
x Hecht | | Ein Süsswasserfisch, kein Hai.
x Wels | | Ein Süsswasserfisch, kein Hai.
`,
  },
]);
