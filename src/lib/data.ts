import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const gradesQuery = () =>
  queryOptions({
    queryKey: ["grades"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grades").select("*, streams(*)").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

export const unitsQuery = (gradeId?: string) =>
  queryOptions({
    queryKey: ["units", gradeId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("units")
        .select("*, lessons(id,title,sort_order,status,origin,summary)")
        .order("sort_order");
      if (gradeId) q = q.eq("grade_id", gradeId);
      const { data, error } = await q;
      if (error) throw error;
      return data.map((u) => ({ ...u, lessons: [...u.lessons].sort((a, b) => a.sort_order - b.sort_order) }));
    },
  });

export const lessonQuery = (id: string) =>
  queryOptions({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, units(id,title,grade_id, lessons(id,title,sort_order,status))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const statsQuery = () =>
  queryOptions({
    queryKey: ["stats"],
    queryFn: async () => {
      const [l, q, u, r] = await Promise.all([
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        supabase.from("questions").select("id", { count: "exact", head: true }),
        supabase.from("units").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
      ]);
      return { lessons: l.count ?? 0, questions: q.count ?? 0, units: u.count ?? 0, resources: r.count ?? 0 };
    },
  });

export const originLabel: Record<string, string> = {
  official: "محتوى رسمي",
  supplementary: "محتوى إضافي",
  demo: "محتوى تجريبي",
};
