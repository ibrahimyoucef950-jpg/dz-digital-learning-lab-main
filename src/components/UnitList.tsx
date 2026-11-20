import { Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { OriginBadge } from "@/components/OriginBadge";

interface Unit {
  id: string;
  title: string;
  description: string | null;
  lessons: { id: string; title: string; origin: string; summary: string | null }[];
}

export function UnitList({ units }: { units: Unit[] }) {
  if (!units.length) return <p className="text-muted-foreground">لا توجد وحدات منشورة بعد.</p>;
  return (
    <div className="grid gap-6">
      {units.map((u, i) => (
        <section key={u.id} className="rounded-2xl border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-success">الوحدة {i + 1}</p>
              <h2 className="text-xl font-bold">{u.title}</h2>
              <p className="text-sm text-muted-foreground">{u.description}</p>
            </div>
            <Link to="/quiz/$unitId" params={{ unitId: u.id }} className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm text-accent-foreground">
              <ClipboardCheck className="h-4 w-4" /> اختبار الوحدة
            </Link>
          </div>
          <ol className="mt-4 grid gap-2">
            {u.lessons.map((l, j) => (
              <li key={l.id}>
                <Link to="/lessons/$id" params={{ id: l.id }} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">{j + 1}</span>
                  <span className="flex-1 font-medium">{l.title}</span>
                  <OriginBadge origin={l.origin} />
                </Link>
              </li>
            ))}
            {!u.lessons.length && <p className="text-sm text-muted-foreground">لا توجد دروس منشورة في هذه الوحدة.</p>}
          </ol>
        </section>
      ))}
    </div>
  );
}
