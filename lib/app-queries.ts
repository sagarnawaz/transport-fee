import { createClient } from "@/lib/supabase/server";
import { currentMonthYear } from "@/lib/utils/date";

export async function getSettings() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
  return data;
}

export async function getCurrentCustomer() {
  const supabase = await createClient();
  if (!supabase) return { supabase: null, user: null, customer: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, customer: null };
  const { data: customer } = await supabase
    .from("customers")
    .select("*, routes(route_name)")
    .eq("user_id", user.id)
    .maybeSingle();
  return { supabase, user, customer };
}

export async function getAdminDashboard() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { month, year } = currentMonthYear();

  const [active, pendingCustomers, fees, pendingProofs] = await Promise.all([
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("monthly_fee_records").select("fee_amount, paid_amount, status").eq("month", month).eq("year", year),
    supabase.from("payment_proofs").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const feeRows = fees.data ?? [];
  return {
    activeCustomers: active.count ?? 0,
    pendingCustomers: pendingCustomers.count ?? 0,
    expected: feeRows.reduce((sum, row) => sum + Number(row.fee_amount ?? 0), 0),
    received: feeRows.reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0),
    paidCount: feeRows.filter((row) => row.status === "paid").length,
    unpaidCount: feeRows.filter((row) => row.status === "unpaid" || row.status === "rejected").length,
    pendingProofs: pendingProofs.count ?? 0,
  };
}
