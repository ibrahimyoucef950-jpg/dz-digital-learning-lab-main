import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Lock } from "lucide-react";
import { gradesQuery } from "@/lib/data";

export const Route = createFileRoute("/years/")({
  head: () => ({
    meta: [
      { title: "السنوات الدراسية | معلوماتية DZ" },
      { name: "description", content: "اختر سنتك الدراسية: الأولى، الثانية أو الثالثة ثانوي." },
      { property: "og:title", content: "السنوات الدراسية | معلوماتية DZ" },
      { property: "og:description", content: "اختر سنتك الدراسية في مادة المعلوماتية." },
    ],
  }),
  component: Years,
});

function Years() {
  const { data } = useQuery(gradesQuery());
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">السنوات الدراسية</h1>
      <div className="mt-8 grid gap-4">
        {(data ?? []).map((g) => (
          <div key={g.id} className="flex items-center gap-4 rounded-2xl border bg-card p-6">
            <GraduationCap className="h-10 w-10 text-primary" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{g.name}</h2>
              <p className="text-sm text-muted-foreground">
                {g.streams.map((s) => s.name).join(" • ") || g.description}
              </p>
            </div>
            {g.is_active ? (
              <Link to="/years/$slug" params={{ slug: g.slug }} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                دخول
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><Lock className="h-4 w-4" />غير مفعّلة بعد</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
