"use client";

import Link from "next/link";
import { useState } from "react";
import { registerCustomerAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { calculateDaniyalFee, cliftonRoute, linkRoadRoute } from "@/lib/daniyal-transport";
import { formatMoney, prorateMonthlyFee } from "@/lib/utils/date";
import type { RideType } from "@/types/database";

export function RegisterForm({
  error,
  fullFee,
  halfFee,
}: {
  error?: string;
  fullFee: number;
  halfFee: number;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [routeId, setRouteId] = useState(cliftonRoute.id);
  const [pickupAddress, setPickupAddress] = useState(cliftonRoute.pickups[0]);
  const [rideType, setRideType] = useState<RideType>("both_side");
  const [customerType, setCustomerType] = useState<"new" | "existing">("new");
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
  });
  const firstMonthFee = prorateMonthlyFee(monthlyFee || fullFee);
  const currentMonthFee = customerType === "existing" ? monthlyFee || fullFee : firstMonthFee;

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
      <p className="mt-4 text-center text-sm font-semibold text-red-700">Customer registration</p>
      <h1 className="mt-1 text-center text-2xl font-bold text-slate-950">Create your account</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-slate-600">
        Your customer ID and current month fee will be created automatically after registration.
      </p>
      <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4">
        <p className="text-xs font-bold uppercase text-red-700">Current month fee</p>
        <p className="mt-1 text-2xl font-bold text-slate-950">{formatMoney(currentMonthFee)}</p>
        <p className="mt-1 text-sm font-semibold text-slate-700">Full monthly fee: {formatMoney(monthlyFee || fullFee)}</p>
        <p className="mt-1 text-sm text-red-900">
          {selectedRoute.id === cliftonRoute.id
            ? `Double side: ${formatMoney(fullFee)} | Single side: ${formatMoney(halfFee)}`
            : "Steel Town: Rs. 9,000 | Bhains Colony: Rs. 13,000 | Quaidabad: Rs. 15,000"}
        </p>
        <p className="mt-2 text-xs leading-5 text-red-900">
          {customerType === "existing"
            ? "Existing customers are charged the full monthly fee for the current month."
            : "New customers are charged only for remaining days from registration date. Next month onward full monthly fee applies."}
        </p>
      </div>
      {errorMessage ? <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorMessage}</p> : null}
      <form action={registerCustomerAction} className="mt-6 grid items-start gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="label">Full name</span>
          <input className="field" minLength={2} name="full_name" required />
        </label>
        <PhoneInput />
        <label className="grid gap-2 sm:col-span-2">
          <span className="label">Customer type</span>
          <select
            className="field"
            name="customer_type"
            onChange={(event) => setCustomerType(event.target.value === "existing" ? "existing" : "new")}
            required
            value={customerType}
          >
            <option value="new">New customer - charge remaining days only</option>
            <option value="existing">Existing customer - charge full month</option>
          </select>
        </label>
        <label className="grid gap-2 sm:col-span-2">
          <span className="label">Service route</span>
          <select
            className="field"
            name="route_key"
            onChange={(event) => {
              const nextRouteId = event.target.value;
              const nextRoute = nextRouteId === linkRoadRoute.id ? linkRoadRoute : cliftonRoute;
              const nextPickups = nextRoute.pickups;
              setRouteId(nextRouteId);
              setPickupAddress(nextPickups[0]);
              if (nextRoute.id === linkRoadRoute.id) setRideType("both_side");
            }}
            required
            value={routeId}
          >
            <option value={cliftonRoute.id}>{cliftonRoute.name}</option>
            <option value={linkRoadRoute.id}>{linkRoadRoute.name}</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Pickup location</span>
          <select
            className="field"
            name="pickup_address"
            onChange={(event) => setPickupAddress(event.target.value)}
            required
            value={pickupAddress}
          >
            {pickupOptions.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-2">
          <span className="label">Destination</span>
          <div className="field flex items-center bg-slate-50 text-slate-700">{selectedRoute.drop}</div>
          <input name="drop_address" type="hidden" value={selectedRoute.drop} />
        </div>
        {selectedRoute.id === cliftonRoute.id ? (
          <>
            <label className="grid gap-2">
              <span className="label">Fee type</span>
              <select
                className="field"
                name="ride_type"
                onChange={(event) => setRideType(event.target.value as RideType)}
                required
                value={rideType}
              >
                <option value="both_side">Double side - {formatMoney(fullFee)}</option>
                <option value="one_side">Single side - {formatMoney(halfFee)}</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="label">Van</span>
                <a className="text-xs font-semibold text-red-700 underline" href={timingHref} rel="noreferrer" target="_blank">
                  Click here to see van timings
                </a>
              </span>
              <select className="field" name="van_number" required>
                {cliftonRoute.vans.map((van) => (
                  <option key={van}>{van}</option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <>
            <input name="ride_type" type="hidden" value="both_side" />
            <label className="grid gap-2 sm:col-span-2">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="label">Van</span>
                <a className="text-xs font-semibold text-red-700 underline" href={timingHref} rel="noreferrer" target="_blank">
                  Click here to see van timings
                </a>
              </span>
              <select className="field" name="van_number" required>
                {linkRoadRoute.vans.map((van) => (
                  <option key={van}>{van}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <label className="grid gap-2 sm:col-span-2">
          <span className="label">Amount to pay now</span>
          <input
            aria-live="polite"
            className="field border-red-200 bg-red-50 text-lg font-bold text-red-800"
            readOnly
            value={formatMoney(currentMonthFee)}
          />
          <span className="text-xs leading-5 text-slate-600">
            Full monthly fee is {formatMoney(monthlyFee || fullFee)}.{" "}
            {customerType === "existing"
              ? "Existing customer selected, so this month uses the full fee."
              : "New customer selected, so this month is charged for remaining days only."}
          </span>
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
          <SubmitButton disabled={passwordMismatch} pendingText="Submitting...">Submit Registration</SubmitButton>
        </div>
      </form>
      <Link className="mt-4 block text-center text-sm font-semibold text-red-700" href="/auth/login">
        Back to login
      </Link>
    </div>
  );
}
