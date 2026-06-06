export default function LoginLoading() {
  return (
    <main className="app-shell">
      <section className="section py-6">
        <div className="panel mx-auto w-full max-w-md p-5">
          <div className="mx-auto h-16 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-5 h-12 animate-pulse rounded-lg bg-slate-100" />
          <div className="mt-5 h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-5 grid gap-4">
            <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-11 animate-pulse rounded-lg bg-red-100" />
          </div>
        </div>
      </section>
    </main>
  );
}
