import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("reisen", [
  {
    id: "rom-sehenswuerdigkeit",
    prompt: "Nenne eine Sehenswürdigkeit in Rom.",
    topic: "Sehenswürdigkeiten",
    difficulty: 1,
    sources: [wiki("Rom")],
    list: `
K Kolosseum | Colosseum; Kolloseum
K Trevi-Brunnen | Fontana di Trevi; Trevibrunnen
K Pantheon
K Petersdom | Basilika St. Peter; Petersbasilika
K Forum Romanum | Forum
K Spanische Treppe
F Vatikanische Museen | Vatikanmuseen
F Sixtinische Kapelle
F Petersplatz
F Piazza Navona
F Engelsburg | Castel Sant'Angelo
F Palatin
F Circus Maximus
F Kapitol | Kapitolsplatz; Kapitolshügel
F Vittoriano | Monumento a Vittorio Emanuele II; Nationaldenkmal; Schreibmaschine
F Villa Borghese
F Trastevere
F Konstantinsbogen
F Mund der Wahrheit | Bocca della Verità
F Caracalla-Thermen | Caracallathermen
F Katakomben | Calixtus-Katakomben; Domitilla-Katakomben
F Via Appia | Via Appia Antica
F Vatikanstadt | Vatikan | Liegt mitten in Rom.
#auto
Galleria Borghese
Kapitolinische Museen
Piazza del Popolo
Campo de' Fiori
Santa Maria Maggiore
Lateranbasilika | San Giovanni in Laterano
Sankt Paul vor den Mauern | San Paolo fuori le mura
Trajanssäule
Trajansmärkte
Mark-Aurel-Säule
Ara Pacis
Augustusmausoleum
Piazza Venezia
Quirinalspalast | Quirinal
Palazzo Farnese
Palazzo Doria Pamphilj
Gianicolo | Janiculum
Aventin | Schlüsselloch der Malteser
Cestius-Pyramide
Marcellustheater | Teatro di Marcello
Largo di Torre Argentina
Santa Maria in Trastevere
San Pietro in Vincoli
Santa Maria sopra Minerva
Il Gesù
San Clemente
Santa Maria della Vittoria
Kapuzinergruft
Villa Doria Pamphilj
Via del Corso
Via Condotti
Tiberinsel
Engelsbrücke | Ponte Sant'Angelo
Ponte Milvio
Palazzo Altemps
Palazzo Massimo
Domus Aurea
Cinecittà
EUR | Palazzo della Civiltà Italiana; Quadratisches Kolosseum
Stadio Olimpico
Vierströmebrunnen | Fontana dei Quattro Fiumi
Tritonbrunnen
Barcaccia
Scala Santa
Protestantischer Friedhof
Testaccio
Monti
Villa Ada
Villa Torlonia
Villa Medici
Villa Farnesina
Orangengarten | Giardino degli Aranci
Rosengarten
Circus des Maxentius
Basilika des Maxentius
Thermen des Diokletian | Diokletiansthermen
Santa Croce in Gerusalemme
Santa Maria in Cosmedin
Santa Prassede
Santi Quattro Coronati
San Luigi dei Francesi
Sant'Agnese in Agone
Sant'Ivo alla Sapienza
Chiesa Nuova
Palazzo Barberini
Palazzo Venezia
Palazzo Spada
Galleria Doria Pamphilj
Museo Nazionale Romano
MAXXI
Auditorium Parco della Musica
Pincio
Porta Portese
Porta Maggiore
Aurelianische Mauer
Mercato di Testaccio
Piazza di Spagna
Fontana delle Tartarughe | Schildkrötenbrunnen
Bienenbrunnen
Elefant von Minerva | Pulcino della Minerva
Vatikanische Gärten
Nekropole unter dem Petersdom | Vatikanische Nekropole
Grabmal der Caecilia Metella
Aquädukte | Parco degli Acquedotti
Ostia Antica | | Die antike Hafenstadt gehört zum Stadtgebiet von Rom.
#end
x Schiefer Turm | Schiefer Turm von Pisa | Der steht in Pisa.
x Markusplatz | | Der liegt in Venedig.
x Rialtobrücke | | Die steht in Venedig.
x Mailänder Dom | | Der steht in Mailand.
x Uffizien | | Die liegen in Florenz.
x Pompeji | | Das liegt bei Neapel.
x Eiffelturm | | Der steht in Paris.
`,
  },
  {
    id: "new-york-sehenswuerdigkeit",
    prompt: "Nenne eine Sehenswürdigkeit in New York City.",
    topic: "Sehenswürdigkeiten",
    difficulty: 1,
    sources: [wiki("New York City")],
    list: `
K Freiheitsstatue | Statue of Liberty
K Empire State Building
K Central Park
K Times Square
K Brooklyn Bridge
K One World Trade Center | Freedom Tower; World Trade Center; WTC
F Rockefeller Center | Top of the Rock
F Chrysler Building
F 9/11 Memorial | National September 11 Memorial; Ground Zero
F Metropolitan Museum of Art | Met; Metropolitan Museum
F MoMA | Museum of Modern Art
F Guggenheim-Museum | Guggenheim; Solomon R. Guggenheim Museum
F Grand Central Terminal | Grand Central; Grand Central Station
F High Line
F Wall Street | Charging Bull; Wall Street Bulle
F Broadway
F Fifth Avenue | 5th Avenue
F Flatiron Building
F Ellis Island
F Madison Square Garden
F Staten Island Ferry | Staten-Island-Fähre
F Chinatown
F Little Italy
F American Museum of Natural History | Naturkundemuseum; Natural History Museum
F Coney Island
F Yankee Stadium
F Harlem
F St. Patrick's Cathedral | St. Patrick's
F UN-Hauptquartier | UNO-Hauptquartier; Vereinte Nationen; United Nations Headquarters
F Radio City Music Hall
F Hudson Yards | The Vessel; Vessel; Edge
#auto
SoHo
Greenwich Village
Apollo Theater
Carnegie Hall
Lincoln Center | Metropolitan Opera
Trinity Church
New York Public Library | Public Library
Bryant Park
Washington Square Park | Washington Square
Summit One Vanderbilt | One Vanderbilt
Whitney Museum
Frick Collection
Cathedral of St. John the Divine
Manhattan Bridge
Williamsburg
DUMBO
Brooklyn Botanic Garden
Prospect Park
Roosevelt Island Tramway | Roosevelt Island
Intrepid Museum | Intrepid Sea, Air & Space Museum
Chelsea Market
Battery Park
Little Island
Bronx Zoo
Oculus
Macy's | Macy's Herald Square
Strawberry Fields
Dakota Building | The Dakota
Plaza Hotel
Waldorf Astoria
Tiffany & Co. | Tiffany
The Cloisters | Cloisters
Bow Bridge
Bethesda Fountain | Bethesda-Brunnen
Wollman Rink
Belvedere Castle
Brooklyn Museum
Barclays Center
Citi Field
Arthur Ashe Stadium | USTA Billie Jean King National Tennis Center
Flushing Meadows
Unisphere
Governors Island
Brooklyn Heights Promenade | Brooklyn Promenade
Brooklyn Bridge Park
Woolworth Building
Seagram Building
Lever House
MetLife Building
432 Park Avenue
Central Park Tower
One57
Steinway Tower
New Museum
Tenement Museum
Museum of the City of New York
Neue Galerie
Morgan Library
Gracie Mansion
City Hall
Federal Hall
Stock Exchange | New York Stock Exchange; NYSE
South Street Seaport
Pier 17
Chelsea Piers
Meatpacking District
Hell's Kitchen
Tribeca
East Village
Lower East Side
Upper East Side
Upper West Side
Midtown
Koreatown
Washington Heights
Queens
Brooklyn
Bronx
Staten Island
Manhattan
Long Island City
Astoria
Flushing
Arthur Avenue
Katz's Delicatessen
Smorgasburg
Brooklyn Navy Yard
Green-Wood Cemetery
Woodlawn Cemetery
Rockaway Beach
Jones Beach
Fort Tryon Park
Inwood Hill Park
Riverside Park
Riverside Church
Grant's Tomb
Columbia University
New York University | NYU
The Shed
Edge | The Edge
Top of the Rock
Moynihan Train Hall
Penn Station
Port Authority
Holland Tunnel
Lincoln Tunnel
George Washington Bridge
Verrazzano-Narrows Bridge | Verrazano Bridge
Queensboro Bridge
Williamsburg Bridge
Hell Gate Bridge
Statue of Liberty Museum
Tiffany
Trump Tower
Saks Fifth Avenue
Bloomingdale's
FAO Schwarz
Apple Store Fifth Avenue
Nintendo New York
M&M's World
Hershey's Chocolate World
Madame Tussauds
Ripley's Believe It or Not
Museum of Ice Cream
Museum of Sex
#end
x Golden Gate Bridge | | Die steht in San Francisco.
x Hollywood Sign | Hollywood-Schriftzug | Der steht in Los Angeles.
x Weißes Haus | Weisses Haus; White House | Das steht in Washington, D.C.
x Alcatraz | | Liegt in der Bucht von San Francisco.
x Kapitol | | Steht in Washington, D.C.
x Las Vegas Strip | | Liegt in Las Vegas.
x Space Needle | | Steht in Seattle.
`,
  },
  {
    id: "kanarische-insel",
    prompt: "Nenne eine der Kanarischen Inseln.",
    topic: "Reiseziele",
    difficulty: 2,
    sources: [wiki("Kanarische Inseln")],
    list: `
K Teneriffa | Tenerife
K Gran Canaria
K Lanzarote
K Fuerteventura
F La Palma
F La Gomera | Gomera
U El Hierro | Hierro
R La Graciosa | Graciosa
V Lobos | Isla de Lobos
L Alegranza
L Montaña Clara | Montana Clara
L Roque del Este
L Roque del Oeste
x Mallorca | | Mallorca gehört zu den Balearen.
x Ibiza | | Ibiza gehört zu den Balearen.
x Menorca | | Menorca gehört zu den Balearen.
x Madeira | | Madeira gehört zu Portugal.
x Azoren | | Die Azoren gehören zu Portugal.
x Kap Verde | Kapverden | Die Kapverden sind ein eigener Staat.
`,
  },
]);
