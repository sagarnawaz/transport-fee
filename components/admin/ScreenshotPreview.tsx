"use client";

import { Eye, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function ScreenshotPreview({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn btn-secondary mt-4 w-full" onClick={() => setOpen(true)} type="button">
        <Eye size={18} /> View Screenshot
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="panel grid max-h-[92vh] w-full max-w-3xl self-center justify-self-center overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-3">
              <p className="font-bold text-slate-950">Payment Screenshot</p>
              <button
                aria-label="Close screenshot"
                className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-auto bg-slate-100 p-3">
              <div className="relative mx-auto h-[74vh] min-h-80 max-w-full rounded-lg bg-white">
                <Image alt="Payment proof screenshot" className="object-contain" fill sizes="100vw" src={url} unoptimized />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
