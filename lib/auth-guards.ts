import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AppRole = "admin" | "customer";

export async function requireRole(requiredRole: AppRole) {
  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.role) redirect("/auth/login?error=profile");
  if (profile.role === requiredRole) return;

  redirect(profile.role === "admin" ? "/admin" : "/customer");
}
