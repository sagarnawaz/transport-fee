import { CheckCircle2, ReceiptText } from "lucide-react";
import { approveProofAction } from "@/app/actions";
import { ScreenshotPreview } from "@/components/admin/ScreenshotPreview";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireRole } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";
import { businessName } from "@/lib/daniyal-transport";
import { clampMonth, currentMonthYear, formatDisplayDate, formatDisplayDateTime, formatMoney, formatMonthYear, safeYear } from "@/lib/utils/date";
import { defaultReminderTemplate, renderReminder, whatsappLink } from "@/lib/whatsapp/reminder";
import { FeeFilters } from "./FeeFilters";
import { RejectPaymentForm } from "./RejectPaymentForm";

type FeePaymentProof = {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string | null;
  screenshot_path: string | null;
  status: string;
  submitted_at: string | null;
  transaction_id: string | null;
};

export default async function MonthlyFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; month?: string; year?: string; status?: string; q?: string }>;
}) {
  await requireRole("admin");
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const params = await searchParams;
  const now = currentMonthYear();
  const month = clampMonth(params.month ?? now.month);
  const year = safeYear(params.year ?? now.year);
  const [{ data: fees }, { data: settings }] = await Promise.all([
    supabase
      .from("monthly_fee_records")
      .select("*, customers(customer_code, full_name, phone, whatsapp_number), payment_proofs(*)")
      .eq("month", month)
      .eq("year", year)
      .order("created_at", { ascending: false }),
    supabase.from("settings").select("*").limit(1).maybeSingle(),
  ]);

  const filtered = (fees ?? []).filter((fee) => {
    const customer = fee.customers;
    const statusFilter = params.status === "unpaid" ? ["unpaid", "partial", "rejected"] : [params.status];
    const matchesStatus = !params.status || statusFilter.includes(fee.status);
    const q = (params.q ?? "").toLowerCase();
    const matchesQ = !q || [customer?.full_name, customer?.phone, customer?.customer_code].some((part) => String(part ?? "").toLowerCase().includes(q));
    return matchesStatus && matchesQ;
  });
  const pendingProofs = filtered.flatMap((fee) =>
    ((fee.payment_proofs ?? []) as FeePaymentProof[])
      .filter((proof) => proof.status === "pending")
      .map((proof) => ({ ...proof, feeId: fee.id })),
  );
  const signedUrlByProofId = new Map(
    await Promise.all(
      pendingProofs.map(async (proof) => {
        if (!proof.screenshot_path) return [proof.id, null] as const;
        const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(proof.screenshot_path, 60 * 10);
        return [proof.id, data?.signedUrl ?? null] as const;
      }),
    ),
  );
  const pendingProofCount = pendingProofs.length;

  return (
    <main className="section">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Fees</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review monthly fees, approve submitted proofs, and send reminders for {formatMonthYear(month, year)}.
        </p>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <div className="panel p-3 sm:p-4">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Fee records</p>
          <p className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">{filtered.length}</p>
        </div>
        <div className="panel p-3 sm:p-4">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Need review</p>
          <p className="mt-1 text-xl font-bold text-sky-700 sm:text-2xl">{pendingProofCount}</p>
        </div>
        <div className="panel p-3 sm:p-4">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Paid</p>
          <p className="mt-1 text-xl font-bold text-emerald-700 sm:text-2xl">
            {filtered.filter((fee) => fee.status === "paid").length}
          </p>
        </div>
        <div className="panel p-3 sm:p-4">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">Unpaid</p>
          <p className="mt-1 text-xl font-bold text-red-700 sm:text-2xl">
            {filtered.filter((fee) => ["unpaid", "partial", "rejected"].includes(fee.status)).length}
          </p>
        </div>
      </section>

      {/*
      <form action={generateFeesAction} className="panel mt-4 grid gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="text-base font-bold text-slate-950">{formatMonthYear(month, year)} fee setup</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Create unpaid fee records for all active customers. Existing records will stay unchanged.
            </p>
          </div>
          <SubmitButton className="btn btn-primary w-full sm:w-auto">Generate {formatMonthYear(month, year)} Fees</SubmitButton>
        </div>

        <details className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-sm font-bold text-slate-800">Change month or due date</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-2">
              <span className="label">Month</span>
              <input className="field" defaultValue={month} max={12} min={1} name="month" type="number" />
            </label>
            <label className="grid gap-2">
              <span className="label">Year</span>
              <input className="field" defaultValue={year} name="year" type="number" />
            </label>
            <label className="grid gap-2">
              <span className="label">Due day</span>
              <input className="field" defaultValue={settings?.default_due_day ?? 10} max={28} min={1} name="due_day" type="number" />
            </label>
          </div>
        </details>
      </form>
      */}

      <FeeFilters month={month} q={params.q} status={params.status} year={year} />

      <div className="mt-5 grid gap-3">
        {!filtered.length ? <EmptyState title="No fee records" text="Generate fees first or change the filter." /> : null}
        {filtered.map((fee) => {
          const customer = fee.customers;
          const pendingProofsForFee = ((fee.payment_proofs ?? []) as FeePaymentProof[]).filter((proof) => proof.status === "pending");
          const needsReview = pendingProofsForFee.length > 0;
          const pending = Math.max(Number(fee.fee_amount) - Number(fee.paid_amount), 0);
          const isPaid = fee.status === "paid" || pending <= 0;
          const message = renderReminder(settings?.whatsapp_reminder_template ?? defaultReminderTemplate, {
            customer_name: customer?.full_name ?? "Customer",
            customer_id: customer?.customer_code ?? "-",
            month,
            year,
            amount: Number(fee.fee_amount),
            pending_amount: pending,
            business_name: settings?.business_name ?? businessName,
            phone: customer?.whatsapp_number ?? customer?.phone ?? "",
          });

          return (
            <article
              className={`panel p-4 ${
                needsReview ? "border-2 border-sky-300 bg-sky-50/40 shadow-md shadow-sky-100" : ""
              }`}
              key={fee.id}
            >
              {needsReview ? (
                <div className="-mx-4 -mt-4 mb-4 flex items-center justify-between gap-3 rounded-t-lg bg-sky-700 px-4 py-3 text-white">
                  <div className="flex min-w-0 items-center gap-2 text-sm font-bold">
                    <ReceiptText size={18} />
                    <span className="truncate">Verification needed</span>
                  </div>
                  <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">
                    {pendingProofsForFee.length} proof{pendingProofsForFee.length > 1 ? "s" : ""}
                  </span>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-950">{customer?.full_name ?? "Customer"}</p>
                  <p className="mt-1 text-sm text-slate-600">{customer?.customer_code ?? "-"} - {customer?.phone ?? "-"}</p>
                </div>
                <StatusBadge status={isPaid ? "paid" : fee.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Pending</p>
                  <p className="font-bold text-red-700">{formatMoney(pending)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Paid</p>
                  <p className="font-semibold text-slate-950">{formatMoney(fee.paid_amount)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Due</p>
                  <p className="font-semibold text-slate-950">{formatDisplayDate(fee.due_date)}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <a
                  aria-label={`Send WhatsApp reminder to ${customer?.full_name ?? "customer"}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
                  href={whatsappLink(customer?.whatsapp_number ?? customer?.phone ?? "", message)}
                  target="_blank"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              </div>

              {pendingProofsForFee.length ? (
                <div className="mt-4 grid gap-3 border-t border-sky-200 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                    <ReceiptText className="text-sky-700" size={18} />
                    Review submitted payment
                  </div>
                  {pendingProofsForFee.map((proof) => {
                    const balanceAfter = Math.max(pending - Number(proof.amount ?? 0), 0);
                    const signedUrl = signedUrlByProofId.get(proof.id);

                    return (
                      <div className="rounded-lg border border-sky-200 bg-white p-3 shadow-sm" key={proof.id}>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-500">Amount</p>
                            <p className="font-bold text-slate-950">{formatMoney(proof.amount)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Balance after</p>
                            <p className="font-bold text-slate-950">{formatMoney(balanceAfter)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Method</p>
                            <p className="font-semibold text-slate-950">{proof.payment_method}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Date</p>
                            <p className="font-semibold text-slate-950">{formatDisplayDate(proof.payment_date)}</p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                          <p className="text-slate-500">Submitted date & time</p>
                          <p className="mt-1 font-bold text-slate-950">{formatDisplayDateTime(proof.submitted_at)}</p>
                        </div>
                        {proof.transaction_id ? (
                          <p className="mt-3 break-words rounded-lg bg-white p-3 text-sm text-slate-700">
                            Reference: {proof.transaction_id}
                          </p>
                        ) : null}
                        {signedUrl ? (
                          <ScreenshotPreview url={signedUrl} />
                        ) : proof.payment_method === "Cash" ? (
                          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">
                            Cash payment submitted. No screenshot is required for this payment.
                          </p>
                        ) : (
                          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold leading-6 text-rose-900">
                            No screenshot was uploaded for this payment.
                          </p>
                        )}
                        <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3">
                          <form action={approveProofAction} className="grid">
                            <input name="proof_id" type="hidden" value={proof.id} />
                            <input name="fee_record_id" type="hidden" value={fee.id} />
                            <input name="amount" type="hidden" value={proof.amount} />
                            <SubmitButton className="btn min-h-12 w-full bg-emerald-600 text-white hover:bg-emerald-700">
                              <CheckCircle2 size={18} /> Approve Payment
                            </SubmitButton>
                          </form>
                          <RejectPaymentForm feeRecordId={fee.id} proofId={proof.id} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.27-1.38a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.44 9.91-9.9C21.96 6.45 17.51 2 12.04 2Zm0 18.14h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.37c0-4.54 3.69-8.23 8.24-8.23a8.22 8.22 0 0 1 8.23 8.24c0 4.53-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.04s.88 2.37 1 2.53c.12.17 1.72 2.63 4.18 3.69.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
