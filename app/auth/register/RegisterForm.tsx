"use client";

import Link from "next/link";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { registerCustomerAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ModernSelect } from "@/components/ui/ModernSelect";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { calculateDaniyalFee, cliftonRoute, linkRoadRoute, serviceDaysOptions, serviceDaysShortLabel } from "@/lib/daniyal-transport";
import { formatMoney, prorateMonthlyFee } from "@/lib/utils/date";
import type { RideType, ServiceDays } from "@/types/database";

const steps = ["Account", "Ride", "Review"] as const;
const customerTypeOptions = [
  { value: "new", label: "New customer - charge remaining days only" },
  { value: "existing", label: "Existing customer - charge full month" },
];

export function RegisterForm({
  error,
  fullFee,
  halfFee,
}: {
  error?: string;
  fullFee: number;
  halfFee: number;
}) {
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [routeId, setRouteId] = useState(cliftonRoute.id);
  const [pickupAddress, setPickupAddress] = useState(cliftonRoute.pickups[0]);
  const [rideType, setRideType] = useState<RideType>("both_side");
  const [serviceDays, setServiceDays] = useState<ServiceDays>("mon_to_sat");
  const [customerType, setCustomerType] = useState<"new" | "existing">("existing");
  const [vanNumber, setVanNumber] = useState(cliftonRoute.vans[0]);
  const passwordMismatch = Boolean(confirmPassword) && password !== confirmPassword;
  const selectedRoute = routeId === linkRoadRoute.id ? linkRoadRoute : cliftonRoute;
  const pickupOptions =
    selectedRoute.id === linkRoadRoute.id
      ? linkRoadRoute.pickups
      : selectedRoute.pickups;
  const effectiveRideType = selectedRoute.id === linkRoadRoute.id ? "both_side" : rideType;
  const timingHref = selectedRoute.id === linkRoadRoute.id ? "https://daniyaltransport.netlify.app/link" : "https://daniyaltransport.netlify.app/clifton";
  const monthlyFee = calculateDaniyalFee({
    dropAddress: selectedRoute.drop,
    pickupAddress,
    rideType: effectiveRideType,
    serviceDays,
  });
  const firstMonthFee = prorateMonthlyFee(monthlyFee || fullFee);
  const currentMonthFee = customerType === "existing" ? monthlyFee || fullFee : firstMonthFee;
  const customerTypeLabel = customerType === "existing" ? "Existing customer" : "New customer";
  const rideTypeLabel = effectiveRideType === "one_side" ? "Single side" : `Double side - ${serviceDaysShortLabel(serviceDays)}`;

  function validateStep(nextStep: number) {
    const currentStep = document.querySelector<HTMLElement>(`[data-register-step="${step}"]`);
    const fields = Array.from(
      currentStep?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select") ?? [],
    );
    const invalid = fields.find((field) => !field.checkValidity());

    if (invalid) {
      invalid.reportValidity();
      return;
    }

    if (step === 0 && passwordMismatch) return;
    setStep(nextStep);
  }

  function handleRouteChange(routeKey: string) {
    const nextRoute = routeKey === linkRoadRoute.id ? linkRoadRoute : cliftonRoute;
    setRouteId(routeKey);
    setPickupAddress(nextRoute.pickups[0]);
    setVanNumber(nextRoute.vans[0]);
    if (nextRoute.id === linkRoadRoute.id) setRideType("both_side");
  }

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const nextPhone = event.currentTarget.value.replace(/\D/g, "").slice(0, 11);
    setPhone(nextPhone);
  }

  const errorMessage =
    error === "duplicate"
      ? "This phone number is already registered. Please login instead."
      : error === "password"
        ? "Password and confirm password did not match."
        : error === "phone"
          ? "Please enter a valid phone number like 03xxxxxxxxx."
          : error === "schema"
            ? "Database setup is not updated. Please run the latest schema.sql in Supabase."
            : error === "auth-confirmation"
              ? "Supabase email confirmation is on. Disable email confirmation for this app, then try again."
          : error === "profile"
            ? "Customer profile could not be created. Check public.customers for an old row with this phone, then try again."
          : error === "signup"
            ? "Account could not be created. Please check Supabase Auth settings."
          : error === "auth-disabled"
            ? "Email/password signup is disabled in Supabase Auth settings."
          : error === "rate-limit"
            ? "Too many signup attempts. Please wait a minute and try again."
          : error === "email"
            ? "Supabase rejected the internal phone email. Please try a different phone number or check Auth email settings."
          : error === "validation"
            ? "Please fill all required fields correctly."
            : error
              ? "Registration failed."
              : null;

  return (
    <div className="panel mx-auto w-full max-w-2xl p-5 sm:p-6">
      <div className="mx-auto w-36">
        <BrandLogo />
      </div>
      <h1 className="mt-4 text-center text-2xl font-bold text-slate-950">Create your account</h1>
      {errorMessage ? <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorMessage}</p> : null}
      <ol className="mt-5 grid grid-cols-3 items-start gap-2" aria-label="Registration progress">
        {steps.map((label, index) => {
          const isCurrent = index === step;
          const isComplete = index < step;

          return (
            <li className="relative grid min-w-0 justify-items-center gap-2 text-center" key={label}>
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={`absolute right-1/2 top-4 h-0.5 w-full ${
                    isComplete || isCurrent ? "bg-red-700" : "bg-slate-200"
                  }`}
                />
              ) : null}
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-bold ${
                  isCurrent
                    ? "border-red-700 bg-red-700 text-white shadow-sm"
                    : isComplete
                      ? "border-red-700 bg-red-50 text-red-800"
                      : "border-slate-300 bg-white text-slate-500"
                }`}
              >
                {index + 1}
              </span>
              <span className={`break-words text-xs font-bold leading-4 ${isCurrent ? "text-red-800" : isComplete ? "text-slate-800" : "text-slate-500"}`}>
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <form action={registerCustomerAction} className="mt-6">
        <section className={step === 0 ? "grid items-start gap-5 sm:grid-cols-2" : "hidden"} data-register-step="0">
          <label className="grid gap-2">
            <span className="label">Full name</span>
            <input className="field" minLength={2} name="full_name" onChange={(event) => setFullName(event.target.value)} required value={fullName} />
          </label>
          <label className="grid gap-2">
            <span className="label">Phone number</span>
            <input
              autoComplete="tel"
              className="field"
              inputMode="numeric"
              maxLength={11}
              name="phone"
              onChange={handlePhoneChange}
              pattern="03[0-9]{9}"
              placeholder="03xxxxxxxxx"
              required
              type="text"
              value={phone}
            />
          </label>
          <PasswordInput
            autoComplete="new-password"
            label="Password"
            minLength={6}
            name="password"
            onValueChange={setPassword}
          />
          <PasswordInput
            autoComplete="new-password"
            label="Confirm password"
            minLength={6}
            name="confirm_password"
            onValueChange={setConfirmPassword}
          />
          <div className="sm:col-span-2">
            {passwordMismatch ? (
              <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">Password and confirm password do not match.</p>
            ) : null}
            <button className="btn btn-primary w-full" disabled={passwordMismatch} onClick={() => validateStep(1)} type="button">
              Continue
            </button>
          </div>
        </section>

        <section className={step === 1 ? "grid min-w-0 items-start gap-4 sm:grid-cols-2 sm:gap-5" : "hidden"} data-register-step="1">
          <div className="grid min-w-0 gap-2 sm:col-span-2">
            <ModernSelect
              label="Service route"
              name="route_key"
              onChange={handleRouteChange}
              options={[
                { value: cliftonRoute.id, label: cliftonRoute.name },
                { value: linkRoadRoute.id, label: linkRoadRoute.name },
              ]}
              value={routeId}
            />
            <span className="break-words rounded-lg bg-red-50 px-3 py-2 text-xs font-bold leading-5 text-red-700">
              Full monthly fee: {formatMoney(monthlyFee || fullFee)}
            </span>
            {selectedRoute.id === linkRoadRoute.id ? (
              <span className="break-words rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">
                This route fee depends on pickup location. Single side / double side selection is not needed.
              </span>
            ) : null}
          </div>
          <ModernSelect
            label="Pickup location"
            name="pickup_address"
            onChange={setPickupAddress}
            options={pickupOptions.map((location) => ({ value: location, label: location }))}
            value={pickupAddress}
          />
          <div className="grid min-w-0 gap-2">
            <span className="label">Destination</span>
            <div className="field flex min-h-12 items-center break-words bg-slate-50 text-slate-700">{selectedRoute.drop}</div>
            <input name="drop_address" type="hidden" value={selectedRoute.drop} />
          </div>
          {selectedRoute.id === cliftonRoute.id ? (
            <>
              <ModernSelect
                label="Fee type"
                name="ride_type"
                onChange={(value) => setRideType(value as RideType)}
                options={[
                  { value: "both_side", label: "Double side" },
                  { value: "one_side", label: `Single side - ${formatMoney(halfFee)}` },
                ]}
                value={rideType}
              />
              {rideType === "both_side" ? (
                <ModernSelect
                  label="Service days"
                  name="service_days"
                  onChange={(value) => setServiceDays(value as ServiceDays)}
                  options={serviceDaysOptions.map((option) => ({
                    value: option.value,
                    label: `${option.label} - ${formatMoney(cliftonRoute.fees[option.value])}`,
                  }))}
                  value={serviceDays}
                />
              ) : (
                <input name="service_days" type="hidden" value={serviceDays} />
              )}
            </>
          ) : (
            <>
              <input name="ride_type" type="hidden" value="both_side" />
              <input name="service_days" type="hidden" value="mon_to_sat" />
            </>
          )}
          <div className={`grid min-w-0 gap-2 ${selectedRoute.id === linkRoadRoute.id ? "sm:col-span-2" : ""}`}>
            <span className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="label">Van</span>
              <a className="inline-flex min-h-9 items-center rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold leading-5 text-red-700 underline sm:min-h-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0" href={timingHref} rel="noreferrer" target="_blank">
                Click here to see van timings
              </a>
            </span>
            <ModernSelect
              label=""
              name="van_number"
              onChange={setVanNumber}
              options={selectedRoute.vans.map((van) => ({ value: van, label: van }))}
              value={vanNumber}
            />
          </div>
          <div className="sm:col-span-2">
            <ModernSelect
              label="Customer type"
              name="customer_type"
              onChange={(value) => setCustomerType(value === "existing" ? "existing" : "new")}
              options={customerTypeOptions}
              value={customerType}
            />
          </div>
          <label className="grid gap-2 sm:col-span-2">
            <span className="label">Amount to pay now</span>
            <input
              aria-live="polite"
              className="field border-red-200 bg-red-50 text-base font-bold text-red-800 sm:text-lg"
              readOnly
              value={formatMoney(currentMonthFee)}
            />
            <span className="break-words text-xs leading-5 text-slate-600">
              Full monthly fee is {formatMoney(monthlyFee || fullFee)}.{" "}
              {customerType === "existing"
                ? "Existing customer selected, so this month uses the full fee."
                : "New customer selected, so this month is charged for remaining days only."}
            </span>
          </label>
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">
            <button className="btn btn-secondary w-full" onClick={() => setStep(0)} type="button">
              Back
            </button>
            <button className="btn btn-primary w-full" onClick={() => validateStep(2)} type="button">
              Review Details
            </button>
          </div>
        </section>

        <section className={step === 2 ? "grid gap-4" : "hidden"} data-register-step="2">
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <ReviewItem label="Full name" value={fullName || "-"} />
            <ReviewItem label="Phone number" value={phone || "-"} />
            <ReviewItem label="Customer type" value={customerTypeLabel} />
            <ReviewItem label="Service route" value={selectedRoute.name} />
            <ReviewItem label="Pickup location" value={pickupAddress} />
            <ReviewItem label="Destination" value={selectedRoute.drop} />
            <ReviewItem label="Fee type" value={selectedRoute.id === linkRoadRoute.id ? "Fixed route fee" : rideTypeLabel} />
            <ReviewItem label="Van" value={vanNumber} />
            <ReviewItem label="Full monthly fee" value={formatMoney(monthlyFee || fullFee)} />
            <ReviewItem label="Amount to pay now" value={formatMoney(currentMonthFee)} strong />
          </div>
          <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold leading-5 text-red-900">
            Please confirm your details before submitting. You can go back and edit anything before registration.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button className="btn btn-secondary w-full" onClick={() => setStep(1)} type="button">
              Back
            </button>
            <SubmitButton disabled={passwordMismatch} pendingText="Submitting...">Submit Registration</SubmitButton>
          </div>
        </section>
      </form>
      <Link className="mt-4 block text-center text-sm font-semibold text-red-700" href="/auth/login">
        Back to login
      </Link>
    </div>
  );
}

function ReviewItem({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className={`mt-1 break-words text-sm ${strong ? "font-bold text-red-800" : "font-semibold text-slate-950"}`}>{value}</p>
    </div>
  );
}
