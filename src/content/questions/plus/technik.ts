import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("technik", [
  {
    id: "apple-produkt",
    prompt: "Nenne ein Produkt oder einen Dienst von Apple.",
    topic: "Computer",
    difficulty: 1,
    sources: [wiki("Apple")],
    list: `
K iPhone
K iPad
K MacBook
K AirPods
K Apple Watch
K iMac
F Mac | Macintosh
F MacBook Pro
F MacBook Air
F iPod
F Apple TV
F iCloud
F iTunes
F Siri
F Safari
F App Store
F Apple Music
F Apple Pay
F macOS | Mac OS; OS X
F iOS
F AirTag
F HomePod
F Apple Vision Pro | Vision Pro
F AirPods Pro
F AirPods Max
F Mac mini
F Mac Pro
F Apple Pencil
F FaceTime
F iMessage
F iPad Pro
F iPad Air
F iPad mini
#auto
Mac Studio
iPod nano
iPod shuffle
iPod touch
iPod classic
iPhone SE
Magic Mouse
Magic Keyboard
Magic Trackpad
HomePod mini
Apple TV+ | Apple TV Plus
Apple Arcade
Apple Card
Apple Karten | Apple Maps
Apple Fitness+ | Fitness Plus
Apple News
Apple One
Apple Books | iBooks
Apple Podcasts
iPadOS
watchOS
tvOS
visionOS
Final Cut Pro
Logic Pro
GarageBand
iMovie
Keynote
Pages
Numbers
Xcode
Swift | | Die Programmiersprache von Apple.
QuickTime
Studio Display
Pro Display XDR
Time Capsule
AirPort
Apple Lisa | Lisa
Apple I | Apple 1
Apple II | Apple 2
Apple III
Newton | MessagePad
Power Mac
PowerBook
iBook
eMac
Xserve
Pippin
iSight
Mac OS X
Beats | Beats by Dre | Gehört seit 2014 zu Apple.
Shazam | | Gehört seit 2018 zu Apple.
FileMaker | Claris
Apple Intelligence
Find My | Wo ist?
AirDrop
AirPlay
CarPlay
Apple Health | Health
Touch ID
Face ID
Lightning | | Der Anschluss von Apple.
MagSafe
Thunderbolt | | Gemeinsam mit Intel entwickelt.
Apple Silicon | M1; M2; M3; M4; M5
HyperCard
MobileMe
.Mac
iWork
iLife
Aperture
Ping
Apple Watch Ultra
iPhone Air
#end
x Galaxy | Samsung Galaxy | Das ist Samsung.
x Windows | | Das ist Microsoft.
x Android | | Das ist Google.
x Pixel | | Das ist Google.
x Surface | | Das ist Microsoft.
x Kindle | | Das ist Amazon.
x PlayStation | | Das ist Sony.
`,
  },
  {
    id: "google-produkt",
    prompt: "Nenne ein Produkt oder einen Dienst von Google.",
    topic: "Internet",
    difficulty: 2,
    sources: [wiki("Google LLC")],
    list: `
K Google Suche | Google Search; Suchmaschine
K YouTube
K Gmail | Google Mail
K Android
K Google Chrome | Chrome
K Google Maps | Maps
F Google Drive | Drive
F Google Docs | Docs
F Google Übersetzer | Google Translate; Translate
F Google Earth
F Street View
F Google Pixel | Pixel
F Google Fotos | Google Photos
F Google Play | Play Store; Google Play Store
F Gemini | Google Gemini
F Google Meet | Meet
F Google Kalender | Google Calendar
F Google Assistant
F Google Tabellen | Google Sheets; Sheets
F Google Präsentationen | Google Slides; Slides
F Chromecast
F Chromebook
F Google Home
F Nest | Google Nest
F YouTube Music
#auto
ChromeOS | Chrome OS
Google Lens
Google News
Google Scholar
Google Books
Google Analytics
Google Ads | AdWords
AdSense
Google Cloud
Firebase
Waze
Fitbit
Google Keep
Google Classroom
Google Formulare | Google Forms
Google Sites
Google Wallet | Google Pay
Google TV
Stadia
Google+ | Google Plus
Google Glass
Hangouts | Google Hangouts
Google Allo | Allo
Google Duo | Duo
Picasa
Orkut
Google Reader
Google Wave
Inbox by Gmail | Inbox
Blogger
Google Groups
Google Alerts
Google Trends
Gboard
Google One
Google Workspace | G Suite
YouTube Kids
YouTube TV
YouTube Premium
YouTube Shorts | Shorts
Google Flights
Google Fonts
TensorFlow
Go | Golang | Die Programmiersprache von Google.
Dart
Flutter
Angular
Kubernetes
Waymo | | Eine Schwesterfirma unter dem Dach von Alphabet.
DeepMind
AlphaGo
AlphaFold
Gemma
NotebookLM
Google Colab | Colab
Looker
BigQuery
Google Voice
Google Fit
Google Sky
Google Desktop
Google Buzz
Jamboard
Pixelbook
Nexus
Google Fi
Google Lens
Google Discover
Google Bard | Bard
Google Takeout
Google Authenticator
Google Family Link | Family Link
Android Auto
Wear OS
Google Podcasts
Google Shopping
Google Finance
Google Patents
Google Arts & Culture | Google Arts and Culture
Google Street View
Google Pixel Watch | Pixel Watch
Pixel Buds
Google Nest Hub | Nest Hub
Google Search Console | Search Console
Google Tag Manager
Google Optimize
Google Domains
Google Sketchup | SketchUp
Google Toolbar
Google Answers
Google Video
Google Code
Material Design
Chromium
x Bing | | Die Suchmaschine von Microsoft.
x iPhone | | Das ist Apple.
x Facebook | | Das ist Meta.
x Instagram | | Das ist Meta.
x WhatsApp | | Das ist Meta.
x Alexa | | Das ist Amazon.
x Siri | | Das ist Apple.
x ChatGPT | | Das ist OpenAI.
x Kotlin | | Kotlin stammt von JetBrains – Google unterstützt es nur offiziell für Android.
`,
  },
]);
