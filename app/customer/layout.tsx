import { CustomerNav } from "@/components/customer/CustomerNav";

export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell pb-20">
      <CustomerNav />
      {children}
    </div>
  );
}
