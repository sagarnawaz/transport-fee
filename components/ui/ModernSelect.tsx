"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export type ModernSelectOption = {
  value: string;
  label: string;
};

export function ModernSelect({
  label,
  name,
  value,
  options,
  onChange,
  className = "",
}: {
  label?: string;
  name: string;
  value: string;
  options: ModernSelectOption[];
  onChange?: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div
      className={`relative grid gap-2 ${className}`}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) setOpen(false);
      }}
    >
      {label ? <span className="label">{label}</span> : null}
      <input name={name} type="hidden" value={value} />
      <button
        aria-expanded={open}
        className="field flex min-h-12 items-center justify-between gap-3 text-left"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate font-semibold text-slate-900">{selected?.label ?? "Select"}</span>
        <ChevronDown
          aria-hidden="true"
          className={`shrink-0 text-slate-500 transition duration-200 ${open ? "rotate-180 text-red-700" : ""}`}
          size={18}
        />
      </button>
      <div
        className={`absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg transition-all duration-200 ${
          open ? "max-h-64 scale-100 opacity-100" : "pointer-events-none max-h-0 scale-95 opacity-0"
        }`}
      >
        <div className="max-h-64 overflow-y-auto p-1">
          {options.map((option) => {
            const selectedOption = option.value === value;

            return (
              <button
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-3 text-left text-sm transition ${
                  selectedOption ? "bg-red-50 font-bold text-red-800" : "text-slate-800 hover:bg-slate-50"
                }`}
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
                type="button"
              >
                <span className="min-w-0 break-words">{option.label}</span>
                {selectedOption ? <Check aria-hidden="true" className="shrink-0" size={16} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
