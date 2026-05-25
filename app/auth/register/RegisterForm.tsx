"use client";

import Link from "next/link";
import { useState } from "react";
import { registerCustomerAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatMoney } from "@/lib/utils/date";

export function RegisterForm({
  dropLocations,
  error,
  fullFee,
  halfFee,
  pickupLocations,
}: {
  dropLocations: string[];
  error?: string;
  fullFee: number;
  halfFee: number;
  pickupLocations: string[];
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMismatch = Boolean(confirmPassword) && password !== confirmPassword;

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
          : error === "validation"
            ? "Please fill all required fields correctly."
            : error
              ? "Registration failed."
              : null;

  return (
    <div className="panel mx-auto w-full max-w-2xl p-5">
      <p className="text-sm font-semibold text-emerald-800">Customer registration</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950">Create your account</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Your customer ID and current month fee will be created automatically after registration.
      </p>
      <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
        Both side fee: {formatMoney(fullFee)} | One side fee: {formatMoney(halfFee)}
      </p>
      {errorMessage ? <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorMessage}</p> : null}
      <form action={registerCustomerAction} className="mt-5 grid items-start gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="label">Full name</span>
          <input className="field" minLength={2} name="full_name" required />
        </label>
        <PhoneInput />
        <label className="grid gap-2">
          <span className="label">Pickup location</span>
          <select className="field" name="pickup_address" required>
            <option value="">Select pickup</option>
            {pickupLocations.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="label">Drop off location</span>
          <select className="field" name="drop_address" required>
            <option value="">Select drop off</option>
            {dropLocations.map((location) => (
              <option key={location}>{location}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 sm:col-span-2">
          <span className="label">Ride type</span>
          <select className="field" name="ride_type" required>
            <option value="both_side">Both side - {formatMoney(fullFee)}</option>
            <option value="one_side">One side - {formatMoney(halfFee)}</option>
          </select>
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
      <Link className="mt-4 block text-center text-sm font-semibold text-emerald-800" href="/auth/login">
        Back to login
      </Link>
    </div>
  );
}
