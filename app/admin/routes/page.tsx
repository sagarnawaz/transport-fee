import { saveRouteAction } from "@/app/actions";
import { EmptyState } from "@/components/ui/EmptyState";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireRole } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";

export default async function RoutesPage() {
  await requireRole("admin");
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: routes } = await supabase.from("routes").select("*").order("created_at", { ascending: false });

  return (
    <main className="section grid gap-5 lg:grid-cols-[360px_1fr]">
      <form action={saveRouteAction} className="panel grid gap-4 p-4">
        <h1 className="text-2xl font-bold">Routes</h1>
        <label className="grid gap-2"><span className="label">Route name</span><input className="field" name="route_name" required /></label>
        <label className="grid gap-2"><span className="label">Driver name</span><input className="field" name="driver_name" /></label>
        <label className="grid gap-2"><span className="label">Vehicle number</span><input className="field" name="vehicle_number" /></label>
        <label className="grid gap-2"><span className="label">Notes</span><textarea className="field" name="notes" rows={3} /></label>
        <SubmitButton>Add Route</SubmitButton>
      </form>
      <div className="grid content-start gap-3">
        {!routes?.length ? <EmptyState title="No routes" text="Add common pickup areas or van routes." /> : null}
        {routes?.map((route) => (
          <div className="panel p-4" key={route.id}>
            <p className="font-bold">{route.route_name}</p>
            <p className="mt-1 text-sm text-slate-600">{route.driver_name ?? "No driver"} - {route.vehicle_number ?? "No vehicle"}</p>
            {route.notes ? <p className="mt-2 text-sm text-slate-600">{route.notes}</p> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
