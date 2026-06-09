"use client";

import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { logoutAction } from "@/app/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LogoutConfirmButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Logout"
        className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <LogOut aria-hidden="true" size={18} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="panel w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
              <div>
                <p className="text-base font-bold text-slate-950">Logout?</p>
                <p className="mt-1 text-sm text-slate-600">You will need to login again to continue.</p>
              </div>
              <button
                aria-label="Cancel logout"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              <button className="btn btn-secondary w-full" onClick={() => setOpen(false)} type="button">
                Cancel
              </button>
              <form action={logoutAction}>
                <SubmitButton className="btn btn-danger w-full" pendingText="Logging out...">
                  <LogOut size={18} /> Logout
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
