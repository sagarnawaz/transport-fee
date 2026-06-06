function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <div>
      <SkeletonBlock className="h-7 w-44" />
      <SkeletonBlock className="mt-2 h-4 w-64 max-w-full bg-slate-100" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <main className="section">
      <PageHeaderSkeleton />
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="panel p-4" key={index}>
            <SkeletonBlock className="h-6 w-6 bg-red-100" />
            <SkeletonBlock className="mt-4 h-4 w-20 bg-slate-100" />
            <SkeletonBlock className="mt-2 h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock className="h-11 rounded-lg" key={index} />
        ))}
      </div>
    </main>
  );
}

export function CustomerDashboardSkeleton() {
  return (
    <main className="section">
      <section className="panel overflow-hidden">
        <div className="bg-neutral-950 p-5">
          <SkeletonBlock className="h-7 w-24 bg-white/20" />
          <SkeletonBlock className="mt-4 h-8 w-48 bg-white/20" />
          <SkeletonBlock className="mt-2 h-4 w-40 bg-white/10" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <SkeletonBlock className="h-4 w-28 bg-slate-100" />
              <SkeletonBlock className="mt-3 h-10 w-40" />
            </div>
            <SkeletonBlock className="h-10 w-24 rounded-full bg-amber-100" />
          </div>
          <SkeletonBlock className="mt-6 h-2 w-full rounded-full bg-slate-100" />
          <div className="mt-6 grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className={index === 2 ? "col-span-2" : ""} key={index}>
                <SkeletonBlock className="h-4 w-24 bg-slate-100" />
                <SkeletonBlock className="mt-2 h-5 w-full max-w-48" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="mt-6 h-11 w-full rounded-lg bg-red-100" />
        </div>
      </section>
      <section className="panel mt-4 p-5">
        <SkeletonBlock className="h-5 w-44" />
        <SkeletonBlock className="mt-3 h-4 w-full bg-slate-100" />
        <SkeletonBlock className="mt-2 h-4 w-4/5 bg-slate-100" />
      </section>
    </main>
  );
}

export function ListPageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <main className="section">
      <PageHeaderSkeleton />
      <div className="mt-5 grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <article className="panel p-4" key={index}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="h-5 w-44" />
                <SkeletonBlock className="mt-2 h-4 w-32 bg-slate-100" />
              </div>
              <SkeletonBlock className="h-7 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((__, detailIndex) => (
                <div key={detailIndex}>
                  <SkeletonBlock className="h-3 w-16 bg-slate-100" />
                  <SkeletonBlock className="mt-2 h-4 w-24" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export function FormPageSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <main className="section">
      <div className="mx-auto grid max-w-2xl gap-4">
        <section className="panel overflow-hidden">
          <div className="bg-neutral-950 p-5">
            <SkeletonBlock className="h-4 w-28 bg-white/20" />
            <SkeletonBlock className="mt-3 h-8 w-48 bg-white/20" />
            <SkeletonBlock className="mt-3 h-4 w-64 max-w-full bg-white/10" />
          </div>
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <SkeletonBlock className="h-20 rounded-lg bg-slate-100" />
              <SkeletonBlock className="h-20 rounded-lg bg-slate-100" />
            </div>
          </div>
        </section>
        <section className="panel grid gap-4 p-5">
          {Array.from({ length: fields }).map((_, index) => (
            <div className="grid gap-2" key={index}>
              <SkeletonBlock className="h-4 w-28 bg-slate-100" />
              <SkeletonBlock className="h-12 rounded-lg" />
            </div>
          ))}
          <SkeletonBlock className="h-11 rounded-lg bg-red-100" />
        </section>
      </div>
    </main>
  );
}
