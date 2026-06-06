export default function RegisterLoading() {
  return (
    <main className="app-shell">
      <section className="section py-6">
        <div className="panel mx-auto w-full max-w-2xl p-5">
          <div className="h-4 w-36 rounded bg-red-100" />
          <div className="mt-3 h-8 w-56 rounded bg-slate-200" />
          <div className="mt-4 h-16 rounded-lg bg-slate-100" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div className={index === 4 ? "grid gap-2 sm:col-span-2" : "grid gap-2"} key={index}>
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="h-12 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
