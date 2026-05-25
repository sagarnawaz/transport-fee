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
  const errorMessages: Record<string, string> = {
    validation: "Please fill the required fields.",
    amount: "Enter a valid payment amount.",
    fee: "Please select a payable fee.",
    screenshot: "Please upload a payment proof image.",
    upload: "Could not upload the screenshot. Please try again.",
    submit: "Could not submit payment. Please try again.",
    "missing-config": "App setup is incomplete.",
    "no-customer": "Customer profile was not found.",
  };

  return (
    <main className="section">
      <form action={submitProofAction} className="mx-auto grid max-w-2xl gap-4">
        <section className="panel overflow-hidden">
          <div className="bg-[#087b5b] p-5 text-white">
            <p className="text-sm font-semibold text-emerald-50">Payment proof</p>
            <h1 className="mt-1 text-2xl font-bold">Submit Payment</h1>
            <p className="mt-2 text-sm leading-6 text-emerald-50">
              Upload your receipt screenshot after making the payment.
            </p>
          </div>
          <div className="p-5">
            {params.submitted ? (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
                Payment submitted. Verification is pending.
              </p>
            ) : null}
            {params.error ? (
              <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
                {errorMessages[params.error] ?? "Could not submit payment."}
              </p>
            ) : null}
            {!fees?.length ? <EmptyState title="No payable fee" text="There is no unpaid fee right now." /> : null}
            {firstFee ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

        {firstFee ? (
          <section className="panel grid gap-4 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Payment details</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Only these fields are needed for verification.</p>
            </div>

            {fees && fees.length > 1 ? (
              <label className="grid gap-2">
                <span className="label">Fee month *</span>
                <select className="field" defaultValue={firstFee.id} name="fee_record_id" required>
                  {fees.map((fee) => {
                    const pending = Number(fee.fee_amount) - Number(fee.paid_amount);
                    return (
                      <option key={fee.id} value={fee.id}>
                        {monthNames[fee.month - 1]} {fee.year} - {formatMoney(Math.max(pending, 0))}
                      </option>
                    );
                  })}
                </select>
              </label>
            ) : (
              <input name="fee_record_id" type="hidden" value={firstFee.id} />
            )}

            <label className="grid gap-2">
              <span className="label">Payment method *</span>
              <select className="field" defaultValue="" name="payment_method" required>
                <option disabled value="">Select payment method</option>
                {["Bank Transfer", "Easypaisa", "JazzCash", "Cash", "Other"].map((method) => <option key={method}>{method}</option>)}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="label">Amount paid *</span>
              <input
                className="field"
                defaultValue={Math.max(pendingAmount, 0)}
                inputMode="numeric"
                min={1}
                name="amount"
                required
                type="number"
              />
            </label>

            <label className="grid gap-2">
              <span className="label">Receipt screenshot *</span>
              <span className="grid gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ImageUp size={18} /> Upload payment proof
                </span>
                <input
                  accept="image/*"
                  className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
                  name="screenshot"
                  required
                  type="file"
                />
              </span>
            </label>

          <label className="grid gap-2">
            <span className="label">Transaction / reference ID</span>
            <span className="relative block">
              <ReceiptText className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input className="field pl-10" name="transaction_id" placeholder="Optional for cash" />
            </span>
          </label>

            <SubmitButton pendingText="Submitting...">
              <CreditCard size={18} /> Submit Payment
            </SubmitButton>
          </section>
        ) : null}
      </form>
    </main>
  );
}
