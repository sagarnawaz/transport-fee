import { monthLabel } from "@/lib/utils/date";

export type ReminderData = {
  customer_name: string;
  customer_id: string;
  month: number;
  year: number;
  amount: number;
  pending_amount: number;
  business_name: string;
  phone: string;
};

export const defaultReminderTemplate =
  "Assalam o Alaikum {customer_name}, your transport fee for {month} {year} is pending. Amount: Rs. {pending_amount}. Customer ID: {customer_id}. Please make payment as soon as possible. Thank you.";

export function renderReminder(template: string, data: ReminderData) {
  return template
    .replaceAll("{customer_name}", data.customer_name)
    .replaceAll("{customer_id}", data.customer_id)
    .replaceAll("{month}", monthLabel(data.month))
    .replaceAll("{year}", String(data.year))
    .replaceAll("{amount}", String(data.amount))
    .replaceAll("{pending_amount}", String(data.pending_amount))
    .replaceAll("{business_name}", data.business_name);
}

export function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
