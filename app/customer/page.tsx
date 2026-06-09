import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, CreditCard, MapPin, ReceiptText } from "lucide-react";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentCustomer, getSettings } from "@/lib/app-queries";
import { requireRole } from "@/lib/auth-guards";
import { paymentInstructionsFromSettings, receiptWhatsappForDrop } from "@/lib/daniyal-transport";
import { currentMonthYear, formatDisplayDate, formatMoney, makeDueDate } from "@/lib/utils/date";
import { whatsappLink } from "@/lib/whatsapp/reminder";

export default async function CustomerDashboard() {
  await requireRole("customer");
  const { supabase, customer } = await getCurrentCustomer();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const settings = await getSettings();
  const { month, year } = currentMonthYear();
  const { data: fee } = customer
    ? await supabase.from("monthly_fee_records").select("*").eq("customer_id", customer.id).eq("month", month).eq("year", year).maybeSingle()
    : { data: null };
  const feeAmount = Number(fee?.fee_amount ?? customer?.monthly_fee ?? 0);
  const paidAmount = Number(fee?.paid_amount ?? 0);
  const pending = feeAmount - paidAmount;
  const paidPercent = feeAmount > 0 ? Math.min(Math.max((paidAmount / feeAmount) * 100, 0), 100) : 0;
  const rideType = customer?.ride_type === "one_side" ? "One side" : "Both side";
  const feeStatus = fee?.status ?? "unpaid";
  const displayStatus = pending <= 0 && fee ? "paid" : feeStatus;
  const isPaid = displayStatus === "paid";
  const isPendingVerification = feeStatus === "pending_verification";
  const canSubmitPayment = Boolean(fee && pending > 0 && !isPendingVerification && !isPaid);
  const dueDate = fee?.due_date ?? makeDueDate(year, month, Number(settings?.default_due_day ?? 10));
  const receiptWhatsappNumber = customer ? receiptWhatsappForDrop(settings, customer.drop_address) : "";
  const whatsappMessage = `Assalam o Alaikum, I am ${customer?.full_name ?? "customer"} (${customer?.customer_code ?? "-"}). I want to ask about my transport fee/payment.`;

  return (
    <main className="section">
      <section className="panel overflow-hidden">
        <div className="bg-neutral-950 p-5 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide">
                {customer?.customer_code ?? "Customer"}
              </p>
              <h1 className="mt-3 truncate text-2xl font-bold">{customer?.full_name ?? "Welcome"}</h1>
              <p className="mt-1 text-sm text-red-50">Current month fee summary</p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-2 text-sm font-bold text-red-700">
              {rideType}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Amount due</p>
              <p className={`mt-1 text-4xl font-bold ${isPaid ? "text-emerald-700" : "text-slate-950"}`}>
                {formatMoney(Math.max(pending, 0))}
              </p>
            </div>
            <div className="shrink-0">
              <StatusBadge status={displayStatus} />
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${isPaid ? "bg-emerald-600" : isPendingVerification ? "bg-sky-600" : "bg-red-700"}`}
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Paid {formatMoney(paidAmount)}</span>
            <span>Total {formatMoney(feeAmount)}</span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-slate-100 pt-5 text-sm">
            <div className="flex gap-3">
              <CreditCard className="mt-0.5 text-red-700" size={18} />
              <div>
                <p className="text-slate-500">Monthly fee</p>
                <p className="font-bold text-slate-950">{formatMoney(feeAmount)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 text-red-700" size={18} />
              <div>
                <p className="text-slate-500">Due date</p>
                <p className="font-bold text-slate-950">{formatDisplayDate(dueDate)}</p>
              </div>
            </div>
            <div className="col-span-2 flex gap-3">
              <MapPin className="mt-0.5 text-red-700" size={18} />
              <div className="min-w-0">
                <p className="text-slate-500">Trip</p>
                <p className="break-words font-bold text-slate-950">
                  {customer?.pickup_address ?? "Pickup"} to {customer?.drop_address ?? "Drop off"}
                </p>
              </div>
            </div>
          </div>

          {canSubmitPayment ? (
            <Link className="btn btn-primary mt-5 w-full" href="/customer/submit-payment">Submit Payment</Link>
          ) : isPendingVerification ? (
            <div className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-sky-50 px-4 text-sm font-bold text-sky-800">
              <Clock3 size={18} /> Payment submitted, verification pending
            </div>
          ) : isPaid ? (
            <div className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 text-sm font-bold text-emerald-800">
              <CheckCircle2 size={18} /> Payment complete
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel mt-4 p-5">
        <div className="flex gap-3">
          <ReceiptText className="mt-0.5 text-red-700" size={20} />
          <div>
            <h2 className="text-base font-bold text-slate-950">Payment instructions</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {customer ? paymentInstructionsFromSettings(settings, customer.drop_address) : settings?.payment_instructions ?? "Pay outside the system, then upload your screenshot and transaction ID."}
            </p>
            {receiptWhatsappNumber ? (
              <a
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
                href={whatsappLink(receiptWhatsappNumber, whatsappMessage)}
                target="_blank"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </section>
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
