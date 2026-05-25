import { RegisterForm } from "@/app/auth/register/RegisterForm";
import { optionsFromLines, fallbackDropLocations, fallbackPickupLocations } from "@/lib/registration-options";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: settings } = supabase
    ? await supabase.from("settings").select("*").limit(1).maybeSingle()
    : { data: null };
  const pickupLocations = optionsFromLines(settings?.pickup_locations, fallbackPickupLocations);
  const dropLocations = optionsFromLines(settings?.drop_locations, fallbackDropLocations);
  const fullFee = Number(settings?.default_monthly_fee ?? 12000);
  const halfFee = fullFee / 2;

  return (
    <main className="app-shell">
      <section className="section py-6">
        <RegisterForm
          dropLocations={dropLocations}
          error={params.error}
          fullFee={fullFee}
          halfFee={halfFee}
          pickupLocations={pickupLocations}
        />
      </section>
    </main>
  );
}
