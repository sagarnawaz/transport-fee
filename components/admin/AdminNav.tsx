"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Settings, Users, WalletCards, type LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LogoutConfirmButton } from "@/components/ui/LogoutConfirmButton";

const links: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/admin", icon: Home },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Fees", href: "/admin/monthly-fees", icon: WalletCards },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    links.forEach((link) => router.prefetch(link.href));
  }, [router]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="section py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex min-w-0 items-center gap-3">
              <span className="w-16 shrink-0">
                <BrandLogo />
              </span>
              <span className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">Daniyal Transport</p>
              <p className="text-xs font-semibold text-red-700">Admin Panel</p>
              </span>
            </Link>
            <LogoutConfirmButton />
          </div>
          <nav className="mt-3 hidden gap-2 overflow-x-auto pb-1 sm:flex">
            {links.map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    active ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-slate-50 text-slate-700"
                  } active:scale-[0.98]`}
                  href={href}
                  key={href}
                  prefetch
                >
                  <Icon aria-hidden="true" size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
        {links.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              className={`grid min-h-12 place-items-center rounded-lg text-[11px] font-semibold ${
                active ? "bg-red-50 text-red-700" : "text-slate-500"
              } active:scale-[0.98]`}
              href={href}
              key={href}
              prefetch
            >
              <Icon aria-hidden="true" size={20} />
              <span className="mt-1">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
