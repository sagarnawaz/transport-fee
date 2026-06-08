import { CustomerNav } from "@/components/customer/CustomerNav";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("customer");

  return (
    <div className="app-shell pb-20">
      <CustomerNav />
      {children}
    </div>
  );
}
