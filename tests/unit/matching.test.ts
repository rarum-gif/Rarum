import { describe, expect, it } from "vitest";
import { matchAnswer, normalize, editDistance } from "@/lib/game/matching";
import type { Answer } from "@/lib/types";

const a = (text: string, aliases: string[] = [], id = text): Answer => ({ id, text, aliases, tier: "rare", explanation: "", status: "verified", source: null });
const q = {
  answers: [a("FC Bayern München", ["Bayern München", "FC Bayern"]), a("Vereinigte Staaten", ["USA"]), a("Luka Modrić"), a("Österreich"), a("Australien"), a("C++", ["CPP"]), a("C"), a("Heinrich VIII.", ["Henry VIII"]), a("Niger"), a("Nigeria"), a("Iran")],
  wrongAnswers: [{ text: "Zürich", explanation: "Bern ist Bundesstadt" }],
};
const hit = (input: string) => {
  const m = matchAnswer(q, input);
  return m.kind === "answer" ? m.answer.text : m.kind;
};

describe("normalize", () => {
  it("ignoriert Gross-/Kleinschreibung, Leerzeichen, Akzente und Umlaut-Schreibweisen", () => {
    expect(normalize("  Luka   MODRIĆ ")).toBe("luka modric");
    expect(normalize("München")).toBe(normalize("Muenchen"));
    expect(normalize("Straße")).toBe(normalize("Strasse"));
    expect(normalize("The Beatles")).toBe("beatles");
    expect(normalize("Heinrich VIII.")).toBe(normalize("Heinrich 8"));
  });
  it("unterscheidet C, C++ und C#", () => {
    expect(new Set([normalize("C"), normalize("C++"), normalize("C#")]).size).toBe(3);
  });
});

describe("matchAnswer", () => {
  it("erkennt Hauptantworten und Aliases", () => {
    expect(hit("fc bayern münchen")).toBe("FC Bayern München");
    expect(hit("Bayern Muenchen")).toBe("FC Bayern München");
    expect(hit("usa")).toBe("Vereinigte Staaten");
    expect(hit("Henry 8")).toBe("Heinrich VIII.");
    expect(hit("cpp")).toBe("C++");
    expect(hit("c")).toBe("C");
  });
  it("korrigiert nur kleine Tippfehler bei längeren Wörtern", () => {
    expect(hit("Luka Modirc")).toBe("Luka Modrić");
    expect(hit("Oesterreih")).toBe("Österreich");
    expect(hit("Irak")).toBe("none"); // kurze Wörter: keine Toleranz
  });
  it("verwechselt ähnliche gültige Antworten nicht", () => {
    expect(hit("Austria")).toBe("none");
    expect(hit("Nigeri")).toBe("none"); // mehrdeutig zwischen Niger und Nigeria
    expect(hit("Niger")).toBe("Niger");
  });
  it("akzeptiert keine unbekannten Antworten und erkennt bekannte Falschantworten", () => {
    expect(hit("Atlantis")).toBe("none");
    expect(hit("zurich")).toBe("wrong");
    expect(hit("   ")).toBe("none");
  });
  it("ignoriert ungültig markierte Antworten", () => {
    expect(matchAnswer({ answers: [{ ...a("Pluto"), status: "invalid" }] }, "Pluto").kind).toBe("none");
  });
  it("editDistance zählt Vertauschungen als einen Fehler", () => {
    expect(editDistance("abcd", "abdc")).toBe(1);
  });
});
