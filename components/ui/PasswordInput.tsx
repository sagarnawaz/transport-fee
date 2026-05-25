"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput({
  label,
  name,
  autoComplete,
  minLength,
  onValueChange,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  minLength?: number;
  onValueChange?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      <span className="relative block">
        <input
          autoComplete={autoComplete}
          className="field w-full pr-12"
          minLength={minLength}
          name={name}
          onChange={(event) => onValueChange?.(event.target.value)}
          required
          type={visible ? "text" : "password"}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
        </button>
      </span>
    </label>
  );
}
