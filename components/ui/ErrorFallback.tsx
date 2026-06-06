"use client";

import { useEffect } from "react";

export function ErrorFallback({
  error,
  title = "Something went wrong",
  unstable_retry,
}: {
  error: Error & { digest?: string };
  title?: string;
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="section">
      <div className="panel border-rose-200 bg-rose-50 p-5 text-rose-950">
        <p className="text-sm font-bold uppercase text-rose-700">Error</p>
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm leading-6">
          The app hit a temporary problem while loading this screen. Please try again.
        </p>
        {error.digest ? (
          <p className="mt-3 break-words rounded-lg bg-white/70 p-3 text-xs text-rose-900">
            Error ID: {error.digest}
          </p>
        ) : null}
        <button className="btn btn-danger mt-4" onClick={() => unstable_retry()} type="button">
          Try again
        </button>
      </div>
    </main>
  );
}
