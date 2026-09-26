"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText = "Enviando…", className = "tp-btn tp-btn-primary" }: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? pendingText : children}
    </button>
  );
}
