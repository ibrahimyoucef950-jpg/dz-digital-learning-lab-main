import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "الرئيسية" },
  { to: "/years", label: "السنوات الدراسية" },
  { to: "/lessons", label: "الدروس" },
  { to: "/exercises", label: "التطبيقات والتمارين" },
  { to: "/exercises", label: "الاختبارات" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const d = localStorage.getItem("theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggleTheme = () => {
    const d = !dark;
    setDark(d);
    localStorage.setItem("theme", d ? "dark" : "light");
    document.documentElement.classList.toggle("dark", d);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-hero text-navy-foreground">
            <Cpu className="h-5 w-5" />
          </span>
          معلوماتية <span className="text-success">DZ</span>
        </Link>
        <nav className="mr-4 hidden flex-1 items-center gap-1 xl:flex">
          {nav.map((n, i) => (
            <Link
              key={i}
              to={n.to}
              className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mr-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="تبديل الوضع">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
                              <Button variant="ghost" size="icon" className="xl:hidden" onClick={() => setOpen(!open)} aria-label="القائمة">
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="grid gap-1 border-t px-4 py-3 xl:hidden">
          {nav.map((n, i) => (
            <Link key={i} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 hover:bg-muted">
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">معلوماتية DZ</p>
          <p className="mt-2 text-sm opacity-80">منصة تعليمية تفاعلية لمادة المعلوماتية في التعليم الثانوي بالجزائر.</p>
        </div>
        <div className="grid gap-1 text-sm opacity-90">
          <Link to="/lessons">الدروس</Link>
          <Link to="/exercises">التمارين والاختبارات</Link>
        </div>
        <p className="text-sm opacity-80">
          المحتوى الموسوم «تجريبي» لم يُتحقَّق بعد من مطابقته للمنهاج الرسمي.
          <br />© {new Date().getFullYear()} معلوماتية DZ — جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
