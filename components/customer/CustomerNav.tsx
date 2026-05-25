"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Home, LogOut, Upload, type LucideIcon } from "lucide-react";
import { logoutAction } from "@/app/actions";

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

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="section py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/customer" className="min-w-0">
              <p className="truncate text-base font-bold text-slate-950">Transport Fee</p>
              <p className="text-xs font-semibold text-emerald-800">Customer App</p>
            </Link>
            <form action={logoutAction}>
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50" aria-label="Logout" type="submit">
                <LogOut aria-hidden="true" size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
        {links.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              className={`grid min-h-12 place-items-center rounded-lg text-xs font-semibold ${
                active ? "bg-emerald-50 text-emerald-800" : "text-slate-500"
              }`}
              href={href}
              key={href}
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
