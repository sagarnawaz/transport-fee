import { CreditCard, ImageUp, ReceiptText } from "lucide-react";
import { submitProofAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getCurrentCustomer } from "@/lib/app-queries";
import { formatMoney, monthNames } from "@/lib/utils/date";

export default async function SubmitPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { supabase, customer } = await getCurrentCustomer();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: fees } = customer
    ? await supabase
        .from("monthly_fee_records")
        .select("*")
        .eq("customer_id", customer.id)
        .in("status", ["unpaid", "partial", "rejected"])
        .order("year", { ascending: false })
        .order("month", { ascending: false })
    : { data: [] };
  const firstFee = fees?.[0];
  const pendingAmount = firstFee ? Number(firstFee.fee_amount) - Number(firstFee.paid_amount) : 0;

  return (
    <main className="section">
      <form action={submitProofAction} className="mx-auto grid max-w-2xl gap-4">
        <section className="panel overflow-hidden">
          <div className="bg-[#087b5b] p-5 text-white">
            <p className="text-sm font-semibold text-emerald-50">Payment proof</p>
            <h1 className="mt-1 text-2xl font-bold">Submit Payment</h1>
          </div>
          <div className="p-5">
            {params.submitted ? (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                Payment submitted. Verification is pending.
              </p>
            ) : null}
            {params.error ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">Could not submit payment.</p> : null}
            {!fees?.length ? <EmptyState title="No payable fee" text="There is no unpaid fee right now." /> : null}
            {firstFee ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">Payable amount</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">{formatMoney(Math.max(pendingAmount, 0))}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm text-slate-500">Fee month</p>
                  <p className="mt-1 text-base font-bold text-slate-950">{monthNames[firstFee.month - 1]} {firstFee.year}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel grid gap-4 p-5">
          <label className="grid gap-2">
            <span className="label">Fee</span>
            <select className="field" name="fee_record_id" required>
              <option value="">Select fee</option>
              {fees?.map((fee) => {
                const pending = Number(fee.fee_amount) - Number(fee.paid_amount);
                return (
                  <option key={fee.id} value={fee.id}>
                    {monthNames[fee.month - 1]} {fee.year} - {formatMoney(Math.max(pending, 0))}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="label">Amount paid</span>
              <input className="field" defaultValue={firstFee ? Math.max(pendingAmount, 0) : ""} min={1} name="amount" required type="number" />
            </label>
            <label className="grid gap-2">
              <span className="label">Payment method</span>
              <select className="field" name="payment_method" required>
                {["Bank Transfer", "Easypaisa", "JazzCash", "Cash", "Other"].map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="label">Transaction / reference ID</span>
            <span className="relative block">
              <ReceiptText className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="field pl-10" name="transaction_id" placeholder="Optional for cash" />
            </span>
          </label>

          <label className="grid gap-2">
            <span className="label">Screenshot</span>
            <span className="grid gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ImageUp size={18} /> Upload receipt image
              </span>
              <input accept="image/*" className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800" name="screenshot" type="file" />
            </span>
          </label>

          <SubmitButton pendingText="Submitting...">
            <CreditCard size={18} /> Submit for Verification
          </SubmitButton>
        </section>
      </form>
    </main>
  );
}
