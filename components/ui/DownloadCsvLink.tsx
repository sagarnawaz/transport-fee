"use client";

import { useEffect, useState } from "react";

export function DownloadCsvLink({
  children,
  className,
  download,
  disabled,
  href,
}: {
  children: React.ReactNode;
  className: string;
  download: string;
  disabled?: boolean;
  href: string;
}) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!downloading) return;
    const timeout = window.setTimeout(() => setDownloading(false), 2500);
    return () => window.clearTimeout(timeout);
  }, [downloading]);

  return (
    <div className="grid gap-2">
      <a
        aria-busy={downloading}
        className={`${className} ${disabled || downloading ? "pointer-events-none opacity-75" : ""}`}
        download={download}
        href={href}
        onClick={() => setDownloading(true)}
      >
        {downloading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Preparing download...
          </>
        ) : (
          children
        )}
      </a>
    </div>
  );
}
