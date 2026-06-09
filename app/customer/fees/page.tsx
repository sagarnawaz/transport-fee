import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentCustomer } from "@/lib/app-queries";
import { requireRole } from "@/lib/auth-guards";
import { formatDisplayDate, formatMoney, formatMonthYear } from "@/lib/utils/date";

export default async function MyFeesPage() {
  await requireRole("customer");
  const { supabase, customer } = await getCurrentCustomer();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: fees } = customer
    ? await supabase.from("monthly_fee_records").select("*").eq("customer_id", customer.id).order("year", { ascending: false }).order("month", { ascending: false })
    : { data: [] };

  return (
    <main className="section">
      <h1 className="text-2xl font-bold">My Fees</h1>
      <div className="mt-5 grid gap-3">
        {!fees?.length ? <EmptyState title="No fees yet" text="Your monthly fee records will appear after admin generates them." /> : null}
        {fees?.map((fee) => (
          <article className="panel p-4" key={fee.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{formatMonthYear(fee.month, fee.year)}</p>
                <p className="text-sm text-slate-600">Due {formatDisplayDate(fee.due_date)}</p>
              </div>
              <StatusBadge status={fee.status} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-slate-500">Fee</p><p className="font-semibold">{formatMoney(fee.fee_amount)}</p></div>
              <div><p className="text-slate-500">Paid</p><p className="font-semibold">{formatMoney(fee.paid_amount)}</p></div>
              <div><p className="text-slate-500">Pending</p><p className="font-semibold">{formatMoney(Number(fee.fee_amount) - Number(fee.paid_amount))}</p></div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
