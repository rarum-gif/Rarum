import { describe, expect, it } from "vitest";
import { csvToQuestions, questionsToCsv } from "@/lib/csv";
import { seedContent } from "@/content";

describe("CSV-Import/Export", () => {
  it("überlebt einen Hin- und Rückweg ohne Verlust", () => {
    const qs = seedContent().questions.slice(0, 6);
    const { questions, errors } = csvToQuestions(questionsToCsv(qs));
    expect(errors).toEqual([]);
    expect(questions.map((q) => q.id)).toEqual(qs.map((q) => q.id));
    for (let i = 0; i < qs.length; i++) {
      expect(questions[i].answers.map((a) => [a.text, a.tier, a.aliases])).toEqual(qs[i].answers.map((a) => [a.text, a.tier, a.aliases]));
      expect(questions[i].wrongAnswers?.length).toBe(qs[i].wrongAnswers?.length);
      expect(questions[i].sources).toEqual(qs[i].sources);
    }
  });
});
