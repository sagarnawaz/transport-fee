"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateDaniyalFee, cliftonRoute, linkRoadRoute } from "@/lib/daniyal-transport";
import { clampMonth, makeDueDate, safeYear } from "@/lib/utils/date";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function phoneEmail(phone: string) {
  return `${phone.replace(/\D/g, "") || "user"}@transport.local`;
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isValidPhone(phone: string) {
  return /^03\d{9}$/.test(cleanPhone(phone));
}

function asNumber(formData: FormData, key: string, fallback = 0) {
  const parsed = Number(value(formData, key));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function positiveNumber(formData: FormData, key: string, fallback = 0) {
  return Math.max(asNumber(formData, key, fallback), 0);
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/login?error=missing-config");

  const phone = value(formData, "phone");
  const password = value(formData, "password");
  const loginAs = value(formData, "login_as");
  const { error } = await supabase.auth.signInWithPassword({ email: phoneEmail(phone), password });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("email not confirmed") || message.includes("not confirmed")) {
      redirect("/auth/login?error=email-confirmation");
    }
    redirect("/auth/login?error=invalid");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).maybeSingle();
  if (!profile?.role) {
    await supabase.auth.signOut();
    redirect("/auth/login?error=profile");
  }
  if (loginAs && profile?.role && loginAs !== profile.role) {
    await supabase.auth.signOut();
    redirect(`/auth/login?error=${loginAs}-role`);
  }
  redirect(profile?.role === "admin" ? "/admin" : "/customer");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/auth/login");
}

export async function registerCustomerAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/auth/register?error=missing-config");

  const phone = value(formData, "phone");
  const password = value(formData, "password");
  const confirmPassword = value(formData, "confirm_password");
  const fullName = value(formData, "full_name");
  const pickupAddress = value(formData, "pickup_address");
  const dropAddress = value(formData, "drop_address");
  const rideType = value(formData, "ride_type");
  const routeKey = value(formData, "route_key");
  const vanNumber = value(formData, "van_number");
  const customerType = value(formData, "customer_type") === "existing" ? "existing" : "new";
  const allowedVans = routeKey === linkRoadRoute.id ? linkRoadRoute.vans : cliftonRoute.vans;
  const monthlyFee = calculateDaniyalFee({
    dropAddress,
    pickupAddress,
    rideType: rideType === "one_side" ? "one_side" : "both_side",
  });

  if (
    fullName.length < 2 ||
    !isValidPhone(phone)
  ) {
    redirect("/auth/register?error=phone");
  }

  if (
    password.length < 6 ||
    password !== confirmPassword
  ) {
    redirect("/auth/register?error=password");
  }

  if (
    !pickupAddress ||
    !dropAddress ||
    !["both_side", "one_side"].includes(rideType) ||
    ![cliftonRoute.id, linkRoadRoute.id].includes(routeKey) ||
    !allowedVans.includes(vanNumber) ||
    monthlyFee <= 0
  ) {
    redirect("/auth/register?error=validation");
  }

  const { data, error } = await supabase.auth.signUp({
    email: phoneEmail(phone),
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (error || !data.user) {
    const message = error?.message.toLowerCase() ?? "";
    console.error("Customer auth signup failed", error);
    if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
      redirect("/auth/register?error=duplicate");
    }
    if (message.includes("disabled") || message.includes("not allowed")) {
      redirect("/auth/register?error=auth-disabled");
    }
    if (message.includes("password")) {
      redirect("/auth/register?error=password");
    }
    if (message.includes("rate") || message.includes("too many")) {
      redirect("/auth/register?error=rate-limit");
    }
    if (message.includes("email")) {
      redirect("/auth/register?error=email");
    }
    redirect("/auth/register?error=signup");
  }

  const profilePayload = {
    p_user_id: data.user.id,
    p_full_name: fullName,
    p_phone: cleanPhone(phone),
    p_guardian_name: "",
    p_pickup_address: pickupAddress,
    p_drop_address: dropAddress,
    p_ride_type: rideType,
    p_route_id: null,
    p_van_number: vanNumber,
    p_customer_type: customerType,
  };

  let { error: profileError } = await supabase.rpc("register_customer_profile", profilePayload);

  if (profileError?.code === "PGRST202") {
    const payloadWithoutCustomerType: Omit<typeof profilePayload, "p_customer_type"> = {
      p_user_id: profilePayload.p_user_id,
      p_full_name: profilePayload.p_full_name,
      p_phone: profilePayload.p_phone,
      p_guardian_name: profilePayload.p_guardian_name,
      p_pickup_address: profilePayload.p_pickup_address,
      p_drop_address: profilePayload.p_drop_address,
      p_ride_type: profilePayload.p_ride_type,
      p_route_id: profilePayload.p_route_id,
      p_van_number: profilePayload.p_van_number,
    };
    const retryWithVan = await supabase.rpc("register_customer_profile", payloadWithoutCustomerType);
    profileError = retryWithVan.error;
  }

  if (profileError?.code === "PGRST202") {
    const legacyProfilePayload: Omit<typeof profilePayload, "p_van_number" | "p_customer_type"> = {
      p_user_id: profilePayload.p_user_id,
      p_full_name: profilePayload.p_full_name,
      p_phone: profilePayload.p_phone,
      p_guardian_name: profilePayload.p_guardian_name,
      p_pickup_address: profilePayload.p_pickup_address,
      p_drop_address: profilePayload.p_drop_address,
      p_ride_type: profilePayload.p_ride_type,
      p_route_id: profilePayload.p_route_id,
    };
    const retry = await supabase.rpc("register_customer_profile", legacyProfilePayload);
    profileError = retry.error;
  }

  if (profileError) {
    console.error("Customer profile registration failed", profileError);
    const message = profileError.message.toLowerCase();
    if (profileError.code === "23505") redirect("/auth/register?error=duplicate");
    if (profileError.code === "PGRST202" || message.includes("function")) redirect("/auth/register?error=schema");
    if (message.includes("unauthorized")) redirect("/auth/register?error=auth-confirmation");
    redirect("/auth/register?error=profile");
  }

  redirect("/auth/login?registered=1");
}

