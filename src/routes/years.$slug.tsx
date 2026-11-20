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
    </div>
  );
}
