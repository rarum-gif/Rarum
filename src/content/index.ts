import type { ContentData, Question } from "@/lib/types";
import { seedPacks, seedSettings } from "./packs";
import { defineQuestions, wsearch } from "./dsl";
import { applyExtras } from "./extras";
import allgemeinwissen from "./questions/allgemeinwissen";
import sport from "./questions/sport";
import musik from "./questions/musik";
import geografie from "./questions/geografie";
import geschichte from "./questions/geschichte";
import wissenschaft from "./questions/wissenschaft";
import tierePflanzen from "./questions/tiere-pflanzen";
import filmeSerien from "./questions/filme-serien";
import gaming from "./questions/gaming";
import essenTrinken from "./questions/essen-trinken";
import literatur from "./questions/literatur";
import technik from "./questions/technik";
import kunstKultur from "./questions/kunst-kultur";
import markenWirtschaft from "./questions/marken-wirtschaft";
import reisen from "./questions/reisen";

/**
 * Beispiel für einen noch nicht freigegebenen Entwurf: Die Antwortliste ist
 * unvollständig, deshalb steht die Frage auf "review" und erscheint in keiner
 * gewerteten Challenge, bis sie im Admin-Bereich geprüft wurde.
 */
const drafts: Question[] = defineQuestions("geografie", [
  {
    id: "alpenpass-entwurf",
    prompt: "Nenne einen Schweizer Alpenpass.",
    topic: "Gebirge",
    difficulty: 2,
    status: "review",
    notes: "Entwurf – Antwortliste noch unvollständig, Seltenheitsstufen nicht final.",
    sources: [wsearch("Liste der Alpenpässe der Schweiz")],
    answers: [
      ["Gotthardpass", "K", "Verbindet Uri und das Tessin.", ["Gotthard", "San Gottardo"]],
      ["Grimselpass", "F", "Verbindet das Berner Oberland mit dem Goms.", ["Grimsel"]],
      ["Furkapass", "F", "Mit dem ehemaligen Hotel Belvédère am Rhonegletscher.", ["Furka"]],
      ["Sustenpass", "U", "Zwischen Innertkirchen und Wassen.", ["Susten"]],
    ],
  },
]);

/** Bei inhaltlichen Seed-Änderungen erhöhen – bestehende Demo-Stores übernehmen sie dann automatisch. */
export const CONTENT_REVISION = 3;

export function seedContent(): ContentData {
  const questions = applyExtras([
    ...allgemeinwissen, ...sport, ...musik, ...geografie, ...geschichte, ...wissenschaft, ...tierePflanzen,
    ...filmeSerien, ...gaming, ...essenTrinken, ...literatur, ...technik, ...kunstKultur, ...markenWirtschaft, ...reisen,
    ...drafts,
  ]);
  return structuredClone({ settings: seedSettings, packs: seedPacks, questions });
}
