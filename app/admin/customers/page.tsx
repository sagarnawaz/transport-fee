import Link from "next/link";
import { DownloadCsvLink } from "@/components/ui/DownloadCsvLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { csvDownloadHref } from "@/lib/csv/export";
import { requireRole } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";
import { currentMonthYear, formatDisplayDate, formatMoney, formatMonthYear } from "@/lib/utils/date";
import { whatsappLink } from "@/lib/whatsapp/reminder";

const customerCardClasses: Record<string, string> = {
  paid: "border-emerald-300 bg-emerald-50/30",
  unpaid: "border-amber-300 bg-amber-50/30",
  pending_verification: "border-sky-300 bg-sky-50/40",
  partial: "border-violet-300 bg-violet-50/30",
  rejected: "border-rose-300 bg-rose-50/30",
};

function customerCardClass(status: string) {
  return customerCardClasses[status] ?? "border-slate-200";
}

export default async function CustomersPage() {
  await requireRole("admin");
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;

  const { month, year } = currentMonthYear();
  const [{ data: customers }, { data: fees }] = await Promise.all([
    supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("monthly_fee_records")
      .select("*")
      .eq("month", month)
      .eq("year", year),
  ]);

  const feeByCustomer = new Map((fees ?? []).map((fee) => [fee.customer_id, fee]));
  const activeCustomers = (customers ?? []).filter((customer) => customer.status === "active");
  const rows = activeCustomers.map((customer) => {
    const fee = feeByCustomer.get(customer.id);
    const feeAmount = Number(fee?.fee_amount ?? customer.monthly_fee ?? 0);
    const paidAmount = Number(fee?.paid_amount ?? 0);
    const pendingAmount = Math.max(feeAmount - paidAmount, 0);
    const status = fee?.status ?? "unpaid";

    return {
      customer,
      fee,
      pendingAmount,
      status,
      csv: {
        "Customer ID": customer.customer_code ?? "-",
        Name: customer.full_name,
        Phone: customer.phone,
        WhatsApp: customer.whatsapp_number ?? customer.phone,
        Month: formatMonthYear(month, year),
        "Due Date": formatDisplayDate(fee?.due_date),
        "Monthly Fee": feeAmount,
        Paid: paidAmount,
        Pending: pendingAmount,
        Status: status,
        Pickup: customer.pickup_address,
        Drop: customer.drop_address,
      },
    };
  });
  const unpaidRows = rows.filter((row) => row.pendingAmount > 0 && row.status !== "paid");
  const paidCount = rows.length - unpaidRows.length;
  const pendingTotal = unpaidRows.reduce((sum, row) => sum + row.pendingAmount, 0);

  return (
    <main className="section">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Customers</h1>
          <p className="mt-1 text-sm text-slate-600">{formatMonthYear(month, year)} fee status for all registered customers.</p>
        </div>
        <Link className="btn btn-secondary" href="/admin/monthly-fees">
          Manage Fees
        </Link>
      </div>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="panel p-4">
          <p className="text-sm text-slate-500">Registered</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{customers?.length ?? 0}</p>
        </div>
        <div className="panel p-4">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{rows.length}</p>
        </div>
        <div className="panel p-4">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{paidCount}</p>
        </div>
        <div className="panel p-4">
          <p className="text-sm text-slate-500">Unpaid</p>
          <p className="mt-1 text-2xl font-bold text-red-700">{unpaidRows.length}</p>
        </div>
      </section>

      <section className="panel mt-4 p-4">
        <p className="text-sm font-semibold text-slate-700">Unpaid total</p>
        <p className="mt-1 text-3xl font-bold text-red-700">{formatMoney(pendingTotal)}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DownloadCsvLink
            className="btn btn-primary"
            download={`unpaid-customers-${month}-${year}.csv`}
            disabled={!unpaidRows.length}
            href={csvDownloadHref(unpaidRows.map((row) => row.csv))}
          >
            Download Unpaid CSV / Excel
          </DownloadCsvLink>
          <DownloadCsvLink
            className="btn btn-secondary"
            download={`all-customers-fee-status-${month}-${year}.csv`}
            disabled={!rows.length}
            href={csvDownloadHref(rows.map((row) => row.csv))}
          >
            Download Full List
          </DownloadCsvLink>
        </div>
      </section>

      <div className="mt-5 grid gap-3">
        {!customers?.length ? <EmptyState title="No customers yet" text="New registrations will appear here." /> : null}
        {rows.map(({ customer, fee, pendingAmount, status }) => {
          const whatsappMessage = `Assalam o Alaikum ${customer.full_name}, your ${formatMonthYear(month, year)} transport fee status: Pending ${formatMoney(pendingAmount)}. Customer ID: ${customer.customer_code ?? "-"}.`;
          const displayStatus = pendingAmount <= 0 ? "paid" : status;

          return (
            <article className={`panel border-2 p-4 ${customerCardClass(displayStatus)}`} key={customer.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-slate-950">{customer.full_name}</p>
                  <p className="mt-1 text-sm text-slate-600">{customer.customer_code ?? "No ID"} - {customer.phone}</p>
                </div>
                <StatusBadge status={displayStatus} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Due date</p>
                  <p className="font-semibold text-slate-950">{formatDisplayDate(fee?.due_date)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Pending</p>
                  <p className="font-semibold text-red-700">{formatMoney(pendingAmount)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monthly fee</p>
                  <p className="font-semibold text-slate-950">{formatMoney(fee?.fee_amount ?? customer.monthly_fee)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Joined</p>
                  <p className="font-semibold text-slate-950">{formatDisplayDate(customer.joining_date)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                <a
                  aria-label={`Send WhatsApp message to ${customer.full_name}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#1ebe5d]"
                  href={whatsappLink(customer.whatsapp_number ?? customer.phone, whatsappMessage)}
                  target="_blank"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </a>
              </div>
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
