const feeClasses: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  unpaid: "bg-amber-100 text-amber-900",
  pending_verification: "bg-sky-100 text-sky-800",
  partial: "bg-violet-100 text-violet-800",
  rejected: "bg-rose-100 text-rose-800",
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-sky-100 text-sky-800",
  inactive: "bg-slate-100 text-slate-700",
  approved: "bg-emerald-100 text-emerald-800",
};

export function prettyStatus(status?: string | null) {
  if (!status) return "Unknown";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatusBadge({ status }: { status?: string | null }) {
  return (
    <span className={`badge ${feeClasses[status ?? ""] ?? "bg-slate-100 text-slate-700"}`}>
      {prettyStatus(status)}
    </span>
  );
}
