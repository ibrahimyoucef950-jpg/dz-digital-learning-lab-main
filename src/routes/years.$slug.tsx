import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { gradesQuery, unitsQuery } from "@/lib/data";
import { UnitList } from "@/components/UnitList";

export const Route = createFileRoute("/years/$slug")({
  head: () => ({
    meta: [
      { title: "وحدات ودروس السنة | معلوماتية DZ" },
      { name: "description", content: "الوحدات التعليمية والدروس الخاصة بالسنة الدراسية." },
      { property: "og:title", content: "وحدات ودروس السنة | معلوماتية DZ" },
      { property: "og:description", content: "تصفح الوحدات والدروس والاختبارات." },
    ],
  }),
  component: YearPage,
});

function YearPage() {
  const { slug } = Route.useParams();
  const grades = useQuery(gradesQuery());
  const grade = grades.data?.find((g) => g.slug === slug);
  const units = useQuery({ ...unitsQuery(grade?.id), enabled: !!grade });

  if (grades.isLoading) return <p className="p-12 text-center">جارٍ التحميل…</p>;
  if (!grade) return <p className="p-12 text-center">السنة غير موجودة. <Link to="/years" className="text-primary">رجوع</Link></p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">{grade.name}</h1>
      <p className="mt-2 text-muted-foreground">{grade.streams.map((s) => s.name).join(" • ")}</p>
      {!grade.is_active && <p className="mt-4 rounded-xl bg-muted p-4">هذه السنة غير مفعّلة بعد، سيُضاف محتواها لاحقاً.</p>}
      <div className="mt-8">
        {units.isLoading ? <p>جارٍ التحميل…</p> : <UnitList units={units.data ?? []} />}
      </div>
      <section dir="rtl" className="my-8 rounded-xl border p-6 space-y-6">
  <div>
    <h2 className="text-xl font-bold mb-3">كتب مادة المعلوماتية</h2>
    <div className="flex flex-wrap gap-3">
      <a
        href="/Livre-informatique1.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        الكتاب المدرسي (Livre-informatique1)
      </a>
      <a
        href="/informatique1h.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
      >
        ملف المعلوماتية 1 (informatique1h)
      </a>
      <a
        href="/informatique1s.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
      >
        ملف المعلوماتية 2 (informatique1s)
      </a>
    </div>
  </div>

  <div>
    <h3 className="text-lg font-bold mb-2">البرنامج الدراسي لمادة المعلوماتية</h3>
    <ul className="list-disc pr-6 space-y-1">
      <li>بيئة التعامل مع الحاسوب</li>
      <li>مكوّنات الحاسوب ونظام التشغيل</li>
      <li>البرمجيات المكتبية والشبكات</li>
      <li>مبادئ الخوارزميات والبرمجة</li>
    </ul>
  </div>
</section>
    </div>
  );
}
