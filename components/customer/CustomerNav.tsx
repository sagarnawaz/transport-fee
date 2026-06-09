"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, Home, Upload, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LogoutConfirmButton } from "@/components/ui/LogoutConfirmButton";

const links: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/customer", icon: Home },
  { label: "Pay", href: "/customer/submit-payment", icon: Upload },
  { label: "History", href: "/customer/history", icon: Clock3 },
];

function isActive(pathname: string, href: string) {
  return href === "/customer" ? pathname === href : pathname.startsWith(href);
}

export function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [navigatingHref, setNavigatingHref] = useState<string | null>(null);

  useEffect(() => {
    links.forEach((link) => router.prefetch(link.href));
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="section py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/customer" className="flex min-w-0 items-center gap-3">
              <span className="w-16 shrink-0">
                <BrandLogo />
              </span>
              <span className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">Daniyal Transport</p>
              <p className="text-xs font-semibold text-red-700">Customer App</p>
              </span>
            </Link>
            <LogoutConfirmButton />
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
        {links.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          const navigating = navigatingHref === href && !active;
          return (
            <Link
              className={`grid min-h-12 place-items-center rounded-lg text-xs font-semibold ${
                active ? "bg-red-50 text-red-700" : "text-slate-500"
              } ${navigating ? "bg-red-50 text-red-700" : ""}`}
              href={href}
              key={href}
              onClick={() => {
                if (!active) setNavigatingHref(href);
              }}
              prefetch
            >
              {navigating ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icon aria-hidden="true" size={20} />
              )}
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
