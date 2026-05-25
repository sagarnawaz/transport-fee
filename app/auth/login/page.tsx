import { LoginForm } from "@/app/auth/login/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="app-shell">
      <section className="section grid min-h-screen content-center">
        <LoginForm error={params.error} registered={params.registered} />
      </section>
    </main>
  );
}
