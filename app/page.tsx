import Link from "next/link";
import { Bus, CheckCircle2, Clock3, LogIn, ShieldCheck, UserPlus } from "lucide-react";

export default function Home() {
  const flowSteps = [
    "Register once and wait for admin approval.",
    "Login to see fee and submit payment proof.",
    "Your status updates after your proof is verified.",
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5 sm:justify-center sm:py-8">
        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
            <Bus size={34} />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Transport Fee Manager</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950">
              Van fees and payment proof in one place.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-base leading-7 text-slate-600">
              Customers can view monthly fees and submit payment proof. Payments are marked paid only after admin verification.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
            <Link className="btn btn-primary min-h-14 w-full bg-emerald-700 text-base hover:bg-emerald-800" href="/auth/login">
              <LogIn size={20} />
              Login
            </Link>
            <Link className="btn btn-secondary min-h-14 w-full border-slate-300 bg-white text-base" href="/auth/register">
              <UserPlus size={20} />
              New Customer Register
            </Link>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <ShieldCheck className="text-emerald-700" size={18} />
              Simple flow
            </div>
            <div className="mt-4 grid gap-3">
              {flowSteps.map((step) => (
                <div className="flex gap-3" key={step}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} />
                  <p className="text-sm leading-6 text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <Clock3 className="mt-0.5 shrink-0 text-emerald-700" size={20} />
            <p className="text-sm leading-6 text-emerald-900">
              New registrations stay pending until the van manager approves them.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
