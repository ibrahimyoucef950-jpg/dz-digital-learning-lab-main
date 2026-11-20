import { describe, it, expect } from "vitest";
import { isCorrect, gradeQuiz, type Question } from "@/lib/quiz";

describe("quiz grading", () => {
  it("grades mcq by option index", () => {
    expect(isCorrect({ type: "mcq", answer: 1 }, 1)).toBe(true);
    expect(isCorrect({ type: "mcq", answer: 1 }, 2)).toBe(false);
  });
  it("fill accepts Arabic variants (hamza normalisation)", () => {
    expect(isCorrect({ type: "fill", answer: ["الإنترنت"] }, " الانترنت ")).toBe(true);
    expect(isCorrect({ type: "fill", answer: ["المعالج"] }, "الشاشة")).toBe(false);
  });
  it("order requires exact sequence", () => {
    expect(isCorrect({ type: "order", answer: [1, 0, 2] }, [1, 0, 2])).toBe(true);
    expect(isCorrect({ type: "order", answer: [1, 0, 2] }, [0, 1, 2])).toBe(false);
  });
  it("computes percent and lessons to review", () => {
    const qs: Question[] = [
      { id: "a", type: "mcq", prompt: "", options: [], answer: 0, explanation: null, lesson_id: "L1" },
      { id: "b", type: "truefalse", prompt: "", options: [], answer: 1, explanation: null, lesson_id: "L2" },
    ];
    const r = gradeQuiz(qs, { a: 0, b: 0 });
    expect(r.score).toBe(1);
    expect(r.percent).toBe(50);
    expect(r.wrongLessonIds).toEqual(["L2"]);
  });
});
