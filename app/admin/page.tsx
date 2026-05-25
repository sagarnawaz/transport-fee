import Link from "next/link";
import { CreditCard, Users, WalletCards, type LucideIcon } from "lucide-react";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { getAdminDashboard } from "@/lib/app-queries";
import { formatMoney } from "@/lib/utils/date";

export default async function AdminDashboard() {
  const stats = await getAdminDashboard();

  if (!stats) {
    return (
      <main className="section">
        <SetupNotice />
      </main>
    );
  }

  const pendingAmount = Math.max(stats.expected - stats.received, 0);
  const cards: [string, string | number, LucideIcon][] = [
    ["Customers", stats.activeCustomers, Users],
    ["Expected", formatMoney(stats.expected), WalletCards],
    ["Received", formatMoney(stats.received), CreditCard],
    ["Pending", formatMoney(pendingAmount), WalletCards],
  ];

  return (
    <main className="section">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Current month transport fee overview.</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, Icon]) => (
          <div className="panel min-w-0 p-4" key={String(label)}>
            <Icon className="text-emerald-700" size={24} />
            <p className="mt-3 text-sm text-slate-500">{String(label)}</p>
            <p className="mt-1 break-words text-xl font-bold text-slate-950 sm:text-2xl">{String(value)}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Link className="btn btn-primary" href="/admin/pending-payments">
          Verify Payments ({stats.pendingProofs})
        </Link>
        <Link className="btn btn-secondary" href="/admin/customers">
          Customers
        </Link>
        <Link className="btn btn-secondary" href="/admin/settings">
          Settings
        </Link>
      </div>
    </main>
  );
}
