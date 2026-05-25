import { generateFeesAction, markFeePaidAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { currentMonthYear, formatMoney, monthNames } from "@/lib/utils/date";
import { defaultReminderTemplate, renderReminder, whatsappLink } from "@/lib/whatsapp/reminder";

export default async function MonthlyFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; status?: string; q?: string }>;
}) {
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const params = await searchParams;
  const now = currentMonthYear();
  const month = Number(params.month ?? now.month);
  const year = Number(params.year ?? now.year);
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
    const matchesStatus = !params.status || fee.status === params.status;
    const q = (params.q ?? "").toLowerCase();
    const matchesQ = !q || [customer?.full_name, customer?.phone, customer?.customer_code].some((part) => String(part ?? "").toLowerCase().includes(q));
    return matchesStatus && matchesQ;
  });

  return (
    <main className="section">
      <h1 className="text-2xl font-bold">Monthly Fees</h1>
      <form action={generateFeesAction} className="panel mt-4 grid gap-3 p-4 sm:grid-cols-4">
        <input className="field" defaultValue={month} max={12} min={1} name="month" type="number" />
        <input className="field" defaultValue={year} name="year" type="number" />
        <input className="field" defaultValue={settings?.default_due_day ?? 10} max={28} min={1} name="due_day" type="number" />
        <SubmitButton>Generate Fees</SubmitButton>
      </form>
      <form className="mt-4 grid gap-3 sm:grid-cols-4">
        <input className="field" defaultValue={month} name="month" type="number" />
        <input className="field" defaultValue={year} name="year" type="number" />
        <select className="field" defaultValue={params.status ?? ""} name="status">
          <option value="">All status</option>
          {["unpaid", "pending_verification", "paid", "partial", "rejected"].map((status) => <option key={status}>{status}</option>)}
        </select>
        <input className="field" defaultValue={params.q ?? ""} name="q" placeholder="Name, phone, ID" />
        <button className="btn btn-secondary sm:col-span-4" type="submit">Apply Filters</button>
      </form>
      <div className="mt-5 grid gap-3">
        {!filtered.length ? <EmptyState title="No fee records" text="Generate fees for active customers or adjust filters." /> : null}
        {filtered.map((fee) => {
          const customer = fee.customers;
          const pending = Number(fee.fee_amount) - Number(fee.paid_amount);
          const message = renderReminder(settings?.whatsapp_reminder_template ?? defaultReminderTemplate, {
            customer_name: customer?.full_name ?? "Customer",
            customer_id: customer?.customer_code ?? "-",
            month,
            year,
            amount: Number(fee.fee_amount),
            pending_amount: Math.max(pending, 0),
            business_name: settings?.business_name ?? "Transport Fee Manager",
            phone: customer?.whatsapp_number ?? customer?.phone ?? "",
          });
          return (
            <article className="panel p-4" key={fee.id}>
              <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-bold">{customer?.customer_code ?? "-"} - {customer?.full_name}</p>
                  <p className="text-sm text-slate-600">{customer?.phone}</p>
                </div>
                <div className="justify-self-start"><StatusBadge status={fee.status} /></div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-slate-500">Fee</p><p className="font-semibold">{formatMoney(fee.fee_amount)}</p></div>
                <div><p className="text-slate-500">Paid</p><p className="font-semibold">{formatMoney(fee.paid_amount)}</p></div>
                <div><p className="text-slate-500">Pending</p><p className="font-semibold">{formatMoney(pending)}</p></div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <form action={markFeePaidAction}>
                  <input name="fee_record_id" type="hidden" value={fee.id} />
                  <input name="fee_amount" type="hidden" value={fee.fee_amount} />
                  <SubmitButton className="btn btn-secondary w-full">Mark Paid</SubmitButton>
                </form>
                <a className="btn btn-primary" href={whatsappLink(customer?.whatsapp_number ?? customer?.phone ?? "", message)} target="_blank">WhatsApp Reminder</a>
                <span className="btn btn-secondary">{monthNames[month - 1]} {year}</span>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
