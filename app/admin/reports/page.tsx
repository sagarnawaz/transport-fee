import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { toCsv } from "@/lib/csv/export";
import { createClient } from "@/lib/supabase/server";
import { currentMonthYear } from "@/lib/utils/date";

function downloadHref(csv: string) {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}

export default async function ReportsPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { month, year } = currentMonthYear();
  const { data: fees } = await supabase
    .from("monthly_fee_records")
    .select("*, customers(customer_code, full_name, phone, whatsapp_number, monthly_fee, routes(route_name))")
    .eq("month", month)
    .eq("year", year);

  const rows = (fees ?? []).map((fee) => ({
    "Customer ID": fee.customers?.customer_code ?? "",
    "Customer Name": fee.customers?.full_name ?? "",
    Phone: fee.customers?.phone ?? "",
    "WhatsApp Number": fee.customers?.whatsapp_number ?? "",
    Route: fee.customers?.routes?.route_name ?? "",
    "Monthly Fee": fee.customers?.monthly_fee ?? fee.fee_amount,
    Month: fee.month,
    Year: fee.year,
    Status: fee.status,
    "Paid Amount": fee.paid_amount,
    "Pending Amount": Number(fee.fee_amount) - Number(fee.paid_amount),
  }));

  const reports = [
    ["All current month records", rows],
    ["Paid customers", rows.filter((row) => row.Status === "paid")],
    ["Unpaid customers", rows.filter((row) => row.Status === "unpaid" || row.Status === "rejected")],
    ["Pending verification payments", rows.filter((row) => row.Status === "pending_verification")],
    ["Route-wise report", rows.sort((a, b) => String(a.Route).localeCompare(String(b.Route)))],
  ];

  return (
    <main className="section">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="mt-1 text-sm text-slate-600">CSV exports for the current month.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {!rows.length ? <EmptyState title="No report data" text="Generate this month fees first." /> : null}
        {reports.map(([label, reportRows]) => (
          <a
            className="panel p-4 transition hover:border-emerald-300"
            download={`${String(label).toLowerCase().replaceAll(" ", "-")}.csv`}
            href={downloadHref(toCsv(reportRows as Record<string, unknown>[]))}
            key={String(label)}
          >
            <p className="font-bold">{String(label)}</p>
            <p className="mt-1 text-sm text-slate-600">{(reportRows as unknown[]).length} rows · tap to download</p>
          </a>
        ))}
      </div>
    </main>
  );
}
