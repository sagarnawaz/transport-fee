import { generateFeesAction, markFeePaidAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { businessName } from "@/lib/daniyal-transport";
import { clampMonth, currentMonthYear, formatDisplayDate, formatMoney, formatMonthYear, safeYear } from "@/lib/utils/date";
import { defaultReminderTemplate, renderReminder, whatsappLink } from "@/lib/whatsapp/reminder";

export default async function MonthlyFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; month?: string; year?: string; status?: string; q?: string }>;
}) {
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const params = await searchParams;
  const now = currentMonthYear();
  const month = clampMonth(params.month ?? now.month);
  const year = safeYear(params.year ?? now.year);
  const [{ data: fees }, { data: settings }] = await Promise.all([
    supabase
      .from("monthly_fee_records")
      .select("*, customers(customer_code, full_name, phone, whatsapp_number)")
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

  return (
    <main className="section">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Manage Fees</h1>
        <p className="mt-1 text-sm text-slate-600">Mark payments paid and send simple reminders for {formatMonthYear(month, year)}.</p>
      </div>

      {params.error === "mark-paid" ? (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          Payment could not be marked paid. Please check admin login and try again.
        </p>
      ) : null}

      <form action={generateFeesAction} className="panel mt-4 grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto]">
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
        <div className="grid content-end">
          <SubmitButton>Generate</SubmitButton>
        </div>
      </form>

      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <input name="month" type="hidden" value={month} />
        <input name="year" type="hidden" value={year} />
        <select className="field" defaultValue={params.status ?? ""} name="status">
          <option value="">All</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending_verification">Pending proof</option>
          <option value="paid">Paid</option>
        </select>
        <input className="field sm:col-span-3" defaultValue={params.q ?? ""} name="q" placeholder="Search name, phone, ID" />
        <button className="btn btn-secondary" type="submit">Search</button>
      </form>

      <div className="mt-5 grid gap-3">
        {!filtered.length ? <EmptyState title="No fee records" text="Generate fees first or change the filter." /> : null}
        {filtered.map((fee) => {
          const customer = fee.customers;
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
            <article className="panel p-4" key={fee.id}>
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

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <form action={markFeePaidAction}>
                  <input name="fee_record_id" type="hidden" value={fee.id} />
                  <input name="fee_amount" type="hidden" value={fee.fee_amount} />
                  <input name="month" type="hidden" value={month} />
                  <input name="year" type="hidden" value={year} />
                  <SubmitButton className="btn btn-primary w-full" disabled={isPaid}>
                    {isPaid ? "Paid" : "Mark Paid"}
                  </SubmitButton>
                </form>
                <a className="btn btn-secondary" href={whatsappLink(customer?.whatsapp_number ?? customer?.phone ?? "", message)} target="_blank">
                  WhatsApp Reminder
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
