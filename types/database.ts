export type Role = "admin" | "customer";
export type CustomerStatus = "pending" | "active" | "rejected" | "inactive";
export type FeeStatus = "unpaid" | "pending_verification" | "paid" | "partial" | "rejected";
export type ProofStatus = "pending" | "approved" | "rejected";
export type RideType = "both_side" | "one_side";
export type ServiceDays = "mon_to_fri" | "mon_to_sat";

export type Profile = {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  created_at: string;
};

export type Route = {
  id: string;
  route_name: string;
  driver_name: string | null;
  vehicle_number: string | null;
  notes: string | null;
  created_at: string;
};

export type Customer = {
  id: string;
  user_id: string | null;
  customer_code: string | null;
  full_name: string;
  guardian_name: string | null;
  phone: string;
  whatsapp_number: string | null;
  pickup_address: string;
  drop_address: string;
  ride_type: RideType;
  service_days: ServiceDays;
  route_id: string | null;
  monthly_fee: number | null;
  status: CustomerStatus;
  joining_date: string | null;
  notes: string | null;
  created_at: string;
};

export type MonthlyFeeRecord = {
  id: string;
  customer_id: string;
  month: number;
  year: number;
  fee_amount: number;
  paid_amount: number;
  status: FeeStatus;
  due_date: string | null;
  created_at: string;
};

export type PaymentProof = {
  id: string;
  customer_id: string;
  fee_record_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string | null;
  payment_date: string;
  screenshot_path: string | null;
  status: ProofStatus;
  admin_note: string | null;
  submitted_at: string;
  verified_at: string | null;
  verified_by: string | null;
};

export type Settings = {
  id: string;
  business_name: string;
  default_monthly_fee: number;
  default_due_day: number;
  pickup_locations: string;
  drop_locations: string;
  clifton_payment_instructions: string;
  clifton_payment_method: string;
  clifton_account_title: string;
  clifton_bank_name: string;
  clifton_account_number: string;
  clifton_receipt_whatsapp: string;
  clifton_payment_note: string;
  link_road_payment_instructions: string;
  link_road_payment_method: string;
  link_road_account_title: string;
  link_road_bank_name: string;
  link_road_account_number: string;
  link_road_receipt_whatsapp: string;
  link_road_payment_note: string;
  whatsapp_reminder_template: string;
  payment_instructions: string;
  created_at: string;
};