export async function saveRouteAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  await supabase.from("routes").insert({
    route_name: value(formData, "route_name"),
    driver_name: value(formData, "driver_name") || null,
    vehicle_number: value(formData, "vehicle_number") || null,
    notes: value(formData, "notes") || null,
  });

  revalidatePath("/admin/routes");
}

export async function approveCustomerAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const customerId = value(formData, "customer_id");
  if (!customerId) return;

  await supabase
    .from("customers")
    .update({
      customer_code: value(formData, "customer_code"),
      route_id: value(formData, "route_id") || null,
      monthly_fee: positiveNumber(formData, "monthly_fee"),
      status: "active",
      joining_date: value(formData, "joining_date") || new Date().toISOString().slice(0, 10),
      notes: value(formData, "notes") || null,
    })
    .eq("id", customerId);

  revalidatePath("/admin/pending-customers");
  revalidatePath("/admin/customers");
}

export async function rejectCustomerAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const customerId = value(formData, "customer_id");
  if (!customerId) return;

  await supabase
    .from("customers")
    .update({ status: "rejected", notes: value(formData, "notes") || "Rejected by admin" })
    .eq("id", customerId);

  revalidatePath("/admin/pending-customers");
}

export async function generateFeesAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const month = clampMonth(asNumber(formData, "month", new Date().getMonth() + 1));
  const year = safeYear(asNumber(formData, "year", new Date().getFullYear()));
  const dueDay = asNumber(formData, "due_day", 10);
  const { data: customers } = await supabase
    .from("customers")
    .select("id, monthly_fee")
    .eq("status", "active")
    .not("monthly_fee", "is", null);

  const rows =
    customers?.map((customer) => ({
      customer_id: customer.id,
      month,
      year,
      fee_amount: customer.monthly_fee,
      paid_amount: 0,
      status: "unpaid",
      due_date: makeDueDate(year, month, dueDay),
    })) ?? [];

  if (rows.length) {
    await supabase.from("monthly_fee_records").upsert(rows, {
      onConflict: "customer_id,month,year",
      ignoreDuplicates: true,
    });
  }

  revalidatePath("/admin/monthly-fees");
  revalidatePath("/admin/customers");
  revalidatePath("/admin");
  redirect(`/admin/monthly-fees?month=${month}&year=${year}`);
}

