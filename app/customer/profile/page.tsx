import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCurrentCustomer } from "@/lib/app-queries";
import { requireRole } from "@/lib/auth-guards";
import { ridePlanLabel } from "@/lib/daniyal-transport";
import { formatDisplayDate, formatMoney } from "@/lib/utils/date";

export default async function ProfilePage() {
  await requireRole("customer");
  const { supabase, customer } = await getCurrentCustomer();
  if (!supabase) return <main className="section"><SetupNotice /></main>;

  return (
    <main className="section">
      <section className="panel p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{customer?.full_name ?? "Profile"}</h1>
            <p className="mt-1 text-sm text-slate-600">{customer?.customer_code ?? "No customer ID yet"}</p>
          </div>
          <StatusBadge status={customer?.status} />
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Phone</dt><dd>{customer?.phone}</dd></div>
          <div><dt className="text-slate-500">WhatsApp</dt><dd>{customer?.whatsapp_number}</dd></div>
          <div><dt className="text-slate-500">Guardian</dt><dd>{customer?.guardian_name ?? "-"}</dd></div>
          <div><dt className="text-slate-500">Route</dt><dd>{customer?.routes?.route_name ?? "Not assigned"}</dd></div>
          <div><dt className="text-slate-500">Plan</dt><dd>{ridePlanLabel({ dropAddress: customer?.drop_address, rideType: customer?.ride_type, serviceDays: customer?.service_days })}</dd></div>
          <div><dt className="text-slate-500">Monthly fee</dt><dd>{formatMoney(customer?.monthly_fee)}</dd></div>
          <div><dt className="text-slate-500">Joining date</dt><dd>{formatDisplayDate(customer?.joining_date)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-500">Pickup</dt><dd>{customer?.pickup_address}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate-500">Drop</dt><dd>{customer?.drop_address}</dd></div>
        </dl>
      </section>
    </main>
  );
}
