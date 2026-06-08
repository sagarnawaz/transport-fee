import { AdminNav } from "@/components/admin/AdminNav";
import { requireRole } from "@/lib/auth-guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");

  return (
    <div className="app-shell pb-20 sm:pb-0">
      <AdminNav />
      {children}
    </div>
  );
}
