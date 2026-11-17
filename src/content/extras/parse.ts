import type { A } from "../dsl";

/**
 * Kompaktes Format für Antwort-Erweiterungen, eine Antwort pro Zeile:
 *
 *   <Stufe> <Antwort> | <Alias; Alias> | <Erklärung>
 *
 * Stufe: K (bekannt) F (geläufig) U (ungewöhnlich) R (selten) V (sehr selten) L (legendär).
 * Aliases und Erklärung sind optional. Leere Zeilen und Kommentare (#) werden ignoriert.
 *
 * Steht `#auto` in einer Liste, wird die Stufe aus der Reihenfolge abgeleitet:
 * Die Liste ist grob nach Bekanntheit sortiert, und weil alle Ergänzungen seltener
 * genannt werden als die Kernantworten, beginnt die Skala bei "ungewöhnlich".
 */
export function parseExtra(block: string): A[] {
  const out: A[] = [];
  let auto = false;
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (line === "#auto") {
      auto = true;
      continue;
    }
    if (!line || line.startsWith("#")) continue;
    const m = /^([KFURVL])\s+(.+)$/.exec(line);
    if (!m) throw new Error(`Ungültige Zeile in Antwort-Erweiterung: "${line}"`);
    const [text, aliases = "", explanation = ""] = m[2].split("|").map((s) => s.trim());
    out.push([text, m[1], explanation, aliases ? aliases.split(";").map((s) => s.trim()).filter(Boolean) : []]);
  }
  if (auto) {
    const n = out.length;
    out.forEach((a, i) => {
      const p = n <= 1 ? 0 : i / n;
      a[1] = p < 0.25 ? "U" : p < 0.6 ? "R" : p < 0.85 ? "V" : "L";
    });
  }
  return out;
}
