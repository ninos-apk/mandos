import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/admin/login?error=config");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");

  return { supabase, user: userData.user, profile };
}
