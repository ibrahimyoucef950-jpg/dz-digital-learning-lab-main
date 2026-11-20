import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bookmark, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Printer, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/Markdown";
import { OriginBadge } from "@/components/OriginBadge";
import { lessonQuery } from "@/lib/data";
import { getLocalProgress, toggleLocal, useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/lessons/$id")({
  head: () => ({
    meta: [
      { title: "عرض الدرس | معلوماتية DZ" },
      { name: "description", content: "شرح الدرس، الأهداف، المصطلحات وأسئلة الفهم." },
      { property: "og:title", content: "عرض الدرس | معلوماتية DZ" },
      { property: "og:description", content: "درس تفاعلي في مادة المعلوماتية." },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { id } = Route.useParams();
  const { data: lesson, isLoading } = useQuery(lessonQuery(id));
  const { user } = useAuth();
  const qc = useQueryClient();
  const [state, setState] = useState({ completed: false, saved: false });
  const [step, setStep] = useState(99);

  useEffect(() => {
    setStep(99);
    (async () => {
      if (user) {
        const { data } = await supabase.from("lesson_progress").select("*").eq("lesson_id", id).maybeSingle();
        setState({ completed: !!data?.completed, saved: !!data?.saved });
      } else {
        const p = getLocalProgress();
        setState({ completed: p.completed.includes(id), saved: p.saved.includes(id) });
      }
    })();
  }, [id, user]);

  const toggle = async (kind: "completed" | "saved") => {
    const next = { ...state, [kind]: !state[kind] };
    setState(next);
    if (user) {
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({ user_id: user.id, lesson_id: id, ...next, updated_at: new Date().toISOString() });
      if (error) { toast.error("تعذّر الحفظ"); return; }
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    } else {
      toggleLocal(kind, id, next[kind]);
      toast.info("حُفظ على هذا الجهاز فقط — سجّل الدخول لحفظ تقدمك في حسابك.");
    }
  };

  if (isLoading) return <p className="p-12 text-center">جارٍ التحميل…</p>;
  if (!lesson) return <p className="p-12 text-center">الدرس غير متاح.</p>;

  const siblings = [...(lesson.units?.lessons ?? [])]
    .filter((l) => l.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order);
  const idx = siblings.findIndex((l) => l.id === id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const sections = (lesson.content ?? "").split(/\n(?=## )/);
  const terms = (lesson.key_terms as { term: string; def: string }[]) ?? [];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm text-muted-foreground">{lesson.units?.title}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <OriginBadge origin={lesson.origin} />
      </div>
      {lesson.origin === "demo" && (
        <p className="mt-3 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          محتوى تجريبي لأغراض العرض، لم يُتحقَّق بعد من مطابقته للمنهاج الرسمي.
        </p>
      )}

      <div className="no-print mt-5 flex flex-wrap gap-2">
        <Button variant={state.completed ? "default" : "outline"} size="sm" onClick={() => toggle("completed")}>
          <CheckCircle2 className="h-4 w-4" /> {state.completed ? "تمت دراسته" : "تحديد كمدروس"}
        </Button>
        <Button variant={state.saved ? "secondary" : "outline"} size="sm" onClick={() => toggle("saved")}>
          <Bookmark className="h-4 w-4" /> {state.saved ? "محفوظ" : "حفظ الدرس"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()} title="اختر «حفظ بصيغة PDF» من نافذة الطباعة">
          <Printer className="h-4 w-4" /> طباعة / PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => setStep(step === 99 ? 1 : 99)}>
          {step === 99 ? "عرض بالتدريج" : "عرض الكل"}
        </Button>
      </div>

      {lesson.objectives.length > 0 && (
        <section className="mt-6 rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <h2 className="flex items-center gap-2 font-bold"><Target className="h-5 w-5" /> أهداف الدرس</h2>
          <ul className="mt-2 list-disc pr-6">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </section>
      )}
      {lesson.summary && (
        <section className="mt-4 rounded-2xl bg-accent p-5 text-accent-foreground">
          <h2 className="font-bold">ملخص مبسط</h2>
          <p className="mt-1 leading-8">{lesson.summary}</p>
        </section>
      )}
      {lesson.image_url && <img src={lesson.image_url} alt={lesson.title} loading="lazy" className="mt-6 w-full rounded-2xl" />}
      {lesson.video_url && (
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl">
          <iframe src={lesson.video_url} title="فيديو الدرس" className="h-full w-full" allowFullScreen />
        </div>
      )}

      <div className="mt-6">
        {sections.slice(0, step).map((s, i) => <Markdown key={i} source={s} />)}
        {step < sections.length && (
          <Button className="no-print mt-4" onClick={() => setStep(step + 1)}>متابعة ({step}/{sections.length})</Button>
        )}
      </div>

      {terms.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">المصطلحات الأساسية</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {terms.map((t) => (
              <div key={t.term} className="rounded-xl border p-3">
                <dt className="font-bold text-primary">{t.term}</dt>
                <dd className="text-sm text-muted-foreground">{t.def}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {lesson.check_questions.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">أسئلة لفهم الدرس</h2>
          <ol className="mt-2 list-decimal pr-6 leading-8">{lesson.check_questions.map((q) => <li key={q}>{q}</li>)}</ol>
        </section>
      )}

      <div className="no-print mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
        {prev ? (
          <Button variant="outline" asChild><Link to="/lessons/$id" params={{ id: prev.id }}><ChevronRight className="h-4 w-4" />{prev.title}</Link></Button>
        ) : <span />}
        <Button asChild><Link to="/quiz/$unitId" params={{ unitId: lesson.unit_id }}><ClipboardCheck className="h-4 w-4" /> التمارين</Link></Button>
        {next ? (
          <Button variant="outline" asChild><Link to="/lessons/$id" params={{ id: next.id }}>{next.title}<ChevronLeft className="h-4 w-4" /></Link></Button>
        ) : <span />}
      </div>
    </article>
  );
}