export async function submitProofAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) redirect("/customer/submit-payment?error=missing-config");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: customer } = await supabase.from("customers").select("id").eq("user_id", user.id).maybeSingle();
  if (!customer) redirect("/customer/submit-payment?error=no-customer");

  const feeRecordId = value(formData, "fee_record_id");
  const amount = positiveNumber(formData, "amount");
  const paymentMethod = value(formData, "payment_method");
  const allowedMethods = ["Bank Transfer", "Easypaisa", "JazzCash", "Cash", "Other"];

  if (!feeRecordId || !paymentMethod || !allowedMethods.includes(paymentMethod)) {
    redirect("/customer/submit-payment?error=validation");
  }

  if (amount <= 0) {
    redirect("/customer/submit-payment?error=amount");
  }

  const { data: fee } = await supabase
    .from("monthly_fee_records")
    .select("id")
    .eq("id", feeRecordId)
    .eq("customer_id", customer.id)
    .in("status", ["unpaid", "partial", "rejected"])
    .maybeSingle();

  if (!fee) {
    redirect("/customer/submit-payment?error=fee");
  }

  const file = formData.get("screenshot");
  let screenshotPath: string | null = null;

  if (paymentMethod !== "Cash" && (!(file instanceof File) || file.size <= 0)) {
    redirect("/customer/submit-payment?error=screenshot");
  }

  if (file instanceof File && file.size > 0) {
    if (file.size > 5 * 1024 * 1024 || !file.type.startsWith("image/")) {
      redirect("/customer/submit-payment?error=screenshot");
    }

    const ext = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
    screenshotPath = `${customer.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(screenshotPath, file, { upsert: false });
    if (uploadError) {
      redirect("/customer/submit-payment?error=upload");
    }
  }

  const { error: insertError } = await supabase.from("payment_proofs").insert({
    customer_id: customer.id,
    fee_record_id: feeRecordId,
    amount,
    payment_method: paymentMethod,
    transaction_id: value(formData, "transaction_id") || null,
    payment_date: value(formData, "payment_date") || new Date().toISOString().slice(0, 10),
    screenshot_path: screenshotPath,
    status: "pending",
  });
  if (insertError) {
    redirect("/customer/submit-payment?error=submit");
  }

  revalidatePath("/customer");
  redirect("/customer/submit-payment?submitted=1");
}

export async function approveProofAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const proofId = value(formData, "proof_id");
  const feeRecordId = value(formData, "fee_record_id");
  const amount = positiveNumber(formData, "amount");
  if (!proofId || !feeRecordId || amount <= 0) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: fee } = await supabase
    .from("monthly_fee_records")
    .select("fee_amount, paid_amount")
    .eq("id", feeRecordId)
    .maybeSingle();

  if (!fee) return;

  const newPaidAmount = Number(fee?.paid_amount ?? 0) + amount;
  const status = newPaidAmount >= Number(fee?.fee_amount ?? amount) ? "paid" : "partial";

  await supabase
    .from("payment_proofs")
    .update({ status: "approved", verified_at: new Date().toISOString(), verified_by: user?.id ?? null })
    .eq("id", proofId);

  await supabase.from("monthly_fee_records").update({ paid_amount: newPaidAmount, status }).eq("id", feeRecordId);
  revalidatePath("/admin/pending-payments");
  revalidatePath("/admin/monthly-fees");
  revalidatePath("/admin");
}

export async function rejectProofAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const proofId = value(formData, "proof_id");
  const feeRecordId = value(formData, "fee_record_id");
  if (!proofId || !feeRecordId) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from("payment_proofs")
    .update({
      status: "rejected",
      admin_note: value(formData, "admin_note") || "Rejected by admin",
      verified_at: new Date().toISOString(),
      verified_by: user?.id ?? null,
    })
    .eq("id", proofId);

  await supabase.from("monthly_fee_records").update({ status: "rejected" }).eq("id", feeRecordId);
  revalidatePath("/admin/pending-payments");
  revalidatePath("/admin/monthly-fees");
}

export async function saveSettingsAction(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return;

  const id = value(formData, "id") || crypto.randomUUID();
  await supabase.from("settings").upsert({
    id,
    business_name: value(formData, "business_name"),
    default_monthly_fee: positiveNumber(formData, "default_monthly_fee"),
    default_due_day: Math.min(Math.max(asNumber(formData, "default_due_day", 10), 1), 28),
    pickup_locations: value(formData, "pickup_locations"),
    drop_locations: value(formData, "drop_locations"),
    clifton_payment_instructions: value(formData, "clifton_payment_instructions"),
    clifton_payment_method: value(formData, "clifton_payment_method"),
    clifton_account_title: value(formData, "clifton_account_title"),
    clifton_bank_name: value(formData, "clifton_bank_name"),
    clifton_account_number: value(formData, "clifton_account_number"),
    clifton_receipt_whatsapp: value(formData, "clifton_receipt_whatsapp"),
    clifton_payment_note: value(formData, "clifton_payment_note"),
    link_road_payment_instructions: value(formData, "link_road_payment_instructions"),
    link_road_payment_method: value(formData, "link_road_payment_method"),
    link_road_account_title: value(formData, "link_road_account_title"),
    link_road_bank_name: value(formData, "link_road_bank_name"),
    link_road_account_number: value(formData, "link_road_account_number"),
    link_road_receipt_whatsapp: value(formData, "link_road_receipt_whatsapp"),
    link_road_payment_note: value(formData, "link_road_payment_note"),
    whatsapp_reminder_template: value(formData, "whatsapp_reminder_template"),
    payment_instructions: value(formData, "payment_instructions"),
  });

  revalidatePath("/admin/settings");
}
