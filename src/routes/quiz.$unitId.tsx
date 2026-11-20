import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { gradeQuiz, isCorrect, type Question } from "@/lib/quiz";
import { useAuth } from "@/lib/auth";

type Search = { mode?: "practice" | "exam" };

export const Route = createFileRoute("/quiz/$unitId")({
  validateSearch: (s: Record<string, unknown>): Search => ({ mode: s["mode"] === "exam" ? "exam" : "practice" }),
  head: () => ({
    meta: [
      { title: "اختبار الوحدة | معلوماتية DZ" },
      { name: "description", content: "أجب عن الأسئلة واحصل على تصحيح آلي وتفسيرات." },
      { property: "og:title", content: "اختبار الوحدة | معلوماتية DZ" },
      { property: "og:description", content: "اختبار تفاعلي بتصحيح آلي." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const { unitId } = Route.useParams();
  const { mode = "practice" } = Route.useSearch();
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["quiz", unitId],
    queryFn: async () => {
      const [u, q, l] = await Promise.all([
        supabase.from("units").select("title").eq("id", unitId).maybeSingle(),
        supabase.from("questions").select("*").eq("unit_id", unitId).order("sort_order"),
        supabase.from("lessons").select("id,title").eq("unit_id", unitId),
      ]);
      return { title: u.data?.title ?? "", questions: (q.data ?? []) as Question[], lessons: l.data ?? [] };
    },
  });
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const result = useMemo(() => (data ? gradeQuiz(data.questions, responses) : null), [data, responses]);

  if (isLoading) return <p className="p-12 text-center">جارٍ التحميل…</p>;
  if (!data?.questions.length) return <p className="p-12 text-center">لا توجد أسئلة لهذه الوحدة بعد.</p>;

  const setResp = (id: string, v: unknown) => setResponses((r) => ({ ...r, [id]: v }));
  const reveal = (id: string) => done || (mode === "practice" && checked[id]);

  const finish = async () => {
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (user && result) {
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id, unit_id: unitId, mode, score: result.score, total: result.total, wrong_lesson_ids: result.wrongLessonIds,
      });
      setSaved(error ? "تعذّر حفظ النتيجة" : "تم حفظ النتيجة في حسابك");
    }
  };
  const retry = () => { setResponses({}); setChecked({}); setDone(false); setSaved(null); };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-muted-foreground">{mode === "exam" ? "وضع التقييم" : "وضع التدريب"}</p>
      <h1 className="text-2xl font-bold">اختبار: {data.title}</h1>
      <div className="mt-2 flex gap-2 text-sm">
        <Link to="/quiz/$unitId" params={{ unitId }} search={{ mode: "practice" }} onClick={retry} className={mode === "practice" ? "font-bold text-primary" : "text-muted-foreground"}>تدريب</Link>|
        <Link to="/quiz/$unitId" params={{ unitId }} search={{ mode: "exam" }} onClick={retry} className={mode === "exam" ? "font-bold text-primary" : "text-muted-foreground"}>تقييم</Link>
      </div>

      {done && result && (
        <div className="mt-6 rounded-2xl bg-hero p-6 text-navy-foreground">
          <p className="text-lg">النتيجة النهائية</p>
          <p className="font-display text-5xl font-extrabold">{result.score} / {result.total} <span className="text-2xl">({result.percent}%)</span></p>
          {saved && <p className="mt-2 text-sm opacity-90">{saved}</p>}
          {!user && <p className="mt-2 text-sm opacity-90">سجّل الدخول لحفظ نتائجك.</p>}
          {result.wrongLessonIds.length > 0 && (
            <div className="mt-4">
              <p className="font-bold">ننصحك بمراجعة:</p>
              <ul className="mt-1 list-disc pr-6">
                {data.lessons.filter((l) => result.wrongLessonIds.includes(l.id)).map((l) => (
                  <li key={l.id}><Link to="/lessons/$id" params={{ id: l.id }} className="underline">{l.title}</Link></li>
                ))}
              </ul>
            </div>
          )}
          <Button variant="secondary" className="mt-4" onClick={retry}><RotateCcw className="h-4 w-4" /> إعادة المحاولة</Button>
        </div>
      )}

      <ol className="mt-6 grid gap-5">
        {data.questions.map((q, i) => {
          const show = !!reveal(q.id);
          const ok = isCorrect(q, responses[q.id]);
          return (
            <li key={q.id} className={`rounded-2xl border bg-card p-5 ${show ? (ok ? "border-success" : "border-destructive") : ""}`}>
              <p className="font-bold">{i + 1}. {q.prompt}</p>
              <div className="mt-3">
                <QuestionInput q={q} value={responses[q.id]} onChange={(v) => setResp(q.id, v)} disabled={show} />
              </div>
              {mode === "practice" && !done && !checked[q.id] && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setChecked((c) => ({ ...c, [q.id]: true }))}>تحقق</Button>
              )}
              {show && (
                <div className={`mt-3 flex gap-2 rounded-xl p-3 text-sm ${ok ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                  {ok ? <CheckCircle2 className="h-5 w-5 shrink-0 text-success" /> : <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
                  <div>
                    <b>{ok ? "إجابة صحيحة" : "إجابة خاطئة"}</b>
                    {!ok && <p>الإجابة الصحيحة: {answerText(q)}</p>}
                    {q.explanation && <p className="mt-1">{q.explanation}</p>}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!done && <Button size="lg" className="mt-8 w-full" onClick={finish}>إنهاء الاختبار وعرض النتيجة</Button>}
    </div>
  );
}

function answerText(q: Question): string {
  const opts = q.options as string[];
  if (q.type === "mcq" || q.type === "truefalse") return opts[Number(q.answer)] ?? "";
  if (q.type === "fill") return (q.answer as string[])[0] ?? "";
  if (q.type === "order") return (q.answer as number[]).map((k) => opts[k]).join(" ← ");
  if (q.type === "match") {
    const o = q.options as { left: string[]; right: string[] };
    return o.left.map((l, k) => `${l}: ${o.right[(q.answer as number[])[k] ?? 0]}`).join("، ");
  }
  return "";
}

function QuestionInput({ q, value, onChange, disabled }: { q: Question; value: unknown; onChange: (v: unknown) => void; disabled: boolean }) {
  if (q.type === "mcq" || q.type === "truefalse") {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {(q.options as string[]).map((o, k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => onChange(k)}
            className={`rounded-xl border p-3 text-right transition-colors ${value === k ? "border-primary bg-secondary" : "hover:bg-muted"}`}
          >
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === "fill") {
    return <Input disabled={disabled} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="اكتب إجابتك" maxLength={100} />;
  }
  if (q.type === "order") {
    const opts = q.options as string[];
    const order = (value as number[]) ?? opts.map((_, k) => k);
    const move = (i: number, d: number) => {
      const n = [...order];
      const t = n[i]!; n[i] = n[i + d]!; n[i + d] = t;
      onChange(n);
    };
    return (
      <ol className="grid gap-2">
        {order.map((k, i) => (
          <li key={k} className="flex items-center gap-2 rounded-xl border p-2">
            <span className="flex-1">{i + 1}. {opts[k]}</span>
            <Button size="icon" variant="ghost" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label="أعلى"><ArrowUp className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" disabled={disabled || i === order.length - 1} onClick={() => move(i, 1)} aria-label="أسفل"><ArrowDown className="h-4 w-4" /></Button>
          </li>
        ))}
      </ol>
    );
  }
  if (q.type === "match") {
    const o = q.options as { left: string[]; right: string[] };
    const sel = (value as number[]) ?? o.left.map(() => -1);
    return (
      <div className="grid gap-2">
        {o.left.map((l, k) => (
          <label key={k} className="flex items-center gap-3">
            <span className="w-32 font-medium">{l}</span>
            <select
              disabled={disabled}
              className="flex-1 rounded-lg border bg-background p-2"
              value={sel[k]}
              onChange={(e) => { const n = [...sel]; n[k] = Number(e.target.value); onChange(n); }}
            >
              <option value={-1}>— اختر —</option>
              {o.right.map((r, j) => <option key={j} value={j}>{r}</option>)}
            </select>
          </label>
        ))}
      </div>
    );
  }
  return null;
}
