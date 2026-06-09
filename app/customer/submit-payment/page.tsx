import { CreditCard, ImageUp, ReceiptText } from "lucide-react";
import { submitProofAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getCurrentCustomer, getSettings } from "@/lib/app-queries";
import { requireRole } from "@/lib/auth-guards";
import { paymentInstructionsFromSettings, receiptWhatsappForDrop } from "@/lib/daniyal-transport";
import { formatMoney, formatMonthYear } from "@/lib/utils/date";
import { whatsappLink } from "@/lib/whatsapp/reminder";

export default async function SubmitPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  await requireRole("customer");
  const params = await searchParams;
  const { supabase, customer } = await getCurrentCustomer();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const settings = await getSettings();
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
    screenshot: "Please upload a payment proof image up to 5 MB. Cash payments can be submitted without a screenshot.",
    upload: "Could not upload the screenshot. Please try again.",
    submit: "Could not submit payment. Please try again.",
    "missing-config": "App setup is incomplete.",
    "no-customer": "Customer profile was not found.",
  };
  const receiptWhatsappNumber = customer ? receiptWhatsappForDrop(settings, customer.drop_address) : "";
  const whatsappMessage = `Assalam o Alaikum, I am ${customer?.full_name ?? "customer"} (${customer?.customer_code ?? "-"}). I want to send/ask about my transport fee payment.`;

  return (
    <main className="section">
      <form action={submitProofAction} className="mx-auto grid max-w-2xl gap-4">
        <section className="panel overflow-hidden">
          <div className="bg-neutral-950 p-5 text-white">
            <p className="text-sm font-semibold text-red-50">Payment proof</p>
            <h1 className="mt-1 text-2xl font-bold">Submit Payment</h1>
            <p className="mt-2 text-sm leading-6 text-red-50">
              Upload your receipt screenshot after making the payment.
            </p>
          </div>
          <div className="p-5">
            {params.submitted ? (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
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
                  <p className="mt-1 text-base font-bold text-slate-950">{formatMonthYear(firstFee.month, firstFee.year)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {firstFee ? (
          <section className="panel grid gap-4 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Payment details</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">For cash payments, a screenshot is not needed.</p>
            </div>
            {customer ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-950">
                <p className="font-bold">Route payment account</p>
                <p className="mt-1 whitespace-pre-line">{paymentInstructionsFromSettings(settings, customer.drop_address)}</p>
                {receiptWhatsappNumber ? (
                  <a
                    className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
                    href={whatsappLink(receiptWhatsappNumber, whatsappMessage)}
                    target="_blank"
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </a>
                ) : null}
              </div>
            ) : null}

            {fees && fees.length > 1 ? (
              <label className="grid gap-2">
                <span className="label">Fee month *</span>
                <select className="field" defaultValue={firstFee.id} name="fee_record_id" required>
                  {fees.map((fee) => {
                    const pending = Number(fee.fee_amount) - Number(fee.paid_amount);
                    return (
                      <option key={fee.id} value={fee.id}>
                        {formatMonthYear(fee.month, fee.year)} - {formatMoney(Math.max(pending, 0))}
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
              <span className="label">Receipt screenshot</span>
              <span className="grid gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ImageUp size={18} /> Upload payment proof
                </span>
                <input
                  accept="image/*"
                  className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800"
                  name="screenshot"
                  type="file"
                />
                <span className="text-xs font-semibold leading-5 text-slate-500">
                  Required for bank/wallet payments. Optional for cash.
                </span>
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

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.33 4.95L2.05 22l5.27-1.38a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.44 9.91-9.9C21.96 6.45 17.51 2 12.04 2Zm0 18.14h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.13.82.84-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.37c0-4.54 3.69-8.23 8.24-8.23a8.22 8.22 0 0 1 8.23 8.24c0 4.53-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.73-1.7-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.04s.88 2.37 1 2.53c.12.17 1.72 2.63 4.18 3.69.58.25 1.04.4 1.39.51.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
