import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { csvDownloadHref } from "@/lib/csv/export";
import { createClient } from "@/lib/supabase/server";
import { currentMonthYear, formatDisplayDate, formatMoney, formatMonthYear } from "@/lib/utils/date";

export default async function CustomersPage() {
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
          <a
            className={`btn btn-primary ${unpaidRows.length ? "" : "pointer-events-none opacity-60"}`}
            download={`unpaid-customers-${month}-${year}.csv`}
            href={csvDownloadHref(unpaidRows.map((row) => row.csv))}
          >
            Download Unpaid CSV / Excel
          </a>
          <a
            className={`btn btn-secondary ${rows.length ? "" : "pointer-events-none opacity-60"}`}
            download={`all-customers-fee-status-${month}-${year}.csv`}
            href={csvDownloadHref(rows.map((row) => row.csv))}
          >
            Download Full List
          </a>
        </div>
      </section>

      <div className="mt-5 grid gap-3">
        {!customers?.length ? <EmptyState title="No customers yet" text="New registrations will appear here." /> : null}
        {rows.map(({ customer, fee, pendingAmount, status }) => (
          <article className="panel p-4" key={customer.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-950">{customer.full_name}</p>
                <p className="mt-1 text-sm text-slate-600">{customer.customer_code ?? "No ID"} - {customer.phone}</p>
              </div>
              <StatusBadge status={pendingAmount <= 0 ? "paid" : status} />
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
          </article>
        ))}
      </div>
    </main>
  );
}
