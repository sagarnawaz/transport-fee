"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText = "Please wait...",
  className = "btn btn-primary w-full",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button {...props} className={className} disabled={pending || props.disabled} type="submit">
      {pending ? pendingText : children}
    </button>
  );
}
