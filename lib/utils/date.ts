export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function currentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function clampMonth(value?: number | string | null) {
  const month = Number(value);
  if (!Number.isFinite(month)) return currentMonthYear().month;
  return Math.min(Math.max(Math.trunc(month), 1), 12);
}

export function safeYear(value?: number | string | null) {
  const year = Number(value);
  if (!Number.isFinite(year)) return currentMonthYear().year;
  return Math.min(Math.max(Math.trunc(year), 2000), 2100);
}

export function monthLabel(month?: number | string | null) {
  const index = clampMonth(month) - 1;
  return monthNames[index] ?? "Unknown";
}

export function formatMonthYear(month?: number | string | null, year?: number | string | null) {
  return `${monthLabel(month)} ${safeYear(year)}`;
}

export function makeDueDate(year: number, month: number, dueDay: number) {
  const safeMonthValue = clampMonth(month);
  const safeYearValue = safeYear(year);
  const lastDay = new Date(safeYearValue, safeMonthValue, 0).getDate();
  const safeDueDay = Number.isFinite(dueDay) ? Math.trunc(dueDay) : 1;
  const day = Math.min(Math.max(safeDueDay, 1), lastDay);
  return `${safeYearValue}-${String(safeMonthValue).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function prorateMonthlyFee(value: number | string | null | undefined, date = new Date()) {
  const monthlyFee = Number(value ?? 0);
  if (!Number.isFinite(monthlyFee) || monthlyFee <= 0) return 0;
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - date.getDate() + 1;
  return Math.round((monthlyFee / daysInMonth) * remainingDays);
}

export function formatMoney(value?: number | string | null) {
  const amount = Number(value ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `Rs. ${safeAmount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function formatDisplayDate(value?: string | Date | null) {
  if (!value) return "-";
  const date =
    typeof value === "string"
      ? new Date(value.includes("T") ? value : `${value}T00:00:00`)
      : value;
  if (Number.isNaN(date.getTime())) return "-";
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
}

export function formatDisplayDateTime(value?: string | Date | null) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }).format(date);
}
