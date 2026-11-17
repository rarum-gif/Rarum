import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("gaming", [
  {
    id: "zelda-spiel",
    prompt: "Nenne ein Spiel der „The Legend of Zelda“-Reihe.",
    topic: "Videospiele",
    difficulty: 3,
    sources: [wiki("The Legend of Zelda")],
    list: `
K Breath of the Wild | The Legend of Zelda: Breath of the Wild; BotW
K Tears of the Kingdom | The Legend of Zelda: Tears of the Kingdom; TotK
K Ocarina of Time | The Legend of Zelda: Ocarina of Time; OoT
F The Legend of Zelda | Zelda 1
F A Link to the Past | ALttP
F Majora's Mask | Majoras Mask
F The Wind Waker | Wind Waker
F Twilight Princess
F Skyward Sword
F Link's Awakening | Links Awakening
U Zelda II: The Adventure of Link | The Adventure of Link; Zelda II; Zelda 2
U A Link Between Worlds
U Echoes of Wisdom
U The Minish Cap | Minish Cap
U Phantom Hourglass
U Spirit Tracks
U Oracle of Seasons
U Oracle of Ages
U Hyrule Warriors | | Ein Ableger im Musou-Stil.
R Four Swords Adventures
R Four Swords
R Tri Force Heroes
R Hyrule Warriors: Zeit der Verheerung | Age of Calamity; Zeit der Verheerung
R Cadence of Hyrule
R Link's Crossbow Training
V Freshly-Picked Tingle's Rosy Rupeeland | Tingle's Rosy Rupeeland; Tingle
V BS Zelda no Densetsu | BS The Legend of Zelda; BS Zelda
L Link: The Faces of Evil | Faces of Evil
L Zelda: The Wand of Gamelon | Wand of Gamelon
L Zelda's Adventure
x Super Mario 64 | | Ein Mario-Spiel, kein Zelda.
x Elden Ring | | Kein Zelda – ein Spiel von FromSoftware.
x Genshin Impact | | Kein Zelda, auch wenn es ähnlich aussieht.
`,
  },
  {
    id: "minecraft-mob",
    prompt: "Nenne ein Lebewesen (Mob) aus Minecraft.",
    topic: "Videospiele",
    difficulty: 2,
    sources: [wiki("Minecraft")],
    list: `
K Creeper
K Zombie
K Skelett | Skeleton
K Enderman
K Spinne | Spider
K Schwein | Pig
K Kuh | Cow
K Schaf | Sheep
K Huhn | Chicken
K Dorfbewohner | Villager
F Eisengolem | Iron Golem
F Schneegolem | Snow Golem
F Wolf | Hund
F Katze | Cat
F Pferd | Horse
F Ghast
F Lohe | Blaze
F Hexe | Witch
F Schleim | Slime
F Wither
F Enderdrache | Ender Dragon
F Warden | Wärter
F Axolotl
F Biene | Bee
F Fuchs | Fox
F Panda
F Eisbär | Polar Bear
F Ozelot | Ocelot
F Lama | Llama
F Esel | Donkey
F Papagei | Parrot
F Delfin | Dolphin
F Schildkröte | Turtle
F Tintenfisch | Squid
F Fledermaus | Bat
F Kaninchen | Rabbit
F Pilzkuh | Mooshroom
F Piglin
F Phantom
F Höhlenspinne | Cave Spider
F Wüstenzombie | Husk
F Ertrunkener | Drowned
F Zombiedorfbewohner | Zombie Villager
F Plünderer | Pillager
F Verwüster | Ravager
F Diener | Vindicator
F Magier | Evoker
F Plagegeist | Vex
#auto
Magmawürfel | Magma Cube
Endermite
Silberfischchen | Silverfish
Shulker
Eiswanderer | Stray
Witherskelett | Wither Skeleton
Wächter | Guardian
Großer Wächter | Elder Guardian
Piglin-Barbar | Piglin Brute
Zombifizierter Piglin | Zombified Piglin; Schweinezombie; Zombie Pigman
Hoglin
Zoglin
Schreiter | Strider
Leuchttintenfisch | Glow Squid
Kugelfisch | Pufferfish
Lachs | Salmon
Kabeljau | Cod
Tropenfisch | Tropical Fish
Fahrender Händler | Wandering Trader
Maultier | Mule
Skelettpferd | Skeleton Horse
Zombiepferd | Zombie Horse
Ziege | Goat
Frosch | Frog
Kaulquappe | Tadpole
Hilfsgeist | Allay
Kamel | Camel
Schnüffler | Sniffer
Gürteltier | Armadillo
Böe | Breeze
Sumpfskelett | Bogged
Knarz | Creaking
Glücklicher Ghast | Happy Ghast
Kupfergolem | Copper Golem
Händlerlama | Trader Llama
Illusionist | Illusioner
Riese | Giant
Hühnerjockey | Chicken Jockey
Spinnenreiter | Spider Jockey
Nautilus
Zombie-Nautilus | Zombie Nautilus
Ausgedörrter | Parched
Kamelhülle | Camel Husk
#end
x Steve | | Steve ist die Spielfigur, kein Mob.
x Herobrine | | Herobrine ist eine Legende aus der Community – es gibt ihn im Spiel nicht.
x Drache | | Gemeint ist wohl der Enderdrache.
`,
  },
  {
    id: "fromsoftware-spiel",
    prompt: "Nenne ein Spiel, das von FromSoftware entwickelt wurde.",
    topic: "Entwickler",
    difficulty: 3,
    sources: [wiki("FromSoftware")],
    list: `
K Elden Ring
K Dark Souls
F Dark Souls II | Dark Souls 2
F Dark Souls III | Dark Souls 3
F Bloodborne
F Sekiro: Shadows Die Twice | Sekiro
F Demon's Souls | Demons Souls
U Elden Ring Nightreign | Nightreign
U Armored Core VI: Fires of Rubicon | Armored Core VI; Armored Core 6; Fires of Rubicon
U Armored Core | | Die Mecha-Reihe von FromSoftware.
U Elden Ring: Shadow of the Erdtree | Shadow of the Erdtree | Erweiterung von Elden Ring.
R King's Field
R Déraciné | Deracine
R Metal Wolf Chaos
R Chromehounds
R Shadow Tower
R Otogi: Myth of Demons | Otogi
R Tenchu | | FromSoftware entwickelte mehrere Teile der Reihe.
R Ninja Blade
R Enchanted Arms
V Echo Night
V Evergrace
V Lost Kingdoms
V Eternal Ring
V Kuon
V Murakumo
V Spriggan: Lunar Verse
V Steel Battalion: Heavy Armor
V Another Century's Episode
V Frame Gride
V Sword of Moonlight
x Lies of P | | Ein Souls-like vom Studio Neowiz, nicht von FromSoftware.
x Nioh | | Entwickelt von Team Ninja, nicht von FromSoftware.
x Hollow Knight | | Entwickelt von Team Cherry.
x Black Myth: Wukong | Black Myth | Entwickelt von Game Science.
x The Witcher | | Entwickelt von CD Projekt Red.
`,
  },
  {
    id: "pokemon-typ",
    prompt: "Nenne einen Pokémon-Typ.",
    topic: "Videospiele",
    difficulty: 2,
    sources: [wiki("Pokémon")],
    list: `
K Feuer | Fire
K Wasser | Water
K Pflanze | Grass; Gras
K Elektro | Electric; Elektrik
K Normal
F Psycho | Psychic; Psycho-Typ
F Gift | Poison
F Flug | Flying; Fliegen
F Boden | Ground
F Eis | Ice
F Kampf | Fighting
F Geist | Ghost
F Drache | Dragon
F Käfer | Bug
F Gestein | Rock; Stein
U Unlicht | Dark; Dunkel
U Stahl | Steel
U Fee | Fairy
R Stellar | | Ein Sondertyp für die Terakristallisierung.
x Licht | | Einen Licht-Typ gibt es nicht – gemeint ist vielleicht Fee.
x Luft | | Einen Luft-Typ gibt es nicht – gemeint ist wohl Flug.
x Metall | | Der Typ heisst Stahl.
x Sound | | Einen Sound-Typ gibt es nicht.
`,
  },
]);
