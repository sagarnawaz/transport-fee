"use client";

import Link from "next/link";
import { useState } from "react";
import { loginAction } from "@/app/actions";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SubmitButton } from "@/components/ui/SubmitButton";

type LoginRole = "admin" | "customer";

export function LoginForm({ error, registered }: { error?: string; registered?: string }) {
  const [role, setRole] = useState<LoginRole>("customer");
  const isAdmin = role === "admin";
  const errorMessage =
    error === "email-confirmation"
      ? "Supabase email confirmation is on. Disable email confirmation, then register/login again."
      : error === "profile"
        ? "Account exists but customer profile was not created. Please run the latest schema.sql in Supabase, then register again."
        : error?.includes("role")
          ? "This account does not match the selected login type."
          : error
            ? "Login failed. Please check phone number and password."
            : null;

  return (
    <div className="panel mx-auto w-full max-w-md p-5">
      <div className="mx-auto w-32">
        <BrandLogo />
      </div>
      <p className="text-sm font-semibold text-red-700">Daniyal Transport</p>
      <div className="mt-4 grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {[
          ["customer", "Customer"],
          ["admin", "Admin"],
        ].map(([value, label]) => (
          <button
            aria-pressed={role === value}
            className={`min-h-10 rounded-md px-3 text-sm font-semibold transition ${
              role === value ? "bg-white text-red-700 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
            key={value}
            onClick={() => setRole(value as LoginRole)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <h1 className="mt-5 text-2xl font-bold text-slate-950">
        Login as {isAdmin ? "Admin" : "Customer"}
      </h1>
      {registered ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Registration complete. Login as customer to view your fee and submit payment proof.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
          {errorMessage}
        </p>
      ) : null}
      <form action={loginAction} className="mt-5 grid gap-4">
        <input name="login_as" type="hidden" value={role} />
        <PhoneInput />
        <PasswordInput autoComplete="current-password" label="Password" name="password" />
        <SubmitButton pendingText="Logging in...">
          Login as {isAdmin ? "Admin" : "Customer"}
        </SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        New customer?{" "}
        <Link className="font-semibold text-red-700" href="/auth/register">
          Register here
        </Link>
      </p>
    </div>
  );
}
