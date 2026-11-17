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
  let segStart = 0;
  const closeSegment = () => {
    if (auto) autoTiers(out, segStart);
    auto = false;
    segStart = out.length;
  };
  for (const raw of block.split("\n")) {
    const line = raw.trim();
    if (line === "#auto") {
      auto = true;
      continue;
    }
    if (line === "#end") {
      closeSegment();
      continue;
    }
    if (!line || line.startsWith("#")) continue;
    // in #auto-Listen darf die Stufe fehlen – sie wird ohnehin aus der Reihenfolge abgeleitet
    const m = /^([KFURVL])\s+(.+)$/.exec(line) ?? (auto ? [line, "U", line] : null);
    if (!m) throw new Error(`Ungültige Zeile in Antwort-Erweiterung: "${line}"`);
    const [text, aliases = "", explanation = ""] = m[2].split("|").map((s) => s.trim());
    out.push([text, m[1], explanation, aliases ? aliases.split(";").map((s) => s.trim()).filter(Boolean) : []]);
  }
  closeSegment();
  return out;
}

function autoTiers(list: A[], from: number) {
  const n = list.length - from;
  for (let i = from; i < list.length; i++) {
    const p = n <= 1 ? 0 : (i - from) / n;
    list[i][1] = p < 0.25 ? "U" : p < 0.6 ? "R" : p < 0.85 ? "V" : "L";
  }
}
