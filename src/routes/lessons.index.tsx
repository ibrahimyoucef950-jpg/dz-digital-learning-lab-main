import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { gradesQuery, unitsQuery } from "@/lib/data";
import { UnitList } from "@/components/UnitList";

export const Route = createFileRoute("/lessons/")({
  head: () => ({
    meta: [
      { title: "الدروس | معلوماتية DZ" },
      { name: "description", content: "كل الوحدات والدروس المتاحة في مادة المعلوماتية." },
      { property: "og:title", content: "الدروس | معلوماتية DZ" },
      { property: "og:description", content: "كل الوحدات والدروس المتاحة." },
    ],
  }),
  component: Lessons,
});

function Lessons() {
  const grades = useQuery(gradesQuery());
  const units = useQuery(unitsQuery());
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">الدروس</h1>
      {(grades.data ?? []).filter((g) => g.is_active).map((g) => (
        <div key={g.id} className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-primary">{g.name}</h2>
          <UnitList units={(units.data ?? []).filter((u) => u.grade_id === g.id)} />
        </div>
      ))}
    </div>
  );
}
