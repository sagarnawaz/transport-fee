import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentCustomer } from "@/lib/app-queries";
import { requireRole } from "@/lib/auth-guards";
import { formatDisplayDateTime, formatMoney } from "@/lib/utils/date";

export default async function PaymentHistoryPage() {
  await requireRole("customer");
  const { supabase, customer } = await getCurrentCustomer();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: proofs } = customer
    ? await supabase
        .from("payment_proofs")
        .select("*, monthly_fee_records(month, year)")
        .eq("customer_id", customer.id)
        .order("submitted_at", { ascending: false })
    : { data: [] };

  return (
    <main className="section">
      <h1 className="text-2xl font-bold text-slate-950">Payment History</h1>
      <div className="mt-5 grid gap-3">
        {!proofs?.length ? <EmptyState title="No payments yet" text="Your submitted payments will appear here." /> : null}
        {proofs?.map((proof) => (
          <article className="panel p-4" key={proof.id}>
            <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
              <div>
                <p className="font-bold text-slate-950">{formatMoney(proof.amount)}</p>
                <p className="text-sm text-slate-600">
                  {proof.monthly_fee_records?.month}/{proof.monthly_fee_records?.year} - {proof.payment_method}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Submitted {formatDisplayDateTime(proof.submitted_at)}
                </p>
              </div>
              <div className="justify-self-start"><StatusBadge status={proof.status} /></div>
            </div>
            {proof.admin_note ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">Admin note: {proof.admin_note}</p> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
