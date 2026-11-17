import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("wissenschaft", [
  {
    id: "mond-betreten",
    prompt: "Nenne eine Person, die den Mond betreten hat.",
    topic: "Weltraum",
    difficulty: 3,
    sources: [wiki("Liste der Menschen, die den Mond betreten haben")],
    list: `
K Neil Armstrong
F Buzz Aldrin | Edwin Aldrin
U Alan Shepard
U Eugene Cernan | Gene Cernan
U Pete Conrad | Charles Conrad
U John Young
R Alan Bean
R Edgar Mitchell
R David Scott
R James Irwin
R Charles Duke | Charlie Duke
R Harrison Schmitt | Jack Schmitt
x Michael Collins | Collins | Er flog mit Apollo 11, blieb aber in der Mondumlaufbahn.
x Juri Gagarin | Gagarin | Er war der erste Mensch im All, aber nie auf dem Mond.
x Jim Lovell | Lovell | Er umrundete den Mond zweimal, landete aber nie – Apollo 13 musste abbrechen.
x Sigmund Jähn | Jähn | Er war der erste Deutsche im All, aber nie auf dem Mond.
x Valentina Tereschkowa | Tereschkowa | Sie war die erste Frau im All, aber nie auf dem Mond.
x Laika | | Die Hündin umkreiste die Erde, nicht den Mond.
x Elon Musk | Musk | Er war nie im All.
`,
  },
  {
    id: "edelgas",
    prompt: "Nenne ein Edelgas.",
    topic: "Chemie",
    difficulty: 2,
    sources: [wiki("Edelgase")],
    list: `
K Helium | He
K Neon | Ne
F Argon | Ar
F Xenon | Xe
F Krypton | Kr
U Radon | Rn
L Oganesson | Og
x Wasserstoff | | Wasserstoff ist kein Edelgas – er reagiert sehr gerne.
x Stickstoff | | Stickstoff ist reaktionsträge, aber kein Edelgas.
x Sauerstoff | | Sauerstoff ist sehr reaktiv – kein Edelgas.
x Chlor | | Chlor ist ein Halogen.
x Kohlendioxid | CO2 | Das ist eine Verbindung, kein Element.
`,
  },
  {
    id: "zellorganell",
    prompt: "Nenne einen Bestandteil einer Zelle (z. B. ein Zellorganell).",
    topic: "Biologie",
    difficulty: 2,
    sources: [wiki("Organell")],
    list: `
K Zellkern | Nukleus; Kern; Nucleus
K Mitochondrien | Mitochondrium; Mitochondrion
K Zellmembran | Plasmamembran; Membran
F Ribosomen | Ribosom
F Chloroplasten | Chloroplast
F Zellwand
F Vakuole | Vakuolen
F Golgi-Apparat | Golgi; Golgiapparat
F Endoplasmatisches Retikulum | ER; Raues ER; Glattes ER; endoplasmatisches Reticulum
F Zytoplasma | Cytoplasma; Zellplasma
F Lysosomen | Lysosom
F DNA | DNS; Erbgut
F Chromosomen | Chromosom
U Zytoskelett | Cytoskelett
U Kernkörperchen | Nucleolus; Nukleolus
U Kernhülle | Kernmembran
U Zentriolen | Zentriol; Centriol
U Zentrosom | Centrosom
U Peroxisomen | Peroxisom
U Vesikel
U Geißel | Flagellum; Geissel
U Zilien | Cilien; Flimmerhärchen
U Plastiden | Plastid
U Zytosol | Cytosol
U Mikrotubuli
U Kernporen | Kernpore
U Chromatin
R Endosom
R Proteasom
R Leukoplasten | Leukoplast
R Chromoplasten | Chromoplast
R Amyloplasten | Amyloplast
R Glyoxysomen | Glyoxysom
R Melanosomen | Melanosom
R Akrosom
R Aktinfilamente | Mikrofilamente
R Intermediärfilamente
R Thylakoide | Thylakoid
R Cristae
R Plasmodesmen
R Tonoplast
R Pili | Pilus
R Plasmid | Plasmide
R Kapsel
R Nukleoid
R Mitochondriale DNA
R Basalkörper
R Exosom
R Phagosom
R Autophagosom
R Lipidtropfen | Lipidvesikel
R Mikrovilli
R Pseudopodien | Scheinfüßchen
R Kontraktile Vakuole | pulsierende Vakuole
R Augenfleck | Stigma
R Pyrenoid
R Sarkoplasmatisches Retikulum
R Nissl-Schollen
R Hydrogenosom
R Apikoplast
R Kinetoplast
R Mitosom
x Atom | | Atome sind viel kleiner – kein Zellbestandteil im biologischen Sinn.
x Gewebe | | Gewebe besteht aus vielen Zellen.
x Organ | | Organe bestehen aus Geweben.
x Neuron | Nervenzelle | Das ist eine ganze Zelle.
x Blut | | Blut besteht aus vielen Zellen.
`,
  },
]);
