import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/exercises")({
  head: () => ({
    meta: [
      { title: "التمارين والاختبارات | معلوماتية DZ" },
      { name: "description", content: "تمارين تفاعلية واختبارات نهاية الوحدة مع تصحيح آلي." },
      { property: "og:title", content: "التمارين والاختبارات | معلوماتية DZ" },
      { property: "og:description", content: "تدرّب واختبر معارفك في المعلوماتية." },
    ],
  }),
  component: Exercises,
});

function Exercises() {
  const { data } = useQuery({
    queryKey: ["units-with-q"],
    queryFn: async () => {
      const { data, error } = await supabase.from("units").select("id,title,grades(name,is_active),questions(id)").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">التمارين والاختبارات</h1>
      <p className="mt-2 text-muted-foreground">
        <b>وضع التدريب</b>: تصحيح فوري بعد كل سؤال. <b>وضع التقييم</b>: تظهر النتيجة والتفسيرات بعد الإنهاء فقط.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(data ?? []).filter((u) => u.questions.length).map((u) => (
          <div key={u.id} className="card-lift rounded-2xl border bg-card p-6">
            <ClipboardCheck className="h-7 w-7 text-success" />
            <h2 className="mt-2 text-lg font-bold">{u.title}</h2>
            <p className="text-sm text-muted-foreground">{u.grades?.name} • {u.questions.length} أسئلة</p>
            <div className="mt-4 flex gap-2">
              <Link to="/quiz/$unitId" params={{ unitId: u.id }} search={{ mode: "practice" }} className="rounded-lg bg-secondary px-3 py-2 text-sm text-secondary-foreground">تدريب</Link>
              <Link to="/quiz/$unitId" params={{ unitId: u.id }} search={{ mode: "exam" }} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">اختبار تقييمي</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
