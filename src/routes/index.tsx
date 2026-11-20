import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ClipboardCheck, Cpu, FileText, GraduationCap, Layers, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gradesQuery, statsQuery, unitsQuery } from "@/lib/data";
import { OriginBadge } from "@/components/OriginBadge";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "معلوماتية DZ | تعلّم المعلوماتية بطريقة تفاعلية" },
      { name: "description", content: "دروس وتمارين ومحاكاة تفاعلية لمادة المعلوماتية للتعليم الثانوي في الجزائر." },
      { property: "og:title", content: "معلوماتية DZ" },
      { property: "og:description", content: "منصة تعليمية تفاعلية لمادة المعلوماتية في الثانوي الجزائري." },
    ],
  }),
  component: Index,
});

function Index() {
  const grades = useQuery(gradesQuery());
  const stats = useQuery(statsQuery());
  const units = useQuery(unitsQuery());
  const latest = (units.data ?? []).flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.title }))).slice(-4).reverse();

  return (
    <div>
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <p className="mb-3 inline-block rounded-full bg-navy-foreground/10 px-3 py-1 text-sm">المعلوماتية — التعليم الثانوي</p>
            <h1 className="text-3xl font-extrabold leading-snug md:text-5xl md:leading-tight">
              تعلّم المعلوماتية بطريقة تفاعلية واكتشف عالم التكنولوجيا
            </h1>
            <p className="mt-5 max-w-xl text-lg opacity-85">
              دروس مبسطة، تمارين بتصحيح فوري، ومحاكاة لتجميع الحاسوب — لتلاميذ الثانوي في الجزائر.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/years/$slug" params={{ slug: "1as" }}>ابدأ بالسنة الأولى</Link>
              </Button>
            </div>
          </div>
          <img src={hero} alt="مكونات الحاسوب" width={1280} height={960} className="rounded-2xl shadow-2xl" />
        </div>
      </section>

      <section className="mx-auto -mt-8 grid max-w-5xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {[
          { k: "units", label: "وحدة تعليمية", icon: Layers },
          { k: "lessons", label: "درس منشور", icon: BookOpen },
          { k: "questions", label: "سؤال تفاعلي", icon: ClipboardCheck },
          { k: "resources", label: "مورد رقمي", icon: FileText },
        ].map((s) => (
          <div key={s.k} className="rounded-2xl border bg-card p-4 text-center shadow-soft">
            <s.icon className="mx-auto h-6 w-6 text-success" />
            <p className="mt-1 font-display text-3xl font-extrabold text-primary">
              {stats.data ? stats.data[s.k as keyof typeof stats.data] : "…"}
            </p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold">السنوات الدراسية</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(grades.data ?? []).map((g) => (
            <div key={g.id} className={`rounded-2xl border bg-card p-6 ${g.is_active ? "card-lift" : "opacity-70"}`}>
              <GraduationCap className={`h-8 w-8 ${g.is_active ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="mt-3 text-xl font-bold">{g.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
              {g.is_active ? (
                <Button className="mt-5" asChild>
                  <Link to="/years/$slug" params={{ slug: g.slug }}>تصفح المحتوى</Link>
                </Button>
              ) : (
                <p className="mt-5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" /> قريباً
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">أحدث الدروس</h2>
          <Link to="/lessons" className="text-sm text-primary">كل الدروس ←</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((l) => (
            <Link key={l.id} to="/lessons/$id" params={{ id: l.id }} className="card-lift rounded-2xl border bg-card p-5">
              <OriginBadge origin={l.origin} />
              <h3 className="mt-3 font-bold">{l.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{l.unit}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-7xl gap-4 px-4 md:grid-cols-2">
        <div className="rounded-2xl bg-accent p-8 text-accent-foreground">
          <ClipboardCheck className="h-8 w-8" />
          <h2 className="mt-3 text-2xl font-bold">التمارين والاختبارات</h2>
          <p className="mt-2">اختيار من متعدد، صح أو خطأ، ملء الفراغات، الترتيب والمطابقة — بوضعي التدريب والتقييم.</p>
          <Button className="mt-5" asChild><Link to="/exercises">ابدأ التدرب</Link></Button>
        </div>
        <div className="rounded-2xl bg-secondary p-8 text-secondary-foreground">
          <Cpu className="h-8 w-8" />
          <h2 className="mt-3 text-2xl font-bold">المحاكاة التعليمية</h2>
          <p className="mt-2">ركّب حاسوبك بنفسك: اسحب كل مكوّن إلى مكانه الصحيح على اللوحة الأم.</p>
          <p className="mt-5 text-sm opacity-80">قريباً</p>
        </div>
      </section>
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
