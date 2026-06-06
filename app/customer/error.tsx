"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function CustomerError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorFallback error={error} title="Customer screen could not load" unstable_retry={unstable_retry} />;
}
