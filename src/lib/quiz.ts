export type QuestionType = "mcq" | "truefalse" | "fill" | "order" | "match";

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options: unknown;
  answer: unknown;
  explanation: string | null;
  lesson_id: string | null;
}

const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[إأآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");

/** Returns true when the student's response is correct. */
export function isCorrect(q: Pick<Question, "type" | "answer">, response: unknown): boolean {
  if (response === undefined || response === null) return false;
  switch (q.type) {
    case "mcq":
    case "truefalse":
      return Number(response) === Number(q.answer);
    case "fill": {
      const accepted = (Array.isArray(q.answer) ? q.answer : [q.answer]).map((a) => norm(String(a)));
      return accepted.includes(norm(String(response)));
    }
    case "order":
    case "match": {
      const exp = q.answer as number[];
      const got = response as number[];
      return Array.isArray(got) && got.length === exp.length && exp.every((v, i) => v === got[i]);
    }
    default:
      return false;
  }
}

export function gradeQuiz(questions: Question[], responses: Record<string, unknown>) {
  let score = 0;
  const wrongLessons = new Set<string>();
  for (const q of questions) {
    if (isCorrect(q, responses[q.id])) score++;
    else if (q.lesson_id) wrongLessons.add(q.lesson_id);
  }
  const total = questions.length;
  return { score, total, percent: total ? Math.round((score / total) * 100) : 0, wrongLessonIds: [...wrongLessons] };
}
