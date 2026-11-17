import { defineListQuestions, wiki } from "../../dsl";

export default defineListQuestions("geschichte", [
  {
    id: "bundeskanzler-deutschland",
    prompt: "Nenne eine Person, die Bundeskanzler oder Bundeskanzlerin der Bundesrepublik Deutschland war.",
    topic: "Persönlichkeiten",
    difficulty: 2,
    sources: [wiki("Bundeskanzler (Deutschland)")],
    list: `
K Angela Merkel
K Konrad Adenauer
K Helmut Kohl
F Olaf Scholz
F Gerhard Schröder
F Willy Brandt
F Helmut Schmidt
F Friedrich Merz
U Ludwig Erhard
R Kurt Georg Kiesinger
L Walter Scheel | | Er führte 1974 kurz geschäftsführend die Regierung.
x Adolf Hitler | Hitler | Er war Reichskanzler – das Amt des Bundeskanzlers gibt es erst seit 1949.
x Otto von Bismarck | Bismarck | Er war Reichskanzler im Kaiserreich, nicht Bundeskanzler.
x Frank-Walter Steinmeier | Steinmeier | Er ist Bundespräsident, nicht Bundeskanzler.
x Joschka Fischer | | Er war Aussenminister und Vizekanzler.
x Annalena Baerbock | | Sie war Aussenministerin.
x Sebastian Kurz | | Er war Bundeskanzler von Österreich.
x Erich Honecker | Honecker | Er war Staatschef der DDR.
`,
  },
  {
    id: "bundesrat-schweiz",
    prompt: "Nenne eine Person, die aktuell im Schweizer Bundesrat sitzt.",
    topic: "Persönlichkeiten",
    difficulty: 2,
    sources: [wiki("Bundesrat (Schweiz)")],
    list: `
K Karin Keller-Sutter
K Ignazio Cassis
F Guy Parmelin
F Albert Rösti
F Beat Jans
F Elisabeth Baume-Schneider
U Martin Pfister
x Viola Amherd | Amherd | Sie ist Ende März 2025 zurückgetreten.
x Alain Berset | Berset | Er ist Ende 2023 zurückgetreten.
x Ueli Maurer | Maurer | Er ist Ende 2022 zurückgetreten.
x Simonetta Sommaruga | Sommaruga | Sie ist Ende 2022 zurückgetreten.
x Christoph Blocher | Blocher | Er war bis 2007 im Bundesrat.
x Doris Leuthard | Leuthard | Sie war bis 2018 im Bundesrat.
`,
  },
  {
    id: "papst-seit-1900",
    prompt: "Nenne einen Papst, der seit dem Jahr 1900 im Amt war.",
    topic: "Persönlichkeiten",
    difficulty: 3,
    sources: [wiki("Liste der Päpste")],
    list: `
K Johannes Paul II. | Johannes Paul 2; Karol Wojtyła; Wojtyla
K Franziskus | Papst Franziskus; Jorge Mario Bergoglio; Bergoglio
K Benedikt XVI. | Benedikt 16; Benedikt; Joseph Ratzinger; Ratzinger
F Leo XIV. | Leo 14; Robert Francis Prevost; Prevost
U Johannes XXIII. | Johannes 23; Angelo Roncalli
U Paul VI. | Paul 6; Giovanni Battista Montini
U Johannes Paul I. | Johannes Paul 1; Albino Luciani
U Pius XII. | Pius 12; Eugenio Pacelli
R Pius XI. | Pius 11; Achille Ratti
R Pius X. | Pius 10; Giuseppe Sarto
V Benedikt XV. | Benedikt 15; Giacomo della Chiesa
V Leo XIII. | Leo 13; Gioacchino Pecci | Er war bis 1903 im Amt.
x Pius IX. | Pius 9 | Er starb bereits 1878.
x Gregor XVI. | Gregor 16 | Er war im 19. Jahrhundert Papst.
x Johannes Paul III. | Johannes Paul 3 | Einen Johannes Paul III. gab es nie.
`,
  },
  {
    id: "heinrich-viii-ehefrau",
    prompt: "Nenne eine Person, die mit Heinrich VIII. von England verheiratet war.",
    topic: "Persönlichkeiten",
    difficulty: 3,
    sources: [wiki("Heinrich VIII. (England)")],
    list: `
K Anne Boleyn | Anna Boleyn
F Katharina von Aragón | Katharina von Aragon; Catherine of Aragon
F Jane Seymour
U Anna von Kleve | Anne of Cleves
U Catherine Howard | Katharina Howard
U Catherine Parr | Katharina Parr
x Maria Stuart | Mary Stuart | Sie war Königin von Schottland, keine Ehefrau Heinrichs VIII.
x Elisabeth I. | Elizabeth I | Sie war Heinrichs Tochter.
x Maria I. | Mary I; Bloody Mary | Sie war Heinrichs Tochter.
x Mary Boleyn | | Annes Schwester – Heinrichs Geliebte, aber nie seine Ehefrau.
`,
  },
  {
    id: "franzoesischer-herrscher",
    prompt: "Nenne einen französischen König oder Kaiser.",
    topic: "Persönlichkeiten",
    difficulty: 3,
    sources: [wiki("Liste der Herrscher von Frankreich")],
    list: `
K Ludwig XIV. | Ludwig 14; Louis XIV; Sonnenkönig
K Napoleon Bonaparte | Napoleon; Napoleon I.; Napoleon 1
K Ludwig XVI. | Ludwig 16; Louis XVI
F Karl der Große | Karl der Grosse; Charlemagne
F Napoleon III. | Napoleon 3; Louis Napoléon
F Ludwig XV. | Ludwig 15; Louis XV
F Ludwig XIII. | Ludwig 13; Louis XIII
F Heinrich IV. | Heinrich 4; Henri IV
F Franz I. | Franz 1; François I
F Louis-Philippe | Louis Philippe; Bürgerkönig
F Ludwig XVIII. | Ludwig 18; Louis XVIII
F Karl X. | Karl 10; Charles X
U Chlodwig I. | Chlodwig; Clovis
U Pippin der Jüngere | Pippin
U Ludwig der Fromme
U Karl der Kahle
U Hugo Capet
U Philipp II. August | Philipp August; Philippe Auguste
U Ludwig IX. | Ludwig der Heilige; Saint Louis
U Philipp IV. | Philipp der Schöne
U Karl VII. | Karl 7
U Ludwig XI. | Ludwig 11
U Ludwig XII. | Ludwig 12
U Heinrich II. | Heinrich 2; Henri II
U Karl IX. | Karl 9
U Heinrich III. | Heinrich 3
U Franz II. | Franz 2
U Karl V. | Karl der Weise
U Karl VI. | Karl der Wahnsinnige
U Karl VIII. | Karl 8
U Johann II. | Johann der Gute
U Philipp VI. | Philipp 6
U Ludwig XVII. | Ludwig 17 | Nominell König, regierte aber nie.

R Robert I.
R Robert II. | Robert der Fromme
R Heinrich I.
R Philipp I.
R Ludwig VI. | Ludwig der Dicke
R Ludwig VII.
R Ludwig VIII. | Ludwig der Löwe
R Philipp III. | Philipp der Kühne
R Ludwig X. | Ludwig der Zänker
R Johann I. | Johann der Posthume
R Philipp V. | Philipp der Lange
R Karl IV. | Karl der Schöne
R Odo | Odo von Paris
R Rudolf | Rudolf von Burgund
R Lothar | Lothar von Frankreich
R Ludwig V. | Ludwig der Faule
R Karl III. | Karl der Einfältige
R Karl der Dicke
R Ludwig II. | Ludwig der Stammler
R Ludwig III.
R Karlmann
R Ludwig IV. | Ludwig der Überseeische
R Dagobert I. | Dagobert
R Childerich III. | Childerich
R Chilperich

x Ludwig II. von Bayern | Märchenkönig | Er war König von Bayern.
x Friedrich der Große | Friedrich der Grosse | Er war König von Preussen.
x Wilhelm I. | Kaiser Wilhelm | Er war Deutscher Kaiser.
x Charles de Gaulle | De Gaulle | Er war Präsident, kein König.
x Kardinal Richelieu | Richelieu | Er war Erster Minister, nicht König.
x Marie Antoinette | | Sie war Königin als Ehefrau Ludwigs XVI., regierte aber nicht selbst.
`,
  },
]);
