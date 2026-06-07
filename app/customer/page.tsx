import Link from "next/link";
import { CalendarDays, CreditCard, MapPin, ReceiptText } from "lucide-react";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { prettyStatus } from "@/components/ui/StatusBadge";
import { getCurrentCustomer, getSettings } from "@/lib/app-queries";
import { paymentInstructionsFromSettings } from "@/lib/daniyal-transport";
import { currentMonthYear, formatDisplayDate, formatMoney, makeDueDate } from "@/lib/utils/date";

export default async function CustomerDashboard() {
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
  const dueDate = fee?.due_date ?? makeDueDate(year, month, Number(settings?.default_due_day ?? 10));

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
              <p className="mt-1 text-4xl font-bold text-slate-950">{formatMoney(Math.max(pending, 0))}</p>
            </div>
            <span className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-amber-100 px-4 text-sm font-bold text-amber-900">
              {prettyStatus(feeStatus)}
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-red-700" style={{ width: `${paidPercent}%` }} />
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

          <Link className="btn btn-primary mt-5 w-full" href="/customer/submit-payment">Submit Payment</Link>
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
          </div>
        </div>
      </section>
    </main>
  );
}
