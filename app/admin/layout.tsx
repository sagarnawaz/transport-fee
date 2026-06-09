import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell pb-20 sm:pb-0">
      <AdminNav />
      {children}
    </div>
  );
}
