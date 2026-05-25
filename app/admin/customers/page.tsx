import { createClient } from "@/lib/supabase/server";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDisplayDate, formatMoney } from "@/lib/utils/date";

export default async function CustomersPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="section">
      <h1 className="text-2xl font-bold text-slate-950">Customers</h1>
      <p className="mt-1 text-sm text-slate-600">All registered customers in one mobile-friendly list.</p>
      <div className="mt-5 grid gap-3">
        {!customers?.length ? <EmptyState title="No customers yet" text="New registrations will appear here." /> : null}
        {customers?.map((customer) => (
          <article className="panel p-4" key={customer.id}>
            <div className="grid gap-3 sm:flex sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-slate-950">{customer.full_name}</p>
                <p className="text-sm text-slate-600">{customer.customer_code ?? "No ID assigned"} - {customer.phone}</p>
              </div>
              <div className="justify-self-start"><StatusBadge status={customer.status} /></div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-slate-500">Ride</dt><dd>{customer.ride_type === "one_side" ? "One side" : "Both side"}</dd></div>
              <div><dt className="text-slate-500">Monthly fee</dt><dd>{formatMoney(customer.monthly_fee)}</dd></div>
              <div className="col-span-2"><dt className="text-slate-500">Joined</dt><dd>{formatDisplayDate(customer.joining_date)}</dd></div>
              <div className="col-span-2 sm:col-span-4">
                <dt className="text-slate-500">Pickup to drop</dt>
                <dd>{customer.pickup_address} to {customer.drop_address}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </main>
  );
}
