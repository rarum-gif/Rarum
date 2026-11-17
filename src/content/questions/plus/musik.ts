import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("musik", [
  {
    id: "queen-song",
    prompt: "Nenne einen Song der Band Queen.",
    topic: "Songs",
    difficulty: 2,
    sources: [wiki("Queen (Band)")],
    list: `
K Bohemian Rhapsody
K We Will Rock You
K We Are the Champions
K Don't Stop Me Now
K Another One Bites the Dust
F Radio Ga Ga
F I Want to Break Free
F Under Pressure
F Somebody to Love
F The Show Must Go On
F Killer Queen
F Who Wants to Live Forever
F Crazy Little Thing Called Love
F A Kind of Magic
#auto
Bicycle Race
Fat Bottomed Girls
I Want It All
Innuendo
Love of My Life
You're My Best Friend
Flash | Flash's Theme
These Are the Days of Our Lives
Too Much Love Will Kill You
Hammer to Fall
It's a Hard Life
Friends Will Be Friends
Princes of the Universe
One Vision
Breakthru
The Miracle
Headlong
I'm Going Slightly Mad
Heaven for Everyone
Seven Seas of Rhye
Now I'm Here
Tie Your Mother Down
Spread Your Wings
Play the Game
Save Me
Keep Yourself Alive
Stone Cold Crazy
Good Old-Fashioned Lover Boy
The Invisible Man
Scandal
A Winter's Tale
Let Me Live
You Don't Fool Me
No-One but You | No One but You
Mother Love
Brighton Rock
'39 | 39
Sheer Heart Attack
Liar
Death on Two Legs
The Prophet's Song
Bijou
Las Palabras de Amor
Body Language
Back Chat
Calling All Girls
Mustapha
Dragon Attack
Need Your Loving Tonight
Machines | Machines (Or Back to Humans)
Is This the World We Created...? | Is This the World We Created
Pain Is So Close to Pleasure
Was It All Worth It
Bring Back That Leroy Brown
Lazing on a Sunday Afternoon
In the Lap of the Gods
White Queen | White Queen (As It Began)
The March of the Black Queen | March of the Black Queen
Ogre Battle
Teo Torriatte | Teo Torriatte (Let Us Cling Together)
Tenement Funster
Lily of the Valley
Sweet Lady
Doing All Right
Great King Rat
Jealousy
All Dead, All Dead
Fun It
Dead on Time
In Only Seven Days
Don't Try Suicide
Rock It | Rock It (Prime Jive)
Coming Soon
Put Out the Fire
Staying Power
Cool Cat
Tear It Up
Man on the Prowl
Gimme the Prize
Don't Lose Your Head
Rain Must Fall
Party
Khashoggi's Ship
All God's People
Delilah
Ride the Wild Wind
The Hitman
Dreamer's Ball
Let Me Entertain You
Leaving Home Ain't Easy
More of That Jazz
Get Down, Make Love | Get Down Make Love
Long Away
Drowse
You Take My Breath Away
Sail Away Sweet Sister
The Night Comes Down
My Fairy King
Modern Times Rock 'n' Roll
Misfire
Dear Friends
Flick of the Wrist
Stone Cold Crazy
She Makes Me
Love of My Life
Mad the Swine
Ogre Battle
In the Lap of the Gods... Revisited
Some Day One Day
The Loser in the End
Funny How Love Is
The Fairy Feller's Master-Stroke | Fairy Feller's Master-Stroke
Nevermore
Sleeping on the Sidewalk
Who Needs You
It's Late
My Melancholy Blues
Somebody to Love
Teo Torriatte
Mustapha
Fight from the Inside
Sheer Heart Attack
Spread Your Wings
Life Is Real | Life Is Real (Song for Lennon)
Under Pressure
Action This Day
Tear It Up
Mother Love
My Life Has Been Saved
I Was Born to Love You
Made in Heaven
It's a Beautiful Day
Yeah
#end
x Imagine | | Ein Song von John Lennon.
x Hotel California | | Ein Song der Eagles.
x Stairway to Heaven | | Ein Song von Led Zeppelin.
x Living on My Own | | Ein Solo-Song von Freddie Mercury, nicht von Queen.
x Barcelona | | Ein Duett von Freddie Mercury und Montserrat Caballé, nicht von Queen.
x The Great Pretender | | Freddie Mercurys Solo-Version, nicht von Queen.
`,
  },
  {
    id: "abba-song",
    prompt: "Nenne einen Song von ABBA.",
    topic: "Songs",
    difficulty: 2,
    sources: [wiki("ABBA")],
    list: `
K Dancing Queen
K Mamma Mia
K Waterloo
K The Winner Takes It All | Winner Takes It All
K Gimme! Gimme! Gimme! | Gimme Gimme Gimme; Gimme! Gimme! Gimme! (A Man After Midnight)
K Money, Money, Money | Money Money Money
F Super Trouper
F Fernando
F Take a Chance on Me
F Knowing Me, Knowing You | Knowing Me Knowing You
F Chiquitita
F Voulez-Vous
F SOS
F Thank You for the Music
F I Have a Dream
F Lay All Your Love on Me
#auto
Does Your Mother Know
The Name of the Game
Ring Ring
Honey, Honey | Honey Honey
I Do, I Do, I Do, I Do, I Do | I Do I Do I Do I Do I Do
Summer Night City
One of Us
Head over Heels
When All Is Said and Done
The Day Before You Came
Under Attack
Angeleyes | Angel Eyes
Eagle
So Long
Hasta Mañana | Hasta Manana
Rock Me
Our Last Summer
Slipping Through My Fingers
Andante, Andante | Andante Andante
The Visitors
Happy New Year
I Still Have Faith in You
Don't Shut Me Down
Just a Notion
Little Things
Put On Your White Sombrero
I've Been Waiting for You
Hole in Your Soul
Why Did It Have to Be Me
Dum Dum Diddle
Tiger
Arrival
My Love, My Life | My Love My Life
That's Me
Move On
Lovelight
I Wonder (Departure) | I Wonder
Kisses of Fire
If It Wasn't for the Nights
As Good as New
Me and I
Two for the Price of One
Cassandra
No Doubt About It
When You Danced with Me
Bumblebee
I Can Be That Woman
Keep an Eye on Dan
Ode to Freedom
Watch Out
King Kong Song
Nina, Pretty Ballerina | Nina Pretty Ballerina
People Need Love
He Is Your Brother
Love Isn't Easy | Love Isn't Easy (But It Sure Is Hard Enough)
Bang-A-Boomerang | Bang a Boomerang
Intermezzo No. 1
Crazy World
Gonna Sing You My Lovesong
Hey, Hey Helen | Hey Hey Helen
Man in the Middle
Sitting in the Palmtree
What About Livingstone
Suzy-Hang-Around
Should I Laugh or Cry
Elaine
The Way Old Friends Do
Soldiers
Like an Angel Passing Through My Room
Merry-Go-Round
Rock'n Roll Band
I Am the City
Lovers (Live a Little Longer)
On and On and On
The Piper
Me and Bobby and Bobby's Brother
Another Town, Another Train
Disillusion
I Saw It in the Mirror
Santa Rosa
She's My Kind of Girl
Fernando
Dance (While the Music Still Goes On)
Tropical Loveland
Thank You for the Music
Just Like That
#end
x Mamma Mia! Here We Go Again | | Das ist der Film, kein eigener Song.
x Dancing in the Dark | | Ein Song von Bruce Springsteen.
x Bohemian Rhapsody | | Ein Song von Queen.
`,
  },
  {
    id: "michael-jackson-song",
    prompt: "Nenne einen Song von Michael Jackson.",
    topic: "Songs",
    difficulty: 2,
    sources: [wiki("Michael Jackson")],
    list: `
K Thriller
K Billie Jean
K Beat It
K Bad
K Smooth Criminal
K Black or White
F Man in the Mirror
F Heal the World
F Earth Song
F They Don't Care About Us
F Remember the Time
F Dirty Diana
F The Way You Make Me Feel
F You Are Not Alone
F Don't Stop 'til You Get Enough | Don't Stop Til You Get Enough
F Rock with You
F Wanna Be Startin' Somethin' | Wanna Be Starting Something
F Human Nature
#auto
P.Y.T. (Pretty Young Thing) | PYT; P.Y.T.; Pretty Young Thing
Off the Wall
She's Out of My Life
Leave Me Alone
Liberian Girl
Speed Demon
Another Part of Me
Jam
In the Closet
Who Is It
Give In to Me
Will You Be There
Gone Too Soon
Dangerous
Scream
Stranger in Moscow
Childhood
HIStory | History
Blood on the Dance Floor
Ghosts
You Rock My World
Butterflies
Cry
Unbreakable
Invincible
Break of Dawn
Ben
Got to Be There
Rockin' Robin
One Day in Your Life
This Is It
Hold My Hand
Love Never Felt So Good
Workin' Day and Night
Girlfriend
I Just Can't Stop Loving You
The Girl Is Mine
Say Say Say
Baby Be Mine
The Lady in My Life
Can't Let Her Get Away
Keep the Faith
Heaven Can Wait
Threatened
Xscape
Smile
Little Susie
D.S.
Tabloid Junkie
Money
2 Bad
Morphine
Is It Scary
Superfly Sister
Speechless
Whatever Happens
Privacy
Behind the Mask
Hollywood Tonight
Much Too Soon
Earth Song
Why You Wanna Trip on Me
She Drives Me Wild
Can You Feel It | | Mit den Jacksons.
Blame It on the Boogie | | Mit den Jacksons.
Shake Your Body (Down to the Ground) | Shake Your Body | Mit den Jacksons.
ABC | | Mit den Jackson 5.
I Want You Back | | Mit den Jackson 5.
I'll Be There | | Mit den Jackson 5.
The Love You Save | | Mit den Jackson 5.
State of Shock | | Mit den Jacksons und Mick Jagger.
We Are the World | | USA for Africa – Michael Jackson schrieb den Song mit Lionel Richie.
Torture | | Mit den Jacksons.
Get on the Floor
Burn This Disco Out
I Can't Help It
It's the Falling in Love
Fly Away
Bad
Streetwalker
Who's Lovin' You
Farewell My Summer Love
Thriller
Ease on Down the Road
You Can't Win
Music and Me
Happy
Ben
#end
x Purple Rain | | Ein Song von Prince.
x Like a Prayer | | Ein Song von Madonna.
x Uptown Funk | | Ein Song von Mark Ronson und Bruno Mars.
`,
  },
  {
    id: "taylor-swift-album",
    prompt: "Nenne ein Studioalbum von Taylor Swift.",
    topic: "Alben",
    difficulty: 2,
    sources: [wiki("Taylor Swift")],
    list: `
K 1989 | 1989 (Taylor's Version)
K Midnights
K Folklore
K Lover
K Reputation
F Red | Red (Taylor's Version)
F Fearless | Fearless (Taylor's Version)
F The Tortured Poets Department | Tortured Poets Department; TTPD
F Evermore
F The Life of a Showgirl | Life of a Showgirl; Showgirl
U Speak Now | Speak Now (Taylor's Version)
R Taylor Swift | Debütalbum
x Folklore: The Long Pond Studio Sessions | | Ein Konzertfilm mit Live-Album, kein Studioalbum.
x The Eras Tour | Eras Tour | Das ist die Tournee, kein Studioalbum.
`,
  },
  {
    id: "taylor-swift-song",
    prompt: "Nenne einen Song von Taylor Swift.",
    topic: "Songs",
    difficulty: 2,
    sources: [wiki("Taylor Swift")],
    list: `
K Shake It Off
K Blank Space
K Love Story
K Anti-Hero | Antihero
K Cruel Summer
K You Belong with Me
F Bad Blood
F Style
F We Are Never Ever Getting Back Together
F I Knew You Were Trouble
F 22
F Wildest Dreams
F Look What You Made Me Do
F Delicate
F Lover
F Cardigan
F All Too Well
F Willow
F Fortnight
F Karma
F The Fate of Ophelia
F Exile
F ME!
F You Need to Calm Down
#auto
Our Song
Teardrops on My Guitar
Tim McGraw
Picture to Burn
Should've Said No
White Horse
Fifteen
Mine
Back to December
Mean
Sparks Fly
Ours
Enchanted
Begin Again
Red
Everything Has Changed
Out of the Woods
New Romantics
Welcome to New York
Clean
...Ready for It? | Ready for It
End Game
Gorgeous
Getaway Car
Don't Blame Me
The Man
The Archer
Paper Rings
Cornelia Street
Betty
August
The 1
Champagne Problems
No Body, No Crime | No Body No Crime
Gold Rush
Marjorie
Lavender Haze
Bejeweled
Midnight Rain
Maroon
Snow on the Beach
Mastermind
Is It Over Now?
Now That We Don't Talk
Slut!
Say Don't Go
Down Bad
I Can Do It with a Broken Heart
So Long, London | So Long London
The Smallest Man Who Ever Lived
But Daddy I Love Him
Florida!!!
Who's Afraid of Little Old Me?
The Black Dog
Opalite
Elizabeth Taylor
Father Figure
Wood
Actually Romantic
Wi$h Li$t | Wish List
Eldest Daughter
Ruin the Friendship
Cancelled!
Honey
The Life of a Showgirl
I Don't Wanna Live Forever
Safe & Sound | Safe and Sound
Eyes Open
Sweeter Than Fiction
Today Was a Fairytale
Christmas Tree Farm
Only the Young
Carolina
The Last Great American Dynasty
Mirrorball
Seven
My Tears Ricochet
Invisible String
Mad Woman
Epiphany
Peace
Hoax
This Is Me Trying
Illicit Affairs
Tolerate It
Happiness
Dorothea
Coney Island
Ivy
Cowboy Like Me
Long Story Short
Closure
Evermore
You're On Your Own, Kid | You're on Your Own Kid
Vigilante Shit
Sweet Nothing
Labyrinth
Question...?
Dear Reader
Hits Different
You're Losing Me
Death by a Thousand Cuts
London Boy
Afterglow
Soon You'll Get Better
False God
Miss Americana & the Heartbreak Prince
I Forgot That You Existed
It's Nice to Have a Friend
Daylight
Dress
Call It What You Want
King of My Heart
Dancing with Our Hands Tied
So It Goes...
I Did Something Bad
This Is Why We Can't Have Nice Things
New Year's Day
I Wish You Would
How You Get the Girl
This Love
I Know Places
Wonderland
You Are in Love
State of Grace
Holy Ground
Treacherous
Stay Stay Stay
Starlight
The Last Time
Sad Beautiful Tragic
The Lucky One
I Almost Do
Come Back... Be Here
Girl at Home
The Moment I Knew
Mr. Perfectly Fine
You All Over Me
Better Man
Nothing New
Message in a Bottle
I Bet You Think About Me
Forever Winter
Run
The Very First Night
Dear John
The Story of Us
Never Grow Up
Haunted
Long Live
Last Kiss
Innocent
Better Than Revenge
Speak Now
Superman
Electric Touch
When Emma Falls in Love
I Can See You
Castles Crumbling
Foolish One
Timeless
Change
Breathe
Hey Stephen
Tell Me Why
You're Not Sorry
The Way I Loved You
Forever & Always | Forever and Always
The Best Day
Jump Then Fall
Untouchable
Come In with the Rain
Superstar
The Other Side of the Door
Mary's Song (Oh My My My) | Mary's Song
A Place in This World
Cold as You
Tied Together with a Smile
Stay Beautiful
Invisible
A Perfectly Good Heart
I'm Only Me When I'm with You
Beautiful Eyes
The Alchemy
Guilty as Sin?
Loml
I Look in People's Windows
The Prophecy
Cassandra
Peter
The Bolter
Robin
The Manuscript
Clara Bow
Fresh Out the Slammer
My Boy Only Breaks His Favorite Toys
The Tortured Poets Department
I Hate It Here
thanK you aIMee | Thank You Aimee
The Albatross
Chloe or Sam or Sophia or Marcus
How Did It End?
So High School
Sweeter Than Fiction
Everything Has Changed
Renegade | | Big Red Machine feat. Taylor Swift.
#end
x Rolling in the Deep | | Ein Song von Adele.
x Bad Guy | | Ein Song von Billie Eilish.
x Flowers | | Ein Song von Miley Cyrus.
x Espresso | | Ein Song von Sabrina Carpenter.
x drivers license | Drivers License | Ein Song von Olivia Rodrigo.
`,
  },
  {
    id: "rammstein-song",
    prompt: "Nenne einen Song von Rammstein.",
    topic: "Songs",
    difficulty: 3,
    sources: [wiki("Rammstein")],
    list: `
K Du hast
K Sonne
K Engel
K Deutschland
K Ich will
F Du riechst so gut
F Links 2 3 4 | Links 2-3-4; Links zwo drei vier
F Mein Teil
F Amerika
F Ohne dich
F Mutter
F Feuer frei!
F Rosenrot
F Keine Lust
F Mein Herz brennt
F Radio
F Ausländer
F Haifisch
F Zeit
F Seemann
F Asche zu Asche
F Pussy
F Benzin
#auto
Ich tu dir weh
Mann gegen Mann
Zick Zack
Adieu
Rammstein
Weißes Fleisch
Wollt ihr das Bett in Flammen sehen?
Heirate mich
Laichzeit
Spiel mit mir
Klavier
Alter Mann
Tier
Bück dich
Los
Stripped
Das Modell
Mein Land
Reise, Reise | Reise Reise
Moskau
Morgenstern
Dalai Lama
Amour
Stein um Stein
Te quiero puta!
Wo bist du?
Spring
Rammlied
B********
Waidmanns Heil
Wiener Blut
Frühling in Paris
Liebe ist für alle da
Mehr
Roter Sand
Puppe
Was ich liebe
Diamant
Weit weg
Tattoo
Hallomann
Sex
Zeig dich
Armee der Tristen
Dicke Titten
Angst
Lügen
Schwarz
Giftig
OK
Meine Tränen
Ein Lied
Rein raus
Nebel
Hilf mir
Feuer und Wasser
Sehnsucht
Bestrafe mich
Eifersucht
Küss mich (Fellfrosch) | Küss mich
Kokain
Das alte Leid
Seemann
Der Meister
Wilder Wein
Halleluja
Ich will
Donaukinder
Mein Herz brennt
Gib mir deine Augen
Hallelujah
Pet Sematary
Stirb nicht vor mir
Führe mich
Mann gegen Mann
Wo bist du
Adios
Heirate mich
Schtiel
Feuerräder
Ramm 4 | Ramm4
Bück dich
Feuer frei
Zerstören
Benzin
Haifisch
#end
x 99 Luftballons | | Ein Song von Nena.
x Sonnentanz | | Ein Song von Klangkarussell.
x Ein Kompliment | | Ein Song der Sportfreunde Stiller.
x Links rechts | | Kein Rammstein-Song – gemeint ist wohl „Links 2 3 4“.
`,
  },
  {
    id: "eminem-song",
    prompt: "Nenne einen Song von Eminem.",
    topic: "Songs",
    difficulty: 2,
    sources: [wiki("Eminem")],
    list: `
K Lose Yourself
K The Real Slim Shady | Real Slim Shady
K Without Me
K Stan
K Mockingbird
K Love the Way You Lie
F Not Afraid
F My Name Is
F Rap God
F Sing for the Moment
F Cleanin' Out My Closet | Cleaning Out My Closet
F When I'm Gone
F Like Toy Soldiers
F Just Lose It
F Superman
F 'Till I Collapse | Till I Collapse
F The Monster
F Godzilla
F Venom
F Houdini
F Berzerk
F The Way I Am
#auto
Lucky You
Killshot
River
Walk on Water
Guts Over Fear
Beautiful
We Made You
Crack a Bottle
3 a.m. | 3 AM
Space Bound
No Love
Survival
Shake That
Ass Like That
Mosh
Kim
Criminal
Kill You
Marshall Mathers
Role Model
Guilty Conscience
My Fault
Brain Damage
Business
White America
Square Dance
Soldier
Say Goodbye Hollywood
Encore
Puke
Tobey
Somebody Save Me
Fuel
Darkness
Gnat
Those Kinda Nights
Headlights
Legacy
Bad Guy
So Much Better
Phenomenal
Kings Never Die
Campaign Speech
Nowhere Fast
Remind Me
Framed
Stepping Stone
Fall
Good Guy
Unaccommodating
Greatest
Yah Yah
Little Engine
Premonition
Temporary
Evil
Lucifer
Just Don't Give a Fuck
Rock Bottom
'97 Bonnie & Clyde | 97 Bonnie and Clyde
If I Had
Cum on Everybody
I'm Back
Amityville
Drug Ballad
Remember Me?
Under the Influence
When the Music Stops
Hailie's Song
Say What You Say
Drips
Forgot About Dre | | Dr. Dre feat. Eminem.
Smack That | | Akon feat. Eminem.
Airplanes, Part II | Airplanes Part 2
Love the Way You Lie (Part II)
Lighters
Fast Lane
Bad Meets Evil
Medicine Man
Big Weenie
Rain Man
Never Enough
Spend Some Time
One Shot 2 Shot
Like Home
Wicked Ways
Asshole
So Far...
Love Game
Stronger Than I Was
Headlights
Castle
Arose
Nowhere Fast
Chloraseptic
Believe
Untouchable
Need Me
In Your Head
Bad Husband
Kamikaze
The Ringer
Normal
Not Alike
Stepping Stone
Nice Guy
Good Guy
Fall
Darkness
Unaccommodating
Leaving Heaven
Lock It Up
Those Kinda Nights
Marsh
Never Love Again
Little Engine
Gnat
Book of Rhymes
Discombobulated
Habits
Antichrist
Renaissance
Brand New Dance
Fuel
Tobey
Somebody Save Me
Guess Who's Back
Shady XV
Detroit vs. Everybody
Vegas
Psycho
Patiently Waiting
Patiently Waiting | | 50 Cent feat. Eminem.
The Sauce
Bump Heads
Welcome 2 Detroit
#end
x In da Club | | Ein Song von 50 Cent.
x Still D.R.E. | | Ein Song von Dr. Dre – Eminem schrieb nur mit, rappt aber nicht.
x Gangsta's Paradise | | Ein Song von Coolio.
`,
  },
  {
    id: "eurovision-siegerland",
    prompt: "Nenne ein Land, das den Eurovision Song Contest gewonnen hat.",
    topic: "Musikgeschichte",
    difficulty: 3,
    sources: [wiki("Liste der Sieger des Eurovision Song Contests")],
    list: `
K Schweden
K Schweiz
K Deutschland
K Irland
K Italien
K Ukraine
F Frankreich
F Grossbritannien | Vereinigtes Königreich; England; UK
F Niederlande | Holland
F Norwegen
F Israel
F Österreich
F Finnland
F Dänemark
F Luxemburg
U Spanien
U Portugal
U Griechenland
U Türkei
U Serbien
U Russland
U Estland
U Lettland
U Belgien
R Monaco
R Aserbaidschan
V Jugoslawien
x Polen | | Polen hat den ESC noch nie gewonnen.
x Belarus | | Belarus hat den ESC noch nie gewonnen.
x Malta | | Malta hat den ESC noch nie gewonnen – trotz zweier zweiter Plätze.
x Island | | Island hat den ESC noch nie gewonnen – trotz zweier zweiter Plätze.
x Australien | | Australien hat den ESC noch nie gewonnen.
`,
  },
  {
    id: "rolling-stones-mitglied",
    prompt: "Nenne eine Person, die Mitglied der Rolling Stones ist oder war.",
    topic: "Bands",
    difficulty: 3,
    sources: [wiki("The Rolling Stones")],
    list: `
K Mick Jagger
K Keith Richards
F Charlie Watts
F Ronnie Wood | Ron Wood
U Bill Wyman
U Brian Jones
R Mick Taylor
V Ian Stewart
L Dick Taylor
L Tony Chapman
x Steve Jordan | | Er ist seit 2021 Schlagzeuger auf Tournee, aber kein offizielles Mitglied.
x Darryl Jones | | Langjähriger Bassist auf Tournee, aber kein offizielles Mitglied.
x Paul McCartney | | Er war bei den Beatles.
`,
  },
]);
