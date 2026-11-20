import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async (u: User | null) => {
      if (!active) return;
      setUser(u);
      if (u) {
        const { data } = await supabase.rpc("has_role", { _user_id: u.id, _role: "admin" });
        if (active) setIsAdmin(!!data);
      } else setIsAdmin(false);
      if (active) setLoading(false);
    };
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setTimeout(() => load(s?.user ?? null), 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}

/** Local progress fallback for visitors without an account (stays on this device only). */
const KEY = "infodz-progress";
export function getLocalProgress(): { completed: string[]; saved: string[] } {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "") as { completed: string[]; saved: string[] };
  } catch {
    return { completed: [], saved: [] };
  }
}
export function toggleLocal(kind: "completed" | "saved", id: string, value: boolean) {
  const p = getLocalProgress();
  const set = new Set(p[kind]);
  if (value) set.add(id);
  else set.delete(id);
  p[kind] = [...set];
  localStorage.setItem(KEY, JSON.stringify(p));
}
