"use client";

import { useState } from "react";
import { XCircle } from "lucide-react";
import { rejectProofAction } from "@/app/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function RejectPaymentForm({ feeRecordId, proofId }: { feeRecordId: string; proofId: string }) {
  const [note, setNote] = useState("");
  const hasNote = note.trim().length > 0;

  return (
    <form action={rejectProofAction} className="grid gap-2">
      <input name="proof_id" type="hidden" value={proofId} />
      <input name="fee_record_id" type="hidden" value={feeRecordId} />
      <input
        className="field bg-white"
        name="admin_note"
        onChange={(event) => setNote(event.target.value)}
        placeholder="Reject reason required"
        value={note}
      />
      <SubmitButton
        className="btn min-h-12 w-full border border-rose-300 bg-white text-rose-700 hover:bg-rose-50 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        disabled={!hasNote}
      >
        <XCircle size={18} /> Reject
      </SubmitButton>
    </form>
  );
}
