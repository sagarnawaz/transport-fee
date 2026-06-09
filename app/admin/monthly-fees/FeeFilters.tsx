"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModernSelect } from "@/components/ui/ModernSelect";

const statusOptions = [
  { value: "", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "pending_verification", label: "Pending proof" },
  { value: "paid", label: "Paid" },
];

export function FeeFilters({
  month,
  year,
  status,
  q,
}: {
  month: number;
  year: number;
  status?: string;
  q?: string;
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(status ?? "");
  const [search, setSearch] = useState(q ?? "");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams();
      params.set("month", String(month));
      params.set("year", String(year));
      if (selectedStatus) params.set("status", selectedStatus);
      if (search.trim()) params.set("q", search.trim());

      router.replace(`/admin/monthly-fees?${params.toString()}`);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [month, router, search, selectedStatus, year]);

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_3fr]">
      <ModernSelect
        name="status"
        onChange={setSelectedStatus}
        options={statusOptions}
        value={selectedStatus}
      />
      <input
        className="field"
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search name, phone, ID"
        type="search"
        value={search}
      />
    </div>
  );
}
