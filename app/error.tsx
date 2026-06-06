"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return <ErrorFallback error={error} unstable_retry={unstable_retry} />;
}
