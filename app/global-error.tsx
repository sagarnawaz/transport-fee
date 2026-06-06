"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="app-shell grid min-h-screen place-items-center p-4">
          <div className="panel max-w-md border-rose-200 bg-rose-50 p-5 text-rose-950">
            <p className="text-sm font-bold uppercase text-rose-700">Fatal error</p>
            <h1 className="mt-2 text-2xl font-bold">App could not load</h1>
            <p className="mt-2 text-sm leading-6">
              A critical screen failed to render. Try again, and check server logs if this keeps happening.
            </p>
            <button className="btn btn-danger mt-4 w-full" onClick={() => unstable_retry()} type="button">
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
