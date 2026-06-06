import { CheckCircle2, ReceiptText, XCircle } from "lucide-react";
import { approveProofAction, rejectProofAction } from "@/app/actions";
import { ScreenshotPreview } from "@/components/admin/ScreenshotPreview";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { formatDisplayDate, formatMoney, formatMonthYear } from "@/lib/utils/date";

export default async function PendingPaymentsPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: proofs } = await supabase
    .from("payment_proofs")
    .select("*, customers(customer_code, full_name, phone, ride_type), monthly_fee_records(month, year, fee_amount, paid_amount)")
    .eq("status", "pending")
    .order("submitted_at");

  const withUrls = await Promise.all(
    (proofs ?? []).map(async (proof) => {
      if (!proof.screenshot_path) return { ...proof, signedUrl: null };
      const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(proof.screenshot_path, 60 * 10);
      return { ...proof, signedUrl: data?.signedUrl ?? null };
    })
  );

  const totalAmount = withUrls.reduce((sum, proof) => sum + Number(proof.amount ?? 0), 0);

  return (
    <main className="section">
      <div className="panel overflow-hidden">
        <div className="bg-neutral-950 p-5 text-white">
          <p className="text-sm font-semibold text-red-50">Admin review</p>
          <h1 className="mt-1 text-2xl font-bold">Pending Payments</h1>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Requests</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{withUrls.length}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm text-slate-500">Amount</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{formatMoney(totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {!withUrls.length ? <EmptyState title="No pending payments" text="Customer payment submissions will appear here." /> : null}
        {withUrls.map((proof) => {
          const fee = proof.monthly_fee_records;
          const rideType = proof.customers?.ride_type === "one_side" ? "One side" : "Both side";
          const feeAmount = Number(fee?.fee_amount ?? proof.amount);
          const paidAmount = Number(fee?.paid_amount ?? 0);
          const balanceAfter = Math.max(feeAmount - paidAmount - Number(proof.amount), 0);

          return (
            <article className="panel overflow-hidden" key={proof.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-red-700">{proof.customers?.customer_code ?? "Customer"}</p>
                    <h2 className="mt-1 truncate text-xl font-bold text-slate-950">{proof.customers?.full_name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{proof.customers?.phone} - {rideType}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-slate-500">Paid</p>
                    <p className="text-2xl font-bold text-red-700">{formatMoney(proof.amount)}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Fee month</p>
                    <p className="font-bold text-slate-950">
                      {fee ? formatMonthYear(fee.month, fee.year) : "-"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Balance after</p>
                    <p className="font-bold text-slate-950">{formatMoney(balanceAfter)}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Method</p>
                    <p className="font-bold text-slate-950">{proof.payment_method}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-slate-500">Date</p>
                    <p className="font-bold text-slate-950">{formatDisplayDate(proof.payment_date)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <ReceiptText size={17} /> Reference
                  </div>
                  <p className="mt-1 break-words text-slate-600">{proof.transaction_id || "No reference provided"}</p>
                </div>

                {proof.signedUrl ? (
                  <ScreenshotPreview url={proof.signedUrl} />
                ) : null}
              </div>

              <div className="grid gap-3 border-t border-slate-100 bg-slate-50 p-4">
                <form action={approveProofAction} className="grid">
                  <input name="proof_id" type="hidden" value={proof.id} />
                  <input name="fee_record_id" type="hidden" value={proof.fee_record_id} />
                  <input name="amount" type="hidden" value={proof.amount} />
                  <SubmitButton className="btn btn-primary min-h-12 w-full">
                    <CheckCircle2 size={18} /> Approve
                  </SubmitButton>
                </form>
                <form action={rejectProofAction} className="grid gap-2 sm:grid-cols-[1fr_180px]">
                  <input name="proof_id" type="hidden" value={proof.id} />
                  <input name="fee_record_id" type="hidden" value={proof.fee_record_id} />
                  <input className="field bg-white" name="admin_note" placeholder="Reject reason" />
                  <SubmitButton className="btn btn-danger min-h-12 w-full">
                    <XCircle size={18} /> Reject
                  </SubmitButton>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
