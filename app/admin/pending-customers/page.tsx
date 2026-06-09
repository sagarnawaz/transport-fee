import { approveCustomerAction, rejectCustomerAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireRole } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";

export default async function PendingCustomersPage() {
  await requireRole("admin");
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const [{ data: customers }, { data: routes }] = await Promise.all([
    supabase.from("customers").select("*").eq("status", "pending").order("created_at"),
    supabase.from("routes").select("*").order("route_name"),
  ]);

  return (
    <main className="section">
      <h1 className="text-2xl font-bold">Pending Customers</h1>
      <div className="mt-5 grid gap-4">
        {!customers?.length ? <EmptyState title="No pending customers" text="New registrations will wait here for approval." /> : null}
        {customers?.map((customer) => (
          <article className="panel p-4" key={customer.id}>
            <div>
              <p className="text-lg font-bold">{customer.full_name}</p>
              <p className="text-sm text-slate-600">{customer.phone} - WhatsApp {customer.whatsapp_number}</p>
              <p className="mt-2 text-sm text-slate-600">{customer.pickup_address} to {customer.drop_address}</p>
              {customer.notes ? <p className="mt-1 text-sm text-slate-500">{customer.notes}</p> : null}
            </div>
            <form action={approveCustomerAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input name="customer_id" type="hidden" value={customer.id} />
              <input className="field" name="customer_code" placeholder="Customer ID" required />
              <select className="field" name="route_id" required>
                <option value="">Route</option>
                {routes?.map((route) => <option key={route.id} value={route.id}>{route.route_name}</option>)}
              </select>
              <input className="field" min={0} name="monthly_fee" placeholder="Monthly fee" required type="number" />
              <input className="field" name="joining_date" type="date" />
              <input className="field" name="notes" placeholder="Notes" />
              <div className="sm:col-span-2 lg:col-span-5">
                <SubmitButton className="btn btn-primary w-full">Approve Customer</SubmitButton>
              </div>
            </form>
            <form action={rejectCustomerAction} className="mt-3 flex flex-col gap-3 sm:flex-row">
              <input name="customer_id" type="hidden" value={customer.id} />
              <input className="field" name="notes" placeholder="Rejection note" />
              <SubmitButton className="btn btn-danger sm:w-44">Reject</SubmitButton>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
