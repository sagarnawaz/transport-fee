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

export function makeDueDate(year: number, month: number, dueDay: number) {
  const lastDay = new Date(year, month, 0).getDate();
  const day = Math.min(Math.max(dueDay, 1), lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatMoney(value?: number | string | null) {
  const amount = Number(value ?? 0);
  return `Rs. ${amount.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
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
