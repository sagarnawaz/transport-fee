import { RegisterForm } from "@/app/auth/register/RegisterForm";
import { cliftonRoute } from "@/lib/daniyal-transport";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const fullFee = cliftonRoute.fees.mon_to_sat;
  const halfFee = cliftonRoute.fees.one_side;

  return (
    <main className="app-shell">
      <section className="section py-6">
        <RegisterForm
          error={params.error}
          fullFee={fullFee}
          halfFee={halfFee}
        />
      </section>
    </main>
  );
}
